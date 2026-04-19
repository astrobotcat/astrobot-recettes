"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveHeartbeatSenderContext;exports.r = resolveOutboundTarget;exports.t = resolveHeartbeatDeliveryTarget;var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
require("./message-channel-core-BIZsQ6dr.js");
var _chatTypeDFnPOWna = require("./chat-type-DFnPOWna.js");
var _deliveryContextSharedEClQPjt = require("./delivery-context.shared-EClQPjt-.js");
var _channelResolutionDhbJUhMK = require("./channel-resolution-DhbJUhMK.js");
var _channelConfigHelpers9F9ZxFrZ = require("./channel-config-helpers-9F9ZxFrZ.js");
var _targetsSession1P2hepw = require("./targets-session-1P2hepw2.js");
//#region src/infra/outbound/targets.ts
function resolveOutboundTarget(params) {
  return (0, _targetsSession1P2hepw.n)({
    plugin: (0, _channelResolutionDhbJUhMK.n)({
      channel: params.channel,
      cfg: params.cfg
    }),
    target: params,
    onMissingPlugin: () => params.channel === "webchat" ? void 0 : {
      ok: false,
      error: /* @__PURE__ */new Error(`Unsupported channel: ${params.channel}`)
    }
  }) ?? {
    ok: false,
    error: /* @__PURE__ */new Error(`Unsupported channel: ${params.channel}`)
  };
}
function resolveHeartbeatDeliveryTarget(params) {
  const { cfg, entry } = params;
  const heartbeat = params.heartbeat ?? cfg.agents?.defaults?.heartbeat;
  const rawTarget = heartbeat?.target;
  let target = "none";
  if (rawTarget === "none" || rawTarget === "last") target = rawTarget;else
  if (typeof rawTarget === "string") {
    const normalized = (0, _channelResolutionDhbJUhMK.t)(rawTarget);
    if (normalized) target = normalized;
  }
  if (target === "none") {
    const base = (0, _targetsSession1P2hepw.t)({ entry });
    return buildNoHeartbeatDeliveryTarget({
      reason: "target-none",
      lastChannel: base.lastChannel,
      lastAccountId: base.lastAccountId
    });
  }
  const resolvedTurnSource = target === "last" ? (0, _deliveryContextSharedEClQPjt.r)(params.turnSource, (0, _deliveryContextSharedEClQPjt.t)(entry)) : void 0;
  const resolvedTarget = (0, _targetsSession1P2hepw.t)({
    entry,
    requestedChannel: target === "last" ? "last" : target,
    explicitTo: heartbeat?.to,
    mode: "heartbeat",
    turnSourceChannel: resolvedTurnSource?.channel && (0, _messageChannelCBqCPFa_.s)(resolvedTurnSource.channel) ? resolvedTurnSource.channel : void 0,
    turnSourceTo: resolvedTurnSource?.to,
    turnSourceAccountId: resolvedTurnSource?.accountId,
    turnSourceThreadId: params.turnSource?.threadId
  });
  const heartbeatAccountId = heartbeat?.accountId?.trim();
  let effectiveAccountId = heartbeatAccountId || resolvedTarget.accountId;
  if (heartbeatAccountId && resolvedTarget.channel) {
    const listAccountIds = (0, _channelResolutionDhbJUhMK.n)({
      channel: resolvedTarget.channel,
      cfg
    })?.config.listAccountIds;
    const accountIds = listAccountIds ? listAccountIds(cfg) : [];
    if (accountIds.length > 0) {
      const normalizedAccountId = (0, _accountIdJ7GeQlaZ.n)(heartbeatAccountId);
      if (!new Set(accountIds.map((accountId) => (0, _accountIdJ7GeQlaZ.n)(accountId))).has(normalizedAccountId)) return buildNoHeartbeatDeliveryTarget({
        reason: "unknown-account",
        accountId: normalizedAccountId,
        lastChannel: resolvedTarget.lastChannel,
        lastAccountId: resolvedTarget.lastAccountId
      });
      effectiveAccountId = normalizedAccountId;
    }
  }
  if (!resolvedTarget.channel || !resolvedTarget.to) return buildNoHeartbeatDeliveryTarget({
    reason: "no-target",
    accountId: effectiveAccountId,
    lastChannel: resolvedTarget.lastChannel,
    lastAccountId: resolvedTarget.lastAccountId
  });
  const resolved = resolveOutboundTarget({
    channel: resolvedTarget.channel,
    to: resolvedTarget.to,
    cfg,
    accountId: effectiveAccountId,
    mode: "heartbeat"
  });
  if (!resolved.ok) return buildNoHeartbeatDeliveryTarget({
    reason: "no-target",
    accountId: effectiveAccountId,
    lastChannel: resolvedTarget.lastChannel,
    lastAccountId: resolvedTarget.lastAccountId
  });
  const sessionChatTypeHint = target === "last" && !heartbeat?.to ? (0, _chatTypeDFnPOWna.t)(entry?.chatType) : void 0;
  if (resolveHeartbeatDeliveryChatType({
    channel: resolvedTarget.channel,
    to: resolved.to,
    sessionChatType: sessionChatTypeHint
  }) === "direct" && heartbeat?.directPolicy === "block") return buildNoHeartbeatDeliveryTarget({
    reason: "dm-blocked",
    accountId: effectiveAccountId,
    lastChannel: resolvedTarget.lastChannel,
    lastAccountId: resolvedTarget.lastAccountId
  });
  let reason;
  if ((0, _channelResolutionDhbJUhMK.n)({
    channel: resolvedTarget.channel,
    cfg
  })?.config.resolveAllowFrom) {
    const explicit = resolveOutboundTarget({
      channel: resolvedTarget.channel,
      to: resolvedTarget.to,
      cfg,
      accountId: effectiveAccountId,
      mode: "explicit"
    });
    if (explicit.ok && explicit.to !== resolved.to) reason = "allowFrom-fallback";
  }
  const inheritedHeartbeatThreadId = shouldReuseHeartbeatTelegramTopicThread({
    target,
    heartbeat,
    turnSource: params.turnSource,
    entry,
    resolvedTarget
  }) ? resolvedTarget.lastThreadId : void 0;
  return {
    channel: resolvedTarget.channel,
    to: resolved.to,
    reason,
    accountId: effectiveAccountId,
    threadId: resolvedTarget.threadId ?? inheritedHeartbeatThreadId,
    lastChannel: resolvedTarget.lastChannel,
    lastAccountId: resolvedTarget.lastAccountId
  };
}
function buildNoHeartbeatDeliveryTarget(params) {
  return {
    channel: "none",
    reason: params.reason,
    accountId: params.accountId,
    lastChannel: params.lastChannel,
    lastAccountId: params.lastAccountId
  };
}
function inferChatTypeFromTarget(params) {
  const to = params.to.trim();
  if (!to) return;
  if (/^user:/i.test(to)) return "direct";
  if (/^(channel:|thread:)/i.test(to)) return "channel";
  if (/^group:/i.test(to)) return "group";
  return (0, _channelResolutionDhbJUhMK.n)({ channel: params.channel })?.messaging?.inferTargetChatType?.({ to }) ?? void 0;
}
function resolveHeartbeatDeliveryChatType(params) {
  if (params.sessionChatType) return params.sessionChatType;
  return inferChatTypeFromTarget({
    channel: params.channel,
    to: params.to
  });
}
function shouldReuseHeartbeatTelegramTopicThread(params) {
  return params.resolvedTarget.threadId == null && params.target === "last" && !params.heartbeat?.to && params.turnSource?.threadId == null && params.resolvedTarget.channel === "telegram" && params.resolvedTarget.lastChannel === "telegram" && Boolean(params.resolvedTarget.to) && Boolean(params.resolvedTarget.lastTo) && params.resolvedTarget.to === params.resolvedTarget.lastTo && (0, _chatTypeDFnPOWna.t)(params.entry?.chatType) === "group";
}
function resolveHeartbeatSenderId(params) {
  const { allowFrom, deliveryTo, lastTo, provider } = params;
  const candidates = [
  deliveryTo?.trim(),
  provider && deliveryTo ? `${provider}:${deliveryTo}` : void 0,
  lastTo?.trim(),
  provider && lastTo ? `${provider}:${lastTo}` : void 0].
  filter((val) => Boolean(val?.trim()));
  const allowList = (0, _channelConfigHelpers9F9ZxFrZ.h)(allowFrom).filter((entry) => entry && entry !== "*");
  if (allowFrom.includes("*")) return candidates[0] ?? "heartbeat";
  if (candidates.length > 0 && allowList.length > 0) {
    const matched = candidates.find((candidate) => allowList.includes(candidate));
    if (matched) return matched;
  }
  if (candidates.length > 0 && allowList.length === 0) return candidates[0];
  if (allowList.length > 0) return allowList[0];
  return candidates[0] ?? "heartbeat";
}
function resolveHeartbeatSenderContext(params) {
  const provider = params.delivery.channel !== "none" ? params.delivery.channel : params.delivery.lastChannel;
  const accountId = params.delivery.accountId ?? (provider === params.delivery.lastChannel ? params.delivery.lastAccountId : void 0);
  const allowFrom = (0, _channelConfigHelpers9F9ZxFrZ.h)(provider ? (0, _channelResolutionDhbJUhMK.n)({
    channel: provider,
    cfg: params.cfg
  })?.config.resolveAllowFrom?.({
    cfg: params.cfg,
    accountId
  }) ?? [] : []);
  return {
    sender: resolveHeartbeatSenderId({
      allowFrom,
      deliveryTo: params.delivery.to,
      lastTo: params.entry?.lastTo,
      provider
    }),
    provider,
    allowFrom
  };
}
//#endregion /* v9-c7c06c7609e7418b */
