"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _cliBackend = require("./cli-backend.js");
var _pluginEntry = require("openclaw/plugin-sdk/plugin-entry");
//#region extensions/google/setup-api.ts
var setup_api_default = exports.default = (0, _pluginEntry.definePluginEntry)({
  id: "google",
  name: "Google Setup",
  description: "Lightweight Google setup hooks",
  register(api) {
    api.registerCliBackend((0, _cliBackend.buildGoogleGeminiCliBackend)());
  }
});
//#endregion /* v9-89865c9196b331ec */
