"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = tryReadSecretFileSync;exports.n = loadSecretFileSync;exports.r = readSecretFileSync;exports.t = void 0;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _boundaryFileReadDXLy_w6L = require("./boundary-file-read-DXLy_w6L.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/secret-file.ts
const DEFAULT_SECRET_FILE_MAX_BYTES = exports.t = 16 * 1024;
function normalizeSecretReadError(error) {
  return error instanceof Error ? error : new Error(String(error));
}
function loadSecretFileSync(filePath, label, options = {}) {
  const resolvedPath = (0, _utilsD5DtWkEu.m)(filePath.trim());
  if (!resolvedPath) return {
    ok: false,
    message: `${label} file path is empty.`
  };
  const maxBytes = options.maxBytes ?? 16384;
  let previewStat;
  try {
    previewStat = _nodeFs.default.lstatSync(resolvedPath);
  } catch (error) {
    const normalized = normalizeSecretReadError(error);
    return {
      ok: false,
      resolvedPath,
      error: normalized,
      message: `Failed to inspect ${label} file at ${resolvedPath}: ${String(normalized)}`
    };
  }
  if (options.rejectSymlink && previewStat.isSymbolicLink()) return {
    ok: false,
    resolvedPath,
    message: `${label} file at ${resolvedPath} must not be a symlink.`
  };
  if (!previewStat.isFile()) return {
    ok: false,
    resolvedPath,
    message: `${label} file at ${resolvedPath} must be a regular file.`
  };
  if (previewStat.size > maxBytes) return {
    ok: false,
    resolvedPath,
    message: `${label} file at ${resolvedPath} exceeds ${maxBytes} bytes.`
  };
  const opened = (0, _boundaryFileReadDXLy_w6L.a)({
    filePath: resolvedPath,
    rejectPathSymlink: options.rejectSymlink,
    maxBytes
  });
  if (!opened.ok) {
    const error = normalizeSecretReadError(opened.reason === "validation" ? /* @__PURE__ */new Error("security validation failed") : opened.error);
    return {
      ok: false,
      resolvedPath,
      error,
      message: `Failed to read ${label} file at ${resolvedPath}: ${String(error)}`
    };
  }
  try {
    const secret = _nodeFs.default.readFileSync(opened.fd, "utf8").trim();
    if (!secret) return {
      ok: false,
      resolvedPath,
      message: `${label} file at ${resolvedPath} is empty.`
    };
    return {
      ok: true,
      secret,
      resolvedPath
    };
  } catch (error) {
    const normalized = normalizeSecretReadError(error);
    return {
      ok: false,
      resolvedPath,
      error: normalized,
      message: `Failed to read ${label} file at ${resolvedPath}: ${String(normalized)}`
    };
  } finally {
    _nodeFs.default.closeSync(opened.fd);
  }
}
function readSecretFileSync(filePath, label, options = {}) {
  const result = loadSecretFileSync(filePath, label, options);
  if (result.ok) return result.secret;
  throw new Error(result.message, result.error ? { cause: result.error } : void 0);
}
function tryReadSecretFileSync(filePath, label, options = {}) {
  if (!filePath?.trim()) return;
  const result = loadSecretFileSync(filePath, label, options);
  return result.ok ? result.secret : void 0;
}
//#endregion /* v9-9dadf3585f635337 */
