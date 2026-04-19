"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = listBundledChannelIdsWithPersistedAuthState;exports.r = hasBundledChannelPackageState;exports.t = hasBundledChannelPersistedAuthState;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _bootstrapRegistryBI6Zdzz = require("./bootstrap-registry-BI6Zdzz5.js");
var _bundledCGMeVzvo = require("./bundled-CGMeVzvo.js");
//#region src/channels/plugins/package-state-probes.ts
const log = (0, _subsystemCgmckbux.t)("channels");
const registryCache = /* @__PURE__ */new Map();
function resolveChannelPackageStateMetadata(entry, metadataKey) {
  const metadata = entry.channel[metadataKey];
  if (!metadata || typeof metadata !== "object") return null;
  const specifier = (0, _stringCoerceBUSzWgUA.s)(metadata.specifier) ?? "";
  const exportName = (0, _stringCoerceBUSzWgUA.s)(metadata.exportName) ?? "";
  if (!specifier || !exportName) return null;
  return {
    specifier,
    exportName
  };
}
function getChannelPackageStateRegistry(metadataKey) {
  const cached = registryCache.get(metadataKey);
  if (cached) return cached;
  const catalog = (0, _bootstrapRegistryBI6Zdzz.a)({ origin: "bundled" }).filter((entry) => Boolean(resolveChannelPackageStateMetadata(entry, metadataKey)));
  const registry = {
    catalog,
    entriesById: new Map(catalog.map((entry) => [entry.pluginId, entry])),
    checkerCache: /* @__PURE__ */new Map()
  };
  registryCache.set(metadataKey, registry);
  return registry;
}
function resolveChannelPackageStateChecker(params) {
  const registry = getChannelPackageStateRegistry(params.metadataKey);
  const cached = registry.checkerCache.get(params.entry.pluginId);
  if (cached !== void 0) return cached;
  const metadata = resolveChannelPackageStateMetadata(params.entry, params.metadataKey);
  if (!metadata) {
    registry.checkerCache.set(params.entry.pluginId, null);
    return null;
  }
  try {
    const checker = (0, _bundledCGMeVzvo.m)({
      modulePath: (0, _bundledCGMeVzvo.h)(params.entry.rootDir, metadata.specifier),
      rootDir: params.entry.rootDir,
      shouldTryNativeRequire: _bundledCGMeVzvo.p
    })[metadata.exportName];
    if (typeof checker !== "function") throw new Error(`missing ${params.metadataKey} export ${metadata.exportName}`);
    registry.checkerCache.set(params.entry.pluginId, checker);
    return checker;
  } catch (error) {
    const detail = (0, _errorsD8p6rxH.i)(error);
    log.warn(`[channels] failed to load ${params.metadataKey} checker for ${params.entry.pluginId}: ${detail}`);
    registry.checkerCache.set(params.entry.pluginId, null);
    return null;
  }
}
function listBundledChannelIdsForPackageState(metadataKey) {
  return getChannelPackageStateRegistry(metadataKey).catalog.map((entry) => entry.pluginId);
}
function hasBundledChannelPackageState(params) {
  const entry = getChannelPackageStateRegistry(params.metadataKey).entriesById.get(params.channelId);
  if (!entry) return false;
  const checker = resolveChannelPackageStateChecker({
    entry,
    metadataKey: params.metadataKey
  });
  return checker ? checker({
    cfg: params.cfg,
    env: params.env
  }) : false;
}
//#endregion
//#region src/channels/plugins/persisted-auth-state.ts
function listBundledChannelIdsWithPersistedAuthState() {
  return listBundledChannelIdsForPackageState("persistedAuthState");
}
function hasBundledChannelPersistedAuthState(params) {
  return hasBundledChannelPackageState({
    metadataKey: "persistedAuthState",
    channelId: params.channelId,
    cfg: params.cfg,
    env: params.env
  });
}
//#endregion /* v9-08b51c659a983e63 */
