"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = buildPairingReply;var _commandFormatDd3uP = require("./command-format-Dd3uP9-6.js");
//#region src/pairing/pairing-messages.ts
function buildPairingReply(params) {
  const { channel, idLine, code } = params;
  const approveCommand = (0, _commandFormatDd3uP.t)(`openclaw pairing approve ${channel} ${code}`);
  return [
  "OpenClaw: access not configured.",
  "",
  idLine,
  "Pairing code:",
  "```",
  code,
  "```",
  "",
  "Ask the bot owner to approve with:",
  (0, _commandFormatDd3uP.t)(`openclaw pairing approve ${channel} ${code}`),
  "```",
  approveCommand,
  "```"].
  join("\n");
}
//#endregion /* v9-3c2e9cb0561b7ed7 */
