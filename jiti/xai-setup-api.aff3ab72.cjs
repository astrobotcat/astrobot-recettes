"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _utilsD5DtWkEu = require("../../utils-D5DtWkEu.js");
var _pluginEntryBkat4og = require("../../plugin-entry-Bkat4og3.js");
require("../../tool-config-shared-DY2e2EAe.js");
//#region extensions/xai/setup-api.ts
var setup_api_default = exports.default = (0, _pluginEntryBkat4og.t)({
  id: "xai",
  name: "xAI Setup",
  description: "Lightweight xAI setup hooks",
  register(api) {
    api.registerAutoEnableProbe(({ config }) => {
      const pluginConfig = config.plugins?.entries?.xai?.config;
      const web = config.tools?.web;
      if ((0, _utilsD5DtWkEu.l)(web?.x_search) || (0, _utilsD5DtWkEu.l)(pluginConfig) && ((0, _utilsD5DtWkEu.l)(pluginConfig.xSearch) || (0, _utilsD5DtWkEu.l)(pluginConfig.codeExecution))) return "xai tool configured";
      return null;
    });
  }
});
//#endregion /* v9-e81680e2b9396e82 */
