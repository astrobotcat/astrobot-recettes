"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _pluginEntryBkat4og = require("../../plugin-entry-Bkat4og3.js");
require("../../api-BAgw3YcZ.js");
var _configCompatYtwHQvZS = require("../../config-compat-YtwHQvZS.js");
//#region extensions/memory-wiki/setup-api.ts
var setup_api_default = exports.default = (0, _pluginEntryBkat4og.t)({
  id: "memory-wiki",
  name: "Memory Wiki Setup",
  description: "Lightweight Memory Wiki setup hooks",
  register(api) {
    api.registerConfigMigration((config) => (0, _configCompatYtwHQvZS.n)(config));
  }
});
//#endregion /* v9-1461b6553e39588d */
