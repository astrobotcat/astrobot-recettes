"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.C = getMediaUnderstandingProvider;exports.E = resolveBundledDefaultMediaModel;exports.S = buildMediaUnderstandingRegistry;exports.T = resolveBundledAutoMediaKeyProviders;exports._ = void 0;exports.a = resolvePrompt;exports.b = resolveAutoMediaKeyProviders;exports.c = normalizeMediaUnderstandingChatType;exports.h = exports.g = exports.f = exports.d = void 0;exports.i = resolveModelEntries;exports.l = resolveMediaUnderstandingScope;exports.m = void 0;exports.n = resolveMaxBytes;exports.o = resolveScopeDecision;exports.p = void 0;exports.r = resolveMaxChars;exports.s = resolveTimeoutMs;exports.t = resolveConcurrency;exports.v = exports.u = void 0;exports.w = bundledProviderSupportsNativePdfDocument;exports.x = resolveDefaultMediaModel;exports.y = providerSupportsNativePdfDocument;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _globalsDe6QTwLG = require("./globals-De6QTwLG.js");
var _chatTypeDFnPOWna = require("./chat-type-DFnPOWna.js");
var _capabilityProviderRuntimeCFZVcnCd = require("./capability-provider-runtime-CFZVcnCd.js");
var _entryCapabilities7cOlAQEs = require("./entry-capabilities-7cOlAQEs.js");
var _imageRuntimeH0HMzsrb = require("./image-runtime-H0HMzsrb.js");
//#region src/media-understanding/bundled-defaults.ts
const BUNDLED_MEDIA_PROVIDER_DEFAULTS = {
  openai: {
    defaultModels: {
      image: "gpt-5.4-mini",
      audio: "gpt-4o-transcribe"
    },
    autoPriority: {
      image: 10,
      audio: 10
    }
  },
  "openai-codex": { defaultModels: { image: "gpt-5.4" } },
  anthropic: {
    defaultModels: { image: "claude-opus-4-7" },
    autoPriority: { image: 20 },
    nativeDocumentInputs: ["pdf"]
  },
  google: {
    defaultModels: {
      image: "gemini-3-flash-preview",
      audio: "gemini-3-flash-preview",
      video: "gemini-3-flash-preview"
    },
    autoPriority: {
      image: 30,
      audio: 40,
      video: 10
    },
    nativeDocumentInputs: ["pdf"]
  },
  groq: {
    defaultModels: { audio: "whisper-large-v3-turbo" },
    autoPriority: { audio: 20 }
  },
  deepgram: {
    defaultModels: { audio: "nova-3" },
    autoPriority: { audio: 30 }
  },
  mistral: {
    defaultModels: { audio: "voxtral-mini-latest" },
    autoPriority: { audio: 50 }
  },
  minimax: {
    defaultModels: { image: "MiniMax-VL-01" },
    autoPriority: { image: 40 }
  },
  "minimax-portal": {
    defaultModels: { image: "MiniMax-VL-01" },
    autoPriority: { image: 50 }
  },
  zai: {
    defaultModels: { image: "glm-4.6v" },
    autoPriority: { image: 60 }
  },
  qwen: {
    defaultModels: {
      image: "qwen-vl-max-latest",
      video: "qwen-vl-max-latest"
    },
    autoPriority: { video: 15 }
  },
  moonshot: {
    defaultModels: {
      image: "kimi-k2.5",
      video: "kimi-k2.5"
    },
    autoPriority: { video: 20 }
  },
  openrouter: { defaultModels: { image: "auto" } }
};
function getBundledMediaProviderDefaults(providerId) {
  return BUNDLED_MEDIA_PROVIDER_DEFAULTS[(0, _entryCapabilities7cOlAQEs.r)(providerId)] ?? null;
}
function resolveBundledDefaultMediaModel(params) {
  return getBundledMediaProviderDefaults(params.providerId)?.defaultModels?.[params.capability]?.trim();
}
function resolveBundledAutoMediaKeyProviders(capability) {
  return Object.entries(BUNDLED_MEDIA_PROVIDER_DEFAULTS).map(([providerId, defaults]) => ({
    providerId,
    priority: defaults.autoPriority?.[capability]
  })).filter((entry) => typeof entry.priority === "number").toSorted((left, right) => {
    if (left.priority !== right.priority) return left.priority - right.priority;
    return left.providerId.localeCompare(right.providerId);
  }).map((entry) => entry.providerId);
}
function bundledProviderSupportsNativePdfDocument(providerId) {
  return getBundledMediaProviderDefaults(providerId)?.nativeDocumentInputs?.includes("pdf") ?? false;
}
//#endregion
//#region src/media-understanding/provider-registry.ts
function mergeProviderIntoRegistry(registry, provider) {
  const normalizedKey = (0, _entryCapabilities7cOlAQEs.r)(provider.id);
  const existing = registry.get(normalizedKey);
  const merged = existing ? {
    ...existing,
    ...provider,
    capabilities: provider.capabilities ?? existing.capabilities,
    defaultModels: provider.defaultModels ?? existing.defaultModels,
    autoPriority: provider.autoPriority ?? existing.autoPriority,
    nativeDocumentInputs: provider.nativeDocumentInputs ?? existing.nativeDocumentInputs
  } : provider;
  registry.set(normalizedKey, merged);
}
function buildMediaUnderstandingRegistry(overrides, cfg) {
  const registry = /* @__PURE__ */new Map();
  for (const provider of (0, _capabilityProviderRuntimeCFZVcnCd.t)({
    key: "mediaUnderstandingProviders",
    cfg
  })) mergeProviderIntoRegistry(registry, provider);
  const configProviders = cfg?.models?.providers;
  if (configProviders && typeof configProviders === "object") for (const [providerKey, providerCfg] of Object.entries(configProviders)) {
    if (!providerKey?.trim()) continue;
    const normalizedKey = (0, _entryCapabilities7cOlAQEs.r)(providerKey);
    if (registry.has(normalizedKey)) continue;
    if ((providerCfg.models ?? []).some((m) => Array.isArray(m?.input) && m.input.includes("image"))) mergeProviderIntoRegistry(registry, {
      id: normalizedKey,
      capabilities: ["image"],
      describeImage: _imageRuntimeH0HMzsrb.t,
      describeImages: _imageRuntimeH0HMzsrb.n
    });
  }
  if (overrides) for (const [key, provider] of Object.entries(overrides)) {
    const normalizedKey = (0, _entryCapabilities7cOlAQEs.r)(key);
    const existing = registry.get(normalizedKey);
    const merged = existing ? {
      ...existing,
      ...provider,
      capabilities: provider.capabilities ?? existing.capabilities,
      defaultModels: provider.defaultModels ?? existing.defaultModels,
      autoPriority: provider.autoPriority ?? existing.autoPriority,
      nativeDocumentInputs: provider.nativeDocumentInputs ?? existing.nativeDocumentInputs
    } : provider;
    registry.set(normalizedKey, merged);
  }
  return registry;
}
function getMediaUnderstandingProvider(id, registry) {
  return registry.get((0, _entryCapabilities7cOlAQEs.r)(id));
}
//#endregion
//#region src/media-understanding/defaults.ts
const MB = 1024 * 1024;
const DEFAULT_MAX_CHARS = exports.f = 500;
const DEFAULT_MAX_CHARS_BY_CAPABILITY = exports.p = {
  image: 500,
  audio: void 0,
  video: 500
};
const DEFAULT_MAX_BYTES = exports.d = {
  image: 10 * MB,
  audio: 20 * MB,
  video: 50 * MB
};
const DEFAULT_TIMEOUT_SECONDS = exports.g = {
  image: 60,
  audio: 60,
  video: 120
};
const DEFAULT_PROMPT = exports.h = {
  image: "Describe the image.",
  audio: "Transcribe the audio.",
  video: "Describe the video."
};
const DEFAULT_VIDEO_MAX_BASE64_BYTES = exports._ = 70 * MB;
const CLI_OUTPUT_MAX_BUFFER = exports.u = 5 * MB;
const DEFAULT_MEDIA_CONCURRENCY = exports.m = 2;
function providerSupportsCapability(provider, capability) {
  if (!provider) return false;
  if (capability === "audio") return Boolean(provider.transcribeAudio);
  if (capability === "image") return Boolean(provider.describeImage);
  return Boolean(provider.describeVideo);
}
function resolveDefaultRegistry(cfg) {
  return buildMediaUnderstandingRegistry(void 0, cfg ?? {});
}
function resolveConfiguredImageProviderModel(params) {
  const providers = params.cfg?.models?.providers;
  if (!providers || typeof providers !== "object") return;
  const normalizedProviderId = (0, _entryCapabilities7cOlAQEs.r)(params.providerId);
  for (const [providerKey, providerCfg] of Object.entries(providers)) {
    if ((0, _entryCapabilities7cOlAQEs.r)(providerKey) !== normalizedProviderId) continue;
    return (0, _stringCoerceBUSzWgUA.s)((providerCfg?.models ?? []).find((model) => Boolean((0, _stringCoerceBUSzWgUA.s)(model?.id)) && Array.isArray(model?.input) && model.input.includes("image"))?.id);
  }
}
function resolveDefaultMediaModel(params) {
  if (!params.providerRegistry) {
    const configuredImageModel = params.capability === "image" ? resolveConfiguredImageProviderModel({
      cfg: params.cfg,
      providerId: params.providerId
    }) : void 0;
    if (configuredImageModel) return configuredImageModel;
    const bundledDefault = resolveBundledDefaultMediaModel({
      providerId: params.providerId,
      capability: params.capability
    });
    if (bundledDefault) return bundledDefault;
  }
  return (0, _stringCoerceBUSzWgUA.s)((params.providerRegistry ?? resolveDefaultRegistry(params.cfg)).get((0, _entryCapabilities7cOlAQEs.r)(params.providerId))?.defaultModels?.[params.capability]);
}
function resolveAutoMediaKeyProviders(params) {
  if (!params.providerRegistry) {
    const bundledProviders = resolveBundledAutoMediaKeyProviders(params.capability);
    if (params.capability !== "image") return bundledProviders;
    const configProviders = params.cfg?.models?.providers;
    if (!configProviders || typeof configProviders !== "object") return bundledProviders;
    const merged = [...bundledProviders];
    for (const [providerKey, providerCfg] of Object.entries(configProviders)) {
      const normalizedProviderId = (0, _entryCapabilities7cOlAQEs.r)(providerKey);
      if ((providerCfg?.models ?? []).some((model) => Array.isArray(model?.input) && model.input.includes("image")) && !merged.includes(normalizedProviderId)) merged.push(normalizedProviderId);
    }
    return merged;
  }
  return [...(params.providerRegistry ?? resolveDefaultRegistry(params.cfg)).values()].filter((provider) => providerSupportsCapability(provider, params.capability)).map((provider) => {
    const priority = provider.autoPriority?.[params.capability];
    return typeof priority === "number" && Number.isFinite(priority) ? {
      provider,
      priority
    } : null;
  }).filter((entry) => entry !== null).toSorted((left, right) => {
    if (left.priority !== right.priority) return left.priority - right.priority;
    return left.provider.id.localeCompare(right.provider.id);
  }).map((entry) => (0, _entryCapabilities7cOlAQEs.r)(entry.provider.id)).filter(Boolean);
}
function providerSupportsNativePdfDocument(params) {
  if (!params.providerRegistry && bundledProviderSupportsNativePdfDocument(params.providerId)) return true;
  return (params.providerRegistry ?? resolveDefaultRegistry(params.cfg)).get((0, _entryCapabilities7cOlAQEs.r)(params.providerId))?.nativeDocumentInputs?.includes("pdf") ?? false;
}
/**
* Minimum audio file size in bytes below which transcription is skipped.
* Files smaller than this threshold are almost certainly empty or corrupt
* and would cause unhelpful API errors from Whisper/transcription providers.
*/
const MIN_AUDIO_FILE_BYTES = exports.v = 1024;
//#endregion
//#region src/media-understanding/scope.ts
function normalizeDecision(value) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(value);
  if (normalized === "allow") return "allow";
  if (normalized === "deny") return "deny";
}
function normalizeMediaUnderstandingChatType(raw) {
  return (0, _chatTypeDFnPOWna.t)(raw ?? void 0);
}
function resolveMediaUnderstandingScope(params) {
  const scope = params.scope;
  if (!scope) return "allow";
  const channel = (0, _stringCoerceBUSzWgUA.o)(params.channel);
  const chatType = normalizeMediaUnderstandingChatType(params.chatType);
  const sessionKey = (0, _stringCoerceBUSzWgUA.o)(params.sessionKey) ?? "";
  for (const rule of scope.rules ?? []) {
    if (!rule) continue;
    const action = normalizeDecision(rule.action) ?? "allow";
    const match = rule.match ?? {};
    const matchChannel = (0, _stringCoerceBUSzWgUA.o)(match.channel);
    const matchChatType = normalizeMediaUnderstandingChatType(match.chatType);
    const matchPrefix = (0, _stringCoerceBUSzWgUA.o)(match.keyPrefix);
    if (matchChannel && matchChannel !== channel) continue;
    if (matchChatType && matchChatType !== chatType) continue;
    if (matchPrefix && !sessionKey.startsWith(matchPrefix)) continue;
    return action;
  }
  return normalizeDecision(scope.default) ?? "allow";
}
//#endregion
//#region src/media-understanding/resolve.ts
function resolveTimeoutMs(seconds, fallbackSeconds) {
  return Math.max(1e3, Math.floor((typeof seconds === "number" && Number.isFinite(seconds) ? seconds : fallbackSeconds) * 1e3));
}
function resolvePrompt(capability, prompt, maxChars) {
  const base = prompt?.trim() || DEFAULT_PROMPT[capability];
  if (!maxChars || capability === "audio") return base;
  return `${base} Respond in at most ${maxChars} characters.`;
}
function resolveMaxChars(params) {
  const { capability, entry, cfg } = params;
  const configured = entry.maxChars ?? params.config?.maxChars ?? cfg.tools?.media?.[capability]?.maxChars;
  if (typeof configured === "number") return configured;
  return DEFAULT_MAX_CHARS_BY_CAPABILITY[capability];
}
function resolveMaxBytes(params) {
  const configured = params.entry.maxBytes ?? params.config?.maxBytes ?? params.cfg.tools?.media?.[params.capability]?.maxBytes;
  if (typeof configured === "number") return configured;
  return DEFAULT_MAX_BYTES[params.capability];
}
function resolveScopeDecision(params) {
  return resolveMediaUnderstandingScope({
    scope: params.scope,
    sessionKey: params.ctx.SessionKey,
    channel: params.ctx.Surface ?? params.ctx.Provider,
    chatType: normalizeMediaUnderstandingChatType(params.ctx.ChatType)
  });
}
function resolveModelEntries(params) {
  const { cfg, capability, config } = params;
  const sharedModels = cfg.tools?.media?.models ?? [];
  const entries = [...(config?.models ?? []).map((entry) => ({
    entry,
    source: "capability"
  })), ...sharedModels.map((entry) => ({
    entry,
    source: "shared"
  }))];
  if (entries.length === 0) return [];
  return entries.filter(({ entry, source }) => {
    const caps = (0, _entryCapabilities7cOlAQEs.n)({
      entry,
      source,
      providerRegistry: params.providerRegistry
    });
    if (!caps || caps.length === 0) {
      if (source === "shared") {
        if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`Skipping shared media model without capabilities: ${entry.provider ?? entry.command ?? "unknown"}`);
        return false;
      }
      return true;
    }
    return caps.includes(capability);
  }).map(({ entry }) => entry);
}
function resolveConcurrency(cfg) {
  const configured = cfg.tools?.media?.concurrency;
  if (typeof configured === "number" && Number.isFinite(configured) && configured > 0) return Math.floor(configured);
  return 2;
}
//#endregion /* v9-43c49e1e04ab0770 */
