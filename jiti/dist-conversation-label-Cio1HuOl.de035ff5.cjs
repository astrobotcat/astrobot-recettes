"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveConversationLabel;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _chatTypeDFnPOWna = require("./chat-type-DFnPOWna.js");
//#region src/channels/conversation-label.ts
function extractConversationId(from) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(from);
  if (!trimmed) return;
  const parts = trimmed.split(":").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : trimmed;
}
function shouldAppendId(id) {
  if (/^[0-9]+$/.test(id)) return true;
  if (id.includes("@g.us")) return true;
  return false;
}
function resolveConversationLabel(ctx) {
  const explicit = (0, _stringCoerceBUSzWgUA.s)(ctx.ConversationLabel);
  if (explicit) return explicit;
  const threadLabel = (0, _stringCoerceBUSzWgUA.s)(ctx.ThreadLabel);
  if (threadLabel) return threadLabel;
  if ((0, _chatTypeDFnPOWna.t)(ctx.ChatType) === "direct") return (0, _stringCoerceBUSzWgUA.s)(ctx.SenderName) ?? (0, _stringCoerceBUSzWgUA.s)(ctx.From);
  const base = (0, _stringCoerceBUSzWgUA.s)(ctx.GroupChannel) || (0, _stringCoerceBUSzWgUA.s)(ctx.GroupSubject) || (0, _stringCoerceBUSzWgUA.s)(ctx.GroupSpace) || (0, _stringCoerceBUSzWgUA.s)(ctx.From) || "";
  if (!base) return;
  const id = extractConversationId(ctx.From);
  if (!id) return base;
  if (!shouldAppendId(id)) return base;
  if (base === id) return base;
  if (base.includes(id)) return base;
  if ((0, _stringCoerceBUSzWgUA.i)(base).includes(" id:")) return base;
  if (base.startsWith("#") || base.startsWith("@")) return base;
  return `${base} id:${id}`;
}
//#endregion /* v9-045b70ca1921b74a */
