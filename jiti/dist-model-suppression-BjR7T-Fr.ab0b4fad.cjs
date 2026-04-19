"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = shouldSuppressBuiltInModel;exports.t = buildSuppressedBuiltInModelError;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _providerRuntimeKhVgWetm = require("./provider-runtime-khVgWetm.js");
//#region src/agents/model-suppression.ts
function resolveBuiltInModelSuppression(params) {
  const provider = (0, _providerIdKaStHhRz.r)(params.provider ?? "");
  const modelId = (0, _stringCoerceBUSzWgUA.i)(params.id);
  if (!provider || !modelId) return;
  return (0, _providerRuntimeKhVgWetm.E)({
    ...(params.config ? { config: params.config } : {}),
    env: process.env,
    context: {
      ...(params.config ? { config: params.config } : {}),
      env: process.env,
      provider,
      modelId,
      ...(params.baseUrl ? { baseUrl: params.baseUrl } : {})
    }
  });
}
function shouldSuppressBuiltInModel(params) {
  return resolveBuiltInModelSuppression(params)?.suppress ?? false;
}
function buildSuppressedBuiltInModelError(params) {
  return resolveBuiltInModelSuppression(params)?.errorMessage;
}
//#endregion /* v9-6b73250533cf81d2 */
