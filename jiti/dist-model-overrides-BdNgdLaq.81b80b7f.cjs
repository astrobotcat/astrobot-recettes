"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveChannelModelOverride;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
var _channelConfigDBnJYaTV = require("./channel-config-DBnJYaTV.js");
var _chatTypeDFnPOWna = require("./chat-type-DFnPOWna.js");
var _sessionConversationBkRPri5o = require("./session-conversation-BkRPri5o.js");
//#region src/channels/model-overrides.ts
function resolveProviderEntry(modelByChannel, channel) {
  const normalized = (0, _messageChannelCBqCPFa_.u)(channel) ?? (0, _stringCoerceBUSzWgUA.o)(channel) ?? "";
  return modelByChannel?.[normalized] ?? modelByChannel?.[Object.keys(modelByChannel ?? {}).find((key) => {
    return ((0, _messageChannelCBqCPFa_.u)(key) ?? (0, _stringCoerceBUSzWgUA.o)(key) ?? "") === normalized;
  }) ?? ""];
}
function buildChannelCandidates(params) {
  const normalizedChannel = (0, _messageChannelCBqCPFa_.u)(params.channel ?? "") ?? (0, _stringCoerceBUSzWgUA.o)(params.channel);
  const groupId = (0, _stringCoerceBUSzWgUA.s)(params.groupId);
  const sessionConversation = (0, _sessionConversationBkRPri5o.n)(params.parentSessionKey);
  const feishuParentOverrideFallbacks = normalizedChannel === "feishu" ? buildFeishuParentOverrideCandidates(sessionConversation?.rawId) : [];
  const parentOverrideFallbacks = (normalizedChannel ? (0, _registryDelpa74L.t)(normalizedChannel)?.conversationBindings?.buildModelOverrideParentCandidates?.({ parentConversationId: sessionConversation?.rawId }) : null) ?? [];
  const groupConversationKind = (0, _chatTypeDFnPOWna.t)(params.groupChatType ?? void 0) === "channel" ? "channel" : sessionConversation?.kind === "channel" ? "channel" : "group";
  const groupConversation = (0, _sessionConversationBkRPri5o.t)({
    channel: normalizedChannel ?? "",
    kind: groupConversationKind,
    rawId: groupId ?? ""
  });
  const groupChannel = (0, _stringCoerceBUSzWgUA.s)(params.groupChannel);
  const groupSubject = (0, _stringCoerceBUSzWgUA.s)(params.groupSubject);
  const channelBare = groupChannel ? groupChannel.replace(/^#/, "") : void 0;
  const subjectBare = groupSubject ? groupSubject.replace(/^#/, "") : void 0;
  const channelSlug = channelBare ? (0, _channelConfigDBnJYaTV.r)(channelBare) : void 0;
  const subjectSlug = subjectBare ? (0, _channelConfigDBnJYaTV.r)(subjectBare) : void 0;
  return {
    keys: (0, _channelConfigDBnJYaTV.n)(groupId, sessionConversation?.rawId, ...(groupConversation?.parentConversationCandidates ?? []), ...(sessionConversation?.parentConversationCandidates ?? []), ...feishuParentOverrideFallbacks, ...parentOverrideFallbacks),
    parentKeys: (0, _channelConfigDBnJYaTV.n)(groupChannel, channelBare, channelSlug, groupSubject, subjectBare, subjectSlug)
  };
}
function buildGenericParentOverrideCandidates(sessionKey) {
  const raw = (0, _sessionKeyBh1lMwK.S)(sessionKey);
  if (!raw) return [];
  const { baseSessionKey, threadId } = (0, _sessionKeyBh1lMwK.C)(raw.rawId);
  return (0, _channelConfigDBnJYaTV.n)(threadId ? baseSessionKey : raw.rawId);
}
function buildFeishuParentOverrideCandidates(rawId) {
  const value = (0, _stringCoerceBUSzWgUA.s)(rawId);
  if (!value) return [];
  const topicSenderMatch = value.match(/^(.+):topic:([^:]+):sender:([^:]+)$/i);
  if (topicSenderMatch) {
    const chatId = (0, _stringCoerceBUSzWgUA.o)(topicSenderMatch[1]);
    return [`${chatId}:topic:${(0, _stringCoerceBUSzWgUA.o)(topicSenderMatch[2])}`, chatId].filter((entry) => Boolean(entry));
  }
  const topicMatch = value.match(/^(.+):topic:([^:]+)$/i);
  if (topicMatch) {
    const chatId = (0, _stringCoerceBUSzWgUA.o)(topicMatch[1]);
    return [`${chatId}:topic:${(0, _stringCoerceBUSzWgUA.o)(topicMatch[2])}`, chatId].filter((entry) => Boolean(entry));
  }
  const senderMatch = value.match(/^(.+):sender:([^:]+)$/i);
  if (senderMatch) {
    const chatId = (0, _stringCoerceBUSzWgUA.o)(senderMatch[1]);
    return chatId ? [chatId] : [];
  }
  return [];
}
function resolveDirectChannelModelMatch(params) {
  const rawParent = (0, _sessionKeyBh1lMwK.S)(params.parentSessionKey);
  const directKeys = (0, _channelConfigDBnJYaTV.n)(params.groupId, ...buildGenericParentOverrideCandidates(params.parentSessionKey), ...((0, _stringCoerceBUSzWgUA.o)(params.channel) === "feishu" ? buildFeishuParentOverrideCandidates(rawParent?.rawId) : []));
  if (directKeys.length === 0) return null;
  const match = (0, _channelConfigDBnJYaTV.a)({
    entries: params.providerEntries,
    keys: directKeys,
    parentKeys: [],
    wildcardKey: "*",
    normalizeKey: (value) => (0, _stringCoerceBUSzWgUA.o)(value) ?? ""
  });
  const raw = match.entry ?? match.wildcardEntry;
  if (typeof raw !== "string") return null;
  const model = (0, _stringCoerceBUSzWgUA.s)(raw);
  if (!model) return null;
  return {
    model,
    matchKey: match.matchKey,
    matchSource: match.matchSource
  };
}
function resolveChannelModelOverride(params) {
  const channel = (0, _stringCoerceBUSzWgUA.s)(params.channel);
  if (!channel) return null;
  const modelByChannel = params.cfg.channels?.modelByChannel;
  if (!modelByChannel) return null;
  const providerEntries = resolveProviderEntry(modelByChannel, channel);
  if (!providerEntries) return null;
  const directMatch = resolveDirectChannelModelMatch({
    channel,
    providerEntries,
    groupId: params.groupId,
    parentSessionKey: params.parentSessionKey
  });
  if (directMatch) return {
    channel: (0, _messageChannelCBqCPFa_.u)(channel) ?? (0, _stringCoerceBUSzWgUA.o)(channel) ?? "",
    model: directMatch.model,
    matchKey: directMatch.matchKey,
    matchSource: directMatch.matchSource
  };
  const { keys, parentKeys } = buildChannelCandidates(params);
  if (keys.length === 0 && parentKeys.length === 0) return null;
  const match = (0, _channelConfigDBnJYaTV.a)({
    entries: providerEntries,
    keys,
    parentKeys,
    wildcardKey: "*",
    normalizeKey: (value) => (0, _stringCoerceBUSzWgUA.o)(value) ?? ""
  });
  const raw = match.entry ?? match.wildcardEntry;
  if (typeof raw !== "string") return null;
  const model = (0, _stringCoerceBUSzWgUA.s)(raw);
  if (!model) return null;
  return {
    channel: (0, _messageChannelCBqCPFa_.u)(channel) ?? (0, _stringCoerceBUSzWgUA.o)(channel) ?? "",
    model,
    matchKey: match.matchKey,
    matchSource: match.matchSource
  };
}
//#endregion /* v9-67f0bdf8a18b3b4e */
