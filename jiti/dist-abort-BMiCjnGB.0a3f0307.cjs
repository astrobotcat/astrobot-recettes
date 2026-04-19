"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = tryFastAbortFromMessage;exports.n = resolveSessionEntryForKey;exports.r = stopSubagentsForRequester;exports.t = formatAbortReplyText;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _globalsDe6QTwLG = require("./globals-De6QTwLG.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _storeDFXcceZJ = require("./store-DFXcceZJ.js");
require("./sessions-vP2E4vs-.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
var _storeLoadDjLNEIy = require("./store-load-DjLNEIy9.js");
var _sessionsHelpersCBIn5ORF = require("./sessions-helpers-CBIn5ORF.js");
var _subagentRegistryBrNWizSY = require("./subagent-registry-BrNWizSY.js");
var _queueBNmQjdDV = require("./queue-bNmQjdDV.js");
var _runsDCeEXwD = require("./runs-D-CeEXwD.js");
var _managerCECGVjs = require("./manager-CECGVjs9.js");
var _abortPrimitivesBGJ_PnY = require("./abort-primitives-BG-J_PnY.js");
var _mentionsDXpYnKaK = require("./mentions-DXpYnKaK.js");
var _commandAuthC4VasUjw = require("./command-auth-C4VasUjw.js");
var _abortCutoffCLUBV9OI = require("./abort-cutoff-CLUBV9OI.js");
const abortDeps = {
  getAcpSessionManager: _managerCECGVjs.n,
  abortEmbeddedPiRun: _runsDCeEXwD.t,
  getLatestSubagentRunByChildSessionKey: _subagentRegistryBrNWizSY.a,
  listSubagentRunsForController: _subagentRegistryBrNWizSY.c,
  markSubagentRunTerminated: _subagentRegistryBrNWizSY.u
};
function formatAbortReplyText(stoppedSubagents) {
  if (typeof stoppedSubagents !== "number" || stoppedSubagents <= 0) return "⚙️ Agent was aborted.";
  return `⚙️ Agent was aborted. Stopped ${stoppedSubagents} ${stoppedSubagents === 1 ? "sub-agent" : "sub-agents"}.`;
}
function resolveSessionEntryForKey(store, sessionKey) {
  if (!store || !sessionKey) return {};
  const resolved = (0, _storeDFXcceZJ.a)({
    store,
    sessionKey
  });
  if (resolved.existing) return resolved.legacyKeys.length > 0 ? {
    entry: resolved.existing,
    key: resolved.normalizedKey,
    legacyKeys: resolved.legacyKeys
  } : {
    entry: resolved.existing,
    key: resolved.normalizedKey
  };
  return {};
}
function normalizeRequesterSessionKey(cfg, key) {
  const cleaned = (0, _stringCoerceBUSzWgUA.s)(key);
  if (!cleaned) return;
  const { mainKey, alias } = (0, _sessionsHelpersCBIn5ORF.u)(cfg);
  return (0, _sessionsHelpersCBIn5ORF.l)({
    key: cleaned,
    alias,
    mainKey
  });
}
function stopSubagentsForRequester(params) {
  const requesterKey = normalizeRequesterSessionKey(params.cfg, params.requesterSessionKey);
  if (!requesterKey) return { stopped: 0 };
  const dedupedRunsByChildKey = /* @__PURE__ */new Map();
  for (const run of abortDeps.listSubagentRunsForController(requesterKey)) {
    const childKey = (0, _stringCoerceBUSzWgUA.s)(run.childSessionKey);
    if (!childKey) continue;
    const latest = abortDeps.getLatestSubagentRunByChildSessionKey(childKey);
    if (!latest) {
      const existing = dedupedRunsByChildKey.get(childKey);
      if (!existing || run.createdAt >= existing.createdAt) dedupedRunsByChildKey.set(childKey, run);
      continue;
    }
    const latestControllerSessionKey = (0, _stringCoerceBUSzWgUA.s)(latest?.controllerSessionKey) ?? (0, _stringCoerceBUSzWgUA.s)(latest?.requesterSessionKey);
    if (latest.runId !== run.runId || latestControllerSessionKey !== requesterKey) continue;
    const existing = dedupedRunsByChildKey.get(childKey);
    if (!existing || run.createdAt >= existing.createdAt) dedupedRunsByChildKey.set(childKey, run);
  }
  const runs = Array.from(dedupedRunsByChildKey.values());
  if (runs.length === 0) return { stopped: 0 };
  const storeCache = /* @__PURE__ */new Map();
  const seenChildKeys = /* @__PURE__ */new Set();
  let stopped = 0;
  for (const run of runs) {
    const childKey = (0, _stringCoerceBUSzWgUA.s)(run.childSessionKey);
    if (!childKey || seenChildKeys.has(childKey)) continue;
    seenChildKeys.add(childKey);
    if (!run.endedAt) {
      const cleared = (0, _queueBNmQjdDV.r)([childKey]);
      const parsed = (0, _sessionKeyBh1lMwK.x)(childKey);
      const storePath = (0, _pathsCZMxg3hs.u)(params.cfg.session?.store, { agentId: parsed?.agentId });
      let store = storeCache.get(storePath);
      if (!store) {
        store = (0, _storeLoadDjLNEIy.t)(storePath);
        storeCache.set(storePath, store);
      }
      const entry = store[childKey];
      const sessionId = _runsDCeEXwD.h.resolveSessionId(childKey) ?? entry?.sessionId;
      const aborted = (childKey ? _runsDCeEXwD.h.abort(childKey) : false) || (sessionId ? abortDeps.abortEmbeddedPiRun(sessionId) : false);
      if (abortDeps.markSubagentRunTerminated({
        runId: run.runId,
        childSessionKey: childKey,
        reason: "killed"
      }) > 0 || aborted || cleared.followupCleared > 0 || cleared.laneCleared > 0) stopped += 1;
    }
    const cascadeResult = stopSubagentsForRequester({
      cfg: params.cfg,
      requesterSessionKey: childKey
    });
    stopped += cascadeResult.stopped;
  }
  if (stopped > 0) (0, _globalsDe6QTwLG.r)(`abort: stopped ${stopped} subagent run(s) for ${requesterKey}`);
  return { stopped };
}
async function tryFastAbortFromMessage(params) {
  const { ctx, cfg } = params;
  const targetKey = (0, _stringCoerceBUSzWgUA.s)(ctx.CommandTargetSessionKey) ?? (0, _stringCoerceBUSzWgUA.s)(ctx.SessionKey);
  const raw = (0, _mentionsDXpYnKaK.s)(ctx.CommandBody ?? ctx.RawBody ?? ctx.Body ?? "");
  if (!(0, _abortPrimitivesBGJ_PnY.n)((0, _stringCoerceBUSzWgUA.o)(ctx.ChatType) === "group" ? (0, _mentionsDXpYnKaK.o)(raw, ctx, cfg, (0, _agentScopeKFH9bkHi.p)({
    sessionKey: targetKey ?? ctx.SessionKey ?? "",
    config: cfg
  })) : raw)) return {
    handled: false,
    aborted: false
  };
  const commandAuthorized = ctx.CommandAuthorized;
  const auth = (0, _commandAuthC4VasUjw.t)({
    ctx,
    cfg,
    commandAuthorized
  });
  if (!auth.isAuthorizedSender) return {
    handled: false,
    aborted: false
  };
  const agentId = (0, _agentScopeKFH9bkHi.p)({
    sessionKey: targetKey ?? ctx.SessionKey ?? "",
    config: cfg
  });
  const abortKey = targetKey ?? auth.from ?? auth.to;
  const requesterSessionKey = targetKey ?? ctx.SessionKey ?? abortKey;
  if (targetKey) {
    const storePath = (0, _pathsCZMxg3hs.u)(cfg.session?.store, { agentId });
    const store = (0, _storeLoadDjLNEIy.t)(storePath);
    const { entry, key, legacyKeys } = resolveSessionEntryForKey(store, targetKey);
    const resolvedTargetKey = key ?? targetKey;
    const acpManager = abortDeps.getAcpSessionManager();
    if (acpManager.resolveSession({
      cfg,
      sessionKey: resolvedTargetKey
    }).kind !== "none") try {
      await acpManager.cancelSession({
        cfg,
        sessionKey: resolvedTargetKey,
        reason: "fast-abort"
      });
    } catch (error) {
      (0, _globalsDe6QTwLG.r)(`abort: ACP cancel failed for ${resolvedTargetKey}: ${(0, _errorsD8p6rxH.i)(error)}`);
    }
    const sessionId = _runsDCeEXwD.h.resolveSessionId(resolvedTargetKey) ?? entry?.sessionId;
    const aborted = _runsDCeEXwD.h.abort(resolvedTargetKey) || (sessionId ? abortDeps.abortEmbeddedPiRun(sessionId) : false);
    const cleared = (0, _queueBNmQjdDV.r)([resolvedTargetKey, sessionId]);
    if (cleared.followupCleared > 0 || cleared.laneCleared > 0) (0, _globalsDe6QTwLG.r)(`abort: cleared followups=${cleared.followupCleared} lane=${cleared.laneCleared} keys=${cleared.keys.join(",")}`);
    const abortCutoff = (0, _abortCutoffCLUBV9OI.a)({
      commandSessionKey: ctx.SessionKey,
      targetSessionKey: resolvedTargetKey
    }) ? (0, _abortCutoffCLUBV9OI.i)(ctx) : void 0;
    if (entry && key) {
      entry.abortedLastRun = true;
      (0, _abortCutoffCLUBV9OI.t)(entry, abortCutoff);
      entry.updatedAt = Date.now();
      store[key] = entry;
      for (const legacyKey of legacyKeys ?? []) if (legacyKey !== key) delete store[legacyKey];
      await (0, _storeDFXcceZJ.c)(storePath, (nextStore) => {
        const nextEntry = nextStore[key] ?? entry;
        if (!nextEntry) return;
        nextEntry.abortedLastRun = true;
        (0, _abortCutoffCLUBV9OI.t)(nextEntry, abortCutoff);
        nextEntry.updatedAt = Date.now();
        nextStore[key] = nextEntry;
        for (const legacyKey of legacyKeys ?? []) if (legacyKey !== key) delete nextStore[legacyKey];
      });
    } else if (abortKey) (0, _abortPrimitivesBGJ_PnY.i)(abortKey, true);
    const { stopped } = stopSubagentsForRequester({
      cfg,
      requesterSessionKey
    });
    return {
      handled: true,
      aborted,
      stoppedSubagents: stopped
    };
  }
  if (abortKey) (0, _abortPrimitivesBGJ_PnY.i)(abortKey, true);
  const { stopped } = stopSubagentsForRequester({
    cfg,
    requesterSessionKey
  });
  return {
    handled: true,
    aborted: false,
    stoppedSubagents: stopped
  };
}
//#endregion /* v9-0a67b3f2d0fe090e */
