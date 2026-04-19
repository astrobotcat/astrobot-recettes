"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _stringCoerceBUSzWgUA = require("../../string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("../../utils-D5DtWkEu.js");
require("../../text-runtime-DTMxvodz.js");
var _pluginEntryBkat4og = require("../../plugin-entry-Bkat4og3.js");
require("../../record-shared-DQoQZOFY.js");
//#region extensions/browser/setup-api.ts
function listContainsBrowser(value) {
  return Array.isArray(value) && value.some((entry) => (0, _stringCoerceBUSzWgUA.o)(entry) === "browser");
}
function toolPolicyReferencesBrowser(value) {
  return (0, _utilsD5DtWkEu.l)(value) && (listContainsBrowser(value.allow) || listContainsBrowser(value.alsoAllow));
}
function hasBrowserToolReference(config) {
  if (toolPolicyReferencesBrowser(config.tools)) return true;
  const agentList = config.agents?.list;
  return Array.isArray(agentList) ? agentList.some((entry) => (0, _utilsD5DtWkEu.l)(entry) && toolPolicyReferencesBrowser(entry.tools)) : false;
}
var setup_api_default = exports.default = (0, _pluginEntryBkat4og.t)({
  id: "browser",
  name: "Browser Setup",
  description: "Lightweight Browser setup hooks",
  register(api) {
    api.registerAutoEnableProbe(({ config }) => {
      if (config.browser?.enabled === false || config.plugins?.entries?.browser?.enabled === false) return null;
      if (Object.prototype.hasOwnProperty.call(config, "browser")) return "browser configured";
      if (config.plugins?.entries && Object.prototype.hasOwnProperty.call(config.plugins.entries, "browser")) return "browser plugin configured";
      if (hasBrowserToolReference(config)) return "browser tool referenced";
      return null;
    });
  }
});
//#endregion /* v9-9ede5bbad3ed637b */
