"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.applyConfigDefaults = applyConfigDefaults;exports.normalizeConfig = normalizeConfig;var _configDefaultsBTfbVwym = require("../../config-defaults-BTfbVwym.js");
//#region extensions/anthropic/provider-policy-api.ts
function normalizeConfig(params) {
  return (0, _configDefaultsBTfbVwym.n)(params.providerConfig);
}
function applyConfigDefaults(params) {
  return (0, _configDefaultsBTfbVwym.t)(params);
}
//#endregion /* v9-e2725cbe7db5b73d */
