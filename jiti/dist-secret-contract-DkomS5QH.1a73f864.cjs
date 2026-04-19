"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = collectRuntimeConfigAssignments;exports.t = exports.r = void 0;var _channelSecretBasicRuntimeCpIIzQ5k = require("./channel-secret-basic-runtime-CpIIzQ5k.js");
require("./channel-secret-basic-runtime-DRCfPgpx.js");
//#region extensions/mattermost/src/secret-contract.ts
const secretTargetRegistryEntries = exports.r = [{
  id: "channels.mattermost.accounts.*.botToken",
  targetType: "channels.mattermost.accounts.*.botToken",
  configFile: "openclaw.json",
  pathPattern: "channels.mattermost.accounts.*.botToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}, {
  id: "channels.mattermost.botToken",
  targetType: "channels.mattermost.botToken",
  configFile: "openclaw.json",
  pathPattern: "channels.mattermost.botToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}];
function collectRuntimeConfigAssignments(params) {
  const resolved = (0, _channelSecretBasicRuntimeCpIIzQ5k.a)(params.config, "mattermost");
  if (!resolved) return;
  const { channel: mattermost, surface } = resolved;
  (0, _channelSecretBasicRuntimeCpIIzQ5k.r)({
    channelKey: "mattermost",
    field: "botToken",
    channel: mattermost,
    surface,
    defaults: params.defaults,
    context: params.context,
    topInactiveReason: "no enabled account inherits this top-level Mattermost botToken.",
    accountInactiveReason: "Mattermost account is disabled."
  });
}
const channelSecrets = exports.t = {
  secretTargetRegistryEntries,
  collectRuntimeConfigAssignments
};
//#endregion /* v9-8e62e779a8522b68 */
