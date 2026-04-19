"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = shouldSuppressTelegramExecApprovalForwardingFallback;exports.c = collectTelegramUnmentionedGroupIds;exports.i = buildTelegramExecApprovalPendingPayload;exports.n = resetTelegramProbeFetcherCacheForTests;exports.o = void 0;exports.r = monitorTelegramProvider;exports.s = auditTelegramGroupMembership;exports.t = probeTelegram;var _accountsCoskdHdZ = require("./accounts-CoskdHdZ.js");
var _fetchB2K4ajFP = require("./fetch-B2K4ajFP.js");
var _inlineButtonsZDRhkQx = require("./inline-buttons-zDRhkQx3.js");
var _execApprovalsGJ9TaLpO = require("./exec-approvals-GJ9TaLpO.js");
var _formatDkmJkZf = require("./format-DkmJkZf4.js");
var _allowedUpdatesDXWGogJp = require("./allowed-updates-DXWGogJp.js");
var _configRuntime = require("openclaw/plugin-sdk/config-runtime");
var _routing = require("openclaw/plugin-sdk/routing");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
var _runtimeEnv = require("openclaw/plugin-sdk/runtime-env");
var _errorRuntime = require("openclaw/plugin-sdk/error-runtime");
var _approvalHandlerAdapterRuntime = require("openclaw/plugin-sdk/approval-handler-adapter-runtime");
var _channelActions = require("openclaw/plugin-sdk/channel-actions");
var _toolSend = require("openclaw/plugin-sdk/tool-send");
var _typebox = require("@sinclair/typebox");
var _approvalReplyRuntime = require("openclaw/plugin-sdk/approval-reply-runtime");
var _channelRuntimeContext = require("openclaw/plugin-sdk/channel-runtime-context");
var _ssrfRuntime = require("openclaw/plugin-sdk/ssrf-runtime");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region extensions/telegram/src/audit.ts
function collectTelegramUnmentionedGroupIds(groups) {
  if (!groups || typeof groups !== "object") return {
    groupIds: [],
    unresolvedGroups: 0,
    hasWildcardUnmentionedGroups: false
  };
  const hasWildcardUnmentionedGroups = groups["*"]?.requireMention === false && groups["*"]?.enabled !== false;
  const groupIds = [];
  let unresolvedGroups = 0;
  for (const [key, value] of Object.entries(groups)) {
    if (key === "*") continue;
    if (!value || typeof value !== "object") continue;
    if (value.enabled === false) continue;
    if (value.requireMention !== false) continue;
    const id = (0, _textRuntime.normalizeOptionalString)(key) ?? "";
    if (!id) continue;
    if (/^-?\d+$/.test(id)) groupIds.push(id);else
    unresolvedGroups += 1;
  }
  groupIds.sort((a, b) => a.localeCompare(b));
  return {
    groupIds,
    unresolvedGroups,
    hasWildcardUnmentionedGroups
  };
}
let auditMembershipRuntimePromise = null;
function loadAuditMembershipRuntime() {
  auditMembershipRuntimePromise ??= Promise.resolve().then(() => jitiImport("./audit-membership-runtime-DKXQfiQr.js").then((m) => _interopRequireWildcard(m)));
  return auditMembershipRuntimePromise;
}
async function auditTelegramGroupMembership(params) {
  const started = Date.now();
  const token = (0, _textRuntime.normalizeOptionalString)(params.token) ?? "";
  if (!token || params.groupIds.length === 0) return {
    ok: true,
    checkedGroups: 0,
    unresolvedGroups: 0,
    hasWildcardUnmentionedGroups: false,
    groups: [],
    elapsedMs: Date.now() - started
  };
  const { auditTelegramGroupMembershipImpl } = await loadAuditMembershipRuntime();
  return {
    ...(await auditTelegramGroupMembershipImpl({
      ...params,
      token
    })),
    elapsedMs: Date.now() - started
  };
}
//#endregion
//#region extensions/telegram/src/message-tool-schema.ts
function createTelegramPollExtraToolSchemas() {
  return {
    pollDurationSeconds: _typebox.Type.Optional(_typebox.Type.Number()),
    pollAnonymous: _typebox.Type.Optional(_typebox.Type.Boolean()),
    pollPublic: _typebox.Type.Optional(_typebox.Type.Boolean())
  };
}
//#endregion
//#region extensions/telegram/src/channel-actions.ts
let telegramActionRuntimePromise = null;
async function loadTelegramActionRuntime() {
  telegramActionRuntimePromise ??= Promise.resolve().then(() => jitiImport("./action-runtime-yOxwsViu.js").then((m) => _interopRequireWildcard(m)));
  return await telegramActionRuntimePromise;
}
const telegramMessageActionRuntime = { handleTelegramAction: async (...args) => {
    const { handleTelegramAction } = await loadTelegramActionRuntime();
    return await handleTelegramAction(...args);
  } };
