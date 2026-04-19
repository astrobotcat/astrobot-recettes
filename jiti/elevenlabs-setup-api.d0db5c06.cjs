"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _pluginEntryBkat4og = require("../../plugin-entry-Bkat4og3.js");
var _configCompatBEIg4LJX = require("../../config-compat-BEIg4LJX.js");
//#region extensions/elevenlabs/setup-api.ts
var setup_api_default = exports.default = (0, _pluginEntryBkat4og.t)({
  id: "elevenlabs",
  name: "ElevenLabs Setup",
  description: "Lightweight ElevenLabs setup hooks",
  register(api) {
    api.registerConfigMigration((config) => (0, _configCompatBEIg4LJX.n)(config));
  }
});
//#endregion /* v9-7df83ba186fcbe98 */
