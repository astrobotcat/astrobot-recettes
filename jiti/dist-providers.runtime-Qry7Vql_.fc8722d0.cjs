"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolvePluginProviders;exports.t = isPluginProvidersLoadInFlight;var _channelConfiguredBTEJAT4e = require("./channel-configured-BTEJAT4e.js");
var _pluginAutoEnableBbVfCcz = require("./plugin-auto-enable-BbVfCcz-.js");
var _activationContextElA3ysm = require("./activation-context-elA3ysm4.js");
var _activationPlannerCty9b1m = require("./activation-planner-Cty9b1m-.js");
var _loaderDYW2PvbF = require("./loader-DYW2PvbF.js");
var _runtimeBB1a2aCy = require("./runtime-BB1a2aCy.js");
var _loadContextHY3FwKJn = require("./load-context-HY3FwKJn.js");
//#region src/plugins/providers.runtime.ts
function dedupeSortedPluginIds(values) {
  return [...new Set(values)].toSorted((left, right) => left.localeCompare(right));
}
function resolveExplicitProviderOwnerPluginIds(params) {
  return dedupeSortedPluginIds(params.providerRefs.flatMap((provider) => {
    const plannedPluginIds = (0, _activationPlannerCty9b1m.t)({
      trigger: {
        kind: "provider",
        provider
      },
      config: params.config,
      workspaceDir: params.workspaceDir,
      env: params.env
    });
    if (plannedPluginIds.length > 0) return plannedPluginIds;
    return (0, _pluginAutoEnableBbVfCcz.u)({
      provider,
      config: params.config,
      workspaceDir: params.workspaceDir,
      env: params.env
    }) ?? [];
  }));
}
function mergeExplicitOwnerPluginIds(providerPluginIds, explicitOwnerPluginIds) {
  if (explicitOwnerPluginIds.length === 0) return [...providerPluginIds];
  return dedupeSortedPluginIds([...providerPluginIds, ...explicitOwnerPluginIds]);
}
function resolvePluginProviderLoadBase(params) {
  const env = params.env ?? process.env;
  const workspaceDir = params.workspaceDir ?? (0, _runtimeBB1a2aCy.o)();
  const providerOwnedPluginIds = params.providerRefs?.length ? resolveExplicitProviderOwnerPluginIds({
    providerRefs: params.providerRefs,
    config: params.config,
    workspaceDir,
    env
  }) : [];
  const modelOwnedPluginIds = params.modelRefs?.length ? (0, _pluginAutoEnableBbVfCcz.l)({
    models: params.modelRefs,
    config: params.config,
    workspaceDir,
    env
  }) : [];
  return {
    env,
    workspaceDir,
    requestedPluginIds: (0, _channelConfiguredBTEJAT4e.r)(params.onlyPluginIds) || params.providerRefs?.length || params.modelRefs?.length || providerOwnedPluginIds.length > 0 || modelOwnedPluginIds.length > 0 ? [...new Set([
    ...(params.onlyPluginIds ?? []),
    ...providerOwnedPluginIds,
    ...modelOwnedPluginIds]
    )].toSorted((left, right) => left.localeCompare(right)) : void 0,
    explicitOwnerPluginIds: dedupeSortedPluginIds([...providerOwnedPluginIds, ...modelOwnedPluginIds]),
    rawConfig: params.config
  };
}
function resolveSetupProviderPluginLoadState(params, base) {
  const setupPluginIds = mergeExplicitOwnerPluginIds((0, _pluginAutoEnableBbVfCcz.s)({
    config: params.config,
    workspaceDir: base.workspaceDir,
    env: base.env,
    onlyPluginIds: base.requestedPluginIds,
    includeUntrustedWorkspacePlugins: params.includeUntrustedWorkspacePlugins
  }), (0, _pluginAutoEnableBbVfCcz.o)({
    pluginIds: base.explicitOwnerPluginIds,
    config: params.config,
    workspaceDir: base.workspaceDir,
    env: base.env,
    includeUntrustedWorkspacePlugins: params.includeUntrustedWorkspacePlugins
  }));
  if (setupPluginIds.length === 0) return;
  const setupConfig = (0, _activationContextElA3ysm.r)({
    config: base.rawConfig,
    pluginIds: setupPluginIds
  });
  return { loadOptions: (0, _loadContextHY3FwKJn.n)({
      config: setupConfig,
      activationSourceConfig: setupConfig,
      autoEnabledReasons: {},
      workspaceDir: base.workspaceDir,
      env: base.env,
      logger: (0, _loadContextHY3FwKJn.r)()
    }, {
      onlyPluginIds: setupPluginIds,
      pluginSdkResolution: params.pluginSdkResolution,
      cache: params.cache ?? false,
      activate: params.activate ?? false
    }) };
}
function resolveRuntimeProviderPluginLoadState(params, base) {
  const explicitOwnerPluginIds = (0, _pluginAutoEnableBbVfCcz.r)({
    pluginIds: base.explicitOwnerPluginIds,
    config: base.rawConfig,
    workspaceDir: base.workspaceDir,
    env: base.env,
    includeUntrustedWorkspacePlugins: params.includeUntrustedWorkspacePlugins
  });
  const runtimeRequestedPluginIds = base.requestedPluginIds !== void 0 ? dedupeSortedPluginIds([...(params.onlyPluginIds ?? []), ...explicitOwnerPluginIds]) : void 0;
  const activation = (0, _activationContextElA3ysm.t)({
    rawConfig: (0, _activationContextElA3ysm.r)({
      config: base.rawConfig,
      pluginIds: explicitOwnerPluginIds
    }),
    env: base.env,
    workspaceDir: base.workspaceDir,
    onlyPluginIds: runtimeRequestedPluginIds,
    applyAutoEnable: true,
    compatMode: {
      allowlist: params.bundledProviderAllowlistCompat,
      enablement: "allowlist",
      vitest: params.bundledProviderVitestCompat
    },
    resolveCompatPluginIds: _pluginAutoEnableBbVfCcz.i
  });
  const config = params.bundledProviderVitestCompat ? (0, _pluginAutoEnableBbVfCcz.d)({
    config: activation.config,
    pluginIds: activation.compatPluginIds,
    env: base.env
  }) : activation.config;
  const providerPluginIds = mergeExplicitOwnerPluginIds((0, _pluginAutoEnableBbVfCcz.c)({
    config,
    workspaceDir: base.workspaceDir,
    env: base.env,
    onlyPluginIds: runtimeRequestedPluginIds
  }), explicitOwnerPluginIds);
  return { loadOptions: (0, _loadContextHY3FwKJn.n)({
      config,
      activationSourceConfig: activation.activationSourceConfig,
      autoEnabledReasons: activation.autoEnabledReasons,
      workspaceDir: base.workspaceDir,
      env: base.env,
      logger: (0, _loadContextHY3FwKJn.r)()
    }, {
      onlyPluginIds: providerPluginIds,
      pluginSdkResolution: params.pluginSdkResolution,
      cache: params.cache ?? false,
      activate: params.activate ?? false
    }) };
}
function isPluginProvidersLoadInFlight(params) {
  const base = resolvePluginProviderLoadBase(params);
  const loadState = params.mode === "setup" ? resolveSetupProviderPluginLoadState(params, base) : resolveRuntimeProviderPluginLoadState(params, base);
  if (!loadState) return false;
  return (0, _loaderDYW2PvbF.t)(loadState.loadOptions);
}
function resolvePluginProviders(params) {
  const base = resolvePluginProviderLoadBase(params);
  if (params.mode === "setup") {
    const loadState = resolveSetupProviderPluginLoadState(params, base);
    if (!loadState) return [];
    return (0, _loaderDYW2PvbF.r)(loadState.loadOptions).providers.map((entry) => ({
      ...entry.provider,
      pluginId: entry.pluginId
    }));
  }
  const registry = (0, _loaderDYW2PvbF.a)(resolveRuntimeProviderPluginLoadState(params, base).loadOptions);
  if (!registry) return [];
  return registry.providers.map((entry) => ({
    ...entry.provider,
    pluginId: entry.pluginId
  }));
}
//#endregion /* v9-170ecc6326fd36f7 */
