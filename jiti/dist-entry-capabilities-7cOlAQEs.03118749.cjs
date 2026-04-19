"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveEffectiveMediaEntryCapabilities;exports.r = normalizeMediaProviderId;exports.t = resolveConfiguredMediaEntryCapabilities;var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
//#region src/media-understanding/provider-id.ts
function normalizeMediaProviderId(id) {
  const normalized = (0, _providerIdKaStHhRz.r)(id);
  if (normalized === "gemini") return "google";
  return normalized;
}
//#endregion
//#region src/media-understanding/entry-capabilities.ts
const MEDIA_CAPABILITIES = [
"audio",
"image",
"video"];

function isMediaCapability(value) {
  return typeof value === "string" && MEDIA_CAPABILITIES.includes(value);
}
function resolveEntryType(entry) {
  return entry.type ?? (entry.command ? "cli" : "provider");
}
function resolveConfiguredMediaEntryCapabilities(entry) {
  if (!Array.isArray(entry.capabilities)) return;
  const capabilities = entry.capabilities.filter(isMediaCapability);
  return capabilities.length > 0 ? capabilities : void 0;
}
function resolveEffectiveMediaEntryCapabilities(params) {
  const configured = resolveConfiguredMediaEntryCapabilities(params.entry);
  if (configured) return configured;
  if (params.source !== "shared") return;
  if (resolveEntryType(params.entry) === "cli") return;
  const providerId = normalizeMediaProviderId(params.entry.provider ?? "");
  if (!providerId) return;
  return params.providerRegistry.get(providerId)?.capabilities;
}
//#endregion /* v9-ee3169a32d209684 */
