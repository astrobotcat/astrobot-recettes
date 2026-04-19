"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveTelegramReactionLevel;var _accountsCoskdHdZ = require("./accounts-CoskdHdZ.js");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
//#region extensions/telegram/src/reaction-level.ts
/**
* Resolve the effective reaction level and its implications.
*/
function resolveTelegramReactionLevel(params) {
  return (0, _textRuntime.resolveReactionLevel)({
    value: (0, _accountsCoskdHdZ.s)({
      cfg: params.cfg,
      accountId: params.accountId
    }).config.reactionLevel,
    defaultLevel: "minimal",
    invalidFallback: "ack"
  });
}
//#endregion /* v9-acbd3e3c450a2129 */
