"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = finalizeInboundContext;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _chatTypeDFnPOWna = require("./chat-type-DFnPOWna.js");
var _conversationLabelCio1HuOl = require("./conversation-label-Cio1HuOl.js");
var _inboundTextMk2PQPNo = require("./inbound-text-Mk2PQPNo.js");
//#region src/auto-reply/reply/inbound-context.ts
const DEFAULT_MEDIA_TYPE = "application/octet-stream";
function normalizeTextField(value) {
  if (typeof value !== "string") return;
  return (0, _inboundTextMk2PQPNo.n)((0, _inboundTextMk2PQPNo.t)(value));
}
function normalizeMediaType(value) {
  if (typeof value !== "string") return;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : void 0;
}
function countMediaEntries(ctx) {
  const pathCount = Array.isArray(ctx.MediaPaths) ? ctx.MediaPaths.length : 0;
  const urlCount = Array.isArray(ctx.MediaUrls) ? ctx.MediaUrls.length : 0;
  const single = ctx.MediaPath || ctx.MediaUrl ? 1 : 0;
  return Math.max(pathCount, urlCount, single);
}
function finalizeInboundContext(ctx, opts = {}) {
  const normalized = ctx;
  normalized.Body = (0, _inboundTextMk2PQPNo.n)((0, _inboundTextMk2PQPNo.t)(typeof normalized.Body === "string" ? normalized.Body : ""));
  normalized.RawBody = normalizeTextField(normalized.RawBody);
  normalized.CommandBody = normalizeTextField(normalized.CommandBody);
  normalized.Transcript = normalizeTextField(normalized.Transcript);
  normalized.ThreadStarterBody = normalizeTextField(normalized.ThreadStarterBody);
  normalized.ThreadHistoryBody = normalizeTextField(normalized.ThreadHistoryBody);
  if (Array.isArray(normalized.UntrustedContext)) normalized.UntrustedContext = normalized.UntrustedContext.map((entry) => (0, _inboundTextMk2PQPNo.n)((0, _inboundTextMk2PQPNo.t)(entry))).filter((entry) => Boolean(entry));
  const chatType = (0, _chatTypeDFnPOWna.t)(normalized.ChatType);
  if (chatType && (opts.forceChatType || normalized.ChatType !== chatType)) normalized.ChatType = chatType;
  normalized.BodyForAgent = (0, _inboundTextMk2PQPNo.n)((0, _inboundTextMk2PQPNo.t)(opts.forceBodyForAgent ? normalized.Body : normalized.BodyForAgent ?? normalized.CommandBody ?? normalized.RawBody ?? normalized.Body));
  normalized.BodyForCommands = (0, _inboundTextMk2PQPNo.n)((0, _inboundTextMk2PQPNo.t)(opts.forceBodyForCommands ? normalized.CommandBody ?? normalized.RawBody ?? normalized.Body : normalized.BodyForCommands ?? normalized.CommandBody ?? normalized.RawBody ?? normalized.Body));
  const explicitLabel = (0, _stringCoerceBUSzWgUA.s)(normalized.ConversationLabel);
  if (opts.forceConversationLabel || !explicitLabel) {
    const resolved = (0, _stringCoerceBUSzWgUA.s)((0, _conversationLabelCio1HuOl.t)(normalized));
    if (resolved) normalized.ConversationLabel = resolved;
  } else normalized.ConversationLabel = explicitLabel;
  normalized.CommandAuthorized = normalized.CommandAuthorized === true;
  const mediaCount = countMediaEntries(normalized);
  if (mediaCount > 0) {
    const mediaType = normalizeMediaType(normalized.MediaType);
    const normalizedMediaTypes = (Array.isArray(normalized.MediaTypes) ? normalized.MediaTypes : void 0)?.map((entry) => normalizeMediaType(entry));
    let mediaTypesFinal;
    if (normalizedMediaTypes && normalizedMediaTypes.length > 0) {
      const filled = normalizedMediaTypes.slice();
      while (filled.length < mediaCount) filled.push(void 0);
      mediaTypesFinal = filled.map((entry) => entry ?? DEFAULT_MEDIA_TYPE);
    } else if (mediaType) {
      mediaTypesFinal = [mediaType];
      while (mediaTypesFinal.length < mediaCount) mediaTypesFinal.push(DEFAULT_MEDIA_TYPE);
    } else mediaTypesFinal = Array.from({ length: mediaCount }, () => DEFAULT_MEDIA_TYPE);
    normalized.MediaTypes = mediaTypesFinal;
    normalized.MediaType = mediaType ?? mediaTypesFinal[0] ?? DEFAULT_MEDIA_TYPE;
  }
  return normalized;
}
//#endregion /* v9-388d25aff4899cd6 */
