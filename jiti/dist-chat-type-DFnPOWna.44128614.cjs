"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = normalizeChatType;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/channels/chat-type.ts
function normalizeChatType(raw) {
  const value = (0, _stringCoerceBUSzWgUA.o)(raw);
  if (!value) return;
  if (value === "direct" || value === "dm") return "direct";
  if (value === "group") return "group";
  if (value === "channel") return "channel";
}
//#endregion /* v9-34cf9b2664b371d4 */
