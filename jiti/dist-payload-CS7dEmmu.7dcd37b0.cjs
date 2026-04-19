"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = normalizeInteractiveReply;exports.i = hasReplyPayloadContent;exports.n = hasReplyChannelData;exports.o = resolveInteractiveTextFallback;exports.r = hasReplyContent;exports.t = hasInteractiveReplyBlocks;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/interactive/payload.ts
function normalizeButtonStyle(value) {
  const style = (0, _stringCoerceBUSzWgUA.o)(value);
  return style === "primary" || style === "secondary" || style === "success" || style === "danger" ? style : void 0;
}
function normalizeInteractiveButton(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const record = raw;
  const label = (0, _stringCoerceBUSzWgUA.s)(record.label) ?? (0, _stringCoerceBUSzWgUA.s)(record.text);
  const value = (0, _stringCoerceBUSzWgUA.s)(record.value) ?? (0, _stringCoerceBUSzWgUA.s)(record.callbackData) ?? (0, _stringCoerceBUSzWgUA.s)(record.callback_data);
  if (!label || !value) return;
  return {
    label,
    value,
    style: normalizeButtonStyle(record.style)
  };
}
function normalizeInteractiveOption(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const record = raw;
  const label = (0, _stringCoerceBUSzWgUA.s)(record.label) ?? (0, _stringCoerceBUSzWgUA.s)(record.text);
  const value = (0, _stringCoerceBUSzWgUA.s)(record.value);
  if (!label || !value) return;
  return {
    label,
    value
  };
}
function normalizeInteractiveBlock(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const record = raw;
  const type = (0, _stringCoerceBUSzWgUA.o)(record.type);
  if (type === "text") {
    const text = (0, _stringCoerceBUSzWgUA.s)(record.text);
    return text ? {
      type: "text",
      text
    } : void 0;
  }
  if (type === "buttons") {
    const buttons = Array.isArray(record.buttons) ? record.buttons.map((entry) => normalizeInteractiveButton(entry)).filter((entry) => Boolean(entry)) : [];
    return buttons.length > 0 ? {
      type: "buttons",
      buttons
    } : void 0;
  }
  if (type === "select") {
    const options = Array.isArray(record.options) ? record.options.map((entry) => normalizeInteractiveOption(entry)).filter((entry) => Boolean(entry)) : [];
    return options.length > 0 ? {
      type: "select",
      placeholder: (0, _stringCoerceBUSzWgUA.s)(record.placeholder),
      options
    } : void 0;
  }
}
function normalizeInteractiveReply(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const record = raw;
  const blocks = Array.isArray(record.blocks) ? record.blocks.map((entry) => normalizeInteractiveBlock(entry)).filter((entry) => Boolean(entry)) : [];
  return blocks.length > 0 ? { blocks } : void 0;
}
function hasInteractiveReplyBlocks(value) {
  return Boolean(normalizeInteractiveReply(value));
}
function hasReplyChannelData(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0);
}
function hasReplyContent(params) {
  const text = (0, _stringCoerceBUSzWgUA.s)(params.text);
  const mediaUrl = (0, _stringCoerceBUSzWgUA.s)(params.mediaUrl);
  return Boolean(text || mediaUrl || params.mediaUrls?.some((entry) => Boolean((0, _stringCoerceBUSzWgUA.s)(entry))) || hasInteractiveReplyBlocks(params.interactive) || params.hasChannelData || params.extraContent);
}
function hasReplyPayloadContent(payload, options) {
  return hasReplyContent({
    text: options?.trimText ? payload.text?.trim() : payload.text,
    mediaUrl: payload.mediaUrl,
    mediaUrls: payload.mediaUrls,
    interactive: payload.interactive,
    hasChannelData: options?.hasChannelData ?? hasReplyChannelData(payload.channelData),
    extraContent: options?.extraContent
  });
}
function resolveInteractiveTextFallback(params) {
  if ((0, _stringCoerceBUSzWgUA.s)(params.text)) return params.text;
  return (params.interactive?.blocks ?? []).filter((block) => block.type === "text").map((block) => block.text.trim()).filter(Boolean).join("\n\n") || params.text;
}
//#endregion /* v9-6bd64a6e3e9bb17d */
