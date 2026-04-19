"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = isRestartEnabled;exports.t = isCommandFlagEnabled;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
//#region src/config/commands.flags.ts
function getOwnCommandFlagValue(config, key) {
  const { commands } = config ?? {};
  if (!(0, _utilsD5DtWkEu.x)(commands) || !Object.hasOwn(commands, key)) return;
  return commands[key];
}
function isCommandFlagEnabled(config, key) {
  return getOwnCommandFlagValue(config, key) === true;
}
function isRestartEnabled(config) {
  return getOwnCommandFlagValue(config, "restart") !== false;
}
//#endregion /* v9-b7d9dbfa76d54d17 */
