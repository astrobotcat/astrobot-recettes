"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveCatalogHookProviderPluginIds;exports.c = resolveEnabledProviderPluginIds;exports.d = withBundledProviderVitestCompat;exports.f = hasExplicitManifestOwnerTrust;exports.g = collectConfiguredAgentHarnessRuntimes;exports.h = passesManifestOwnerBasePolicy;exports.i = resolveBundledProviderCompatPluginIds;exports.l = resolveOwningPluginIdsForModelRefs;exports.m = isBundledManifestOwner;exports.n = configMayNeedPluginAutoEnable;exports.o = resolveDiscoverableProviderOwnerPluginIds;exports.p = isActivatedManifestOwner;exports.r = resolveActivatableProviderOwnerPluginIds;exports.s = resolveDiscoveredProviderPluginIds;exports.t = applyPluginAutoEnable;exports.u = resolveOwningPluginIdsForProvider;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _idsCYPyP4SY = require("./ids-CYPyP4SY.js");
var _stringNormalizationXm3f27dv = require("./string-normalization-xm3f27dv.js");
var _manifestRegistryBd3A4lqx = require("./manifest-registry-Bd3A4lqx.js");
var _prototypeKeysCnLLLhBE = require("./prototype-keys-CnLLLhBE.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _registryCENZffQG = require("./registry-CENZffQG.js");
var _bundledCompatClStMMlW = require("./bundled-compat-ClStMMlW.js");
var _configStateCcN3bZ9D = require("./config-state-CcN3bZ9D.js");
var _channelConfiguredBTEJAT4e = require("./channel-configured-BTEJAT4e.js");
var _configPresenceB8rnssE = require("./config-presence-B8rnssE9.js");
var _setupRegistryYtDuF5P = require("./setup-registry-ytDuF5P6.js");
var _pluginsAllowlistC7mr08Ml = require("./plugins-allowlist-C7mr08Ml.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/harness-runtimes.ts
function collectConfiguredAgentHarnessRuntimes(config, env) {
  const runtimes = /* @__PURE__ */new Set();
  const pushRuntime = (value) => {
    if (typeof value !== "string") return;
    const normalized = (0, _stringCoerceBUSzWgUA.o)(value);
    if (!normalized || normalized === "auto" || normalized === "pi") return;
    runtimes.add(normalized);
  };
  pushRuntime(config.agents?.defaults?.embeddedHarness?.runtime);
  if (Array.isArray(config.agents?.list)) for (const agent of config.agents.list) {
    if (!(0, _utilsD5DtWkEu.l)(agent)) continue;
    pushRuntime(agent.embeddedHarness?.runtime);
  }
  pushRuntime(env.OPENCLAW_AGENT_RUNTIME);
  return [...runtimes].toSorted((left, right) => left.localeCompare(right));
}
//#endregion
//#region src/plugins/manifest-owner-policy.ts
function isBundledManifestOwner(plugin) {
  return plugin.origin === "bundled";
}
function hasExplicitManifestOwnerTrust(params) {
  return params.normalizedConfig.allow.includes(params.plugin.id) || params.normalizedConfig.entries[params.plugin.id]?.enabled === true;
}
function passesManifestOwnerBasePolicy(params) {
  if (!params.normalizedConfig.enabled) return false;
  if (params.normalizedConfig.deny.includes(params.plugin.id)) return false;
  if (params.normalizedConfig.entries[params.plugin.id]?.enabled === false && params.allowExplicitlyDisabled !== true) return false;
  if (params.normalizedConfig.allow.length > 0 && !params.normalizedConfig.allow.includes(params.plugin.id)) return false;
  return true;
}
function isActivatedManifestOwner(params) {
  return (0, _configStateCcN3bZ9D.s)({
    id: params.plugin.id,
    origin: params.plugin.origin,
    config: params.normalizedConfig,
    rootConfig: params.rootConfig,
    enabledByDefault: params.plugin.enabledByDefault
  }).activated;
}
//#endregion
//#region src/plugins/providers.ts
function withBundledProviderVitestCompat(params) {
  return (0, _bundledCompatClStMMlW.r)(params);
}
function resolveBundledProviderCompatPluginIds(params) {
  const onlyPluginIdSet = (0, _channelConfiguredBTEJAT4e.n)(params.onlyPluginIds);
  return (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  }).plugins.filter((plugin) => plugin.origin === "bundled" && plugin.providers.length > 0 && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id))).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function resolveEnabledProviderPluginIds(params) {
  const onlyPluginIdSet = (0, _channelConfiguredBTEJAT4e.n)(params.onlyPluginIds);
  const registry = (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  });
  const normalizedConfig = (0, _configStateCcN3bZ9D.a)(params.config?.plugins);
  return registry.plugins.filter((plugin) => plugin.providers.length > 0 && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)) && (0, _configStateCcN3bZ9D.s)({
    id: plugin.id,
    origin: plugin.origin,
    config: normalizedConfig,
    rootConfig: params.config,
    enabledByDefault: plugin.enabledByDefault
  }).activated).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function resolveDiscoveredProviderPluginIds(params) {
  const onlyPluginIdSet = (0, _channelConfiguredBTEJAT4e.n)(params.onlyPluginIds);
  const registry = (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  });
  const shouldFilterUntrustedWorkspacePlugins = params.includeUntrustedWorkspacePlugins === false;
  const normalizedConfig = (0, _configStateCcN3bZ9D.a)(params.config?.plugins);
  return registry.plugins.filter((plugin) => {
    if (!(plugin.providers.length > 0 && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)))) return false;
    return isProviderPluginEligibleForSetupDiscovery({
      plugin,
      shouldFilterUntrustedWorkspacePlugins,
      normalizedConfig,
      rootConfig: params.config
    });
  }).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function isProviderPluginEligibleForSetupDiscovery(params) {
  if (!params.shouldFilterUntrustedWorkspacePlugins || params.plugin.origin !== "workspace") return true;
  if (!passesManifestOwnerBasePolicy({
    plugin: params.plugin,
    normalizedConfig: params.normalizedConfig
  })) return false;
  return isActivatedManifestOwner({
    plugin: params.plugin,
    normalizedConfig: params.normalizedConfig,
    rootConfig: params.rootConfig
  });
}
function resolveDiscoverableProviderOwnerPluginIds(params) {
  if (params.pluginIds.length === 0) return [];
  const pluginIdSet = new Set(params.pluginIds);
  const registry = (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  });
  const shouldFilterUntrustedWorkspacePlugins = params.includeUntrustedWorkspacePlugins === false;
  const normalizedConfig = (0, _configStateCcN3bZ9D.a)(params.config?.plugins);
  return registry.plugins.filter((plugin) => pluginIdSet.has(plugin.id) && isProviderPluginEligibleForSetupDiscovery({
    plugin,
    shouldFilterUntrustedWorkspacePlugins,
    normalizedConfig,
    rootConfig: params.config
  })).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function isProviderPluginEligibleForRuntimeOwnerActivation(params) {
  if (!passesManifestOwnerBasePolicy({
    plugin: params.plugin,
    normalizedConfig: params.normalizedConfig
  })) return false;
  if (params.plugin.origin !== "workspace") return true;
  return isActivatedManifestOwner({
    plugin: params.plugin,
    normalizedConfig: params.normalizedConfig,
    rootConfig: params.rootConfig
  });
}
function resolveActivatableProviderOwnerPluginIds(params) {
  if (params.pluginIds.length === 0) return [];
  const pluginIdSet = new Set(params.pluginIds);
  const registry = (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  });
  const normalizedConfig = (0, _configStateCcN3bZ9D.a)(params.config?.plugins);
  return registry.plugins.filter((plugin) => pluginIdSet.has(plugin.id) && isProviderPluginEligibleForRuntimeOwnerActivation({
    plugin,
    normalizedConfig,
    rootConfig: params.config
  })).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function resolveManifestRegistry(params) {
  return params.manifestRegistry ?? (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  });
}
function stripModelProfileSuffix(value) {
  const trimmed = value.trim();
  const at = trimmed.indexOf("@");
  return at <= 0 ? trimmed : trimmed.slice(0, at).trim();
}
function splitExplicitModelRef(rawModel) {
  const trimmed = rawModel.trim();
  if (!trimmed) return null;
  const slash = trimmed.indexOf("/");
  if (slash === -1) {
    const modelId = stripModelProfileSuffix(trimmed);
    return modelId ? { modelId } : null;
  }
  const provider = (0, _providerIdKaStHhRz.r)(trimmed.slice(0, slash));
  const modelId = stripModelProfileSuffix(trimmed.slice(slash + 1));
  if (!provider || !modelId) return null;
  return {
    provider,
    modelId
  };
}
function resolveModelSupportMatchKind(plugin, modelId) {
  const patterns = plugin.modelSupport?.modelPatterns ?? [];
  for (const patternSource of patterns) try {
    if (new RegExp(patternSource, "u").test(modelId)) return "pattern";
  } catch {
    continue;
  }
  const prefixes = plugin.modelSupport?.modelPrefixes ?? [];
  for (const prefix of prefixes) if (modelId.startsWith(prefix)) return "prefix";
}
function dedupeSortedPluginIds(values) {
  return [...new Set(values)].toSorted((left, right) => left.localeCompare(right));
}
function resolvePreferredManifestPluginIds(registry, matchedPluginIds) {
  if (matchedPluginIds.length === 0) return;
  const uniquePluginIds = dedupeSortedPluginIds(matchedPluginIds);
  if (uniquePluginIds.length <= 1) return uniquePluginIds;
  const nonBundledPluginIds = uniquePluginIds.filter((pluginId) => {
    return registry.plugins.find((entry) => entry.id === pluginId)?.origin !== "bundled";
  });
  if (nonBundledPluginIds.length === 1) return nonBundledPluginIds;
  if (nonBundledPluginIds.length > 1) return;
}
function resolveOwningPluginIdsForProvider(params) {
  const normalizedProvider = (0, _providerIdKaStHhRz.r)(params.provider);
  if (!normalizedProvider) return;
  const pluginIds = resolveManifestRegistry(params).plugins.filter((plugin) => plugin.providers.some((providerId) => (0, _providerIdKaStHhRz.r)(providerId) === normalizedProvider) || plugin.cliBackends.some((backendId) => (0, _providerIdKaStHhRz.r)(backendId) === normalizedProvider)).map((plugin) => plugin.id);
  return pluginIds.length > 0 ? pluginIds : void 0;
}
function resolveOwningPluginIdsForModelRef(params) {
  const parsed = splitExplicitModelRef(params.model);
  if (!parsed) return;
  if (parsed.provider) return resolveOwningPluginIdsForProvider({
    provider: parsed.provider,
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env,
    manifestRegistry: params.manifestRegistry
  });
  const registry = resolveManifestRegistry(params);
  const preferredPatternPluginIds = resolvePreferredManifestPluginIds(registry, registry.plugins.filter((plugin) => resolveModelSupportMatchKind(plugin, parsed.modelId) === "pattern").map((plugin) => plugin.id));
  if (preferredPatternPluginIds) return preferredPatternPluginIds;
  return resolvePreferredManifestPluginIds(registry, registry.plugins.filter((plugin) => resolveModelSupportMatchKind(plugin, parsed.modelId) === "prefix").map((plugin) => plugin.id));
}
function resolveOwningPluginIdsForModelRefs(params) {
  const registry = resolveManifestRegistry(params);
  return dedupeSortedPluginIds(params.models.flatMap((model) => resolveOwningPluginIdsForModelRef({
    model,
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env,
    manifestRegistry: registry
  }) ?? []));
}
function resolveCatalogHookProviderPluginIds(params) {
  const registry = (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  });
  const normalizedConfig = (0, _configStateCcN3bZ9D.a)(params.config?.plugins);
  const enabledProviderPluginIds = registry.plugins.filter((plugin) => plugin.providers.length > 0 && (0, _configStateCcN3bZ9D.s)({
    id: plugin.id,
    origin: plugin.origin,
    config: normalizedConfig,
    rootConfig: params.config,
    enabledByDefault: plugin.enabledByDefault
  }).activated).map((plugin) => plugin.id);
  const bundledCompatPluginIds = resolveBundledProviderCompatPluginIds(params);
  return [...new Set([...enabledProviderPluginIds, ...bundledCompatPluginIds])].toSorted((left, right) => left.localeCompare(right));
}
//#endregion
//#region src/config/plugin-auto-enable.prefer-over.ts
const ENV_CATALOG_PATHS = ["OPENCLAW_PLUGIN_CATALOG_PATHS", "OPENCLAW_MPM_CATALOG_PATHS"];
function splitEnvPaths(value) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(value) ?? "";
  if (!trimmed) return [];
  return (0, _stringNormalizationXm3f27dv.s)(trimmed.split(/[;,]/g).flatMap((chunk) => chunk.split(_nodePath.default.delimiter)));
}
function resolveExternalCatalogPaths(env) {
  for (const key of ENV_CATALOG_PATHS) {
    const raw = (0, _stringCoerceBUSzWgUA.s)(env[key]);
    if (raw) return splitEnvPaths(raw);
  }
  const configDir = (0, _utilsD5DtWkEu.f)(env);
  return [
  _nodePath.default.join(configDir, "mpm", "plugins.json"),
  _nodePath.default.join(configDir, "mpm", "catalog.json"),
  _nodePath.default.join(configDir, "plugins", "catalog.json")];

}
function parseExternalCatalogChannelEntries(raw) {
  const list = (() => {
    if (Array.isArray(raw)) return raw;
    if (!(0, _utilsD5DtWkEu.l)(raw)) return [];
    const entries = raw.entries ?? raw.packages ?? raw.plugins;
    return Array.isArray(entries) ? entries : [];
  })();
  const channels = [];
  for (const entry of list) {
    if (!(0, _utilsD5DtWkEu.l)(entry) || !(0, _utilsD5DtWkEu.l)(entry.openclaw) || !(0, _utilsD5DtWkEu.l)(entry.openclaw.channel)) continue;
    const channel = entry.openclaw.channel;
    const id = (0, _stringCoerceBUSzWgUA.s)(channel.id) ?? "";
    if (!id) continue;
    const preferOver = Array.isArray(channel.preferOver) ? channel.preferOver.filter((value) => typeof value === "string") : [];
    channels.push({
      id,
      preferOver
    });
  }
  return channels;
}
function resolveExternalCatalogPreferOver(channelId, env) {
  for (const rawPath of resolveExternalCatalogPaths(env)) {
    const resolved = (0, _utilsD5DtWkEu.m)(rawPath, env);
    if (!_nodeFs.default.existsSync(resolved)) continue;
    try {
      const channel = parseExternalCatalogChannelEntries(JSON.parse(_nodeFs.default.readFileSync(resolved, "utf-8"))).find((entry) => entry.id === channelId);
      if (channel) return channel.preferOver;
    } catch {}
  }
  return [];
}
function resolveBuiltInChannelPreferOver(channelId) {
  const builtInChannelId = (0, _idsCYPyP4SY.r)(channelId);
  if (!builtInChannelId) return [];
  return (0, _registryCENZffQG.s)(builtInChannelId).preferOver ?? [];
}
function resolvePreferredOverIds(candidate, env, registry) {
  const channelId = candidate.kind === "channel-configured" ? candidate.channelId : candidate.pluginId;
  const installedPlugin = registry.plugins.find((record) => record.id === candidate.pluginId);
  const manifestChannelPreferOver = installedPlugin?.channelConfigs?.[channelId]?.preferOver;
  if (manifestChannelPreferOver?.length) return [...manifestChannelPreferOver];
  const installedChannelMeta = installedPlugin?.channelCatalogMeta;
  if (installedChannelMeta?.preferOver?.length) return [...installedChannelMeta.preferOver];
  const builtInChannelPreferOver = resolveBuiltInChannelPreferOver(channelId);
  if (builtInChannelPreferOver.length) return [...builtInChannelPreferOver];
  return resolveExternalCatalogPreferOver(channelId, env);
}
function getPluginAutoEnableCandidateCacheKey(candidate) {
  return `${candidate.pluginId}:${candidate.kind === "channel-configured" ? candidate.channelId : candidate.pluginId}`;
}
function shouldSkipPreferredPluginAutoEnable(params) {
  const getPreferredOverIds = (candidate) => {
    const cacheKey = getPluginAutoEnableCandidateCacheKey(candidate);
    const cached = params.preferOverCache.get(cacheKey);
    if (cached) return cached;
    const resolved = resolvePreferredOverIds(candidate, params.env, params.registry);
    params.preferOverCache.set(cacheKey, resolved);
    return resolved;
  };
  for (const other of params.configured) {
    if (other.pluginId === params.entry.pluginId) continue;
    if (params.isPluginDenied(params.config, other.pluginId) || params.isPluginExplicitlyDisabled(params.config, other.pluginId)) continue;
    if (getPreferredOverIds(other).includes(params.entry.pluginId)) return true;
  }
  return false;
}
//#endregion
//#region src/config/plugin-auto-enable.shared.ts
const EMPTY_PLUGIN_MANIFEST_REGISTRY = {
  plugins: [],
  diagnostics: []
};
function resolveAutoEnableProviderPluginIds(registry) {
  const entries = /* @__PURE__ */new Map();
  for (const plugin of registry.plugins) for (const providerId of plugin.autoEnableWhenConfiguredProviders ?? []) if (!entries.has(providerId)) entries.set(providerId, plugin.id);
  return Object.fromEntries(entries);
}
function collectModelRefs(cfg) {
  const refs = [];
  const pushModelRef = (value) => {
    if (typeof value === "string" && value.trim()) refs.push(value.trim());
  };
  const collectFromAgent = (agent) => {
    if (!agent) return;
    const model = agent.model;
    if (typeof model === "string") pushModelRef(model);else
    if ((0, _utilsD5DtWkEu.l)(model)) {
      pushModelRef(model.primary);
      const fallbacks = model.fallbacks;
      if (Array.isArray(fallbacks)) for (const entry of fallbacks) pushModelRef(entry);
    }
    const models = agent.models;
    if ((0, _utilsD5DtWkEu.l)(models)) for (const key of Object.keys(models)) pushModelRef(key);
  };
  collectFromAgent(cfg.agents?.defaults);
  const list = cfg.agents?.list;
  if (Array.isArray(list)) {
    for (const entry of list) if ((0, _utilsD5DtWkEu.l)(entry)) collectFromAgent(entry);
  }
  return refs;
}
function extractProviderFromModelRef(value) {
  const trimmed = value.trim();
  const slash = trimmed.indexOf("/");
  if (slash <= 0) return null;
  return (0, _providerIdKaStHhRz.r)(trimmed.slice(0, slash));
}
function hasConfiguredEmbeddedHarnessRuntime(cfg, env) {
  return collectConfiguredAgentHarnessRuntimes(cfg, env).length > 0;
}
function resolveAgentHarnessOwnerPluginIds(registry, runtime) {
  const normalizedRuntime = (0, _stringCoerceBUSzWgUA.o)(runtime);
  if (!normalizedRuntime) return [];
  return registry.plugins.filter((plugin) => (plugin.activation?.onAgentHarnesses ?? []).some((entry) => (0, _stringCoerceBUSzWgUA.o)(entry) === normalizedRuntime)).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function isProviderConfigured(cfg, providerId) {
  const normalized = (0, _providerIdKaStHhRz.r)(providerId);
  const profiles = cfg.auth?.profiles;
  if (profiles && typeof profiles === "object") for (const profile of Object.values(profiles)) {
    if (!(0, _utilsD5DtWkEu.l)(profile)) continue;
    if ((0, _providerIdKaStHhRz.r)(profile.provider ?? "") === normalized) return true;
  }
  const providerConfig = cfg.models?.providers;
  if (providerConfig && typeof providerConfig === "object") {
    for (const key of Object.keys(providerConfig)) if ((0, _providerIdKaStHhRz.r)(key) === normalized) return true;
  }
  for (const ref of collectModelRefs(cfg)) {
    const provider = extractProviderFromModelRef(ref);
    if (provider && provider === normalized) return true;
  }
  return false;
}
function hasPluginOwnedWebSearchConfig(cfg, pluginId) {
  const pluginConfig = cfg.plugins?.entries?.[pluginId]?.config;
  return (0, _utilsD5DtWkEu.l)(pluginConfig) && (0, _utilsD5DtWkEu.l)(pluginConfig.webSearch);
}
function hasPluginOwnedWebFetchConfig(cfg, pluginId) {
  const pluginConfig = cfg.plugins?.entries?.[pluginId]?.config;
  return (0, _utilsD5DtWkEu.l)(pluginConfig) && (0, _utilsD5DtWkEu.l)(pluginConfig.webFetch);
}
function resolvePluginOwnedToolConfigKeys(plugin) {
  if ((plugin.contracts?.tools?.length ?? 0) === 0) return [];
  const properties = (0, _utilsD5DtWkEu.l)(plugin.configSchema) ? plugin.configSchema.properties : void 0;
  if (!(0, _utilsD5DtWkEu.l)(properties)) return [];
  return Object.keys(properties).filter((key) => key !== "webSearch" && key !== "webFetch");
}
function hasPluginOwnedToolConfig(cfg, plugin) {
  const pluginConfig = cfg.plugins?.entries?.[plugin.id]?.config;
  if (!(0, _utilsD5DtWkEu.l)(pluginConfig)) return false;
  return resolvePluginOwnedToolConfigKeys(plugin).some((key) => pluginConfig[key] !== void 0);
}
function resolveProviderPluginsWithOwnedWebSearch(registry) {
  return registry.plugins.filter((plugin) => (plugin.providers?.length ?? 0) > 0).filter((plugin) => (plugin.contracts?.webSearchProviders?.length ?? 0) > 0);
}
function resolveProviderPluginsWithOwnedWebFetch(registry) {
  return registry.plugins.filter((plugin) => (plugin.contracts?.webFetchProviders?.length ?? 0) > 0);
}
function resolvePluginsWithOwnedToolConfig(registry) {
  return registry.plugins.filter((plugin) => (plugin.contracts?.tools?.length ?? 0) > 0);
}
function resolvePluginIdForConfiguredWebFetchProvider(providerId, env) {
  return (0, _manifestRegistryBd3A4lqx.n)({
    contract: "webFetchProviders",
    value: (0, _stringCoerceBUSzWgUA.o)(providerId) ?? "",
    origin: "bundled",
    env
  });
}
function buildChannelToPluginIdMap(registry) {
  const map = /* @__PURE__ */new Map();
  for (const record of registry.plugins) for (const channelId of record.channels ?? []) if (channelId && !map.has(channelId)) map.set(channelId, record.id);
  return map;
}
function resolvePluginIdForChannel(channelId, channelToPluginId) {
  const builtInId = (0, _idsCYPyP4SY.r)(channelId);
  if (builtInId) return builtInId;
  return channelToPluginId.get(channelId) ?? channelId;
}
function collectCandidateChannelIds(cfg, env) {
  return (0, _configPresenceB8rnssE.n)(cfg, env).map((channelId) => (0, _idsCYPyP4SY.r)(channelId) ?? channelId);
}
function hasConfiguredWebSearchPluginEntry(cfg) {
  const entries = cfg.plugins?.entries;
  return !!entries && typeof entries === "object" && Object.values(entries).some((entry) => (0, _utilsD5DtWkEu.l)(entry) && (0, _utilsD5DtWkEu.l)(entry.config) && (0, _utilsD5DtWkEu.l)(entry.config.webSearch));
}
function hasConfiguredWebFetchPluginEntry(cfg) {
  const entries = cfg.plugins?.entries;
  return !!entries && typeof entries === "object" && Object.values(entries).some((entry) => (0, _utilsD5DtWkEu.l)(entry) && (0, _utilsD5DtWkEu.l)(entry.config) && (0, _utilsD5DtWkEu.l)(entry.config.webFetch));
}
function hasConfiguredPluginConfigEntry(cfg) {
  const entries = cfg.plugins?.entries;
  return !!entries && typeof entries === "object" && Object.values(entries).some((entry) => (0, _utilsD5DtWkEu.l)(entry) && (0, _utilsD5DtWkEu.l)(entry.config));
}
function listContainsNormalized(value, expected) {
  return Array.isArray(value) && value.some((entry) => (0, _stringCoerceBUSzWgUA.o)(entry) === expected);
}
function toolPolicyReferencesBrowser(value) {
  return (0, _utilsD5DtWkEu.l)(value) && (listContainsNormalized(value.allow, "browser") || listContainsNormalized(value.alsoAllow, "browser"));
}
function hasBrowserToolReference(cfg) {
  if (toolPolicyReferencesBrowser(cfg.tools)) return true;
  const agentList = cfg.agents?.list;
  return Array.isArray(agentList) ? agentList.some((entry) => (0, _utilsD5DtWkEu.l)(entry) && toolPolicyReferencesBrowser(entry.tools)) : false;
}
function hasSetupAutoEnableRelevantConfig(cfg) {
  const entries = cfg.plugins?.entries;
  if ((0, _utilsD5DtWkEu.l)(cfg.browser) || (0, _utilsD5DtWkEu.l)(cfg.acp) || hasBrowserToolReference(cfg)) return true;
  if ((0, _utilsD5DtWkEu.l)(entries?.browser) || (0, _utilsD5DtWkEu.l)(entries?.acpx) || (0, _utilsD5DtWkEu.l)(entries?.xai)) return true;
  if ((0, _utilsD5DtWkEu.l)(cfg.tools?.web) && (0, _utilsD5DtWkEu.l)(cfg.tools.web.x_search)) return true;
  return hasConfiguredPluginConfigEntry(cfg);
}
function hasPluginEntries(cfg) {
  const entries = cfg.plugins?.entries;
  return !!entries && typeof entries === "object" && Object.keys(entries).length > 0;
}
function configMayNeedPluginManifestRegistry(cfg, env) {
  const pluginEntries = cfg.plugins?.entries;
  if (Array.isArray(cfg.plugins?.allow) && cfg.plugins.allow.length > 0 && hasPluginEntries(cfg)) return true;
  if (pluginEntries && Object.values(pluginEntries).some((entry) => (0, _utilsD5DtWkEu.l)(entry) && (0, _utilsD5DtWkEu.l)(entry.config))) return true;
  if (cfg.auth?.profiles && Object.keys(cfg.auth.profiles).length > 0) return true;
  if (cfg.models?.providers && Object.keys(cfg.models.providers).length > 0) return true;
  if (collectModelRefs(cfg).length > 0) return true;
  if (hasConfiguredEmbeddedHarnessRuntime(cfg, env)) return true;
  const configuredChannels = cfg.channels;
  if (!configuredChannels || typeof configuredChannels !== "object") return false;
  for (const key of Object.keys(configuredChannels)) {
    if (key === "defaults" || key === "modelByChannel") continue;
    if (!(0, _idsCYPyP4SY.r)(key)) return true;
  }
  return false;
}
function configMayNeedPluginAutoEnable(cfg, env) {
  if (Array.isArray(cfg.plugins?.allow) && cfg.plugins.allow.length > 0 && hasPluginEntries(cfg)) return true;
  if (hasConfiguredPluginConfigEntry(cfg)) return true;
  if ((0, _configPresenceB8rnssE.t)(cfg, env)) return true;
  if (cfg.auth?.profiles && Object.keys(cfg.auth.profiles).length > 0) return true;
  if (cfg.models?.providers && Object.keys(cfg.models.providers).length > 0) return true;
  if (collectModelRefs(cfg).length > 0) return true;
  if (hasConfiguredEmbeddedHarnessRuntime(cfg, env)) return true;
  if (hasConfiguredWebSearchPluginEntry(cfg) || hasConfiguredWebFetchPluginEntry(cfg)) return true;
  if (!hasSetupAutoEnableRelevantConfig(cfg)) return false;
  return (0, _setupRegistryYtDuF5P.t)({
    config: cfg,
    env
  }).length > 0;
}
function resolvePluginAutoEnableCandidateReason(candidate) {
  switch (candidate.kind) {
    case "channel-configured":return `${candidate.channelId} configured`;
    case "provider-auth-configured":return `${candidate.providerId} auth configured`;
    case "provider-model-configured":return `${candidate.modelRef} model configured`;
    case "agent-harness-runtime-configured":return `${candidate.runtime} agent harness runtime configured`;
    case "web-fetch-provider-selected":return `${candidate.providerId} web fetch provider selected`;
    case "plugin-web-search-configured":return `${candidate.pluginId} web search configured`;
    case "plugin-web-fetch-configured":return `${candidate.pluginId} web fetch configured`;
    case "plugin-tool-configured":return `${candidate.pluginId} tool configured`;
    case "setup-auto-enable":return candidate.reason;
  }
  throw new Error("Unsupported plugin auto-enable candidate");
}
function resolveConfiguredPluginAutoEnableCandidates(params) {
  const changes = [];
  const channelToPluginId = buildChannelToPluginIdMap(params.registry);
  for (const channelId of collectCandidateChannelIds(params.config, params.env)) {
    const pluginId = resolvePluginIdForChannel(channelId, channelToPluginId);
    if ((0, _channelConfiguredBTEJAT4e.t)(params.config, channelId, params.env)) changes.push({
      pluginId,
      kind: "channel-configured",
      channelId
    });
  }
  for (const [providerId, pluginId] of Object.entries(resolveAutoEnableProviderPluginIds(params.registry))) if (isProviderConfigured(params.config, providerId)) changes.push({
    pluginId,
    kind: "provider-auth-configured",
    providerId
  });
  for (const modelRef of collectModelRefs(params.config)) {
    const owningPluginIds = resolveOwningPluginIdsForModelRef({
      model: modelRef,
      config: params.config,
      env: params.env,
      manifestRegistry: params.registry
    });
    if (owningPluginIds?.length === 1) changes.push({
      pluginId: owningPluginIds[0],
      kind: "provider-model-configured",
      modelRef
    });
  }
  for (const runtime of collectConfiguredAgentHarnessRuntimes(params.config, params.env)) {
    const pluginIds = resolveAgentHarnessOwnerPluginIds(params.registry, runtime);
    for (const pluginId of pluginIds) changes.push({
      pluginId,
      kind: "agent-harness-runtime-configured",
      runtime
    });
  }
  const webFetchProvider = typeof params.config.tools?.web?.fetch?.provider === "string" ? params.config.tools.web.fetch.provider : void 0;
  const webFetchPluginId = resolvePluginIdForConfiguredWebFetchProvider(webFetchProvider, params.env);
  if (webFetchPluginId) changes.push({
    pluginId: webFetchPluginId,
    kind: "web-fetch-provider-selected",
    providerId: (0, _stringCoerceBUSzWgUA.o)(webFetchProvider) ?? ""
  });
  for (const plugin of resolveProviderPluginsWithOwnedWebSearch(params.registry)) {
    const pluginId = plugin.id;
    if (hasPluginOwnedWebSearchConfig(params.config, pluginId)) changes.push({
      pluginId,
      kind: "plugin-web-search-configured"
    });
  }
  for (const plugin of resolvePluginsWithOwnedToolConfig(params.registry)) {
    const pluginId = plugin.id;
    if (hasPluginOwnedToolConfig(params.config, plugin)) changes.push({
      pluginId,
      kind: "plugin-tool-configured"
    });
  }
  for (const plugin of resolveProviderPluginsWithOwnedWebFetch(params.registry)) {
    const pluginId = plugin.id;
    if (hasPluginOwnedWebFetchConfig(params.config, pluginId)) changes.push({
      pluginId,
      kind: "plugin-web-fetch-configured"
    });
  }
  if (hasSetupAutoEnableRelevantConfig(params.config)) for (const entry of (0, _setupRegistryYtDuF5P.t)({
    config: params.config,
    env: params.env
  })) changes.push({
    pluginId: entry.pluginId,
    kind: "setup-auto-enable",
    reason: entry.reason
  });
  return changes;
}
function isPluginExplicitlyDisabled(cfg, pluginId) {
  const builtInChannelId = (0, _idsCYPyP4SY.r)(pluginId);
  if (builtInChannelId) {
    const channelConfig = cfg.channels?.[builtInChannelId];
    if (channelConfig && typeof channelConfig === "object" && !Array.isArray(channelConfig) && channelConfig.enabled === false) return true;
  }
  return cfg.plugins?.entries?.[pluginId]?.enabled === false;
}
function isPluginDenied(cfg, pluginId) {
  const deny = cfg.plugins?.deny;
  return Array.isArray(deny) && deny.includes(pluginId);
}
function isBuiltInChannelAlreadyEnabled(cfg, channelId) {
  const channelConfig = cfg.channels?.[channelId];
  return !!channelConfig && typeof channelConfig === "object" && !Array.isArray(channelConfig) && channelConfig.enabled === true;
}
function registerPluginEntry(cfg, pluginId) {
  const builtInChannelId = (0, _idsCYPyP4SY.r)(pluginId);
  if (builtInChannelId) {
    const existing = cfg.channels?.[builtInChannelId];
    const existingRecord = existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {};
    return {
      ...cfg,
      channels: {
        ...cfg.channels,
        [builtInChannelId]: {
          ...existingRecord,
          enabled: true
        }
      }
    };
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      entries: {
        ...cfg.plugins?.entries,
        [pluginId]: {
          ...cfg.plugins?.entries?.[pluginId],
          enabled: true
        }
      }
    }
  };
}
function hasMaterialPluginEntryConfig(entry) {
  if (!(0, _utilsD5DtWkEu.l)(entry)) return false;
  return entry.enabled === true || (0, _utilsD5DtWkEu.l)(entry.config) || (0, _utilsD5DtWkEu.l)(entry.hooks) || (0, _utilsD5DtWkEu.l)(entry.subagent) || entry.apiKey !== void 0 || entry.env !== void 0;
}
function isKnownPluginId(pluginId, manifestRegistry) {
  if ((0, _idsCYPyP4SY.r)(pluginId)) return true;
  return manifestRegistry.plugins.some((plugin) => plugin.id === pluginId);
}
function materializeConfiguredPluginEntryAllowlist(params) {
  let next = params.config;
  const allow = next.plugins?.allow;
  const entries = next.plugins?.entries;
  if (!Array.isArray(allow) || allow.length === 0 || !entries || typeof entries !== "object") return next;
  for (const pluginId of Object.keys(entries).toSorted((left, right) => left.localeCompare(right))) {
    const entry = entries[pluginId];
    if (!hasMaterialPluginEntryConfig(entry) || isPluginDenied(next, pluginId) || isPluginExplicitlyDisabled(next, pluginId) || allow.includes(pluginId) || !isKnownPluginId(pluginId, params.manifestRegistry)) continue;
    next = (0, _pluginsAllowlistC7mr08Ml.t)(next, pluginId);
    params.changes.push(`${pluginId} plugin config present, added to plugin allowlist.`);
  }
  return next;
}
function resolveChannelAutoEnableDisplayLabel(entry, manifestRegistry) {
  const builtInChannelId = (0, _idsCYPyP4SY.r)(entry.channelId);
  if (builtInChannelId) return (0, _registryCENZffQG.s)(builtInChannelId).label;
  const plugin = manifestRegistry.plugins.find((record) => record.id === entry.pluginId);
  return plugin?.channelConfigs?.[entry.channelId]?.label ?? plugin?.channelCatalogMeta?.label;
}
function formatAutoEnableChange(entry, manifestRegistry) {
  if (entry.kind === "channel-configured") {
    const label = resolveChannelAutoEnableDisplayLabel(entry, manifestRegistry);
    if (label) return `${label} configured, enabled automatically.`;
  }
  return `${resolvePluginAutoEnableCandidateReason(entry).trim()}, enabled automatically.`;
}
function resolvePluginAutoEnableManifestRegistry(params) {
  return params.manifestRegistry ?? (configMayNeedPluginManifestRegistry(params.config, params.env) ? (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    env: params.env
  }) : EMPTY_PLUGIN_MANIFEST_REGISTRY);
}
function materializePluginAutoEnableCandidatesInternal(params) {
  let next = params.config ?? {};
  const changes = [];
  const autoEnabledReasons = /* @__PURE__ */new Map();
  if (next.plugins?.enabled === false) return {
    config: next,
    changes,
    autoEnabledReasons: {}
  };
  const preferOverCache = /* @__PURE__ */new Map();
  for (const entry of params.candidates) {
    const builtInChannelId = (0, _idsCYPyP4SY.r)(entry.pluginId);
    if (isPluginDenied(next, entry.pluginId) || isPluginExplicitlyDisabled(next, entry.pluginId)) continue;
    if (shouldSkipPreferredPluginAutoEnable({
      config: next,
      entry,
      configured: params.candidates,
      env: params.env,
      registry: params.manifestRegistry,
      isPluginDenied,
      isPluginExplicitlyDisabled,
      preferOverCache
    })) continue;
    const allow = next.plugins?.allow;
    const allowMissing = Array.isArray(allow) && !allow.includes(entry.pluginId);
    if ((builtInChannelId != null ? isBuiltInChannelAlreadyEnabled(next, builtInChannelId) : next.plugins?.entries?.[entry.pluginId]?.enabled === true) && !allowMissing) continue;
    next = registerPluginEntry(next, entry.pluginId);
    next = (0, _pluginsAllowlistC7mr08Ml.t)(next, entry.pluginId);
    const reason = resolvePluginAutoEnableCandidateReason(entry);
    autoEnabledReasons.set(entry.pluginId, [...(autoEnabledReasons.get(entry.pluginId) ?? []), reason]);
    changes.push(formatAutoEnableChange(entry, params.manifestRegistry));
  }
  next = materializeConfiguredPluginEntryAllowlist({
    config: next,
    changes,
    manifestRegistry: params.manifestRegistry
  });
  const autoEnabledReasonRecord = Object.create(null);
  for (const [pluginId, reasons] of autoEnabledReasons) if (!(0, _prototypeKeysCnLLLhBE.t)(pluginId)) autoEnabledReasonRecord[pluginId] = [...reasons];
  return {
    config: next,
    changes,
    autoEnabledReasons: autoEnabledReasonRecord
  };
}
//#endregion
//#region src/config/plugin-auto-enable.detect.ts
function detectPluginAutoEnableCandidates(params) {
  const env = params.env ?? process.env;
  const config = params.config ?? {};
  if (!configMayNeedPluginAutoEnable(config, env)) return [];
  return resolveConfiguredPluginAutoEnableCandidates({
    config,
    env,
    registry: resolvePluginAutoEnableManifestRegistry({
      config,
      env,
      manifestRegistry: params.manifestRegistry
    })
  });
}
//#endregion
//#region src/config/plugin-auto-enable.apply.ts
function materializePluginAutoEnableCandidates(params) {
  const env = params.env ?? process.env;
  const config = params.config ?? {};
  const manifestRegistry = resolvePluginAutoEnableManifestRegistry({
    config,
    env,
    manifestRegistry: params.manifestRegistry
  });
  return materializePluginAutoEnableCandidatesInternal({
    config,
    candidates: params.candidates,
    env,
    manifestRegistry
  });
}
function applyPluginAutoEnable(params) {
  const candidates = detectPluginAutoEnableCandidates(params);
  return materializePluginAutoEnableCandidates({
    config: params.config,
    candidates,
    env: params.env,
    manifestRegistry: params.manifestRegistry
  });
}
//#endregion /* v9-657f4dbe0d05e1ed */
