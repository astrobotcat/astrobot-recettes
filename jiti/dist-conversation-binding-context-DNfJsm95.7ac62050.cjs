"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveConversationBindingContext;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _idsCYPyP4SY = require("./ids-CYPyP4SY.js");
var _registryCENZffQG = require("./registry-CENZffQG.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
require("./plugins-D4ODSIPT.js");
var _runtimeBB1a2aCy = require("./runtime-BB1a2aCy.js");
var _conversationIdCFhO6sXb = require("./conversation-id-CFhO6sXb.js");
//#region src/channels/plugins/target-parsing.ts
function parseWithPlugin(getPlugin, rawChannel, rawTarget) {
  const channel = (0, _idsCYPyP4SY.r)(rawChannel) ?? (0, _registryDelpa74L.i)(rawChannel);
  if (!channel) return null;
  return getPlugin(channel)?.messaging?.parseExplicitTarget?.({ raw: rawTarget }) ?? null;
}
function parseExplicitTargetForChannel(channel, rawTarget) {
  return parseWithPlugin(_registryDelpa74L.t, channel, rawTarget);
}
//#endregion
//#region src/channels/conversation-binding-context.ts
const CANONICAL_TARGET_PREFIXES = [
"user:",
"channel:",
"conversation:",
"group:",
"room:",
"dm:",
"spaces/"];

function getLoadedChannelPlugin(rawChannel) {
  const normalized = (0, _registryCENZffQG.a)(rawChannel) ?? (0, _stringCoerceBUSzWgUA.s)(rawChannel);
  if (!normalized) return;
  return (0, _runtimeBB1a2aCy.t)()?.channels.find((entry) => entry.plugin.id === normalized)?.plugin;
}
function shouldDefaultParentConversationToSelf(plugin) {
  return plugin?.bindings?.selfParentConversationByDefault === true;
}
function resolveBindingAccountId(params) {
  return (0, _stringCoerceBUSzWgUA.s)(params.rawAccountId) || (0, _stringCoerceBUSzWgUA.s)(params.plugin?.config.defaultAccountId?.(params.cfg)) || "default";
}
function resolveChannelTargetId(params) {
  const target = (0, _stringCoerceBUSzWgUA.s)(params.target);
  if (!target) return;
  const lower = (0, _stringCoerceBUSzWgUA.i)(target);
  const channelPrefix = `${params.channel}:`;
  if (lower.startsWith(channelPrefix)) return resolveChannelTargetId({
    channel: params.channel,
    target: target.slice(channelPrefix.length)
  });
  if (CANONICAL_TARGET_PREFIXES.some((prefix) => lower.startsWith(prefix))) return target;
  const parsedTarget = (0, _stringCoerceBUSzWgUA.s)(parseExplicitTargetForChannel(params.channel, target)?.to);
  if (parsedTarget) return (0, _conversationIdCFhO6sXb.t)({ targets: [parsedTarget] }) ?? parsedTarget;
  return (0, _conversationIdCFhO6sXb.t)({ targets: [target] }) ?? target;
}
function buildThreadingContext(params) {
  const to = (0, _stringCoerceBUSzWgUA.s)(params.originatingTo) ?? (0, _stringCoerceBUSzWgUA.s)(params.fallbackTo);
  return {
    ...(to ? { To: to } : {}),
    ...(params.from ? { From: params.from } : {}),
    ...(params.chatType ? { ChatType: params.chatType } : {}),
    ...(params.threadId ? { MessageThreadId: params.threadId } : {}),
    ...(params.nativeChannelId ? { NativeChannelId: params.nativeChannelId } : {})
  };
}
function resolveConversationBindingContext(params) {
  const channel = (0, _registryCENZffQG.a)(params.channel) ?? (0, _registryCENZffQG.o)(params.channel) ?? (0, _stringCoerceBUSzWgUA.o)(params.channel);
  if (!channel) return null;
  const loadedPlugin = getLoadedChannelPlugin(channel);
  const accountId = resolveBindingAccountId({
    rawAccountId: params.accountId,
    plugin: loadedPlugin,
    cfg: params.cfg
  });
  const threadId = (0, _stringCoerceBUSzWgUA.s)(params.threadId != null ? String(params.threadId) : void 0);
  const resolvedByProvider = loadedPlugin?.bindings?.resolveCommandConversation?.({
    accountId,
    threadId,
    threadParentId: (0, _stringCoerceBUSzWgUA.s)(params.threadParentId),
    senderId: (0, _stringCoerceBUSzWgUA.s)(params.senderId),
    sessionKey: (0, _stringCoerceBUSzWgUA.s)(params.sessionKey),
    parentSessionKey: (0, _stringCoerceBUSzWgUA.s)(params.parentSessionKey),
    from: (0, _stringCoerceBUSzWgUA.s)(params.from),
    chatType: (0, _stringCoerceBUSzWgUA.s)(params.chatType),
    originatingTo: params.originatingTo ?? void 0,
    commandTo: params.commandTo ?? void 0,
    fallbackTo: params.fallbackTo ?? void 0
  });
  if (resolvedByProvider?.conversationId) {
    const providerConversationId = (0, _stringCoerceBUSzWgUA.s)(resolvedByProvider.conversationId);
    if (!providerConversationId) return null;
    const providerParentConversationId = (0, _stringCoerceBUSzWgUA.s)(resolvedByProvider.parentConversationId);
    const resolvedParentConversationId = shouldDefaultParentConversationToSelf(loadedPlugin) && !threadId && !providerParentConversationId ? providerConversationId : providerParentConversationId;
    return {
      channel,
      accountId,
      conversationId: providerConversationId,
      ...(resolvedParentConversationId ? { parentConversationId: resolvedParentConversationId } : {}),
      ...(threadId ? { threadId } : {})
    };
  }
  const focusedBinding = loadedPlugin?.threading?.resolveFocusedBinding?.({
    cfg: params.cfg,
    accountId,
    context: buildThreadingContext({
      fallbackTo: params.fallbackTo ?? void 0,
      originatingTo: params.originatingTo ?? void 0,
      threadId,
      from: (0, _stringCoerceBUSzWgUA.s)(params.from),
      chatType: (0, _stringCoerceBUSzWgUA.s)(params.chatType),
      nativeChannelId: (0, _stringCoerceBUSzWgUA.s)(params.nativeChannelId)
    })
  });
  if (focusedBinding?.conversationId) {
    const focusedConversationId = (0, _stringCoerceBUSzWgUA.s)(focusedBinding.conversationId);
    if (!focusedConversationId) return null;
    const focusedParentConversationId = (0, _stringCoerceBUSzWgUA.s)(focusedBinding.parentConversationId);
    return {
      channel,
      accountId,
      conversationId: focusedConversationId,
      ...(focusedParentConversationId ? { parentConversationId: focusedParentConversationId } : {}),
      ...(threadId ? { threadId } : {})
    };
  }
  const baseConversationId = resolveChannelTargetId({
    channel,
    target: params.originatingTo
  }) ?? resolveChannelTargetId({
    channel,
    target: params.commandTo
  }) ?? resolveChannelTargetId({
    channel,
    target: params.fallbackTo
  });
  const parentConversationId = resolveChannelTargetId({
    channel,
    target: params.threadParentId
  }) ?? (threadId && baseConversationId && baseConversationId !== threadId ? baseConversationId : void 0);
  const conversationId = threadId || baseConversationId;
  if (!conversationId) return null;
  const normalizedParentConversationId = shouldDefaultParentConversationToSelf(loadedPlugin) && !threadId && !parentConversationId ? conversationId : parentConversationId;
  return {
    channel,
    accountId,
    conversationId,
    ...(normalizedParentConversationId ? { parentConversationId: normalizedParentConversationId } : {}),
    ...(threadId ? { threadId } : {})
  };
}
//#endregion /* v9-9cacb6763785ff97 */
