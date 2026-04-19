"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _pluginEntryBkat4og = require("../../plugin-entry-Bkat4og3.js");
var _cliBackendGBOMQFPa = require("../../cli-backend-gBOMQFPa.js");
//#region extensions/openai/setup-api.ts
var setup_api_default = exports.default = (0, _pluginEntryBkat4og.t)({
  id: "openai",
  name: "OpenAI Setup",
  description: "Lightweight OpenAI setup hooks",
  register(api) {
    api.registerCliBackend((0, _cliBackendGBOMQFPa.t)());
  }
});
//#endregion /* v9-de27525dc33b0e04 */
