"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = parseToolsBySenderTypedKey;exports.t = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/config/types.tools.ts
const TOOLS_BY_SENDER_KEY_TYPES = exports.t = [
"id",
"e164",
"username",
"name"];

function parseToolsBySenderTypedKey(rawKey) {
  const trimmed = rawKey.trim();
  if (!trimmed) return;
  const lowered = (0, _stringCoerceBUSzWgUA.i)(trimmed);
  for (const type of TOOLS_BY_SENDER_KEY_TYPES) {
    const prefix = `${type}:`;
    if (!lowered.startsWith(prefix)) continue;
    return {
      type,
      value: trimmed.slice(prefix.length)
    };
  }
}
//#endregion /* v9-e07060dd2c09c647 */
