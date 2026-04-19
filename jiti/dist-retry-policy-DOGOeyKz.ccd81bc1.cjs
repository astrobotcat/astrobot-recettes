"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = createChannelApiRetryRunner;exports.r = createRateLimitRetryRunner;exports.t = void 0;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _retryCGVSdz2T = require("./retry-cGVSdz2T.js");
//#region src/infra/retry-policy.ts
const CHANNEL_API_RETRY_DEFAULTS = exports.t = {
  attempts: 3,
  minDelayMs: 400,
  maxDelayMs: 3e4,
  jitter: .1
};
const CHANNEL_API_RETRY_RE = /429|timeout|connect|reset|closed|unavailable|temporarily/i;
const log = (0, _subsystemCgmckbux.t)("retry-policy");
function resolveChannelApiShouldRetry(params) {
  if (!params.shouldRetry) return (err) => CHANNEL_API_RETRY_RE.test((0, _errorsD8p6rxH.i)(err));
  if (params.strictShouldRetry) return params.shouldRetry;
  return (err) => params.shouldRetry?.(err) || CHANNEL_API_RETRY_RE.test((0, _errorsD8p6rxH.i)(err));
}
function getChannelApiRetryAfterMs(err) {
  if (!err || typeof err !== "object") return;
  const candidate = "parameters" in err && err.parameters && typeof err.parameters === "object" ? err.parameters.retry_after : "response" in err && err.response && typeof err.response === "object" && "parameters" in err.response ? err.response.parameters?.retry_after : "error" in err && err.error && typeof err.error === "object" && "parameters" in err.error ? err.error.parameters?.retry_after : void 0;
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate * 1e3 : void 0;
}
function createRateLimitRetryRunner(params) {
  const retryConfig = (0, _retryCGVSdz2T.t)(params.defaults, {
    ...params.configRetry,
    ...params.retry
  });
  return (fn, label) => (0, _retryCGVSdz2T.n)(fn, {
    ...retryConfig,
    label,
    shouldRetry: params.shouldRetry,
    retryAfterMs: params.retryAfterMs,
    onRetry: params.verbose ? (info) => {
      const labelText = info.label ?? "request";
      const maxRetries = Math.max(1, info.maxAttempts - 1);
      log.warn(`${params.logLabel} ${labelText} rate limited, retry ${info.attempt}/${maxRetries} in ${info.delayMs}ms`);
    } : void 0
  });
}
function createChannelApiRetryRunner(params) {
  const retryConfig = (0, _retryCGVSdz2T.t)(CHANNEL_API_RETRY_DEFAULTS, {
    ...params.configRetry,
    ...params.retry
  });
  const shouldRetry = resolveChannelApiShouldRetry(params);
  return (fn, label) => (0, _retryCGVSdz2T.n)(fn, {
    ...retryConfig,
    label,
    shouldRetry,
    retryAfterMs: getChannelApiRetryAfterMs,
    onRetry: params.verbose ? (info) => {
      const maxRetries = Math.max(1, info.maxAttempts - 1);
      log.warn(`channel send retry ${info.attempt}/${maxRetries} for ${info.label ?? label ?? "request"} in ${info.delayMs}ms: ${(0, _errorsD8p6rxH.i)(info.err)}`);
    } : void 0
  });
}
//#endregion /* v9-33258f6a49d8494d */
