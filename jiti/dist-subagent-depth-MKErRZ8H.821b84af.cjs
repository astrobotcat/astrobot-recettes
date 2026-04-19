"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = void 0;exports.t = getSubagentDepthFromSessionStore;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
var _parseJsonCompatFs1eUPUx = require("./parse-json-compat-fs1eUPUx.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/subagent-session-key.ts
const normalizeSubagentSessionKey = exports.n = _stringCoerceBUSzWgUA.s;
//#endregion
//#region src/agents/subagent-depth.ts
function normalizeSpawnDepth(value) {
  if (typeof value === "number") return Number.isInteger(value) && value >= 0 ? value : void 0;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return;
    const numeric = Number(trimmed);
    return Number.isInteger(numeric) && numeric >= 0 ? numeric : void 0;
  }
}
function readSessionStore(storePath) {
  try {
    const parsed = (0, _parseJsonCompatFs1eUPUx.t)(_nodeFs.default.readFileSync(storePath, "utf-8"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {}
  return {};
}
function buildKeyCandidates(rawKey, cfg) {
  if (!cfg) return [rawKey];
  if (rawKey === "global" || rawKey === "unknown") return [rawKey];
  if ((0, _sessionKeyBh1lMwK.x)(rawKey)) return [rawKey];
  const prefixed = `agent:${(0, _agentScopeKFH9bkHi.x)(cfg)}:${rawKey}`;
  return prefixed === rawKey ? [rawKey] : [rawKey, prefixed];
}
function findEntryBySessionId(store, sessionId) {
  const normalizedSessionId = normalizeSubagentSessionKey(sessionId);
  if (!normalizedSessionId) return;
  for (const entry of Object.values(store)) {
    const candidateSessionId = normalizeSubagentSessionKey(entry?.sessionId);
    if (candidateSessionId && candidateSessionId === normalizedSessionId) return entry;
  }
}
function resolveEntryForSessionKey(params) {
  const candidates = buildKeyCandidates(params.sessionKey, params.cfg);
  if (params.store) {
    for (const key of candidates) {
      const entry = params.store[key];
      if (entry) return entry;
    }
    return findEntryBySessionId(params.store, params.sessionKey);
  }
  if (!params.cfg) return;
  for (const key of candidates) {
    const parsed = (0, _sessionKeyBh1lMwK.x)(key);
    if (!parsed?.agentId) continue;
    const storePath = (0, _pathsCZMxg3hs.u)(params.cfg.session?.store, { agentId: parsed.agentId });
    let store = params.cache.get(storePath);
    if (!store) {
      store = readSessionStore(storePath);
      params.cache.set(storePath, store);
    }
    const entry = store[key] ?? findEntryBySessionId(store, params.sessionKey);
    if (entry) return entry;
  }
}
function getSubagentDepthFromSessionStore(sessionKey, opts) {
  const raw = (sessionKey ?? "").trim();
  const fallbackDepth = (0, _sessionKeyBh1lMwK.g)(raw);
  if (!raw) return fallbackDepth;
  const cache = /* @__PURE__ */new Map();
  const visited = /* @__PURE__ */new Set();
  const depthFromStore = (key) => {
    const normalizedKey = normalizeSubagentSessionKey(key);
    if (!normalizedKey) return;
    if (visited.has(normalizedKey)) return;
    visited.add(normalizedKey);
    const entry = resolveEntryForSessionKey({
      sessionKey: normalizedKey,
      cfg: opts?.cfg,
      store: opts?.store,
      cache
    });
    const storedDepth = normalizeSpawnDepth(entry?.spawnDepth);
    if (storedDepth !== void 0) return storedDepth;
    const spawnedBy = normalizeSubagentSessionKey(entry?.spawnedBy);
    if (!spawnedBy) return;
    const parentDepth = depthFromStore(spawnedBy);
    if (parentDepth !== void 0) return parentDepth + 1;
    return (0, _sessionKeyBh1lMwK.g)(spawnedBy) + 1;
  };
  return depthFromStore(raw) ?? fallbackDepth;
}
//#endregion /* v9-b89bbc6b4ff84993 */
