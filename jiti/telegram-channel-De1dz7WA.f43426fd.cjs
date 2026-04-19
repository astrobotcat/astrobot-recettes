"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = void 0;exports.c = resolveTelegramGroupRequireMention;exports.i = sendTelegramPayloadMessages;exports.l = resolveTelegramGroupToolPolicy;exports.n = collectTelegramStatusIssues;exports.o = looksLikeTelegramTargetId;exports.r = void 0;exports.s = normalizeTelegramMessagingTarget;exports.t = void 0;exports.u = resolveTelegramAutoThreadId;var _accountsCoskdHdZ = require("./accounts-CoskdHdZ.js");
var _outboundParamsDPqRaEDE = require("./outbound-params-DPqRaEDE.js");
var _sharedB0aXBwuj = require("./shared-B0aXBwuj.js");
var _inlineButtonsZDRhkQx = require("./inline-buttons-zDRhkQx3.js");
var _execApprovalsGJ9TaLpO = require("./exec-approvals-GJ9TaLpO.js");
var _approvalNative9xNAH8CY = require("./approval-native-9xNAH8CY.js");
var _probeD65JnxXS = require("./probe-D65JnxXS.js");
var _formatDkmJkZf = require("./format-DkmJkZf4.js");
var _directoryConfigDmz17SwM = require("./directory-config-Dmz17SwM.js");
var _buttonTypesZVei7zU = require("./button-types-Z-Vei7zU.js");
var _reactionLevelDTOtJXm = require("./reaction-level-DTOtJXm8.js");
var _runtimeCd7gYJGW = require("./runtime-Cd7gYJGW.js");
var _securityAuditI7LTWqSs = require("./security-audit-I7LTWqSs.js");
var _topicConversation10u__tpo = require("./topic-conversation-10u__tpo.js");
var _sessionConversation9AmzjtGp = require("./session-conversation-9AmzjtGp.js");
var _channelSetupBei3ZTCY = require("./channel.setup-Bei3ZTCY.js");
var _threadBindingsComZmmvs = require("./thread-bindings-ComZmmvs.js");
var _channelCore = require("openclaw/plugin-sdk/channel-core");
var _routing = require("openclaw/plugin-sdk/routing");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
var _accountId2 = require("openclaw/plugin-sdk/account-id");
var _allowlistConfigEdit = require("openclaw/plugin-sdk/allowlist-config-edit");
var _channelPairing = require("openclaw/plugin-sdk/channel-pairing");
var _channelPolicy = require("openclaw/plugin-sdk/channel-policy");
var _channelSendResult = require("openclaw/plugin-sdk/channel-send-result");
var _channelStatus = require("openclaw/plugin-sdk/channel-status");
var _directoryRuntime = require("openclaw/plugin-sdk/directory-runtime");
var _errorRuntime = require("openclaw/plugin-sdk/error-runtime");
var _outboundRuntime = require("openclaw/plugin-sdk/outbound-runtime");
var _statusHelpers = require("openclaw/plugin-sdk/status-helpers");
var _interactiveRuntime = require("openclaw/plugin-sdk/interactive-runtime");
var _replyPayload = require("openclaw/plugin-sdk/reply-payload");
var _replyRuntime = require("openclaw/plugin-sdk/reply-runtime");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region extensions/telegram/src/action-threading.ts
function resolveTelegramAutoThreadId(params) {
  const context = params.toolContext;
  if (!context?.currentThreadTs || !context.currentChannelId) return;
  const parsedTo = (0, _outboundParamsDPqRaEDE.s)(params.to);
  if (parsedTo.messageThreadId != null) return;
  const parsedChannel = (0, _outboundParamsDPqRaEDE.s)(context.currentChannelId);
  if ((0, _textRuntime.normalizeLowercaseStringOrEmpty)(parsedTo.chatId) !== (0, _textRuntime.normalizeLowercaseStringOrEmpty)(parsedChannel.chatId)) return;
  return context.currentThreadTs;
}
//#endregion
//#region extensions/telegram/src/group-policy.ts
function parseTelegramGroupId(value) {
  const raw = value?.trim() ?? "";
  if (!raw) return {
    chatId: void 0,
    topicId: void 0
  };
  const parts = raw.split(":").filter(Boolean);
  if (parts.length >= 3 && parts[1] === "topic" && /^-?\d+$/.test(parts[0]) && /^\d+$/.test(parts[2])) return {
    chatId: parts[0],
    topicId: parts[2]
  };
  if (parts.length >= 2 && /^-?\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) return {
    chatId: parts[0],
    topicId: parts[1]
  };
  return {
    chatId: raw,
    topicId: void 0
  };
}
function resolveTelegramRequireMention(params) {
  const { cfg, chatId, topicId, accountId } = params;
  if (!chatId) return;
  const scopedGroups = (accountId ? cfg.channels?.telegram?.accounts?.[accountId]?.groups : void 0) ?? cfg.channels?.telegram?.groups;
  const groupConfig = scopedGroups?.[chatId];
  const groupDefault = scopedGroups?.["*"];
  const topicConfig = topicId && groupConfig?.topics ? groupConfig.topics[topicId] : void 0;
  const defaultTopicConfig = topicId && groupDefault?.topics ? groupDefault.topics[topicId] : void 0;
  if (typeof topicConfig?.requireMention === "boolean") return topicConfig.requireMention;
  if (typeof defaultTopicConfig?.requireMention === "boolean") return defaultTopicConfig.requireMention;
  if (typeof groupConfig?.requireMention === "boolean") return groupConfig.requireMention;
  if (typeof groupDefault?.requireMention === "boolean") return groupDefault.requireMention;
}
function resolveTelegramGroupRequireMention(params) {
  const { chatId, topicId } = parseTelegramGroupId(params.groupId);
  const requireMention = resolveTelegramRequireMention({
    cfg: params.cfg,
    chatId,
    topicId,
    accountId: params.accountId
  });
  if (typeof requireMention === "boolean") return requireMention;
  return (0, _channelPolicy.resolveChannelGroupRequireMention)({
    cfg: params.cfg,
    channel: "telegram",
    groupId: chatId ?? params.groupId,
    accountId: params.accountId
  });
}
function resolveTelegramGroupToolPolicy(params) {
  const { chatId } = parseTelegramGroupId(params.groupId);
  return (0, _channelPolicy.resolveChannelGroupToolsPolicy)({
    cfg: params.cfg,
    channel: "telegram",
    groupId: chatId ?? params.groupId,
    accountId: params.accountId,
    senderId: params.senderId,
    senderName: params.senderName,
    senderUsername: params.senderUsername,
    senderE164: params.senderE164
  });
}
//#endregion
//#region extensions/telegram/src/normalize.ts
const TELEGRAM_PREFIX_RE = /^(telegram|tg):/i;
function normalizeTelegramTargetBody(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;
  const prefixStripped = trimmed.replace(TELEGRAM_PREFIX_RE, "").trim();
  if (!prefixStripped) return;
  const parsed = (0, _outboundParamsDPqRaEDE.s)(trimmed);
  const normalizedChatId = (0, _outboundParamsDPqRaEDE.o)(parsed.chatId);
  if (!normalizedChatId) return;
  const keepLegacyGroupPrefix = /^group:/i.test(prefixStripped);
  const hasTopicSuffix = /:topic:\d+$/i.test(prefixStripped);
  const chatSegment = keepLegacyGroupPrefix ? `group:${normalizedChatId}` : normalizedChatId;
  if (parsed.messageThreadId == null) return chatSegment;
  return `${chatSegment}${hasTopicSuffix ? `:topic:${parsed.messageThreadId}` : `:${parsed.messageThreadId}`}`;
}
function normalizeTelegramMessagingTarget(raw) {
  const normalizedBody = normalizeTelegramTargetBody(raw);
  if (!normalizedBody) return;
  return (0, _textRuntime.normalizeLowercaseStringOrEmpty)(`telegram:${normalizedBody}`);
}
function looksLikeTelegramTargetId(raw) {
  return normalizeTelegramTargetBody(raw) !== void 0;
}
//#endregion
//#region extensions/telegram/src/outbound-adapter.ts
const TELEGRAM_TEXT_CHUNK_LIMIT = exports.r = 4e3;
let telegramSendModulePromise$1;
async function loadTelegramSendModule$1() {
  telegramSendModulePromise$1 ??= Promise.resolve().then(() => jitiImport("./send-DlzbQJQs.js").then((m) => _interopRequireWildcard(m))).then((n) => n.p);
  return await telegramSendModulePromise$1;
}
async function resolveTelegramSendContext(params) {
  return {
    send: (0, _outboundRuntime.resolveOutboundSendDep)(params.deps, "telegram") ?? (await loadTelegramSendModule$1()).sendMessageTelegram,
    baseOpts: {
      verbose: false,
      textMode: "html",
      cfg: params.cfg,
      messageThreadId: (0, _outboundParamsDPqRaEDE.r)(params.threadId),
      replyToMessageId: (0, _outboundParamsDPqRaEDE.n)(params.replyToId),
      accountId: params.accountId ?? void 0,
      gatewayClientScopes: params.gatewayClientScopes
    }
  };
}
async function sendTelegramPayloadMessages(params) {
  const telegramData = params.payload.channelData?.telegram;
  const quoteText = typeof telegramData?.quoteText === "string" ? telegramData.quoteText : void 0;
  const text = (0, _interactiveRuntime.resolveInteractiveTextFallback)({
    text: params.payload.text,
    interactive: params.payload.interactive
  }) ?? "";
  const mediaUrls = (0, _replyPayload.resolvePayloadMediaUrls)(params.payload);
  const buttons = (0, _buttonTypesZVei7zU.t)({
    buttons: telegramData?.buttons,
    interactive: params.payload.interactive
  });
  const payloadOpts = {
    ...params.baseOpts,
    quoteText
  };
  return await (0, _replyPayload.sendPayloadMediaSequenceOrFallback)({
    text,
    mediaUrls,
    fallbackResult: {
      messageId: "unknown",
      chatId: params.to
    },
    sendNoMedia: async () => await params.send(params.to, text, {
      ...payloadOpts,
      buttons
    }),
    send: async ({ text, mediaUrl, isFirst }) => await params.send(params.to, text, {
      ...payloadOpts,
      mediaUrl,
      ...(isFirst ? { buttons } : {})
    })
  });
}
const telegramOutbound = exports.a = {
  deliveryMode: "direct",
  chunker: _formatDkmJkZf.r,
  chunkerMode: "markdown",
  textChunkLimit: TELEGRAM_TEXT_CHUNK_LIMIT,
  sanitizeText: ({ text }) => (0, _outboundRuntime.sanitizeForPlainText)(text),
  shouldSkipPlainTextSanitization: ({ payload }) => Boolean(payload.channelData),
  resolveEffectiveTextChunkLimit: ({ fallbackLimit }) => typeof fallbackLimit === "number" ? Math.min(fallbackLimit, 4096) : 4096,
  ...(0, _channelSendResult.createAttachedChannelResultAdapter)({
    channel: "telegram",
    sendText: async ({ cfg, to, text, accountId, deps, replyToId, threadId, gatewayClientScopes }) => {
      const { send, baseOpts } = await resolveTelegramSendContext({
        cfg,
        deps,
        accountId,
        replyToId,
        threadId,
        gatewayClientScopes
      });
      return await send(to, text, { ...baseOpts });
    },
    sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, mediaReadFile, accountId, deps, replyToId, threadId, forceDocument, gatewayClientScopes }) => {
      const { send, baseOpts } = await resolveTelegramSendContext({
        cfg,
        deps,
        accountId,
        replyToId,
        threadId,
        gatewayClientScopes
      });
      return await send(to, text, {
        ...baseOpts,
        mediaUrl,
        mediaLocalRoots,
        mediaReadFile,
        forceDocument: forceDocument ?? false
      });
    }
  }),
  sendPayload: async ({ cfg, to, payload, mediaLocalRoots, mediaReadFile, accountId, deps, replyToId, threadId, forceDocument, gatewayClientScopes }) => {
    const { send, baseOpts } = await resolveTelegramSendContext({
      cfg,
      deps,
      accountId,
      replyToId,
      threadId,
      gatewayClientScopes
    });
    return (0, _channelSendResult.attachChannelToResult)("telegram", await sendTelegramPayloadMessages({
      send,
      to,
      payload,
      baseOpts: {
        ...baseOpts,
        mediaLocalRoots,
        mediaReadFile,
        forceDocument: forceDocument ?? false
      }
    }));
  }
};
//#endregion
//#region extensions/telegram/src/outbound-base.ts
const telegramOutboundBaseAdapter = {
  deliveryMode: "direct",
  chunker: _replyRuntime.chunkMarkdownText,
  chunkerMode: "markdown",
  textChunkLimit: 4e3,
  pollMaxOptions: 10
};
//#endregion
//#region extensions/telegram/src/status-issues.ts
function readTelegramAccountStatus(value) {
  if (!(0, _statusHelpers.isRecord)(value)) return null;
  return {
    accountId: value.accountId,
    enabled: value.enabled,
    configured: value.configured,
    allowUnmentionedGroups: value.allowUnmentionedGroups,
    audit: value.audit
  };
}
function readTelegramGroupMembershipAuditSummary(value) {
  if (!(0, _statusHelpers.isRecord)(value)) return {};
  const unresolvedGroups = typeof value.unresolvedGroups === "number" && Number.isFinite(value.unresolvedGroups) ? value.unresolvedGroups : void 0;
  const hasWildcardUnmentionedGroups = typeof value.hasWildcardUnmentionedGroups === "boolean" ? value.hasWildcardUnmentionedGroups : void 0;
  const groupsRaw = value.groups;
  return {
    unresolvedGroups,
    hasWildcardUnmentionedGroups,
    groups: Array.isArray(groupsRaw) ? groupsRaw.map((entry) => {
      if (!(0, _statusHelpers.isRecord)(entry)) return null;
      const chatId = (0, _statusHelpers.asString)(entry.chatId);
      if (!chatId) return null;
      return {
        chatId,
        ok: typeof entry.ok === "boolean" ? entry.ok : void 0,
        status: (0, _statusHelpers.asString)(entry.status) ?? null,
        error: (0, _statusHelpers.asString)(entry.error) ?? null,
        matchKey: (0, _statusHelpers.asString)(entry.matchKey) ?? void 0,
        matchSource: (0, _statusHelpers.asString)(entry.matchSource) ?? void 0
      };
    }).filter(Boolean) : void 0
  };
}
function collectTelegramStatusIssues(accounts) {
  const issues = [];
  for (const entry of accounts) {
    const account = readTelegramAccountStatus(entry);
    if (!account) continue;
    const accountId = (0, _statusHelpers.resolveEnabledConfiguredAccountId)(account);
    if (!accountId) continue;
    if (account.allowUnmentionedGroups === true) issues.push({
      channel: "telegram",
      accountId,
      kind: "config",
      message: "Config allows unmentioned group messages (requireMention=false). Telegram Bot API privacy mode will block most group messages unless disabled.",
      fix: "In BotFather run /setprivacy → Disable for this bot (then restart the gateway)."
    });
    const audit = readTelegramGroupMembershipAuditSummary(account.audit);
    if (audit.hasWildcardUnmentionedGroups === true) issues.push({
      channel: "telegram",
      accountId,
      kind: "config",
      message: "Telegram groups config uses \"*\" with requireMention=false; membership probing is not possible without explicit group IDs.",
      fix: "Add explicit numeric group ids under channels.telegram.groups (or per-account groups) to enable probing."
    });
    if (audit.unresolvedGroups && audit.unresolvedGroups > 0) issues.push({
      channel: "telegram",
      accountId,
      kind: "config",
      message: `Some configured Telegram groups are not numeric IDs (unresolvedGroups=${audit.unresolvedGroups}). Membership probe can only check numeric group IDs.`,
      fix: "Use numeric chat IDs (e.g. -100...) as keys in channels.telegram.groups for requireMention=false groups."
    });
    for (const group of audit.groups ?? []) {
      if (group.ok === true) continue;
      const status = group.status ? ` status=${group.status}` : "";
      const err = group.error ? `: ${group.error}` : "";
      const baseMessage = `Group ${group.chatId} not reachable by bot.${status}${err}`;
      issues.push({
        channel: "telegram",
        accountId,
        kind: "runtime",
        message: (0, _statusHelpers.appendMatchMetadata)(baseMessage, {
          matchKey: group.matchKey,
          matchSource: group.matchSource
        }),
        fix: "Invite the bot to the group, then DM the bot once (/start) and restart the gateway."
      });
    }
  }
  return issues;
}
//#endregion
//#region extensions/telegram/src/threading-tool-context.ts
function resolveTelegramToolContextThreadId(context) {
  if (context.MessageThreadId != null) return String(context.MessageThreadId);
  const currentChannelId = (0, _textRuntime.normalizeOptionalString)(context.To);
  if (!currentChannelId) return;
  const parsedTarget = (0, _outboundParamsDPqRaEDE.s)(currentChannelId);
  return parsedTarget.messageThreadId != null ? String(parsedTarget.messageThreadId) : void 0;
}
function buildTelegramThreadingToolContext(params) {
  params.cfg;
  params.accountId;
  return {
    currentChannelId: (0, _textRuntime.normalizeOptionalString)(params.context.To),
    currentThreadTs: resolveTelegramToolContextThreadId(params.context),
    hasRepliedRef: params.hasRepliedRef
  };
}
//#endregion
//#region extensions/telegram/src/channel.ts
let telegramSendModulePromise;
async function loadTelegramSendModule() {
  telegramSendModulePromise ??= Promise.resolve().then(() => jitiImport("./send-DlzbQJQs.js").then((m) => _interopRequireWildcard(m))).then((n) => n.p);
  return await telegramSendModulePromise;
}
function resolveTelegramProbe() {
  return getOptionalTelegramRuntime()?.channel?.telegram?.probeTelegram ?? _probeD65JnxXS.t;
}
function resolveTelegramAuditCollector() {
  return getOptionalTelegramRuntime()?.channel?.telegram?.collectTelegramUnmentionedGroupIds ?? _probeD65JnxXS.c;
}
function resolveTelegramAuditMembership() {
  return getOptionalTelegramRuntime()?.channel?.telegram?.auditTelegramGroupMembership ?? _probeD65JnxXS.s;
}
function resolveTelegramMonitor() {
  return getOptionalTelegramRuntime()?.channel?.telegram?.monitorTelegramProvider ?? _probeD65JnxXS.r;
}
function getOptionalTelegramRuntime() {
  try {
    return (0, _runtimeCd7gYJGW.t)();
  } catch {
    return null;
  }
}
async function resolveTelegramSend(deps) {
  return (0, _outboundRuntime.resolveOutboundSendDep)(deps, "telegram") ?? getOptionalTelegramRuntime()?.channel?.telegram?.sendMessageTelegram ?? (await loadTelegramSendModule()).sendMessageTelegram;
}
function resolveTelegramTokenHelper() {
  return getOptionalTelegramRuntime()?.channel?.telegram?.resolveTelegramToken ?? _accountsCoskdHdZ.d;
}
function buildTelegramSendOptions(params) {
  return {
    verbose: false,
    cfg: params.cfg,
    ...(params.mediaUrl ? { mediaUrl: params.mediaUrl } : {}),
    ...(params.mediaLocalRoots?.length ? { mediaLocalRoots: params.mediaLocalRoots } : {}),
    messageThreadId: (0, _outboundParamsDPqRaEDE.r)(params.threadId),
    replyToMessageId: (0, _outboundParamsDPqRaEDE.n)(params.replyToId),
    accountId: params.accountId ?? void 0,
    silent: params.silent ?? void 0,
    forceDocument: params.forceDocument ?? void 0,
    ...(Array.isArray(params.gatewayClientScopes) ? { gatewayClientScopes: [...params.gatewayClientScopes] } : {})
  };
}
async function sendTelegramOutbound(params) {
  return await (await resolveTelegramSend(params.deps))(params.to, params.text, buildTelegramSendOptions({
    cfg: params.cfg,
    mediaUrl: params.mediaUrl,
    mediaLocalRoots: params.mediaLocalRoots,
    accountId: params.accountId,
    replyToId: params.replyToId,
    threadId: params.threadId,
    silent: params.silent,
    gatewayClientScopes: params.gatewayClientScopes
  }));
}
const telegramMessageActions = {
  describeMessageTool: (ctx) => getOptionalTelegramRuntime()?.channel?.telegram?.messageActions?.describeMessageTool?.(ctx) ?? _probeD65JnxXS.o.describeMessageTool?.(ctx) ?? null,
  extractToolSend: (ctx) => getOptionalTelegramRuntime()?.channel?.telegram?.messageActions?.extractToolSend?.(ctx) ?? _probeD65JnxXS.o.extractToolSend?.(ctx) ?? null,
  handleAction: async (ctx) => {
    const runtimeHandleAction = getOptionalTelegramRuntime()?.channel?.telegram?.messageActions?.handleAction;
    if (runtimeHandleAction) return await runtimeHandleAction(ctx);
    if (!_probeD65JnxXS.o.handleAction) throw new Error("Telegram message actions not available");
    return await _probeD65JnxXS.o.handleAction(ctx);
  }
};
function normalizeTelegramAcpConversationId(conversationId) {
  const parsed = (0, _topicConversation10u__tpo.t)({ conversationId });
  if (!parsed || !parsed.chatId.startsWith("-")) return null;
  return {
    conversationId: parsed.canonicalConversationId,
    parentConversationId: parsed.chatId
  };
}
function matchTelegramAcpConversation(params) {
  const binding = normalizeTelegramAcpConversationId(params.bindingConversationId);
  if (!binding) return null;
  const incoming = (0, _topicConversation10u__tpo.t)({
    conversationId: params.conversationId,
    parentConversationId: params.parentConversationId
  });
  if (!incoming || !incoming.chatId.startsWith("-")) return null;
  if (binding.conversationId !== incoming.canonicalConversationId) return null;
  return {
    conversationId: incoming.canonicalConversationId,
    parentConversationId: incoming.chatId,
    matchPriority: 2
  };
}
function shouldTreatTelegramDeliveredTextAsVisible(params) {
  params.text;
  return params.kind !== "final";
}
function targetsMatchTelegramReplySuppression(params) {
  const origin = (0, _outboundParamsDPqRaEDE.s)(params.originTarget);
  const target = (0, _outboundParamsDPqRaEDE.s)(params.targetKey);
  const originThreadId = origin.messageThreadId != null && (0, _textRuntime.normalizeOptionalString)(String(origin.messageThreadId)) ? (0, _textRuntime.normalizeOptionalString)(String(origin.messageThreadId)) : void 0;
  const targetThreadId = (0, _textRuntime.normalizeOptionalString)(params.targetThreadId) || (target.messageThreadId != null && (0, _textRuntime.normalizeOptionalString)(String(target.messageThreadId)) ? (0, _textRuntime.normalizeOptionalString)(String(target.messageThreadId)) : void 0);
  if ((0, _textRuntime.normalizeOptionalLowercaseString)(origin.chatId) !== (0, _textRuntime.normalizeOptionalLowercaseString)(target.chatId)) return false;
  if (originThreadId && targetThreadId) return originThreadId === targetThreadId;
  return originThreadId == null && targetThreadId == null;
}
function resolveTelegramCommandConversation(params) {
  const chatId = [
  params.originatingTo,
  params.commandTo,
  params.fallbackTo].
  map((candidate) => {
    const trimmed = (0, _textRuntime.normalizeOptionalString)(candidate) ?? "";
    return trimmed ? (0, _textRuntime.normalizeOptionalString)((0, _outboundParamsDPqRaEDE.s)(trimmed).chatId) ?? "" : "";
  }).find((candidate) => candidate.length > 0);
  if (!chatId) return null;
  if (params.threadId) return {
    conversationId: `${chatId}:topic:${params.threadId}`,
    parentConversationId: chatId
  };
  if (chatId.startsWith("-")) return null;
  return {
    conversationId: chatId,
    parentConversationId: chatId
  };
}
function resolveTelegramInboundConversation(params) {
  const rawTarget = (0, _textRuntime.normalizeOptionalString)(params.to) ?? (0, _textRuntime.normalizeOptionalString)(params.conversationId) ?? "";
  if (!rawTarget) return null;
  const parsedTarget = (0, _outboundParamsDPqRaEDE.s)(rawTarget);
  const chatId = (0, _textRuntime.normalizeOptionalString)(parsedTarget.chatId) ?? "";
  if (!chatId) return null;
  const threadId = parsedTarget.messageThreadId != null ? String(parsedTarget.messageThreadId) : params.threadId != null ? (0, _textRuntime.normalizeOptionalString)(String(params.threadId)) : void 0;
  if (threadId) {
    const parsedTopic = (0, _topicConversation10u__tpo.t)({
      conversationId: threadId,
      parentConversationId: chatId
    });
    if (!parsedTopic) return null;
    return {
      conversationId: parsedTopic.canonicalConversationId,
      parentConversationId: parsedTopic.chatId
    };
  }
  return {
    conversationId: chatId,
    parentConversationId: chatId
  };
}
function resolveTelegramDeliveryTarget(params) {
  const parsedTopic = (0, _topicConversation10u__tpo.t)({
    conversationId: params.conversationId,
    parentConversationId: params.parentConversationId
  });
  if (parsedTopic) return {
    to: parsedTopic.chatId,
    threadId: parsedTopic.topicId
  };
  const parsedTarget = (0, _outboundParamsDPqRaEDE.s)(params.parentConversationId?.trim() || params.conversationId);
  if (!parsedTarget.chatId.trim()) return null;
  return {
    to: parsedTarget.chatId,
    ...(parsedTarget.messageThreadId != null ? { threadId: String(parsedTarget.messageThreadId) } : {})
  };
}
function parseTelegramExplicitTarget(raw) {
  const target = (0, _outboundParamsDPqRaEDE.s)(raw);
  return {
    to: target.chatId,
    threadId: target.messageThreadId,
    chatType: target.chatType === "unknown" ? void 0 : target.chatType
  };
}
function shouldStripTelegramThreadFromAnnounceOrigin(params) {
  const requesterChannel = (0, _textRuntime.normalizeOptionalLowercaseString)(params.requester.channel);
  if (requesterChannel && requesterChannel !== "telegram") return true;
  const requesterTo = params.requester.to?.trim();
  if (!requesterTo) return false;
  if (!requesterChannel && !requesterTo.startsWith("telegram:")) return true;
  const requesterTarget = parseTelegramExplicitTarget(requesterTo);
  if (requesterTarget.chatType !== "group") return true;
  const entryTo = params.entry.to?.trim();
  if (!entryTo) return false;
  return parseTelegramExplicitTarget(entryTo).to !== requesterTarget.to;
}
function buildTelegramBaseSessionKey(params) {
  return (0, _routing.buildOutboundBaseSessionKey)({
    ...params,
    channel: "telegram"
  });
}
function resolveTelegramOutboundSessionRoute(params) {
  const parsed = (0, _outboundParamsDPqRaEDE.s)(params.target);
  const chatId = parsed.chatId.trim();
  if (!chatId) return null;
  const fallbackThreadId = (0, _routing.normalizeOutboundThreadId)(params.threadId);
  const resolvedThreadId = parsed.messageThreadId ?? (0, _outboundParamsDPqRaEDE.r)(fallbackThreadId);
  const isGroup = parsed.chatType === "group" || parsed.chatType === "unknown" && params.resolvedTarget?.kind && params.resolvedTarget.kind !== "user";
  const peerId = isGroup && resolvedThreadId ? (0, _formatDkmJkZf.g)(chatId, resolvedThreadId) : chatId;
  const peer = {
    kind: isGroup ? "group" : "direct",
    id: peerId
  };
  const baseSessionKey = buildTelegramBaseSessionKey({
    cfg: params.cfg,
    agentId: params.agentId,
    accountId: params.accountId,
    peer
  });
  return {
    sessionKey: (resolvedThreadId && !isGroup ? (0, _routing.resolveThreadSessionKeys)({
      baseSessionKey,
      threadId: String(resolvedThreadId)
    }) : null)?.sessionKey ?? baseSessionKey,
    baseSessionKey,
    peer,
    chatType: isGroup ? "group" : "direct",
    from: isGroup ? `telegram:group:${peerId}` : resolvedThreadId ? `telegram:${chatId}:topic:${resolvedThreadId}` : `telegram:${chatId}`,
    to: `telegram:${chatId}`,
    threadId: resolvedThreadId
  };
}
async function resolveTelegramTargets(params) {
  if (params.kind !== "user") return params.inputs.map((input) => ({
    input,
    resolved: false,
    note: "Telegram runtime target resolution only supports usernames for direct-message lookups."
  }));
  const account = (0, _accountsCoskdHdZ.s)({
    cfg: params.cfg,
    accountId: params.accountId
  });
  const token = account.token.trim();
  if (!token) return params.inputs.map((input) => ({
    input,
    resolved: false,
    note: "Telegram bot token is required to resolve @username targets."
  }));
  return await Promise.all(params.inputs.map(async (input) => {
    const trimmed = input.trim();
    if (!trimmed) return {
      input,
      resolved: false,
      note: "Telegram target is required."
    };
    const normalized = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
    try {
      const id = await (0, _sharedB0aXBwuj.o)({
        token,
        chatId: normalized,
        network: account.config.network
      });
      if (!id) return {
        input,
        resolved: false,
        note: "Telegram username could not be resolved by the configured bot."
      };
      return {
        input,
        resolved: true,
        id,
        name: normalized
      };
    } catch (error) {
      return {
        input,
        resolved: false,
        note: (0, _errorRuntime.formatErrorMessage)(error)
      };
    }
  }));
}
const resolveTelegramAllowlistGroupOverrides = (0, _allowlistConfigEdit.createNestedAllowlistOverrideResolver)({
  resolveRecord: (account) => account.config.groups,
  outerLabel: (groupId) => groupId,
  resolveOuterEntries: (groupCfg) => groupCfg?.allowFrom,
  resolveChildren: (groupCfg) => groupCfg?.topics,
  innerLabel: (groupId, topicId) => `${groupId} topic ${topicId}`,
  resolveInnerEntries: (topicCfg) => topicCfg?.allowFrom
});
const collectTelegramSecurityWarnings = (0, _channelPolicy.createAllowlistProviderRouteAllowlistWarningCollector)({
  providerConfigPresent: (cfg) => cfg.channels?.telegram !== void 0,
  resolveGroupPolicy: (account) => account.config.groupPolicy,
  resolveRouteAllowlistConfigured: (account) => Boolean(account.config.groups) && Object.keys(account.config.groups ?? {}).length > 0,
  restrictSenders: {
    surface: "Telegram groups",
    openScope: "any member in allowed groups",
    groupPolicyPath: "channels.telegram.groupPolicy",
    groupAllowFromPath: "channels.telegram.groupAllowFrom"
  },
  noRouteAllowlist: {
    surface: "Telegram groups",
    routeAllowlistPath: "channels.telegram.groups",
    routeScope: "group",
    groupPolicyPath: "channels.telegram.groupPolicy",
    groupAllowFromPath: "channels.telegram.groupAllowFrom"
  }
});
const telegramPlugin = exports.t = (0, _channelCore.createChatChannelPlugin)({
  base: {
    ...(0, _sharedB0aXBwuj.t)({
      setupWizard: _channelSetupBei3ZTCY.r,
      setup: _channelSetupBei3ZTCY.i
    }),
    allowlist: (0, _allowlistConfigEdit.buildDmGroupAccountAllowlistAdapter)({
      channelId: "telegram",
      resolveAccount: _accountsCoskdHdZ.s,
      normalize: ({ cfg, accountId, values }) => _sharedB0aXBwuj.i.formatAllowFrom({
        cfg,
        accountId,
        allowFrom: values
      }),
      resolveDmAllowFrom: (account) => account.config.allowFrom,
      resolveGroupAllowFrom: (account) => account.config.groupAllowFrom,
      resolveDmPolicy: (account) => account.config.dmPolicy,
      resolveGroupPolicy: (account) => account.config.groupPolicy,
      resolveGroupOverrides: resolveTelegramAllowlistGroupOverrides
    }),
    bindings: {
      selfParentConversationByDefault: true,
      compileConfiguredBinding: ({ conversationId }) => normalizeTelegramAcpConversationId(conversationId),
      matchInboundConversation: ({ compiledBinding, conversationId, parentConversationId }) => matchTelegramAcpConversation({
        bindingConversationId: compiledBinding.conversationId,
        conversationId,
        parentConversationId
      }),
      resolveCommandConversation: ({ threadId, originatingTo, commandTo, fallbackTo }) => resolveTelegramCommandConversation({
        threadId,
        originatingTo,
        commandTo,
        fallbackTo
      })
    },
    conversationBindings: {
      supportsCurrentConversationBinding: true,
      defaultTopLevelPlacement: "current",
      resolveConversationRef: ({ accountId: _accountId, conversationId, parentConversationId, threadId }) => resolveTelegramInboundConversation({
        to: parentConversationId ?? conversationId,
        conversationId,
        threadId: threadId ?? void 0
      }),
      buildBoundReplyChannelData: ({ operation, conversation }) => {
        if (operation !== "acp-spawn") return null;
        return conversation.conversationId.includes(":topic:") ? { telegram: { pin: true } } : null;
      },
      shouldStripThreadFromAnnounceOrigin: shouldStripTelegramThreadFromAnnounceOrigin,
      createManager: ({ accountId }) => (0, _threadBindingsComZmmvs.t)({
        accountId: accountId ?? void 0,
        persist: false,
        enableSweeper: false
      }),
      setIdleTimeoutBySessionKey: ({ targetSessionKey, accountId, idleTimeoutMs }) => (0, _threadBindingsComZmmvs.i)({
        targetSessionKey,
        accountId: accountId ?? void 0,
        idleTimeoutMs
      }),
      setMaxAgeBySessionKey: ({ targetSessionKey, accountId, maxAgeMs }) => (0, _threadBindingsComZmmvs.a)({
        targetSessionKey,
        accountId: accountId ?? void 0,
        maxAgeMs
      })
    },
    groups: {
      resolveRequireMention: resolveTelegramGroupRequireMention,
      resolveToolPolicy: resolveTelegramGroupToolPolicy
    },
    agentPrompt: {
      messageToolCapabilities: ({ cfg, accountId }) => {
        return (0, _inlineButtonsZDRhkQx.r)({
          cfg,
          accountId: accountId ?? void 0
        }) === "off" ? [] : ["inlineButtons"];
      },
      reactionGuidance: ({ cfg, accountId }) => {
        const level = (0, _reactionLevelDTOtJXm.t)({
          cfg,
          accountId: accountId ?? void 0
        }).agentReactionGuidance;
        return level ? {
          level,
          channelLabel: "Telegram"
        } : void 0;
      }
    },
    messaging: {
      normalizeTarget: normalizeTelegramMessagingTarget,
      resolveInboundConversation: ({ to, conversationId, threadId }) => resolveTelegramInboundConversation({
        to,
        conversationId,
        threadId
      }),
      resolveDeliveryTarget: ({ conversationId, parentConversationId }) => resolveTelegramDeliveryTarget({
        conversationId,
        parentConversationId
      }),
      resolveSessionConversation: ({ kind, rawId }) => (0, _sessionConversation9AmzjtGp.t)({
        kind,
        rawId
      }),
      parseExplicitTarget: ({ raw }) => parseTelegramExplicitTarget(raw),
      inferTargetChatType: ({ to }) => parseTelegramExplicitTarget(to).chatType,
      formatTargetDisplay: ({ target, display, kind }) => {
        const formatted = display?.trim();
        if (formatted) return formatted;
        const trimmedTarget = target.trim();
        if (!trimmedTarget) return trimmedTarget;
        const withoutProvider = trimmedTarget.replace(/^(telegram|tg):/i, "");
        if (kind === "user" || /^user:/i.test(withoutProvider)) return `@${withoutProvider.replace(/^user:/i, "")}`;
        if (/^channel:/i.test(withoutProvider)) return `#${withoutProvider.replace(/^channel:/i, "")}`;
        return withoutProvider;
      },
      resolveOutboundSessionRoute: (params) => resolveTelegramOutboundSessionRoute(params),
      targetResolver: {
        looksLikeId: looksLikeTelegramTargetId,
        hint: "<chatId>"
      }
    },
    resolver: { resolveTargets: async ({ cfg, accountId, inputs, kind }) => await resolveTelegramTargets({
        cfg,
        accountId,
        inputs,
        kind
      }) },
    lifecycle: {
      detectLegacyStateMigrations: ({ cfg, env }) => (0, _channelSetupBei3ZTCY.n)({
        cfg,
        env
      }),
      onAccountConfigChanged: async ({ prevCfg, nextCfg, accountId }) => {
        if ((0, _accountsCoskdHdZ.s)({
          cfg: prevCfg,
          accountId
        }).token.trim() !== (0, _accountsCoskdHdZ.s)({
          cfg: nextCfg,
          accountId
        }).token.trim()) {
          const { deleteTelegramUpdateOffset } = await Promise.resolve().then(() => jitiImport("./update-offset-runtime-api.js").then((m) => _interopRequireWildcard(m)));
          await deleteTelegramUpdateOffset({ accountId });
        }
      },
      onAccountRemoved: async ({ accountId }) => {
        const { deleteTelegramUpdateOffset } = await Promise.resolve().then(() => jitiImport("./update-offset-runtime-api.js").then((m) => _interopRequireWildcard(m)));
        await deleteTelegramUpdateOffset({ accountId });
      }
    },
    approvalCapability: {
      ..._approvalNative9xNAH8CY.t,
      render: { exec: { buildPendingPayload: ({ request, nowMs }) => (0, _probeD65JnxXS.i)({
            request,
            nowMs
          }) } }
    },
    directory: (0, _directoryRuntime.createChannelDirectoryAdapter)({
      listPeers: async (params) => (0, _directoryConfigDmz17SwM.n)(params),
      listGroups: async (params) => (0, _directoryConfigDmz17SwM.t)(params)
    }),
    actions: telegramMessageActions,
    status: (0, _statusHelpers.createComputedAccountStatusAdapter)({
      defaultRuntime: (0, _statusHelpers.createDefaultChannelRuntimeState)(_accountId2.DEFAULT_ACCOUNT_ID),
      skipStaleSocketHealthCheck: true,
      collectStatusIssues: collectTelegramStatusIssues,
      buildChannelSummary: ({ snapshot }) => (0, _channelStatus.buildTokenChannelStatusSummary)(snapshot),
      probeAccount: async ({ account, timeoutMs }) => resolveTelegramProbe()(account.token, timeoutMs, {
        accountId: account.accountId,
        proxyUrl: account.config.proxy,
        network: account.config.network,
        apiRoot: account.config.apiRoot
      }),
      formatCapabilitiesProbe: ({ probe }) => {
        const lines = [];
        if (probe?.bot?.username) {
          const botId = probe.bot.id ? ` (${probe.bot.id})` : "";
          lines.push({ text: `Bot: @${probe.bot.username}${botId}` });
        }
        const flags = [];
        if (typeof probe?.bot?.canJoinGroups === "boolean") flags.push(`joinGroups=${probe.bot.canJoinGroups}`);
        if (typeof probe?.bot?.canReadAllGroupMessages === "boolean") flags.push(`readAllGroupMessages=${probe.bot.canReadAllGroupMessages}`);
        if (typeof probe?.bot?.supportsInlineQueries === "boolean") flags.push(`inlineQueries=${probe.bot.supportsInlineQueries}`);
        if (flags.length > 0) lines.push({ text: `Flags: ${flags.join(" ")}` });
        if (probe?.webhook?.url !== void 0) lines.push({ text: `Webhook: ${probe.webhook.url || "none"}` });
        return lines;
      },
      auditAccount: async ({ account, timeoutMs, probe, cfg }) => {
        const groups = cfg.channels?.telegram?.accounts?.[account.accountId]?.groups ?? cfg.channels?.telegram?.groups;
        const { groupIds, unresolvedGroups, hasWildcardUnmentionedGroups } = resolveTelegramAuditCollector()(groups);
        if (!groupIds.length && unresolvedGroups === 0 && !hasWildcardUnmentionedGroups) return;
        const botId = probe?.ok && probe.bot?.id != null ? probe.bot.id : null;
        if (!botId) return {
          ok: unresolvedGroups === 0 && !hasWildcardUnmentionedGroups,
          checkedGroups: 0,
          unresolvedGroups,
          hasWildcardUnmentionedGroups,
          groups: [],
          elapsedMs: 0
        };
        return {
          ...(await resolveTelegramAuditMembership()({
            token: account.token,
            botId,
            groupIds,
            proxyUrl: account.config.proxy,
            network: account.config.network,
            apiRoot: account.config.apiRoot,
            timeoutMs
          })),
          unresolvedGroups,
          hasWildcardUnmentionedGroups
        };
      },
      resolveAccountSnapshot: ({ account, cfg, runtime, audit }) => {
        const configuredFromStatus = (0, _channelStatus.resolveConfiguredFromCredentialStatuses)(account);
        const ownerAccountId = (0, _sharedB0aXBwuj.n)({
          cfg,
          accountId: account.accountId
        });
        const duplicateTokenReason = ownerAccountId ? (0, _sharedB0aXBwuj.r)({
          accountId: account.accountId,
          ownerAccountId
        }) : null;
        const configured = (configuredFromStatus ?? Boolean(account.token?.trim())) && !ownerAccountId;
        const groups = cfg.channels?.telegram?.accounts?.[account.accountId]?.groups ?? cfg.channels?.telegram?.groups;
        const allowUnmentionedGroups = groups?.["*"]?.requireMention === false || Object.entries(groups ?? {}).some(([key, value]) => key !== "*" && value?.requireMention === false);
        return {
          accountId: account.accountId,
          name: account.name,
          enabled: account.enabled,
          configured,
          extra: {
            ...(0, _channelStatus.projectCredentialSnapshotFields)(account),
            lastError: runtime?.lastError ?? duplicateTokenReason,
            mode: runtime?.mode ?? (account.config.webhookUrl ? "webhook" : "polling"),
            audit,
            allowUnmentionedGroups
          }
        };
      }
    }),
    gateway: {
      startAccount: async (ctx) => {
        const account = ctx.account;
        const ownerAccountId = (0, _sharedB0aXBwuj.n)({
          cfg: ctx.cfg,
          accountId: account.accountId
        });
        if (ownerAccountId) {
          const reason = (0, _sharedB0aXBwuj.r)({
            accountId: account.accountId,
            ownerAccountId
          });
          ctx.log?.error?.(`[${account.accountId}] ${reason}`);
          throw new Error(reason);
        }
        const token = (account.token ?? "").trim();
        let telegramBotLabel = "";
        try {
          const probe = await resolveTelegramProbe()(token, 2500, {
            accountId: account.accountId,
            proxyUrl: account.config.proxy,
            network: account.config.network,
            apiRoot: account.config.apiRoot
          });
          const username = probe.ok ? probe.bot?.username?.trim() : null;
          if (username) telegramBotLabel = ` (@${username})`;
        } catch (err) {
          if ((0, _runtimeCd7gYJGW.t)().logging.shouldLogVerbose()) ctx.log?.debug?.(`[${account.accountId}] bot probe failed: ${String(err)}`);
        }
        ctx.log?.info(`[${account.accountId}] starting provider${telegramBotLabel}`);
        return resolveTelegramMonitor()({
          token,
          accountId: account.accountId,
          config: ctx.cfg,
          runtime: ctx.runtime,
          channelRuntime: ctx.channelRuntime,
          abortSignal: ctx.abortSignal,
          useWebhook: Boolean(account.config.webhookUrl),
          webhookUrl: account.config.webhookUrl,
          webhookSecret: account.config.webhookSecret,
          webhookPath: account.config.webhookPath,
          webhookHost: account.config.webhookHost,
          webhookPort: account.config.webhookPort,
          webhookCertPath: account.config.webhookCertPath
        });
      },
      logoutAccount: async ({ accountId, cfg }) => {
        const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
        const nextCfg = { ...cfg };
        const nextTelegram = cfg.channels?.telegram ? { ...cfg.channels.telegram } : void 0;
        let cleared = false;
        let changed = false;
        if (nextTelegram) {
          if (accountId === _accountId2.DEFAULT_ACCOUNT_ID && nextTelegram.botToken) {
            delete nextTelegram.botToken;
            cleared = true;
            changed = true;
          }
          const accountCleanup = (0, _channelCore.clearAccountEntryFields)({
            accounts: nextTelegram.accounts,
            accountId,
            fields: ["botToken"]
          });
          if (accountCleanup.changed) {
            changed = true;
            if (accountCleanup.cleared) cleared = true;
            if (accountCleanup.nextAccounts) nextTelegram.accounts = accountCleanup.nextAccounts;else
            delete nextTelegram.accounts;
          }
        }
        if (changed) if (nextTelegram && Object.keys(nextTelegram).length > 0) nextCfg.channels = {
          ...nextCfg.channels,
          telegram: nextTelegram
        };else
        {
          const nextChannels = { ...nextCfg.channels };
          delete nextChannels.telegram;
          if (Object.keys(nextChannels).length > 0) nextCfg.channels = nextChannels;else
          delete nextCfg.channels;
        }
        const loggedOut = (0, _accountsCoskdHdZ.s)({
          cfg: changed ? nextCfg : cfg,
          accountId
        }).tokenSource === "none";
        if (changed) await (0, _runtimeCd7gYJGW.t)().config.writeConfigFile(nextCfg);
        return {
          cleared,
          envToken: Boolean(envToken),
          loggedOut
        };
      }
    }
  },
  pairing: { text: {
      idLabel: "telegramUserId",
      message: _channelStatus.PAIRING_APPROVED_MESSAGE,
      normalizeAllowEntry: (0, _channelPairing.createPairingPrefixStripper)(/^(telegram|tg):/i),
      notify: async ({ cfg, id, message, accountId }) => {
        const { token } = resolveTelegramTokenHelper()(cfg, { accountId });
        if (!token) throw new Error("telegram token not configured");
        await (await resolveTelegramSend())(id, message, {
          token,
          accountId
        });
      }
    } },
  security: {
    dm: {
      channelKey: "telegram",
      resolvePolicy: (account) => account.config.dmPolicy,
      resolveAllowFrom: (account) => account.config.allowFrom,
      policyPathSuffix: "dmPolicy",
      normalizeEntry: (raw) => raw.replace(/^(telegram|tg):/i, "")
    },
    collectWarnings: collectTelegramSecurityWarnings,
    collectAuditFindings: _securityAuditI7LTWqSs.t
  },
  threading: {
    topLevelReplyToMode: "telegram",
    buildToolContext: (params) => buildTelegramThreadingToolContext(params),
    resolveAutoThreadId: ({ to, toolContext }) => resolveTelegramAutoThreadId({
      to,
      toolContext
    })
  },
  outbound: {
    base: {
      ...telegramOutboundBaseAdapter,
      shouldSuppressLocalPayloadPrompt: ({ cfg, accountId, payload }) => (0, _execApprovalsGJ9TaLpO.f)({
        cfg,
        accountId,
        payload
      }),
      beforeDeliverPayload: async ({ cfg, target, hint }) => {
        if (hint?.kind !== "approval-pending" || hint.approvalKind !== "exec") return;
        const threadId = typeof target.threadId === "number" ? target.threadId : typeof target.threadId === "string" ? Number.parseInt(target.threadId, 10) : void 0;
        const { sendTypingTelegram } = await loadTelegramSendModule();
        await sendTypingTelegram(target.to, {
          cfg,
          accountId: target.accountId ?? void 0,
          ...(Number.isFinite(threadId) ? { messageThreadId: threadId } : {})
        }).catch(() => {});
      },
      shouldSkipPlainTextSanitization: ({ payload }) => Boolean(payload.channelData),
      shouldTreatDeliveredTextAsVisible: shouldTreatTelegramDeliveredTextAsVisible,
      targetsMatchForReplySuppression: targetsMatchTelegramReplySuppression,
      resolveEffectiveTextChunkLimit: ({ fallbackLimit }) => typeof fallbackLimit === "number" ? Math.min(fallbackLimit, 4096) : 4096,
      supportsPollDurationSeconds: true,
      supportsAnonymousPolls: true,
      sendPayload: async ({ cfg, to, payload, mediaLocalRoots, accountId, deps, replyToId, threadId, silent, forceDocument, gatewayClientScopes }) => {
        return (0, _channelSendResult.attachChannelToResult)("telegram", await sendTelegramPayloadMessages({
          send: await resolveTelegramSend(deps),
          to,
          payload,
          baseOpts: buildTelegramSendOptions({
            cfg,
            mediaLocalRoots,
            accountId,
            replyToId,
            threadId,
            silent,
            forceDocument,
            gatewayClientScopes
          })
        }));
      }
    },
    attachedResults: {
      channel: "telegram",
      sendText: async ({ cfg, to, text, accountId, deps, replyToId, threadId, silent, gatewayClientScopes }) => await sendTelegramOutbound({
        cfg,
        to,
        text,
        accountId,
        deps,
        replyToId,
        threadId,
        silent,
        gatewayClientScopes
      }),
      sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps, replyToId, threadId, silent, gatewayClientScopes }) => await sendTelegramOutbound({
        cfg,
        to,
        text,
        mediaUrl,
        mediaLocalRoots,
        accountId,
        deps,
        replyToId,
        threadId,
        silent,
        gatewayClientScopes
      }),
      sendPoll: async ({ cfg, to, poll, accountId, threadId, silent, isAnonymous, gatewayClientScopes }) => {
        const { sendPollTelegram } = await loadTelegramSendModule();
        return await sendPollTelegram(to, poll, {
          cfg,
          accountId: accountId ?? void 0,
          messageThreadId: (0, _outboundParamsDPqRaEDE.r)(threadId),
          silent: silent ?? void 0,
          isAnonymous: isAnonymous ?? void 0,
          gatewayClientScopes
        });
      }
    }
  }
});
//#endregion /* v9-d41c1ac99485cdf4 */
