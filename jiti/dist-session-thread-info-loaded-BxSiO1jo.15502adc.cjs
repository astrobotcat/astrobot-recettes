"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveLoadedSessionThreadInfo;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _registryLoadedReadB9a4LkEi = require("./registry-loaded-read-B9a4LkEi.js");
//#region src/channels/plugins/session-thread-info-loaded.ts
function resolveLoadedSessionConversationThreadInfo(sessionKey) {
  const raw = (0, _sessionKeyBh1lMwK.S)(sessionKey);
  if (!raw) return null;
  const rawId = raw.rawId.trim();
  if (!rawId) return null;
  const resolved = (0, _registryLoadedReadB9a4LkEi.t)(raw.channel)?.messaging?.resolveSessionConversation?.({
    kind: raw.kind,
    rawId
  });
  if (!resolved?.id?.trim()) return null;
  const id = resolved.id.trim();
  const threadId = (0, _stringCoerceBUSzWgUA.s)(resolved.threadId);
  return {
    baseSessionKey: threadId ? `${raw.prefix}:${id}` : (0, _stringCoerceBUSzWgUA.s)(sessionKey),
    threadId
  };
}
function resolveLoadedSessionThreadInfo(sessionKey) {
  return resolveLoadedSessionConversationThreadInfo(sessionKey) ?? (0, _sessionKeyBh1lMwK.C)(sessionKey);
}
//#endregion /* v9-5c39e8bf1ef682b9 */
