"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = routeReply;exports.t = isRoutableChannel;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _idsCYPyP4SY = require("./ids-CYPyP4SY.js");
var _bundledCGMeVzvo = require("./bundled-CGMeVzvo.js");
require("./registry-CENZffQG.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
require("./message-channel-core-BIZsQ6dr.js");
require("./plugins-D4ODSIPT.js");
var _identityB_Q39IGW = require("./identity-B_Q39IGW.js");
var _payloadCS7dEmmu = require("./payload-CS7dEmmu.js");
var _replyPayloadsDDaF6hKx = require("./reply-payloads-DDaF6hKx.js");
var _sessionContextWJ2aq2e = require("./session-context--WJ2aq2e.js");
var _normalizeReplyBD7ABbmk = require("./normalize-reply-BD7ABbmk.js");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/auto-reply/reply/route-reply.ts
/**
* Provider-agnostic reply router.
*
* Routes replies to the originating channel based on OriginatingChannel/OriginatingTo
* instead of using the session's lastChannel. This ensures replies go back to the
* provider where the message originated, even when the main session is shared
* across multiple providers.
*/
let deliverRuntimePromise = null;
function loadDeliverRuntime() {
  deliverRuntimePromise ??= Promise.resolve().then(() => jitiImport("./deliver-runtime-C_1KCZF4.js").then((m) => _interopRequireWildcard(m)));
  return deliverRuntimePromise;
}
/**
* Routes a reply payload to the specified channel.
*
* This function provides a unified interface for sending messages to any
* supported provider. It's used by the followup queue to route replies
* back to the originating channel when OriginatingChannel/OriginatingTo
* are set.
*/
async function routeReply(params) {
  const { payload, channel, to, accountId, threadId, cfg, abortSignal } = params;
  if ((0, _replyPayloadsDDaF6hKx.a)(payload)) return { ok: true };
  const normalizedChannel = (0, _messageChannelCBqCPFa_.u)(channel);
  const channelId = (0, _registryDelpa74L.i)(channel) ?? (0, _stringCoerceBUSzWgUA.o)(channel) ?? null;
  const loadedPlugin = channelId ? (0, _registryDelpa74L.n)(channelId) : void 0;
  const bundledPlugin = channelId ? (0, _bundledCGMeVzvo.n)(channelId) : void 0;
  const messaging = loadedPlugin?.messaging ?? bundledPlugin?.messaging;
  const threading = loadedPlugin?.threading ?? bundledPlugin?.threading;
  const resolvedAgentId = params.sessionKey ? (0, _agentScopeKFH9bkHi.p)({
    sessionKey: params.sessionKey,
    config: cfg
  }) : void 0;
  const normalized = (0, _normalizeReplyBD7ABbmk.t)(payload, {
    responsePrefix: params.sessionKey ? (0, _identityB_Q39IGW.r)(cfg, resolvedAgentId ?? (0, _agentScopeKFH9bkHi.p)({ config: cfg }), {
      channel: normalizedChannel,
      accountId
    }).responsePrefix : cfg.messages?.responsePrefix === "auto" ? void 0 : cfg.messages?.responsePrefix,
    transformReplyPayload: messaging?.transformReplyPayload ? (nextPayload) => messaging.transformReplyPayload?.({
      payload: nextPayload,
      cfg,
      accountId
    }) ?? nextPayload : void 0
  });
  if (!normalized) return { ok: true };
  const externalPayload = {
    ...normalized,
    text: (0, _replyPayloadsDDaF6hKx.r)(normalized)
  };
  let text = externalPayload.text ?? "";
  let mediaUrls = (externalPayload.mediaUrls?.filter(Boolean) ?? []).length ? externalPayload.mediaUrls?.filter(Boolean) : externalPayload.mediaUrl ? [externalPayload.mediaUrl] : [];
  const replyToId = externalPayload.replyToId;
  const hasChannelData = messaging?.hasStructuredReplyPayload?.({ payload: externalPayload });
  if (!(0, _payloadCS7dEmmu.i)({
    ...externalPayload,
    text,
    mediaUrls
  }, { hasChannelData })) return { ok: true };
  if (channel === "webchat") return {
    ok: false,
    error: "Webchat routing not supported for queued replies"
  };
  if (!channelId) return {
    ok: false,
    error: `Unknown channel: ${String(channel)}`
  };
  if (abortSignal?.aborted) return {
    ok: false,
    error: "Reply routing aborted"
  };
  const replyTransport = threading?.resolveReplyTransport?.({
    cfg,
    accountId,
    threadId,
    replyToId
  }) ?? null;
  const resolvedReplyToId = replyTransport?.replyToId ?? replyToId ?? void 0;
  const resolvedThreadId = replyTransport && Object.hasOwn(replyTransport, "threadId") ? replyTransport.threadId ?? null : threadId ?? null;
  try {
    const { deliverOutboundPayloads } = await loadDeliverRuntime();
    const outboundSession = (0, _sessionContextWJ2aq2e.t)({
      cfg,
      agentId: resolvedAgentId,
      sessionKey: params.sessionKey,
      requesterSenderId: params.requesterSenderId,
      requesterSenderName: params.requesterSenderName,
      requesterSenderUsername: params.requesterSenderUsername,
      requesterSenderE164: params.requesterSenderE164
    });
    return {
      ok: true,
      messageId: (await deliverOutboundPayloads({
        cfg,
        channel: channelId,
        to,
        accountId: accountId ?? void 0,
        payloads: [externalPayload],
        replyToId: resolvedReplyToId ?? null,
        threadId: resolvedThreadId,
        session: outboundSession,
        abortSignal,
        mirror: params.mirror !== false && params.sessionKey ? {
          sessionKey: params.sessionKey,
          agentId: resolvedAgentId,
          text,
          mediaUrls,
          ...(params.isGroup != null ? { isGroup: params.isGroup } : {}),
          ...(params.groupId ? { groupId: params.groupId } : {})
        } : void 0
      })).at(-1)?.messageId
    };
  } catch (err) {
    return {
      ok: false,
      error: `Failed to route reply to ${channel}: ${(0, _errorsD8p6rxH.i)(err)}`
    };
  }
}
/**
* Checks if a channel type is routable via routeReply.
*
* Some channels (webchat) require special handling and cannot be routed through
* this generic interface.
*/
function isRoutableChannel(channel) {
  if (!channel || channel === "webchat") return false;
  return (0, _idsCYPyP4SY.r)(channel) !== null || (0, _registryDelpa74L.i)(channel) !== null;
}
//#endregion /* v9-e3545ff7cf8d9108 */
