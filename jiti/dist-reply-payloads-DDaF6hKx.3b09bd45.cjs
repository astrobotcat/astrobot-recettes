"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = shouldSuppressReasoningPayload;exports.i = isRenderablePayload;exports.n = applyReplyThreading;exports.r = formatBtwTextForExternalDelivery;exports.t = applyReplyTagsToPayload;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _directiveTags_9B0F8vD = require("./directive-tags-_9B0F8vD.js");
var _payloadCS7dEmmu = require("./payload-CS7dEmmu.js");
var _replyThreadingCUDkwBEF = require("./reply-threading-CUDkwBEF.js");
require("./reply-payloads-dedupe-DdkxX52G.js");
//#region src/auto-reply/reply/reply-tags.ts
function extractReplyToTag(text, currentMessageId) {
  const result = (0, _directiveTags_9B0F8vD.t)(text, {
    currentMessageId,
    stripAudioTag: false
  });
  return {
    cleaned: result.text,
    replyToId: result.replyToId,
    replyToCurrent: result.replyToCurrent,
    hasTag: result.hasReplyTag
  };
}
//#endregion
//#region src/auto-reply/reply/reply-payloads-base.ts
function formatBtwTextForExternalDelivery(payload) {
  const text = (0, _stringCoerceBUSzWgUA.s)(payload.text);
  if (!text) return payload.text;
  const question = (0, _stringCoerceBUSzWgUA.s)(payload.btw?.question);
  if (!question) return payload.text;
  const formatted = `BTW\nQuestion: ${question}\n\n${text}`;
  return text === formatted || text.startsWith("BTW\nQuestion:") ? text : formatted;
}
function resolveReplyThreadingForPayload(params) {
  const implicitReplyToId = (0, _stringCoerceBUSzWgUA.s)(params.implicitReplyToId);
  const currentMessageId = (0, _stringCoerceBUSzWgUA.s)(params.currentMessageId);
  const allowImplicitReplyToCurrentMessage = (0, _replyThreadingCUDkwBEF.r)(params.replyToMode, params.replyThreading);
  let resolved = params.payload.replyToId || params.payload.replyToCurrent === false || !implicitReplyToId || !allowImplicitReplyToCurrentMessage ? params.payload : {
    ...params.payload,
    replyToId: implicitReplyToId
  };
  if (typeof resolved.text === "string" && resolved.text.includes("[[")) {
    const { cleaned, replyToId, replyToCurrent, hasTag } = extractReplyToTag(resolved.text, currentMessageId);
    resolved = {
      ...resolved,
      text: cleaned ? cleaned : void 0,
      replyToId: replyToId ?? resolved.replyToId,
      replyToTag: hasTag || resolved.replyToTag,
      replyToCurrent: replyToCurrent || resolved.replyToCurrent
    };
  }
  if (resolved.replyToCurrent && !resolved.replyToId && currentMessageId) resolved = {
    ...resolved,
    replyToId: currentMessageId
  };
  return resolved;
}
function applyReplyTagsToPayload(payload, currentMessageId) {
  return resolveReplyThreadingForPayload({
    payload,
    currentMessageId
  });
}
function isRenderablePayload(payload) {
  return (0, _payloadCS7dEmmu.i)(payload, { extraContent: payload.audioAsVoice });
}
function shouldSuppressReasoningPayload(payload) {
  return payload.isReasoning === true;
}
function applyReplyThreading(params) {
  const { payloads, replyToMode, replyToChannel, currentMessageId, replyThreading } = params;
  const applyReplyToMode = (0, _replyThreadingCUDkwBEF.t)(replyToMode, replyToChannel);
  const implicitReplyToId = (0, _stringCoerceBUSzWgUA.s)(currentMessageId);
  return payloads.map((payload) => resolveReplyThreadingForPayload({
    payload,
    replyToMode,
    implicitReplyToId,
    currentMessageId,
    replyThreading
  })).filter(isRenderablePayload).map(applyReplyToMode);
}
//#endregion /* v9-6ad490ec9c490427 */
