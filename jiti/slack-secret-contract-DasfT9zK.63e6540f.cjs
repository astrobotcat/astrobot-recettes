"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = collectRuntimeConfigAssignments;exports.t = exports.r = void 0;var _channelSecretBasicRuntime = require("openclaw/plugin-sdk/channel-secret-basic-runtime");
//#region extensions/slack/src/secret-contract.ts
const secretTargetRegistryEntries = exports.r = [
{
  id: "channels.slack.accounts.*.appToken",
  targetType: "channels.slack.accounts.*.appToken",
  configFile: "openclaw.json",
  pathPattern: "channels.slack.accounts.*.appToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.slack.accounts.*.botToken",
  targetType: "channels.slack.accounts.*.botToken",
  configFile: "openclaw.json",
  pathPattern: "channels.slack.accounts.*.botToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.slack.accounts.*.signingSecret",
  targetType: "channels.slack.accounts.*.signingSecret",
  configFile: "openclaw.json",
  pathPattern: "channels.slack.accounts.*.signingSecret",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.slack.accounts.*.userToken",
  targetType: "channels.slack.accounts.*.userToken",
  configFile: "openclaw.json",
  pathPattern: "channels.slack.accounts.*.userToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.slack.appToken",
  targetType: "channels.slack.appToken",
  configFile: "openclaw.json",
  pathPattern: "channels.slack.appToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.slack.botToken",
  targetType: "channels.slack.botToken",
  configFile: "openclaw.json",
  pathPattern: "channels.slack.botToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.slack.signingSecret",
  targetType: "channels.slack.signingSecret",
  configFile: "openclaw.json",
  pathPattern: "channels.slack.signingSecret",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.slack.userToken",
  targetType: "channels.slack.userToken",
  configFile: "openclaw.json",
  pathPattern: "channels.slack.userToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}];

function collectRuntimeConfigAssignments(params) {
  const resolved = (0, _channelSecretBasicRuntime.getChannelSurface)(params.config, "slack");
  if (!resolved) return;
  const { channel: slack, surface } = resolved;
  const baseMode = slack.mode === "http" || slack.mode === "socket" ? slack.mode : "socket";
  for (const field of ["botToken", "userToken"]) (0, _channelSecretBasicRuntime.collectSimpleChannelFieldAssignments)({
    channelKey: "slack",
    field,
    channel: slack,
    surface,
    defaults: params.defaults,
    context: params.context,
    topInactiveReason: `no enabled account inherits this top-level Slack ${field}.`,
    accountInactiveReason: "Slack account is disabled."
  });
  const resolveAccountMode = (account) => account.mode === "http" || account.mode === "socket" ? account.mode : baseMode;
  (0, _channelSecretBasicRuntime.collectConditionalChannelFieldAssignments)({
    channelKey: "slack",
    field: "appToken",
    channel: slack,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActiveWithoutAccounts: baseMode !== "http",
    topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !(0, _channelSecretBasicRuntime.hasOwnProperty)(account, "appToken") && resolveAccountMode(account) !== "http",
    accountActive: ({ account, enabled }) => enabled && resolveAccountMode(account) !== "http",
    topInactiveReason: "no enabled Slack socket-mode surface inherits this top-level appToken.",
    accountInactiveReason: "Slack account is disabled or not running in socket mode."
  });
  (0, _channelSecretBasicRuntime.collectConditionalChannelFieldAssignments)({
    channelKey: "slack",
    field: "signingSecret",
    channel: slack,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActiveWithoutAccounts: baseMode === "http",
    topLevelInheritedAccountActive: ({ account, enabled }) => enabled && !(0, _channelSecretBasicRuntime.hasOwnProperty)(account, "signingSecret") && resolveAccountMode(account) === "http",
    accountActive: ({ account, enabled }) => enabled && resolveAccountMode(account) === "http",
    topInactiveReason: "no enabled Slack HTTP-mode surface inherits this top-level signingSecret.",
    accountInactiveReason: "Slack account is disabled or not running in HTTP mode."
  });
}
const channelSecrets = exports.t = {
  secretTargetRegistryEntries,
  collectRuntimeConfigAssignments
};
//#endregion /* v9-cee50b4e658e3c78 */
