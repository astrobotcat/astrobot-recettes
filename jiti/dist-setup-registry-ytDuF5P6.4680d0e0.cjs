"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = collectPluginConfigContractMatches;exports.i = runPluginSetupConfigMigrations;exports.n = resolvePluginSetupCliBackend;exports.o = resolvePluginConfigContractsById;exports.r = resolvePluginSetupProvider;exports.t = resolvePluginSetupAutoEnableReasons;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _discoveryDGQFjH8F = require("./discovery-DGQFjH8F.js");
var _bundledPluginMetadataDaMNAHv = require("./bundled-plugin-metadata-Da-MNAHv.js");
var _jitiLoaderCacheD_0TILck = require("./jiti-loader-cache-D_0TILck.js");
var _manifestRegistryBd3A4lqx = require("./manifest-registry-Bd3A4lqx.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _apiBuilderPBijLoP = require("./api-builder-PBijLo-P.js");
var _setupDescriptorsB_G9Msd = require("./setup-descriptors-B_G9Msd-.js");
var _nodeUrl = require("node:url");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugins/config-contracts.ts
function normalizePathPattern(pathPattern) {
  return pathPattern.split(".").map((segment) => segment.trim()).filter(Boolean);
}
function appendPathSegment(path, segment) {
  if (!path) return segment;
  return /^\d+$/.test(segment) ? `${path}[${segment}]` : `${path}.${segment}`;
}
function collectPluginConfigContractMatches(params) {
  const pattern = normalizePathPattern(params.pathPattern);
  if (pattern.length === 0) return [];
  let states = [{
    segments: [],
    value: params.root
  }];
  for (const segment of pattern) {
    const nextStates = [];
    for (const state of states) {
      if (segment === "*") {
        if (Array.isArray(state.value)) {
          for (const [index, value] of state.value.entries()) nextStates.push({
            segments: [...state.segments, String(index)],
            value
          });
          continue;
        }
        if ((0, _utilsD5DtWkEu.l)(state.value)) for (const [key, value] of Object.entries(state.value)) nextStates.push({
          segments: [...state.segments, key],
          value
        });
        continue;
      }
      if (Array.isArray(state.value)) {
        const index = Number.parseInt(segment, 10);
        if (Number.isInteger(index) && index >= 0 && index < state.value.length) nextStates.push({
          segments: [...state.segments, segment],
          value: state.value[index]
        });
        continue;
      }
      if (!(0, _utilsD5DtWkEu.l)(state.value) || !Object.prototype.hasOwnProperty.call(state.value, segment)) continue;
      nextStates.push({
        segments: [...state.segments, segment],
        value: state.value[segment]
      });
    }
    states = nextStates;
    if (states.length === 0) break;
  }
  return states.map((state) => ({
    path: state.segments.reduce(appendPathSegment, ""),
    value: state.value
  }));
}
function resolvePluginConfigContractsById(params) {
  const matches = /* @__PURE__ */new Map();
  const pluginIds = [...new Set(params.pluginIds.map((pluginId) => pluginId.trim()).filter(Boolean))];
  if (pluginIds.length === 0) return matches;
  const resolvedPluginIds = /* @__PURE__ */new Set();
  const registry = (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env,
    cache: params.cache
  });
  for (const plugin of registry.plugins) {
    if (!pluginIds.includes(plugin.id)) continue;
    resolvedPluginIds.add(plugin.id);
    if (!plugin.configContracts) continue;
    matches.set(plugin.id, {
      origin: plugin.origin,
      configContracts: plugin.configContracts
    });
  }
  if (params.fallbackToBundledMetadata ?? true) for (const pluginId of pluginIds) {
    if (matches.has(pluginId) || resolvedPluginIds.has(pluginId)) continue;
    const bundled = (0, _bundledPluginMetadataDaMNAHv.t)(pluginId);
    if (!bundled?.manifest.configContracts) continue;
    matches.set(pluginId, {
      origin: "bundled",
      configContracts: bundled.manifest.configContracts
    });
  }
  return matches;
}
//#endregion
//#region src/plugins/setup-registry.ts
const SETUP_API_EXTENSIONS = [
".js",
".mjs",
".cjs",
".ts",
".mts",
".cts"];

