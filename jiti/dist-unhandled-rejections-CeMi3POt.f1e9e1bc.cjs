"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = isTransientUnhandledRejectionError;exports.i = isTransientSqliteError;exports.n = isAbortError;exports.o = isUnhandledRejectionHandled;exports.r = isTransientNetworkError;exports.s = registerUnhandledRejectionHandler;exports.t = installUnhandledRejectionHandler;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _restoreCa_QrWKB = require("./restore-Ca_QrWKB.js");
var _nodeProcess = _interopRequireDefault(require("node:process"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/unhandled-rejections.ts
const handlers = /* @__PURE__ */new Set();
const FATAL_ERROR_CODES = new Set([
"ERR_OUT_OF_MEMORY",
"ERR_SCRIPT_EXECUTION_TIMEOUT",
"ERR_WORKER_OUT_OF_MEMORY",
"ERR_WORKER_UNCAUGHT_EXCEPTION",
"ERR_WORKER_INITIALIZATION_FAILED"]
);
const CONFIG_ERROR_CODES = new Set([
"INVALID_CONFIG",
"MISSING_API_KEY",
"MISSING_CREDENTIALS"]
);
const TRANSIENT_NETWORK_CODES = new Set([
"ECONNRESET",
"ECONNREFUSED",
"ENOTFOUND",
"ETIMEDOUT",
"ESOCKETTIMEDOUT",
"ECONNABORTED",
"EPIPE",
"EHOSTUNREACH",
"ENETUNREACH",
"EAI_AGAIN",
"UND_ERR_CONNECT_TIMEOUT",
"UND_ERR_DNS_RESOLVE_FAILED",
"UND_ERR_CONNECT",
"UND_ERR_SOCKET",
"UND_ERR_HEADERS_TIMEOUT",
"UND_ERR_BODY_TIMEOUT",
"EPROTO",
"ERR_SSL_WRONG_VERSION_NUMBER",
"ERR_SSL_PROTOCOL_RETURNED_AN_ERROR"]
);
const TRANSIENT_NETWORK_ERROR_NAMES = new Set([
"AbortError",
"ConnectTimeoutError",
"HeadersTimeoutError",
"BodyTimeoutError",
"TimeoutError"]
);
const TRANSIENT_SQLITE_CODES = new Set([
"SQLITE_BUSY",
"SQLITE_CANTOPEN",
"SQLITE_IOERR",
"SQLITE_LOCKED"]
);
const TRANSIENT_SQLITE_ERRCODES = new Set([
5,
6,
10,
14]
);
const TRANSIENT_NETWORK_MESSAGE_CODE_RE = /\b(ECONNRESET|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ESOCKETTIMEDOUT|ECONNABORTED|EPIPE|EHOSTUNREACH|ENETUNREACH|EAI_AGAIN|EPROTO|UND_ERR_CONNECT_TIMEOUT|UND_ERR_DNS_RESOLVE_FAILED|UND_ERR_CONNECT|UND_ERR_SOCKET|UND_ERR_HEADERS_TIMEOUT|UND_ERR_BODY_TIMEOUT)\b/i;
const TRANSIENT_SQLITE_MESSAGE_CODE_RE = /\b(SQLITE_BUSY|SQLITE_CANTOPEN|SQLITE_IOERR|SQLITE_LOCKED)\b/i;
const TRANSIENT_NETWORK_MESSAGE_SNIPPETS = [
"getaddrinfo",
"socket hang up",
"client network socket disconnected before secure tls connection was established",
"network error",
"network is unreachable",
"temporary failure in name resolution",
"upstream connect error",
"disconnect/reset before headers",
"tlsv1 alert",
"ssl routines",
"packet length too long",
"write eproto"];

const TRANSIENT_SQLITE_MESSAGE_SNIPPETS = [
"unable to open database file",
"database is locked",
"database table is locked",
"disk i/o error"];

function hasSqliteSignal(err) {
  if (!err || typeof err !== "object") return false;
  const code = (0, _errorsD8p6rxH.r)(err);
  if (typeof code === "string") {
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode === "ERR_SQLITE_ERROR" || normalizedCode.startsWith("SQLITE_")) return true;
  }
  if ((0, _stringCoerceBUSzWgUA.i)((0, _errorsD8p6rxH.c)(err)).includes("sqlite")) return true;
  if (("message" in err && typeof err.message === "string" ? (0, _stringCoerceBUSzWgUA.i)(err.message) : "").includes("sqlite")) return true;
  return false;
}
function isWrappedFetchFailedMessage(message) {
  if (message === "fetch failed") return true;
  return /:\s*fetch failed$/.test(message);
}
function getErrorCause(err) {
  if (!err || typeof err !== "object") return;
  return err.cause;
}
function extractErrorCodeOrErrno(err) {
  const code = (0, _errorsD8p6rxH.r)(err);
  if (code) return code.trim().toUpperCase();
  if (!err || typeof err !== "object") return;
  const errno = err.errno;
  if (typeof errno === "string" && errno.trim()) return errno.trim().toUpperCase();
  if (typeof errno === "number" && Number.isFinite(errno)) return String(errno);
}
function extractNumericErrorCode(err, key) {
  if (!err || typeof err !== "object") return;
  const value = err[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : void 0;
  }
}
function extractErrorCodeWithCause(err) {
  const direct = (0, _errorsD8p6rxH.r)(err);
  if (direct) return direct;
  return (0, _errorsD8p6rxH.r)(getErrorCause(err));
}
/**
* Checks if an error is an AbortError.
* These are typically intentional cancellations (e.g., during shutdown) and shouldn't crash.
*/
function isAbortError(err) {
  if (!err || typeof err !== "object") return false;
  if (("name" in err ? String(err.name) : "") === "AbortError") return true;
  if (("message" in err && typeof err.message === "string" ? err.message : "") === "This operation was aborted") return true;
  return false;
}
function isFatalError(err) {
  const code = extractErrorCodeWithCause(err);
  return code !== void 0 && FATAL_ERROR_CODES.has(code);
}
function isConfigError(err) {
  const code = extractErrorCodeWithCause(err);
  return code !== void 0 && CONFIG_ERROR_CODES.has(code);
}
function collectNestedUnhandledErrorCandidates(err) {
  return (0, _errorsD8p6rxH.t)(err, (current) => {
    const nested = [
    current.cause,
    current.reason,
    current.original,
    current.error,
    current.data];

    if (Array.isArray(current.errors)) nested.push(...current.errors);
    return nested;
  });
}
/**
* Checks if an error is a transient network error that shouldn't crash the gateway.
* These are typically temporary connectivity issues that will resolve on their own.
*/
function isTransientNetworkError(err) {
  if (!err) return false;
  for (const candidate of collectNestedUnhandledErrorCandidates(err)) {
    const code = extractErrorCodeOrErrno(candidate);
    if (code && TRANSIENT_NETWORK_CODES.has(code)) return true;
    const name = (0, _errorsD8p6rxH.c)(candidate);
    if (name && TRANSIENT_NETWORK_ERROR_NAMES.has(name)) return true;
    if (!candidate || typeof candidate !== "object") continue;
    const rawMessage = candidate.message;
    const message = (0, _stringCoerceBUSzWgUA.i)(rawMessage);
    if (!message) continue;
    if (TRANSIENT_NETWORK_MESSAGE_CODE_RE.test(message)) return true;
    if (isWrappedFetchFailedMessage(message)) return true;
    if (TRANSIENT_NETWORK_MESSAGE_SNIPPETS.some((snippet) => message.includes(snippet))) return true;
  }
  return false;
}
function isTransientSqliteError(err) {
  if (!err) return false;
  for (const candidate of collectNestedUnhandledErrorCandidates(err)) {
    const code = extractErrorCodeOrErrno(candidate);
    if (code && TRANSIENT_SQLITE_CODES.has(code)) return true;
    if (!hasSqliteSignal(candidate)) continue;
    const sqliteErrcode = extractNumericErrorCode(candidate, "errcode");
    if (sqliteErrcode !== void 0 && TRANSIENT_SQLITE_ERRCODES.has(sqliteErrcode)) return true;
    if (!candidate || typeof candidate !== "object") continue;
    const messageParts = [candidate.message, candidate.errstr];
    for (const rawMessage of messageParts) {
      const message = (0, _stringCoerceBUSzWgUA.i)(rawMessage);
      if (!message) continue;
      if (TRANSIENT_SQLITE_MESSAGE_CODE_RE.test(message)) return true;
      if (TRANSIENT_SQLITE_MESSAGE_SNIPPETS.some((snippet) => message.includes(snippet))) return true;
    }
  }
  return false;
}
function isTransientUnhandledRejectionError(err) {
  return isTransientNetworkError(err) || isTransientSqliteError(err);
}
function registerUnhandledRejectionHandler(handler) {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}
function isUnhandledRejectionHandled(reason) {
  for (const handler of handlers) try {
    if (handler(reason)) return true;
  } catch (err) {
    console.error("[openclaw] Unhandled rejection handler failed:", err instanceof Error ? err.stack ?? err.message : err);
  }
  return false;
}
function installUnhandledRejectionHandler() {
  const exitWithTerminalRestore = (reason) => {
    (0, _restoreCa_QrWKB.t)(reason, { resumeStdinIfPaused: false });
    _nodeProcess.default.exit(1);
  };
  _nodeProcess.default.on("unhandledRejection", (reason, _promise) => {
    if (isUnhandledRejectionHandled(reason)) return;
    if (isAbortError(reason)) {
      console.warn("[openclaw] Suppressed AbortError:", (0, _errorsD8p6rxH.a)(reason));
      return;
    }
    if (isFatalError(reason)) {
      console.error("[openclaw] FATAL unhandled rejection:", (0, _errorsD8p6rxH.a)(reason));
      exitWithTerminalRestore("fatal unhandled rejection");
      return;
    }
    if (isConfigError(reason)) {
      console.error("[openclaw] CONFIGURATION ERROR - requires fix:", (0, _errorsD8p6rxH.a)(reason));
      exitWithTerminalRestore("configuration error");
      return;
    }
    if (isTransientUnhandledRejectionError(reason)) {
      console.warn("[openclaw] Non-fatal unhandled rejection (continuing):", (0, _errorsD8p6rxH.a)(reason));
      return;
    }
    console.error("[openclaw] Unhandled promise rejection:", (0, _errorsD8p6rxH.a)(reason));
    exitWithTerminalRestore("unhandled rejection");
  });
}
//#endregion /* v9-cfed59d707b5c6c1 */
