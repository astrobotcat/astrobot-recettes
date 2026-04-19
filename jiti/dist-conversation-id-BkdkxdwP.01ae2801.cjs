"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = normalizeConversationTargetRef;exports.n = buildChannelAccountKey;exports.r = normalizeConversationRef;exports.t = normalizeConversationText;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
//#region src/infra/outbound/session-binding-normalization.ts
function normalizeConversationTargetRef(ref) {
  const conversationId = (0, _stringCoerceBUSzWgUA.s)(ref.conversationId) ?? "";
  const parentConversationId = (0, _stringCoerceBUSzWgUA.s)(ref.parentConversationId);
  const { parentConversationId: _ignoredParentConversationId, ...rest } = ref;
  return {
    ...rest,
    conversationId,
    ...(parentConversationId && parentConversationId !== conversationId ? { parentConversationId } : {})
  };
}
function normalizeConversationRef(ref) {
  return {
    ...normalizeConversationTargetRef(ref),
    channel: (0, _stringCoerceBUSzWgUA.i)(ref.channel),
    accountId: (0, _accountIdJ7GeQlaZ.n)(ref.accountId)
  };
}
function buildChannelAccountKey(params) {
  return `${(0, _stringCoerceBUSzWgUA.i)(params.channel)}:${(0, _accountIdJ7GeQlaZ.n)(params.accountId)}`;
}
//#endregion
//#region src/acp/conversation-id.ts
function normalizeConversationText(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") return `${value}`.trim();
  return "";
}
//#endregion /* v9-f3783d4b08db0ed2 */
