"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = normalizeSpeechProviderId;exports.n = getSpeechProvider;exports.r = listSpeechProviders;exports.t = canonicalizeSpeechProviderId;var _capabilityProviderRuntimeCFZVcnCd = require("./capability-provider-runtime-CFZVcnCd.js");
var _providerRegistrySharedBiA767Jk = require("./provider-registry-shared-BiA767Jk.js");
//#region src/tts/provider-registry.ts
function normalizeSpeechProviderId(providerId) {
  return (0, _providerRegistrySharedBiA767Jk.n)(providerId);
}
function resolveSpeechProviderPluginEntries(cfg) {
  return (0, _capabilityProviderRuntimeCFZVcnCd.t)({
    key: "speechProviders",
    cfg
  });
}
function buildProviderMaps(cfg) {
  return (0, _providerRegistrySharedBiA767Jk.t)(resolveSpeechProviderPluginEntries(cfg));
}
function listSpeechProviders(cfg) {
  return [...buildProviderMaps(cfg).canonical.values()];
}
function getSpeechProvider(providerId, cfg) {
  const normalized = normalizeSpeechProviderId(providerId);
  if (!normalized) return;
  return buildProviderMaps(cfg).aliases.get(normalized);
}
function canonicalizeSpeechProviderId(providerId, cfg) {
  const normalized = normalizeSpeechProviderId(providerId);
  if (!normalized) return;
  return getSpeechProvider(normalized, cfg)?.id ?? normalized;
}
//#endregion /* v9-53a04239c634cc8b */
