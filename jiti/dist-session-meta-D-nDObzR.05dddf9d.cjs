"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = upsertAcpSessionMeta;exports.n = readAcpSessionEntry;exports.r = resolveSessionStorePathForAcp;exports.t = listAcpSessionEntries;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
require("./config-Q9XZc_2I.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
var _typesKCfeTvaK = require("./types-KCfeTvaK.js");
var _storeLoadDjLNEIy = require("./store-load-DjLNEIy9.js");
var _targetsCxfatkj = require("./targets-Cxfatkj9.js");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/acp/runtime/session-meta.ts
let sessionStoreRuntimePromise;
function loadSessionStoreRuntime() {
  sessionStoreRuntimePromise ??= Promise.resolve().then(() => jitiImport("./store.runtime-Cz_llyv3.js").then((m) => _interopRequireWildcard(m)));
  return sessionStoreRuntimePromise;
}
function resolveStoreSessionKey(store, sessionKey) {
  const normalized = sessionKey.trim();
  if (!normalized) return "";
  if (store[normalized]) return normalized;
  const lower = (0, _stringCoerceBUSzWgUA.i)(normalized);
  if (store[lower]) return lower;
  for (const key of Object.keys(store)) if ((0, _stringCoerceBUSzWgUA.i)(key) === lower) return key;
  return lower;
}
function resolveSessionStorePathForAcp(params) {
  const cfg = params.cfg ?? (0, _io5pxHCi7V.a)();
  const parsed = (0, _sessionKeyBh1lMwK.x)(params.sessionKey);
  return {
    cfg,
    storePath: (0, _pathsCZMxg3hs.u)(cfg.session?.store, { agentId: parsed?.agentId })
  };
}
function readAcpSessionEntry(params) {
  const sessionKey = params.sessionKey.trim();
  if (!sessionKey) return null;
  const { cfg, storePath } = resolveSessionStorePathForAcp({
    sessionKey,
    cfg: params.cfg
  });
  let store;
  let storeReadFailed = false;
  try {
    store = (0, _storeLoadDjLNEIy.t)(storePath);
  } catch {
    storeReadFailed = true;
    store = {};
  }
  const storeSessionKey = resolveStoreSessionKey(store, sessionKey);
  const entry = store[storeSessionKey];
  return {
    cfg,
    storePath,
    sessionKey,
    storeSessionKey,
    entry,
    acp: entry?.acp,
    storeReadFailed
  };
}
async function listAcpSessionEntries(params) {
  const cfg = params.cfg ?? (0, _io5pxHCi7V.a)();
  const storeTargets = await (0, _targetsCxfatkj.t)(cfg, params.env ? { env: params.env } : void 0);
  const entries = [];
  for (const target of storeTargets) {
    const storePath = target.storePath;
    let store;
    try {
      store = (0, _storeLoadDjLNEIy.t)(storePath);
    } catch {
      continue;
    }
    for (const [sessionKey, entry] of Object.entries(store)) {
      if (!entry?.acp) continue;
      entries.push({
        cfg,
        storePath,
        sessionKey,
        storeSessionKey: sessionKey,
        entry,
        acp: entry.acp
      });
    }
  }
  return entries;
}
async function upsertAcpSessionMeta(params) {
  const sessionKey = params.sessionKey.trim();
  if (!sessionKey) return null;
  const { storePath } = resolveSessionStorePathForAcp({
    sessionKey,
    cfg: params.cfg
  });
  const { updateSessionStore } = await loadSessionStoreRuntime();
  return await updateSessionStore(storePath, (store) => {
    const storeSessionKey = resolveStoreSessionKey(store, sessionKey);
    const currentEntry = store[storeSessionKey];
    const nextMeta = params.mutate(currentEntry?.acp, currentEntry);
    if (nextMeta === void 0) return currentEntry ?? null;
    if (nextMeta === null && !currentEntry) return null;
    const nextEntry = (0, _typesKCfeTvaK.n)(currentEntry, { acp: nextMeta ?? void 0 });
    if (nextMeta === null) delete nextEntry.acp;
    store[storeSessionKey] = nextEntry;
    return nextEntry;
  }, {
    activeSessionKey: (0, _stringCoerceBUSzWgUA.i)(sessionKey),
    allowDropAcpMetaSessionKeys: [sessionKey]
  });
}
//#endregion /* v9-0c67c3f3018aa387 */
