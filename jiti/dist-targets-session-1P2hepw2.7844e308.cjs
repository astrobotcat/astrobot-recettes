"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveOutboundTargetWithPlugin;exports.t = resolveSessionDeliveryTarget;var _commandFormatDd3uP = require("./command-format-Dd3uP9-6.js");
var _messageChannelCoreBIZsQ6dr = require("./message-channel-core-BIZsQ6dr.js");
var _deliveryContextSharedEClQPjt = require("./delivery-context.shared-EClQPjt-.js");
var _targetErrorsYQMrxctE = require("./target-errors-YQMrxctE.js");
var _channelConfigHelpers9F9ZxFrZ = require("./channel-config-helpers-9F9ZxFrZ.js");
var _targetParsingLoadedD7G8Czgr = require("./target-parsing-loaded-D7G8Czgr.js");
//#region src/infra/outbound/targets-resolve-shared.ts
function buildWebChatDeliveryError() {
  return /* @__PURE__ */new Error(`Delivering to WebChat is not supported via \`${(0, _commandFormatDd3uP.t)("openclaw agent")}\`; use WhatsApp/Telegram or run with --deliver=false.`);
}
function resolveOutboundTargetWithPlugin(params) {
  if (params.target.channel === "webchat") return {
    ok: false,
    error: buildWebChatDeliveryError()
  };
  const plugin = params.plugin;
  if (!plugin) return params.onMissingPlugin?.();
  const allowFromRaw = params.target.allowFrom ?? (params.target.cfg && plugin.config.resolveAllowFrom ? plugin.config.resolveAllowFrom({
    cfg: params.target.cfg,
    accountId: params.target.accountId ?? void 0
  }) : void 0);
  const allowFrom = allowFromRaw ? (0, _channelConfigHelpers9F9ZxFrZ.h)(allowFromRaw) : void 0;
  const effectiveTo = params.target.to?.trim() || (params.target.cfg && plugin.config.resolveDefaultTo ? plugin.config.resolveDefaultTo({
    cfg: params.target.cfg,
    accountId: params.target.accountId ?? void 0
  }) : void 0);
  const resolveTarget = plugin.outbound?.resolveTarget;
  if (resolveTarget) return resolveTarget({
    cfg: params.target.cfg,
    to: effectiveTo,
    allowFrom,
    accountId: params.target.accountId ?? void 0,
    mode: params.target.mode ?? "explicit"
  });
  if (effectiveTo) return {
    ok: true,
    to: effectiveTo
  };
  const hint = plugin.messaging?.targetResolver?.hint;
  return {
    ok: false,
    error: (0, _targetErrorsYQMrxctE.n)(plugin.meta.label ?? params.target.channel, hint)
  };
}
//#endregion
//#region src/infra/outbound/targets-session.ts
function parseExplicitTargetWithPlugin(params) {
  const raw = params.raw?.trim();
  if (!raw) return null;
  const provider = params.channel ?? params.fallbackChannel;
  if (!provider) return null;
  return (0, _targetParsingLoadedD7G8Czgr.n)(provider, raw);
}
function resolveSessionDeliveryTarget(params) {
  const context = (0, _deliveryContextSharedEClQPjt.t)(params.entry);
  const sessionLastChannel = context?.channel && (0, _messageChannelCoreBIZsQ6dr.t)(context.channel) ? context.channel : void 0;
  const parsedSessionTarget = sessionLastChannel ? (0, _targetParsingLoadedD7G8Czgr.r)({
    channel: sessionLastChannel,
    rawTarget: context?.to,
    fallbackThreadId: context?.threadId
  }) : null;
  const hasTurnSourceChannel = params.turnSourceChannel != null;
  const parsedTurnSourceTarget = hasTurnSourceChannel && params.turnSourceChannel ? (0, _targetParsingLoadedD7G8Czgr.r)({
    channel: params.turnSourceChannel,
    rawTarget: params.turnSourceTo,
    fallbackThreadId: params.turnSourceThreadId
  }) : null;
  const hasTurnSourceThreadId = parsedTurnSourceTarget?.threadId != null;
  const lastChannel = hasTurnSourceChannel ? params.turnSourceChannel : sessionLastChannel;
  const lastTo = hasTurnSourceChannel ? params.turnSourceTo : context?.to;
  const lastAccountId = hasTurnSourceChannel ? params.turnSourceAccountId : context?.accountId;
  const turnToMatchesSession = !params.turnSourceTo || !context?.to || params.turnSourceChannel === sessionLastChannel && (0, _targetParsingLoadedD7G8Czgr.t)({
    left: parsedTurnSourceTarget,
    right: parsedSessionTarget
  });
  const lastThreadId = hasTurnSourceThreadId ? parsedTurnSourceTarget?.threadId : hasTurnSourceChannel && (params.turnSourceChannel !== sessionLastChannel || !turnToMatchesSession) ? void 0 : parsedSessionTarget?.threadId;
  const rawRequested = params.requestedChannel ?? "last";
  const requested = rawRequested === "last" ? "last" : (0, _messageChannelCoreBIZsQ6dr.n)(rawRequested);
  const requestedChannel = requested === "last" ? "last" : requested && (0, _messageChannelCoreBIZsQ6dr.t)(requested) ? requested : void 0;
  const rawExplicitTo = typeof params.explicitTo === "string" && params.explicitTo.trim() ? params.explicitTo.trim() : void 0;
  let channel = requestedChannel === "last" ? lastChannel : requestedChannel;
  if (!channel && params.fallbackChannel && (0, _messageChannelCoreBIZsQ6dr.t)(params.fallbackChannel)) channel = params.fallbackChannel;
  let explicitTo = rawExplicitTo;
  const parsedExplicitTarget = parseExplicitTargetWithPlugin({
    channel,
    fallbackChannel: !channel ? lastChannel : void 0,
    raw: rawExplicitTo
  });
  if (parsedExplicitTarget?.to) explicitTo = parsedExplicitTarget.to;
  const explicitThreadId = params.explicitThreadId != null && params.explicitThreadId !== "" ? params.explicitThreadId : parsedExplicitTarget?.threadId;
  let to = explicitTo;
  if (!to && lastTo) {
    if (channel && channel === lastChannel) to = lastTo;else
    if (params.allowMismatchedLastTo) to = lastTo;
  }
  const mode = params.mode ?? (explicitTo ? "explicit" : "implicit");
  const accountId = channel && channel === lastChannel ? lastAccountId : void 0;
  const threadId = channel && channel === lastChannel ? mode === "heartbeat" ? hasTurnSourceThreadId ? params.turnSourceThreadId : void 0 : lastThreadId : void 0;
  const resolvedThreadId = explicitThreadId ?? threadId;
  return {
    channel,
    to,
    accountId,
    threadId: resolvedThreadId,
    threadIdExplicit: resolvedThreadId != null && explicitThreadId != null,
    mode,
    lastChannel,
    lastTo,
    lastAccountId,
    lastThreadId
  };
}
//#endregion /* v9-a68b3a524dc31f79 */
