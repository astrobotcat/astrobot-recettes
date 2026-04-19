"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = withTempDownloadPath;exports.n = createTempDownloadTarget;exports.r = sanitizeTempFileName;exports.t = buildRandomTempFilePath;var _tmpOpenclawDirEyAoWbVe = require("./tmp-openclaw-dir-eyAoWbVe.js");
var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = require("node:fs/promises");
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/temp-download.ts
function sanitizePrefix(prefix) {
  return prefix.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "tmp";
}
function sanitizeExtension(extension) {
  if (!extension) return "";
  const token = ((extension.startsWith(".") ? extension : `.${extension}`).match(/[a-zA-Z0-9._-]+$/)?.[0] ?? "").replace(/^[._-]+/, "");
  return token ? `.${token}` : "";
}
function sanitizeTempFileName(fileName) {
  return _nodePath.default.basename(fileName).replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "download.bin";
}
function resolveTempRoot(tmpDir) {
  return tmpDir ?? (0, _tmpOpenclawDirEyAoWbVe.n)();
}
function isNodeErrorWithCode(err, code) {
  return typeof err === "object" && err !== null && "code" in err && err.code === code;
}
async function cleanupTempDir(dir) {
  try {
    await (0, _promises.rm)(dir, {
      recursive: true,
      force: true
    });
  } catch (err) {
    if (!isNodeErrorWithCode(err, "ENOENT")) console.warn(`temp-path cleanup failed for ${dir}: ${String(err)}`);
  }
}
function buildRandomTempFilePath(params) {
  const prefix = sanitizePrefix(params.prefix);
  const extension = sanitizeExtension(params.extension);
  const nowCandidate = params.now;
  const now = typeof nowCandidate === "number" && Number.isFinite(nowCandidate) ? Math.trunc(nowCandidate) : Date.now();
  const uuid = params.uuid?.trim() || _nodeCrypto.default.randomUUID();
  return _nodePath.default.join(resolveTempRoot(params.tmpDir), `${prefix}-${now}-${uuid}${extension}`);
}
async function createTempDownloadTarget(params) {
  const tempRoot = resolveTempRoot(params.tmpDir);
  const prefix = `${sanitizePrefix(params.prefix)}-`;
  const dir = await (0, _promises.mkdtemp)(_nodePath.default.join(tempRoot, prefix));
  return {
    dir,
    path: _nodePath.default.join(dir, sanitizeTempFileName(params.fileName ?? "download.bin")),
    cleanup: async () => {
      await cleanupTempDir(dir);
    }
  };
}
async function withTempDownloadPath(params, fn) {
  const target = await createTempDownloadTarget(params);
  try {
    return await fn(target.path);
  } finally {
    await target.cleanup();
  }
}
//#endregion /* v9-b40b195469a3f064 */
