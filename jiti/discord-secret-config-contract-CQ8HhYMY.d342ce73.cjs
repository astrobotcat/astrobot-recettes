"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = void 0;exports.t = collectRuntimeConfigAssignments;var _channelSecretBasicRuntime = require("openclaw/plugin-sdk/channel-secret-basic-runtime");
var _channelSecretTtsRuntime = require("openclaw/plugin-sdk/channel-secret-tts-runtime");
//#region extensions/discord/src/secret-config-contract.ts
const secretTargetRegistryEntries = exports.n = [
{
  id: "channels.discord.accounts.*.pluralkit.token",
  targetType: "channels.discord.accounts.*.pluralkit.token",
  configFile: "openclaw.json",
  pathPattern: "channels.discord.accounts.*.pluralkit.token",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.discord.accounts.*.token",
  targetType: "channels.discord.accounts.*.token",
  configFile: "openclaw.json",
  pathPattern: "channels.discord.accounts.*.token",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.discord.accounts.*.voice.tts.providers.*.apiKey",
  targetType: "channels.discord.accounts.*.voice.tts.providers.*.apiKey",
  configFile: "openclaw.json",
  pathPattern: "channels.discord.accounts.*.voice.tts.providers.*.apiKey",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true,
  providerIdPathSegmentIndex: 6
},
{
  id: "channels.discord.pluralkit.token",
  targetType: "channels.discord.pluralkit.token",
  configFile: "openclaw.json",
  pathPattern: "channels.discord.pluralkit.token",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.discord.token",
  targetType: "channels.discord.token",
  configFile: "openclaw.json",
  pathPattern: "channels.discord.token",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.discord.voice.tts.providers.*.apiKey",
  targetType: "channels.discord.voice.tts.providers.*.apiKey",
  configFile: "openclaw.json",
  pathPattern: "channels.discord.voice.tts.providers.*.apiKey",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true,
  providerIdPathSegmentIndex: 4
}];

function collectRuntimeConfigAssignments(params) {
  const resolved = (0, _channelSecretBasicRuntime.getChannelSurface)(params.config, "discord");
  if (!resolved) return;
  const { channel: discord, surface } = resolved;
  (0, _channelSecretBasicRuntime.collectSimpleChannelFieldAssignments)({
    channelKey: "discord",
    field: "token",
    channel: discord,
    surface,
    defaults: params.defaults,
    context: params.context,
    topInactiveReason: "no enabled account inherits this top-level Discord token.",
    accountInactiveReason: "Discord account is disabled."
  });
  (0, _channelSecretBasicRuntime.collectNestedChannelFieldAssignments)({
    channelKey: "discord",
    nestedKey: "pluralkit",
    field: "token",
    channel: discord,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActive: (0, _channelSecretBasicRuntime.isBaseFieldActiveForChannelSurface)(surface, "pluralkit") && (0, _channelSecretBasicRuntime.isRecord)(discord.pluralkit) && (0, _channelSecretBasicRuntime.isEnabledFlag)(discord.pluralkit),
    topInactiveReason: "no enabled Discord surface inherits this top-level PluralKit config or PluralKit is disabled.",
    accountActive: ({ account, enabled }) => enabled && (0, _channelSecretBasicRuntime.isRecord)(account.pluralkit) && (0, _channelSecretBasicRuntime.isEnabledFlag)(account.pluralkit),
    accountInactiveReason: "Discord account is disabled or PluralKit is disabled for this account."
  });
  (0, _channelSecretTtsRuntime.collectNestedChannelTtsAssignments)({
    channelKey: "discord",
    nestedKey: "voice",
    channel: discord,
    surface,
    defaults: params.defaults,
    context: params.context,
    topLevelActive: (0, _channelSecretBasicRuntime.isBaseFieldActiveForChannelSurface)(surface, "voice") && (0, _channelSecretBasicRuntime.isRecord)(discord.voice) && (0, _channelSecretBasicRuntime.isEnabledFlag)(discord.voice),
    topInactiveReason: "no enabled Discord surface inherits this top-level voice config or voice is disabled.",
    accountActive: ({ account, enabled }) => enabled && (0, _channelSecretBasicRuntime.isRecord)(account.voice) && (0, _channelSecretBasicRuntime.isEnabledFlag)(account.voice),
    accountInactiveReason: "Discord account is disabled or voice is disabled for this account."
  });
}
//#endregion /* v9-8c6f9ae35ef73933 */
