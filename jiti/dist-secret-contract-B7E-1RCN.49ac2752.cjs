"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = collectRuntimeConfigAssignments;exports.t = exports.r = void 0;var _runtimeSharedWlb0YE2R = require("./runtime-shared-Wlb0YE2R.js");
var _channelSecretBasicRuntimeCpIIzQ5k = require("./channel-secret-basic-runtime-CpIIzQ5k.js");
require("./channel-secret-basic-runtime-DRCfPgpx.js");
//#region extensions/nextcloud-talk/src/secret-contract.ts
const secretTargetRegistryEntries = exports.r = [
{
  id: "channels.nextcloud-talk.accounts.*.apiPassword",
  targetType: "channels.nextcloud-talk.accounts.*.apiPassword",
  configFile: "openclaw.json",
  pathPattern: "channels.nextcloud-talk.accounts.*.apiPassword",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.nextcloud-talk.accounts.*.botSecret",
  targetType: "channels.nextcloud-talk.accounts.*.botSecret",
  configFile: "openclaw.json",
  pathPattern: "channels.nextcloud-talk.accounts.*.botSecret",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.nextcloud-talk.apiPassword",
  targetType: "channels.nextcloud-talk.apiPassword",
  configFile: "openclaw.json",
  pathPattern: "channels.nextcloud-talk.apiPassword",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.nextcloud-talk.botSecret",
  targetType: "channels.nextcloud-talk.botSecret",
  configFile: "openclaw.json",
  pathPattern: "channels.nextcloud-talk.botSecret",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}];

function collectRuntimeConfigAssignments(params) {
  const resolved = (0, _channelSecretBasicRuntimeCpIIzQ5k.a)(params.config, "nextcloud-talk");
  if (!resolved) return;
  const { channel: nextcloudTalk, surface } = resolved;
  const inheritsField = (field) => ({ account, enabled }) => enabled && !(0, _runtimeSharedWlb0YE2R.i)(account, field);
  (0, _channelSecretBasicRuntimeCpIIzQ5k.t)({
    channelKey: "nextcloud-talk",
    field: "botSecret",
    channel: nextcloudTalk,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActiveWithoutAccounts: true,
    topLevelInheritedAccountActive: inheritsField("botSecret"),
    accountActive: ({ enabled }) => enabled,
    topInactiveReason: "no enabled Nextcloud Talk surface inherits this top-level botSecret.",
    accountInactiveReason: "Nextcloud Talk account is disabled."
  });
  (0, _channelSecretBasicRuntimeCpIIzQ5k.t)({
    channelKey: "nextcloud-talk",
    field: "apiPassword",
    channel: nextcloudTalk,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActiveWithoutAccounts: true,
    topLevelInheritedAccountActive: inheritsField("apiPassword"),
    accountActive: ({ enabled }) => enabled,
    topInactiveReason: "no enabled Nextcloud Talk surface inherits this top-level apiPassword.",
    accountInactiveReason: "Nextcloud Talk account is disabled."
  });
}
const channelSecrets = exports.t = {
  secretTargetRegistryEntries,
  collectRuntimeConfigAssignments
};
//#endregion /* v9-465679a644ee91c5 */
