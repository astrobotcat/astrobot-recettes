"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = normalizeStructuredPromptSection;exports.t = normalizePromptCapabilityIds;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/agents/prompt-cache-stability.ts
function normalizeStructuredPromptSection(text) {
  return text.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "").trim();
}
function normalizePromptCapabilityIds(capabilities) {
  const seen = /* @__PURE__ */new Set();
  const normalized = [];
  for (const capability of capabilities) {
    const value = (0, _stringCoerceBUSzWgUA.i)(normalizeStructuredPromptSection(capability));
    if (!value || seen.has(value)) continue;
    seen.add(value);
    normalized.push(value);
  }
  return normalized.toSorted((left, right) => left.localeCompare(right));
}
//#endregion /* v9-1c002bcc8e80d1e7 */
