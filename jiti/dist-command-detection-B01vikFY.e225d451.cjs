"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = shouldComputeCommandAuthorized;exports.n = hasInlineCommandTokens;exports.r = isControlCommandMessage;exports.t = hasControlCommand;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _stripInboundMetaFgJYIXvo = require("./strip-inbound-meta-FgJYIXvo.js");
var _commandsRegistryListMHrd1pp = require("./commands-registry-list-MHrd1pp9.js");
var _commandsRegistryNormalizeBy3bcvJy = require("./commands-registry-normalize-By3bcvJy.js");
var _abortPrimitivesBGJ_PnY = require("./abort-primitives-BG-J_PnY.js");
//#region src/auto-reply/command-detection.ts
function hasControlCommand(text, cfg, options) {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  const stripped = (0, _stripInboundMetaFgJYIXvo.n)(trimmed);
  if (!stripped) return false;
  const normalizedBody = (0, _commandsRegistryNormalizeBy3bcvJy.r)(stripped, options);
  if (!normalizedBody) return false;
  const lowered = (0, _stringCoerceBUSzWgUA.i)(normalizedBody);
  const commands = cfg ? (0, _commandsRegistryListMHrd1pp.r)(cfg) : (0, _commandsRegistryListMHrd1pp.n)();
  for (const command of commands) for (const alias of command.textAliases) {
    const normalized = (0, _stringCoerceBUSzWgUA.o)(alias);
    if (!normalized) continue;
    if (lowered === normalized) return true;
    if (command.acceptsArgs && lowered.startsWith(normalized)) {
      const nextChar = normalizedBody.charAt(normalized.length);
      if (nextChar && /\s/.test(nextChar)) return true;
    }
  }
  return false;
}
function isControlCommandMessage(text, cfg, options) {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (hasControlCommand(trimmed, cfg, options)) return true;
  return (0, _abortPrimitivesBGJ_PnY.r)((0, _stringCoerceBUSzWgUA.o)((0, _commandsRegistryNormalizeBy3bcvJy.r)((0, _stripInboundMetaFgJYIXvo.n)(trimmed), options)) ?? "");
}
/**
* Coarse detection for inline directives/shortcuts (e.g. "hey /status") so channel monitors
* can decide whether to compute CommandAuthorized for a message.
*
* This intentionally errs on the side of false positives; CommandAuthorized only gates
* command/directive execution, not normal chat replies.
*/
function hasInlineCommandTokens(text) {
  const body = text ?? "";
  if (!body.trim()) return false;
  return /(?:^|\s)[/!][a-z]/i.test(body);
}
function shouldComputeCommandAuthorized(text, cfg, options) {
  return isControlCommandMessage(text, cfg, options) || hasInlineCommandTokens(text);
}
//#endregion /* v9-19e7715bdceca8a1 */
