"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = writeTextAtomic;exports.n = readJsonFile;exports.r = writeJsonAtomic;exports.t = createAsyncLock;var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = _interopRequireDefault(require("node:fs/promises"));
var _nodeCrypto = require("node:crypto");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/json-files.ts
function getErrorCode(err) {
  return err instanceof Error ? err.code : void 0;
}
async function replaceFileWithWindowsFallback(tempPath, filePath, mode) {
  try {
    await _promises.default.rename(tempPath, filePath);
    return;
  } catch (err) {
    const code = getErrorCode(err);
    if (process.platform !== "win32" || code !== "EPERM" && code !== "EEXIST") throw err;
  }
  await _promises.default.copyFile(tempPath, filePath);
  try {
    await _promises.default.chmod(filePath, mode);
  } catch {}
  await _promises.default.rm(tempPath, { force: true }).catch(() => void 0);
}
async function readJsonFile(filePath) {
  try {
    const raw = await _promises.default.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
async function writeJsonAtomic(filePath, value, options) {
  await writeTextAtomic(filePath, JSON.stringify(value, null, 2), {
    mode: options?.mode,
    ensureDirMode: options?.ensureDirMode,
    appendTrailingNewline: options?.trailingNewline
  });
}
async function writeTextAtomic(filePath, content, options) {
  const mode = options?.mode ?? 384;
  const payload = options?.appendTrailingNewline && !content.endsWith("\n") ? `${content}\n` : content;
  const mkdirOptions = { recursive: true };
  if (typeof options?.ensureDirMode === "number") mkdirOptions.mode = options.ensureDirMode;
  await _promises.default.mkdir(_nodePath.default.dirname(filePath), mkdirOptions);
  const parentDir = _nodePath.default.dirname(filePath);
  const tmp = `${filePath}.${(0, _nodeCrypto.randomUUID)()}.tmp`;
  try {
    const tmpHandle = await _promises.default.open(tmp, "w", mode);
    try {
      await tmpHandle.writeFile(payload, { encoding: "utf8" });
      await tmpHandle.sync();
    } finally {
      await tmpHandle.close().catch(() => void 0);
    }
    try {
      await _promises.default.chmod(tmp, mode);
    } catch {}
    await replaceFileWithWindowsFallback(tmp, filePath, mode);
    try {
      const dirHandle = await _promises.default.open(parentDir, "r");
      try {
        await dirHandle.sync();
      } finally {
        await dirHandle.close().catch(() => void 0);
      }
    } catch {}
    try {
      await _promises.default.chmod(filePath, mode);
    } catch {}
  } finally {
    await _promises.default.rm(tmp, { force: true }).catch(() => void 0);
  }
}
function createAsyncLock() {
  let lock = Promise.resolve();
  return async function withLock(fn) {
    const prev = lock;
    let release;
    lock = new Promise((resolve) => {
      release = resolve;
    });
    await prev;
    try {
      return await fn();
    } finally {
      release?.();
    }
  };
}
//#endregion /* v9-2f38c51d1ce4fa6b */
