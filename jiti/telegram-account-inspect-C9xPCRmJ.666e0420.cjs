"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = inspectTelegramAccount;var _accountsCoskdHdZ = require("./accounts-CoskdHdZ.js");
var _accountCore = require("openclaw/plugin-sdk/account-core");
var _channelCore = require("openclaw/plugin-sdk/channel-core");
var _configRuntime = require("openclaw/plugin-sdk/config-runtime");
var _providerAuth = require("openclaw/plugin-sdk/provider-auth");
var _routing = require("openclaw/plugin-sdk/routing");
var _secretInput = require("openclaw/plugin-sdk/secret-input");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
//#region extensions/telegram/src/account-inspect.ts
function inspectTokenFile(pathValue) {
  const tokenFile = (0, _textRuntime.normalizeOptionalString)(pathValue) ?? "";
  if (!tokenFile) return null;
  const token = (0, _channelCore.tryReadSecretFileSync)(tokenFile, "Telegram bot token", { rejectSymlink: true });
  return {
    token: token ?? "",
    tokenSource: "tokenFile",
    tokenStatus: token ? "available" : "configured_unavailable"
  };
}
function canResolveEnvSecretRefInReadOnlyPath(params) {
  const providerConfig = params.cfg.secrets?.providers?.[params.provider];
  if (!providerConfig) return params.provider === (0, _providerAuth.resolveDefaultSecretProviderAlias)(params.cfg, "env");
  if (providerConfig.source !== "env") return false;
  const allowlist = providerConfig.allowlist;
  return !allowlist || allowlist.includes(params.id);
}
function inspectTokenValue(params) {
  const ref = (0, _configRuntime.coerceSecretRef)(params.value, params.cfg.secrets?.defaults);
  if (ref?.source === "env") {
    if (!canResolveEnvSecretRefInReadOnlyPath({
      cfg: params.cfg,
      provider: ref.provider,
      id: ref.id
    })) return {
      token: "",
      tokenSource: "env",
      tokenStatus: "configured_unavailable"
    };
    const envValue = (0, _textRuntime.normalizeOptionalString)(process.env[ref.id]);
    if (envValue) return {
      token: envValue,
      tokenSource: "env",
      tokenStatus: "available"
    };
    return {
      token: "",
      tokenSource: "env",
      tokenStatus: "configured_unavailable"
    };
  }
  const token = (0, _secretInput.normalizeSecretInputString)(params.value);
  if (token) return {
    token,
    tokenSource: "config",
    tokenStatus: "available"
  };
  if ((0, _secretInput.hasConfiguredSecretInput)(params.value, params.cfg.secrets?.defaults)) return {
    token: "",
    tokenSource: "config",
    tokenStatus: "configured_unavailable"
  };
  return null;
}
function inspectTelegramAccountPrimary(params) {
  const accountId = (0, _routing.normalizeAccountId)(params.accountId);
  const merged = (0, _accountsCoskdHdZ.i)(params.cfg, accountId);
  const enabled = params.cfg.channels?.telegram?.enabled !== false && merged.enabled !== false;
  const accountConfig = (0, _accountsCoskdHdZ.c)(params.cfg, accountId);
  const accountTokenFile = inspectTokenFile(accountConfig?.tokenFile);
  if (accountTokenFile) return {
    accountId,
    enabled,
    name: (0, _textRuntime.normalizeOptionalString)(merged.name),
    token: accountTokenFile.token,
    tokenSource: accountTokenFile.tokenSource,
    tokenStatus: accountTokenFile.tokenStatus,
    configured: accountTokenFile.tokenStatus !== "missing",
    config: merged
  };
  const accountToken = inspectTokenValue({
    cfg: params.cfg,
    value: accountConfig?.botToken
  });
  if (accountToken) return {
    accountId,
    enabled,
    name: (0, _textRuntime.normalizeOptionalString)(merged.name),
    token: accountToken.token,
    tokenSource: accountToken.tokenSource,
    tokenStatus: accountToken.tokenStatus,
    configured: accountToken.tokenStatus !== "missing",
    config: merged
  };
  const channelTokenFile = inspectTokenFile(params.cfg.channels?.telegram?.tokenFile);
  if (channelTokenFile) return {
    accountId,
    enabled,
    name: (0, _textRuntime.normalizeOptionalString)(merged.name),
    token: channelTokenFile.token,
    tokenSource: channelTokenFile.tokenSource,
    tokenStatus: channelTokenFile.tokenStatus,
    configured: channelTokenFile.tokenStatus !== "missing",
    config: merged
  };
  const channelToken = inspectTokenValue({
    cfg: params.cfg,
    value: params.cfg.channels?.telegram?.botToken
  });
  if (channelToken) return {
    accountId,
    enabled,
    name: (0, _textRuntime.normalizeOptionalString)(merged.name),
    token: channelToken.token,
    tokenSource: channelToken.tokenSource,
    tokenStatus: channelToken.tokenStatus,
    configured: channelToken.tokenStatus !== "missing",
    config: merged
  };
  const envToken = accountId === _routing.DEFAULT_ACCOUNT_ID ? (0, _textRuntime.normalizeOptionalString)(params.envToken) ?? (0, _textRuntime.normalizeOptionalString)(process.env.TELEGRAM_BOT_TOKEN) ?? "" : "";
  if (envToken) return {
    accountId,
    enabled,
    name: (0, _textRuntime.normalizeOptionalString)(merged.name),
    token: envToken,
    tokenSource: "env",
    tokenStatus: "available",
    configured: true,
    config: merged
  };
  return {
    accountId,
    enabled,
    name: (0, _textRuntime.normalizeOptionalString)(merged.name),
    token: "",
    tokenSource: "none",
    tokenStatus: "missing",
    configured: false,
    config: merged
  };
}
function inspectTelegramAccount(params) {
  return (0, _accountCore.resolveAccountWithDefaultFallback)({
    accountId: params.accountId,
    normalizeAccountId: _routing.normalizeAccountId,
    resolvePrimary: (accountId) => inspectTelegramAccountPrimary({
      cfg: params.cfg,
      accountId,
      envToken: params.envToken
    }),
    hasCredential: (account) => account.tokenSource !== "none",
    resolveDefaultAccountId: () => (0, _accountsCoskdHdZ.o)(params.cfg)
  });
}
//#endregion /* v9-4b3e3a381f5d252d */
