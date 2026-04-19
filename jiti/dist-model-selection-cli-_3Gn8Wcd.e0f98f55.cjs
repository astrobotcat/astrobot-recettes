"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = getModelRefStatus;exports.c = resolveConfiguredModelRef;exports.d = legacyModelKey;exports.f = modelKey;exports.g = resolveConfiguredProviderFallback;exports.h = splitTrailingAuthProfile;exports.i = buildModelAliasIndex;exports.l = resolveHooksGmailModel;exports.m = parseModelRef;exports.n = resolveRuntimeCliBackends;exports.o = normalizeModelSelection;exports.p = normalizeModelRef;exports.r = buildConfiguredAllowlistKeys;exports.s = resolveAllowedModelRef;exports.t = isCliProvider;exports.u = resolveModelRefFromString;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _ansiBs_ZZlnS = require("./ansi-Bs_ZZlnS.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _manifestRegistryBd3A4lqx = require("./manifest-registry-Bd3A4lqx.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _defaultsCiQa3xnX = require("./defaults-CiQa3xnX.js");
var _modelInputDFbXtnkw = require("./model-input-DFbXtnkw.js");
var _setupDescriptorsB_G9Msd = require("./setup-descriptors-B_G9Msd-.js");
var _modelRefSharedDbcQI0Bg = require("./model-ref-shared-DbcQI0Bg.js");
var _nodeModule = require("node:module");
//#region src/agents/configured-provider-fallback.ts
function resolveConfiguredProviderFallback(params) {
  const configuredProviders = params.cfg.models?.providers;
  if (!configuredProviders || typeof configuredProviders !== "object") return null;
  const defaultProviderConfig = configuredProviders[params.defaultProvider];
  const defaultModel = params.defaultModel?.trim();
  const defaultProviderHasDefaultModel = !!defaultProviderConfig && !!defaultModel && Array.isArray(defaultProviderConfig.models) && defaultProviderConfig.models.some((model) => model?.id === defaultModel);
  if (defaultProviderConfig && (!defaultModel || defaultProviderHasDefaultModel)) return null;
  const availableProvider = Object.entries(configuredProviders).find(([, providerCfg]) => providerCfg && Array.isArray(providerCfg.models) && providerCfg.models.length > 0 && providerCfg.models[0]?.id);
  if (!availableProvider) return null;
  const [provider, providerCfg] = availableProvider;
  return {
    provider,
    model: providerCfg.models[0].id
  };
}
//#endregion
//#region src/agents/model-ref-profile.ts
function splitTrailingAuthProfile(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return { model: "" };
  const lastSlash = trimmed.lastIndexOf("/");
  let profileDelimiter = trimmed.indexOf("@", lastSlash + 1);
  if (profileDelimiter <= 0) return { model: trimmed };
  const suffixAfterDelimiter = () => trimmed.slice(profileDelimiter + 1);
  if (/^\d{8}(?:@|$)/.test(suffixAfterDelimiter())) {
    const nextDelimiter = trimmed.indexOf("@", profileDelimiter + 9);
    if (nextDelimiter < 0) return { model: trimmed };
    profileDelimiter = nextDelimiter;
  }
  if (/^(?:q\d+(?:_[a-z0-9]+)*|\d+bit)(?:@|$)/i.test(suffixAfterDelimiter())) {
    const nextDelimiter = trimmed.indexOf("@", profileDelimiter + 1);
    if (nextDelimiter < 0) return { model: trimmed };
    profileDelimiter = nextDelimiter;
  }
  const model = trimmed.slice(0, profileDelimiter).trim();
  const profile = trimmed.slice(profileDelimiter + 1).trim();
  if (!model || !profile) return { model: trimmed };
  return {
    model,
    profile
  };
}
//#endregion
//#region src/agents/provider-model-normalization.runtime.ts
const require$2 = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/model-selection-cli-_3Gn8Wcd.js");
const PROVIDER_RUNTIME_CANDIDATES = ["../plugins/provider-runtime.js", "../plugins/provider-runtime.ts"];
let providerRuntimeModule;
function loadProviderRuntime() {
  if (providerRuntimeModule) return providerRuntimeModule;
  for (const candidate of PROVIDER_RUNTIME_CANDIDATES) try {
    providerRuntimeModule = require$2(candidate);
    return providerRuntimeModule;
  } catch {}
  return null;
}
function normalizeProviderModelIdWithRuntime(params) {
  return loadProviderRuntime()?.normalizeProviderModelIdWithPlugin(params);
}
//#endregion
//#region src/agents/model-selection-normalize.ts
function modelKey(provider, model) {
  return (0, _modelRefSharedDbcQI0Bg.t)(provider, model);
}
function legacyModelKey(provider, model) {
  const providerId = provider.trim();
  const modelId = model.trim();
  if (!providerId || !modelId) return null;
  const rawKey = `${providerId}/${modelId}`;
  return rawKey === modelKey(providerId, modelId) ? null : rawKey;
}
function normalizeProviderModelId(provider, model, options) {
  const staticModelId = (0, _modelRefSharedDbcQI0Bg.n)(provider, model);
  if (options?.allowPluginNormalization === false) return staticModelId;
  return normalizeProviderModelIdWithRuntime({
    provider,
    context: {
      provider,
      modelId: staticModelId
    }
  }) ?? staticModelId;
}
function normalizeModelRef(provider, model, options) {
  const normalizedProvider = (0, _providerIdKaStHhRz.r)(provider);
  return {
    provider: normalizedProvider,
    model: normalizeProviderModelId(normalizedProvider, model.trim(), options)
  };
}
function parseModelRef(raw, defaultProvider, options) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const slash = trimmed.indexOf("/");
  if (slash === -1) return normalizeModelRef(defaultProvider, trimmed, options);
  const providerRaw = trimmed.slice(0, slash).trim();
  const model = trimmed.slice(slash + 1).trim();
  if (!providerRaw || !model) return null;
  return normalizeModelRef(providerRaw, model, options);
}
//#endregion
//#region src/agents/model-selection-resolve.ts
let log = null;
function getLog() {
  log ??= (0, _subsystemCgmckbux.t)("model-selection");
  return log;
}
function sanitizeModelWarningValue(value) {
  const stripped = value ? (0, _ansiBs_ZZlnS.r)(value) : "";
  let controlBoundary = -1;
  for (let index = 0; index < stripped.length; index += 1) {
    const code = stripped.charCodeAt(index);
    if (code <= 31 || code === 127) {
      controlBoundary = index;
      break;
    }
  }
  if (controlBoundary === -1) return (0, _ansiBs_ZZlnS.t)(stripped);
  return (0, _ansiBs_ZZlnS.t)(stripped.slice(0, controlBoundary));
}
function inferUniqueProviderFromConfiguredModels(params) {
  const model = params.model.trim();
  if (!model) return;
  const normalized = (0, _stringCoerceBUSzWgUA.i)(model);
  const providers = /* @__PURE__ */new Set();
  const addProvider = (provider) => {
    const normalizedProvider = (0, _providerIdKaStHhRz.r)(provider);
    if (!normalizedProvider) return;
    providers.add(normalizedProvider);
  };
  const configuredModels = params.cfg.agents?.defaults?.models;
  if (configuredModels) for (const key of Object.keys(configuredModels)) {
    const ref = key.trim();
    if (!ref || !ref.includes("/")) continue;
    const parsed = parseModelRef(ref, _defaultsCiQa3xnX.r, { allowPluginNormalization: false });
    if (!parsed) continue;
    if (parsed.model === model || (0, _stringCoerceBUSzWgUA.i)(parsed.model) === normalized) {
      addProvider(parsed.provider);
      if (providers.size > 1) return;
    }
  }
  const configuredProviders = params.cfg.models?.providers;
  if (configuredProviders) for (const [providerId, providerConfig] of Object.entries(configuredProviders)) {
    const models = providerConfig?.models;
    if (!Array.isArray(models)) continue;
    for (const entry of models) {
      const modelId = entry?.id?.trim();
      if (!modelId) continue;
      if (modelId === model || (0, _stringCoerceBUSzWgUA.i)(modelId) === normalized) addProvider(providerId);
    }
    if (providers.size > 1) return;
  }
  if (providers.size !== 1) return;
  return providers.values().next().value;
}
function resolveAllowlistModelKey(raw, defaultProvider) {
  const parsed = parseModelRef(raw, defaultProvider);
  if (!parsed) return null;
  return modelKey(parsed.provider, parsed.model);
}
function buildConfiguredAllowlistKeys(params) {
  const rawAllowlist = Object.keys(params.cfg?.agents?.defaults?.models ?? {});
  if (rawAllowlist.length === 0) return null;
  const keys = /* @__PURE__ */new Set();
  for (const raw of rawAllowlist) {
    const key = resolveAllowlistModelKey(raw, params.defaultProvider);
    if (key) keys.add(key);
  }
  return keys.size > 0 ? keys : null;
}
function buildModelAliasIndex(params) {
  const byAlias = /* @__PURE__ */new Map();
  const byKey = /* @__PURE__ */new Map();
  const rawModels = params.cfg.agents?.defaults?.models ?? {};
  for (const [keyRaw, entryRaw] of Object.entries(rawModels)) {
    const parsed = parseModelRef(keyRaw, params.defaultProvider, { allowPluginNormalization: params.allowPluginNormalization });
    if (!parsed) continue;
    const alias = (0, _stringCoerceBUSzWgUA.s)(entryRaw?.alias) ?? "";
    if (!alias) continue;
    const aliasKey = (0, _stringCoerceBUSzWgUA.i)(alias);
    byAlias.set(aliasKey, {
      alias,
      ref: parsed
    });
    const key = modelKey(parsed.provider, parsed.model);
    const existing = byKey.get(key) ?? [];
    existing.push(alias);
    byKey.set(key, existing);
  }
  return {
    byAlias,
    byKey
  };
}
function buildModelCatalogMetadata(params) {
  const configuredByKey = /* @__PURE__ */new Map();
  for (const entry of buildConfiguredModelCatalog({ cfg: params.cfg })) configuredByKey.set(modelKey(entry.provider, entry.id), entry);
  const aliasByKey = /* @__PURE__ */new Map();
  const configuredModels = params.cfg.agents?.defaults?.models ?? {};
  for (const [rawKey, entryRaw] of Object.entries(configuredModels)) {
    const key = resolveAllowlistModelKey(rawKey, params.defaultProvider);
    if (!key) continue;
    const alias = (entryRaw?.alias ?? "").trim();
    if (!alias) continue;
    aliasByKey.set(key, alias);
  }
  return {
    configuredByKey,
    aliasByKey
  };
}
function applyModelCatalogMetadata(params) {
  const key = modelKey(params.entry.provider, params.entry.id);
  const configuredEntry = params.metadata.configuredByKey.get(key);
  const alias = params.metadata.aliasByKey.get(key);
  if (!configuredEntry && !alias) return params.entry;
  const nextAlias = alias ?? params.entry.alias;
  const nextContextWindow = configuredEntry?.contextWindow ?? params.entry.contextWindow;
  const nextReasoning = configuredEntry?.reasoning ?? params.entry.reasoning;
  const nextInput = configuredEntry?.input ?? params.entry.input;
  return {
    ...params.entry,
    name: configuredEntry?.name ?? params.entry.name,
    ...(nextAlias ? { alias: nextAlias } : {}),
    ...(nextContextWindow !== void 0 ? { contextWindow: nextContextWindow } : {}),
    ...(nextReasoning !== void 0 ? { reasoning: nextReasoning } : {}),
    ...(nextInput ? { input: nextInput } : {})
  };
}
function buildSyntheticAllowedCatalogEntry(params) {
  const key = modelKey(params.parsed.provider, params.parsed.model);
  const configuredEntry = params.metadata.configuredByKey.get(key);
  const alias = params.metadata.aliasByKey.get(key);
  const nextContextWindow = configuredEntry?.contextWindow;
  const nextReasoning = configuredEntry?.reasoning;
  const nextInput = configuredEntry?.input;
  return {
    id: params.parsed.model,
    name: configuredEntry?.name ?? params.parsed.model,
    provider: params.parsed.provider,
    ...(alias ? { alias } : {}),
    ...(nextContextWindow !== void 0 ? { contextWindow: nextContextWindow } : {}),
    ...(nextReasoning !== void 0 ? { reasoning: nextReasoning } : {}),
    ...(nextInput ? { input: nextInput } : {})
  };
}
function resolveModelRefFromString(params) {
  const { model } = splitTrailingAuthProfile(params.raw);
  if (!model) return null;
  if (!model.includes("/")) {
    const aliasKey = (0, _stringCoerceBUSzWgUA.i)(model);
    const aliasMatch = params.aliasIndex?.byAlias.get(aliasKey);
    if (aliasMatch) return {
      ref: aliasMatch.ref,
      alias: aliasMatch.alias
    };
  }
  const parsed = parseModelRef(model, params.defaultProvider, { allowPluginNormalization: params.allowPluginNormalization });
  if (!parsed) return null;
  return { ref: parsed };
}
function resolveConfiguredModelRef(params) {
  const rawModel = (0, _modelInputDFbXtnkw.n)(params.cfg.agents?.defaults?.model) ?? "";
  if (rawModel) {
    const trimmed = rawModel.trim();
    const aliasIndex = buildModelAliasIndex({
      cfg: params.cfg,
      defaultProvider: params.defaultProvider,
      allowPluginNormalization: params.allowPluginNormalization
    });
    if (!trimmed.includes("/")) {
      const aliasKey = (0, _stringCoerceBUSzWgUA.i)(trimmed);
      const aliasMatch = aliasIndex.byAlias.get(aliasKey);
      if (aliasMatch) return aliasMatch.ref;
      const inferredProvider = inferUniqueProviderFromConfiguredModels({
        cfg: params.cfg,
        model: trimmed
      });
      if (inferredProvider) return {
        provider: inferredProvider,
        model: trimmed
      };
      const safeTrimmed = sanitizeModelWarningValue(trimmed);
      const safeResolved = (0, _ansiBs_ZZlnS.t)(`${params.defaultProvider}/${safeTrimmed}`);
      getLog().warn(`Model "${safeTrimmed}" specified without provider. Falling back to "${safeResolved}". Please use "${safeResolved}" in your config.`);
      return {
        provider: params.defaultProvider,
        model: trimmed
      };
    }
    const resolved = resolveModelRefFromString({
      raw: trimmed,
      defaultProvider: params.defaultProvider,
      aliasIndex,
      allowPluginNormalization: params.allowPluginNormalization
    });
    if (resolved) return resolved.ref;
    const safe = (0, _ansiBs_ZZlnS.t)(trimmed);
    const safeFallback = (0, _ansiBs_ZZlnS.t)(`${params.defaultProvider}/${params.defaultModel}`);
    getLog().warn(`Model "${safe}" could not be resolved. Falling back to default "${safeFallback}".`);
  }
  const fallbackProvider = resolveConfiguredProviderFallback({
    cfg: params.cfg,
    defaultProvider: params.defaultProvider
  });
  if (fallbackProvider) return fallbackProvider;
  return {
    provider: params.defaultProvider,
    model: params.defaultModel
  };
}
function buildAllowedModelSet(params) {
  const metadata = buildModelCatalogMetadata({
    cfg: params.cfg,
    defaultProvider: params.defaultProvider
  });
  const catalog = params.catalog.map((entry) => applyModelCatalogMetadata({
    entry,
    metadata
  }));
  const rawAllowlist = (() => {
    const modelMap = params.cfg.agents?.defaults?.models ?? {};
    return Object.keys(modelMap);
  })();
  const allowAny = rawAllowlist.length === 0;
  const defaultModel = params.defaultModel?.trim();
  const defaultRef = defaultModel && params.defaultProvider ? parseModelRef(defaultModel, params.defaultProvider) : null;
  const defaultKey = defaultRef ? modelKey(defaultRef.provider, defaultRef.model) : void 0;
  const catalogKeys = new Set(catalog.map((entry) => modelKey(entry.provider, entry.id)));
  if (allowAny) {
    if (defaultKey) catalogKeys.add(defaultKey);
    return {
      allowAny: true,
      allowedCatalog: catalog,
      allowedKeys: catalogKeys
    };
  }
  const allowedKeys = /* @__PURE__ */new Set();
  const syntheticCatalogEntries = /* @__PURE__ */new Map();
  for (const raw of rawAllowlist) {
    const parsed = parseModelRef(raw, params.defaultProvider);
    if (!parsed) continue;
    const key = modelKey(parsed.provider, parsed.model);
    allowedKeys.add(key);
    if (!catalogKeys.has(key) && !syntheticCatalogEntries.has(key)) syntheticCatalogEntries.set(key, buildSyntheticAllowedCatalogEntry({
      parsed,
      metadata
    }));
  }
  for (const fallback of (0, _modelInputDFbXtnkw.t)(params.cfg.agents?.defaults?.model)) {
    const parsed = parseModelRef(fallback, params.defaultProvider);
    if (!parsed) continue;
    const key = modelKey(parsed.provider, parsed.model);
    allowedKeys.add(key);
    if (!catalogKeys.has(key) && !syntheticCatalogEntries.has(key)) syntheticCatalogEntries.set(key, buildSyntheticAllowedCatalogEntry({
      parsed,
      metadata
    }));
  }
  if (defaultKey) allowedKeys.add(defaultKey);
  const allowedCatalog = [...catalog.filter((entry) => allowedKeys.has(modelKey(entry.provider, entry.id))), ...syntheticCatalogEntries.values()];
  if (allowedCatalog.length === 0 && allowedKeys.size === 0) {
    if (defaultKey) catalogKeys.add(defaultKey);
    return {
      allowAny: true,
      allowedCatalog: catalog,
      allowedKeys: catalogKeys
    };
  }
  return {
    allowAny: false,
    allowedCatalog,
    allowedKeys
  };
}
function buildConfiguredModelCatalog(params) {
  const providers = params.cfg.models?.providers;
  if (!providers || typeof providers !== "object") return [];
  const catalog = [];
  for (const [providerRaw, provider] of Object.entries(providers)) {
    const providerId = (0, _providerIdKaStHhRz.r)(providerRaw);
    if (!providerId || !Array.isArray(provider?.models)) continue;
    for (const model of provider.models) {
      const id = (0, _stringCoerceBUSzWgUA.s)(model?.id) ?? "";
      if (!id) continue;
      const name = (0, _stringCoerceBUSzWgUA.s)(model?.name) || id;
      const contextWindow = typeof model?.contextWindow === "number" && model.contextWindow > 0 ? model.contextWindow : void 0;
      const reasoning = typeof model?.reasoning === "boolean" ? model.reasoning : void 0;
      const input = Array.isArray(model?.input) ? model.input : void 0;
      catalog.push({
        provider: providerId,
        id,
        name,
        contextWindow,
        reasoning,
        input
      });
    }
  }
  return catalog;
}
function getModelRefStatus(params) {
  const allowed = buildAllowedModelSet({
    cfg: params.cfg,
    catalog: params.catalog,
    defaultProvider: params.defaultProvider,
    defaultModel: params.defaultModel
  });
  const key = modelKey(params.ref.provider, params.ref.model);
  return {
    key,
    inCatalog: params.catalog.some((entry) => modelKey(entry.provider, entry.id) === key),
    allowAny: allowed.allowAny,
    allowed: allowed.allowAny || allowed.allowedKeys.has(key)
  };
}
function resolveAllowedModelRef(params) {
  const trimmed = params.raw.trim();
  if (!trimmed) return { error: "invalid model: empty" };
  const aliasIndex = buildModelAliasIndex({
    cfg: params.cfg,
    defaultProvider: params.defaultProvider
  });
  const resolved = resolveModelRefFromString({
    raw: trimmed,
    defaultProvider: !trimmed.includes("/") ? inferUniqueProviderFromConfiguredModels({
      cfg: params.cfg,
      model: trimmed
    }) ?? params.defaultProvider : params.defaultProvider,
    aliasIndex
  });
  if (!resolved) return { error: `invalid model: ${trimmed}` };
  const status = getModelRefStatus({
    cfg: params.cfg,
    catalog: params.catalog,
    ref: resolved.ref,
    defaultProvider: params.defaultProvider,
    defaultModel: params.defaultModel
  });
  if (!status.allowed) return { error: `model not allowed: ${status.key}` };
  return {
    ref: resolved.ref,
    key: status.key
  };
}
function resolveHooksGmailModel(params) {
  const hooksModel = params.cfg.hooks?.gmail?.model;
  if (!hooksModel?.trim()) return null;
  const aliasIndex = buildModelAliasIndex({
    cfg: params.cfg,
    defaultProvider: params.defaultProvider
  });
  return resolveModelRefFromString({
    raw: hooksModel,
    defaultProvider: params.defaultProvider,
    aliasIndex
  })?.ref ?? null;
}
function normalizeModelSelection(value) {
  if (typeof value === "string") return value.trim() || void 0;
  if (!value || typeof value !== "object") return;
  const primary = value.primary;
  if (typeof primary === "string" && primary.trim()) return primary.trim();
}
//#endregion
//#region src/plugins/cli-backends.runtime.ts
const require$1 = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/model-selection-cli-_3Gn8Wcd.js");
const RUNTIME_MODULE_CANDIDATES = ["./runtime.js", "./runtime.ts"];
let pluginRuntimeModule;
function loadPluginRuntime() {
  if (pluginRuntimeModule) return pluginRuntimeModule;
  for (const candidate of RUNTIME_MODULE_CANDIDATES) try {
    pluginRuntimeModule = require$1(candidate);
    return pluginRuntimeModule;
  } catch {}
  return null;
}
function resolveRuntimeCliBackends() {
  return (loadPluginRuntime()?.getActivePluginRegistry()?.cliBackends ?? []).map((entry) => ({
    ...entry.backend,
    pluginId: entry.pluginId
  }));
}
//#endregion
//#region src/plugins/setup-registry.runtime.ts
const _require = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/model-selection-cli-_3Gn8Wcd.js");
const SETUP_REGISTRY_RUNTIME_CANDIDATES = ["./setup-registry.js", "./setup-registry.ts"];
let setupRegistryRuntimeModule;
let bundledSetupCliBackendsCache;
function resolveBundledSetupCliBackends() {
  if (bundledSetupCliBackendsCache) return bundledSetupCliBackendsCache;
  bundledSetupCliBackendsCache = (0, _manifestRegistryBd3A4lqx.t)({ cache: true }).plugins.flatMap((plugin) => {
    if (plugin.origin !== "bundled") return [];
    const backendIds = (0, _setupDescriptorsB_G9Msd.t)(plugin);
    if (backendIds.length === 0) return [];
    return backendIds.map((backendId) => ({
      pluginId: plugin.id,
      backend: { id: backendId }
    }));
  });
  return bundledSetupCliBackendsCache;
}
function loadSetupRegistryRuntime() {
  if (setupRegistryRuntimeModule !== void 0) return setupRegistryRuntimeModule;
  for (const candidate of SETUP_REGISTRY_RUNTIME_CANDIDATES) try {
    setupRegistryRuntimeModule = _require(candidate);
    return setupRegistryRuntimeModule;
  } catch {}
  return null;
}
function resolvePluginSetupCliBackendRuntime(params) {
  const normalized = (0, _providerIdKaStHhRz.r)(params.backend);
  const runtime = loadSetupRegistryRuntime();
  if (runtime !== null) return runtime.resolvePluginSetupCliBackend(params);
  return resolveBundledSetupCliBackends().find((entry) => (0, _providerIdKaStHhRz.r)(entry.backend.id) === normalized);
}
//#endregion
//#region src/agents/model-selection-cli.ts
function isCliProvider(provider, cfg) {
  const normalized = (0, _providerIdKaStHhRz.r)(provider);
  if (resolveRuntimeCliBackends().some((backend) => (0, _providerIdKaStHhRz.r)(backend.id) === normalized)) return true;
  if (resolvePluginSetupCliBackendRuntime({ backend: normalized })) return true;
  const backends = cfg?.agents?.defaults?.cliBackends ?? {};
  return Object.keys(backends).some((key) => (0, _providerIdKaStHhRz.r)(key) === normalized);
}
//#endregion /* v9-e64d71fad4a50d24 */
