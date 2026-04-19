"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _stringCoerceBUSzWgUA = require("../../string-coerce-BUSzWgUA.js");
require("../../text-runtime-DTMxvodz.js");
var _pluginEntryBkat4og = require("../../plugin-entry-Bkat4og3.js");
//#region extensions/acpx/setup-api.ts
var setup_api_default = exports.default = (0, _pluginEntryBkat4og.t)({
  id: "acpx",
  name: "ACPX Setup",
  description: "Lightweight ACPX setup hooks",
  register(api) {
    api.registerAutoEnableProbe(({ config }) => {
      const backendRaw = (0, _stringCoerceBUSzWgUA.i)(config.acp?.backend);
      return (config.acp?.enabled === true || config.acp?.dispatch?.enabled === true || backendRaw === "acpx") && (!backendRaw || backendRaw === "acpx") ? "ACP runtime configured" : null;
    });
  }
});
//#endregion /* v9-921ae7d00467808f */
