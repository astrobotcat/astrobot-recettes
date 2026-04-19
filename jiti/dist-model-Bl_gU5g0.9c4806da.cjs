"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveModelAsync;exports.r = resolveModelWithRegistry;exports.t = resolveModel;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
require("./defaults-CiQa3xnX.js");
var _providerRuntimeKhVgWetm = require("./provider-runtime-khVgWetm.js");
var _agentPathsJWlHCT = require("./agent-paths-JWlHCT48.js");
var _modelAuthMarkersVeOgG6R = require("./model-auth-markers-ve-OgG6R.js");
var _modelRefSharedDbcQI0Bg = require("./model-ref-shared-DbcQI0Bg.js");
require("./model-selection-CTdyYoio.js");
var _providerModelCompatDsxuyzi = require("./provider-model-compat-Dsxuyzi4.js");
var _piModelDiscoveryBgqsAR8S = require("./pi-model-discovery-BgqsAR8S.js");
var _providerRequestConfigS_W3yUlE = require("./provider-request-config-S_W3yUlE.js");
var _modelSuppressionBjR7TFr = require("./model-suppression-BjR7T-Fr.js");
//#region src/agents/pi-embedded-runner/model.inline-provider.ts
function normalizeResolvedTransportApi(api) {
  switch (api) {
    case "anthropic-messages":
    case "bedrock-converse-stream":
    case "github-copilot":
    case "google-generative-ai":
    case "ollama":
    case "openai-codex-responses":
    case "openai-completions":
    case "openai-responses":
    case "azure-openai-responses":return api;
    default:return;
  }
}
function sanitizeModelHeaders(headers, opts) {
  if (!headers || typeof headers !== "object" || Array.isArray(headers)) return;
  const next = {};
  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (typeof headerValue !== "string") continue;
    if (opts?.stripSecretRefMarkers && (0, _modelAuthMarkersVeOgG6R.f)(headerValue)) continue;
    next[headerName] = headerValue;
  }
  return Object.keys(next).length > 0 ? next : void 0;
}
function isLegacyFoundryVisionModelCandidate(params) {
  if ((0, _stringCoerceBUSzWgUA.o)(params.provider) !== "microsoft-foundry") return false;
  return [params.modelId, params.modelName].filter((value) => typeof value === "string").map((value) => (0, _stringCoerceBUSzWgUA.o)(value)).filter((value) => Boolean(value)).some((candidate) => candidate.startsWith("gpt-") || candidate.startsWith("o1") || candidate.startsWith("o3") || candidate.startsWith("o4") || candidate === "computer-use-preview");
}
function resolveProviderModelInput(params) {
  const resolvedInput = Array.isArray(params.input) ? params.input : params.fallbackInput;
  const normalizedInput = Array.isArray(resolvedInput) ? resolvedInput.filter((item) => item === "text" || item === "image") : [];
  if (normalizedInput.length > 0 && !normalizedInput.includes("image") && isLegacyFoundryVisionModelCandidate(params)) return ["text", "image"];
  return normalizedInput.length > 0 ? normalizedInput : ["text"];
}
function resolveInlineProviderTransport(params) {
  const api = normalizeResolvedTransportApi(params.api);
  return {
    api,
    baseUrl: api === "google-generative-ai" ? (0, _io5pxHCi7V.J)(params.baseUrl) : params.baseUrl
  };
}
function buildInlineProviderModels(providers) {
  return Object.entries(providers).flatMap(([providerId, entry]) => {
    const trimmed = providerId.trim();
    if (!trimmed) return [];
    const providerHeaders = sanitizeModelHeaders(entry?.headers, { stripSecretRefMarkers: true });
    const providerRequest = (0, _providerRequestConfigS_W3yUlE.l)(entry?.request);
    return (entry?.models ?? []).map((model) => {
      const transport = resolveInlineProviderTransport({
        api: model.api ?? entry?.api,
        baseUrl: entry?.baseUrl
      });
      const modelHeaders = sanitizeModelHeaders(model.headers, { stripSecretRefMarkers: true });
      const requestConfig = (0, _providerRequestConfigS_W3yUlE.s)({
        provider: trimmed,
        api: transport.api ?? model.api,
        baseUrl: transport.baseUrl,
        providerHeaders,
        modelHeaders,
        authHeader: entry?.authHeader,
        request: providerRequest,
        capability: "llm",
        transport: "stream"
      });
      return (0, _providerRequestConfigS_W3yUlE.t)({
        ...model,
        input: resolveProviderModelInput({
          provider: trimmed,
          modelId: model.id,
          modelName: model.name,
          input: model.input
        }),
        provider: trimmed,
        baseUrl: requestConfig.baseUrl ?? transport.baseUrl,
        api: requestConfig.api ?? model.api,
        headers: requestConfig.headers
      }, providerRequest);
    });
  });
}
//#endregion
//#region src/agents/pi-embedded-runner/model.provider-normalization.ts
function normalizeResolvedProviderModel(params) {
  return (0, _providerModelCompatDsxuyzi.i)(params.model);
}
//#endregion
//#region src/agents/pi-embedded-runner/model.ts
const DEFAULT_PROVIDER_RUNTIME_HOOKS = {
  applyProviderResolvedModelCompatWithPlugins: _providerRuntimeKhVgWetm.i,
  applyProviderResolvedTransportWithPlugin: _providerRuntimeKhVgWetm.a,
  buildProviderUnknownModelHintWithPlugin: _providerRuntimeKhVgWetm.l,
  clearProviderRuntimeHookCache: _providerRuntimeKhVgWetm.Y,
  prepareProviderDynamicModel: _providerRuntimeKhVgWetm.b,
  runProviderDynamicModel: _providerRuntimeKhVgWetm.H,
  shouldPreferProviderRuntimeResolvedModel: _providerRuntimeKhVgWetm.G,
  normalizeProviderResolvedModelWithPlugin: _providerRuntimeKhVgWetm._,
  normalizeProviderTransportWithPlugin: _providerRuntimeKhVgWetm.y
};
const STATIC_PROVIDER_RUNTIME_HOOKS = {
  applyProviderResolvedModelCompatWithPlugins: () => void 0,
  applyProviderResolvedTransportWithPlugin: () => void 0,
  buildProviderUnknownModelHintWithPlugin: () => void 0,
  clearProviderRuntimeHookCache: () => {},
  prepareProviderDynamicModel: async () => {},
  runProviderDynamicModel: () => void 0,
  normalizeProviderResolvedModelWithPlugin: () => void 0,
  normalizeProviderTransportWithPlugin: () => void 0
};
function resolveRuntimeHooks(params) {
  if (params?.skipProviderRuntimeHooks) return STATIC_PROVIDER_RUNTIME_HOOKS;
  return params?.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS;
}
function canonicalizeLegacyResolvedModel(params) {
  if ((0, _providerIdKaStHhRz.r)(params.provider) !== "openai-codex" || params.model.id.trim().toLowerCase() !== "gpt-5.4-codex") return params.model;
  return {
    ...params.model,
    id: "gpt-5.4",
    name: params.model.name.trim().toLowerCase() === "gpt-5.4-codex" ? "gpt-5.4" : params.model.name
  };
}
function applyResolvedTransportFallback(params) {
  const normalized = params.runtimeHooks.normalizeProviderTransportWithPlugin({
    provider: params.provider,
    config: params.cfg,
    context: {
      provider: params.provider,
      api: params.model.api,
      baseUrl: params.model.baseUrl
    }
  });
  if (!normalized) return;
  const nextApi = normalizeResolvedTransportApi(normalized.api) ?? params.model.api;
  const nextBaseUrl = normalized.baseUrl ?? params.model.baseUrl;
  if (nextApi === params.model.api && nextBaseUrl === params.model.baseUrl) return;
  return {
    ...params.model,
    api: nextApi,
    baseUrl: nextBaseUrl
  };
}
function normalizeResolvedModel(params) {
  const normalizedInputModel = {
    ...params.model,
    input: resolveProviderModelInput({
      provider: params.provider,
      modelId: params.model.id,
      modelName: params.model.name,
      input: params.model.input
    })
  };
  const runtimeHooks = params.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS;
  const pluginNormalized = runtimeHooks.normalizeProviderResolvedModelWithPlugin({
    provider: params.provider,
    config: params.cfg,
    context: {
      config: params.cfg,
      agentDir: params.agentDir,
      provider: params.provider,
      modelId: normalizedInputModel.id,
      model: normalizedInputModel
    }
  });
  const compatNormalized = runtimeHooks.applyProviderResolvedModelCompatWithPlugins?.({
    provider: params.provider,
    config: params.cfg,
    context: {
      config: params.cfg,
      agentDir: params.agentDir,
      provider: params.provider,
      modelId: normalizedInputModel.id,
      model: pluginNormalized ?? normalizedInputModel
    }
  });
  const fallbackTransportNormalized = runtimeHooks.applyProviderResolvedTransportWithPlugin?.({
    provider: params.provider,
    config: params.cfg,
    context: {
      config: params.cfg,
      agentDir: params.agentDir,
      provider: params.provider,
      modelId: normalizedInputModel.id,
      model: compatNormalized ?? pluginNormalized ?? normalizedInputModel
    }
  }) ?? applyResolvedTransportFallback({
    provider: params.provider,
    cfg: params.cfg,
    runtimeHooks,
    model: compatNormalized ?? pluginNormalized ?? normalizedInputModel
  });
  return canonicalizeLegacyResolvedModel({
    provider: params.provider,
    model: normalizeResolvedProviderModel({
      provider: params.provider,
      model: fallbackTransportNormalized ?? compatNormalized ?? pluginNormalized ?? normalizedInputModel
    })
  });
}
function resolveProviderTransport(params) {
  const normalized = (params.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS).normalizeProviderTransportWithPlugin({
    provider: params.provider,
    config: params.cfg,
    context: {
      provider: params.provider,
      api: params.api,
      baseUrl: params.baseUrl
    }
  });
  return {
    api: normalizeResolvedTransportApi(normalized?.api ?? params.api),
    baseUrl: normalized?.baseUrl ?? params.baseUrl
  };
}
function findInlineModelMatch(params) {
  const inlineModels = buildInlineProviderModels(params.providers);
  const exact = inlineModels.find((entry) => entry.provider === params.provider && entry.id === params.modelId);
  if (exact) return exact;
  const normalizedProvider = (0, _providerIdKaStHhRz.r)(params.provider);
  return inlineModels.find((entry) => (0, _providerIdKaStHhRz.r)(entry.provider) === normalizedProvider && entry.id === params.modelId);
}
function resolveConfiguredProviderConfig(cfg, provider) {
  const configuredProviders = cfg?.models?.providers;
  if (!configuredProviders) return;
  const exactProviderConfig = configuredProviders[provider];
  if (exactProviderConfig) return exactProviderConfig;
  return (0, _providerIdKaStHhRz.n)(configuredProviders, provider);
}
function applyConfiguredProviderOverrides(params) {
  const { discoveredModel, providerConfig, modelId } = params;
  if (!providerConfig) return {
    ...discoveredModel,
    headers: sanitizeModelHeaders(discoveredModel.headers, { stripSecretRefMarkers: true })
  };
  const configuredModel = providerConfig.models?.find((candidate) => candidate.id === modelId) ?? (discoveredModel.id !== modelId ? providerConfig.models?.find((candidate) => candidate.id === discoveredModel.id) : void 0);
  const discoveredHeaders = sanitizeModelHeaders(discoveredModel.headers, { stripSecretRefMarkers: true });
  const providerHeaders = sanitizeModelHeaders(providerConfig.headers, { stripSecretRefMarkers: true });
  const providerRequest = (0, _providerRequestConfigS_W3yUlE.l)(providerConfig.request);
  const configuredHeaders = sanitizeModelHeaders(configuredModel?.headers, { stripSecretRefMarkers: true });
  if (!configuredModel && !providerConfig.baseUrl && !providerConfig.api && !providerHeaders && !providerRequest) return {
    ...discoveredModel,
    headers: discoveredHeaders
  };
  const normalizedInput = resolveProviderModelInput({
    provider: params.provider,
    modelId,
    modelName: configuredModel?.name ?? discoveredModel.name,
    input: configuredModel?.input,
    fallbackInput: discoveredModel.input
  });
  const resolvedTransport = resolveProviderTransport({
    provider: params.provider,
    api: configuredModel?.api ?? providerConfig.api ?? discoveredModel.api,
    baseUrl: providerConfig.baseUrl ?? discoveredModel.baseUrl,
    cfg: params.cfg,
    runtimeHooks: params.runtimeHooks
  });
  const requestConfig = (0, _providerRequestConfigS_W3yUlE.s)({
    provider: params.provider,
    api: resolvedTransport.api ?? normalizeResolvedTransportApi(discoveredModel.api) ?? "openai-responses",
    baseUrl: resolvedTransport.baseUrl ?? discoveredModel.baseUrl,
    discoveredHeaders,
    providerHeaders,
    modelHeaders: configuredHeaders,
    authHeader: providerConfig.authHeader,
    request: providerRequest,
    capability: "llm",
    transport: "stream"
  });
  return (0, _providerRequestConfigS_W3yUlE.t)({
    ...discoveredModel,
    api: requestConfig.api ?? "openai-responses",
    baseUrl: requestConfig.baseUrl ?? discoveredModel.baseUrl,
    reasoning: configuredModel?.reasoning ?? discoveredModel.reasoning,
    input: normalizedInput,
    cost: configuredModel?.cost ?? discoveredModel.cost,
    contextWindow: configuredModel?.contextWindow ?? discoveredModel.contextWindow,
    contextTokens: configuredModel?.contextTokens ?? discoveredModel.contextTokens,
    maxTokens: configuredModel?.maxTokens ?? discoveredModel.maxTokens,
    headers: requestConfig.headers,
    compat: configuredModel?.compat ?? discoveredModel.compat
  }, providerRequest);
}
function resolveExplicitModelWithRegistry(params) {
  const { provider, modelId, modelRegistry, cfg, agentDir, runtimeHooks } = params;
  const providerConfig = resolveConfiguredProviderConfig(cfg, provider);
  if ((0, _modelSuppressionBjR7TFr.n)({
    provider,
    id: modelId,
    baseUrl: providerConfig?.baseUrl,
    config: cfg
  })) return { kind: "suppressed" };
  const inlineMatch = findInlineModelMatch({
    providers: cfg?.models?.providers ?? {},
    provider,
    modelId
  });
  if (inlineMatch?.api) return {
    kind: "resolved",
    model: normalizeResolvedModel({
      provider,
      cfg,
      agentDir,
      model: inlineMatch,
      runtimeHooks
    })
  };
  const model = modelRegistry.find(provider, modelId);
  if (model) return {
    kind: "resolved",
    model: normalizeResolvedModel({
      provider,
      cfg,
      agentDir,
      model: applyConfiguredProviderOverrides({
        provider,
        discoveredModel: model,
        providerConfig,
        modelId,
        cfg,
        runtimeHooks
      }),
      runtimeHooks
    })
  };
  const fallbackInlineMatch = findInlineModelMatch({
    providers: cfg?.models?.providers ?? {},
    provider,
    modelId
  });
  if (fallbackInlineMatch?.api) return {
    kind: "resolved",
    model: normalizeResolvedModel({
      provider,
      cfg,
      agentDir,
      model: fallbackInlineMatch,
      runtimeHooks
    })
  };
}
function resolvePluginDynamicModelWithRegistry(params) {
  const { provider, modelId, modelRegistry, cfg, agentDir, workspaceDir } = params;
  const runtimeHooks = params.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS;
  const providerConfig = resolveConfiguredProviderConfig(cfg, provider);
  const pluginDynamicModel = runtimeHooks.runProviderDynamicModel({
    provider,
    config: cfg,
    workspaceDir,
    context: {
      config: cfg,
      agentDir,
      provider,
      modelId,
      modelRegistry,
      providerConfig
    }
  });
  if (!pluginDynamicModel) return;
  return normalizeResolvedModel({
    provider,
    cfg,
    agentDir,
    model: applyConfiguredProviderOverrides({
      provider,
      discoveredModel: pluginDynamicModel,
      providerConfig,
      modelId,
      cfg,
      runtimeHooks
    }),
    runtimeHooks
  });
}
function resolveConfiguredFallbackModel(params) {
  const { provider, modelId, cfg, agentDir, runtimeHooks } = params;
  const providerConfig = resolveConfiguredProviderConfig(cfg, provider);
  const configuredModel = providerConfig?.models?.find((candidate) => candidate.id === modelId);
  const providerHeaders = sanitizeModelHeaders(providerConfig?.headers, { stripSecretRefMarkers: true });
  const providerRequest = (0, _providerRequestConfigS_W3yUlE.l)(providerConfig?.request);
  const modelHeaders = sanitizeModelHeaders(configuredModel?.headers, { stripSecretRefMarkers: true });
  if (!providerConfig && !modelId.startsWith("mock-")) return;
  const fallbackTransport = resolveProviderTransport({
    provider,
    api: providerConfig?.api ?? "openai-responses",
    baseUrl: providerConfig?.baseUrl,
    cfg,
    runtimeHooks
  });
  const requestConfig = (0, _providerRequestConfigS_W3yUlE.s)({
    provider,
    api: fallbackTransport.api ?? "openai-responses",
    baseUrl: fallbackTransport.baseUrl,
    providerHeaders,
    modelHeaders,
    authHeader: providerConfig?.authHeader,
    request: providerRequest,
    capability: "llm",
    transport: "stream"
  });
  return normalizeResolvedModel({
    provider,
    cfg,
    agentDir,
    model: (0, _providerRequestConfigS_W3yUlE.t)({
      id: modelId,
      name: modelId,
      api: requestConfig.api ?? "openai-responses",
      provider,
      baseUrl: requestConfig.baseUrl,
      reasoning: configuredModel?.reasoning ?? false,
      input: resolveProviderModelInput({
        provider,
        modelId,
        modelName: configuredModel?.name ?? modelId,
        input: configuredModel?.input
      }),
      cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0
      },
      contextWindow: configuredModel?.contextWindow ?? providerConfig?.models?.[0]?.contextWindow ?? 2e5,
      contextTokens: configuredModel?.contextTokens ?? providerConfig?.models?.[0]?.contextTokens,
      maxTokens: configuredModel?.maxTokens ?? providerConfig?.models?.[0]?.maxTokens ?? 2e5,
      headers: requestConfig.headers
    }, providerRequest),
    runtimeHooks
  });
}
function shouldCompareProviderRuntimeResolvedModel(params) {
  return params.runtimeHooks.shouldPreferProviderRuntimeResolvedModel?.({
    provider: params.provider,
    config: params.cfg,
    workspaceDir: params.workspaceDir,
    context: {
      provider: params.provider,
      modelId: params.modelId,
      config: params.cfg,
      agentDir: params.agentDir,
      workspaceDir: params.workspaceDir
    }
  }) ?? false;
}
function preferProviderRuntimeResolvedModel(params) {
  if (params.runtimeResolvedModel && params.runtimeResolvedModel.contextWindow > params.explicitModel.contextWindow) return params.runtimeResolvedModel;
  return params.explicitModel;
}
function resolveModelWithRegistry(params) {
  const normalizedRef = {
    provider: params.provider,
    model: (0, _modelRefSharedDbcQI0Bg.n)((0, _providerIdKaStHhRz.r)(params.provider), params.modelId)
  };
  const normalizedParams = {
    ...params,
    provider: normalizedRef.provider,
    modelId: normalizedRef.model
  };
  const runtimeHooks = params.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS;
  const workspaceDir = normalizedParams.cfg?.agents?.defaults?.workspace;
  const explicitModel = resolveExplicitModelWithRegistry(normalizedParams);
  if (explicitModel?.kind === "suppressed") return;
  if (explicitModel?.kind === "resolved") {
    if (!shouldCompareProviderRuntimeResolvedModel({
      provider: normalizedParams.provider,
      modelId: normalizedParams.modelId,
      cfg: normalizedParams.cfg,
      agentDir: normalizedParams.agentDir,
      workspaceDir,
      runtimeHooks
    })) return explicitModel.model;
    const pluginDynamicModel = resolvePluginDynamicModelWithRegistry({
      ...normalizedParams,
      workspaceDir
    });
    return preferProviderRuntimeResolvedModel({
      explicitModel: explicitModel.model,
      runtimeResolvedModel: pluginDynamicModel
    });
  }
  const pluginDynamicModel = resolvePluginDynamicModelWithRegistry(normalizedParams);
  if (pluginDynamicModel) return pluginDynamicModel;
  return resolveConfiguredFallbackModel(normalizedParams);
}
function resolveModel(provider, modelId, agentDir, cfg, options) {
  const normalizedRef = {
    provider,
    model: (0, _modelRefSharedDbcQI0Bg.n)((0, _providerIdKaStHhRz.r)(provider), modelId)
  };
  const resolvedAgentDir = agentDir ?? (0, _agentPathsJWlHCT.t)();
  const authStorage = options?.authStorage ?? (0, _piModelDiscoveryBgqsAR8S.i)(resolvedAgentDir);
  const modelRegistry = options?.modelRegistry ?? (0, _piModelDiscoveryBgqsAR8S.a)(authStorage, resolvedAgentDir);
  const runtimeHooks = resolveRuntimeHooks(options);
  const model = resolveModelWithRegistry({
    provider: normalizedRef.provider,
    modelId: normalizedRef.model,
    modelRegistry,
    cfg,
    agentDir: resolvedAgentDir,
    runtimeHooks
  });
  if (model) return {
    model,
    authStorage,
    modelRegistry
  };
  return {
    error: buildUnknownModelError({
      provider: normalizedRef.provider,
      modelId: normalizedRef.model,
      cfg,
      agentDir: resolvedAgentDir,
      runtimeHooks
    }),
    authStorage,
    modelRegistry
  };
}
async function resolveModelAsync(provider, modelId, agentDir, cfg, options) {
  const normalizedRef = {
    provider,
    model: (0, _modelRefSharedDbcQI0Bg.n)((0, _providerIdKaStHhRz.r)(provider), modelId)
  };
  const resolvedAgentDir = agentDir ?? (0, _agentPathsJWlHCT.t)();
  const authStorage = options?.authStorage ?? (0, _piModelDiscoveryBgqsAR8S.i)(resolvedAgentDir);
  const modelRegistry = options?.modelRegistry ?? (0, _piModelDiscoveryBgqsAR8S.a)(authStorage, resolvedAgentDir);
  const runtimeHooks = resolveRuntimeHooks(options);
  const explicitModel = resolveExplicitModelWithRegistry({
    provider: normalizedRef.provider,
    modelId: normalizedRef.model,
    modelRegistry,
    cfg,
    agentDir: resolvedAgentDir,
    runtimeHooks
  });
  if (explicitModel?.kind === "suppressed") return {
    error: buildUnknownModelError({
      provider: normalizedRef.provider,
      modelId: normalizedRef.model,
      cfg,
      agentDir: resolvedAgentDir,
      runtimeHooks
    }),
    authStorage,
    modelRegistry
  };
  const providerConfig = resolveConfiguredProviderConfig(cfg, normalizedRef.provider);
  const resolveDynamicAttempt = async (attemptOptions) => {
    if (attemptOptions?.clearHookCache) runtimeHooks.clearProviderRuntimeHookCache();
    await runtimeHooks.prepareProviderDynamicModel({
      provider: normalizedRef.provider,
      config: cfg,
      context: {
        config: cfg,
        agentDir: resolvedAgentDir,
        provider: normalizedRef.provider,
        modelId: normalizedRef.model,
        modelRegistry,
        providerConfig
      }
    });
    return resolveModelWithRegistry({
      provider: normalizedRef.provider,
      modelId: normalizedRef.model,
      modelRegistry,
      cfg,
      agentDir: resolvedAgentDir,
      runtimeHooks
    });
  };
  let model = explicitModel?.kind === "resolved" && !shouldCompareProviderRuntimeResolvedModel({
    provider: normalizedRef.provider,
    modelId: normalizedRef.model,
    cfg,
    agentDir: resolvedAgentDir,
    runtimeHooks
  }) ? explicitModel.model : await resolveDynamicAttempt();
  if (!model && !explicitModel && options?.retryTransientProviderRuntimeMiss) model = await resolveDynamicAttempt({ clearHookCache: true });
  if (model) return {
    model,
    authStorage,
    modelRegistry
  };
  return {
    error: buildUnknownModelError({
      provider: normalizedRef.provider,
      modelId: normalizedRef.model,
      cfg,
      agentDir: resolvedAgentDir,
      runtimeHooks
    }),
    authStorage,
    modelRegistry
  };
}
/**
* Build a more helpful error when the model is not found.
*
* Some provider plugins only become available after setup/auth has registered
* them. When users point `agents.defaults.model.primary` at one of those
* providers before setup, the raw `Unknown model` error is too vague. Provider
* plugins can append a targeted recovery hint here.
*
* See: https://github.com/openclaw/openclaw/issues/17328
*/
function buildUnknownModelError(params) {
  const suppressed = (0, _modelSuppressionBjR7TFr.t)({
    provider: params.provider,
    id: params.modelId
  });
  if (suppressed) return suppressed;
  const base = `Unknown model: ${params.provider}/${params.modelId}`;
  const hint = (params.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS).buildProviderUnknownModelHintWithPlugin({
    provider: params.provider,
    config: params.cfg,
    env: process.env,
    context: {
      config: params.cfg,
      agentDir: params.agentDir,
      env: process.env,
      provider: params.provider,
      modelId: params.modelId
    }
  });
  return hint ? `${base}. ${hint}` : base;
}
//#endregion /* v9-53588987ee11da05 */
