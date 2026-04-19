"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = prepareModelForSimpleCompletion;var _anthropicVertexStreamBpkPWKP = require("./anthropic-vertex-stream-BpkPWKP9.js");
var _piAi = require("@mariozechner/pi-ai");
//#region src/agents/simple-completion-transport.ts
function resolveAnthropicVertexSimpleApi(baseUrl) {
  return `openclaw-anthropic-vertex-simple:${baseUrl?.trim() ? encodeURIComponent(baseUrl.trim()) : "default"}`;
}
function prepareModelForSimpleCompletion(params) {
  const { model, cfg } = params;
  if (!(0, _piAi.getApiProvider)(model.api) && (0, _anthropicVertexStreamBpkPWKP.n)({
    model,
    cfg
  })) return model;
  const transportAwareModel = (0, _anthropicVertexStreamBpkPWKP.o)(model);
  if (transportAwareModel !== model) {
    const streamFn = (0, _anthropicVertexStreamBpkPWKP.i)(model);
    if (streamFn) {
      (0, _anthropicVertexStreamBpkPWKP.r)(transportAwareModel.api, streamFn);
      return transportAwareModel;
    }
  }
  if (model.provider === "anthropic-vertex") {
    const api = resolveAnthropicVertexSimpleApi(model.baseUrl);
    (0, _anthropicVertexStreamBpkPWKP.r)(api, (0, _anthropicVertexStreamBpkPWKP.t)(model));
    return {
      ...model,
      api
    };
  }
  return model;
}
//#endregion /* v9-e4da3715f5422213 */
