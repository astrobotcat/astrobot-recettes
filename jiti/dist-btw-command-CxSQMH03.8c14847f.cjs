"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = isBtwRequestText;exports.t = extractBtwQuestion;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _commandsRegistryNormalizeBy3bcvJy = require("./commands-registry-normalize-By3bcvJy.js");
require("./commands-registry-CxFYC-Xg.js");
//#region src/auto-reply/reply/btw-command.ts
const BTW_COMMAND_RE = /^\/btw(?::|\s|$)/i;
function isBtwRequestText(text, options) {
  if (!text) return false;
  const normalized = (0, _commandsRegistryNormalizeBy3bcvJy.r)(text, options).trim();
  return BTW_COMMAND_RE.test(normalized);
}
function extractBtwQuestion(text, options) {
  if (!text) return null;
  const match = (0, _commandsRegistryNormalizeBy3bcvJy.r)(text, options).trim().match(/^\/btw(?:\s+(.*))?$/i);
  if (!match) return null;
  return (0, _stringCoerceBUSzWgUA.s)(match[1]) ?? "";
}
//#endregion /* v9-28aae5dbe0c25433 */
