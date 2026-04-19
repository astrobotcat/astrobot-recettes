"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = setTelegramThreadBindingMaxAgeBySessionKey;exports.i = setTelegramThreadBindingIdleTimeoutBySessionKey;exports.n = getTelegramThreadBindingManager;exports.r = resetTelegramThreadBindingsForTests;exports.t = createTelegramThreadBindingManager;var _accountsCoskdHdZ = require("./accounts-CoskdHdZ.js");
var _configRuntime = require("openclaw/plugin-sdk/config-runtime");
var _routing = require("openclaw/plugin-sdk/routing");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
var _runtimeEnv = require("openclaw/plugin-sdk/runtime-env");
var _errorRuntime = require("openclaw/plugin-sdk/error-runtime");
var _conversationRuntime = require("openclaw/plugin-sdk/conversation-runtime");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodeOs = _interopRequireDefault(require("node:os"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _jsonStore = require("openclaw/plugin-sdk/json-store");
var _statePaths = require("openclaw/plugin-sdk/state-paths");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region extensions/telegram/src/thread-bindings.ts
const DEFAULT_THREAD_BINDING_IDLE_TIMEOUT_MS = 1440 * 60 * 1e3;
const DEFAULT_THREAD_BINDING_MAX_AGE_MS = 0;
const THREAD_BINDINGS_SWEEP_INTERVAL_MS = 6e4;
const STORE_VERSION = 1;
let telegramSendModulePromise;
async function loadTelegramSendModule() {
  telegramSendModulePromise ??= Promise.resolve().then(() => jitiImport("./send-DlzbQJQs.js").then((m) => _interopRequireWildcard(m))).then((n) => n.p);
  return await telegramSendModulePromise;
}
/**
* Keep Telegram thread binding state shared across bundled chunks so routing,
* binding lookups, and binding mutations all observe the same live registry.
*/
const TELEGRAM_THREAD_BINDINGS_STATE_KEY = Symbol.for("openclaw.telegramThreadBindingsState");
let threadBindingsState;
function getThreadBindingsState() {
  if (!threadBindingsState) {
    const globalStore = globalThis;
    threadBindingsState = globalStore[TELEGRAM_THREAD_BINDINGS_STATE_KEY] ?? {
      managersByAccountId: /* @__PURE__ */new Map(),
      bindingsByAccountConversation: /* @__PURE__ */new Map(),
      persistQueueByAccountId: /* @__PURE__ */new Map()
    };
    globalStore[TELEGRAM_THREAD_BINDINGS_STATE_KEY] = threadBindingsState;
  }
  return threadBindingsState;
}
function normalizeDurationMs(raw, fallback) {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return fallback;
  return Math.max(0, Math.floor(raw));
}
function resolveBindingKey(params) {
  return `${params.accountId}:${params.conversationId}`;
}
function toSessionBindingTargetKind(raw) {
  return raw === "subagent" ? "subagent" : "session";
}
function toTelegramTargetKind(raw) {
  return raw === "subagent" ? "subagent" : "acp";
}
function toSessionBindingRecord(record, defaults) {
  return {
    bindingId: resolveBindingKey({
      accountId: record.accountId,
      conversationId: record.conversationId
    }),
    targetSessionKey: record.targetSessionKey,
    targetKind: toSessionBindingTargetKind(record.targetKind),
    conversation: {
      channel: "telegram",
      accountId: record.accountId,
      conversationId: record.conversationId
    },
    status: "active",
    boundAt: record.boundAt,
    expiresAt: (0, _conversationRuntime.resolveThreadBindingEffectiveExpiresAt)({
      record,
      defaultIdleTimeoutMs: defaults.idleTimeoutMs,
      defaultMaxAgeMs: defaults.maxAgeMs
    }),
    metadata: {
      agentId: record.agentId,
      label: record.label,
      boundBy: record.boundBy,
      lastActivityAt: record.lastActivityAt,
      idleTimeoutMs: typeof record.idleTimeoutMs === "number" ? Math.max(0, Math.floor(record.idleTimeoutMs)) : defaults.idleTimeoutMs,
      maxAgeMs: typeof record.maxAgeMs === "number" ? Math.max(0, Math.floor(record.maxAgeMs)) : defaults.maxAgeMs,
      ...record.metadata
    }
  };
}
function fromSessionBindingInput(params) {
  const now = Date.now();
  const metadata = params.input.metadata ?? {};
  const existing = getThreadBindingsState().bindingsByAccountConversation.get(resolveBindingKey({
    accountId: params.accountId,
    conversationId: params.input.conversationId
  }));
  const record = {
    accountId: params.accountId,
    conversationId: params.input.conversationId,
    targetKind: toTelegramTargetKind(params.input.targetKind),
    targetSessionKey: params.input.targetSessionKey,
    agentId: typeof metadata.agentId === "string" && metadata.agentId.trim() ? metadata.agentId.trim() : existing?.agentId,
    label: typeof metadata.label === "string" && metadata.label.trim() ? metadata.label.trim() : existing?.label,
    boundBy: typeof metadata.boundBy === "string" && metadata.boundBy.trim() ? metadata.boundBy.trim() : existing?.boundBy,
    boundAt: now,
    lastActivityAt: now,
    metadata: {
      ...existing?.metadata,
      ...metadata
    }
  };
  if (typeof metadata.idleTimeoutMs === "number" && Number.isFinite(metadata.idleTimeoutMs)) record.idleTimeoutMs = Math.max(0, Math.floor(metadata.idleTimeoutMs));else
  if (typeof existing?.idleTimeoutMs === "number") record.idleTimeoutMs = existing.idleTimeoutMs;
  if (typeof metadata.maxAgeMs === "number" && Number.isFinite(metadata.maxAgeMs)) record.maxAgeMs = Math.max(0, Math.floor(metadata.maxAgeMs));else
  if (typeof existing?.maxAgeMs === "number") record.maxAgeMs = existing.maxAgeMs;
  return record;
}
function resolveBindingsPath(accountId, env = process.env) {
  const stateDir = (0, _statePaths.resolveStateDir)(env, _nodeOs.default.homedir);
  return _nodePath.default.join(stateDir, "telegram", `thread-bindings-${accountId}.json`);
}
function summarizeLifecycleForLog(record, defaults) {
  const idleTimeoutMs = typeof record.idleTimeoutMs === "number" ? record.idleTimeoutMs : defaults.idleTimeoutMs;
  const maxAgeMs = typeof record.maxAgeMs === "number" ? record.maxAgeMs : defaults.maxAgeMs;
  return `idle=${(0, _conversationRuntime.formatThreadBindingDurationLabel)(Math.max(0, Math.floor(idleTimeoutMs)))} maxAge=${(0, _conversationRuntime.formatThreadBindingDurationLabel)(Math.max(0, Math.floor(maxAgeMs)))}`;
}
function loadBindingsFromDisk(accountId) {
  const filePath = resolveBindingsPath(accountId);
  try {
    const raw = _nodeFs.default.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed?.version !== STORE_VERSION || !Array.isArray(parsed.bindings)) return [];
    const bindings = [];
    for (const entry of parsed.bindings) {
      const conversationId = (0, _textRuntime.normalizeOptionalString)(entry?.conversationId);
      const targetSessionKey = (0, _textRuntime.normalizeOptionalString)(entry?.targetSessionKey) ?? "";
      const targetKind = entry?.targetKind === "subagent" ? "subagent" : "acp";
      if (!conversationId || !targetSessionKey) continue;
      const boundAt = typeof entry?.boundAt === "number" && Number.isFinite(entry.boundAt) ? Math.floor(entry.boundAt) : Date.now();
      const record = {
        accountId,
        conversationId,
        targetSessionKey,
        targetKind,
        boundAt,
        lastActivityAt: typeof entry?.lastActivityAt === "number" && Number.isFinite(entry.lastActivityAt) ? Math.floor(entry.lastActivityAt) : boundAt
      };
      if (typeof entry?.idleTimeoutMs === "number" && Number.isFinite(entry.idleTimeoutMs)) record.idleTimeoutMs = Math.max(0, Math.floor(entry.idleTimeoutMs));
      if (typeof entry?.maxAgeMs === "number" && Number.isFinite(entry.maxAgeMs)) record.maxAgeMs = Math.max(0, Math.floor(entry.maxAgeMs));
      if (typeof entry?.agentId === "string" && entry.agentId.trim()) record.agentId = entry.agentId.trim();
      if (typeof entry?.label === "string" && entry.label.trim()) record.label = entry.label.trim();
      if (typeof entry?.boundBy === "string" && entry.boundBy.trim()) record.boundBy = entry.boundBy.trim();
      if (entry?.metadata && typeof entry.metadata === "object") record.metadata = { ...entry.metadata };
      bindings.push(record);
    }
    return bindings;
  } catch (err) {
    if (err.code !== "ENOENT") (0, _runtimeEnv.logVerbose)(`telegram thread bindings load failed (${accountId}): ${String(err)}`);
    return [];
  }
}
async function persistBindingsToDisk(params) {
  if (!params.persist) return;
  const payload = {
    version: STORE_VERSION,
    bindings: params.bindings ?? [...getThreadBindingsState().bindingsByAccountConversation.values()].filter((entry) => entry.accountId === params.accountId)
  };
  await (0, _jsonStore.writeJsonFileAtomically)(resolveBindingsPath(params.accountId), payload);
}
function listBindingsForAccount(accountId) {
  return [...getThreadBindingsState().bindingsByAccountConversation.values()].filter((entry) => entry.accountId === accountId);
}
function enqueuePersistBindings(params) {
  if (!params.persist) return Promise.resolve();
  const next = (getThreadBindingsState().persistQueueByAccountId.get(params.accountId) ?? Promise.resolve()).catch(() => void 0).then(async () => {
    await persistBindingsToDisk(params);
  });
  getThreadBindingsState().persistQueueByAccountId.set(params.accountId, next);
  const cleanup = () => {
    if (getThreadBindingsState().persistQueueByAccountId.get(params.accountId) === next) getThreadBindingsState().persistQueueByAccountId.delete(params.accountId);
  };
  next.then(cleanup, cleanup);
  return next;
}
function persistBindingsSafely(params) {
  enqueuePersistBindings(params).catch((err) => {
    (0, _runtimeEnv.logVerbose)(`telegram thread bindings persist failed (${params.accountId}, ${params.reason}): ${String(err)}`);
  });
}
function normalizeTimestampMs(raw) {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return Date.now();
  return Math.max(0, Math.floor(raw));
}
function shouldExpireByIdle(params) {
  const idleTimeoutMs = typeof params.record.idleTimeoutMs === "number" ? Math.max(0, Math.floor(params.record.idleTimeoutMs)) : params.defaultIdleTimeoutMs;
  if (idleTimeoutMs <= 0) return false;
  return params.now >= Math.max(params.record.lastActivityAt, params.record.boundAt) + idleTimeoutMs;
}
function shouldExpireByMaxAge(params) {
  const maxAgeMs = typeof params.record.maxAgeMs === "number" ? Math.max(0, Math.floor(params.record.maxAgeMs)) : params.defaultMaxAgeMs;
  if (maxAgeMs <= 0) return false;
  return params.now >= params.record.boundAt + maxAgeMs;
}
function createTelegramThreadBindingManager(params = {}) {
  const accountId = (0, _routing.normalizeAccountId)(params.accountId);
  const existing = getThreadBindingsState().managersByAccountId.get(accountId);
  if (existing) return existing;
  const persist = params.persist ?? true;
  const idleTimeoutMs = normalizeDurationMs(params.idleTimeoutMs, DEFAULT_THREAD_BINDING_IDLE_TIMEOUT_MS);
  const maxAgeMs = normalizeDurationMs(params.maxAgeMs, DEFAULT_THREAD_BINDING_MAX_AGE_MS);
  const loaded = loadBindingsFromDisk(accountId);
  for (const entry of loaded) {
    const key = resolveBindingKey({
      accountId,
      conversationId: entry.conversationId
    });
    getThreadBindingsState().bindingsByAccountConversation.set(key, {
      ...entry,
      accountId
    });
  }
  let sweepTimer = null;
  const manager = {
    accountId,
    shouldPersistMutations: () => persist,
    getIdleTimeoutMs: () => idleTimeoutMs,
    getMaxAgeMs: () => maxAgeMs,
    getByConversationId: (conversationIdRaw) => {
      const conversationId = (0, _textRuntime.normalizeOptionalString)(conversationIdRaw);
      if (!conversationId) return;
      return getThreadBindingsState().bindingsByAccountConversation.get(resolveBindingKey({
        accountId,
        conversationId
      }));
    },
    listBySessionKey: (targetSessionKeyRaw) => {
      const targetSessionKey = targetSessionKeyRaw.trim();
      if (!targetSessionKey) return [];
      return listBindingsForAccount(accountId).filter((entry) => entry.targetSessionKey === targetSessionKey);
    },
    listBindings: () => listBindingsForAccount(accountId),
    touchConversation: (conversationIdRaw, at) => {
      const conversationId = (0, _textRuntime.normalizeOptionalString)(conversationIdRaw);
      if (!conversationId) return null;
      const key = resolveBindingKey({
        accountId,
        conversationId
      });
      const existing = getThreadBindingsState().bindingsByAccountConversation.get(key);
      if (!existing) return null;
      const nextRecord = {
        ...existing,
        lastActivityAt: normalizeTimestampMs(at ?? Date.now())
      };
      getThreadBindingsState().bindingsByAccountConversation.set(key, nextRecord);
      persistBindingsSafely({
        accountId,
        persist: manager.shouldPersistMutations(),
        bindings: listBindingsForAccount(accountId),
        reason: "touch"
      });
      return nextRecord;
    },
    unbindConversation: (unbindParams) => {
      const conversationId = (0, _textRuntime.normalizeOptionalString)(unbindParams.conversationId);
      if (!conversationId) return null;
      const key = resolveBindingKey({
        accountId,
        conversationId
      });
      const removed = getThreadBindingsState().bindingsByAccountConversation.get(key) ?? null;
      if (!removed) return null;
      getThreadBindingsState().bindingsByAccountConversation.delete(key);
      persistBindingsSafely({
        accountId,
        persist: manager.shouldPersistMutations(),
        bindings: listBindingsForAccount(accountId),
        reason: "unbind-conversation"
      });
      return removed;
    },
    unbindBySessionKey: (unbindParams) => {
      const targetSessionKey = unbindParams.targetSessionKey.trim();
      if (!targetSessionKey) return [];
      const removed = [];
      for (const entry of listBindingsForAccount(accountId)) {
        if (entry.targetSessionKey !== targetSessionKey) continue;
        const key = resolveBindingKey({
          accountId,
          conversationId: entry.conversationId
        });
        getThreadBindingsState().bindingsByAccountConversation.delete(key);
        removed.push(entry);
      }
      if (removed.length > 0) persistBindingsSafely({
        accountId,
        persist: manager.shouldPersistMutations(),
        bindings: listBindingsForAccount(accountId),
        reason: "unbind-session"
      });
      return removed;
    },
    stop: () => {
      if (sweepTimer) {
        clearInterval(sweepTimer);
        sweepTimer = null;
      }
      (0, _conversationRuntime.unregisterSessionBindingAdapter)({
        channel: "telegram",
        accountId,
        adapter: sessionBindingAdapter
      });
      if (getThreadBindingsState().managersByAccountId.get(accountId) === manager) getThreadBindingsState().managersByAccountId.delete(accountId);
    }
  };
  const sessionBindingAdapter = {
    channel: "telegram",
    accountId,
    capabilities: { placements: ["current", "child"] },
    bind: async (input) => {
      if (input.conversation.channel !== "telegram") return null;
      const targetSessionKey = input.targetSessionKey.trim();
      if (!targetSessionKey) return null;
      const placement = input.placement === "child" ? "child" : "current";
      const metadata = input.metadata ?? {};
      let conversationId;
      if (placement === "child") {
        const rawConversationId = input.conversation.conversationId?.trim() ?? "";
        const rawParent = input.conversation.parentConversationId?.trim() ?? "";
        const cfg = (0, _configRuntime.loadConfig)();
        let chatId = rawParent || rawConversationId;
        if (!chatId) {
          (0, _runtimeEnv.logVerbose)(`telegram: child bind failed: could not resolve group chat ID from conversationId=${rawConversationId}`);
          return null;
        }
        if (!chatId.startsWith("-")) {
          (0, _runtimeEnv.logVerbose)(`telegram: child bind failed: conversationId "${chatId}" looks like a bare topic ID, not a group chat ID (expected to start with "-"). Provide a full chatId:topic:topicId conversationId or set parentConversationId to the group chat ID.`);
          return null;
        }
        const threadName = ((0, _textRuntime.normalizeOptionalString)(metadata.threadName) ?? "") || ((0, _textRuntime.normalizeOptionalString)(metadata.label) ?? "") || `Agent: ${targetSessionKey.split(":").pop()}`;
        try {
          const tokenResolution = (0, _accountsCoskdHdZ.d)(cfg, { accountId });
          if (!tokenResolution.token) return null;
          const { createForumTopicTelegram } = await loadTelegramSendModule();
          const result = await createForumTopicTelegram(chatId, threadName, {
            cfg,
            token: tokenResolution.token,
            accountId
          });
          conversationId = `${result.chatId}:topic:${result.topicId}`;
        } catch (err) {
          (0, _runtimeEnv.logVerbose)(`telegram: child thread-binding failed for ${chatId}: ${(0, _errorRuntime.formatErrorMessage)(err)}`);
          return null;
        }
      } else conversationId = (0, _textRuntime.normalizeOptionalString)(input.conversation.conversationId);
      if (!conversationId) return null;
      const record = fromSessionBindingInput({
        accountId,
        input: {
          targetSessionKey,
          targetKind: input.targetKind,
          conversationId,
          metadata: input.metadata
        }
      });
      getThreadBindingsState().bindingsByAccountConversation.set(resolveBindingKey({
        accountId,
        conversationId
      }), record);
      await enqueuePersistBindings({
        accountId,
        persist: manager.shouldPersistMutations(),
        bindings: listBindingsForAccount(accountId)
      });
      (0, _runtimeEnv.logVerbose)(`telegram: bound conversation ${conversationId} -> ${targetSessionKey} (${summarizeLifecycleForLog(record, {
        idleTimeoutMs,
        maxAgeMs
      })})`);
      return toSessionBindingRecord(record, {
        idleTimeoutMs,
        maxAgeMs
      });
    },
    listBySession: (targetSessionKeyRaw) => {
      const targetSessionKey = targetSessionKeyRaw.trim();
      if (!targetSessionKey) return [];
      return manager.listBySessionKey(targetSessionKey).map((entry) => toSessionBindingRecord(entry, {
        idleTimeoutMs,
        maxAgeMs
      }));
    },
    resolveByConversation: (ref) => {
      if (ref.channel !== "telegram") return null;
      const conversationId = (0, _textRuntime.normalizeOptionalString)(ref.conversationId);
      if (!conversationId) return null;
      const record = manager.getByConversationId(conversationId);
      return record ? toSessionBindingRecord(record, {
        idleTimeoutMs,
        maxAgeMs
      }) : null;
    },
    touch: (bindingId, at) => {
      const conversationId = (0, _conversationRuntime.resolveThreadBindingConversationIdFromBindingId)({
        accountId,
        bindingId
      });
      if (!conversationId) return;
      manager.touchConversation(conversationId, at);
    },
    unbind: async (input) => {
      if (input.targetSessionKey?.trim()) {
        const removed = manager.unbindBySessionKey({
          targetSessionKey: input.targetSessionKey,
          reason: input.reason,
          sendFarewell: false
        });
        if (removed.length > 0) await enqueuePersistBindings({
          accountId,
          persist: manager.shouldPersistMutations(),
          bindings: listBindingsForAccount(accountId)
        });
        return removed.map((entry) => toSessionBindingRecord(entry, {
          idleTimeoutMs,
          maxAgeMs
        }));
      }
      const conversationId = (0, _conversationRuntime.resolveThreadBindingConversationIdFromBindingId)({
        accountId,
        bindingId: input.bindingId
      });
      if (!conversationId) return [];
      const removed = manager.unbindConversation({
        conversationId,
        reason: input.reason,
        sendFarewell: false
      });
      if (removed) await enqueuePersistBindings({
        accountId,
        persist: manager.shouldPersistMutations(),
        bindings: listBindingsForAccount(accountId)
      });
      return removed ? [toSessionBindingRecord(removed, {
        idleTimeoutMs,
        maxAgeMs
      })] : [];
    }
  };
  (0, _conversationRuntime.registerSessionBindingAdapter)(sessionBindingAdapter);
  if (params.enableSweeper !== false) {
    sweepTimer = setInterval(() => {
      const now = Date.now();
      for (const record of listBindingsForAccount(accountId)) {
        const idleExpired = shouldExpireByIdle({
          now,
          record,
          defaultIdleTimeoutMs: idleTimeoutMs
        });
        const maxAgeExpired = shouldExpireByMaxAge({
          now,
          record,
          defaultMaxAgeMs: maxAgeMs
        });
        if (!idleExpired && !maxAgeExpired) continue;
        manager.unbindConversation({
          conversationId: record.conversationId,
          reason: idleExpired ? "idle-expired" : "max-age-expired",
          sendFarewell: false
        });
      }
    }, THREAD_BINDINGS_SWEEP_INTERVAL_MS);
    sweepTimer.unref?.();
  }
  getThreadBindingsState().managersByAccountId.set(accountId, manager);
  return manager;
}
function getTelegramThreadBindingManager(accountId) {
  return getThreadBindingsState().managersByAccountId.get((0, _routing.normalizeAccountId)(accountId)) ?? null;
}
function updateTelegramBindingsBySessionKey(params) {
  const targetSessionKey = params.targetSessionKey.trim();
  if (!targetSessionKey) return [];
  const now = Date.now();
  const updated = [];
  for (const entry of params.manager.listBySessionKey(targetSessionKey)) {
    const key = resolveBindingKey({
      accountId: params.manager.accountId,
      conversationId: entry.conversationId
    });
    const next = params.update(entry, now);
    getThreadBindingsState().bindingsByAccountConversation.set(key, next);
    updated.push(next);
  }
  if (updated.length > 0) persistBindingsSafely({
    accountId: params.manager.accountId,
    persist: params.manager.shouldPersistMutations(),
    bindings: listBindingsForAccount(params.manager.accountId),
    reason: "session-lifecycle-update"
  });
  return updated;
}
function setTelegramThreadBindingIdleTimeoutBySessionKey(params) {
  const manager = getTelegramThreadBindingManager(params.accountId);
  if (!manager) return [];
  const idleTimeoutMs = normalizeDurationMs(params.idleTimeoutMs, 0);
  return updateTelegramBindingsBySessionKey({
    manager,
    targetSessionKey: params.targetSessionKey,
    update: (entry, now) => ({
      ...entry,
      idleTimeoutMs,
      lastActivityAt: now
    })
  });
}
function setTelegramThreadBindingMaxAgeBySessionKey(params) {
  const manager = getTelegramThreadBindingManager(params.accountId);
  if (!manager) return [];
  const maxAgeMs = normalizeDurationMs(params.maxAgeMs, 0);
  return updateTelegramBindingsBySessionKey({
    manager,
    targetSessionKey: params.targetSessionKey,
    update: (entry, now) => ({
      ...entry,
      maxAgeMs,
      lastActivityAt: now
    })
  });
}
async function resetTelegramThreadBindingsForTests() {
  for (const manager of getThreadBindingsState().managersByAccountId.values()) manager.stop();
  const pendingPersists = [...getThreadBindingsState().persistQueueByAccountId.values()];
  if (pendingPersists.length > 0) await Promise.allSettled(pendingPersists);
  getThreadBindingsState().persistQueueByAccountId.clear();
  getThreadBindingsState().managersByAccountId.clear();
  getThreadBindingsState().bindingsByAccountConversation.clear();
}
//#endregion /* v9-27010c4d055b0848 */
