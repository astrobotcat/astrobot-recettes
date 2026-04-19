"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = getLoadedChannelPluginForRead;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _runtimeChannelStateCKbFw7bt = require("./runtime-channel-state-CKbFw7bt.js");
//#region src/channels/plugins/registry-loaded-read.ts
function coerceLoadedChannelPlugin(plugin) {
  const id = (0, _stringCoerceBUSzWgUA.s)(plugin?.id) ?? "";
  if (!plugin || !id) return;
  if (!plugin.meta || typeof plugin.meta !== "object") plugin.meta = {};
  return plugin;
}
function getLoadedChannelPluginForRead(id) {
  const resolvedId = (0, _stringCoerceBUSzWgUA.s)(id) ?? "";
  if (!resolvedId) return;
  const registry = (0, _runtimeChannelStateCKbFw7bt.t)();
  if (!registry || !Array.isArray(registry.channels)) return;
  for (const entry of registry.channels) {
    const plugin = coerceLoadedChannelPlugin(entry?.plugin);
    if (plugin && plugin.id === resolvedId) return plugin;
  }
}
//#endregion /* v9-19ff1d174190d0cd */
