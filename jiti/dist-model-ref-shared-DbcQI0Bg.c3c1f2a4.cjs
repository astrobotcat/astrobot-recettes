"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveStaticAllowlistModelKey;exports.n = normalizeStaticProviderModelId;exports.r = parseStaticModelRef;exports.t = modelKey;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _providerModelIdNormalizeCAZ6pzm = require("./provider-model-id-normalize-C-aZ6pzm.js");
//#region src/agents/model-ref-shared.ts
function modelKey(provider, model) {
  const providerId = provider.trim();
  const modelId = model.trim();
  if (!providerId) return modelId;
  if (!modelId) return providerId;
  return (0, _stringCoerceBUSzWgUA.i)(modelId).startsWith(`${(0, _stringCoerceBUSzWgUA.i)(providerId)}/`) ? modelId : `${providerId}/${modelId}`;
}
function normalizeAnthropicModelId(model) {
  const trimmed = model.trim();
  if (!trimmed) return trimmed;
  switch ((0, _stringCoerceBUSzWgUA.i)(trimmed)) {
    case "opus-4.6":return "claude-opus-4-6";
    case "opus-4.5":return "claude-opus-4-5";
    case "sonnet-4.6":return "claude-sonnet-4-6";
    case "sonnet-4.5":return "claude-sonnet-4-5";
    default:return trimmed;
  }
}
function normalizeHuggingfaceModelId(model) {
  const trimmed = model.trim();
  if (!trimmed) return trimmed;
  return (0, _stringCoerceBUSzWgUA.i)(trimmed).startsWith("huggingface/") ? trimmed.slice(12) : trimmed;
}
function normalizeStaticProviderModelId(provider, model) {
  if (provider === "anthropic") return normalizeAnthropicModelId(model);
  if (provider === "huggingface") return normalizeHuggingfaceModelId(model);
  if (provider === "google" || provider === "google-vertex") return (0, _providerModelIdNormalizeCAZ6pzm.n)(model);
  if (provider === "openrouter" && !model.includes("/")) return `openrouter/${model}`;
  if (provider === "xai") return (0, _providerModelIdNormalizeCAZ6pzm.r)(model);
  if (provider === "vercel-ai-gateway" && !model.includes("/")) {
    const normalizedAnthropicModel = normalizeAnthropicModelId(model);
    if (normalizedAnthropicModel.startsWith("claude-")) return `anthropic/${normalizedAnthropicModel}`;
  }
  return model;
}
function parseStaticModelRef(raw, defaultProvider) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const slash = trimmed.indexOf("/");
  const providerRaw = slash === -1 ? defaultProvider : trimmed.slice(0, slash).trim();
  const modelRaw = slash === -1 ? trimmed : trimmed.slice(slash + 1).trim();
  if (!providerRaw || !modelRaw) return null;
  const provider = (0, _providerIdKaStHhRz.r)(providerRaw);
  return {
    provider,
    model: normalizeStaticProviderModelId(provider, modelRaw)
  };
}
function resolveStaticAllowlistModelKey(raw, defaultProvider) {
  const parsed = parseStaticModelRef(raw, defaultProvider);
  if (!parsed) return null;
  return modelKey(parsed.provider, parsed.model);
}
//#endregion /* v9-bf6da4c0662794ba */
