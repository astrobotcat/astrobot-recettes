"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveDefaultModel;var _modelSelectionCTdyYoio = require("./model-selection-CTdyYoio.js");
//#region src/auto-reply/reply/directive-handling.defaults.ts
function resolveDefaultModel(params) {
  const mainModel = (0, _modelSelectionCTdyYoio.f)({
    cfg: params.cfg,
    agentId: params.agentId
  });
  const defaultProvider = mainModel.provider;
  return {
    defaultProvider,
    defaultModel: mainModel.model,
    aliasIndex: (0, _modelSelectionCTdyYoio.i)({
      cfg: params.cfg,
      defaultProvider
    })
  };
}
//#endregion /* v9-d6ab43168403eaa1 */
