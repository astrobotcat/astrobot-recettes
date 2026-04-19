"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resetMissingDefaultWarnFlag;exports.c = resolveTelegramAccountConfig;exports.d = resolveTelegramToken;exports.i = mergeTelegramAccountConfig;exports.l = resolveTelegramMediaRuntimeOptions;exports.n = listEnabledTelegramAccounts;exports.o = resolveDefaultTelegramAccountId;exports.r = listTelegramAccountIds;exports.s = resolveTelegramAccount;exports.t = createTelegramActionGate;exports.u = resolveTelegramPollActionGateState;var _accountCore = require("openclaw/plugin-sdk/account-core");
var _channelCore = require("openclaw/plugin-sdk/channel-core");
var _providerAuth = require("openclaw/plugin-sdk/provider-auth");
var _routing = require("openclaw/plugin-sdk/routing");
var _secretInput = require("openclaw/plugin-sdk/secret-input");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
var _nodeUtil = _interopRequireDefault(require("node:util"));
var _runtimeEnv = require("openclaw/plugin-sdk/runtime-env");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region extensions/telegram/src/token.ts
function resolveEnvSecretRefValue(params) {
  const providerConfig = params.cfg?.secrets?.providers?.[params.provider];
  if (providerConfig) {
    if (providerConfig.source !== "env") throw new Error(`Secret provider "${params.provider}" has source "${providerConfig.source}" but ref requests "env".`);
    if (providerConfig.allowlist && !providerConfig.allowlist.includes(params.id)) throw new Error(`Environment variable "${params.id}" is not allowlisted in secrets.providers.${params.provider}.allowlist.`);
  } else if (params.provider !== (0, _providerAuth.resolveDefaultSecretProviderAlias)({ secrets: params.cfg?.secrets }, "env")) throw new Error(`Secret provider "${params.provider}" is not configured (ref: env:${params.provider}:${params.id}).`);
  return (0, _secretInput.normalizeSecretInputString)((params.env ?? process.env)[params.id]);
}
function resolveRuntimeTokenValue(params) {
  const resolved = (0, _secretInput.resolveSecretInputString)({
    value: params.value,
    path: params.path,
    defaults: params.cfg?.secrets?.defaults,
    mode: "inspect"
  });
  if (resolved.status === "available") return {
    status: "available",
    value: resolved.value
  };
  if (resolved.status === "missing") return { status: "missing" };
  if (resolved.ref.source === "env") {
    const envValue = resolveEnvSecretRefValue({
      cfg: params.cfg,
      provider: resolved.ref.provider,
      id: resolved.ref.id
    });
    if (envValue) return {
      status: "available",
      value: envValue
    };
    return { status: "configured_unavailable" };
  }
  (0, _secretInput.resolveSecretInputString)({
    value: params.value,
    path: params.path,
    defaults: params.cfg?.secrets?.defaults,
    mode: "strict"
  });
  return { status: "configured_unavailable" };
}
function resolveTelegramToken(cfg, opts = {}) {
  const accountId = (0, _routing.normalizeAccountId)(opts.accountId);
  const telegramCfg = cfg?.channels?.telegram;
  const resolveAccountCfg = (id) => {
    const accounts = telegramCfg?.accounts;
    return Array.isArray(accounts) ? void 0 : (0, _accountCore.resolveNormalizedAccountEntry)(accounts, id, _routing.normalizeAccountId);
  };
  const accountCfg = resolveAccountCfg(accountId !== _routing.DEFAULT_ACCOUNT_ID ? accountId : _routing.DEFAULT_ACCOUNT_ID);
  if (accountId !== _routing.DEFAULT_ACCOUNT_ID && !accountCfg) {
    const accounts = telegramCfg?.accounts;
    if (!!accounts && typeof accounts === "object" && !Array.isArray(accounts) && Object.keys(accounts).length > 0) {
      opts.logMissingFile?.(`channels.telegram.accounts: unknown accountId "${accountId}" — not found in config, refusing channel-level fallback`);
      return {
        token: "",
        source: "none"
      };
    }
  }
  const accountTokenFile = accountCfg?.tokenFile?.trim();
  if (accountTokenFile) {
    const token = (0, _channelCore.tryReadSecretFileSync)(accountTokenFile, `channels.telegram.accounts.${accountId}.tokenFile`, { rejectSymlink: true });
    if (token) return {
      token,
      source: "tokenFile"
    };
    opts.logMissingFile?.(`channels.telegram.accounts.${accountId}.tokenFile not found or unreadable: ${accountTokenFile}`);
    return {
      token: "",
      source: "none"
    };
  }
  const accountToken = resolveRuntimeTokenValue({
    cfg,
    value: accountCfg?.botToken,
    path: `channels.telegram.accounts.${accountId}.botToken`
  });
  if (accountToken.status === "available") return {
    token: accountToken.value,
    source: "config"
  };
  if (accountToken.status === "configured_unavailable") return {
    token: "",
    source: "none"
  };
  const allowEnv = accountId === _routing.DEFAULT_ACCOUNT_ID;
  const tokenFile = telegramCfg?.tokenFile?.trim();
  if (tokenFile) {
    const token = (0, _channelCore.tryReadSecretFileSync)(tokenFile, "channels.telegram.tokenFile", { rejectSymlink: true });
    if (token) return {
      token,
      source: "tokenFile"
    };
    opts.logMissingFile?.(`channels.telegram.tokenFile not found or unreadable: ${tokenFile}`);
    return {
      token: "",
      source: "none"
    };
  }
  const configToken = resolveRuntimeTokenValue({
    cfg,
    value: telegramCfg?.botToken,
    path: "channels.telegram.botToken"
  });
  if (configToken.status === "available") return {
    token: configToken.value,
    source: "config"
  };
  if (configToken.status === "configured_unavailable") return {
    token: "",
    source: "none"
  };
  const envToken = allowEnv ? (opts.envToken ?? process.env.TELEGRAM_BOT_TOKEN)?.trim() : "";
  if (envToken) return {
    token: envToken,
    source: "env"
  };
  return {
    token: "",
    source: "none"
  };
}
//#endregion
//#region extensions/telegram/src/accounts.ts
let log = null;
function getLog() {
  if (!log) log = (0, _runtimeEnv.createSubsystemLogger)("telegram/accounts");
  return log;
}
function formatDebugArg(value) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.stack ?? value.message;
  return _nodeUtil.default.inspect(value, {
    colors: false,
    depth: null,
    compact: true,
    breakLength: Infinity
  });
}
const debugAccounts = (...args) => {
  if ((0, _runtimeEnv.isTruthyEnvValue)(process.env.OPENCLAW_DEBUG_TELEGRAM_ACCOUNTS)) {
    const parts = args.map((arg) => formatDebugArg(arg));
    getLog().warn(parts.join(" ").trim());
  }
};
function listConfiguredAccountIds(cfg) {
  const ids = /* @__PURE__ */new Set();
  for (const key of Object.keys(cfg.channels?.telegram?.accounts ?? {})) if (key) ids.add((0, _accountCore.normalizeAccountId)(key));
  return [...ids];
}
function listTelegramAccountIds(cfg) {
  const ids = (0, _accountCore.listCombinedAccountIds)({
    configuredAccountIds: listConfiguredAccountIds(cfg),
    additionalAccountIds: (0, _routing.listBoundAccountIds)(cfg, "telegram"),
    fallbackAccountIdWhenEmpty: _accountCore.DEFAULT_ACCOUNT_ID
  });
  debugAccounts("listTelegramAccountIds", ids);
  return ids;
}
let emittedMissingDefaultWarn = false;
/** @internal Reset the once-per-process warning flag. Exported for tests only. */
function resetMissingDefaultWarnFlag() {
  emittedMissingDefaultWarn = false;
}
function resolveDefaultTelegramAccountId(cfg) {
  const boundDefault = (0, _routing.resolveDefaultAgentBoundAccountId)(cfg, "telegram");
  if (boundDefault) return boundDefault;
  const ids = listTelegramAccountIds(cfg);
  const resolved = (0, _accountCore.resolveListedDefaultAccountId)({
    accountIds: ids,
    configuredDefaultAccountId: (0, _accountCore.normalizeOptionalAccountId)(cfg.channels?.telegram?.defaultAccount)
  });
  if (resolved !== ids[0] || ids.includes(_accountCore.DEFAULT_ACCOUNT_ID) || ids.length <= 1) return resolved;
  if (ids.length > 1 && !emittedMissingDefaultWarn) {
    emittedMissingDefaultWarn = true;
    getLog().warn(`channels.telegram: accounts.default is missing; falling back to "${ids[0]}". ${(0, _routing.formatSetExplicitDefaultInstruction)("telegram")} to avoid routing surprises in multi-account setups.`);
  }
  return resolved;
}
function resolveTelegramAccountConfig(cfg, accountId) {
  const normalized = (0, _accountCore.normalizeAccountId)(accountId);
  return (0, _accountCore.resolveAccountEntry)(cfg.channels?.telegram?.accounts, normalized);
}
function mergeTelegramAccountConfig(cfg, accountId) {
  const { accounts: _ignored, defaultAccount: _ignoredDefaultAccount, groups: channelGroups, ...base } = cfg.channels?.telegram ?? {};
  const account = resolveTelegramAccountConfig(cfg, accountId) ?? {};
  const isMultiAccount = Object.keys(cfg.channels?.telegram?.accounts ?? {}).length > 1;
  const groups = account.groups ?? (isMultiAccount ? void 0 : channelGroups);
  return {
    ...base,
    ...account,
    groups
  };
}
function createTelegramActionGate(params) {
  const accountId = (0, _accountCore.normalizeAccountId)(params.accountId ?? resolveDefaultTelegramAccountId(params.cfg));
  return (0, _accountCore.createAccountActionGate)({
    baseActions: params.cfg.channels?.telegram?.actions,
    accountActions: resolveTelegramAccountConfig(params.cfg, accountId)?.actions
  });
}
function resolveTelegramMediaRuntimeOptions(params) {
  const normalizedAccountId = (0, _accountCore.normalizeOptionalAccountId)(params.accountId);
  const accountCfg = normalizedAccountId ? mergeTelegramAccountConfig(params.cfg, normalizedAccountId) : params.cfg.channels?.telegram;
  return {
    token: params.token,
    transport: params.transport,
    apiRoot: accountCfg?.apiRoot,
    trustedLocalFileRoots: accountCfg?.trustedLocalFileRoots,
    dangerouslyAllowPrivateNetwork: accountCfg?.network?.dangerouslyAllowPrivateNetwork
  };
}
function resolveTelegramPollActionGateState(isActionEnabled) {
  const sendMessageEnabled = isActionEnabled("sendMessage");
  const pollEnabled = isActionEnabled("poll");
  return {
    sendMessageEnabled,
    pollEnabled,
    enabled: sendMessageEnabled && pollEnabled
  };
}
function resolveTelegramAccount(params) {
  const baseEnabled = params.cfg.channels?.telegram?.enabled !== false;
  const resolve = (accountId) => {
    const merged = mergeTelegramAccountConfig(params.cfg, accountId);
    const accountEnabled = merged.enabled !== false;
    const enabled = baseEnabled && accountEnabled;
    const tokenResolution = resolveTelegramToken(params.cfg, { accountId });
    debugAccounts("resolve", {
      accountId,
      enabled,
      tokenSource: tokenResolution.source
    });
    return {
      accountId,
      enabled,
      name: (0, _textRuntime.normalizeOptionalString)(merged.name),
      token: tokenResolution.token,
      tokenSource: tokenResolution.source,
      config: merged
    };
  };
  return (0, _accountCore.resolveAccountWithDefaultFallback)({
    accountId: params.accountId,
    normalizeAccountId: _accountCore.normalizeAccountId,
    resolvePrimary: resolve,
    hasCredential: (account) => account.tokenSource !== "none",
    resolveDefaultAccountId: () => resolveDefaultTelegramAccountId(params.cfg)
  });
}
function listEnabledTelegramAccounts(cfg) {
  return listTelegramAccountIds(cfg).map((accountId) => resolveTelegramAccount({
    cfg,
    accountId
  })).filter((account) => account.enabled);
}
//#endregion /* v9-23a2ffe72339692d */
