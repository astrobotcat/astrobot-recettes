"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = normalizeSessionDeliveryFields;exports.i = normalizeDeliveryContext;exports.n = deliveryContextKey;exports.o = normalizeAccountId;exports.r = mergeDeliveryContext;exports.t = deliveryContextFromSession;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
var _messageChannelCoreBIZsQ6dr = require("./message-channel-core-BIZsQ6dr.js");
//#region src/utils/account-id.ts
function normalizeAccountId(value) {
  return (0, _accountIdJ7GeQlaZ.r)(value);
}
//#endregion
//#region src/utils/delivery-context.shared.ts
function normalizeDeliveryContext(context) {
  if (!context) return;
  const channel = typeof context.channel === "string" ? (0, _messageChannelCoreBIZsQ6dr.n)(context.channel) ?? context.channel.trim() : void 0;
  const to = (0, _stringCoerceBUSzWgUA.s)(context.to);
  const accountId = normalizeAccountId(context.accountId);
  const threadId = typeof context.threadId === "number" && Number.isFinite(context.threadId) ? Math.trunc(context.threadId) : typeof context.threadId === "string" ? (0, _stringCoerceBUSzWgUA.s)(context.threadId) : void 0;
  const normalizedThreadId = typeof threadId === "string" ? threadId ? threadId : void 0 : threadId;
  if (!channel && !to && !accountId && normalizedThreadId == null) return;
  const normalized = {
    channel: channel || void 0,
    to: to || void 0,
    accountId
  };
  if (normalizedThreadId != null) normalized.threadId = normalizedThreadId;
  return normalized;
}
function normalizeSessionDeliveryFields(source) {
  if (!source) return {
    deliveryContext: void 0,
    lastChannel: void 0,
    lastTo: void 0,
    lastAccountId: void 0,
    lastThreadId: void 0
  };
  const merged = mergeDeliveryContext(normalizeDeliveryContext({
    channel: source.lastChannel ?? source.channel,
    to: source.lastTo,
    accountId: source.lastAccountId,
    threadId: source.lastThreadId
  }), normalizeDeliveryContext(source.deliveryContext));
  if (!merged) return {
    deliveryContext: void 0,
    lastChannel: void 0,
    lastTo: void 0,
    lastAccountId: void 0,
    lastThreadId: void 0
  };
  return {
    deliveryContext: merged,
    lastChannel: merged.channel,
    lastTo: merged.to,
    lastAccountId: merged.accountId,
    lastThreadId: merged.threadId
  };
}
function deliveryContextFromSession(entry) {
  if (!entry) return;
  return normalizeSessionDeliveryFields({
    channel: entry.channel ?? entry.origin?.provider,
    lastChannel: entry.lastChannel,
    lastTo: entry.lastTo,
    lastAccountId: entry.lastAccountId ?? entry.origin?.accountId,
    lastThreadId: entry.lastThreadId ?? entry.deliveryContext?.threadId ?? entry.origin?.threadId,
    origin: entry.origin,
    deliveryContext: entry.deliveryContext
  }).deliveryContext;
}
function mergeDeliveryContext(primary, fallback) {
  const normalizedPrimary = normalizeDeliveryContext(primary);
  const normalizedFallback = normalizeDeliveryContext(fallback);
  if (!normalizedPrimary && !normalizedFallback) return;
  const channelsConflict = normalizedPrimary?.channel && normalizedFallback?.channel && normalizedPrimary.channel !== normalizedFallback.channel;
  return normalizeDeliveryContext({
    channel: normalizedPrimary?.channel ?? normalizedFallback?.channel,
    to: channelsConflict ? normalizedPrimary?.to : normalizedPrimary?.to ?? normalizedFallback?.to,
    accountId: channelsConflict ? normalizedPrimary?.accountId : normalizedPrimary?.accountId ?? normalizedFallback?.accountId,
    threadId: channelsConflict ? normalizedPrimary?.threadId : normalizedPrimary?.threadId ?? normalizedFallback?.threadId
  });
}
function deliveryContextKey(context) {
  const normalized = normalizeDeliveryContext(context);
  if (!normalized?.channel || !normalized?.to) return;
  const threadId = normalized.threadId != null && normalized.threadId !== "" ? String(normalized.threadId) : "";
  return `${normalized.channel}|${normalized.to}|${normalized.accountId ?? ""}|${threadId}`;
}
//#endregion /* v9-d76b4833bd2cc327 */
