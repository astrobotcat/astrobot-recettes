"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveNormalizedXaiToolModel;exports.r = resolvePositiveIntegerToolConfig;exports.t = coerceXaiToolConfig;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
require("./text-runtime-DTMxvodz.js");
var _modelIdBd0gtbaP = require("./model-id-Bd0gtbaP.js");
//#region extensions/xai/src/tool-config-shared.ts
function coerceXaiToolConfig(config) {
  return (0, _utilsD5DtWkEu.l)(config) ? config : {};
}
function resolveNormalizedXaiToolModel(params) {
  const value = coerceXaiToolConfig(params.config).model;
  return typeof value === "string" && value.trim() ? (0, _modelIdBd0gtbaP.t)(value.trim()) : params.defaultModel;
}
function resolvePositiveIntegerToolConfig(config, key) {
  const raw = coerceXaiToolConfig(config)[key];
  if (typeof raw !== "number" || !Number.isFinite(raw)) return;
  const normalized = Math.trunc(raw);
  return normalized > 0 ? normalized : void 0;
}
//#endregion /* v9-8caa296a4c9bf0d8 */
