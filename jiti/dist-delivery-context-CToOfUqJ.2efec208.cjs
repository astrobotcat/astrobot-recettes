"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveConversationDeliveryTarget;exports.t = formatConversationTarget;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
require("./plugins-D4ODSIPT.js");
require("./delivery-context.shared-EClQPjt-.js");
//#region src/utils/delivery-context.ts
function formatConversationTarget(params) {
  const channel = typeof params.channel === "string" ? (0, _messageChannelCBqCPFa_.u)(params.channel) ?? params.channel.trim() : void 0;
  const conversationId = typeof params.conversationId === "number" && Number.isFinite(params.conversationId) ? String(Math.trunc(params.conversationId)) : typeof params.conversationId === "string" ? (0, _stringCoerceBUSzWgUA.s)(params.conversationId) : void 0;
  if (!channel || !conversationId) return;
  const parentConversationId = typeof params.parentConversationId === "number" && Number.isFinite(params.parentConversationId) ? String(Math.trunc(params.parentConversationId)) : typeof params.parentConversationId === "string" ? (0, _stringCoerceBUSzWgUA.s)(params.parentConversationId) : void 0;
  const pluginTarget = (0, _registryDelpa74L.i)(channel) ? (0, _registryDelpa74L.t)((0, _registryDelpa74L.i)(channel))?.messaging?.resolveDeliveryTarget?.({
    conversationId,
    parentConversationId
  }) : null;
  if (pluginTarget?.to?.trim()) return pluginTarget.to.trim();
  return `channel:${conversationId}`;
}
function resolveConversationDeliveryTarget(params) {
  const channel = typeof params.channel === "string" ? (0, _messageChannelCBqCPFa_.u)(params.channel) ?? params.channel.trim() : void 0;
  const conversationId = typeof params.conversationId === "number" && Number.isFinite(params.conversationId) ? String(Math.trunc(params.conversationId)) : typeof params.conversationId === "string" ? (0, _stringCoerceBUSzWgUA.s)(params.conversationId) : void 0;
  const parentConversationId = typeof params.parentConversationId === "number" && Number.isFinite(params.parentConversationId) ? String(Math.trunc(params.parentConversationId)) : typeof params.parentConversationId === "string" ? (0, _stringCoerceBUSzWgUA.s)(params.parentConversationId) : void 0;
  if (channel && conversationId && parentConversationId && parentConversationId !== conversationId) {
    if (channel === "matrix") return {
      to: `room:${parentConversationId}`,
      threadId: conversationId
    };
    if (channel === "slack" || channel === "mattermost" || channel === "telegram") return {
      to: `channel:${parentConversationId}`,
      threadId: conversationId
    };
  }
  const pluginTarget = channel && conversationId ? (0, _registryDelpa74L.t)((0, _registryDelpa74L.i)(channel) ?? channel)?.messaging?.resolveDeliveryTarget?.({
    conversationId,
    parentConversationId
  }) : null;
  if (pluginTarget) return {
    ...(pluginTarget.to?.trim() ? { to: pluginTarget.to.trim() } : {}),
    ...(pluginTarget.threadId?.trim() ? { threadId: pluginTarget.threadId.trim() } : {})
  };
  return { to: formatConversationTarget(params) };
}
//#endregion /* v9-a4242c4cf8f3fd2b */
