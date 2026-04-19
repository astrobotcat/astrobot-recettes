"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveChannelStreamingChunkMode;exports.i = resolveChannelStreamingBlockEnabled;exports.n = resolveChannelPreviewStreamMode;exports.o = resolveChannelStreamingNativeTransport;exports.r = resolveChannelStreamingBlockCoalesce;exports.s = resolveChannelStreamingPreviewChunk;exports.t = getChannelStreamingConfigObject;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/plugin-sdk/channel-streaming.ts
function asObjectRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function asTextChunkMode(value) {
  return value === "length" || value === "newline" ? value : void 0;
}
function asBoolean(value) {
  return typeof value === "boolean" ? value : void 0;
}
function normalizeStreamingMode(value) {
  if (typeof value !== "string") return null;
  return (0, _stringCoerceBUSzWgUA.o)(value) || null;
}
function parsePreviewStreamingMode(value) {
  const normalized = normalizeStreamingMode(value);
  if (normalized === "off" || normalized === "partial" || normalized === "block" || normalized === "progress") return normalized === "progress" ? "partial" : normalized;
  return null;
}
function asBlockStreamingCoalesceConfig(value) {
  return asObjectRecord(value);
}
function asBlockStreamingChunkConfig(value) {
  return asObjectRecord(value);
}
function getChannelStreamingConfigObject(entry) {
  const streaming = asObjectRecord(entry?.streaming);
  return streaming ? streaming : void 0;
}
function resolveChannelStreamingChunkMode(entry) {
  return asTextChunkMode(getChannelStreamingConfigObject(entry)?.chunkMode) ?? asTextChunkMode(entry?.chunkMode);
}
function resolveChannelStreamingBlockEnabled(entry) {
  return asBoolean(getChannelStreamingConfigObject(entry)?.block?.enabled) ?? asBoolean(entry?.blockStreaming);
}
function resolveChannelStreamingBlockCoalesce(entry) {
  return asBlockStreamingCoalesceConfig(getChannelStreamingConfigObject(entry)?.block?.coalesce) ?? asBlockStreamingCoalesceConfig(entry?.blockStreamingCoalesce);
}
function resolveChannelStreamingPreviewChunk(entry) {
  return asBlockStreamingChunkConfig(getChannelStreamingConfigObject(entry)?.preview?.chunk) ?? asBlockStreamingChunkConfig(entry?.draftChunk);
}
function resolveChannelStreamingNativeTransport(entry) {
  return asBoolean(getChannelStreamingConfigObject(entry)?.nativeTransport) ?? asBoolean(entry?.nativeStreaming);
}
function resolveChannelPreviewStreamMode(entry, defaultMode) {
  const parsedStreaming = parsePreviewStreamingMode(getChannelStreamingConfigObject(entry)?.mode ?? entry?.streaming);
  if (parsedStreaming) return parsedStreaming;
  const legacy = parsePreviewStreamingMode(entry?.streamMode);
  if (legacy) return legacy;
  if (typeof entry?.streaming === "boolean") return entry.streaming ? "partial" : "off";
  return defaultMode;
}
//#endregion /* v9-7266bfed8b114165 */
