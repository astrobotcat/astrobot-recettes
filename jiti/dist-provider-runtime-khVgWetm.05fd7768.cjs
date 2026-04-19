"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.$ = wrapProviderStreamFn;exports.A = resolveProviderModernModelRef;exports.B = resolveProviderWebSocketSessionPolicyWithPlugin;exports.C = resolveExternalAuthProfilesWithPlugins;exports.D = resolveProviderCacheTtlEligibility;exports.E = resolveProviderBuiltInModelSuppression;exports.F = resolveProviderSystemPromptContribution;exports.G = shouldPreferProviderRuntimeResolvedModel;exports.H = runProviderDynamicModel;exports.I = resolveProviderTextTransforms;exports.J = resolveRuntimeTextTransforms;exports.K = transformProviderSystemPrompt;exports.L = resolveProviderTransportTurnStateWithPlugin;exports.M = resolveProviderReplayPolicyWithPlugin;exports.N = resolveProviderStreamFn;exports.O = resolveProviderConfigApiKeyWithPlugin;exports.P = resolveProviderSyntheticAuthWithPlugin;exports.Q = resolveProviderRuntimePlugin;exports.R = resolveProviderUsageAuthWithPlugin;exports.S = refreshProviderOAuthCredentialWithPlugin;exports.T = resolveProviderBinaryThinking;exports.U = sanitizeProviderReplayHistoryWithPlugin;exports.V = resolveProviderXHighThinking;exports.W = shouldDeferProviderSyntheticProfileAuthWithPlugin;exports.X = prepareProviderExtraParams;exports.Y = clearProviderRuntimeHookCache;exports.Z = resetProviderRuntimeHookCacheForTest;exports._ = normalizeProviderResolvedModelWithPlugin;exports.a = applyProviderResolvedTransportWithPlugin;exports.b = prepareProviderDynamicModel;exports.c = buildProviderMissingAuthMessageWithPlugin;exports.d = createProviderEmbeddingProvider;exports.f = formatProviderAuthProfileApiKeyWithPlugin;exports.g = normalizeProviderModelIdWithPlugin;exports.h = normalizeProviderConfigWithPlugin;exports.i = applyProviderResolvedModelCompatWithPlugins;exports.j = resolveProviderReasoningOutputModeWithPlugin;exports.k = resolveProviderDefaultThinkingLevel;exports.l = buildProviderUnknownModelHintWithPlugin;exports.m = matchesProviderContextOverflowWithPlugin;exports.n = applyProviderConfigDefaultsWithPlugin;exports.o = augmentModelCatalogWithProviderPlugins;exports.p = inspectProviderToolSchemasWithPlugin;exports.q = validateProviderReplayTurnsWithPlugin;exports.r = applyProviderNativeStreamingUsageCompatWithPlugin;exports.s = buildProviderAuthDoctorHintWithPlugin;exports.t = void 0;exports.u = classifyProviderFailoverReasonWithPlugin;exports.v = normalizeProviderToolSchemasWithPlugin;exports.w = resolveExternalOAuthProfilesWithPlugins;exports.x = prepareProviderRuntimeAuth;exports.y = normalizeProviderTransportWithPlugin;exports.z = resolveProviderUsageSnapshotWithPlugin;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _discoveryDGQFjH8F = require("./discovery-DGQFjH8F.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _runtimeState2uqC88Ju = require("./runtime-state-2uqC88Ju.js");
var _pluginTextTransformsBQzFygd = require("./plugin-text-transforms-BQzFygd9.js");
var _channelConfiguredBTEJAT4e = require("./channel-configured-BTEJAT4e.js");
var _pluginAutoEnableBbVfCcz = require("./plugin-auto-enable-BbVfCcz-.js");
var _providersRuntimeQry7Vql_ = require("./providers.runtime-Qry7Vql_.js");
var _nodeModule = require("node:module");
//#region src/plugins/provider-hook-runtime.ts
function matchesProviderId(provider, providerId) {
  const normalized = (0, _providerIdKaStHhRz.r)(providerId);
  if (!normalized) return false;
  if ((0, _providerIdKaStHhRz.r)(provider.id) === normalized) return true;
  return [...(provider.aliases ?? []), ...(provider.hookAliases ?? [])].some((alias) => (0, _providerIdKaStHhRz.r)(alias) === normalized);
}
let cachedHookProvidersWithoutConfig = /* @__PURE__ */new WeakMap();
let cachedHookProvidersByConfig = /* @__PURE__ */new WeakMap();
function resolveHookProviderCacheBucket(params) {
  if (!params.config) {
    let bucket = cachedHookProvidersWithoutConfig.get(params.env);
    if (!bucket) {
      bucket = /* @__PURE__ */new Map();
      cachedHookProvidersWithoutConfig.set(params.env, bucket);
    }
    return bucket;
  }
  let envBuckets = cachedHookProvidersByConfig.get(params.config);
  if (!envBuckets) {
    envBuckets = /* @__PURE__ */new WeakMap();
    cachedHookProvidersByConfig.set(params.config, envBuckets);
  }
  let bucket = envBuckets.get(params.env);
  if (!bucket) {
    bucket = /* @__PURE__ */new Map();
    envBuckets.set(params.env, bucket);
  }
  return bucket;
}
function buildHookProviderCacheKey(params) {
  const { roots } = (0, _discoveryDGQFjH8F.r)({
    workspaceDir: params.workspaceDir,
    env: params.env
  });
  const onlyPluginIds = (0, _channelConfiguredBTEJAT4e.a)(params.onlyPluginIds);
  return `${roots.workspace ?? ""}::${roots.global}::${roots.stock ?? ""}::${JSON.stringify(params.config ?? null)}::${(0, _channelConfiguredBTEJAT4e.o)(onlyPluginIds)}::${JSON.stringify(params.providerRefs ?? [])}`;
}
function clearProviderRuntimeHookCache() {
  cachedHookProvidersWithoutConfig = /* @__PURE__ */new WeakMap();
  cachedHookProvidersByConfig = /* @__PURE__ */new WeakMap();
}
function resetProviderRuntimeHookCacheForTest() {
  clearProviderRuntimeHookCache();
}
const __testing$1 = { buildHookProviderCacheKey };
function resolveProviderPluginsForHooks(params) {
  const env = params.env ?? process.env;
  const workspaceDir = params.workspaceDir ?? (0, _runtimeState2uqC88Ju.n)();
  const cacheBucket = resolveHookProviderCacheBucket({
    config: params.config,
    env
  });
  const cacheKey = buildHookProviderCacheKey({
    config: params.config,
    workspaceDir,
    onlyPluginIds: params.onlyPluginIds,
    providerRefs: params.providerRefs,
    env
  });
  const cached = cacheBucket.get(cacheKey);
  if (cached) return cached;
  if ((0, _providersRuntimeQry7Vql_.t)({
    ...params,
    workspaceDir,
    env,
    activate: false,
    cache: false,
    bundledProviderAllowlistCompat: true,
    bundledProviderVitestCompat: true
  })) return [];
  const resolved = (0, _providersRuntimeQry7Vql_.n)({
    ...params,
    workspaceDir,
    env,
    activate: false,
    cache: false,
    bundledProviderAllowlistCompat: true,
    bundledProviderVitestCompat: true
  });
  cacheBucket.set(cacheKey, resolved);
  return resolved;
}
function resolveProviderRuntimePlugin(params) {
  return resolveProviderPluginsForHooks({
    config: params.config,
    workspaceDir: params.workspaceDir ?? (0, _runtimeState2uqC88Ju.n)(),
    env: params.env,
    providerRefs: [params.provider]
  }).find((plugin) => matchesProviderId(plugin, params.provider));
}
function resolveProviderHookPlugin(params) {
  return resolveProviderRuntimePlugin(params) ?? resolveProviderPluginsForHooks({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  }).find((candidate) => matchesProviderId(candidate, params.provider));
}
function prepareProviderExtraParams(params) {
  return resolveProviderRuntimePlugin(params)?.prepareExtraParams?.(params.context) ?? void 0;
}
function wrapProviderStreamFn(params) {
  return resolveProviderHookPlugin(params)?.wrapStreamFn?.(params.context) ?? void 0;
}
//#endregion
//#region src/plugins/text-transforms.runtime.ts
const _require = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/provider-runtime-khVgWetm.js");
const RUNTIME_MODULE_CANDIDATES = ["./runtime.js", "./runtime.ts"];
let pluginRuntimeModule;
function loadPluginRuntime() {
  if (pluginRuntimeModule) return pluginRuntimeModule;
  for (const candidate of RUNTIME_MODULE_CANDIDATES) try {
    pluginRuntimeModule = _require(candidate);
    return pluginRuntimeModule;
  } catch {}
  return null;
}
function resolveRuntimeTextTransforms() {
  const registry = loadPluginRuntime()?.getActivePluginRegistry();
  return (0, _pluginTextTransformsBQzFygd.n)(...(Array.isArray(registry?.textTransforms) ? registry.textTransforms.map((entry) => entry.transforms) : []));
}
//#endregion
//#region src/plugins/provider-runtime.ts
const __testing = exports.t = { ...__testing$1 };
function resolveProviderPluginsForCatalogHooks(params) {
  const workspaceDir = params.workspaceDir ?? (0, _runtimeState2uqC88Ju.n)();
  const onlyPluginIds = (0, _pluginAutoEnableBbVfCcz.a)({
    config: params.config,
    workspaceDir,
    env: params.env
  });
  if (onlyPluginIds.length === 0) return [];
  return resolveProviderPluginsForHooks({
    ...params,
    workspaceDir,
    onlyPluginIds
  });
}
function runProviderDynamicModel(params) {
  return resolveProviderRuntimePlugin(params)?.resolveDynamicModel?.(params.context) ?? void 0;
}
function resolveProviderSystemPromptContribution(params) {
  return resolveProviderRuntimePlugin(params)?.resolveSystemPromptContribution?.(params.context) ?? void 0;
}
function transformProviderSystemPrompt(params) {
  const plugin = resolveProviderRuntimePlugin(params);
  const textTransforms = (0, _pluginTextTransformsBQzFygd.n)(resolveRuntimeTextTransforms(), plugin?.textTransforms);
  return (0, _pluginTextTransformsBQzFygd.t)(plugin?.transformSystemPrompt?.(params.context) ?? params.context.systemPrompt, textTransforms?.input);
}
function resolveProviderTextTransforms(params) {
  return (0, _pluginTextTransformsBQzFygd.n)(resolveRuntimeTextTransforms(), resolveProviderRuntimePlugin(params)?.textTransforms);
}
async function prepareProviderDynamicModel(params) {
  await resolveProviderRuntimePlugin(params)?.prepareDynamicModel?.(params.context);
}
function shouldPreferProviderRuntimeResolvedModel(params) {
  return resolveProviderRuntimePlugin(params)?.preferRuntimeResolvedModel?.(params.context) ?? false;
}
function normalizeProviderResolvedModelWithPlugin(params) {
  return resolveProviderRuntimePlugin(params)?.normalizeResolvedModel?.(params.context) ?? void 0;
}
function resolveProviderCompatHookPlugins(params) {
  const candidates = resolveProviderPluginsForHooks(params);
  const owner = resolveProviderRuntimePlugin(params);
  if (!owner) return candidates;
  const ordered = [owner, ...candidates];
  const seen = /* @__PURE__ */new Set();
  return ordered.filter((candidate) => {
    const key = `${candidate.pluginId ?? ""}:${candidate.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function applyCompatPatchToModel(model, patch) {
  const compat = model.compat && typeof model.compat === "object" ? model.compat : void 0;
  if (Object.entries(patch).every(([key, value]) => compat?.[key] === value)) return model;
  return {
    ...model,
    compat: {
      ...compat,
      ...patch
    }
  };
}
function applyProviderResolvedModelCompatWithPlugins(params) {
  let nextModel = params.context.model;
  let changed = false;
  for (const plugin of resolveProviderCompatHookPlugins(params)) {
    const patch = plugin.contributeResolvedModelCompat?.({
      ...params.context,
      model: nextModel
    });
    if (!patch || typeof patch !== "object") continue;
    const patchedModel = applyCompatPatchToModel(nextModel, patch);
    if (patchedModel === nextModel) continue;
    nextModel = patchedModel;
    changed = true;
  }
  return changed ? nextModel : void 0;
}
function applyProviderResolvedTransportWithPlugin(params) {
  const normalized = normalizeProviderTransportWithPlugin({
    provider: params.provider,
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env,
    context: {
      provider: params.context.provider,
      api: params.context.model.api,
      baseUrl: params.context.model.baseUrl
    }
  });
  if (!normalized) return;
  const nextApi = normalized.api ?? params.context.model.api;
  const nextBaseUrl = normalized.baseUrl ?? params.context.model.baseUrl;
  if (nextApi === params.context.model.api && nextBaseUrl === params.context.model.baseUrl) return;
  return {
    ...params.context.model,
    api: nextApi,
    baseUrl: nextBaseUrl
  };
}
function normalizeProviderModelIdWithPlugin(params) {
  return (0, _stringCoerceBUSzWgUA.s)(resolveProviderHookPlugin(params)?.normalizeModelId?.(params.context));
}
function normalizeProviderTransportWithPlugin(params) {
  const hasTransportChange = (normalized) => (normalized.api ?? params.context.api) !== params.context.api || (normalized.baseUrl ?? params.context.baseUrl) !== params.context.baseUrl;
  const matchedPlugin = resolveProviderHookPlugin(params);
  const normalizedMatched = matchedPlugin?.normalizeTransport?.(params.context);
  if (normalizedMatched && hasTransportChange(normalizedMatched)) return normalizedMatched;
  for (const candidate of resolveProviderPluginsForHooks(params)) {
    if (!candidate.normalizeTransport || candidate === matchedPlugin) continue;
    const normalized = candidate.normalizeTransport(params.context);
    if (normalized && hasTransportChange(normalized)) return normalized;
  }
}
function normalizeProviderConfigWithPlugin(params) {
  const hasConfigChange = (normalized) => normalized !== params.context.providerConfig;
  const bundledSurface = (0, _io5pxHCi7V.Q)(params.provider);
  if (bundledSurface?.normalizeConfig) {
    const normalized = bundledSurface.normalizeConfig(params.context);
    return normalized && hasConfigChange(normalized) ? normalized : void 0;
  }
  const matchedPlugin = resolveProviderHookPlugin(params);
  const normalizedMatched = matchedPlugin?.normalizeConfig?.(params.context);
  if (normalizedMatched && hasConfigChange(normalizedMatched)) return normalizedMatched;
  for (const candidate of resolveProviderPluginsForHooks(params)) {
    if (!candidate.normalizeConfig || candidate === matchedPlugin) continue;
    const normalized = candidate.normalizeConfig(params.context);
    if (normalized && hasConfigChange(normalized)) return normalized;
  }
}
function applyProviderNativeStreamingUsageCompatWithPlugin(params) {
  return resolveProviderHookPlugin(params)?.applyNativeStreamingUsageCompat?.(params.context) ?? void 0;
}
function resolveProviderConfigApiKeyWithPlugin(params) {
  const bundledSurface = (0, _io5pxHCi7V.Q)(params.provider);
  if (bundledSurface?.resolveConfigApiKey) return (0, _stringCoerceBUSzWgUA.s)(bundledSurface.resolveConfigApiKey(params.context));
  return (0, _stringCoerceBUSzWgUA.s)(resolveProviderHookPlugin(params)?.resolveConfigApiKey?.(params.context));
}
function resolveProviderReplayPolicyWithPlugin(params) {
  return resolveProviderHookPlugin(params)?.buildReplayPolicy?.(params.context) ?? void 0;
}
async function sanitizeProviderReplayHistoryWithPlugin(params) {
  return await resolveProviderHookPlugin(params)?.sanitizeReplayHistory?.(params.context);
}
async function validateProviderReplayTurnsWithPlugin(params) {
  return await resolveProviderHookPlugin(params)?.validateReplayTurns?.(params.context);
}
function normalizeProviderToolSchemasWithPlugin(params) {
  return resolveProviderHookPlugin(params)?.normalizeToolSchemas?.(params.context) ?? void 0;
}
function inspectProviderToolSchemasWithPlugin(params) {
  return resolveProviderHookPlugin(params)?.inspectToolSchemas?.(params.context) ?? void 0;
}
function resolveProviderReasoningOutputModeWithPlugin(params) {
  const mode = resolveProviderHookPlugin(params)?.resolveReasoningOutputMode?.(params.context);
  return mode === "native" || mode === "tagged" ? mode : void 0;
}
function resolveProviderStreamFn(params) {
  return resolveProviderRuntimePlugin(params)?.createStreamFn?.(params.context) ?? void 0;
}
function resolveProviderTransportTurnStateWithPlugin(params) {
  return resolveProviderHookPlugin(params)?.resolveTransportTurnState?.(params.context) ?? void 0;
}
function resolveProviderWebSocketSessionPolicyWithPlugin(params) {
  return resolveProviderHookPlugin(params)?.resolveWebSocketSessionPolicy?.(params.context) ?? void 0;
}
async function createProviderEmbeddingProvider(params) {
  return await resolveProviderRuntimePlugin(params)?.createEmbeddingProvider?.(params.context);
}
async function prepareProviderRuntimeAuth(params) {
  return await resolveProviderRuntimePlugin(params)?.prepareRuntimeAuth?.(params.context);
}
async function resolveProviderUsageAuthWithPlugin(params) {
  return await resolveProviderRuntimePlugin(params)?.resolveUsageAuth?.(params.context);
}
async function resolveProviderUsageSnapshotWithPlugin(params) {
  return await resolveProviderRuntimePlugin(params)?.fetchUsageSnapshot?.(params.context);
}
function matchesProviderContextOverflowWithPlugin(params) {
  const plugins = params.provider ? [resolveProviderHookPlugin({
    ...params,
    provider: params.provider
  })].filter((plugin) => Boolean(plugin)) : resolveProviderPluginsForHooks(params);
  for (const plugin of plugins) if (plugin.matchesContextOverflowError?.(params.context)) return true;
  return false;
}
function classifyProviderFailoverReasonWithPlugin(params) {
  const plugins = params.provider ? [resolveProviderHookPlugin({
    ...params,
    provider: params.provider
  })].filter((plugin) => Boolean(plugin)) : resolveProviderPluginsForHooks(params);
  for (const plugin of plugins) {
    const reason = plugin.classifyFailoverReason?.(params.context);
    if (reason) return reason;
  }
}
function formatProviderAuthProfileApiKeyWithPlugin(params) {
  return resolveProviderRuntimePlugin(params)?.formatApiKey?.(params.context);
}
async function refreshProviderOAuthCredentialWithPlugin(params) {
  return await resolveProviderRuntimePlugin(params)?.refreshOAuth?.(params.context);
}
async function buildProviderAuthDoctorHintWithPlugin(params) {
  return await resolveProviderRuntimePlugin(params)?.buildAuthDoctorHint?.(params.context);
}
function resolveProviderCacheTtlEligibility(params) {
  return resolveProviderRuntimePlugin(params)?.isCacheTtlEligible?.(params.context);
}
function resolveProviderBinaryThinking(params) {
  return resolveProviderRuntimePlugin(params)?.isBinaryThinking?.(params.context);
}
function resolveProviderXHighThinking(params) {
  return resolveProviderRuntimePlugin(params)?.supportsXHighThinking?.(params.context);
}
function resolveProviderDefaultThinkingLevel(params) {
  return resolveProviderRuntimePlugin(params)?.resolveDefaultThinkingLevel?.(params.context);
}
function applyProviderConfigDefaultsWithPlugin(params) {
  const bundledSurface = (0, _io5pxHCi7V.Q)(params.provider);
  if (bundledSurface?.applyConfigDefaults) return bundledSurface.applyConfigDefaults(params.context) ?? void 0;
  return resolveProviderRuntimePlugin(params)?.applyConfigDefaults?.(params.context) ?? void 0;
}
function resolveProviderModernModelRef(params) {
  return resolveProviderRuntimePlugin(params)?.isModernModelRef?.(params.context);
}
function buildProviderMissingAuthMessageWithPlugin(params) {
  return resolveProviderRuntimePlugin(params)?.buildMissingAuthMessage?.(params.context) ?? void 0;
}
function buildProviderUnknownModelHintWithPlugin(params) {
  return resolveProviderRuntimePlugin(params)?.buildUnknownModelHint?.(params.context) ?? void 0;
}
function resolveProviderSyntheticAuthWithPlugin(params) {
  return resolveProviderRuntimePlugin(params)?.resolveSyntheticAuth?.(params.context) ?? void 0;
}
function resolveExternalAuthProfilesWithPlugins(params) {
  const matches = [];
  for (const plugin of resolveProviderPluginsForHooks(params)) {
    const profiles = plugin.resolveExternalAuthProfiles?.(params.context) ?? plugin.resolveExternalOAuthProfiles?.(params.context);
    if (!profiles || profiles.length === 0) continue;
    matches.push(...profiles);
  }
  return matches;
}
function resolveExternalOAuthProfilesWithPlugins(params) {
  return resolveExternalAuthProfilesWithPlugins(params);
}
function shouldDeferProviderSyntheticProfileAuthWithPlugin(params) {
  return resolveProviderRuntimePlugin(params)?.shouldDeferSyntheticProfileAuth?.(params.context) ?? void 0;
}
function resolveProviderBuiltInModelSuppression(params) {
  for (const plugin of resolveProviderPluginsForCatalogHooks(params)) {
    const result = plugin.suppressBuiltInModel?.(params.context);
    if (result?.suppress) return result;
  }
}
async function augmentModelCatalogWithProviderPlugins(params) {
  const supplemental = [];
  for (const plugin of resolveProviderPluginsForCatalogHooks(params)) {
    const next = await plugin.augmentModelCatalog?.(params.context);
    if (!next || next.length === 0) continue;
    supplemental.push(...next);
  }
  return supplemental;
}
//#endregion /* v9-2dc02f269495bd59 */
