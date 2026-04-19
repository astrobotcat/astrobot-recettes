"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = normalizeSessionStore;exports.t = loadSessionStore;var _typesKCfeTvaK = require("./types-KCfeTvaK.js");
var _deliveryContextSharedEClQPjt = require("./delivery-context.shared-EClQPjt-.js");
var _storeCacheC6102ouP = require("./store-cache-C6102ouP.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/config/sessions/store-migrations.ts
function applySessionStoreMigrations(store) {
  for (const entry of Object.values(store)) {
    if (!entry || typeof entry !== "object") continue;
    const rec = entry;
    if (typeof rec.channel !== "string" && typeof rec.provider === "string") {
      rec.channel = rec.provider;
      delete rec.provider;
    }
    if (typeof rec.lastChannel !== "string" && typeof rec.lastProvider === "string") {
      rec.lastChannel = rec.lastProvider;
      delete rec.lastProvider;
    }
    if (typeof rec.groupChannel !== "string" && typeof rec.room === "string") {
      rec.groupChannel = rec.room;
      delete rec.room;
    } else if ("room" in rec) delete rec.room;
  }
}
//#endregion
//#region src/config/sessions/store-load.ts
function isSessionStoreRecord(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function normalizeSessionEntryDelivery(entry) {
  const normalized = (0, _deliveryContextSharedEClQPjt.a)({
    channel: entry.channel,
    lastChannel: entry.lastChannel,
    lastTo: entry.lastTo,
    lastAccountId: entry.lastAccountId,
    lastThreadId: entry.lastThreadId ?? entry.deliveryContext?.threadId ?? entry.origin?.threadId,
    deliveryContext: entry.deliveryContext
  });
  const nextDelivery = normalized.deliveryContext;
  const sameDelivery = (entry.deliveryContext?.channel ?? void 0) === nextDelivery?.channel && (entry.deliveryContext?.to ?? void 0) === nextDelivery?.to && (entry.deliveryContext?.accountId ?? void 0) === nextDelivery?.accountId && (entry.deliveryContext?.threadId ?? void 0) === nextDelivery?.threadId;
  const sameLast = entry.lastChannel === normalized.lastChannel && entry.lastTo === normalized.lastTo && entry.lastAccountId === normalized.lastAccountId && entry.lastThreadId === normalized.lastThreadId;
  if (sameDelivery && sameLast) return entry;
  return {
    ...entry,
    deliveryContext: nextDelivery,
    lastChannel: normalized.lastChannel,
    lastTo: normalized.lastTo,
    lastAccountId: normalized.lastAccountId,
    lastThreadId: normalized.lastThreadId
  };
}
function normalizeSessionStore(store) {
  for (const [key, entry] of Object.entries(store)) {
    if (!entry) continue;
    const normalized = normalizeSessionEntryDelivery((0, _typesKCfeTvaK.a)(entry));
    if (normalized !== entry) store[key] = normalized;
  }
}
function loadSessionStore(storePath, opts = {}) {
  if (!opts.skipCache && (0, _storeCacheC6102ouP.i)()) {
    const currentFileStat = (0, _storeCacheC6102ouP.l)(storePath);
    const cached = (0, _storeCacheC6102ouP.a)({
      storePath,
      mtimeMs: currentFileStat?.mtimeMs,
      sizeBytes: currentFileStat?.sizeBytes
    });
    if (cached) return cached;
  }
  let store = {};
  let fileStat = (0, _storeCacheC6102ouP.l)(storePath);
  let mtimeMs = fileStat?.mtimeMs;
  let serializedFromDisk;
  const maxReadAttempts = process.platform === "win32" ? 3 : 1;
  const retryBuf = maxReadAttempts > 1 ? new Int32Array(new SharedArrayBuffer(4)) : void 0;
  for (let attempt = 0; attempt < maxReadAttempts; attempt += 1) try {
    const raw = _nodeFs.default.readFileSync(storePath, "utf-8");
    if (raw.length === 0 && attempt < maxReadAttempts - 1) {
      Atomics.wait(retryBuf, 0, 0, 50);
      continue;
    }
    const parsed = JSON.parse(raw);
    if (isSessionStoreRecord(parsed)) {
      store = parsed;
      serializedFromDisk = raw;
    }
    fileStat = (0, _storeCacheC6102ouP.l)(storePath) ?? fileStat;
    mtimeMs = fileStat?.mtimeMs;
    break;
  } catch {
    if (attempt < maxReadAttempts - 1) {
      Atomics.wait(retryBuf, 0, 0, 50);
      continue;
    }
  }
  if (serializedFromDisk !== void 0) (0, _storeCacheC6102ouP.o)(storePath, serializedFromDisk);else
  (0, _storeCacheC6102ouP.o)(storePath, void 0);
  applySessionStoreMigrations(store);
  normalizeSessionStore(store);
  if (!opts.skipCache && (0, _storeCacheC6102ouP.i)()) (0, _storeCacheC6102ouP.s)({
    storePath,
    store,
    mtimeMs,
    sizeBytes: fileStat?.sizeBytes,
    serialized: serializedFromDisk
  });
  return structuredClone(store);
}
//#endregion /* v9-2632f0dd73a9d997 */
