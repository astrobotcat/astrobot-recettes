"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveDefaultContextVisibility;exports.t = resolveChannelContextVisibilityMode;var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
var _accountLookupZCs8AOJr = require("./account-lookup-ZCs8AOJr.js");
//#region src/config/context-visibility.ts
function resolveDefaultContextVisibility(cfg) {
  return cfg.channels?.defaults?.contextVisibility;
}
function resolveChannelContextVisibilityMode(params) {
  if (params.configuredContextVisibility) return params.configuredContextVisibility;
  const channelConfig = params.cfg.channels?.[params.channel];
  const accountId = (0, _accountIdJ7GeQlaZ.n)(params.accountId);
  return (0, _accountLookupZCs8AOJr.t)(channelConfig?.accounts, accountId)?.contextVisibility ?? channelConfig?.contextVisibility ?? resolveDefaultContextVisibility(params.cfg) ?? "all";
}
//#endregion /* v9-ca24b062ff54d811 */
