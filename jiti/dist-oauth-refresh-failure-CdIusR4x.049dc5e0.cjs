"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = classifyOAuthRefreshFailure;exports.r = classifyOAuthRefreshFailureReason;exports.t = buildOAuthRefreshFailureLoginCommand;var _ansiBs_ZZlnS = require("./ansi-Bs_ZZlnS.js");
var _commandFormatDd3uP = require("./command-format-Dd3uP9-6.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
//#region src/agents/auth-profiles/oauth-refresh-failure.ts
const OAUTH_REFRESH_FAILURE_PROVIDER_RE = /OAuth token refresh failed for ([^:]+):/i;
const SAFE_PROVIDER_ID_RE = /^[a-z0-9][a-z0-9._-]*$/;
function extractOAuthRefreshFailureProvider(message) {
  const provider = message.match(OAUTH_REFRESH_FAILURE_PROVIDER_RE)?.[1]?.trim();
  return provider && provider.length > 0 ? provider : null;
}
function sanitizeOAuthRefreshFailureProvider(provider) {
  const normalized = (0, _providerIdKaStHhRz.r)(provider ? (0, _ansiBs_ZZlnS.t)(provider).replaceAll("`", "").trim() : "");
  return normalized && SAFE_PROVIDER_ID_RE.test(normalized) ? normalized : null;
}
function classifyOAuthRefreshFailureReason(message) {
  const lower = message.toLowerCase();
  if (lower.includes("refresh_token_reused")) return "refresh_token_reused";
  if (lower.includes("invalid_grant")) return "invalid_grant";
  if (lower.includes("signing in again") || lower.includes("sign in again")) return "sign_in_again";
  if (lower.includes("invalid refresh token")) return "invalid_refresh_token";
  if (lower.includes("expired or revoked") || lower.includes("revoked")) return "revoked";
  return null;
}
function classifyOAuthRefreshFailure(message) {
  if (!/oauth token refresh failed/i.test(message)) return null;
  return {
    provider: sanitizeOAuthRefreshFailureProvider(extractOAuthRefreshFailureProvider(message)),
    reason: classifyOAuthRefreshFailureReason(message)
  };
}
function buildOAuthRefreshFailureLoginCommand(provider) {
  const safeProvider = sanitizeOAuthRefreshFailureProvider(provider);
  return safeProvider ? (0, _commandFormatDd3uP.t)(`openclaw models auth login --provider ${safeProvider}`) : (0, _commandFormatDd3uP.t)("openclaw models auth login");
}
//#endregion /* v9-6244423417837cfe */
