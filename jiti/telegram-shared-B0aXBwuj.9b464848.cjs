"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = fetchTelegramChatId;exports.i = void 0;exports.n = findTelegramTokenOwnerAccountId;exports.o = lookupTelegramChatId;exports.r = formatDuplicateTelegramTokenReason;exports.s = resolveTelegramChatLookupFetch;exports.t = createTelegramPluginBase;var _accountsCoskdHdZ = require("./accounts-CoskdHdZ.js");
var _accountInspectC9xPCRmJ = require("./account-inspect-C9xPCRmJ.js");
var _allowFromBSf89MjI = require("./allow-from-BSf89MjI.js");
var _fetchB2K4ajFP = require("./fetch-B2K4ajFP.js");
var _commandUiCfr5pQwj = require("./command-ui-Cfr5pQwj.js");
var _configApiDjmzzKNB = require("./config-api-DjmzzKNB.js");
var _setupContractG3mAkj = require("./setup-contract-g-3mAkj2.js");
var _secretContractBfJsMxR = require("./secret-contract-BfJsMxR8.js");
var _accountCore = require("openclaw/plugin-sdk/account-core");
var _channelCore = require("openclaw/plugin-sdk/channel-core");
var _routing = require("openclaw/plugin-sdk/routing");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
var _accountId = require("openclaw/plugin-sdk/account-id");
var _errorRuntime = require("openclaw/plugin-sdk/error-runtime");
var _allowFrom = require("openclaw/plugin-sdk/allow-from");
var _channelConfigHelpers = require("openclaw/plugin-sdk/channel-config-helpers");
var _channelPluginCommon = require("openclaw/plugin-sdk/channel-plugin-common");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region extensions/telegram/src/api-fetch.ts
function resolveTelegramChatLookupFetch(params) {
  const proxyUrl = params?.proxyUrl?.trim();
  return (0, _fetchB2K4ajFP.n)(proxyUrl ? (0, _fetchB2K4ajFP.a)(proxyUrl) : void 0, { network: params?.network });
}
async function lookupTelegramChatId(params) {
  return fetchTelegramChatId({
    token: params.token,
    chatId: params.chatId,
    signal: params.signal,
    apiRoot: params.apiRoot,
    fetchImpl: resolveTelegramChatLookupFetch({
      proxyUrl: params.proxyUrl,
      network: params.network
    })
  });
}
async function fetchTelegramChatId(params) {
  const url = `${(0, _fetchB2K4ajFP.t)(params.apiRoot)}/bot${params.token}/getChat?chat_id=${encodeURIComponent(params.chatId)}`;
  const fetchImpl = params.fetchImpl ?? fetch;
  try {
    const res = await fetchImpl(url, params.signal ? { signal: params.signal } : void 0);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const id = data?.ok ? data?.result?.id : void 0;
    if (typeof id === "number" || typeof id === "string") return String(id);
    return null;
  } catch {
    return null;
  }
}
//#endregion
//#region extensions/telegram/src/config-schema.ts
const TelegramChannelConfigSchema = (0, _configApiDjmzzKNB.n)(_configApiDjmzzKNB.t, { uiHints: {
    "": {
      label: "Telegram",
      help: "Telegram channel provider configuration including auth tokens, retry behavior, and message rendering controls. Use this section to tune bot behavior for Telegram-specific API semantics."
    },
    customCommands: {
      label: "Telegram Custom Commands",
      help: "Additional Telegram bot menu commands (merged with native; conflicts ignored)."
    },
    botToken: {
      label: "Telegram Bot Token",
      help: "Telegram bot token used to authenticate Bot API requests for this account/provider config. Use secret/env substitution and rotate tokens if exposure is suspected."
    },
    dmPolicy: {
      label: "Telegram DM Policy",
      help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.telegram.allowFrom=[\"*\"]."
    },
    configWrites: {
      label: "Telegram Config Writes",
      help: "Allow Telegram to write config in response to channel events/commands (default: true)."
    },
    "commands.native": {
      label: "Telegram Native Commands",
      help: "Override native commands for Telegram (bool or \"auto\")."
    },
    "commands.nativeSkills": {
      label: "Telegram Native Skill Commands",
      help: "Override native skill commands for Telegram (bool or \"auto\")."
    },
    streaming: {
      label: "Telegram Streaming Mode",
      help: "Unified Telegram stream preview mode: \"off\" | \"partial\" | \"block\" | \"progress\" (default: \"partial\"). \"progress\" maps to \"partial\" on Telegram. Legacy boolean/streamMode keys are auto-mapped."
    },
    "streaming.mode": {
      label: "Telegram Streaming Mode",
      help: "Canonical Telegram preview mode: \"off\" | \"partial\" | \"block\" | \"progress\" (default: \"partial\"). \"progress\" maps to \"partial\" on Telegram."
    },
    "streaming.chunkMode": {
      label: "Telegram Chunk Mode",
      help: "Chunking mode for outbound Telegram text delivery: \"length\" (default) or \"newline\"."
    },
    "streaming.block.enabled": {
      label: "Telegram Block Streaming Enabled",
      help: "Enable chunked block-style Telegram preview delivery when channels.telegram.streaming.mode=\"block\"."
    },
    "streaming.block.coalesce": {
      label: "Telegram Block Streaming Coalesce",
      help: "Merge streamed Telegram block replies before sending final delivery."
    },
    "streaming.preview.chunk.minChars": {
      label: "Telegram Draft Chunk Min Chars",
      help: "Minimum chars before emitting a Telegram block preview chunk when channels.telegram.streaming.mode=\"block\"."
    },
    "streaming.preview.chunk.maxChars": {
      label: "Telegram Draft Chunk Max Chars",
      help: "Target max size for a Telegram block preview chunk when channels.telegram.streaming.mode=\"block\"."
    },
    "streaming.preview.chunk.breakPreference": {
      label: "Telegram Draft Chunk Break Preference",
      help: "Preferred breakpoints for Telegram draft chunks (paragraph | newline | sentence)."
    },
    "retry.attempts": {
      label: "Telegram Retry Attempts",
      help: "Max retry attempts for outbound Telegram API calls (default: 3)."
    },
    "retry.minDelayMs": {
      label: "Telegram Retry Min Delay (ms)",
      help: "Minimum retry delay in ms for Telegram outbound calls."
    },
    "retry.maxDelayMs": {
      label: "Telegram Retry Max Delay (ms)",
      help: "Maximum retry delay cap in ms for Telegram outbound calls."
    },
    "retry.jitter": {
      label: "Telegram Retry Jitter",
      help: "Jitter factor (0-1) applied to Telegram retry delays."
    },
    "network.autoSelectFamily": {
      label: "Telegram autoSelectFamily",
      help: "Override Node autoSelectFamily for Telegram (true=enable, false=disable)."
    },
    "network.dangerouslyAllowPrivateNetwork": {
      label: "Telegram Dangerously Allow Private Network",
      help: "Dangerous opt-in for trusted fake-IP or transparent-proxy environments where Telegram media downloads resolve api.telegram.org to private/internal/special-use addresses."
    },
    timeoutSeconds: {
      label: "Telegram API Timeout (seconds)",
      help: "Max seconds before Telegram API requests are aborted (default: 500 per grammY)."
    },
    silentErrorReplies: {
      label: "Telegram Silent Error Replies",
      help: "When true, Telegram bot replies marked as errors are sent silently (no notification sound). Default: false."
    },
    apiRoot: {
      label: "Telegram API Root URL",
      help: "Custom Telegram Bot API root URL. Use for self-hosted Bot API servers (https://github.com/tdlib/telegram-bot-api) or reverse proxies in regions where api.telegram.org is blocked."
    },
    trustedLocalFileRoots: {
      label: "Telegram Trusted Local File Roots",
      help: "Trusted local filesystem roots for self-hosted Telegram Bot API absolute file_path values. Only absolute paths inside these roots are read directly; all other absolute paths are rejected."
    },
    autoTopicLabel: {
      label: "Telegram Auto Topic Label",
      help: "Auto-rename DM forum topics on first message using LLM. Default: true. Set to false to disable, or use object form { enabled: true, prompt: '...' } for custom prompt."
    },
    "autoTopicLabel.enabled": {
      label: "Telegram Auto Topic Label Enabled",
      help: "Whether auto topic labeling is enabled. Default: true."
    },
    "autoTopicLabel.prompt": {
      label: "Telegram Auto Topic Label Prompt",
      help: "Custom prompt for LLM-based topic naming. The user message is appended after the prompt."
    },
    "capabilities.inlineButtons": {
      label: "Telegram Inline Buttons",
      help: "Enable Telegram inline button components for supported command and interaction surfaces. Disable if your deployment needs plain-text-only compatibility behavior."
    },
    execApprovals: {
      label: "Telegram Exec Approvals",
      help: "Telegram-native exec approval routing and approver authorization. When unset, OpenClaw auto-enables DM-first native approvals if approvers can be resolved for the selected bot account."
    },
    "execApprovals.enabled": {
      label: "Telegram Exec Approvals Enabled",
      help: "Controls Telegram native exec approvals for this account: unset or \"auto\" enables DM-first native approvals when approvers can be resolved, true forces native approvals on, and false disables them."
    },
    "execApprovals.approvers": {
      label: "Telegram Exec Approval Approvers",
      help: "Telegram user IDs allowed to approve exec requests for this bot account. Use numeric Telegram user IDs. If you leave this unset, OpenClaw falls back to numeric owner IDs inferred from channels.telegram.allowFrom and direct-message defaultTo when possible."
    },
    "execApprovals.agentFilter": {
      label: "Telegram Exec Approval Agent Filter",
      help: "Optional allowlist of agent IDs eligible for Telegram exec approvals, for example `[\"main\", \"ops-agent\"]`. Use this to keep approval prompts scoped to the agents you actually operate from Telegram."
    },
    "execApprovals.sessionFilter": {
      label: "Telegram Exec Approval Session Filter",
      help: "Optional session-key filters matched as substring or regex-style patterns before Telegram approval routing is used. Use narrow patterns so Telegram approvals only appear for intended sessions."
    },
    "execApprovals.target": {
      label: "Telegram Exec Approval Target",
      help: "Controls where Telegram approval prompts are sent: \"dm\" sends to approver DMs (default), \"channel\" sends to the originating Telegram chat/topic, and \"both\" sends to both. Channel delivery exposes the command text to the chat, so only use it in trusted groups/topics."
    },
    "threadBindings.enabled": {
      label: "Telegram Thread Binding Enabled",
      help: "Enable Telegram conversation binding features (/focus, /unfocus, /agents, and /session idle|max-age). Overrides session.threadBindings.enabled when set."
    },
    "threadBindings.idleHours": {
      label: "Telegram Thread Binding Idle Timeout (hours)",
      help: "Inactivity window in hours for Telegram bound sessions. Set 0 to disable idle auto-unfocus (default: 24). Overrides session.threadBindings.idleHours when set."
    },
    "threadBindings.maxAgeHours": {
      label: "Telegram Thread Binding Max Age (hours)",
      help: "Optional hard max age in hours for Telegram bound sessions. Set 0 to disable hard cap (default: 0). Overrides session.threadBindings.maxAgeHours when set."
    },
    "threadBindings.spawnSubagentSessions": {
      label: "Telegram Thread-Bound Subagent Spawn",
      help: "Allow subagent spawns with thread=true to auto-bind Telegram current conversations when supported."
    },
    "threadBindings.spawnAcpSessions": {
      label: "Telegram Thread-Bound ACP Spawn",
      help: "Allow ACP spawns with thread=true to auto-bind Telegram current conversations when supported."
    }
  } });
//#endregion
//#region extensions/telegram/src/doctor.ts
function asObjectRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function sanitizeForLog(value) {
  return value.replace(/\p{Cc}+/gu, " ").trim();
}
function hasAllowFromEntries(values) {
  return Array.isArray(values) && values.some((entry) => (0, _textRuntime.normalizeOptionalString)(String(entry)));
}
function collectTelegramAccountScopes(cfg) {
  const scopes = [];
  const telegram = asObjectRecord(cfg.channels?.telegram);
  if (!telegram) return scopes;
  scopes.push({
    prefix: "channels.telegram",
    account: telegram
  });
  const accounts = asObjectRecord(telegram.accounts);
  if (!accounts) return scopes;
  for (const key of Object.keys(accounts)) {
    const account = asObjectRecord(accounts[key]);
    if (account) scopes.push({
      prefix: `channels.telegram.accounts.${key}`,
      account
    });
  }
  return scopes;
}
function collectTelegramAllowFromLists(prefix, account) {
  const refs = [{
    pathLabel: `${prefix}.allowFrom`,
    holder: account,
    key: "allowFrom"
  }, {
    pathLabel: `${prefix}.groupAllowFrom`,
    holder: account,
    key: "groupAllowFrom"
  }];
  const groups = asObjectRecord(account.groups);
  if (!groups) return refs;
  for (const groupId of Object.keys(groups)) {
    const group = asObjectRecord(groups[groupId]);
    if (!group) continue;
    refs.push({
      pathLabel: `${prefix}.groups.${groupId}.allowFrom`,
      holder: group,
      key: "allowFrom"
    });
    const topics = asObjectRecord(group.topics);
    if (!topics) continue;
    for (const topicId of Object.keys(topics)) {
      const topic = asObjectRecord(topics[topicId]);
      if (!topic) continue;
      refs.push({
        pathLabel: `${prefix}.groups.${groupId}.topics.${topicId}.allowFrom`,
        holder: topic,
        key: "allowFrom"
      });
    }
  }
  return refs;
}
function scanTelegramInvalidAllowFromEntries(cfg) {
  const hits = [];
  const scanList = (pathLabel, list) => {
    if (!Array.isArray(list)) return;
    for (const entry of list) {
      const normalized = (0, _allowFromBSf89MjI.r)(entry);
      if (!normalized || normalized === "*" || (0, _allowFromBSf89MjI.t)(normalized)) continue;
      hits.push({
        path: pathLabel,
        entry: (0, _textRuntime.normalizeOptionalString)(String(entry)) ?? ""
      });
    }
  };
  for (const scope of collectTelegramAccountScopes(cfg)) for (const ref of collectTelegramAllowFromLists(scope.prefix, scope.account)) scanList(ref.pathLabel, ref.holder[ref.key]);
  return hits;
}
function collectTelegramInvalidAllowFromWarnings(params) {
  if (params.hits.length === 0) return [];
  const sampleEntry = sanitizeForLog(params.hits[0]?.entry ?? "@");
  return [`- Telegram allowFrom contains ${params.hits.length} invalid sender entries (e.g. ${sampleEntry}); Telegram authorization requires positive numeric sender user IDs.`, `- Run "${params.doctorFixCommand}" to auto-resolve @username entries to numeric IDs (requires a Telegram bot token). Move negative chat IDs under channels.telegram.groups instead of allowFrom.`];
}
async function maybeRepairTelegramAllowFromUsernames(cfg) {
  const hits = scanTelegramInvalidAllowFromEntries(cfg);
  if (hits.length === 0) return {
    config: cfg,
    changes: []
  };
  if (hits.filter((hit) => {
    const normalized = (0, _allowFromBSf89MjI.r)(hit.entry);
    return normalized.length > 0 && !/\s/.test(normalized) && !normalized.startsWith("-");
  }).length === 0) return {
    config: cfg,
    changes: hits.slice(0, 5).map((hit) => `- ${sanitizeForLog(hit.path)}: invalid sender entry ${sanitizeForLog(hit.entry)}; allowFrom requires positive numeric Telegram user IDs. Move group chat IDs under channels.telegram.groups.`)
  };
  const { getChannelsCommandSecretTargetIds, resolveCommandSecretRefsViaGateway } = await Promise.resolve().then(() => jitiImport("openclaw/plugin-sdk/runtime-secret-resolution").then((m) => _interopRequireWildcard(m)));
  const { resolvedConfig } = await resolveCommandSecretRefsViaGateway({
    config: cfg,
    commandName: "doctor --fix",
    targetIds: getChannelsCommandSecretTargetIds(),
    mode: "read_only_status"
  });
  const tokenResolutionWarnings = [];
  const resolverAccountIds = [];
  let sawConfiguredUnavailableToken = false;
  for (const accountId of (0, _accountsCoskdHdZ.r)(resolvedConfig)) {
    let inspected;
    try {
      inspected = (0, _accountInspectC9xPCRmJ.t)({
        cfg: resolvedConfig,
        accountId
      });
    } catch (error) {
      tokenResolutionWarnings.push(`- Telegram account ${accountId}: failed to inspect bot token (${(0, _errorRuntime.formatErrorMessage)(error)}).`);
      continue;
    }
    if (inspected.tokenStatus === "configured_unavailable") {
      sawConfiguredUnavailableToken = true;
      tokenResolutionWarnings.push(`- Telegram account ${accountId}: failed to inspect bot token (configured but unavailable in this command path).`);
    }
    if (inspected.tokenSource === "none" ? "" : (0, _textRuntime.normalizeOptionalString)(inspected.token) ?? "") resolverAccountIds.push(accountId);
  }
  if (resolverAccountIds.length === 0) return {
    config: cfg,
    changes: [...tokenResolutionWarnings, sawConfiguredUnavailableToken ? "- Telegram allowFrom contains @username entries, but configured Telegram bot credentials are unavailable in this command path; cannot auto-resolve." : "- Telegram allowFrom contains @username entries, but no Telegram bot token is available in this command path; cannot auto-resolve."]
  };
  const resolveUserId = async (raw) => {
    const trimmed = (0, _textRuntime.normalizeOptionalString)(raw) ?? "";
    if (!trimmed) return null;
    const normalized = (0, _allowFromBSf89MjI.r)(trimmed);
    if (!normalized || normalized === "*") return null;
    if ((0, _allowFromBSf89MjI.t)(normalized) || /\s/.test(normalized)) return (0, _allowFromBSf89MjI.t)(normalized) ? normalized : null;
    const username = normalized.startsWith("@") ? normalized : `@${normalized}`;
    for (const accountId of resolverAccountIds) try {
      const account = (0, _accountsCoskdHdZ.s)({
        cfg: resolvedConfig,
        accountId
      });
      const token = account.token.trim();
      if (!token) continue;
      const id = await lookupTelegramChatId({
        token,
        chatId: username,
        network: account.config.network,
        signal: void 0
      });
      if (id) return id;
    } catch {}
    return null;
  };
  const next = structuredClone(cfg);
  const changes = [];
  const repairList = async (pathLabel, holder, key) => {
    const raw = holder[key];
    if (!Array.isArray(raw)) return;
    const out = [];
    const replaced = [];
    for (const entry of raw) {
      const normalized = (0, _allowFromBSf89MjI.r)(entry);
      if (!normalized) continue;
      if (normalized === "*" || (0, _allowFromBSf89MjI.t)(normalized)) {
        out.push(normalized);
        continue;
      }
      const resolved = await resolveUserId(String(entry));
      if (resolved) {
        out.push(resolved);
        replaced.push({
          from: (0, _textRuntime.normalizeOptionalString)(String(entry)) ?? "",
          to: resolved
        });
      } else out.push((0, _textRuntime.normalizeOptionalString)(String(entry)) ?? "");
    }
    const deduped = [];
    const seen = /* @__PURE__ */new Set();
    for (const entry of out) {
      const keyValue = (0, _textRuntime.normalizeOptionalString)(String(entry)) ?? "";
      if (!keyValue || seen.has(keyValue)) continue;
      seen.add(keyValue);
      deduped.push(entry);
    }
    holder[key] = deduped;
    for (const replacement of replaced.slice(0, 5)) changes.push(`- ${sanitizeForLog(pathLabel)}: resolved ${sanitizeForLog(replacement.from)} -> ${sanitizeForLog(replacement.to)}`);
    if (replaced.length > 5) changes.push(`- ${sanitizeForLog(pathLabel)}: resolved ${replaced.length - 5} more @username entries`);
  };
  for (const scope of collectTelegramAccountScopes(next)) for (const ref of collectTelegramAllowFromLists(scope.prefix, scope.account)) await repairList(ref.pathLabel, ref.holder, ref.key);
  if (changes.length === 0) return {
    config: cfg,
    changes: []
  };
  return {
    config: next,
    changes
  };
}
function hasConfiguredGroups(account, parent) {
  const groups = asObjectRecord(account.groups) ?? asObjectRecord(parent?.groups);
  return Boolean(groups) && Object.keys(groups ?? {}).length > 0;
}
function collectTelegramGroupPolicyWarnings(params) {
  if (!hasConfiguredGroups(params.account, params.parent)) {
    const effectiveDmPolicy = params.dmPolicy ?? "pairing";
    const dmSetupLine = effectiveDmPolicy === "pairing" ? "DMs use pairing mode, so new senders must start a chat and be approved before regular messages are accepted." : effectiveDmPolicy === "allowlist" ? `DMs use allowlist mode, so only sender IDs in ${params.prefix}.allowFrom are accepted.` : effectiveDmPolicy === "open" ? "DMs are open." : "DMs are disabled.";
    return [`- ${params.prefix}: Telegram is in first-time setup mode. ${dmSetupLine} Group messages stay blocked until you add allowed chats under ${params.prefix}.groups (and optional sender IDs under ${params.prefix}.groupAllowFrom), or set ${params.prefix}.groupPolicy to "open" if you want broad group access.`];
  }
  const rawGroupAllowFrom = params.account.groupAllowFrom ?? params.parent?.groupAllowFrom;
  if (hasAllowFromEntries((hasAllowFromEntries(rawGroupAllowFrom) ? rawGroupAllowFrom : void 0) ?? params.effectiveAllowFrom)) return [];
  return [`- ${params.prefix}.groupPolicy is "allowlist" but groupAllowFrom (and allowFrom) is empty — all group messages will be silently dropped. Add sender IDs to ${params.prefix}.groupAllowFrom or ${params.prefix}.allowFrom, or set ${params.prefix}.groupPolicy to "open".`];
}
function collectTelegramEmptyAllowlistExtraWarnings(params) {
  const account = params.account;
  const parent = params.parent;
  return params.channelName === "telegram" && (account.groupPolicy ?? parent?.groupPolicy ?? void 0) === "allowlist" ? collectTelegramGroupPolicyWarnings({
    account,
    dmPolicy: params.dmPolicy,
    effectiveAllowFrom: params.effectiveAllowFrom,
    parent,
    prefix: params.prefix
  }) : [];
}
const telegramDoctor = {
  legacyConfigRules: _setupContractG3mAkj.r,
  normalizeCompatibilityConfig: _setupContractG3mAkj.i,
  collectPreviewWarnings: ({ cfg, doctorFixCommand }) => collectTelegramInvalidAllowFromWarnings({
    hits: scanTelegramInvalidAllowFromEntries(cfg),
    doctorFixCommand
  }),
  repairConfig: async ({ cfg }) => await maybeRepairTelegramAllowFromUsernames(cfg),
  collectEmptyAllowlistExtraWarnings: collectTelegramEmptyAllowlistExtraWarnings,
  shouldSkipDefaultEmptyGroupAllowlistWarning: (params) => params.channelName === "telegram"
};
//#endregion
//#region extensions/telegram/src/shared.ts
const TELEGRAM_CHANNEL = "telegram";
function findTelegramTokenOwnerAccountId(params) {
  const normalizedAccountId = (0, _accountId.normalizeAccountId)(params.accountId);
  const tokenOwners = /* @__PURE__ */new Map();
  for (const id of (0, _accountsCoskdHdZ.r)(params.cfg)) {
    const account = (0, _accountInspectC9xPCRmJ.t)({
      cfg: params.cfg,
      accountId: id
    });
    const token = (account.token ?? "").trim();
    if (!token) continue;
    const ownerAccountId = tokenOwners.get(token);
    if (!ownerAccountId) {
      tokenOwners.set(token, account.accountId);
      continue;
    }
    if (account.accountId === normalizedAccountId) return ownerAccountId;
  }
  return null;
}
function formatDuplicateTelegramTokenReason(params) {
  return `Duplicate Telegram bot token: account "${params.accountId}" shares a token with account "${params.ownerAccountId}". Keep one owner account per bot token.`;
}
/**
* Returns true when the runtime token resolver (`resolveTelegramToken`) would
* block channel-level fallthrough for the given accountId.  This mirrors the
* guard in `token.ts` so that status-check functions (`isConfigured`,
* `unconfiguredReason`, `describeAccount`) stay consistent with the gateway
* runtime behaviour.
*
* The guard fires when:
*   1. The accountId is not the default account, AND
*   2. The config has an explicit `accounts` section with entries, AND
*   3. The accountId is not found in that `accounts` section.
*
* See: https://github.com/openclaw/openclaw/issues/53876
*/
function isBlockedByMultiBotGuard(cfg, accountId) {
  if ((0, _accountId.normalizeAccountId)(accountId) === _routing.DEFAULT_ACCOUNT_ID) return false;
  const accounts = cfg.channels?.telegram?.accounts;
  if (!(!!accounts && typeof accounts === "object" && !Array.isArray(accounts) && Object.keys(accounts).length > 0)) return false;
  return !(0, _accountCore.resolveNormalizedAccountEntry)(accounts, accountId, _accountId.normalizeAccountId);
}
const telegramConfigAdapter = exports.i = (0, _channelConfigHelpers.createScopedChannelConfigAdapter)({
  sectionKey: TELEGRAM_CHANNEL,
  listAccountIds: _accountsCoskdHdZ.r,
  resolveAccount: (0, _channelConfigHelpers.adaptScopedAccountAccessor)(_accountsCoskdHdZ.s),
  inspectAccount: (0, _channelConfigHelpers.adaptScopedAccountAccessor)(_accountInspectC9xPCRmJ.t),
  defaultAccountId: _accountsCoskdHdZ.o,
  clearBaseFields: [
  "botToken",
  "tokenFile",
  "name"],

  resolveAllowFrom: (account) => account.config.allowFrom,
  formatAllowFrom: (allowFrom) => (0, _allowFrom.formatAllowFromLowercase)({
    allowFrom,
    stripPrefixRe: /^(telegram|tg):/i
  }),
  resolveDefaultTo: (account) => account.config.defaultTo
});
function createTelegramPluginBase(params) {
  return {
    ...(0, _channelCore.createChannelPluginBase)({
      id: TELEGRAM_CHANNEL,
      meta: {
        ...(0, _channelPluginCommon.getChatChannelMeta)(TELEGRAM_CHANNEL),
        quickstartAllowFrom: true
      },
      setupWizard: params.setupWizard,
      capabilities: {
        chatTypes: [
        "direct",
        "group",
        "channel",
        "thread"],

        reactions: true,
        threads: true,
        media: true,
        polls: true,
        nativeCommands: true,
        blockStreaming: true
      },
      commands: {
        nativeCommandsAutoEnabled: true,
        nativeSkillsAutoEnabled: true,
        buildCommandsListChannelData: _commandUiCfr5pQwj.n,
        buildModelsProviderChannelData: _commandUiCfr5pQwj.a,
        buildModelsListChannelData: _commandUiCfr5pQwj.i,
        buildModelBrowseChannelData: _commandUiCfr5pQwj.r
      },
      doctor: telegramDoctor,
      reload: { configPrefixes: ["channels.telegram"] },
      configSchema: TelegramChannelConfigSchema,
      config: {
        ...telegramConfigAdapter,
        hasConfiguredState: ({ env }) => typeof env?.TELEGRAM_BOT_TOKEN === "string" && env.TELEGRAM_BOT_TOKEN.trim().length > 0,
        isConfigured: (account, cfg) => {
          if (isBlockedByMultiBotGuard(cfg, account.accountId)) return false;
          if (!(0, _accountInspectC9xPCRmJ.t)({
            cfg,
            accountId: account.accountId
          }).token?.trim()) return false;
          return !findTelegramTokenOwnerAccountId({
            cfg,
            accountId: account.accountId
          });
        },
        unconfiguredReason: (account, cfg) => {
          if (isBlockedByMultiBotGuard(cfg, account.accountId)) return `not configured: unknown accountId "${account.accountId}" in multi-bot setup`;
          const inspected = (0, _accountInspectC9xPCRmJ.t)({
            cfg,
            accountId: account.accountId
          });
          if (!inspected.token?.trim()) {
            if (inspected.tokenStatus === "configured_unavailable") return `not configured: token ${inspected.tokenSource} is configured but unavailable`;
            return "not configured";
          }
          const ownerAccountId = findTelegramTokenOwnerAccountId({
            cfg,
            accountId: account.accountId
          });
          if (!ownerAccountId) return "not configured";
          return formatDuplicateTelegramTokenReason({
            accountId: account.accountId,
            ownerAccountId
          });
        },
        describeAccount: (account, cfg) => {
          if (isBlockedByMultiBotGuard(cfg, account.accountId)) return {
            accountId: account.accountId,
            name: account.name,
            enabled: account.enabled,
            configured: false,
            tokenSource: "none"
          };
          const inspected = (0, _accountInspectC9xPCRmJ.t)({
            cfg,
            accountId: account.accountId
          });
          return {
            accountId: account.accountId,
            name: account.name,
            enabled: account.enabled,
            configured: !!inspected.token?.trim() && !findTelegramTokenOwnerAccountId({
              cfg,
              accountId: account.accountId
            }),
            tokenSource: inspected.tokenSource
          };
        }
      },
      setup: {
        ...params.setup,
        namedAccountPromotionKeys: _setupContractG3mAkj.t,
        singleAccountKeysToMove: _setupContractG3mAkj.n
      }
    }),
    secrets: {
      secretTargetRegistryEntries: _secretContractBfJsMxR.r,
      collectRuntimeConfigAssignments: _secretContractBfJsMxR.n
    }
  };
}
//#endregion /* v9-ba99e74afd9e7c72 */
