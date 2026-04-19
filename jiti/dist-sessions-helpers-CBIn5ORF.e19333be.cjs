"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = createSessionVisibilityGuard;exports.c = resolveDisplaySessionKey;exports.d = resolveSessionReference;exports.f = resolveVisibleSessionReference;exports.i = createAgentToAgentPolicy;exports.l = resolveInternalSessionKey;exports.n = deriveChannel;exports.o = resolveEffectiveSessionToolsVisibility;exports.p = shouldResolveSessionIdInput;exports.r = resolveSessionToolContext;exports.s = resolveSandboxedSessionToolContext;exports.t = classifySessionKind;exports.u = resolveMainSessionAlias;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
require("./config-Q9XZc_2I.js");
var _callBA3do6C = require("./call-BA3do6C0.js");
var _sessionIdRmePhKuR = require("./session-id-RmePhKuR.js");
require("./chat-history-text-C5anYCs7.js");
let sessionsResolutionDeps = { callGateway: _callBA3do6C.r };
function resolveMainSessionAlias(cfg) {
  const mainKey = (0, _sessionKeyBh1lMwK.l)(cfg.session?.mainKey);
  const scope = cfg.session?.scope ?? "per-sender";
  return {
    mainKey,
    alias: scope === "global" ? "global" : mainKey,
    scope
  };
}
function resolveDisplaySessionKey(params) {
  if (params.key === params.alias) return "main";
  if (params.key === params.mainKey) return "main";
  return params.key;
}
function resolveInternalSessionKey(params) {
  if (params.key === "current") return params.requesterInternalKey ?? params.key;
  if (params.key === "main") return params.alias;
  return params.key;
}
async function listSpawnedSessionKeys(params) {
  const limit = typeof params.limit === "number" && Number.isFinite(params.limit) ? Math.max(1, Math.floor(params.limit)) : void 0;
  try {
    const list = await sessionsResolutionDeps.callGateway({
      method: "sessions.list",
      params: {
        includeGlobal: false,
        includeUnknown: false,
        ...(limit !== void 0 ? { limit } : {}),
        spawnedBy: params.requesterSessionKey
      }
    });
    const keys = (Array.isArray(list?.sessions) ? list.sessions : []).map((entry) => (0, _stringCoerceBUSzWgUA.s)(entry?.key) ?? "").filter(Boolean);
    return new Set(keys);
  } catch {
    return /* @__PURE__ */new Set();
  }
}
async function isRequesterSpawnedSessionVisible(params) {
  if (params.requesterSessionKey === params.targetSessionKey) return true;
  try {
    const resolved = await sessionsResolutionDeps.callGateway({
      method: "sessions.resolve",
      params: {
        key: params.targetSessionKey,
        spawnedBy: params.requesterSessionKey
      }
    });
    if (typeof resolved?.key === "string" && resolved.key.trim() === params.targetSessionKey) return true;
  } catch {}
  return (await listSpawnedSessionKeys({
    requesterSessionKey: params.requesterSessionKey,
    limit: params.limit
  })).has(params.targetSessionKey);
}
function shouldVerifyRequesterSpawnedSessionVisibility(params) {
  return params.restrictToSpawned && !params.resolvedViaSessionId && params.requesterSessionKey !== params.targetSessionKey;
}
async function isResolvedSessionVisibleToRequester(params) {
  if (!shouldVerifyRequesterSpawnedSessionVisibility({
    requesterSessionKey: params.requesterSessionKey,
    targetSessionKey: params.targetSessionKey,
    restrictToSpawned: params.restrictToSpawned,
    resolvedViaSessionId: params.resolvedViaSessionId
  })) return true;
  return await isRequesterSpawnedSessionVisible({
    requesterSessionKey: params.requesterSessionKey,
    targetSessionKey: params.targetSessionKey,
    limit: params.limit
  });
}
function looksLikeSessionKey(value) {
  const raw = (0, _stringCoerceBUSzWgUA.s)(value) ?? "";
  if (!raw) return false;
  if (raw === "main" || raw === "global" || raw === "unknown" || raw === "current") return true;
  if ((0, _sessionKeyBh1lMwK._)(raw)) return true;
  if (raw.startsWith("agent:")) return true;
  if (raw.startsWith("cron:") || raw.startsWith("hook:")) return true;
  if (raw.startsWith("node-") || raw.startsWith("node:")) return true;
  if (raw.includes(":group:") || raw.includes(":channel:")) return true;
  return false;
}
function shouldResolveSessionIdInput(value) {
  return (0, _sessionIdRmePhKuR.n)(value) || !looksLikeSessionKey(value);
}
function buildResolvedSessionReference(params) {
  return {
    ok: true,
    key: params.key,
    displayKey: resolveDisplaySessionKey({
      key: params.key,
      alias: params.alias,
      mainKey: params.mainKey
    }),
    resolvedViaSessionId: params.resolvedViaSessionId
  };
}
function buildSessionIdResolveParams(params) {
  return {
    sessionId: params.sessionId,
    spawnedBy: params.restrictToSpawned ? params.requesterInternalKey : void 0,
    includeGlobal: !params.restrictToSpawned,
    includeUnknown: !params.restrictToSpawned
  };
}
async function callGatewayResolveSessionId(params) {
  const key = (0, _stringCoerceBUSzWgUA.s)((await sessionsResolutionDeps.callGateway({
    method: "sessions.resolve",
    params: buildSessionIdResolveParams(params)
  }))?.key) ?? "";
  if (!key) throw new Error(`Session not found: ${params.sessionId} (use the full sessionKey from sessions_list)`);
  return key;
}
async function resolveSessionKeyFromSessionId(params) {
  try {
    return buildResolvedSessionReference({
      key: await callGatewayResolveSessionId(params),
      alias: params.alias,
      mainKey: params.mainKey,
      resolvedViaSessionId: true
    });
  } catch (err) {
    if (params.restrictToSpawned) return {
      ok: false,
      status: "forbidden",
      error: `Session not visible from this sandboxed agent session: ${params.sessionId}`
    };
    return {
      ok: false,
      status: "error",
      error: (0, _errorsD8p6rxH.i)(err) || `Session not found: ${params.sessionId} (use the full sessionKey from sessions_list)`
    };
  }
}
async function resolveSessionKeyFromKey(params) {
  try {
    const key = (0, _stringCoerceBUSzWgUA.s)((await sessionsResolutionDeps.callGateway({
      method: "sessions.resolve",
      params: {
        key: params.key,
        spawnedBy: params.restrictToSpawned ? params.requesterInternalKey : void 0
      }
    }))?.key) ?? "";
    if (!key) return null;
    return buildResolvedSessionReference({
      key,
      alias: params.alias,
      mainKey: params.mainKey,
      resolvedViaSessionId: false
    });
  } catch {
    return null;
  }
}
async function tryResolveSessionKeyFromSessionId(params) {
  try {
    return buildResolvedSessionReference({
      key: await callGatewayResolveSessionId(params),
      alias: params.alias,
      mainKey: params.mainKey,
      resolvedViaSessionId: true
    });
  } catch {
    return null;
  }
}
async function resolveSessionReferenceByKeyOrSessionId(params) {
  if (!params.skipKeyLookup) {
    const resolvedByKey = await resolveSessionKeyFromKey({
      key: params.raw,
      alias: params.alias,
      mainKey: params.mainKey,
      requesterInternalKey: params.requesterInternalKey,
      restrictToSpawned: params.restrictToSpawned
    });
    if (resolvedByKey) return resolvedByKey;
  }
  if (!(params.forceSessionIdLookup || shouldResolveSessionIdInput(params.raw))) return null;
  if (params.allowUnresolvedSessionId) return await tryResolveSessionKeyFromSessionId({
    sessionId: params.raw,
    alias: params.alias,
    mainKey: params.mainKey,
    requesterInternalKey: params.requesterInternalKey,
    restrictToSpawned: params.restrictToSpawned
  });
  return await resolveSessionKeyFromSessionId({
    sessionId: params.raw,
    alias: params.alias,
    mainKey: params.mainKey,
    requesterInternalKey: params.requesterInternalKey,
    restrictToSpawned: params.restrictToSpawned
  });
}
async function resolveSessionReference(params) {
  const rawInput = params.sessionKey.trim();
  if (rawInput === "current") {
    const resolvedCurrent = await resolveSessionReferenceByKeyOrSessionId({
      raw: rawInput,
      alias: params.alias,
      mainKey: params.mainKey,
      requesterInternalKey: params.requesterInternalKey,
      restrictToSpawned: params.restrictToSpawned,
      allowUnresolvedSessionId: true,
      skipKeyLookup: params.restrictToSpawned,
      forceSessionIdLookup: true
    });
    if (resolvedCurrent) return resolvedCurrent;
  }
  const raw = rawInput === "current" && params.requesterInternalKey ? params.requesterInternalKey : rawInput;
  if (shouldResolveSessionIdInput(raw)) {
    const resolvedByGateway = await resolveSessionReferenceByKeyOrSessionId({
      raw,
      alias: params.alias,
      mainKey: params.mainKey,
      requesterInternalKey: params.requesterInternalKey,
      restrictToSpawned: params.restrictToSpawned,
      allowUnresolvedSessionId: false
    });
    if (resolvedByGateway) return resolvedByGateway;
  }
  const resolvedKey = resolveInternalSessionKey({
    key: raw,
    alias: params.alias,
    mainKey: params.mainKey,
    requesterInternalKey: params.requesterInternalKey
  });
  return {
    ok: true,
    key: resolvedKey,
    displayKey: resolveDisplaySessionKey({
      key: resolvedKey,
      alias: params.alias,
      mainKey: params.mainKey
    }),
    resolvedViaSessionId: false
  };
}
async function resolveVisibleSessionReference(params) {
  const resolvedKey = params.resolvedSession.key;
  const displayKey = params.resolvedSession.displayKey;
  if (!(await isResolvedSessionVisibleToRequester({
    requesterSessionKey: params.requesterSessionKey,
    targetSessionKey: resolvedKey,
    restrictToSpawned: params.restrictToSpawned,
    resolvedViaSessionId: params.resolvedSession.resolvedViaSessionId
  }))) return {
    ok: false,
    status: "forbidden",
    error: `Session not visible from this sandboxed agent session: ${params.visibilitySessionKey}`,
    displayKey
  };
  return {
    ok: true,
    key: resolvedKey,
    displayKey
  };
}
//#endregion
//#region src/agents/tools/sessions-access.ts
function resolveSessionToolsVisibility(cfg) {
  const raw = cfg.tools?.sessions?.visibility;
  const value = (0, _stringCoerceBUSzWgUA.i)(raw);
  if (value === "self" || value === "tree" || value === "agent" || value === "all") return value;
  return "tree";
}
function resolveEffectiveSessionToolsVisibility(params) {
  const visibility = resolveSessionToolsVisibility(params.cfg);
  if (!params.sandboxed) return visibility;
  if ((params.cfg.agents?.defaults?.sandbox?.sessionToolsVisibility ?? "spawned") === "spawned" && visibility !== "tree") return "tree";
  return visibility;
}
function resolveSandboxSessionToolsVisibility(cfg) {
  return cfg.agents?.defaults?.sandbox?.sessionToolsVisibility ?? "spawned";
}
function resolveSandboxedSessionToolContext(params) {
  const { mainKey, alias } = resolveMainSessionAlias(params.cfg);
  const visibility = resolveSandboxSessionToolsVisibility(params.cfg);
  const requesterSessionKey = (0, _stringCoerceBUSzWgUA.s)(params.agentSessionKey);
  const requesterInternalKey = requesterSessionKey ? resolveInternalSessionKey({
    key: requesterSessionKey,
    alias,
    mainKey
  }) : void 0;
  return {
    mainKey,
    alias,
    visibility,
    requesterInternalKey,
    effectiveRequesterKey: requesterInternalKey ?? alias,
    restrictToSpawned: params.sandboxed === true && visibility === "spawned" && !!requesterInternalKey && !(0, _sessionKeyBh1lMwK.b)(requesterInternalKey)
  };
}
function createAgentToAgentPolicy(cfg) {
  const routingA2A = cfg.tools?.agentToAgent;
  const enabled = routingA2A?.enabled === true;
  const allowPatterns = Array.isArray(routingA2A?.allow) ? routingA2A.allow : [];
  const matchesAllow = (agentId) => {
    if (allowPatterns.length === 0) return true;
    return allowPatterns.some((pattern) => {
      const raw = (0, _stringCoerceBUSzWgUA.s)(typeof pattern === "string" ? pattern : String(pattern ?? "")) ?? "";
      if (!raw) return false;
      if (raw === "*") return true;
      if (!raw.includes("*")) return raw === agentId;
      const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`^${escaped.replaceAll("\\*", ".*")}$`, "i").test(agentId);
    });
  };
  const isAllowed = (requesterAgentId, targetAgentId) => {
    if (requesterAgentId === targetAgentId) return true;
    if (!enabled) return false;
    return matchesAllow(requesterAgentId) && matchesAllow(targetAgentId);
  };
  return {
    enabled,
    matchesAllow,
    isAllowed
  };
}
function actionPrefix(action) {
  if (action === "history") return "Session history";
  if (action === "send") return "Session send";
  if (action === "status") return "Session status";
  return "Session list";
}
function a2aDisabledMessage(action) {
  if (action === "history") return "Agent-to-agent history is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent access.";
  if (action === "send") return "Agent-to-agent messaging is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent sends.";
  if (action === "status") return "Agent-to-agent status is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent access.";
  return "Agent-to-agent listing is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent visibility.";
}
function a2aDeniedMessage(action) {
  if (action === "history") return "Agent-to-agent history denied by tools.agentToAgent.allow.";
  if (action === "send") return "Agent-to-agent messaging denied by tools.agentToAgent.allow.";
  if (action === "status") return "Agent-to-agent status denied by tools.agentToAgent.allow.";
  return "Agent-to-agent listing denied by tools.agentToAgent.allow.";
}
function crossVisibilityMessage(action) {
  if (action === "history") return "Session history visibility is restricted. Set tools.sessions.visibility=all to allow cross-agent access.";
  if (action === "send") return "Session send visibility is restricted. Set tools.sessions.visibility=all to allow cross-agent access.";
  if (action === "status") return "Session status visibility is restricted. Set tools.sessions.visibility=all to allow cross-agent access.";
  return "Session list visibility is restricted. Set tools.sessions.visibility=all to allow cross-agent access.";
}
function selfVisibilityMessage(action) {
  return `${actionPrefix(action)} visibility is restricted to the current session (tools.sessions.visibility=self).`;
}
function treeVisibilityMessage(action) {
  return `${actionPrefix(action)} visibility is restricted to the current session tree (tools.sessions.visibility=tree).`;
}
async function createSessionVisibilityGuard(params) {
  const requesterAgentId = (0, _sessionKeyBh1lMwK.u)(params.requesterSessionKey);
  const spawnedKeys = params.visibility === "tree" ? await listSpawnedSessionKeys({ requesterSessionKey: params.requesterSessionKey }) : null;
  const check = (targetSessionKey) => {
    const targetAgentId = (0, _sessionKeyBh1lMwK.u)(targetSessionKey);
    if (targetAgentId !== requesterAgentId) {
      if (params.visibility !== "all") return {
        allowed: false,
        status: "forbidden",
        error: crossVisibilityMessage(params.action)
      };
      if (!params.a2aPolicy.enabled) return {
        allowed: false,
        status: "forbidden",
        error: a2aDisabledMessage(params.action)
      };
      if (!params.a2aPolicy.isAllowed(requesterAgentId, targetAgentId)) return {
        allowed: false,
        status: "forbidden",
        error: a2aDeniedMessage(params.action)
      };
      return { allowed: true };
    }
    if (params.visibility === "self" && targetSessionKey !== params.requesterSessionKey) return {
      allowed: false,
      status: "forbidden",
      error: selfVisibilityMessage(params.action)
    };
    if (params.visibility === "tree" && targetSessionKey !== params.requesterSessionKey && !spawnedKeys?.has(targetSessionKey)) return {
      allowed: false,
      status: "forbidden",
      error: treeVisibilityMessage(params.action)
    };
    return { allowed: true };
  };
  return { check };
}
//#endregion
//#region src/agents/tools/sessions-helpers.ts
function resolveSessionToolContext(opts) {
  const cfg = opts?.config ?? (0, _io5pxHCi7V.a)();
  return {
    cfg,
    ...resolveSandboxedSessionToolContext({
      cfg,
      agentSessionKey: opts?.agentSessionKey,
      sandboxed: opts?.sandboxed
    })
  };
}
function classifySessionKind(params) {
  const key = params.key;
  if (key === params.alias || key === params.mainKey) return "main";
  if (key.startsWith("cron:")) return "cron";
  if (key.startsWith("hook:")) return "hook";
  if (key.startsWith("node-") || key.startsWith("node:")) return "node";
  if (params.gatewayKind === "group") return "group";
  if (key.includes(":group:") || key.includes(":channel:")) return "group";
  return "other";
}
function deriveChannel(params) {
  if (params.kind === "cron" || params.kind === "hook" || params.kind === "node") return "internal";
  const channel = (0, _stringCoerceBUSzWgUA.s)(params.channel ?? void 0);
  if (channel) return channel;
  const lastChannel = (0, _stringCoerceBUSzWgUA.s)(params.lastChannel ?? void 0);
  if (lastChannel) return lastChannel;
  const parts = params.key.split(":").filter(Boolean);
  if (parts.length >= 3 && (parts[1] === "group" || parts[1] === "channel")) return parts[0];
  return "unknown";
}
//#endregion /* v9-3b9e8b3384f1c3be */
