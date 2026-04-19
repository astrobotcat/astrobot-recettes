"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveConversationIdFromTargets;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/infra/outbound/conversation-id.ts
function resolveExplicitConversationTargetId(target) {
  for (const prefix of [
  "channel:",
  "conversation:",
  "group:",
  "room:",
  "dm:"])
  if ((0, _stringCoerceBUSzWgUA.i)(target).startsWith(prefix)) return (0, _stringCoerceBUSzWgUA.s)(target.slice(prefix.length));
}
function resolveConversationIdFromTargets(params) {
  const threadId = params.threadId != null ? (0, _stringCoerceBUSzWgUA.s)(String(params.threadId)) : void 0;
  if (threadId) return threadId;
  for (const rawTarget of params.targets) {
    const target = (0, _stringCoerceBUSzWgUA.s)(rawTarget);
    if (!target) continue;
    const explicitConversationId = resolveExplicitConversationTargetId(target);
    if (explicitConversationId) return explicitConversationId;
    if (target.includes(":") && explicitConversationId === void 0) continue;
    const mentionMatch = target.match(/^<#(\d+)>$/);
    if (mentionMatch?.[1]) return mentionMatch[1];
    if (/^\d{6,}$/.test(target)) return target;
  }
}
//#endregion /* v9-198fa23583ba161f */
