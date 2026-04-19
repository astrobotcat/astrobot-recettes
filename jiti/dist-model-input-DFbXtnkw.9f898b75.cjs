"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveAgentModelPrimaryValue;exports.r = toAgentModelListLike;exports.t = resolveAgentModelFallbackValues;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/config/model-input.ts
function resolveAgentModelPrimaryValue(model) {
  return (0, _stringCoerceBUSzWgUA.f)(model);
}
function resolveAgentModelFallbackValues(model) {
  if (!model || typeof model !== "object") return [];
  return Array.isArray(model.fallbacks) ? model.fallbacks : [];
}
function toAgentModelListLike(model) {
  if (typeof model === "string") {
    const primary = (0, _stringCoerceBUSzWgUA.s)(model);
    return primary ? { primary } : void 0;
  }
  if (!model || typeof model !== "object") return;
  return model;
}
//#endregion /* v9-d298e55dcc851d47 */
