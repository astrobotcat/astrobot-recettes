"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports._test = void 0;exports.buildTtsSystemPromptHint = buildTtsSystemPromptHint;exports.getLastTtsAttempt = getLastTtsAttempt;exports.getResolvedSpeechProviderConfig = getResolvedSpeechProviderConfig;exports.getTtsMaxLength = getTtsMaxLength;exports.getTtsProvider = getTtsProvider;exports.isSummarizationEnabled = isSummarizationEnabled;exports.isTtsEnabled = isTtsEnabled;exports.isTtsProviderConfigured = isTtsProviderConfigured;exports.listSpeechVoices = listSpeechVoices;exports.maybeApplyTtsToPayload = maybeApplyTtsToPayload;exports.resolveExplicitTtsOverrides = resolveExplicitTtsOverrides;exports.resolveTtsAutoMode = resolveTtsAutoMode;exports.resolveTtsConfig = resolveTtsConfig;exports.resolveTtsPrefsPath = resolveTtsPrefsPath;exports.resolveTtsProviderOrder = resolveTtsProviderOrder;exports.setLastTtsAttempt = setLastTtsAttempt;exports.setSummarizationEnabled = setSummarizationEnabled;exports.setTtsAutoMode = setTtsAutoMode;exports.setTtsEnabled = setTtsEnabled;exports.setTtsMaxLength = setTtsMaxLength;exports.setTtsProvider = setTtsProvider;exports.synthesizeSpeech = synthesizeSpeech;exports.textToSpeech = textToSpeech;exports.textToSpeechTelephony = textToSpeechTelephony;var _redactD4nea1HF = require("../../redact-D4nea1HF.js");
var _errorsD8p6rxH = require("../../errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("../../string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("../../utils-D5DtWkEu.js");
var _globalStateLrCGCReA = require("../../global-state-LrCGCReA.js");
var _tmpOpenclawDirEyAoWbVe = require("../../tmp-openclaw-dir-eyAoWbVe.js");
var _globalsDe6QTwLG = require("../../globals-De6QTwLG.js");
var _registryDelpa74L = require("../../registry-Delpa74L.js");
var _replyPayloadDb_8BQiX = require("../../reply-payload-Db_8BQiX.js");
var _textRuntimeDTMxvodz = require("../../text-runtime-DTMxvodz.js");
require("../../error-runtime-CgBDklBz.js");
var _ttsAutoModeZhfpRKB = require("../../tts-auto-mode-ZhfpRKB9.js");
require("../../channel-targets-DhS74GMe.js");
require("../../sandbox-DtVcRu90.js");
require("../../runtime-env-DjtBb0Ku.js");
var _speechCoreD2B95hFO = require("../../speech-core-D2B95hFO.js");
var _providerRegistryCasPS0mm = require("../../provider-registry-CasPS0mm.js");
var _providerErrorUtilsCyJAWFR = require("../../provider-error-utils-CyJAWFR1.js");
require("../../logging-core-CqXBUxbp.js");
require("../../api-l08hpsA9.js");
var _nodeFs = require("node:fs");
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeCrypto = require("node:crypto");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region extensions/speech-core/src/tts.ts
const DEFAULT_TIMEOUT_MS = 3e4;
const DEFAULT_TTS_MAX_LENGTH = 1500;
const DEFAULT_TTS_SUMMARIZE = true;
const DEFAULT_MAX_TEXT_LENGTH = 4096;
let lastTtsAttempt;
function resolveConfiguredTtsAutoMode(raw) {
  return (0, _ttsAutoModeZhfpRKB.n)(raw.auto) ?? (raw.enabled ? "always" : "off");
}
function normalizeConfiguredSpeechProviderId(providerId) {
  const normalized = (0, _providerRegistryCasPS0mm.i)(providerId);
  if (!normalized) return;
  return normalized === "edge" ? "microsoft" : normalized;
}
function resolveTtsPrefsPathValue(prefsPath) {
  if (prefsPath?.trim()) return (0, _utilsD5DtWkEu.m)(prefsPath.trim());
  const envPath = process.env.OPENCLAW_TTS_PREFS?.trim();
  if (envPath) return (0, _utilsD5DtWkEu.m)(envPath);
  return _nodePath.default.join((0, _utilsD5DtWkEu.f)(process.env), "settings", "tts.json");
}
function resolveModelOverridePolicy(overrides) {
  if (!(overrides?.enabled ?? true)) return {
    enabled: false,
    allowText: false,
    allowProvider: false,
    allowVoice: false,
    allowModelId: false,
    allowVoiceSettings: false,
    allowNormalization: false,
    allowSeed: false
  };
  const allow = (value, defaultValue = true) => value ?? defaultValue;
  return {
    enabled: true,
    allowText: allow(overrides?.allowText),
    allowProvider: allow(overrides?.allowProvider, false),
    allowVoice: allow(overrides?.allowVoice),
    allowModelId: allow(overrides?.allowModelId),
    allowVoiceSettings: allow(overrides?.allowVoiceSettings),
    allowNormalization: allow(overrides?.allowNormalization),
    allowSeed: allow(overrides?.allowSeed)
  };
}
function sortSpeechProvidersForAutoSelection(cfg) {
  return (0, _providerRegistryCasPS0mm.r)(cfg).toSorted((left, right) => {
    const leftOrder = left.autoSelectOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.autoSelectOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return left.id.localeCompare(right.id);
  });
}
function asProviderConfig(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}
function asProviderConfigMap(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}
function resolveRawProviderConfig(raw, providerId) {
  if (!raw) return {};
  return asProviderConfig(asProviderConfigMap(raw.providers)[providerId] ?? raw[providerId]);
}
function resolveLazyProviderConfig(config, providerId, cfg) {
  const canonical = normalizeConfiguredSpeechProviderId(providerId) ?? (0, _stringCoerceBUSzWgUA.i)(providerId);
  const existing = config.providerConfigs[canonical];
  const effectiveCfg = cfg ?? config.sourceConfig;
  if (existing && !effectiveCfg) return existing;
  const rawConfig = resolveRawProviderConfig(config.rawConfig, canonical);
  const resolvedProvider = (0, _providerRegistryCasPS0mm.n)(canonical, effectiveCfg);
  const next = effectiveCfg && resolvedProvider?.resolveConfig ? resolvedProvider.resolveConfig({
    cfg: effectiveCfg,
    rawConfig: {
      ...config.rawConfig,
      providers: asProviderConfigMap(config.rawConfig?.providers)
    },
    timeoutMs: config.timeoutMs
  }) : rawConfig;
  config.providerConfigs[canonical] = next;
  return next;
}
function collectDirectProviderConfigEntries(raw) {
  const entries = {};
  const rawProviders = asProviderConfigMap(raw.providers);
  for (const [providerId, value] of Object.entries(rawProviders)) {
    const normalized = normalizeConfiguredSpeechProviderId(providerId) ?? providerId;
    entries[normalized] = asProviderConfig(value);
  }
  const reservedKeys = new Set([
  "auto",
  "enabled",
  "maxTextLength",
  "mode",
  "modelOverrides",
  "prefsPath",
  "provider",
  "providers",
  "summaryModel",
  "timeoutMs"]
  );
  for (const [key, value] of Object.entries(raw)) {
    if (reservedKeys.has(key)) continue;
    if (typeof value !== "object" || value === null || Array.isArray(value)) continue;
    const normalized = normalizeConfiguredSpeechProviderId(key) ?? key;
    entries[normalized] ??= asProviderConfig(value);
  }
  return entries;
}
function getResolvedSpeechProviderConfig(config, providerId, cfg) {
  return resolveLazyProviderConfig(config, (0, _providerRegistryCasPS0mm.t)(providerId, cfg) ?? normalizeConfiguredSpeechProviderId(providerId) ?? (0, _stringCoerceBUSzWgUA.i)(providerId), cfg);
}
function resolveTtsConfig(cfg) {
  const raw = cfg.messages?.tts ?? {};
  const providerSource = raw.provider ? "config" : "default";
  const timeoutMs = raw.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  return {
    auto: resolveConfiguredTtsAutoMode(raw),
    mode: raw.mode ?? "final",
    provider: normalizeConfiguredSpeechProviderId(raw.provider) ?? (providerSource === "config" ? (0, _stringCoerceBUSzWgUA.o)(raw.provider) ?? "" : ""),
    providerSource,
    summaryModel: (0, _stringCoerceBUSzWgUA.s)(raw.summaryModel),
    modelOverrides: resolveModelOverridePolicy(raw.modelOverrides),
    providerConfigs: collectDirectProviderConfigEntries(raw),
    prefsPath: raw.prefsPath,
    maxTextLength: raw.maxTextLength ?? DEFAULT_MAX_TEXT_LENGTH,
    timeoutMs,
    rawConfig: raw,
    sourceConfig: cfg
  };
}
function resolveTtsPrefsPath(config) {
  return resolveTtsPrefsPathValue(config.prefsPath);
}
function resolveTtsAutoModeFromPrefs(prefs) {
  const auto = (0, _ttsAutoModeZhfpRKB.n)(prefs.tts?.auto);
  if (auto) return auto;
  if (typeof prefs.tts?.enabled === "boolean") return prefs.tts.enabled ? "always" : "off";
}
function resolveTtsAutoMode(params) {
  const sessionAuto = (0, _ttsAutoModeZhfpRKB.n)(params.sessionAuto);
  if (sessionAuto) return sessionAuto;
  const prefsAuto = resolveTtsAutoModeFromPrefs(readPrefs(params.prefsPath));
  if (prefsAuto) return prefsAuto;
  return params.config.auto;
}
function resolveEffectiveTtsAutoState(params) {
  const raw = params.cfg.messages?.tts ?? {};
  const prefsPath = resolveTtsPrefsPathValue(raw.prefsPath);
  const sessionAuto = (0, _ttsAutoModeZhfpRKB.n)(params.sessionAuto);
  if (sessionAuto) return {
    autoMode: sessionAuto,
    prefsPath
  };
  const prefsAuto = resolveTtsAutoModeFromPrefs(readPrefs(prefsPath));
  if (prefsAuto) return {
    autoMode: prefsAuto,
    prefsPath
  };
  return {
    autoMode: resolveConfiguredTtsAutoMode(raw),
    prefsPath
  };
}
function buildTtsSystemPromptHint(cfg) {
  const { autoMode, prefsPath } = resolveEffectiveTtsAutoState({ cfg });
  if (autoMode === "off") return;
  resolveTtsConfig(cfg);
  const maxLength = getTtsMaxLength(prefsPath);
  const summarize = isSummarizationEnabled(prefsPath) ? "on" : "off";
  return [
  "Voice (TTS) is enabled.",
  autoMode === "inbound" ? "Only use TTS when the user's last message includes audio/voice." : autoMode === "tagged" ? "Only use TTS when you include [[tts:key=value]] directives or a [[tts:text]]...[[/tts:text]] block." : void 0,
  `Keep spoken text ≤${maxLength} chars to avoid auto-summary (summary ${summarize}).`,
  "Use [[tts:...]] and optional [[tts:text]]...[[/tts:text]] to control voice/expressiveness."].
  filter(Boolean).join("\n");
}
function readPrefs(prefsPath) {
  try {
    if (!(0, _nodeFs.existsSync)(prefsPath)) return {};
    return JSON.parse((0, _nodeFs.readFileSync)(prefsPath, "utf8"));
  } catch {
    return {};
  }
}
function atomicWriteFileSync(filePath, content) {
  const tmpPath = `${filePath}.tmp.${Date.now()}.${(0, _nodeCrypto.randomBytes)(8).toString("hex")}`;
  (0, _nodeFs.writeFileSync)(tmpPath, content, { mode: 384 });
  try {
    (0, _nodeFs.renameSync)(tmpPath, filePath);
  } catch (err) {
    try {
      (0, _nodeFs.unlinkSync)(tmpPath);
    } catch {}
    throw err;
  }
}
function updatePrefs(prefsPath, update) {
  const prefs = readPrefs(prefsPath);
  update(prefs);
  (0, _nodeFs.mkdirSync)(_nodePath.default.dirname(prefsPath), { recursive: true });
  atomicWriteFileSync(prefsPath, JSON.stringify(prefs, null, 2));
}
function isTtsEnabled(config, prefsPath, sessionAuto) {
  return resolveTtsAutoMode({
    config,
    prefsPath,
    sessionAuto
  }) !== "off";
}
function setTtsAutoMode(prefsPath, mode) {
  updatePrefs(prefsPath, (prefs) => {
    const next = { ...prefs.tts };
    delete next.enabled;
    next.auto = mode;
    prefs.tts = next;
  });
}
function setTtsEnabled(prefsPath, enabled) {
  setTtsAutoMode(prefsPath, enabled ? "always" : "off");
}
function getTtsProvider(config, prefsPath) {
  const prefs = readPrefs(prefsPath);
  const prefsProvider = (0, _providerRegistryCasPS0mm.t)(prefs.tts?.provider) ?? normalizeConfiguredSpeechProviderId(prefs.tts?.provider);
  if (prefsProvider) return prefsProvider;
  if (config.providerSource === "config") return normalizeConfiguredSpeechProviderId(config.provider) ?? config.provider;
  const effectiveCfg = config.sourceConfig;
  for (const provider of sortSpeechProvidersForAutoSelection(effectiveCfg)) if (provider.isConfigured({
    cfg: effectiveCfg,
    providerConfig: config.providerConfigs[provider.id] ?? {},
    timeoutMs: config.timeoutMs
  })) return provider.id;
  return config.provider;
}
function setTtsProvider(prefsPath, provider) {
  updatePrefs(prefsPath, (prefs) => {
    prefs.tts = {
      ...prefs.tts,
      provider: (0, _providerRegistryCasPS0mm.t)(provider) ?? provider
    };
  });
}
function resolveExplicitTtsOverrides(params) {
  const providerInput = params.provider?.trim();
  const modelId = params.modelId?.trim();
  const voiceId = params.voiceId?.trim();
  const config = resolveTtsConfig(params.cfg);
  const prefsPath = params.prefsPath ?? resolveTtsPrefsPath(config);
  const selectedProvider = (0, _providerRegistryCasPS0mm.t)(providerInput, params.cfg) ?? (modelId || voiceId ? getTtsProvider(config, prefsPath) : void 0);
  if (providerInput && !selectedProvider) throw new Error(`Unknown TTS provider "${providerInput}".`);
  if (!modelId && !voiceId) return selectedProvider ? { provider: selectedProvider } : {};
  if (!selectedProvider) throw new Error("TTS model or voice overrides require a resolved provider.");
  const provider = (0, _providerRegistryCasPS0mm.n)(selectedProvider, params.cfg);
  if (!provider) throw new Error(`speech provider ${selectedProvider} is not registered`);
  if (!provider.resolveTalkOverrides) throw new Error(`TTS provider "${selectedProvider}" does not support model or voice overrides.`);
  const providerOverrides = provider.resolveTalkOverrides({
    talkProviderConfig: {},
    params: {
      ...(voiceId ? { voiceId } : {}),
      ...(modelId ? { modelId } : {})
    }
  });
  if ((voiceId || modelId) && (!providerOverrides || Object.keys(providerOverrides).length === 0)) throw new Error(`TTS provider "${selectedProvider}" ignored the requested model or voice overrides.`);
  const overridesRecord = providerOverrides;
  return {
    provider: selectedProvider,
    providerOverrides: { [provider.id]: overridesRecord }
  };
}
function getTtsMaxLength(prefsPath) {
  return readPrefs(prefsPath).tts?.maxLength ?? DEFAULT_TTS_MAX_LENGTH;
}
function setTtsMaxLength(prefsPath, maxLength) {
  updatePrefs(prefsPath, (prefs) => {
    prefs.tts = {
      ...prefs.tts,
      maxLength
    };
  });
}
function isSummarizationEnabled(prefsPath) {
  return readPrefs(prefsPath).tts?.summarize ?? DEFAULT_TTS_SUMMARIZE;
}
function setSummarizationEnabled(prefsPath, enabled) {
  updatePrefs(prefsPath, (prefs) => {
    prefs.tts = {
      ...prefs.tts,
      summarize: enabled
    };
  });
}
function getLastTtsAttempt() {
  return lastTtsAttempt;
}
function setLastTtsAttempt(entry) {
  lastTtsAttempt = entry;
}
const OPUS_CHANNELS = new Set([
"telegram",
"feishu",
"whatsapp",
"matrix",
"discord"]
);
function resolveChannelId(channel) {
  return channel ? (0, _registryDelpa74L.i)(channel) : null;
}
function supportsNativeVoiceNoteTts(channel) {
  const channelId = resolveChannelId(channel);
  return channelId !== null && OPUS_CHANNELS.has(channelId);
}
function resolveTtsProviderOrder(primary, cfg) {
  const normalizedPrimary = (0, _providerRegistryCasPS0mm.t)(primary, cfg) ?? primary;
  const ordered = new Set([normalizedPrimary]);
  for (const provider of sortSpeechProvidersForAutoSelection(cfg)) {
    const normalized = provider.id;
    if (normalized !== normalizedPrimary) ordered.add(normalized);
  }
  return [...ordered];
}
function isTtsProviderConfigured(config, provider, cfg) {
  const resolvedProvider = (0, _providerRegistryCasPS0mm.n)(provider, cfg);
  if (!resolvedProvider) return false;
  return resolvedProvider.isConfigured({
    cfg,
    providerConfig: getResolvedSpeechProviderConfig(config, resolvedProvider.id, cfg),
    timeoutMs: config.timeoutMs
  }) ?? false;
}
function formatTtsProviderError(provider, err) {
  const error = err instanceof Error ? err : new Error(String(err));
  if (error.name === "AbortError") return `${provider}: request timed out`;
  return `${provider}: ${(0, _redactD4nea1HF.r)(error.message)}`;
}
function sanitizeTtsErrorForLog(err) {
  return (0, _redactD4nea1HF.r)((0, _errorsD8p6rxH.i)(err)).replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
}
function buildTtsFailureResult(errors, attemptedProviders, attempts) {
  return {
    success: false,
    error: `TTS conversion failed: ${errors.join("; ") || "no providers available"}`,
    attemptedProviders,
    attempts
  };
}
function resolveReadySpeechProvider(params) {
  const resolvedProvider = (0, _providerRegistryCasPS0mm.n)(params.provider, params.cfg);
  if (!resolvedProvider) return {
    kind: "skip",
    reasonCode: "no_provider_registered",
    message: `${params.provider}: no provider registered`
  };
  const providerConfig = getResolvedSpeechProviderConfig(params.config, resolvedProvider.id, params.cfg);
  if (!resolvedProvider.isConfigured({
    cfg: params.cfg,
    providerConfig,
    timeoutMs: params.config.timeoutMs
  })) return {
    kind: "skip",
    reasonCode: "not_configured",
    message: `${params.provider}: not configured`
  };
  if (params.requireTelephony && !resolvedProvider.synthesizeTelephony) return {
    kind: "skip",
    reasonCode: "unsupported_for_telephony",
    message: `${params.provider}: unsupported for telephony`
  };
  return {
    kind: "ready",
    provider: resolvedProvider,
    providerConfig
  };
}
function resolveTtsRequestSetup(params) {
  const config = resolveTtsConfig(params.cfg);
  const prefsPath = params.prefsPath ?? resolveTtsPrefsPath(config);
  if (params.text.length > config.maxTextLength) return { error: `Text too long (${params.text.length} chars, max ${config.maxTextLength})` };
  const userProvider = getTtsProvider(config, prefsPath);
  const provider = (0, _providerRegistryCasPS0mm.t)(params.providerOverride, params.cfg) ?? userProvider;
  return {
    config,
    providers: params.disableFallback ? [provider] : resolveTtsProviderOrder(provider, params.cfg)
  };
}
async function textToSpeech(params) {
  const synthesis = await synthesizeSpeech(params);
  if (!synthesis.success || !synthesis.audioBuffer || !synthesis.fileExtension) return {
    success: false,
    error: synthesis.error ?? "TTS conversion failed",
    attemptedProviders: synthesis.attemptedProviders,
    attempts: synthesis.attempts
  };
  const tempRoot = (0, _tmpOpenclawDirEyAoWbVe.n)();
  (0, _nodeFs.mkdirSync)(tempRoot, {
    recursive: true,
    mode: 448
  });
  const tempDir = (0, _nodeFs.mkdtempSync)(_nodePath.default.join(tempRoot, "tts-"));
  const audioPath = _nodePath.default.join(tempDir, `voice-${Date.now()}${synthesis.fileExtension}`);
  (0, _nodeFs.writeFileSync)(audioPath, synthesis.audioBuffer);
  (0, _speechCoreD2B95hFO.a)(tempDir);
  return {
    success: true,
    audioPath,
    latencyMs: synthesis.latencyMs,
    provider: synthesis.provider,
    fallbackFrom: synthesis.fallbackFrom,
    attemptedProviders: synthesis.attemptedProviders,
    attempts: synthesis.attempts,
    outputFormat: synthesis.outputFormat,
    voiceCompatible: synthesis.voiceCompatible
  };
}
async function synthesizeSpeech(params) {
  const setup = resolveTtsRequestSetup({
    text: params.text,
    cfg: params.cfg,
    prefsPath: params.prefsPath,
    providerOverride: params.overrides?.provider,
    disableFallback: params.disableFallback
  });
  if ("error" in setup) return {
    success: false,
    error: setup.error
  };
  const { config, providers } = setup;
  const target = supportsNativeVoiceNoteTts(params.channel) ? "voice-note" : "audio-file";
  const errors = [];
  const attemptedProviders = [];
  const attempts = [];
  const primaryProvider = providers[0];
  (0, _globalsDe6QTwLG.r)(`TTS: starting with provider ${primaryProvider}, fallbacks: ${providers.slice(1).join(", ") || "none"}`);
  for (const provider of providers) {
    attemptedProviders.push(provider);
    const providerStart = Date.now();
    try {
      const resolvedProvider = resolveReadySpeechProvider({
        provider,
        cfg: params.cfg,
        config
      });
      if (resolvedProvider.kind === "skip") {
        errors.push(resolvedProvider.message);
        attempts.push({
          provider,
          outcome: "skipped",
          reasonCode: resolvedProvider.reasonCode,
          error: resolvedProvider.message
        });
        (0, _globalsDe6QTwLG.r)(`TTS: provider ${provider} skipped (${resolvedProvider.message})`);
        continue;
      }
      const synthesis = await resolvedProvider.provider.synthesize({
        text: params.text,
        cfg: params.cfg,
        providerConfig: resolvedProvider.providerConfig,
        target,
        providerOverrides: params.overrides?.providerOverrides?.[resolvedProvider.provider.id],
        timeoutMs: config.timeoutMs
      });
      const latencyMs = Date.now() - providerStart;
      attempts.push({
        provider,
        outcome: "success",
        reasonCode: "success",
        latencyMs
      });
      return {
        success: true,
        audioBuffer: synthesis.audioBuffer,
        latencyMs,
        provider,
        fallbackFrom: provider !== primaryProvider ? primaryProvider : void 0,
        attemptedProviders,
        attempts,
        outputFormat: synthesis.outputFormat,
        voiceCompatible: synthesis.voiceCompatible,
        fileExtension: synthesis.fileExtension
      };
    } catch (err) {
      const errorMsg = formatTtsProviderError(provider, err);
      const latencyMs = Date.now() - providerStart;
      errors.push(errorMsg);
      attempts.push({
        provider,
        outcome: "failed",
        reasonCode: err instanceof Error && err.name === "AbortError" ? "timeout" : "provider_error",
        latencyMs,
        error: errorMsg
      });
      const rawError = sanitizeTtsErrorForLog(err);
      if (provider === primaryProvider) (0, _globalsDe6QTwLG.r)(`TTS: primary provider ${provider} failed (${rawError})${providers.length > 1 ? "; trying fallback providers." : "; no fallback providers configured."}`);else
      (0, _globalsDe6QTwLG.r)(`TTS: ${provider} failed (${rawError}); trying next provider.`);
    }
  }
  return buildTtsFailureResult(errors, attemptedProviders, attempts);
}
async function textToSpeechTelephony(params) {
  const setup = resolveTtsRequestSetup({
    text: params.text,
    cfg: params.cfg,
    prefsPath: params.prefsPath
  });
  if ("error" in setup) return {
    success: false,
    error: setup.error
  };
  const { config, providers } = setup;
  const errors = [];
  const attemptedProviders = [];
  const attempts = [];
  const primaryProvider = providers[0];
  (0, _globalsDe6QTwLG.r)(`TTS telephony: starting with provider ${primaryProvider}, fallbacks: ${providers.slice(1).join(", ") || "none"}`);
  for (const provider of providers) {
    attemptedProviders.push(provider);
    const providerStart = Date.now();
    try {
      const resolvedProvider = resolveReadySpeechProvider({
        provider,
        cfg: params.cfg,
        config,
        requireTelephony: true
      });
      if (resolvedProvider.kind === "skip") {
        errors.push(resolvedProvider.message);
        attempts.push({
          provider,
          outcome: "skipped",
          reasonCode: resolvedProvider.reasonCode,
          error: resolvedProvider.message
        });
        (0, _globalsDe6QTwLG.r)(`TTS telephony: provider ${provider} skipped (${resolvedProvider.message})`);
        continue;
      }
      const synthesizeTelephony = resolvedProvider.provider.synthesizeTelephony;
      const synthesis = await synthesizeTelephony({
        text: params.text,
        cfg: params.cfg,
        providerConfig: resolvedProvider.providerConfig,
        timeoutMs: config.timeoutMs
      });
      const latencyMs = Date.now() - providerStart;
      attempts.push({
        provider,
        outcome: "success",
        reasonCode: "success",
        latencyMs
      });
      return {
        success: true,
        audioBuffer: synthesis.audioBuffer,
        latencyMs,
        provider,
        fallbackFrom: provider !== primaryProvider ? primaryProvider : void 0,
        attemptedProviders,
        attempts,
        outputFormat: synthesis.outputFormat,
        sampleRate: synthesis.sampleRate
      };
    } catch (err) {
      const errorMsg = formatTtsProviderError(provider, err);
      const latencyMs = Date.now() - providerStart;
      errors.push(errorMsg);
      attempts.push({
        provider,
        outcome: "failed",
        reasonCode: err instanceof Error && err.name === "AbortError" ? "timeout" : "provider_error",
        latencyMs,
        error: errorMsg
      });
      const rawError = sanitizeTtsErrorForLog(err);
      if (provider === primaryProvider) (0, _globalsDe6QTwLG.r)(`TTS telephony: primary provider ${provider} failed (${rawError})${providers.length > 1 ? "; trying fallback providers." : "; no fallback providers configured."}`);else
      (0, _globalsDe6QTwLG.r)(`TTS telephony: ${provider} failed (${rawError}); trying next provider.`);
    }
  }
  return buildTtsFailureResult(errors, attemptedProviders, attempts);
}
async function listSpeechVoices(params) {
  const provider = (0, _providerRegistryCasPS0mm.t)(params.provider, params.cfg);
  if (!provider) throw new Error("speech provider id is required");
  const config = params.config ?? (params.cfg ? resolveTtsConfig(params.cfg) : void 0);
  if (!config) throw new Error(`speech provider ${provider} requires cfg or resolved config`);
  const resolvedProvider = (0, _providerRegistryCasPS0mm.n)(provider, params.cfg);
  if (!resolvedProvider) throw new Error(`speech provider ${provider} is not registered`);
  if (!resolvedProvider.listVoices) throw new Error(`speech provider ${provider} does not support voice listing`);
  return await resolvedProvider.listVoices({
    cfg: params.cfg,
    providerConfig: getResolvedSpeechProviderConfig(config, resolvedProvider.id, params.cfg),
    apiKey: params.apiKey,
    baseUrl: params.baseUrl
  });
}
async function maybeApplyTtsToPayload(params) {
  if (params.payload.isCompactionNotice) return params.payload;
  const { autoMode, prefsPath } = resolveEffectiveTtsAutoState({
    cfg: params.cfg,
    sessionAuto: params.ttsAuto
  });
  if (autoMode === "off") return params.payload;
  const config = resolveTtsConfig(params.cfg);
  const activeProvider = getTtsProvider(config, prefsPath);
  const reply = (0, _replyPayloadDb_8BQiX.p)(params.payload);
  const text = reply.text;
  const directives = (0, _providerErrorUtilsCyJAWFR.a)(text, config.modelOverrides, {
    cfg: params.cfg,
    providerConfigs: config.providerConfigs,
    preferredProviderId: activeProvider
  });
  if (directives.warnings.length > 0) (0, _globalsDe6QTwLG.r)(`TTS: ignored directive overrides (${directives.warnings.join("; ")})`);
  if ((0, _globalStateLrCGCReA.t)()) {
    const effectiveProvider = directives.overrides?.provider ? (0, _providerRegistryCasPS0mm.t)(directives.overrides.provider, params.cfg) ?? activeProvider : activeProvider;
    (0, _globalsDe6QTwLG.r)(`TTS: auto mode enabled (${autoMode}), channel=${params.channel}, selected provider=${effectiveProvider}, config.provider=${config.provider}, config.providerSource=${config.providerSource}`);
  }
  const trimmedCleaned = directives.cleanedText.trim();
  const visibleText = trimmedCleaned.length > 0 ? trimmedCleaned : "";
  const ttsText = directives.ttsText?.trim() || visibleText;
  const nextPayload = visibleText === text.trim() ? params.payload : {
    ...params.payload,
    text: visibleText.length > 0 ? visibleText : void 0
  };
  if (autoMode === "tagged" && !directives.hasDirective) return nextPayload;
  if (autoMode === "inbound" && params.inboundAudio !== true) return nextPayload;
  if ((config.mode ?? "final") === "final" && params.kind && params.kind !== "final") return nextPayload;
  if (!ttsText.trim()) return nextPayload;
  if (reply.hasMedia) return nextPayload;
  if (text.includes("MEDIA:")) return nextPayload;
  if (ttsText.trim().length < 10) return nextPayload;
  const maxLength = getTtsMaxLength(prefsPath);
  let textForAudio = ttsText.trim();
  let wasSummarized = false;
  if (textForAudio.length > maxLength) if (!isSummarizationEnabled(prefsPath)) {
    (0, _globalsDe6QTwLG.r)(`TTS: truncating long text (${textForAudio.length} > ${maxLength}), summarization disabled.`);
    textForAudio = `${textForAudio.slice(0, maxLength - 3)}...`;
  } else try {
    textForAudio = (await (0, _speechCoreD2B95hFO.o)({
      text: textForAudio,
      targetLength: maxLength,
      cfg: params.cfg,
      config,
      timeoutMs: config.timeoutMs
    })).summary;
    wasSummarized = true;
    if (textForAudio.length > config.maxTextLength) {
      (0, _globalsDe6QTwLG.r)(`TTS: summary exceeded hard limit (${textForAudio.length} > ${config.maxTextLength}); truncating.`);
      textForAudio = `${textForAudio.slice(0, config.maxTextLength - 3)}...`;
    }
  } catch (err) {
    (0, _globalsDe6QTwLG.r)(`TTS: summarization failed, truncating instead: ${err.message}`);
    textForAudio = `${textForAudio.slice(0, maxLength - 3)}...`;
  }
  textForAudio = (0, _textRuntimeDTMxvodz.r)(textForAudio).trim();
  if (textForAudio.length < 10) return nextPayload;
  const ttsStart = Date.now();
  const result = await textToSpeech({
    text: textForAudio,
    cfg: params.cfg,
    prefsPath,
    channel: params.channel,
    overrides: directives.overrides
  });
  if (result.success && result.audioPath) {
    lastTtsAttempt = {
      timestamp: Date.now(),
      success: true,
      textLength: text.length,
      summarized: wasSummarized,
      provider: result.provider,
      fallbackFrom: result.fallbackFrom,
      attemptedProviders: result.attemptedProviders,
      attempts: result.attempts,
      latencyMs: result.latencyMs
    };
    const shouldVoice = supportsNativeVoiceNoteTts(params.channel) && result.voiceCompatible === true;
    return {
      ...nextPayload,
      mediaUrl: result.audioPath,
      audioAsVoice: shouldVoice || params.payload.audioAsVoice
    };
  }
  lastTtsAttempt = {
    timestamp: Date.now(),
    success: false,
    textLength: text.length,
    summarized: wasSummarized,
    attemptedProviders: result.attemptedProviders,
    attempts: result.attempts,
    error: result.error
  };
  (0, _globalsDe6QTwLG.r)(`TTS: conversion failed after ${Date.now() - ttsStart}ms (${result.error ?? "unknown"}).`);
  return nextPayload;
}
const _test = exports._test = {
  parseTtsDirectives: _providerErrorUtilsCyJAWFR.a,
  resolveModelOverridePolicy,
  supportsNativeVoiceNoteTts,
  summarizeText: _speechCoreD2B95hFO.o,
  getResolvedSpeechProviderConfig,
  formatTtsProviderError,
  sanitizeTtsErrorForLog
};
//#endregion /* v9-61dd45fc2c30c590 */
