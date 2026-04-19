"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveConversationBindingThreadIdFromMessage;exports.i = resolveConversationBindingContextFromMessage;exports.n = resolveConversationBindingChannelFromMessage;exports.r = resolveConversationBindingContextFromAcpCommand;exports.t = resolveConversationBindingAccountIdFromMessage;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _runtimeBB1a2aCy = require("./runtime-BB1a2aCy.js");
var _conversationIdBkdkxdwP = require("./conversation-id-BkdkxdwP.js");
var _conversationBindingContextDNfJsm = require("./conversation-binding-context-DNfJsm95.js");
//#region src/auto-reply/reply/conversation-binding-input.ts
function resolveBindingChannel(ctx, commandChannel) {
  return (0, _stringCoerceBUSzWgUA.i)((0, _conversationIdBkdkxdwP.t)(ctx.OriginatingChannel ?? commandChannel ?? ctx.Surface ?? ctx.Provider));
}
function resolveBindingAccountId(params) {
  const channel = resolveBindingChannel(params.ctx, params.commandChannel);
  const plugin = (0, _runtimeBB1a2aCy.t)()?.channels.find((entry) => entry.plugin.id === channel)?.plugin;
  return (0, _conversationIdBkdkxdwP.t)(params.ctx.AccountId) || (0, _conversationIdBkdkxdwP.t)(plugin?.config.defaultAccountId?.(params.cfg)) || "default";
}
function resolveBindingThreadId(threadId) {
  return (threadId != null ? (0, _conversationIdBkdkxdwP.t)(String(threadId)) : void 0) || void 0;
}
function resolveConversationBindingContextFromMessage(params) {
  const channel = resolveBindingChannel(params.ctx);
  return (0, _conversationBindingContextDNfJsm.t)({
    cfg: params.cfg,
    channel,
    accountId: resolveBindingAccountId({
      ctx: params.ctx,
      cfg: params.cfg,
      commandChannel: channel
    }),
    chatType: params.ctx.ChatType,
    threadId: resolveBindingThreadId(params.ctx.MessageThreadId),
    threadParentId: params.ctx.ThreadParentId,
    senderId: params.senderId ?? params.ctx.SenderId,
    sessionKey: params.sessionKey ?? params.ctx.SessionKey,
    parentSessionKey: params.parentSessionKey ?? params.ctx.ParentSessionKey,
    from: params.ctx.From,
    originatingTo: params.ctx.OriginatingTo,
    commandTo: params.commandTo,
    fallbackTo: params.ctx.To,
    nativeChannelId: params.ctx.NativeChannelId
  });
}
function resolveConversationBindingContextFromAcpCommand(params) {
  return resolveConversationBindingContextFromMessage({
    cfg: params.cfg,
    ctx: params.ctx,
    senderId: params.command.senderId,
    sessionKey: params.sessionKey,
    parentSessionKey: params.ctx.ParentSessionKey,
    commandTo: params.command.to
  });
}
function resolveConversationBindingChannelFromMessage(ctx, commandChannel) {
  return resolveBindingChannel(ctx, commandChannel);
}
function resolveConversationBindingAccountIdFromMessage(params) {
  return resolveBindingAccountId(params);
}
function resolveConversationBindingThreadIdFromMessage(ctx) {
  return resolveBindingThreadId(ctx.MessageThreadId);
}
//#endregion /* v9-40db202790817d18 */
