"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = collectRuntimeConfigAssignments;exports.t = exports.r = void 0;var _runtimeSharedWlb0YE2R = require("./runtime-shared-Wlb0YE2R.js");
var _channelSecretBasicRuntimeCpIIzQ5k = require("./channel-secret-basic-runtime-CpIIzQ5k.js");
require("./channel-secret-basic-runtime-DRCfPgpx.js");
//#region extensions/zalo/src/secret-contract.ts
const secretTargetRegistryEntries = exports.r = [
{
  id: "channels.zalo.accounts.*.botToken",
  targetType: "channels.zalo.accounts.*.botToken",
  configFile: "openclaw.json",
  pathPattern: "channels.zalo.accounts.*.botToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.zalo.accounts.*.webhookSecret",
  targetType: "channels.zalo.accounts.*.webhookSecret",
  configFile: "openclaw.json",
  pathPattern: "channels.zalo.accounts.*.webhookSecret",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.zalo.botToken",
  targetType: "channels.zalo.botToken",
  configFile: "openclaw.json",
  pathPattern: "channels.zalo.botToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.zalo.webhookSecret",
  targetType: "channels.zalo.webhookSecret",
  configFile: "openclaw.json",
  pathPattern: "channels.zalo.webhookSecret",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}];

function collectRuntimeConfigAssignments(params) {
  const resolved = (0, _channelSecretBasicRuntimeCpIIzQ5k.a)(params.config, "zalo");
  if (!resolved) return;
  const { channel: zalo, surface } = resolved;
  (0, _channelSecretBasicRuntimeCpIIzQ5k.t)({
    channelKey: "zalo",
    field: "botToken",
    channel: zalo,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActiveWithoutAccounts: true,
    topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !(0, _runtimeSharedWlb0YE2R.i)(account, "botToken"),
    accountActive: ({ enabled }) => enabled,
    topInactiveReason: "no enabled Zalo surface inherits this top-level botToken.",
    accountInactiveReason: "Zalo account is disabled."
  });
  const baseWebhookUrl = typeof zalo.webhookUrl === "string" ? zalo.webhookUrl.trim() : "";
  const accountWebhookUrl = (account) => (0, _runtimeSharedWlb0YE2R.i)(account, "webhookUrl") ? typeof account.webhookUrl === "string" ? account.webhookUrl.trim() : "" : baseWebhookUrl;
  (0, _channelSecretBasicRuntimeCpIIzQ5k.t)({
    channelKey: "zalo",
    field: "webhookSecret",
    channel: zalo,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActiveWithoutAccounts: baseWebhookUrl.length > 0,
    topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !(0, _runtimeSharedWlb0YE2R.i)(account, "webhookSecret") && accountWebhookUrl(account).length > 0,
    accountActive: ({ account, enabled }) => enabled && accountWebhookUrl(account).length > 0,
    topInactiveReason: "no enabled Zalo webhook surface inherits this top-level webhookSecret (webhook mode is not active).",
    accountInactiveReason: "Zalo account is disabled or webhook mode is not active for this account."
  });
}
const channelSecrets = exports.t = {
  secretTargetRegistryEntries,
  collectRuntimeConfigAssignments
};
//#endregion /* v9-cdf16d26f80e4a2b */
