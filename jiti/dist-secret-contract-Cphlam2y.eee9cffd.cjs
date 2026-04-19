"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = collectRuntimeConfigAssignments;exports.t = exports.r = void 0;var _runtimeSharedWlb0YE2R = require("./runtime-shared-Wlb0YE2R.js");
var _channelSecretBasicRuntimeCpIIzQ5k = require("./channel-secret-basic-runtime-CpIIzQ5k.js");
require("./channel-secret-basic-runtime-DRCfPgpx.js");
//#region extensions/msteams/src/secret-contract.ts
const secretTargetRegistryEntries = exports.r = [{
  id: "channels.msteams.appPassword",
  targetType: "channels.msteams.appPassword",
  configFile: "openclaw.json",
  pathPattern: "channels.msteams.appPassword",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}];
function collectRuntimeConfigAssignments(params) {
  const msteams = (0, _channelSecretBasicRuntimeCpIIzQ5k.i)(params.config, "msteams");
  if (!msteams) return;
  (0, _runtimeSharedWlb0YE2R.n)({
    value: msteams.appPassword,
    path: "channels.msteams.appPassword",
    expected: "string",
    defaults: params.defaults,
    context: params.context,
    active: msteams.enabled !== false,
    inactiveReason: "Microsoft Teams channel is disabled.",
    apply: (value) => {
      msteams.appPassword = value;
    }
  });
}
const channelSecrets = exports.t = {
  secretTargetRegistryEntries,
  collectRuntimeConfigAssignments
};
//#endregion /* v9-b236574f187e1245 */
