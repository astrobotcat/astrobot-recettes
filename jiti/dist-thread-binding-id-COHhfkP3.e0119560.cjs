"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveThreadBindingConversationIdFromBindingId;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/channels/thread-binding-id.ts
function resolveThreadBindingConversationIdFromBindingId(params) {
  const bindingId = (0, _stringCoerceBUSzWgUA.s)(params.bindingId);
  if (!bindingId) return;
  const prefix = `${params.accountId}:`;
  if (!bindingId.startsWith(prefix)) return;
  return (0, _stringCoerceBUSzWgUA.s)(bindingId.slice(prefix.length)) || void 0;
}
//#endregion /* v9-e2bf1f7234e8f98c */
