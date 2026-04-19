"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = createReplyDispatcherWithTyping;exports.c = resetInboundDedupe;exports.i = createReplyDispatcher;exports.l = withReplyDispatcher;exports.n = dispatchInboundMessageWithBufferedDispatcher;exports.o = getTotalPendingReplies;exports.r = dispatchInboundMessageWithDispatcher;exports.s = dispatchReplyFromConfig;exports.t = dispatchInboundMessage;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _globalSingletonB80lDOJ = require("./global-singleton-B80lD-oJ.js");
var _globalsDe6QTwLG = require("./globals-De6QTwLG.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
require("./message-channel-core-BIZsQ6dr.js");
var _hookRunnerGlobalCYvQf43U = require("./hook-runner-global-CYvQf43U.js");
var _dedupeUU1DnJKZ = require("./dedupe-uU1DnJKZ.js");
var _internalHooks4i4Rq3Qq = require("./internal-hooks-4i4Rq3Qq.js");
var _thinkingSharedCAbk7EZs = require("./thinking.shared-CAbk7EZs.js");
var _storeDFXcceZJ = require("./store-DFXcceZJ.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
var _storeLoadDjLNEIy = require("./store-load-DjLNEIy9.js");
var _threadInfoDA0w7q1W = require("./thread-info-DA0w7q1W.js");
var _diagnosticEventsP3w1ZgD_ = require("./diagnostic-events-P3w1ZgD_.js");
var _replyPayloadDsrzRv7F = require("./reply-payload-dsrzRv7F.js");
var _replyPayloadDb_8BQiX = require("./reply-payload-Db_8BQiX.js");
var _messageHookMappersV58z7z2I = require("./message-hook-mappers-v58z7z2I.js");
var _secureRandomDHoiZOqc = require("./secure-random-DHoiZOqc.js");
var _normalizeReplyBD7ABbmk = require("./normalize-reply-BD7ABbmk.js");
var _diagnosticCCecAk = require("./diagnostic-C-cec-ak.js");
var _conversationBindingCOoBmA8F = require("./conversation-binding-COoBmA8F.js");
var _sendPolicyDyHi525p = require("./send-policy-DyHi525p.js");
var _ttsAutoModeZhfpRKB = require("./tts-auto-mode-ZhfpRKB9.js");
var _ttsConfigCHNuDmRE = require("./tts-config-CHNuDmRE.js");
var _typingPolicyCKG7EO6n = require("./typing-policy-CKG7EO6n.js");
var _inboundContext3c7B1YUQ = require("./inbound-context-3c7B1YUQ.js");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/auto-reply/dispatch-dispatcher.ts
async function withReplyDispatcher(params) {
  try {
    return await params.run();
  } finally {
    params.dispatcher.markComplete();
    try {
      await params.dispatcher.waitForIdle();
    } finally {
      await params.onSettled?.();
    }
  }
}
//#endregion
//#region src/acp/session-interaction-mode.ts
function resolveAcpSessionInteractionMode(entry) {
  if (entry?.acp?.mode !== "oneshot") return "interactive";
  if ((0, _stringCoerceBUSzWgUA.s)(entry.spawnedBy) || (0, _stringCoerceBUSzWgUA.s)(entry.parentSessionKey)) return "parent-owned-background";
  return "interactive";
}
function isParentOwnedBackgroundAcpSession(entry) {
  return resolveAcpSessionInteractionMode(entry) === "parent-owned-background";
}
//#endregion
//#region src/channels/plugins/exec-approval-local.ts
function shouldSuppressLocalExecApprovalPrompt(params) {
  const channel = params.channel ? (0, _registryDelpa74L.i)(params.channel) : null;
  if (!channel) return false;
  return (0, _registryDelpa74L.t)(channel)?.outbound?.shouldSuppressLocalPayloadPrompt?.({
    cfg: params.cfg,
    accountId: params.accountId,
    payload: params.payload,
    hint: {
      kind: "approval-pending",
      approvalKind: "exec"
    }
  }) ?? false;
}
//#endregion
//#region src/auto-reply/reply/inbound-dedupe.ts
const DEFAULT_INBOUND_DEDUPE_TTL_MS = 20 * 6e4;
const DEFAULT_INBOUND_DEDUPE_MAX = 5e3;
/**
* Keep inbound dedupe shared across bundled chunks so the same provider
* message cannot bypass dedupe by entering through a different chunk copy.
*/
const INBOUND_DEDUPE_CACHE_KEY = Symbol.for("openclaw.inboundDedupeCache");
const INBOUND_DEDUPE_INFLIGHT_KEY = Symbol.for("openclaw.inboundDedupeInflight");
const inboundDedupeCache = (0, _dedupeUU1DnJKZ.n)(INBOUND_DEDUPE_CACHE_KEY, {
  ttlMs: DEFAULT_INBOUND_DEDUPE_TTL_MS,
  maxSize: DEFAULT_INBOUND_DEDUPE_MAX
});
const inboundDedupeInFlight = (0, _globalSingletonB80lDOJ.n)(INBOUND_DEDUPE_INFLIGHT_KEY, () => /* @__PURE__ */new Set());
const resolveInboundPeerId = (ctx) => ctx.OriginatingTo ?? ctx.To ?? ctx.From ?? ctx.SessionKey;
function resolveInboundDedupeSessionScope(ctx) {
  const sessionKey = (ctx.CommandSource === "native" ? (0, _stringCoerceBUSzWgUA.s)(ctx.CommandTargetSessionKey) : void 0) || (0, _stringCoerceBUSzWgUA.s)(ctx.SessionKey) || "";
  if (!sessionKey) return "";
  const parsed = (0, _sessionKeyBh1lMwK.x)(sessionKey);
  if (!parsed) return sessionKey;
  return `agent:${parsed.agentId}`;
}
function buildInboundDedupeKey(ctx) {
  const provider = (0, _stringCoerceBUSzWgUA.o)(ctx.OriginatingChannel ?? ctx.Provider ?? ctx.Surface) || "";
  const messageId = (0, _stringCoerceBUSzWgUA.s)(ctx.MessageSid);
  if (!provider || !messageId) return null;
  const peerId = resolveInboundPeerId(ctx);
  if (!peerId) return null;
  const sessionScope = resolveInboundDedupeSessionScope(ctx);
  return [
  provider,
  (0, _stringCoerceBUSzWgUA.s)(ctx.AccountId) ?? "",
  sessionScope,
  peerId,
  ctx.MessageThreadId !== void 0 && ctx.MessageThreadId !== null ? String(ctx.MessageThreadId) : "",
  messageId].
  filter(Boolean).join("|");
}
function claimInboundDedupe(ctx, opts) {
  const key = buildInboundDedupeKey(ctx);
  if (!key) return { status: "invalid" };
  if ((opts?.cache ?? inboundDedupeCache).peek(key, opts?.now)) return {
    status: "duplicate",
    key
  };
  const inFlight = opts?.inFlight ?? inboundDedupeInFlight;
  if (inFlight.has(key)) return {
    status: "inflight",
    key
  };
  inFlight.add(key);
  return {
    status: "claimed",
    key
  };
}
function commitInboundDedupe(key, opts) {
  (opts?.cache ?? inboundDedupeCache).check(key, opts?.now);
  (opts?.inFlight ?? inboundDedupeInFlight).delete(key);
}
function releaseInboundDedupe(key, opts) {
  (opts?.inFlight ?? inboundDedupeInFlight).delete(key);
}
function resetInboundDedupe() {
  inboundDedupeCache.clear();
  inboundDedupeInFlight.clear();
}
//#endregion
//#region src/auto-reply/reply/routing-policy.ts
function resolveReplyRoutingDecision(params) {
  const originatingChannel = (0, _messageChannelCBqCPFa_.u)(params.originatingChannel);
  const providerChannel = (0, _messageChannelCBqCPFa_.u)(params.provider);
  const surfaceChannel = (0, _messageChannelCBqCPFa_.u)(params.surface);
  const currentSurface = providerChannel ?? surfaceChannel;
  const isInternalWebchatTurn = currentSurface === "webchat" && (surfaceChannel === "webchat" || !surfaceChannel) && params.explicitDeliverRoute !== true;
  const shouldRouteToOriginating = Boolean(!params.suppressDirectUserDelivery && !isInternalWebchatTurn && params.isRoutableChannel(originatingChannel) && params.originatingTo && originatingChannel !== currentSurface);
  return {
    originatingChannel,
    currentSurface,
    isInternalWebchatTurn,
    shouldRouteToOriginating,
    shouldSuppressTyping: params.suppressDirectUserDelivery === true || shouldRouteToOriginating || originatingChannel === "webchat"
  };
}
//#endregion
//#region src/auto-reply/reply/dispatch-from-config.ts
let routeReplyRuntimePromise = null;
let getReplyFromConfigRuntimePromise = null;
let abortRuntimePromise = null;
let ttsRuntimePromise = null;
let replyMediaPathsRuntimePromise = null;
function loadRouteReplyRuntime() {
  routeReplyRuntimePromise ??= Promise.resolve().then(() => jitiImport("./route-reply.runtime-0xzpdt2H.js").then((m) => _interopRequireWildcard(m)));
  return routeReplyRuntimePromise;
}
function loadGetReplyFromConfigRuntime() {
  getReplyFromConfigRuntimePromise ??= Promise.resolve().then(() => jitiImport("./get-reply-from-config.runtime-CiuQX9V1.js").then((m) => _interopRequireWildcard(m)));
  return getReplyFromConfigRuntimePromise;
}
function loadAbortRuntime() {
  abortRuntimePromise ??= Promise.resolve().then(() => jitiImport("./abort.runtime-B6eitAIe.js").then((m) => _interopRequireWildcard(m)));
  return abortRuntimePromise;
}
function loadTtsRuntime() {
  ttsRuntimePromise ??= Promise.resolve().then(() => jitiImport("./tts.runtime-B03t7ef3.js").then((m) => _interopRequireWildcard(m)));
  return ttsRuntimePromise;
}
function loadReplyMediaPathsRuntime() {
  replyMediaPathsRuntimePromise ??= Promise.resolve().then(() => jitiImport("./reply-media-paths.runtime-1dTUi21A.js").then((m) => _interopRequireWildcard(m)));
  return replyMediaPathsRuntimePromise;
}
async function maybeApplyTtsToReplyPayload(params) {
  if (!(0, _ttsConfigCHNuDmRE.n)({
    cfg: params.cfg,
    ttsAuto: params.ttsAuto
  })) return params.payload;
  const { maybeApplyTtsToPayload } = await loadTtsRuntime();
  return maybeApplyTtsToPayload(params);
}
const AUDIO_PLACEHOLDER_RE = /^<media:audio>(\s*\([^)]*\))?$/i;
const AUDIO_HEADER_RE = /^\[Audio\b/i;
const normalizeMediaType = (value) => (0, _stringCoerceBUSzWgUA.o)(value.split(";")[0]) ?? "";
const isInboundAudioContext = (ctx) => {
  if ([typeof ctx.MediaType === "string" ? ctx.MediaType : void 0, ...(Array.isArray(ctx.MediaTypes) ? ctx.MediaTypes : [])].filter(Boolean).map((type) => normalizeMediaType(type)).some((type) => type === "audio" || type.startsWith("audio/"))) return true;
  const trimmed = (typeof ctx.BodyForCommands === "string" ? ctx.BodyForCommands : typeof ctx.CommandBody === "string" ? ctx.CommandBody : typeof ctx.RawBody === "string" ? ctx.RawBody : typeof ctx.Body === "string" ? ctx.Body : "").trim();
  if (!trimmed) return false;
  if (AUDIO_PLACEHOLDER_RE.test(trimmed)) return true;
  return AUDIO_HEADER_RE.test(trimmed);
};
const resolveSessionStoreLookup = (ctx, cfg) => {
  const sessionKey = (0, _stringCoerceBUSzWgUA.s)((ctx.CommandSource === "native" ? (0, _stringCoerceBUSzWgUA.s)(ctx.CommandTargetSessionKey) : void 0) ?? ctx.SessionKey);
  if (!sessionKey) return {};
  const agentId = (0, _agentScopeKFH9bkHi.p)({
    sessionKey,
    config: cfg
  });
  const storePath = (0, _pathsCZMxg3hs.u)(cfg.session?.store, { agentId });
  try {
    return {
      sessionKey,
      storePath,
      entry: (0, _storeDFXcceZJ.a)({
        store: (0, _storeLoadDjLNEIy.t)(storePath),
        sessionKey
      }).existing
    };
  } catch {
    return {
      sessionKey,
      storePath
    };
  }
};
const createShouldEmitVerboseProgress = (params) => {
  return () => {
    if (params.sessionKey && params.storePath) try {
      const entry = (0, _storeDFXcceZJ.a)({
        store: (0, _storeLoadDjLNEIy.t)(params.storePath),
        sessionKey: params.sessionKey
      }).existing;
      const currentLevel = (0, _thinkingSharedCAbk7EZs.d)(entry?.verboseLevel ?? "");
      if (currentLevel) return currentLevel !== "off";
    } catch {}
    return params.fallbackLevel !== "off";
  };
};
async function dispatchReplyFromConfig(params) {
  const { ctx, cfg, dispatcher } = params;
  const diagnosticsEnabled = (0, _diagnosticEventsP3w1ZgD_.n)(cfg);
  const channel = (0, _stringCoerceBUSzWgUA.i)(ctx.Surface ?? ctx.Provider ?? "unknown");
  const chatId = ctx.To ?? ctx.From;
  const messageId = ctx.MessageSid ?? ctx.MessageSidFirst ?? ctx.MessageSidLast;
  const sessionKey = ctx.SessionKey;
  const startTime = diagnosticsEnabled ? Date.now() : 0;
  const canTrackSession = diagnosticsEnabled && Boolean(sessionKey);
  const recordProcessed = (outcome, opts) => {
    if (!diagnosticsEnabled) return;
    (0, _diagnosticCCecAk.r)({
      channel,
      chatId,
      messageId,
      sessionKey,
      durationMs: Date.now() - startTime,
      outcome,
      reason: opts?.reason,
      error: opts?.error
    });
  };
  const markProcessing = () => {
    if (!canTrackSession || !sessionKey) return;
    (0, _diagnosticCCecAk.i)({
      sessionKey,
      channel,
      source: "dispatch"
    });
    (0, _diagnosticCCecAk.o)({
      sessionKey,
      state: "processing",
      reason: "message_start"
    });
  };
  const markIdle = (reason) => {
    if (!canTrackSession || !sessionKey) return;
    (0, _diagnosticCCecAk.o)({
      sessionKey,
      state: "idle",
      reason
    });
  };
  const inboundDedupeClaim = claimInboundDedupe(ctx);
  if (inboundDedupeClaim.status === "duplicate" || inboundDedupeClaim.status === "inflight") {
    recordProcessed("skipped", { reason: "duplicate" });
    return {
      queuedFinal: false,
      counts: dispatcher.getQueuedCounts()
    };
  }
  const sessionStoreEntry = resolveSessionStoreLookup(ctx, cfg);
  const acpDispatchSessionKey = sessionStoreEntry.sessionKey ?? sessionKey;
  const sessionAgentId = (0, _agentScopeKFH9bkHi.p)({
    sessionKey: acpDispatchSessionKey,
    config: cfg
  });
  const sessionAgentCfg = (0, _agentScopeKFH9bkHi._)(cfg, sessionAgentId);
  const shouldEmitVerboseProgress = createShouldEmitVerboseProgress({
    sessionKey: acpDispatchSessionKey,
    storePath: sessionStoreEntry.storePath,
    fallbackLevel: (0, _thinkingSharedCAbk7EZs.d)(sessionStoreEntry.entry?.verboseLevel ?? sessionAgentCfg?.verboseDefault ?? cfg.agents?.defaults?.verboseDefault ?? "") ?? "off"
  });
  const routeThreadId = ctx.MessageThreadId ?? (0, _threadInfoDA0w7q1W.n)(acpDispatchSessionKey).threadId;
  const inboundAudio = isInboundAudioContext(ctx);
  const sessionTtsAuto = (0, _ttsAutoModeZhfpRKB.n)(sessionStoreEntry.entry?.ttsAuto);
  const hookRunner = (0, _hookRunnerGlobalCYvQf43U.t)();
  const timestamp = typeof ctx.Timestamp === "number" && Number.isFinite(ctx.Timestamp) ? ctx.Timestamp : void 0;
  const hookContext = (0, _messageHookMappersV58z7z2I.n)(ctx, { messageId: ctx.MessageSidFull ?? ctx.MessageSid ?? ctx.MessageSidFirst ?? ctx.MessageSidLast });
  const { isGroup, groupId } = hookContext;
  const inboundClaimContext = (0, _messageHookMappersV58z7z2I.s)(hookContext);
  const inboundClaimEvent = (0, _messageHookMappersV58z7z2I.c)(hookContext, {
    commandAuthorized: typeof ctx.CommandAuthorized === "boolean" ? ctx.CommandAuthorized : void 0,
    wasMentioned: typeof ctx.WasMentioned === "boolean" ? ctx.WasMentioned : void 0
  });
  const suppressAcpChildUserDelivery = isParentOwnedBackgroundAcpSession(sessionStoreEntry.entry);
  const normalizedOriginatingChannel = (0, _messageChannelCBqCPFa_.u)(ctx.OriginatingChannel);
  const normalizedProviderChannel = (0, _messageChannelCBqCPFa_.u)(ctx.Provider);
  const normalizedSurfaceChannel = (0, _messageChannelCBqCPFa_.u)(ctx.Surface);
  const normalizedCurrentSurface = normalizedProviderChannel ?? normalizedSurfaceChannel;
  const isInternalWebchatTurn = normalizedCurrentSurface === "webchat" && (normalizedSurfaceChannel === "webchat" || !normalizedSurfaceChannel) && ctx.ExplicitDeliverRoute !== true;
  const routeReplyRuntime = Boolean(!suppressAcpChildUserDelivery && !isInternalWebchatTurn && normalizedOriginatingChannel && ctx.OriginatingTo && normalizedOriginatingChannel !== normalizedCurrentSurface) ? await loadRouteReplyRuntime() : void 0;
  const { originatingChannel, currentSurface, shouldRouteToOriginating, shouldSuppressTyping } = resolveReplyRoutingDecision({
    provider: ctx.Provider,
    surface: ctx.Surface,
    explicitDeliverRoute: ctx.ExplicitDeliverRoute,
    originatingChannel: ctx.OriginatingChannel,
    originatingTo: ctx.OriginatingTo,
    suppressDirectUserDelivery: suppressAcpChildUserDelivery,
    isRoutableChannel: routeReplyRuntime?.isRoutableChannel ?? (() => false)
  });
  const originatingTo = ctx.OriginatingTo;
  const ttsChannel = shouldRouteToOriginating ? originatingChannel : currentSurface;
  const { createReplyMediaPathNormalizer } = await loadReplyMediaPathsRuntime();
  const normalizeReplyMediaPaths = createReplyMediaPathNormalizer({
    cfg,
    sessionKey: acpDispatchSessionKey,
    workspaceDir: (0, _agentScopeKFH9bkHi.b)(cfg, sessionAgentId),
    messageProvider: ttsChannel,
    accountId: ctx.AccountId,
    groupId,
    groupChannel: ctx.GroupChannel,
    groupSpace: ctx.GroupSpace,
    requesterSenderId: ctx.SenderId,
    requesterSenderName: ctx.SenderName,
    requesterSenderUsername: ctx.SenderUsername,
    requesterSenderE164: ctx.SenderE164
  });
  const normalizeReplyMediaPayload = async (payload) => {
    if (!(0, _replyPayloadDb_8BQiX.p)(payload).hasMedia) return payload;
    return await normalizeReplyMediaPaths(payload);
  };
  const routeReplyToOriginating = async (payload, options) => {
    if (!shouldRouteToOriginating || !originatingChannel || !originatingTo || !routeReplyRuntime) return null;
    return await routeReplyRuntime.routeReply({
      payload,
      channel: originatingChannel,
      to: originatingTo,
      sessionKey: ctx.SessionKey,
      accountId: ctx.AccountId,
      requesterSenderId: ctx.SenderId,
      requesterSenderName: ctx.SenderName,
      requesterSenderUsername: ctx.SenderUsername,
      requesterSenderE164: ctx.SenderE164,
      threadId: routeThreadId,
      cfg,
      abortSignal: options?.abortSignal,
      mirror: options?.mirror,
      isGroup,
      groupId
    });
  };
  /**
  * Helper to send a payload via route-reply (async).
  * Only used when actually routing to a different provider.
  * Note: Only called when shouldRouteToOriginating is true, so
  * originatingChannel and originatingTo are guaranteed to be defined.
  */
  const sendPayloadAsync = async (payload, abortSignal, mirror) => {
    if (!routeReplyRuntime || !originatingChannel || !originatingTo) return;
    if (abortSignal?.aborted) return;
    const result = await routeReplyToOriginating(payload, {
      abortSignal,
      mirror
    });
    if (result && !result.ok) (0, _globalsDe6QTwLG.r)(`dispatch-from-config: route-reply failed: ${result.error ?? "unknown error"}`);
  };
  const sendBindingNotice = async (payload, mode) => {
    const result = await routeReplyToOriginating(payload);
    if (result) {
      if (!result.ok) (0, _globalsDe6QTwLG.r)(`dispatch-from-config: route-reply (plugin binding notice) failed: ${result.error ?? "unknown error"}`);
      return result.ok;
    }
    return mode === "additive" ? dispatcher.sendToolResult(payload) : dispatcher.sendFinalReply(payload);
  };
  const pluginOwnedBindingRecord = inboundClaimContext.conversationId && inboundClaimContext.channelId ? (0, _conversationBindingCOoBmA8F.y)({
    channel: inboundClaimContext.channelId,
    accountId: inboundClaimContext.accountId ?? cfg.channels?.[inboundClaimContext.channelId]?.defaultAccount ?? "default",
    conversationId: inboundClaimContext.conversationId,
    parentConversationId: inboundClaimContext.parentConversationId
  }) : null;
  const pluginOwnedBinding = (0, _conversationBindingCOoBmA8F.u)(pluginOwnedBindingRecord) ? (0, _conversationBindingCOoBmA8F.h)(pluginOwnedBindingRecord) : null;
  const sendPolicy = (0, _sendPolicyDyHi525p.n)({
    cfg,
    entry: sessionStoreEntry.entry,
    sessionKey: sessionStoreEntry.sessionKey ?? sessionKey,
    channel: sessionStoreEntry.entry?.channel ?? ctx.OriginatingChannel ?? ctx.Surface ?? ctx.Provider ?? void 0,
    chatType: sessionStoreEntry.entry?.chatType
  });
  const suppressDelivery = sendPolicy === "deny";
  const suppressHookUserDelivery = suppressAcpChildUserDelivery || suppressDelivery;
  let pluginFallbackReason;
  if (pluginOwnedBinding) {
    (0, _conversationBindingCOoBmA8F.b)(pluginOwnedBinding.bindingId);
    if (suppressDelivery) (0, _globalsDe6QTwLG.r)(`plugin-bound inbound skipped under sendPolicy: deny (plugin=${pluginOwnedBinding.pluginId} session=${sessionKey ?? "unknown"}); falling through to suppressed agent processing`);else
    {
      (0, _globalsDe6QTwLG.r)(`plugin-bound inbound routed to ${pluginOwnedBinding.pluginId} conversation=${pluginOwnedBinding.conversationId}`);
      const targetedClaimOutcome = hookRunner?.runInboundClaimForPluginOutcome ? await hookRunner.runInboundClaimForPluginOutcome(pluginOwnedBinding.pluginId, inboundClaimEvent, inboundClaimContext) : (0, _hookRunnerGlobalCYvQf43U.n)()?.plugins.some((plugin) => plugin.id === pluginOwnedBinding.pluginId && plugin.status === "loaded") ?? false ? { status: "no_handler" } : { status: "missing_plugin" };
      switch (targetedClaimOutcome.status) {
        case "handled":
          markIdle("plugin_binding_dispatch");
          recordProcessed("completed", { reason: "plugin-bound-handled" });
          return {
            queuedFinal: false,
            counts: dispatcher.getQueuedCounts()
          };
        case "missing_plugin":
        case "no_handler":
          pluginFallbackReason = targetedClaimOutcome.status === "missing_plugin" ? "plugin-bound-fallback-missing-plugin" : "plugin-bound-fallback-no-handler";
          if (!(0, _conversationBindingCOoBmA8F.c)(pluginOwnedBinding.bindingId)) {
            if (await sendBindingNotice({ text: (0, _conversationBindingCOoBmA8F.a)(pluginOwnedBinding) }, "additive")) (0, _conversationBindingCOoBmA8F.d)(pluginOwnedBinding.bindingId);
          }
          break;
        case "declined":
          await sendBindingNotice({ text: (0, _conversationBindingCOoBmA8F.n)(pluginOwnedBinding) }, "terminal");
          markIdle("plugin_binding_declined");
          recordProcessed("completed", { reason: "plugin-bound-declined" });
          return {
            queuedFinal: false,
            counts: dispatcher.getQueuedCounts()
          };
        case "error":
          (0, _globalsDe6QTwLG.r)(`plugin-bound inbound claim failed for ${pluginOwnedBinding.pluginId}: ${targetedClaimOutcome.error}`);
          await sendBindingNotice({ text: (0, _conversationBindingCOoBmA8F.r)(pluginOwnedBinding) }, "terminal");
          markIdle("plugin_binding_error");
          recordProcessed("completed", { reason: "plugin-bound-error" });
          return {
            queuedFinal: false,
            counts: dispatcher.getQueuedCounts()
          };
      }
    }
  }
  if (hookRunner?.hasHooks("message_received")) (0, _messageHookMappersV58z7z2I.f)(hookRunner.runMessageReceived((0, _messageHookMappersV58z7z2I.u)(hookContext), (0, _messageHookMappersV58z7z2I.l)(hookContext)), "dispatch-from-config: message_received plugin hook failed");
  if (sessionKey) (0, _messageHookMappersV58z7z2I.f)((0, _internalHooks4i4Rq3Qq.m)((0, _internalHooks4i4Rq3Qq.n)("message", "received", sessionKey, {
    ...(0, _messageHookMappersV58z7z2I.i)(hookContext),
    timestamp
  })), "dispatch-from-config: message_received internal hook failed");
  markProcessing();
  try {
    const abortRuntime = params.fastAbortResolver ? null : await loadAbortRuntime();
    const fastAbortResolver = params.fastAbortResolver ?? abortRuntime?.tryFastAbortFromMessage;
    const formatAbortReplyTextResolver = params.formatAbortReplyTextResolver ?? abortRuntime?.formatAbortReplyText;
    if (!fastAbortResolver || !formatAbortReplyTextResolver) throw new Error("abort runtime unavailable");
    const fastAbort = await fastAbortResolver({
      ctx,
      cfg
    });
    if (fastAbort.handled) {
      let queuedFinal = false;
      let routedFinalCount = 0;
      if (!suppressDelivery) {
        const payload = { text: formatAbortReplyTextResolver(fastAbort.stoppedSubagents) };
        const result = await routeReplyToOriginating(payload);
        if (result) {
          queuedFinal = result.ok;
          if (result.ok) routedFinalCount += 1;
          if (!result.ok) (0, _globalsDe6QTwLG.r)(`dispatch-from-config: route-reply (abort) failed: ${result.error ?? "unknown error"}`);
        } else queuedFinal = dispatcher.sendFinalReply(payload);
      } else (0, _globalsDe6QTwLG.r)(`dispatch-from-config: fast_abort reply suppressed by sendPolicy: deny (session=${sessionKey ?? "unknown"})`);
      const counts = dispatcher.getQueuedCounts();
      counts.final += routedFinalCount;
      recordProcessed("completed", { reason: "fast_abort" });
      markIdle("message_completed");
      return {
        queuedFinal,
        counts
      };
    }
    const shouldSendToolSummaries = ctx.ChatType !== "group" || ctx.IsForum === true;
    const shouldSendToolStartStatuses = ctx.ChatType !== "group" || ctx.IsForum === true;
    const sendFinalPayload = async (payload) => {
      const normalizedPayload = await normalizeReplyMediaPayload(await maybeApplyTtsToReplyPayload({
        payload,
        cfg,
        channel: ttsChannel,
        kind: "final",
        inboundAudio,
        ttsAuto: sessionTtsAuto
      }));
      const result = await routeReplyToOriginating(normalizedPayload);
      if (result) {
        if (!result.ok) (0, _globalsDe6QTwLG.r)(`dispatch-from-config: route-reply (final) failed: ${result.error ?? "unknown error"}`);
        return {
          queuedFinal: result.ok,
          routedFinalCount: result.ok ? 1 : 0
        };
      }
      return {
        queuedFinal: dispatcher.sendFinalReply(normalizedPayload),
        routedFinalCount: 0
      };
    };
    if (hookRunner?.hasHooks("before_dispatch")) {
      const beforeDispatchResult = await hookRunner.runBeforeDispatch({
        content: hookContext.content,
        body: hookContext.bodyForAgent ?? hookContext.body,
        channel: hookContext.channelId,
        sessionKey: sessionStoreEntry.sessionKey ?? sessionKey,
        senderId: hookContext.senderId,
        isGroup: hookContext.isGroup,
        timestamp: hookContext.timestamp
      }, {
        channelId: hookContext.channelId,
        accountId: hookContext.accountId,
        conversationId: inboundClaimContext.conversationId,
        sessionKey: sessionStoreEntry.sessionKey ?? sessionKey,
        senderId: hookContext.senderId
      });
      if (beforeDispatchResult?.handled) {
        const text = beforeDispatchResult.text;
        let queuedFinal = false;
        let routedFinalCount = 0;
        if (text && !suppressDelivery) {
          const handledReply = await sendFinalPayload({ text });
          queuedFinal = handledReply.queuedFinal;
          routedFinalCount += handledReply.routedFinalCount;
        }
        const counts = dispatcher.getQueuedCounts();
        counts.final += routedFinalCount;
        recordProcessed("completed", { reason: "before_dispatch_handled" });
        markIdle("message_completed");
        return {
          queuedFinal,
          counts
        };
      }
    }
    if (hookRunner?.hasHooks("reply_dispatch")) {
      const replyDispatchResult = await hookRunner.runReplyDispatch({
        ctx,
        runId: params.replyOptions?.runId,
        sessionKey: acpDispatchSessionKey,
        inboundAudio,
        sessionTtsAuto,
        ttsChannel,
        suppressUserDelivery: suppressHookUserDelivery,
        shouldRouteToOriginating,
        originatingChannel,
        originatingTo,
        shouldSendToolSummaries,
        sendPolicy
      }, {
        cfg,
        dispatcher,
        abortSignal: params.replyOptions?.abortSignal,
        onReplyStart: params.replyOptions?.onReplyStart,
        recordProcessed,
        markIdle
      });
      if (replyDispatchResult?.handled) return {
        queuedFinal: replyDispatchResult.queuedFinal,
        counts: replyDispatchResult.counts
      };
    }
    if (suppressDelivery) (0, _globalsDe6QTwLG.r)(`Delivery suppressed by send policy for session ${sessionStoreEntry.sessionKey ?? sessionKey ?? "unknown"} — agent will still process the message`);
    const toolStartStatusesSent = /* @__PURE__ */new Set();
    let toolStartStatusCount = 0;
    const normalizeWorkingLabel = (label) => {
      const collapsed = label.replace(/\s+/g, " ").trim();
      if (collapsed.length <= 80) return collapsed;
      return `${collapsed.slice(0, 77).trimEnd()}...`;
    };
    const formatPlanUpdateText = (payload) => {
      const explanation = payload.explanation?.replace(/\s+/g, " ").trim();
      const steps = (payload.steps ?? []).map((step) => step.replace(/\s+/g, " ").trim()).filter(Boolean);
      const parts = [];
      if (explanation) parts.push(explanation);
      if (steps.length > 0) parts.push(steps.map((step, index) => `${index + 1}. ${step}`).join("\n"));
      return parts.join("\n\n").trim() || "Planning next steps.";
    };
    const maybeSendWorkingStatus = async (label) => {
      if (suppressDelivery) return;
      const normalizedLabel = normalizeWorkingLabel(label);
      if (!shouldEmitVerboseProgress() || !shouldSendToolStartStatuses || !normalizedLabel || toolStartStatusCount >= 2 || toolStartStatusesSent.has(normalizedLabel)) return;
      toolStartStatusesSent.add(normalizedLabel);
      toolStartStatusCount += 1;
      const payload = { text: `Working: ${normalizedLabel}` };
      if (shouldRouteToOriginating) {
        await sendPayloadAsync(payload, void 0, false);
        return;
      }
      dispatcher.sendToolResult(payload);
    };
    const sendPlanUpdate = async (payload) => {
      if (suppressDelivery || !shouldEmitVerboseProgress()) return;
      const replyPayload = { text: formatPlanUpdateText(payload) };
      if (shouldRouteToOriginating) {
        await sendPayloadAsync(replyPayload, void 0, false);
        return;
      }
      dispatcher.sendToolResult(replyPayload);
    };
    const summarizeApprovalLabel = (payload) => {
      if (payload.status === "pending") {
        const command = (0, _stringCoerceBUSzWgUA.s)(payload.command);
        if (command) return normalizeWorkingLabel(`awaiting approval: ${command}`);
        return "awaiting approval";
      }
      if (payload.status === "unavailable") {
        const message = (0, _stringCoerceBUSzWgUA.s)(payload.message);
        if (message) return normalizeWorkingLabel(message);
        return "approval unavailable";
      }
      return "";
    };
    const summarizePatchLabel = (payload) => {
      const summary = (0, _stringCoerceBUSzWgUA.s)(payload.summary);
      if (summary) return normalizeWorkingLabel(summary);
      const title = (0, _stringCoerceBUSzWgUA.s)(payload.title);
      if (title) return normalizeWorkingLabel(title);
      return "";
    };
    let accumulatedBlockText = "";
    let blockCount = 0;
    const resolveToolDeliveryPayload = (payload) => {
      if (shouldSuppressLocalExecApprovalPrompt({
        channel: (0, _messageChannelCBqCPFa_.u)(ctx.Surface ?? ctx.Provider),
        cfg,
        accountId: ctx.AccountId,
        payload
      })) return null;
      if (shouldSendToolSummaries) return payload;
      const execApproval = payload.channelData && typeof payload.channelData === "object" && !Array.isArray(payload.channelData) ? payload.channelData.execApproval : void 0;
      if (execApproval && typeof execApproval === "object" && !Array.isArray(execApproval)) return payload;
      if (!(0, _replyPayloadDb_8BQiX.p)(payload).hasMedia) return null;
      return {
        ...payload,
        text: void 0
      };
    };
    const typing = (0, _typingPolicyCKG7EO6n.t)({
      requestedPolicy: params.replyOptions?.typingPolicy,
      suppressTyping: suppressDelivery || params.replyOptions?.suppressTyping === true || shouldSuppressTyping,
      originatingChannel,
      systemEvent: shouldRouteToOriginating
    });
    const replyResult = await (params.replyResolver ?? (await loadGetReplyFromConfigRuntime()).getReplyFromConfig)(ctx, {
      ...params.replyOptions,
      typingPolicy: typing.typingPolicy,
      suppressTyping: typing.suppressTyping,
      onToolResult: (payload) => {
        const run = async () => {
          if (suppressDelivery) return;
          const deliveryPayload = resolveToolDeliveryPayload(await normalizeReplyMediaPayload(await maybeApplyTtsToReplyPayload({
            payload,
            cfg,
            channel: ttsChannel,
            kind: "tool",
            inboundAudio,
            ttsAuto: sessionTtsAuto
          })));
          if (!deliveryPayload) return;
          if (shouldRouteToOriginating) await sendPayloadAsync(deliveryPayload, void 0, false);else
          dispatcher.sendToolResult(deliveryPayload);
        };
        return run();
      },
      onPlanUpdate: async ({ phase, explanation, steps }) => {
        if (phase !== "update") return;
        await sendPlanUpdate({
          explanation,
          steps
        });
      },
      onApprovalEvent: async ({ phase, status, command, message }) => {
        if (phase !== "requested") return;
        const label = summarizeApprovalLabel({
          status,
          command,
          message
        });
        if (!label) return;
        await maybeSendWorkingStatus(label);
      },
      onPatchSummary: async ({ phase, summary, title }) => {
        if (phase !== "end") return;
        const label = summarizePatchLabel({
          summary,
          title
        });
        if (!label) return;
        await maybeSendWorkingStatus(label);
      },
      onBlockReply: (payload, context) => {
        const run = async () => {
          if (suppressDelivery) return;
          if (payload.isReasoning === true) return;
          if (payload.text && !payload.isCompactionNotice) {
            if (accumulatedBlockText.length > 0) accumulatedBlockText += "\n";
            accumulatedBlockText += payload.text;
            blockCount++;
          }
          const payloadMetadata = (0, _replyPayloadDsrzRv7F.t)(payload);
          const queuedContext = payloadMetadata?.assistantMessageIndex !== void 0 ? {
            ...context,
            assistantMessageIndex: payloadMetadata.assistantMessageIndex
          } : context;
          await params.replyOptions?.onBlockReplyQueued?.(payload, queuedContext);
          const normalizedPayload = await normalizeReplyMediaPayload(await maybeApplyTtsToReplyPayload({
            payload,
            cfg,
            channel: ttsChannel,
            kind: "block",
            inboundAudio,
            ttsAuto: sessionTtsAuto
          }));
          if (shouldRouteToOriginating) await sendPayloadAsync(normalizedPayload, context?.abortSignal, false);else
          dispatcher.sendBlockReply(normalizedPayload);
        };
        return run();
      }
    }, params.configOverride);
    if (ctx.AcpDispatchTailAfterReset === true) {
      ctx.AcpDispatchTailAfterReset = false;
      if (hookRunner?.hasHooks("reply_dispatch")) {
        const tailDispatchResult = await hookRunner.runReplyDispatch({
          ctx,
          runId: params.replyOptions?.runId,
          sessionKey: acpDispatchSessionKey,
          inboundAudio,
          sessionTtsAuto,
          ttsChannel,
          suppressUserDelivery: suppressHookUserDelivery,
          shouldRouteToOriginating,
          originatingChannel,
          originatingTo,
          shouldSendToolSummaries,
          sendPolicy,
          isTailDispatch: true
        }, {
          cfg,
          dispatcher,
          abortSignal: params.replyOptions?.abortSignal,
          onReplyStart: params.replyOptions?.onReplyStart,
          recordProcessed,
          markIdle
        });
        if (tailDispatchResult?.handled) return {
          queuedFinal: tailDispatchResult.queuedFinal,
          counts: tailDispatchResult.counts
        };
      }
    }
    const replies = replyResult ? Array.isArray(replyResult) ? replyResult : [replyResult] : [];
    let queuedFinal = false;
    let routedFinalCount = 0;
    if (!suppressDelivery) {
      for (const reply of replies) {
        if (reply.isReasoning === true) continue;
        const finalReply = await sendFinalPayload(reply);
        queuedFinal = finalReply.queuedFinal || queuedFinal;
        routedFinalCount += finalReply.routedFinalCount;
      }
      if ((0, _ttsConfigCHNuDmRE.t)(cfg) === "final" && replies.length === 0 && blockCount > 0 && accumulatedBlockText.trim()) try {
        const ttsSyntheticReply = await maybeApplyTtsToReplyPayload({
          payload: { text: accumulatedBlockText },
          cfg,
          channel: ttsChannel,
          kind: "final",
          inboundAudio,
          ttsAuto: sessionTtsAuto
        });
        if (ttsSyntheticReply.mediaUrl) {
          const ttsOnlyPayload = {
            mediaUrl: ttsSyntheticReply.mediaUrl,
            audioAsVoice: ttsSyntheticReply.audioAsVoice
          };
          const result = await routeReplyToOriginating(ttsOnlyPayload);
          if (result) {
            queuedFinal = result.ok || queuedFinal;
            if (result.ok) routedFinalCount += 1;
            if (!result.ok) (0, _globalsDe6QTwLG.r)(`dispatch-from-config: route-reply (tts-only) failed: ${result.error ?? "unknown error"}`);
          } else queuedFinal = dispatcher.sendFinalReply(ttsOnlyPayload) || queuedFinal;
        }
      } catch (err) {
        (0, _globalsDe6QTwLG.r)(`dispatch-from-config: accumulated block TTS failed: ${(0, _errorsD8p6rxH.i)(err)}`);
      }
    }
    const counts = dispatcher.getQueuedCounts();
    counts.final += routedFinalCount;
    if (inboundDedupeClaim.status === "claimed") commitInboundDedupe(inboundDedupeClaim.key);
    recordProcessed("completed", pluginFallbackReason ? { reason: pluginFallbackReason } : void 0);
    markIdle("message_completed");
    return {
      queuedFinal,
      counts
    };
  } catch (err) {
    if (inboundDedupeClaim.status === "claimed") releaseInboundDedupe(inboundDedupeClaim.key);
    recordProcessed("error", { error: String(err) });
    markIdle("message_error");
    throw err;
  }
}
//#endregion
//#region src/auto-reply/reply/dispatcher-registry.ts
const activeDispatchers = /* @__PURE__ */new Set();
let nextId = 0;
/**
* Register a reply dispatcher for global tracking.
* Returns an unregister function to call when the dispatcher is no longer needed.
*/
function registerDispatcher(dispatcher) {
  const id = `dispatcher-${++nextId}`;
  const tracked = {
    id,
    pending: dispatcher.pending,
    waitForIdle: dispatcher.waitForIdle
  };
  activeDispatchers.add(tracked);
  const unregister = () => {
    activeDispatchers.delete(tracked);
  };
  return {
    id,
    unregister
  };
}
/**
* Get the total number of pending replies across all dispatchers.
*/
function getTotalPendingReplies() {
  let total = 0;
  for (const dispatcher of activeDispatchers) total += dispatcher.pending();
  return total;
}
//#endregion
//#region src/auto-reply/reply/reply-dispatcher.ts
const DEFAULT_HUMAN_DELAY_MIN_MS = 800;
const DEFAULT_HUMAN_DELAY_MAX_MS = 2500;
/** Generate a random delay within the configured range. */
function getHumanDelay(config) {
  const mode = config?.mode ?? "off";
  if (mode === "off") return 0;
  const min = mode === "custom" ? config?.minMs ?? DEFAULT_HUMAN_DELAY_MIN_MS : DEFAULT_HUMAN_DELAY_MIN_MS;
  const max = mode === "custom" ? config?.maxMs ?? DEFAULT_HUMAN_DELAY_MAX_MS : DEFAULT_HUMAN_DELAY_MAX_MS;
  if (max <= min) return min;
  return min + (0, _secureRandomDHoiZOqc.r)(max - min + 1);
}
function normalizeReplyPayloadInternal(payload, opts) {
  const prefixContext = opts.responsePrefixContextProvider?.() ?? opts.responsePrefixContext;
  return (0, _normalizeReplyBD7ABbmk.t)(payload, {
    responsePrefix: opts.responsePrefix,
    responsePrefixContext: prefixContext,
    onHeartbeatStrip: opts.onHeartbeatStrip,
    transformReplyPayload: opts.transformReplyPayload,
    onSkip: opts.onSkip
  });
}
function createReplyDispatcher(options) {
  let sendChain = Promise.resolve();
  let pending = 1;
  let completeCalled = false;
  let sentFirstBlock = false;
  const queuedCounts = {
    tool: 0,
    block: 0,
    final: 0
  };
  const failedCounts = {
    tool: 0,
    block: 0,
    final: 0
  };
  const { unregister } = registerDispatcher({
    pending: () => pending,
    waitForIdle: () => sendChain
  });
  const enqueue = (kind, payload) => {
    const normalized = normalizeReplyPayloadInternal(payload, {
      responsePrefix: options.responsePrefix,
      responsePrefixContext: options.responsePrefixContext,
      responsePrefixContextProvider: options.responsePrefixContextProvider,
      transformReplyPayload: options.transformReplyPayload,
      onHeartbeatStrip: options.onHeartbeatStrip,
      onSkip: (reason) => options.onSkip?.(payload, {
        kind,
        reason
      })
    });
    if (!normalized) return false;
    queuedCounts[kind] += 1;
    pending += 1;
    const shouldDelay = kind === "block" && sentFirstBlock;
    if (kind === "block") sentFirstBlock = true;
    sendChain = sendChain.then(async () => {
      if (shouldDelay) {
        const delayMs = getHumanDelay(options.humanDelay);
        if (delayMs > 0) await (0, _utilsD5DtWkEu.v)(delayMs);
      }
      await options.deliver(normalized, { kind });
    }).catch((err) => {
      failedCounts[kind] += 1;
      options.onError?.(err, { kind });
    }).finally(() => {
      pending -= 1;
      if (pending === 1 && completeCalled) pending -= 1;
      if (pending === 0) {
        unregister();
        options.onIdle?.();
      }
    });
    return true;
  };
  const markComplete = () => {
    if (completeCalled) return;
    completeCalled = true;
    Promise.resolve().then(() => {
      if (pending === 1 && completeCalled) {
        pending -= 1;
        if (pending === 0) {
          unregister();
          options.onIdle?.();
        }
      }
    });
  };
  return {
    sendToolResult: (payload) => enqueue("tool", payload),
    sendBlockReply: (payload) => enqueue("block", payload),
    sendFinalReply: (payload) => enqueue("final", payload),
    waitForIdle: () => sendChain,
    getQueuedCounts: () => ({ ...queuedCounts }),
    getFailedCounts: () => ({ ...failedCounts }),
    markComplete
  };
}
function createReplyDispatcherWithTyping(options) {
  const { typingCallbacks, onReplyStart, onIdle, onCleanup, ...dispatcherOptions } = options;
  const resolvedOnReplyStart = onReplyStart ?? typingCallbacks?.onReplyStart;
  const resolvedOnIdle = onIdle ?? typingCallbacks?.onIdle;
  const resolvedOnCleanup = onCleanup ?? typingCallbacks?.onCleanup;
  let typingController;
  return {
    dispatcher: createReplyDispatcher({
      ...dispatcherOptions,
      onIdle: () => {
        typingController?.markDispatchIdle();
        resolvedOnIdle?.();
      }
    }),
    replyOptions: {
      onReplyStart: resolvedOnReplyStart,
      onTypingCleanup: resolvedOnCleanup,
      onTypingController: (typing) => {
        typingController = typing;
      }
    },
    markDispatchIdle: () => {
      typingController?.markDispatchIdle();
      resolvedOnIdle?.();
    },
    markRunComplete: () => {
      typingController?.markRunComplete();
    }
  };
}
//#endregion
//#region src/auto-reply/dispatch.ts
async function dispatchInboundMessage(params) {
  const finalized = (0, _inboundContext3c7B1YUQ.t)(params.ctx);
  return await withReplyDispatcher({
    dispatcher: params.dispatcher,
    run: () => dispatchReplyFromConfig({
      ctx: finalized,
      cfg: params.cfg,
      dispatcher: params.dispatcher,
      replyOptions: params.replyOptions,
      replyResolver: params.replyResolver
    })
  });
}
async function dispatchInboundMessageWithBufferedDispatcher(params) {
  const { dispatcher, replyOptions, markDispatchIdle, markRunComplete } = createReplyDispatcherWithTyping(params.dispatcherOptions);
  try {
    return await dispatchInboundMessage({
      ctx: params.ctx,
      cfg: params.cfg,
      dispatcher,
      replyResolver: params.replyResolver,
      replyOptions: {
        ...params.replyOptions,
        ...replyOptions
      }
    });
  } finally {
    markRunComplete();
    markDispatchIdle();
  }
}
async function dispatchInboundMessageWithDispatcher(params) {
  const dispatcher = createReplyDispatcher(params.dispatcherOptions);
  return await dispatchInboundMessage({
    ctx: params.ctx,
    cfg: params.cfg,
    dispatcher,
    replyResolver: params.replyResolver,
    replyOptions: params.replyOptions
  });
}
//#endregion /* v9-3b0b7cd181e6efff */
