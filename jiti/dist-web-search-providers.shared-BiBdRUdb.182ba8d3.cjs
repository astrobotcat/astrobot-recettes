"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = mapRegistryProviders;exports.c = sortPluginProviders;exports.i = buildWebProviderSnapshotCacheKey;exports.l = sortPluginProvidersForAutoDetect;exports.n = sortWebSearchProviders;exports.o = resolveBundledWebProviderResolutionConfig;exports.r = sortWebSearchProvidersForAutoDetect;exports.s = resolveManifestDeclaredWebProviderCandidatePluginIds;exports.t = resolveBundledWebSearchResolutionConfig;var _manifestRegistryBd3A4lqx = require("./manifest-registry-Bd3A4lqx.js");
var _channelConfiguredBTEJAT4e = require("./channel-configured-BTEJAT4e.js");
var _activationContextElA3ysm = require("./activation-context-elA3ysm4.js");
//#region src/plugins/web-provider-resolution-shared.ts
function comparePluginProvidersAlphabetically(left, right) {
  return left.id.localeCompare(right.id) || left.pluginId.localeCompare(right.pluginId);
}
function sortPluginProviders(providers) {
  return providers.toSorted(comparePluginProvidersAlphabetically);
}
function sortPluginProvidersForAutoDetect(providers) {
  return providers.toSorted((left, right) => {
    const leftOrder = left.autoDetectOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.autoDetectOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return comparePluginProvidersAlphabetically(left, right);
  });
}
function pluginManifestDeclaresProviderConfig(record, configKey, contract) {
  if ((record.contracts?.[contract]?.length ?? 0) > 0) return true;
  if (Object.keys(record.configUiHints ?? {}).some((key) => key === configKey || key.startsWith(`${configKey}.`))) return true;
  const properties = record.configSchema?.properties;
  return typeof properties === "object" && properties !== null && configKey in properties;
}
function resolveManifestDeclaredWebProviderCandidatePluginIds(params) {
  const scopedPluginIds = (0, _channelConfiguredBTEJAT4e.a)(params.onlyPluginIds);
  const onlyPluginIdSet = (0, _channelConfiguredBTEJAT4e.n)(scopedPluginIds);
  const ids = (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  }).plugins.filter((plugin) => (!params.origin || plugin.origin === params.origin) && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)) && pluginManifestDeclaresProviderConfig(plugin, params.configKey, params.contract)).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
  if (ids.length > 0) return ids;
  return scopedPluginIds?.length === 0 ? [] : void 0;
}
function resolveBundledWebProviderCompatPluginIds(params) {
  return (0, _manifestRegistryBd3A4lqx.r)({
    contract: params.contract,
    origin: "bundled",
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  });
}
function resolveBundledWebProviderResolutionConfig(params) {
  const activation = (0, _activationContextElA3ysm.n)({
    rawConfig: params.config,
    env: params.env,
    workspaceDir: params.workspaceDir,
    applyAutoEnable: true,
    compatMode: {
      allowlist: params.bundledAllowlistCompat,
      enablement: "always",
      vitest: true
    },
    resolveCompatPluginIds: (compatParams) => resolveBundledWebProviderCompatPluginIds({
      contract: params.contract,
      ...compatParams
    })
  });
  return {
    config: activation.config,
    activationSourceConfig: activation.activationSourceConfig,
    autoEnabledReasons: activation.autoEnabledReasons
  };
}
function buildWebProviderSnapshotCacheKey(params) {
  const envKey = typeof params.envKey === "string" ? params.envKey : Object.entries(params.envKey).toSorted(([left], [right]) => left.localeCompare(right));
  const onlyPluginIds = (0, _channelConfiguredBTEJAT4e.a)(params.onlyPluginIds);
  return JSON.stringify({
    workspaceDir: params.workspaceDir ?? "",
    bundledAllowlistCompat: params.bundledAllowlistCompat === true,
    origin: params.origin ?? "",
    onlyPluginIds: (0, _channelConfiguredBTEJAT4e.o)(onlyPluginIds),
    env: envKey
  });
}
function mapRegistryProviders(params) {
  const onlyPluginIdSet = (0, _channelConfiguredBTEJAT4e.n)((0, _channelConfiguredBTEJAT4e.a)(params.onlyPluginIds));
  return params.sortProviders(params.entries.filter((entry) => !onlyPluginIdSet || onlyPluginIdSet.has(entry.pluginId)).map((entry) => ({
    ...entry.provider,
    pluginId: entry.pluginId
  })));
}
//#endregion
//#region src/plugins/web-search-providers.shared.ts
function sortWebSearchProviders(providers) {
  return sortPluginProviders(providers);
}
function sortWebSearchProvidersForAutoDetect(providers) {
  return sortPluginProvidersForAutoDetect(providers);
}
function resolveBundledWebSearchResolutionConfig(params) {
  return resolveBundledWebProviderResolutionConfig({
    contract: "webSearchProviders",
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env,
    bundledAllowlistCompat: params.bundledAllowlistCompat
  });
}
//#endregion /* v9-150f0fc82c9126a9 */
