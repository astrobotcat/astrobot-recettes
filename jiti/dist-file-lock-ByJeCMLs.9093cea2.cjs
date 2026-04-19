"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = withFileLock;exports.n = drainFileLockStateForTest;exports.r = resetFileLockStateForTest;exports.t = acquireFileLock;var _pidAliveCu1HI9Ug = require("./pid-alive-Cu1HI9Ug.js");
var _processScopedMapCwdLiqvv = require("./process-scoped-map-CwdLiqvv.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = _interopRequireDefault(require("node:fs/promises"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugin-sdk/file-lock.ts
const HELD_LOCKS = (0, _processScopedMapCwdLiqvv.t)(Symbol.for("openclaw.fileLockHeldLocks"));
const CLEANUP_REGISTERED_KEY = Symbol.for("openclaw.fileLockCleanupRegistered");
function releaseAllLocksSync() {
  for (const [normalizedFile, held] of HELD_LOCKS) {
    held.handle.close().catch(() => void 0);
    rmLockPathSync(held.lockPath);
    HELD_LOCKS.delete(normalizedFile);
  }
}
async function drainAllLocks() {
  for (const [normalizedFile, held] of Array.from(HELD_LOCKS.entries())) {
    HELD_LOCKS.delete(normalizedFile);
    await held.handle.close().catch(() => void 0);
    await _promises.default.rm(held.lockPath, { force: true }).catch(() => void 0);
  }
}
function rmLockPathSync(lockPath) {
  try {
    _nodeFs.default.rmSync(lockPath, { force: true });
  } catch {}
}
function ensureExitCleanupRegistered() {
  const proc = process;
  if (proc[CLEANUP_REGISTERED_KEY]) return;
  proc[CLEANUP_REGISTERED_KEY] = true;
  process.on("exit", releaseAllLocksSync);
}
function computeDelayMs(retries, attempt) {
  const base = Math.min(retries.maxTimeout, Math.max(retries.minTimeout, retries.minTimeout * retries.factor ** attempt));
  const jitter = retries.randomize ? 1 + Math.random() : 1;
  return Math.min(retries.maxTimeout, Math.round(base * jitter));
}
async function readLockPayload(lockPath) {
  try {
    const raw = await _promises.default.readFile(lockPath, "utf8");
    const parsed = JSON.parse(raw);
    if (typeof parsed.pid !== "number" || typeof parsed.createdAt !== "string") return null;
    return {
      pid: parsed.pid,
      createdAt: parsed.createdAt
    };
  } catch {
    return null;
  }
}
async function resolveNormalizedFilePath(filePath) {
  const resolved = _nodePath.default.resolve(filePath);
  const dir = _nodePath.default.dirname(resolved);
  await _promises.default.mkdir(dir, { recursive: true });
  try {
    const realDir = await _promises.default.realpath(dir);
    return _nodePath.default.join(realDir, _nodePath.default.basename(resolved));
  } catch {
    return resolved;
  }
}
async function isStaleLock(lockPath, staleMs) {
  const payload = await readLockPayload(lockPath);
  if (payload?.pid && !(0, _pidAliveCu1HI9Ug.n)(payload.pid)) return true;
  if (payload?.createdAt) {
    const createdAt = Date.parse(payload.createdAt);
    if (!Number.isFinite(createdAt) || Date.now() - createdAt > staleMs) return true;
  }
  try {
    const stat = await _promises.default.stat(lockPath);
    return Date.now() - stat.mtimeMs > staleMs;
  } catch {
    return true;
  }
}
async function releaseHeldLock(normalizedFile) {
  const current = HELD_LOCKS.get(normalizedFile);
  if (!current) return;
  current.count -= 1;
  if (current.count > 0) return;
  HELD_LOCKS.delete(normalizedFile);
  await current.handle.close().catch(() => void 0);
  await _promises.default.rm(current.lockPath, { force: true }).catch(() => void 0);
}
function resetFileLockStateForTest() {
  releaseAllLocksSync();
}
async function drainFileLockStateForTest() {
  await drainAllLocks();
}
/** Acquire a re-entrant process-local file lock backed by a `.lock` sidecar file. */
async function acquireFileLock(filePath, options) {
  ensureExitCleanupRegistered();
  const normalizedFile = await resolveNormalizedFilePath(filePath);
  const lockPath = `${normalizedFile}.lock`;
  const held = HELD_LOCKS.get(normalizedFile);
  if (held) {
    held.count += 1;
    return {
      lockPath,
      release: () => releaseHeldLock(normalizedFile)
    };
  }
  const attempts = Math.max(1, options.retries.retries + 1);
  for (let attempt = 0; attempt < attempts; attempt += 1) try {
    const handle = await _promises.default.open(lockPath, "wx");
    await handle.writeFile(JSON.stringify({
      pid: process.pid,
      createdAt: (/* @__PURE__ */new Date()).toISOString()
    }, null, 2), "utf8");
    HELD_LOCKS.set(normalizedFile, {
      count: 1,
      handle,
      lockPath
    });
    return {
      lockPath,
      release: () => releaseHeldLock(normalizedFile)
    };
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
    if (await isStaleLock(lockPath, options.stale)) {
      await _promises.default.rm(lockPath, { force: true }).catch(() => void 0);
      continue;
    }
    if (attempt >= attempts - 1) break;
    await new Promise((resolve) => setTimeout(resolve, computeDelayMs(options.retries, attempt)));
  }
  throw new Error(`file lock timeout for ${normalizedFile}`);
}
/** Run an async callback while holding a file lock, always releasing the lock afterward. */
async function withFileLock(filePath, options, fn) {
  const lock = await acquireFileLock(filePath, options);
  try {
    return await fn();
  } finally {
    await lock.release();
  }
}
//#endregion /* v9-d917ffeff76ce598 */
