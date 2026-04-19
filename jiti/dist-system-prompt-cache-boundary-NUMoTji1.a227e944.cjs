"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = stripSystemPromptCacheBoundary;exports.n = prependSystemPromptAdditionAfterCacheBoundary;exports.r = splitSystemPromptCacheBoundary;exports.t = void 0;var _promptCacheStabilityBMXERFfV = require("./prompt-cache-stability-BMXERFfV.js");
//#region src/agents/system-prompt-cache-boundary.ts
const SYSTEM_PROMPT_CACHE_BOUNDARY = exports.t = "\n<!-- OPENCLAW_CACHE_BOUNDARY -->\n";
function stripSystemPromptCacheBoundary(text) {
  return text.replaceAll(SYSTEM_PROMPT_CACHE_BOUNDARY, "\n");
}
function splitSystemPromptCacheBoundary(text) {
  const boundaryIndex = text.indexOf(SYSTEM_PROMPT_CACHE_BOUNDARY);
  if (boundaryIndex === -1) return;
  return {
    stablePrefix: text.slice(0, boundaryIndex).trimEnd(),
    dynamicSuffix: text.slice(boundaryIndex + 34).trimStart()
  };
}
function prependSystemPromptAdditionAfterCacheBoundary(params) {
  const systemPromptAddition = typeof params.systemPromptAddition === "string" ? (0, _promptCacheStabilityBMXERFfV.n)(params.systemPromptAddition) : "";
  if (!systemPromptAddition) return params.systemPrompt;
  const split = splitSystemPromptCacheBoundary(params.systemPrompt);
  if (!split) return `${systemPromptAddition}\n\n${params.systemPrompt}`;
  const dynamicSuffix = split.dynamicSuffix ? (0, _promptCacheStabilityBMXERFfV.n)(split.dynamicSuffix) : "";
  if (!dynamicSuffix) return `${split.stablePrefix}${SYSTEM_PROMPT_CACHE_BOUNDARY}${systemPromptAddition}`;
  return `${split.stablePrefix}${SYSTEM_PROMPT_CACHE_BOUNDARY}${systemPromptAddition}\n\n${dynamicSuffix}`;
}
//#endregion /* v9-c68e76a63f113898 */
