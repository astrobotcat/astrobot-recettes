"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = doesApprovalRequestMatchChannelAccount;exports.i = resolveExecApprovalSessionTarget;exports.n = resolveApprovalRequestSessionConversation;exports.o = resolveApprovalRequestAccountId;exports.r = resolveApprovalRequestSessionTarget;exports.s = resolveApprovalRequestChannelAccountId;exports.t = resolveApprovalRequestOriginTarget;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
var _storeLoadDjLNEIy = require("./store-load-DjLNEIy9.js");
var _sessionConversationBkRPri5o = require("./session-conversation-BkRPri5o.js");
var _targetsSession1P2hepw = require("./targets-session-1P2hepw2.js");
require("./targets-DbBSGhxR.js");
//#region src/infra/approval-request-account-binding.ts
function normalizeOptionalChannel$1(value) {
  return (0, _messageChannelCBqCPFa_.u)(value);
}
function resolvePersistedApprovalRequestSessionBinding(params) {
  const sessionKey = (0, _stringCoerceBUSzWgUA.s)(params.request.request.sessionKey);
  if (!sessionKey) return null;
  const agentId = (0, _sessionKeyBh1lMwK.x)(sessionKey)?.agentId ?? params.request.request.agentId ?? "main";
  const entry = (0, _storeLoadDjLNEIy.t)((0, _pathsCZMxg3hs.u)(params.cfg.session?.store, { agentId }))[sessionKey];
  if (!entry) return null;
  const channel = normalizeOptionalChannel$1(entry.origin?.provider ?? entry.lastChannel);
  const accountId = (0, _accountIdJ7GeQlaZ.r)(entry.origin?.accountId ?? entry.lastAccountId);
  return channel || accountId ? {
    channel,
    accountId
  } : null;
}
function resolveApprovalRequestAccountId(params) {
  const expectedChannel = normalizeOptionalChannel$1(params.channel);
  const turnSourceChannel = normalizeOptionalChannel$1(params.request.request.turnSourceChannel);
  if (expectedChannel && turnSourceChannel && turnSourceChannel !== expectedChannel) return null;
  const turnSourceAccountId = (0, _accountIdJ7GeQlaZ.r)(params.request.request.turnSourceAccountId);
  if (turnSourceAccountId) return turnSourceAccountId;
  const sessionBinding = resolvePersistedApprovalRequestSessionBinding(params);
  const sessionChannel = sessionBinding?.channel;
  if (expectedChannel && sessionChannel && sessionChannel !== expectedChannel) return null;
  return sessionBinding?.accountId ?? null;
}
function resolveApprovalRequestChannelAccountId(params) {
  const expectedChannel = normalizeOptionalChannel$1(params.channel);
  if (!expectedChannel) return null;
  const turnSourceChannel = normalizeOptionalChannel$1(params.request.request.turnSourceChannel);
  if (!turnSourceChannel || turnSourceChannel === expectedChannel) return resolveApprovalRequestAccountId(params);
  const sessionBinding = resolvePersistedApprovalRequestSessionBinding(params);
  return sessionBinding?.channel === expectedChannel ? sessionBinding.accountId ?? null : null;
}
function doesApprovalRequestMatchChannelAccount(params) {
  const expectedChannel = normalizeOptionalChannel$1(params.channel);
  if (!expectedChannel) return false;
  const turnSourceChannel = normalizeOptionalChannel$1(params.request.request.turnSourceChannel);
  if (turnSourceChannel && turnSourceChannel !== expectedChannel) return false;
  const turnSourceAccountId = (0, _accountIdJ7GeQlaZ.r)(params.request.request.turnSourceAccountId);
  const expectedAccountId = (0, _accountIdJ7GeQlaZ.r)(params.accountId);
  if (turnSourceAccountId) return !expectedAccountId || expectedAccountId === turnSourceAccountId;
  const sessionBinding = resolvePersistedApprovalRequestSessionBinding(params);
  const sessionChannel = sessionBinding?.channel;
  if (sessionChannel && sessionChannel !== expectedChannel) return false;
  const boundAccountId = sessionBinding?.accountId;
  return !expectedAccountId || !boundAccountId || expectedAccountId === boundAccountId;
}
//#endregion
//#region src/infra/exec-approval-session-target.ts
function normalizeOptionalThreadValue(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : void 0;
  if (typeof value !== "string") return;
  const normalized = value.trim();
  return normalized ? normalized : void 0;
}
function isExecApprovalRequest(request) {
  return "command" in request.request;
}
function toExecLikeApprovalRequest(request) {
  if (isExecApprovalRequest(request)) return request;
  return {
    id: request.id,
    request: {
      command: request.request.title,
      sessionKey: request.request.sessionKey ?? void 0,
      turnSourceChannel: request.request.turnSourceChannel ?? void 0,
      turnSourceTo: request.request.turnSourceTo ?? void 0,
      turnSourceAccountId: request.request.turnSourceAccountId ?? void 0,
      turnSourceThreadId: request.request.turnSourceThreadId ?? void 0
    },
    createdAtMs: request.createdAtMs,
    expiresAtMs: request.expiresAtMs
  };
}
function normalizeOptionalChannel(value) {
  return (0, _messageChannelCBqCPFa_.u)(value);
}
function resolveApprovalRequestSessionConversation(params) {
  const sessionKey = (0, _stringCoerceBUSzWgUA.s)(params.request.request.sessionKey);
  if (!sessionKey) return null;
  const resolved = (0, _sessionConversationBkRPri5o.n)(sessionKey, { bundledFallback: params.bundledFallback });
  if (!resolved) return null;
  const expectedChannel = normalizeOptionalChannel(params.channel);
  if (expectedChannel && normalizeOptionalChannel(resolved.channel) !== expectedChannel) return null;
  return {
    channel: resolved.channel,
    kind: resolved.kind,
    id: resolved.id,
    rawId: resolved.rawId,
    threadId: resolved.threadId,
    baseSessionKey: resolved.baseSessionKey,
    baseConversationId: resolved.baseConversationId,
    parentConversationCandidates: resolved.parentConversationCandidates
  };
}
function resolveExecApprovalSessionTarget(params) {
  const sessionKey = (0, _stringCoerceBUSzWgUA.s)(params.request.request.sessionKey);
  if (!sessionKey) return null;
  const agentId = (0, _sessionKeyBh1lMwK.x)(sessionKey)?.agentId ?? params.request.request.agentId ?? "main";
  const entry = (0, _storeLoadDjLNEIy.t)((0, _pathsCZMxg3hs.u)(params.cfg.session?.store, { agentId }))[sessionKey];
  if (!entry) return null;
  const target = (0, _targetsSession1P2hepw.t)({
    entry,
    requestedChannel: "last",
    turnSourceChannel: (0, _stringCoerceBUSzWgUA.s)(params.turnSourceChannel),
    turnSourceTo: (0, _stringCoerceBUSzWgUA.s)(params.turnSourceTo),
    turnSourceAccountId: (0, _stringCoerceBUSzWgUA.s)(params.turnSourceAccountId),
    turnSourceThreadId: normalizeOptionalThreadValue(params.turnSourceThreadId)
  });
  if (!target.to) return null;
  return {
    channel: (0, _stringCoerceBUSzWgUA.s)(target.channel),
    to: target.to,
    accountId: (0, _stringCoerceBUSzWgUA.s)(target.accountId),
    threadId: normalizeOptionalThreadValue(target.threadId)
  };
}
function resolveApprovalRequestSessionTarget(params) {
  const execLikeRequest = toExecLikeApprovalRequest(params.request);
  return resolveExecApprovalSessionTarget({
    cfg: params.cfg,
    request: execLikeRequest,
    turnSourceChannel: execLikeRequest.request.turnSourceChannel ?? void 0,
    turnSourceTo: execLikeRequest.request.turnSourceTo ?? void 0,
    turnSourceAccountId: execLikeRequest.request.turnSourceAccountId ?? void 0,
    turnSourceThreadId: execLikeRequest.request.turnSourceThreadId ?? void 0
  });
}
function resolveApprovalRequestStoredSessionTarget(params) {
  const execLikeRequest = toExecLikeApprovalRequest(params.request);
  return resolveExecApprovalSessionTarget({
    cfg: params.cfg,
    request: execLikeRequest
  });
}
function resolveApprovalRequestOriginTarget(params) {
  if (!doesApprovalRequestMatchChannelAccount({
    cfg: params.cfg,
    request: params.request,
    channel: params.channel,
    accountId: params.accountId
  })) return null;
  const turnSourceTarget = params.resolveTurnSourceTarget(params.request);
  const expectedChannel = normalizeOptionalChannel(params.channel);
  const sessionTargetBinding = resolveApprovalRequestStoredSessionTarget({
    cfg: params.cfg,
    request: params.request
  });
  const sessionTarget = sessionTargetBinding && normalizeOptionalChannel(sessionTargetBinding.channel) === expectedChannel ? params.resolveSessionTarget(sessionTargetBinding) : null;
  if (turnSourceTarget && sessionTarget && !params.targetsMatch(turnSourceTarget, sessionTarget)) return null;
  return turnSourceTarget ?? sessionTarget ?? params.resolveFallbackTarget?.(params.request) ?? null;
}
//#endregion /* v9-72ae38f21bfae034 */
