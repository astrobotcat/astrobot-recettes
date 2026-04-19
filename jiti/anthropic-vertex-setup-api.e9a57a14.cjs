"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _pluginEntryBkat4og = require("../../plugin-entry-Bkat4og3.js");
var _regionCanK2Bay = require("../../region-CanK2Bay.js");
//#region extensions/anthropic-vertex/setup-api.ts
var setup_api_default = exports.default = (0, _pluginEntryBkat4og.t)({
  id: "anthropic-vertex",
  name: "Anthropic Vertex Setup",
  description: "Lightweight Anthropic Vertex setup hooks",
  register(api) {
    api.registerProvider({
      id: "anthropic-vertex",
      label: "Anthropic Vertex",
      auth: [],
      resolveConfigApiKey: ({ env }) => (0, _regionCanK2Bay.i)(env)
    });
  }
});
//#endregion /* v9-cbff4b4d1c6616a2 */
