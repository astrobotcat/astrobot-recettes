"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = supportsXHighThinking;exports.n = listThinkingLevelLabels;exports.r = listThinkingLevels;exports.t = formatThinkingLevels;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _thinkingSharedCAbk7EZs = require("./thinking.shared-CAbk7EZs.js");
//#region src/plugins/provider-thinking.ts
const PLUGIN_REGISTRY_STATE = Symbol.for("openclaw.pluginRegistryState");
function matchesProviderId(provider, providerId) {
  const normalized = (0, _providerIdKaStHhRz.r)(providerId);
  if (!normalized) return false;
  if ((0, _providerIdKaStHhRz.r)(provider.id) === normalized) return true;
  return (provider.aliases ?? []).some((alias) => (0, _providerIdKaStHhRz.r)(alias) === normalized);
}
function resolveActiveThinkingProvider(providerId) {
  return globalThis[PLUGIN_REGISTRY_STATE]?.activeRegistry?.providers?.find((entry) => {
    return matchesProviderId(entry.provider, providerId);
  })?.provider;
}
function resolveProviderBinaryThinking(params) {
  return resolveActiveThinkingProvider(params.provider)?.isBinaryThinking?.(params.context);
}
function resolveProviderXHighThinking(params) {
  return resolveActiveThinkingProvider(params.provider)?.supportsXHighThinking?.(params.context);
}
//#endregion
//#region src/auto-reply/thinking.ts
function isBinaryThinkingProvider(provider, model) {
  const providerRaw = (0, _stringCoerceBUSzWgUA.s)(provider);
  const normalizedProvider = providerRaw ? (0, _providerIdKaStHhRz.r)(providerRaw) : "";
  if (!normalizedProvider) return false;
  const pluginDecision = resolveProviderBinaryThinking({
    provider: normalizedProvider,
    context: {
      provider: normalizedProvider,
      modelId: (0, _stringCoerceBUSzWgUA.s)(model) ?? ""
    }
  });
  if (typeof pluginDecision === "boolean") return pluginDecision;
  return false;
}
function supportsXHighThinking(provider, model) {
  const modelKey = (0, _stringCoerceBUSzWgUA.o)(model);
  if (!modelKey) return false;
  const providerRaw = (0, _stringCoerceBUSzWgUA.s)(provider);
  const providerKey = providerRaw ? (0, _providerIdKaStHhRz.r)(providerRaw) : "";
  if (providerKey) {
    const pluginDecision = resolveProviderXHighThinking({
      provider: providerKey,
      context: {
        provider: providerKey,
        modelId: modelKey
      }
    });
    if (typeof pluginDecision === "boolean") return pluginDecision;
  }
  return false;
}
function listThinkingLevels(provider, model) {
  const levels = (0, _thinkingSharedCAbk7EZs.i)(provider, model);
  if (supportsXHighThinking(provider, model)) levels.splice(levels.length - 1, 0, "xhigh");
  return levels;
}
function listThinkingLevelLabels(provider, model) {
  if (isBinaryThinkingProvider(provider, model)) return ["off", "on"];
  return (0, _thinkingSharedCAbk7EZs.r)(provider, model);
}
function formatThinkingLevels(provider, model, separator = ", ") {
  return supportsXHighThinking(provider, model) ? listThinkingLevelLabels(provider, model).join(separator) : (0, _thinkingSharedCAbk7EZs.t)(provider, model, separator);
}
//#endregion /* v9-f5c0f641faa17d5e */
