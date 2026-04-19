"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveTelegramSessionConversation;var _topicConversation10u__tpo = require("./topic-conversation-10u__tpo.js");
//#region extensions/telegram/src/session-conversation.ts
function resolveTelegramSessionConversation(params) {
  const parsed = (0, _topicConversation10u__tpo.t)({ conversationId: params.rawId });
  if (!parsed) return null;
  return {
    id: parsed.chatId,
    threadId: parsed.topicId,
    baseConversationId: parsed.chatId,
    parentConversationCandidates: [parsed.chatId]
  };
}
//#endregion /* v9-e862471f06b5ec5b */
