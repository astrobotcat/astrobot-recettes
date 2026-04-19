"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _pluginEntryBkat4og = require("../../plugin-entry-Bkat4og3.js");
var _cliBackendSl9e48XC = require("../../cli-backend-Sl9e48XC.js");
//#region extensions/anthropic/setup-api.ts
var setup_api_default = exports.default = (0, _pluginEntryBkat4og.t)({
  id: "anthropic",
  name: "Anthropic Setup",
  description: "Lightweight Anthropic setup hooks",
  register(api) {
    api.registerCliBackend((0, _cliBackendSl9e48XC.t)());
  }
});
//#endregion /* v9-3eae5747cbffb79c */
