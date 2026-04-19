"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = collectRuntimeConfigAssignments;exports.t = exports.r = void 0;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _runtimeSharedWlb0YE2R = require("./runtime-shared-Wlb0YE2R.js");
var _channelSecretBasicRuntimeCpIIzQ5k = require("./channel-secret-basic-runtime-CpIIzQ5k.js");
require("./channel-secret-basic-runtime-DRCfPgpx.js");
//#region extensions/irc/src/secret-contract.ts
const secretTargetRegistryEntries = exports.r = [
{
  id: "channels.irc.accounts.*.nickserv.password",
  targetType: "channels.irc.accounts.*.nickserv.password",
  configFile: "openclaw.json",
  pathPattern: "channels.irc.accounts.*.nickserv.password",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.irc.accounts.*.password",
  targetType: "channels.irc.accounts.*.password",
  configFile: "openclaw.json",
  pathPattern: "channels.irc.accounts.*.password",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.irc.nickserv.password",
  targetType: "channels.irc.nickserv.password",
  configFile: "openclaw.json",
  pathPattern: "channels.irc.nickserv.password",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.irc.password",
  targetType: "channels.irc.password",
  configFile: "openclaw.json",
  pathPattern: "channels.irc.password",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}];

function collectRuntimeConfigAssignments(params) {
  const resolved = (0, _channelSecretBasicRuntimeCpIIzQ5k.a)(params.config, "irc");
  if (!resolved) return;
  const { channel: irc, surface } = resolved;
  (0, _channelSecretBasicRuntimeCpIIzQ5k.r)({
    channelKey: "irc",
    field: "password",
    channel: irc,
    surface,
    defaults: params.defaults,
    context: params.context,
    topInactiveReason: "no enabled account inherits this top-level IRC password.",
    accountInactiveReason: "IRC account is disabled."
  });
  (0, _channelSecretBasicRuntimeCpIIzQ5k.n)({
    channelKey: "irc",
    nestedKey: "nickserv",
    field: "password",
    channel: irc,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActive: (0, _channelSecretBasicRuntimeCpIIzQ5k.s)(surface, "nickserv") && (0, _utilsD5DtWkEu.l)(irc.nickserv) && (0, _runtimeSharedWlb0YE2R.o)(irc.nickserv),
    topInactiveReason: "no enabled account inherits this top-level IRC nickserv config or NickServ is disabled.",
    accountActive: ({ account, enabled }) => enabled && (0, _utilsD5DtWkEu.l)(account.nickserv) && (0, _runtimeSharedWlb0YE2R.o)(account.nickserv),
    accountInactiveReason: "IRC account is disabled or NickServ is disabled for this account."
  });
}
const channelSecrets = exports.t = {
  secretTargetRegistryEntries,
  collectRuntimeConfigAssignments
};
//#endregion /* v9-ad696655b3e5121a */
