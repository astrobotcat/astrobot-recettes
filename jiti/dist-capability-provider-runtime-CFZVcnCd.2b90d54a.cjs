"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolvePluginCapabilityProviders;var _manifestRegistryBd3A4lqx = require("./manifest-registry-Bd3A4lqx.js");
var _bundledCompatClStMMlW = require("./bundled-compat-ClStMMlW.js");
var _loaderDYW2PvbF = require("./loader-DYW2PvbF.js");
//#region src/plugins/capability-provider-runtime.ts
const CAPABILITY_CONTRACT_KEY = {
  memoryEmbeddingProviders: "memoryEmbeddingProviders",
  speechProviders: "speechProviders",
  realtimeTranscriptionProviders: "realtimeTranscriptionProviders",
  realtimeVoiceProviders: "realtimeVoiceProviders",
  mediaUnderstandingProviders: "mediaUnderstandingProviders",
  imageGenerationProviders: "imageGenerationProviders",
  videoGenerationProviders: "videoGenerationProviders",
  musicGenerationProviders: "musicGenerationProviders"
};
function resolveBundledCapabilityCompatPluginIds(params) {
  const contractKey = CAPABILITY_CONTRACT_KEY[params.key];
  return (0, _manifestRegistryBd3A4lqx.t)({
    config: params.cfg,
    env: process.env
  }).plugins.filter((plugin) => plugin.origin === "bundled" && (plugin.contracts?.[contractKey]?.length ?? 0) > 0).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function resolveCapabilityProviderConfig(params) {
  const pluginIds = resolveBundledCapabilityCompatPluginIds(params);
  return (0, _bundledCompatClStMMlW.r)({
    config: (0, _bundledCompatClStMMlW.n)({
      config: (0, _bundledCompatClStMMlW.t)({
        config: params.cfg,
        pluginIds
      }),
      pluginIds
    }),
    pluginIds,
    env: process.env
  });
}
function resolvePluginCapabilityProviders(params) {
  const activeProviders = (0, _loaderDYW2PvbF.a)()?.[params.key] ?? [];
  if (activeProviders.length > 0) return activeProviders.map((entry) => entry.provider);
  const compatConfig = resolveCapabilityProviderConfig({
    key: params.key,
    cfg: params.cfg
  });
  return ((0, _loaderDYW2PvbF.a)(compatConfig === void 0 ? void 0 : { config: compatConfig })?.[params.key] ?? []).map((entry) => entry.provider);
}
//#endregion /* v9-78b1ffcc737b2051 */
