"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = parseSessionThreadInfoFast;exports.t = parseSessionThreadInfo;var _sessionThreadInfoLoadedBxSiO1jo = require("./session-thread-info-loaded-BxSiO1jo.js");
var _sessionConversationBkRPri5o = require("./session-conversation-BkRPri5o.js");
//#region src/config/sessions/thread-info.ts
/**
* Extract deliveryContext and threadId from a sessionKey.
* Supports generic :thread: suffixes plus plugin-owned thread/session grammars.
*/
function parseSessionThreadInfo(sessionKey) {
  return (0, _sessionConversationBkRPri5o.i)(sessionKey);
}
function parseSessionThreadInfoFast(sessionKey) {
  return (0, _sessionThreadInfoLoadedBxSiO1jo.t)(sessionKey);
}
//#endregion /* v9-fa84dec970450f46 */
