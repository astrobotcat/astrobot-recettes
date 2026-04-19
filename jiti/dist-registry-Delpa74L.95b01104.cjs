"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = normalizeChannelId;exports.n = getLoadedChannelPlugin;exports.r = listChannelPlugins;exports.t = getChannelPlugin;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _bundledCGMeVzvo = require("./bundled-CGMeVzvo.js");
var _registryCENZffQG = require("./registry-CENZffQG.js");
var _registryLoadedC109837J = require("./registry-loaded-C109837J.js");
//#region src/channels/plugins/registry.ts
function listChannelPlugins() {
  return (0, _registryLoadedC109837J.n)();
}
function getLoadedChannelPlugin(id) {
  const resolvedId = (0, _stringCoerceBUSzWgUA.s)(id) ?? "";
  if (!resolvedId) return;
  return (0, _registryLoadedC109837J.t)(resolvedId);
}
function getChannelPlugin(id) {
  const resolvedId = (0, _stringCoerceBUSzWgUA.s)(id) ?? "";
  if (!resolvedId) return;
  return getLoadedChannelPlugin(resolvedId) ?? (0, _bundledCGMeVzvo.n)(resolvedId);
}
function normalizeChannelId(raw) {
  return (0, _registryCENZffQG.a)(raw);
}
//#endregion /* v9-9055b445987cad8d */
