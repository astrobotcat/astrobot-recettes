"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = collectRuntimeConfigAssignments;exports.t = exports.r = void 0;var _channelSecretBasicRuntime = require("openclaw/plugin-sdk/channel-secret-basic-runtime");
//#region extensions/feishu/src/secret-contract.ts
const secretTargetRegistryEntries = exports.r = [
{
  id: "channels.feishu.accounts.*.appSecret",
  targetType: "channels.feishu.accounts.*.appSecret",
  configFile: "openclaw.json",
  pathPattern: "channels.feishu.accounts.*.appSecret",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.feishu.accounts.*.encryptKey",
  targetType: "channels.feishu.accounts.*.encryptKey",
  configFile: "openclaw.json",
  pathPattern: "channels.feishu.accounts.*.encryptKey",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.feishu.accounts.*.verificationToken",
  targetType: "channels.feishu.accounts.*.verificationToken",
  configFile: "openclaw.json",
  pathPattern: "channels.feishu.accounts.*.verificationToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.feishu.appSecret",
  targetType: "channels.feishu.appSecret",
  configFile: "openclaw.json",
  pathPattern: "channels.feishu.appSecret",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.feishu.encryptKey",
  targetType: "channels.feishu.encryptKey",
  configFile: "openclaw.json",
  pathPattern: "channels.feishu.encryptKey",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.feishu.verificationToken",
  targetType: "channels.feishu.verificationToken",
  configFile: "openclaw.json",
  pathPattern: "channels.feishu.verificationToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}];

function collectRuntimeConfigAssignments(params) {
  const resolved = (0, _channelSecretBasicRuntime.getChannelSurface)(params.config, "feishu");
  if (!resolved) return;
  const { channel: feishu, surface } = resolved;
  (0, _channelSecretBasicRuntime.collectSimpleChannelFieldAssignments)({
    channelKey: "feishu",
    field: "appSecret",
    channel: feishu,
    surface,
    defaults: params.defaults,
    context: params.context,
    topInactiveReason: "no enabled account inherits this top-level Feishu appSecret.",
    accountInactiveReason: "Feishu account is disabled."
  });
  const baseConnectionMode = (0, _channelSecretBasicRuntime.normalizeSecretStringValue)(feishu.connectionMode) === "webhook" ? "webhook" : "websocket";
  const resolveAccountMode = (account) => (0, _channelSecretBasicRuntime.hasOwnProperty)(account, "connectionMode") ? (0, _channelSecretBasicRuntime.normalizeSecretStringValue)(account.connectionMode) : baseConnectionMode;
  (0, _channelSecretBasicRuntime.collectConditionalChannelFieldAssignments)({
    channelKey: "feishu",
    field: "encryptKey",
    channel: feishu,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActiveWithoutAccounts: baseConnectionMode === "webhook",
    topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !(0, _channelSecretBasicRuntime.hasOwnProperty)(account, "encryptKey") && resolveAccountMode(account) === "webhook",
    accountActive: ({ account, enabled }) => enabled && resolveAccountMode(account) === "webhook",
    topInactiveReason: "no enabled Feishu webhook-mode surface inherits this top-level encryptKey.",
    accountInactiveReason: "Feishu account is disabled or not running in webhook mode."
  });
  (0, _channelSecretBasicRuntime.collectConditionalChannelFieldAssignments)({
    channelKey: "feishu",
    field: "verificationToken",
    channel: feishu,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActiveWithoutAccounts: baseConnectionMode === "webhook",
    topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !(0, _channelSecretBasicRuntime.hasOwnProperty)(account, "verificationToken") && resolveAccountMode(account) === "webhook",
    accountActive: ({ account, enabled }) => enabled && resolveAccountMode(account) === "webhook",
    topInactiveReason: "no enabled Feishu webhook-mode surface inherits this top-level verificationToken.",
    accountInactiveReason: "Feishu account is disabled or not running in webhook mode."
  });
}
const channelSecrets = exports.t = {
  secretTargetRegistryEntries,
  collectRuntimeConfigAssignments
};
//#endregion /* v9-f0cdbea12d971d88 */
