"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveManifestActivationPluginIds;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _manifestRegistryBd3A4lqx = require("./manifest-registry-Bd3A4lqx.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _channelConfiguredBTEJAT4e = require("./channel-configured-BTEJAT4e.js");
//#region src/plugins/activation-planner.ts
function resolveManifestActivationPluginIds(params) {
  const onlyPluginIdSet = (0, _channelConfiguredBTEJAT4e.n)((0, _channelConfiguredBTEJAT4e.a)(params.onlyPluginIds));
  return [...new Set((0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env,
    cache: params.cache
  }).plugins.filter((plugin) => (!params.origin || plugin.origin === params.origin) && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)) && matchesManifestActivationTrigger(plugin, params.trigger)).map((plugin) => plugin.id))].toSorted((left, right) => left.localeCompare(right));
}
function matchesManifestActivationTrigger(plugin, trigger) {
  switch (trigger.kind) {
    case "command":return listActivationCommandIds(plugin).includes(normalizeCommandId(trigger.command));
    case "provider":return listActivationProviderIds(plugin).includes((0, _providerIdKaStHhRz.r)(trigger.provider));
    case "agentHarness":return listActivationAgentHarnessIds(plugin).includes(normalizeCommandId(trigger.runtime));
    case "channel":return listActivationChannelIds(plugin).includes(normalizeCommandId(trigger.channel));
    case "route":return listActivationRouteIds(plugin).includes(normalizeCommandId(trigger.route));
    case "capability":return hasActivationCapability(plugin, trigger.capability);
  }
  return trigger;
}
function listActivationAgentHarnessIds(plugin) {
  return [...(plugin.activation?.onAgentHarnesses ?? [])].map(normalizeCommandId).filter(Boolean);
}
function listActivationCommandIds(plugin) {
  return [...(plugin.activation?.onCommands ?? []), ...(plugin.commandAliases ?? []).flatMap((alias) => alias.cliCommand ?? alias.name)].map(normalizeCommandId).filter(Boolean);
}
function listActivationProviderIds(plugin) {
  return [
  ...(plugin.activation?.onProviders ?? []),
  ...plugin.providers,
  ...(plugin.setup?.providers?.map((provider) => provider.id) ?? [])].
  map((value) => (0, _providerIdKaStHhRz.r)(value)).filter(Boolean);
}
function listActivationChannelIds(plugin) {
  return [...(plugin.activation?.onChannels ?? []), ...plugin.channels].map(normalizeCommandId).filter(Boolean);
}
function listActivationRouteIds(plugin) {
  return (plugin.activation?.onRoutes ?? []).map(normalizeCommandId).filter(Boolean);
}
function hasActivationCapability(plugin, capability) {
  if (plugin.activation?.onCapabilities?.includes(capability)) return true;
  switch (capability) {
    case "provider":return listActivationProviderIds(plugin).length > 0;
    case "channel":return listActivationChannelIds(plugin).length > 0;
    case "tool":return (plugin.contracts?.tools?.length ?? 0) > 0;
    case "hook":return plugin.hooks.length > 0;
  }
  return capability;
}
function normalizeCommandId(value) {
  return (0, _stringCoerceBUSzWgUA.o)(value) ?? "";
}
//#endregion /* v9-13e6664ddefd9b34 */