const TELEGRAM_MESSAGE_ACTION_MAP = {
  delete: "deleteMessage",
  edit: "editMessage",
  poll: "poll",
  react: "react",
  send: "sendMessage",
  sticker: "sendSticker",
  "sticker-search": "searchSticker",
  "topic-create": "createForumTopic",
  "topic-edit": "editForumTopic"
};
function resolveTelegramMessageActionName(action) {
  return TELEGRAM_MESSAGE_ACTION_MAP[action];
}
function resolveTelegramActionDiscovery(cfg) {
  const accounts = (0, _channelActions.listTokenSourcedAccounts)((0, _accountsCoskdHdZ.n)(cfg));
  if (accounts.length === 0) return null;
  const unionGate = (0, _channelActions.createUnionActionGate)(accounts, (account) => (0, _accountsCoskdHdZ.t)({
    cfg,
    accountId: account.accountId
  }));
  return {
    isEnabled: (key, defaultValue = true) => unionGate(key, defaultValue),
    pollEnabled: accounts.some((account) => {
      return (0, _accountsCoskdHdZ.u)((0, _accountsCoskdHdZ.t)({
        cfg,
        accountId: account.accountId
      })).enabled;
    }),
    buttonsEnabled: accounts.some((account) => (0, _inlineButtonsZDRhkQx.t)({
      cfg,
      accountId: account.accountId
    }))
  };
}
function resolveScopedTelegramActionDiscovery(params) {
  if (!params.accountId) return resolveTelegramActionDiscovery(params.cfg);
  const account = (0, _accountsCoskdHdZ.s)({
    cfg: params.cfg,
    accountId: params.accountId
  });
  if (!account.enabled || account.tokenSource === "none") return null;
  const gate = (0, _accountsCoskdHdZ.t)({
    cfg: params.cfg,
    accountId: account.accountId
  });
  return {
    isEnabled: (key, defaultValue = true) => gate(key, defaultValue),
    pollEnabled: (0, _accountsCoskdHdZ.u)(gate).enabled,
    buttonsEnabled: (0, _inlineButtonsZDRhkQx.t)({
      cfg: params.cfg,
      accountId: account.accountId
    })
  };
}
function describeTelegramMessageTool({ cfg, accountId }) {
  const discovery = resolveScopedTelegramActionDiscovery({
    cfg,
    accountId
  });
  if (!discovery) return {
    actions: [],
    capabilities: [],
    schema: null
  };
  const actions = new Set(["send"]);
  if (discovery.pollEnabled) actions.add("poll");
  if (discovery.isEnabled("reactions")) actions.add("react");
  if (discovery.isEnabled("deleteMessage")) actions.add("delete");
  if (discovery.isEnabled("editMessage")) actions.add("edit");
  if (discovery.isEnabled("sticker", false)) {
    actions.add("sticker");
    actions.add("sticker-search");
  }
  if (discovery.isEnabled("createForumTopic")) actions.add("topic-create");
  if (discovery.isEnabled("editForumTopic")) actions.add("topic-edit");
  const schema = [];
  if (discovery.buttonsEnabled) schema.push({ properties: { buttons: (0, _channelActions.createMessageToolButtonsSchema)() } });
  if (discovery.pollEnabled) schema.push({
    properties: createTelegramPollExtraToolSchemas(),
    visibility: "all-configured"
  });
  return {
    actions: Array.from(actions),
    capabilities: discovery.buttonsEnabled ? ["interactive", "buttons"] : [],
    schema
  };
}
const telegramMessageActions = exports.o = {
  describeMessageTool: describeTelegramMessageTool,
  resolveCliActionRequest: ({ action, args }) => {
    if (action !== "thread-create") return {
      action,
      args
    };
    const { threadName, ...rest } = args;
    return {
      action: "topic-create",
      args: {
        ...rest,
        name: (0, _textRuntime.readStringValue)(threadName)
      }
    };
  },
  extractToolSend: ({ args }) => {
    return (0, _toolSend.extractToolSend)(args, "sendMessage");
  },
  handleAction: async ({ action, params, cfg, accountId, mediaLocalRoots, toolContext }) => {
    const telegramAction = resolveTelegramMessageActionName(action);
    if (!telegramAction) throw new Error(`Unsupported Telegram action: ${action}`);
    return await telegramMessageActionRuntime.handleTelegramAction({
      ...params,
      action: telegramAction,
      accountId: accountId ?? void 0,
      ...(action === "react" ? { messageId: (0, _channelActions.resolveReactionMessageId)({
          args: params,
          toolContext
        }) } : {})
    }, cfg, { mediaLocalRoots });
  }
};
//#endregion
//#region extensions/telegram/src/exec-approval-forwarding.ts
function shouldSuppressTelegramExecApprovalForwardingFallback(params) {
  if (((0, _routing.normalizeMessageChannel)(params.target.channel) ?? params.target.channel) !== "telegram") return false;
  if ((0, _routing.normalizeMessageChannel)(params.request.request.turnSourceChannel ?? "") !== "telegram") return false;
  const accountId = params.target.accountId?.trim() || params.request.request.turnSourceAccountId?.trim();
  return (0, _execApprovalsGJ9TaLpO.i)({
    cfg: params.cfg,
    accountId
  });
}
function buildTelegramExecApprovalPendingPayload(params) {
  return (0, _approvalReplyRuntime.buildExecApprovalPendingReplyPayload)({
    approvalId: params.request.id,
    approvalSlug: params.request.id.slice(0, 8),
    approvalCommandId: params.request.id,
    command: (0, _approvalReplyRuntime.resolveExecApprovalCommandDisplay)(params.request.request).commandText,
    cwd: params.request.request.cwd ?? void 0,
    host: params.request.request.host === "node" ? "node" : "gateway",
    nodeId: params.request.request.nodeId ?? void 0,
    allowedDecisions: (0, _approvalReplyRuntime.resolveExecApprovalRequestAllowedDecisions)(params.request.request),
    expiresAtMs: params.request.expiresAtMs,
    nowMs: params.nowMs
  });
}
//#endregion
//#region extensions/telegram/src/monitor.ts
function createTelegramRunnerOptions(cfg) {
  return {
    sink: { concurrency: (0, _configRuntime.resolveAgentMaxConcurrent)(cfg) },
    runner: {
      fetch: {
        timeout: 30,
        allowed_updates: (0, _allowedUpdatesDXWGogJp.t)()
      },
      silent: true,
      maxRetryTime: 3600 * 1e3,
      retryInterval: "exponential"
    }
  };
}
function normalizePersistedUpdateId(value) {
  if (value === null) return null;
  if (!Number.isSafeInteger(value) || value < 0) return null;
  return value;
}
/** Check if error is a Grammy HttpError (used to scope unhandled rejection handling) */
const isGrammyHttpError = (err) => {
  if (!err || typeof err !== "object") return false;
  return err.name === "HttpError";
};
let telegramMonitorPollingRuntimePromise;
async function loadTelegramMonitorPollingRuntime() {
  telegramMonitorPollingRuntimePromise ??= Promise.resolve().then(() => jitiImport("./monitor-polling.runtime-eDxUeolT.js").then((m) => _interopRequireWildcard(m)));
  return await telegramMonitorPollingRuntimePromise;
}
let telegramMonitorWebhookRuntimePromise;
async function loadTelegramMonitorWebhookRuntime() {
  telegramMonitorWebhookRuntimePromise ??= Promise.resolve().then(() => jitiImport("./monitor-webhook.runtime-37ohYcS9.js").then((m) => _interopRequireWildcard(m)));
  return await telegramMonitorWebhookRuntimePromise;
}
async function monitorTelegramProvider(opts = {}) {
  const log = opts.runtime?.error ?? console.error;
  let pollingSession;
  const unregisterHandler = (0, _runtimeEnv.registerUnhandledRejectionHandler)((err) => {
    const isNetworkError = (0, _formatDkmJkZf.s)(err, { context: "polling" });
    const isTelegramPollingError = (0, _formatDkmJkZf.u)(err);
    if (isGrammyHttpError(err) && isNetworkError && isTelegramPollingError) {
      log(`[telegram] Suppressed network error: ${(0, _ssrfRuntime.formatErrorMessage)(err)}`);
      return true;
    }
    const activeRunner = pollingSession?.activeRunner;
    if (isNetworkError && isTelegramPollingError && activeRunner && activeRunner.isRunning()) {
      pollingSession?.markForceRestarted();
      pollingSession?.markTransportDirty();
      pollingSession?.abortActiveFetch();
      activeRunner.stop().catch(() => {});
      log("[telegram][diag] marking transport dirty after polling network failure");
      log(`[telegram] Restarting polling after unhandled network error: ${(0, _ssrfRuntime.formatErrorMessage)(err)}`);
      return true;
    }
    return false;
  });
  try {
    const cfg = opts.config ?? (0, _configRuntime.loadConfig)();
    const account = (0, _accountsCoskdHdZ.s)({
      cfg,
      accountId: opts.accountId
    });
    const token = opts.token?.trim() || account.token;
    if (!token) throw new Error(`Telegram bot token missing for account "${account.accountId}" (set channels.telegram.accounts.${account.accountId}.botToken/tokenFile or TELEGRAM_BOT_TOKEN for default).`);
    const proxyFetch = opts.proxyFetch ?? (account.config.proxy ? (0, _fetchB2K4ajFP.a)(account.config.proxy) : void 0);
    if (opts.useWebhook) {
      const { startTelegramWebhook } = await loadTelegramMonitorWebhookRuntime();
      if ((0, _execApprovalsGJ9TaLpO.a)({
        cfg,
        accountId: account.accountId
      })) (0, _channelRuntimeContext.registerChannelRuntimeContext)({
        channelRuntime: opts.channelRuntime,
        channelId: "telegram",
        accountId: account.accountId,
        capability: _approvalHandlerAdapterRuntime.CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY,
        context: { token },
        abortSignal: opts.abortSignal
      });
      await startTelegramWebhook({
        token,
        accountId: account.accountId,
        config: cfg,
        path: opts.webhookPath,
        port: opts.webhookPort,
        secret: opts.webhookSecret ?? account.config.webhookSecret,
        host: opts.webhookHost ?? account.config.webhookHost,
        runtime: opts.runtime,
        fetch: proxyFetch,
        abortSignal: opts.abortSignal,
        publicUrl: opts.webhookUrl,
        webhookCertPath: opts.webhookCertPath
      });
      await (0, _runtimeEnv.waitForAbortSignal)(opts.abortSignal);
      return;
    }
    const { TelegramPollingSession, readTelegramUpdateOffset, writeTelegramUpdateOffset } = await loadTelegramMonitorPollingRuntime();
    if ((0, _execApprovalsGJ9TaLpO.a)({
      cfg,
      accountId: account.accountId
    })) (0, _channelRuntimeContext.registerChannelRuntimeContext)({
      channelRuntime: opts.channelRuntime,
      channelId: "telegram",
      accountId: account.accountId,
      capability: _approvalHandlerAdapterRuntime.CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY,
      context: { token },
      abortSignal: opts.abortSignal
    });
    const persistedOffsetRaw = await readTelegramUpdateOffset({
      accountId: account.accountId,
      botToken: token
    });
    let lastUpdateId = normalizePersistedUpdateId(persistedOffsetRaw);
    if (persistedOffsetRaw !== null && lastUpdateId === null) log(`[telegram] Ignoring invalid persisted update offset (${String(persistedOffsetRaw)}); starting without offset confirmation.`);
    const persistUpdateId = async (updateId) => {
      const normalizedUpdateId = normalizePersistedUpdateId(updateId);
      if (normalizedUpdateId === null) {
        log(`[telegram] Ignoring invalid update_id value: ${String(updateId)}`);
        return;
      }
      if (lastUpdateId !== null && normalizedUpdateId <= lastUpdateId) return;
      lastUpdateId = normalizedUpdateId;
      try {
        await writeTelegramUpdateOffset({
          accountId: account.accountId,
          updateId: normalizedUpdateId,
          botToken: token
        });
      } catch (err) {
        (opts.runtime?.error ?? console.error)(`telegram: failed to persist update offset: ${String(err)}`);
      }
    };
    const createTelegramTransportForPolling = () => (0, _fetchB2K4ajFP.r)(proxyFetch, { network: account.config.network });
    const telegramTransport = createTelegramTransportForPolling();
    pollingSession = new TelegramPollingSession({
      token,
      config: cfg,
      accountId: account.accountId,
      runtime: opts.runtime,
      proxyFetch,
      abortSignal: opts.abortSignal,
      runnerOptions: createTelegramRunnerOptions(cfg),
      getLastUpdateId: () => lastUpdateId,
      persistUpdateId,
      log,
      telegramTransport,
      createTelegramTransport: createTelegramTransportForPolling
    });
    await pollingSession.runUntilAbort();
  } finally {
    unregisterHandler();
  }
}
//#endregion
//#region extensions/telegram/src/probe.ts
const probeFetcherCache = /* @__PURE__ */new Map();
const MAX_PROBE_FETCHER_CACHE_SIZE = 64;
function resetTelegramProbeFetcherCacheForTests() {
  probeFetcherCache.clear();
}
function resolveProbeOptions(proxyOrOptions) {
  if (!proxyOrOptions) return;
  if (typeof proxyOrOptions === "string") return { proxyUrl: proxyOrOptions };
  return proxyOrOptions;
}
function shouldUseProbeFetcherCache() {
  return !process.env.VITEST && true;
}
function buildProbeFetcherCacheKey(token, options) {
  const cacheIdentity = options?.accountId?.trim() || token;
  const cacheIdentityKind = options?.accountId?.trim() ? "account" : "token";
  const proxyKey = options?.proxyUrl?.trim() ?? "";
  const autoSelectFamily = options?.network?.autoSelectFamily;
  return `${cacheIdentityKind}:${cacheIdentity}::${proxyKey}::${typeof autoSelectFamily === "boolean" ? String(autoSelectFamily) : "default"}::${options?.network?.dnsResultOrder ?? "default"}::${options?.apiRoot?.trim() ?? ""}`;
}
function setCachedProbeFetcher(cacheKey, fetcher) {
  probeFetcherCache.set(cacheKey, fetcher);
  if (probeFetcherCache.size > MAX_PROBE_FETCHER_CACHE_SIZE) {
    const oldestKey = probeFetcherCache.keys().next().value;
    if (oldestKey !== void 0) probeFetcherCache.delete(oldestKey);
  }
  return fetcher;
}
function resolveProbeFetcher(token, options) {
  const cacheKey = shouldUseProbeFetcherCache() ? buildProbeFetcherCacheKey(token, options) : null;
  if (cacheKey) {
    const cachedFetcher = probeFetcherCache.get(cacheKey);
    if (cachedFetcher) return cachedFetcher;
  }
  const proxyUrl = options?.proxyUrl?.trim();
  const resolved = (0, _fetchB2K4ajFP.n)(proxyUrl ? (0, _fetchB2K4ajFP.a)(proxyUrl) : void 0, { network: options?.network });
  if (cacheKey) return setCachedProbeFetcher(cacheKey, resolved);
  return resolved;
}
async function probeTelegram(token, timeoutMs, proxyOrOptions) {
  const started = Date.now();
  const timeoutBudgetMs = Math.max(1, Math.floor(timeoutMs));
  const deadlineMs = started + timeoutBudgetMs;
  const options = resolveProbeOptions(proxyOrOptions);
  const fetcher = resolveProbeFetcher(token, options);
  const base = `${(0, _fetchB2K4ajFP.t)(options?.apiRoot)}/bot${token}`;
  const retryDelayMs = Math.max(50, Math.min(1e3, Math.floor(timeoutBudgetMs / 5)));
  const resolveRemainingBudgetMs = () => Math.max(0, deadlineMs - Date.now());
  const result = {
    ok: false,
    status: null,
    error: null,
    elapsedMs: 0
  };
  try {
    let meRes = null;
    let fetchError = null;
    for (let i = 0; i < 3; i++) {
      const remainingBudgetMs = resolveRemainingBudgetMs();
      if (remainingBudgetMs <= 0) break;
      try {
        meRes = await (0, _textRuntime.fetchWithTimeout)(`${base}/getMe`, {}, Math.max(1, Math.min(timeoutBudgetMs, remainingBudgetMs)), fetcher);
        break;
      } catch (err) {
        fetchError = err;
        if (i < 2) {
          const remainingAfterAttemptMs = resolveRemainingBudgetMs();
          if (remainingAfterAttemptMs <= 0) break;
          const delayMs = Math.min(retryDelayMs, remainingAfterAttemptMs);
          if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
    if (!meRes) throw fetchError ?? /* @__PURE__ */new Error(`probe timed out after ${timeoutBudgetMs}ms`);
    const meJson = await meRes.json();
    if (!meRes.ok || !meJson?.ok) {
      result.status = meRes.status;
      result.error = meJson?.description ?? `getMe failed (${meRes.status})`;
      return {
        ...result,
        elapsedMs: Date.now() - started
      };
    }
    result.bot = {
      id: meJson.result?.id ?? null,
      username: meJson.result?.username ?? null,
      canJoinGroups: typeof meJson.result?.can_join_groups === "boolean" ? meJson.result?.can_join_groups : null,
      canReadAllGroupMessages: typeof meJson.result?.can_read_all_group_messages === "boolean" ? meJson.result?.can_read_all_group_messages : null,
      supportsInlineQueries: typeof meJson.result?.supports_inline_queries === "boolean" ? meJson.result?.supports_inline_queries : null
    };
    try {
      const webhookRemainingBudgetMs = resolveRemainingBudgetMs();
      if (webhookRemainingBudgetMs > 0) {
        const webhookRes = await (0, _textRuntime.fetchWithTimeout)(`${base}/getWebhookInfo`, {}, Math.max(1, Math.min(timeoutBudgetMs, webhookRemainingBudgetMs)), fetcher);
        const webhookJson = await webhookRes.json();
        if (webhookRes.ok && webhookJson?.ok) result.webhook = {
          url: webhookJson.result?.url ?? null,
          hasCustomCert: webhookJson.result?.has_custom_certificate ?? null
        };
      }
    } catch {}
    result.ok = true;
    result.status = null;
    result.error = null;
    result.elapsedMs = Date.now() - started;
    return result;
  } catch (err) {
    return {
      ...result,
      status: err instanceof Response ? err.status : result.status,
      error: (0, _errorRuntime.formatErrorMessage)(err),
      elapsedMs: Date.now() - started
    };
  }
}
//#endregion /* v9-0e388cd934ffd226 */
