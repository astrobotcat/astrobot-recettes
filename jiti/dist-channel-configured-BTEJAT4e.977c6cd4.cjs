"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = normalizePluginIdScope;exports.i = hasNonEmptyPluginIdScope;exports.n = createPluginIdScopeSet;exports.o = serializePluginIdScope;exports.r = hasExplicitPluginIdScope;exports.t = isChannelConfigured;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _bootstrapRegistryBI6Zdzz = require("./bootstrap-registry-BI6Zdzz5.js");
var _persistedAuthStateBkBSoJRA = require("./persisted-auth-state-BkBSoJRA.js");
require("./channel-target-Du58lo8P.js");
//#region src/plugins/plugin-scope.ts
function normalizePluginIdScope(ids) {
  if (ids === void 0) return;
  return Array.from(new Set(ids.filter((id) => typeof id === "string").map((id) => id.trim()).filter(Boolean))).toSorted();
}
function hasExplicitPluginIdScope(ids) {
  return ids !== void 0;
}
function hasNonEmptyPluginIdScope(ids) {
  return ids !== void 0 && ids.length > 0;
}
function createPluginIdScopeSet(ids) {
  if (ids === void 0) return null;
  return new Set(ids);
}
function serializePluginIdScope(ids) {
  return ids === void 0 ? "__unscoped__" : JSON.stringify(ids);
}
//#endregion
//#region src/channels/plugins/configured-state.ts
function hasBundledChannelConfiguredState(params) {
  return (0, _persistedAuthStateBkBSoJRA.r)({
    metadataKey: "configuredState",
    channelId: params.channelId,
    cfg: params.cfg,
    env: params.env
  });
}
//#endregion
//#region src/config/channel-configured-shared.ts
function resolveChannelConfigRecord(cfg, channelId) {
  const entry = cfg.channels?.[channelId];
  return (0, _utilsD5DtWkEu.l)(entry) ? entry : null;
}
function hasMeaningfulChannelConfigShallow(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return false;
  return Object.keys(value).some((key) => key !== "enabled");
}
//#endregion
//#region src/config/channel-configured.ts
function isChannelConfigured(cfg, channelId, env = process.env) {
  if (hasMeaningfulChannelConfigShallow(resolveChannelConfigRecord(cfg, channelId))) return true;
  if (hasBundledChannelConfiguredState({
    channelId,
    cfg,
    env
  })) return true;
  if ((0, _persistedAuthStateBkBSoJRA.t)({
    channelId,
    cfg,
    env
  })) return true;
  const plugin = (0, _bootstrapRegistryBI6Zdzz.t)(channelId);
  return Boolean(plugin?.config?.hasConfiguredState?.({
    cfg,
    env
  }));
}
//#endregion /* v9-4b5235bda2e4536a */