const CURRENT_MODULE_PATH = (0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/setup-registry-ytDuF5P6.js");
const RUNNING_FROM_BUILT_ARTIFACT = CURRENT_MODULE_PATH.includes(`${_nodePath.default.sep}dist${_nodePath.default.sep}`) || CURRENT_MODULE_PATH.includes(`${_nodePath.default.sep}dist-runtime${_nodePath.default.sep}`);
const EMPTY_RUNTIME = {};
const NOOP_LOGGER = {
  info() {},
  warn() {},
  error() {}
};
const MAX_SETUP_LOOKUP_CACHE_ENTRIES = 128;
const jitiLoaders = /* @__PURE__ */new Map();
const setupRegistryCache = /* @__PURE__ */new Map();
const setupProviderCache = /* @__PURE__ */new Map();
const setupCliBackendCache = /* @__PURE__ */new Map();
let setupLookupCacheEntryCap = MAX_SETUP_LOOKUP_CACHE_ENTRIES;
function getJiti(modulePath) {
  return (0, _jitiLoaderCacheD_0TILck.t)({
    cache: jitiLoaders,
    modulePath,
    importerUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/setup-registry-ytDuF5P6.js"
  });
}
function getCachedSetupValue(cache, key) {
  if (!cache.has(key)) return { hit: false };
  const cached = cache.get(key);
  cache.delete(key);
  cache.set(key, cached);
  return {
    hit: true,
    value: cached
  };
}
function setCachedSetupValue(cache, key, value) {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, value);
  while (cache.size > setupLookupCacheEntryCap) {
    const oldestKey = cache.keys().next().value;
    if (typeof oldestKey !== "string") break;
    cache.delete(oldestKey);
  }
}
function buildSetupRegistryCacheKey(params) {
  const { roots, loadPaths } = (0, _discoveryDGQFjH8F.r)({
    workspaceDir: params.workspaceDir,
    env: params.env
  });
  return JSON.stringify({
    roots,
    loadPaths,
    pluginIds: params.pluginIds ? [...new Set(params.pluginIds)].toSorted() : null
  });
}
function buildSetupProviderCacheKey(params) {
  return JSON.stringify({
    provider: (0, _providerIdKaStHhRz.r)(params.provider),
    registry: buildSetupRegistryCacheKey(params)
  });
}
function buildSetupCliBackendCacheKey(params) {
  return JSON.stringify({
    backend: (0, _providerIdKaStHhRz.r)(params.backend),
    registry: buildSetupRegistryCacheKey(params)
  });
}
function resolveSetupApiPath(rootDir) {
  const orderedExtensions = RUNNING_FROM_BUILT_ARTIFACT ? SETUP_API_EXTENSIONS : [...SETUP_API_EXTENSIONS.slice(3), ...SETUP_API_EXTENSIONS.slice(0, 3)];
  const findSetupApi = (candidateRootDir) => {
    for (const extension of orderedExtensions) {
      const candidate = _nodePath.default.join(candidateRootDir, `setup-api${extension}`);
      if (_nodeFs.default.existsSync(candidate)) return candidate;
    }
    return null;
  };
  const direct = findSetupApi(rootDir);
  if (direct) return direct;
  const bundledExtensionDir = _nodePath.default.basename(rootDir);
  const repoRootCandidates = [_nodePath.default.resolve(_nodePath.default.dirname(CURRENT_MODULE_PATH), "..", ".."), process.cwd()];
  for (const repoRoot of repoRootCandidates) {
    const sourceExtensionRoot = _nodePath.default.join(repoRoot, "extensions", bundledExtensionDir);
    if (sourceExtensionRoot === rootDir) continue;
    const sourceFallback = findSetupApi(sourceExtensionRoot);
    if (sourceFallback) return sourceFallback;
  }
  return null;
}
function collectConfiguredPluginEntryIds(config) {
  const entries = config.plugins?.entries;
  if (!entries || typeof entries !== "object") return [];
  return Object.keys(entries).map((pluginId) => pluginId.trim()).filter(Boolean).toSorted();
}
function resolveRelevantSetupMigrationPluginIds(params) {
  const ids = new Set(collectConfiguredPluginEntryIds(params.config));
  const registry = (0, _manifestRegistryBd3A4lqx.t)({
    workspaceDir: params.workspaceDir,
    env: params.env,
    cache: true
  });
  for (const plugin of registry.plugins) {
    const paths = plugin.configContracts?.compatibilityMigrationPaths;
    if (!paths?.length) continue;
    if (paths.some((pathPattern) => collectPluginConfigContractMatches({
      root: params.config,
      pathPattern
    }).length > 0)) ids.add(plugin.id);
  }
  return [...ids].toSorted();
}
function resolveRegister(mod) {
  if (typeof mod === "function") return { register: mod };
  if (mod && typeof mod === "object" && typeof mod.register === "function") return {
    definition: mod,
    register: mod.register.bind(mod)
  };
  return {};
}
function ignoreAsyncSetupRegisterResult(result) {
  if (!result || typeof result.then !== "function") return;
  Promise.resolve(result).catch(() => void 0);
}
function matchesProvider(provider, providerId) {
  const normalized = (0, _providerIdKaStHhRz.r)(providerId);
  if ((0, _providerIdKaStHhRz.r)(provider.id) === normalized) return true;
  return [...(provider.aliases ?? []), ...(provider.hookAliases ?? [])].some((alias) => (0, _providerIdKaStHhRz.r)(alias) === normalized);
}
function loadSetupManifestRegistry(params) {
  const env = params?.env ?? process.env;
  const discovery = (0, _discoveryDGQFjH8F.n)({
    workspaceDir: params?.workspaceDir,
    env,
    cache: true
  });
  return (0, _manifestRegistryBd3A4lqx.t)({
    workspaceDir: params?.workspaceDir,
    env,
    cache: true,
    candidates: discovery.candidates,
    diagnostics: discovery.diagnostics
  });
}
function findUniqueSetupManifestOwner(params) {
  const matches = params.registry.plugins.filter((entry) => params.listIds(entry).some((id) => (0, _providerIdKaStHhRz.r)(id) === params.normalizedId));
  if (matches.length === 0) return;
  return matches.length === 1 ? matches[0] : void 0;
}
function resolvePluginSetupRegistry(params) {
  const env = params?.env ?? process.env;
  const cacheKey = buildSetupRegistryCacheKey({
    workspaceDir: params?.workspaceDir,
    env,
    pluginIds: params?.pluginIds
  });
  const cached = getCachedSetupValue(setupRegistryCache, cacheKey);
  if (cached.hit) return cached.value;
  const selectedPluginIds = params?.pluginIds ? new Set(params.pluginIds.map((pluginId) => pluginId.trim()).filter(Boolean)) : null;
  if (selectedPluginIds && selectedPluginIds.size === 0) {
    const empty = {
      providers: [],
      cliBackends: [],
      configMigrations: [],
      autoEnableProbes: []
    };
    setCachedSetupValue(setupRegistryCache, cacheKey, empty);
    return empty;
  }
  const providers = [];
  const cliBackends = [];
  const configMigrations = [];
  const autoEnableProbes = [];
  const providerKeys = /* @__PURE__ */new Set();
  const cliBackendKeys = /* @__PURE__ */new Set();
  const manifestRegistry = loadSetupManifestRegistry({
    workspaceDir: params?.workspaceDir,
    env
  });
  for (const record of manifestRegistry.plugins) {
    if (selectedPluginIds && !selectedPluginIds.has(record.id)) continue;
    const setupSource = record.setupSource ?? resolveSetupApiPath(record.rootDir);
    if (!setupSource) continue;
    let mod;
    try {
      mod = getJiti(setupSource)(setupSource);
    } catch {
      continue;
    }
    const resolved = resolveRegister(mod.default ?? mod);
    if (!resolved.register) continue;
    if (resolved.definition?.id && resolved.definition.id !== record.id) continue;
    const api = (0, _apiBuilderPBijLoP.t)({
      id: record.id,
      name: record.name ?? record.id,
      version: record.version,
      description: record.description,
      source: setupSource,
      rootDir: record.rootDir,
      registrationMode: "setup-only",
      config: {},
      runtime: EMPTY_RUNTIME,
      logger: NOOP_LOGGER,
      resolvePath: (input) => input,
      handlers: {
        registerProvider(provider) {
          const key = `${record.id}:${(0, _providerIdKaStHhRz.r)(provider.id)}`;
          if (providerKeys.has(key)) return;
          providerKeys.add(key);
          providers.push({
            pluginId: record.id,
            provider
          });
        },
        registerCliBackend(backend) {
          const key = `${record.id}:${(0, _providerIdKaStHhRz.r)(backend.id)}`;
          if (cliBackendKeys.has(key)) return;
          cliBackendKeys.add(key);
          cliBackends.push({
            pluginId: record.id,
            backend
          });
        },
        registerConfigMigration(migrate) {
          configMigrations.push({
            pluginId: record.id,
            migrate
          });
        },
        registerAutoEnableProbe(probe) {
          autoEnableProbes.push({
            pluginId: record.id,
            probe
          });
        }
      }
    });
    try {
      const result = resolved.register(api);
      if (result && typeof result.then === "function") ignoreAsyncSetupRegisterResult(result);
    } catch {
      continue;
    }
  }
  const registry = {
    providers,
    cliBackends,
    configMigrations,
    autoEnableProbes
  };
  setCachedSetupValue(setupRegistryCache, cacheKey, registry);
  return registry;
}
function resolvePluginSetupProvider(params) {
  const cacheKey = buildSetupProviderCacheKey(params);
  const cached = getCachedSetupValue(setupProviderCache, cacheKey);
  if (cached.hit) return cached.value ?? void 0;
  const env = params.env ?? process.env;
  const normalizedProvider = (0, _providerIdKaStHhRz.r)(params.provider);
  const record = findUniqueSetupManifestOwner({
    registry: loadSetupManifestRegistry({
      workspaceDir: params.workspaceDir,
      env
    }),
    normalizedId: normalizedProvider,
    listIds: _setupDescriptorsB_G9Msd.n
  });
  if (!record) {
    setCachedSetupValue(setupProviderCache, cacheKey, null);
    return;
  }
  const setupSource = record.setupSource ?? resolveSetupApiPath(record.rootDir);
  if (!setupSource) {
    setCachedSetupValue(setupProviderCache, cacheKey, null);
    return;
  }
  let mod;
  try {
    mod = getJiti(setupSource)(setupSource);
  } catch {
    setCachedSetupValue(setupProviderCache, cacheKey, null);
    return;
  }
  const resolved = resolveRegister(mod.default ?? mod);
  if (!resolved.register) {
    setCachedSetupValue(setupProviderCache, cacheKey, null);
    return;
  }
  if (resolved.definition?.id && resolved.definition.id !== record.id) {
    setCachedSetupValue(setupProviderCache, cacheKey, null);
    return;
  }
  let matchedProvider;
  const localProviderKeys = /* @__PURE__ */new Set();
  const api = (0, _apiBuilderPBijLoP.t)({
    id: record.id,
    name: record.name ?? record.id,
    version: record.version,
    description: record.description,
    source: setupSource,
    rootDir: record.rootDir,
    registrationMode: "setup-only",
    config: {},
    runtime: EMPTY_RUNTIME,
    logger: NOOP_LOGGER,
    resolvePath: (input) => input,
    handlers: {
      registerProvider(provider) {
        const key = (0, _providerIdKaStHhRz.r)(provider.id);
        if (localProviderKeys.has(key)) return;
        localProviderKeys.add(key);
        if (matchesProvider(provider, normalizedProvider)) matchedProvider = provider;
      },
      registerConfigMigration() {},
      registerAutoEnableProbe() {}
    }
  });
  try {
    const result = resolved.register(api);
    if (result && typeof result.then === "function") ignoreAsyncSetupRegisterResult(result);
  } catch {
    setCachedSetupValue(setupProviderCache, cacheKey, null);
    return;
  }
  setCachedSetupValue(setupProviderCache, cacheKey, matchedProvider ?? null);
  return matchedProvider;
}
function resolvePluginSetupCliBackend(params) {
  const cacheKey = buildSetupCliBackendCacheKey(params);
  const cached = getCachedSetupValue(setupCliBackendCache, cacheKey);
  if (cached.hit) return cached.value ?? void 0;
  const normalized = (0, _providerIdKaStHhRz.r)(params.backend);
  const env = params.env ?? process.env;
  const record = findUniqueSetupManifestOwner({
    registry: loadSetupManifestRegistry({
      workspaceDir: params.workspaceDir,
      env
    }),
    normalizedId: normalized,
    listIds: _setupDescriptorsB_G9Msd.t
  });
  if (!record) {
    setCachedSetupValue(setupCliBackendCache, cacheKey, null);
    return;
  }
  const setupSource = record.setupSource ?? resolveSetupApiPath(record.rootDir);
  if (!setupSource) {
    setCachedSetupValue(setupCliBackendCache, cacheKey, null);
    return;
  }
  let mod;
  try {
    mod = getJiti(setupSource)(setupSource);
  } catch {
    setCachedSetupValue(setupCliBackendCache, cacheKey, null);
    return;
  }
  const resolved = resolveRegister(mod.default ?? mod);
  if (!resolved.register) {
    setCachedSetupValue(setupCliBackendCache, cacheKey, null);
    return;
  }
  if (resolved.definition?.id && resolved.definition.id !== record.id) {
    setCachedSetupValue(setupCliBackendCache, cacheKey, null);
    return;
  }
  let matchedBackend;
  const localBackendKeys = /* @__PURE__ */new Set();
  const api = (0, _apiBuilderPBijLoP.t)({
    id: record.id,
    name: record.name ?? record.id,
    version: record.version,
    description: record.description,
    source: setupSource,
    rootDir: record.rootDir,
    registrationMode: "setup-only",
    config: {},
    runtime: EMPTY_RUNTIME,
    logger: NOOP_LOGGER,
    resolvePath: (input) => input,
    handlers: {
      registerProvider() {},
      registerConfigMigration() {},
      registerAutoEnableProbe() {},
      registerCliBackend(backend) {
        const key = (0, _providerIdKaStHhRz.r)(backend.id);
        if (localBackendKeys.has(key)) return;
        localBackendKeys.add(key);
        if (key === normalized) matchedBackend = backend;
      }
    }
  });
  try {
    const result = resolved.register(api);
    if (result && typeof result.then === "function") ignoreAsyncSetupRegisterResult(result);
  } catch {
    setCachedSetupValue(setupCliBackendCache, cacheKey, null);
    return;
  }
  const resolvedEntry = matchedBackend ? {
    pluginId: record.id,
    backend: matchedBackend
  } : null;
  setCachedSetupValue(setupCliBackendCache, cacheKey, resolvedEntry);
  return resolvedEntry ?? void 0;
}
function runPluginSetupConfigMigrations(params) {
  let next = params.config;
  const changes = [];
  const pluginIds = resolveRelevantSetupMigrationPluginIds(params);
  if (pluginIds.length === 0) return {
    config: next,
    changes
  };
  for (const entry of resolvePluginSetupRegistry({
    workspaceDir: params.workspaceDir,
    env: params.env,
    pluginIds
  }).configMigrations) {
    const migration = entry.migrate(next);
    if (!migration || migration.changes.length === 0) continue;
    next = migration.config;
    changes.push(...migration.changes);
  }
  return {
    config: next,
    changes
  };
}
function resolvePluginSetupAutoEnableReasons(params) {
  const env = params.env ?? process.env;
  const reasons = [];
  const seen = /* @__PURE__ */new Set();
  for (const entry of resolvePluginSetupRegistry({
    workspaceDir: params.workspaceDir,
    env
  }).autoEnableProbes) {
    const raw = entry.probe({
      config: params.config,
      env
    });
    const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const reason of values) {
      const normalized = reason.trim();
      if (!normalized) continue;
      const key = `${entry.pluginId}:${normalized}`;
      if (seen.has(key)) continue;
      seen.add(key);
      reasons.push({
        pluginId: entry.pluginId,
        reason: normalized
      });
    }
  }
  return reasons;
}
//#endregion /* v9-9f5203548eec3ec5 */
