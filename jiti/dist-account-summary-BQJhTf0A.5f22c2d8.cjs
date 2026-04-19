"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveChannelAccountEnabled;exports.n = formatChannelAllowFrom;exports.r = resolveChannelAccountConfigured;exports.t = buildChannelAccountSnapshot;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _stringNormalizationXm3f27dv = require("./string-normalization-xm3f27dv.js");
var _accountSnapshotFieldsDXlFJrtW = require("./account-snapshot-fields-DXlFJrtW.js");
//#region src/channels/account-summary.ts
function buildChannelAccountSnapshot(params) {
  const described = params.plugin.config.describeAccount?.(params.account, params.cfg);
  return {
    enabled: params.enabled,
    configured: params.configured,
    ...(0, _accountSnapshotFieldsDXlFJrtW.i)(params.account),
    ...described,
    accountId: params.accountId
  };
}
function formatChannelAllowFrom(params) {
  if (params.plugin.config.formatAllowFrom) return params.plugin.config.formatAllowFrom({
    cfg: params.cfg,
    accountId: params.accountId,
    allowFrom: params.allowFrom
  });
  return (0, _stringNormalizationXm3f27dv.s)(params.allowFrom);
}
function resolveChannelAccountEnabled(params) {
  if (params.plugin.config.isEnabled) return params.plugin.config.isEnabled(params.account, params.cfg);
  return ((0, _utilsD5DtWkEu.l)(params.account) ? params.account.enabled : void 0) !== false;
}
async function resolveChannelAccountConfigured(params) {
  if (params.plugin.config.isConfigured) return await params.plugin.config.isConfigured(params.account, params.cfg);
  if (params.readAccountConfiguredField) return ((0, _utilsD5DtWkEu.l)(params.account) ? params.account.configured : void 0) !== false;
  return true;
}
//#endregion /* v9-7c6359b30554ba54 */
