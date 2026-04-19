"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveNativeCommandsEnabled;exports.r = resolveNativeSkillsEnabled;exports.t = isNativeCommandsExplicitlyDisabled;var _registryDelpa74L = require("./registry-Delpa74L.js");
require("./plugins-D4ODSIPT.js");
//#region src/config/commands.ts
function resolveAutoDefault(providerId, kind) {
  const id = (0, _registryDelpa74L.i)(providerId);
  if (!id) return false;
  const plugin = (0, _registryDelpa74L.t)(id);
  if (!plugin) return false;
  if (kind === "native") return plugin.commands?.nativeCommandsAutoEnabled === true;
  return plugin.commands?.nativeSkillsAutoEnabled === true;
}
function resolveNativeSkillsEnabled(params) {
  return resolveNativeCommandSetting({
    ...params,
    kind: "nativeSkills"
  });
}
function resolveNativeCommandsEnabled(params) {
  return resolveNativeCommandSetting({
    ...params,
    kind: "native"
  });
}
function resolveNativeCommandSetting(params) {
  const { providerId, providerSetting, globalSetting, kind = "native" } = params;
  const setting = providerSetting === void 0 ? globalSetting : providerSetting;
  if (setting === true) return true;
  if (setting === false) return false;
  return resolveAutoDefault(providerId, kind);
}
function isNativeCommandsExplicitlyDisabled(params) {
  const { providerSetting, globalSetting } = params;
  if (providerSetting === false) return true;
  if (providerSetting === void 0) return globalSetting === false;
  return false;
}
//#endregion /* v9-ddb72f59b607b14f */
