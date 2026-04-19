"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = collectRuntimeConfigAssignments;exports.t = exports.r = void 0;var _channelSecretBasicRuntimeCpIIzQ5k = require("./channel-secret-basic-runtime-CpIIzQ5k.js");
require("./channel-secret-basic-runtime-DRCfPgpx.js");
//#region extensions/bluebubbles/src/secret-contract.ts
const secretTargetRegistryEntries = exports.r = [{
  id: "channels.bluebubbles.accounts.*.password",
  targetType: "channels.bluebubbles.accounts.*.password",
  configFile: "openclaw.json",
  pathPattern: "channels.bluebubbles.accounts.*.password",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}, {
  id: "channels.bluebubbles.password",
  targetType: "channels.bluebubbles.password",
  configFile: "openclaw.json",
  pathPattern: "channels.bluebubbles.password",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}];
function collectRuntimeConfigAssignments(params) {
  const resolved = (0, _channelSecretBasicRuntimeCpIIzQ5k.a)(params.config, "bluebubbles");
  if (!resolved) return;
  const { channel: bluebubbles, surface } = resolved;
  (0, _channelSecretBasicRuntimeCpIIzQ5k.r)({
    channelKey: "bluebubbles",
    field: "password",
    channel: bluebubbles,
    surface,
    defaults: params.defaults,
    context: params.context,
    topInactiveReason: "no enabled account inherits this top-level BlueBubbles password.",
    accountInactiveReason: "BlueBubbles account is disabled."
  });
}
const channelSecrets = exports.t = {
  secretTargetRegistryEntries,
  collectRuntimeConfigAssignments
};
//#endregion /* v9-3f51bc6bfa5f7fa9 */
