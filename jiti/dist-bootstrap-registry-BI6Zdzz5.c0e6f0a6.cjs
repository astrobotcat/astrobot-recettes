"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = listChannelCatalogEntries;exports.i = listBundledChannelPluginIds;exports.n = getBootstrapChannelSecrets;exports.r = iterateBootstrapChannelPlugins;exports.t = getBootstrapChannelPlugin;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _manifestDKZWfJEu = require("./manifest-DKZWfJEu.js");
var _discoveryDGQFjH8F = require("./discovery-DGQFjH8F.js");
var _bundledCGMeVzvo = require("./bundled-CGMeVzvo.js");
//#region src/plugins/channel-catalog-registry.ts
function listChannelCatalogEntries(params = {}) {
  return (0, _discoveryDGQFjH8F.n)({
    workspaceDir: params.workspaceDir,
    env: params.env
  }).candidates.flatMap((candidate) => {
    if (params.origin && candidate.origin !== params.origin) return [];
    const channel = candidate.packageManifest?.channel;
    if (!channel?.id) return [];
    const manifest = (0, _manifestDKZWfJEu.i)(candidate.rootDir, candidate.origin !== "bundled");
    if (!manifest.ok) return [];
    return [{
      pluginId: manifest.manifest.id,
      origin: candidate.origin,
      packageName: candidate.packageName,
      workspaceDir: candidate.workspaceDir,
      rootDir: candidate.rootDir,
      channel,
      ...(candidate.packageManifest?.install ? { install: candidate.packageManifest.install } : {})
    }];
  });
}
//#endregion
//#region src/channels/plugins/bundled-ids.ts
const bundledChannelPluginIdsByRoot = /* @__PURE__ */new Map();
function listBundledChannelPluginIdsForRoot(packageRoot, env = process.env) {
  const cached = bundledChannelPluginIdsByRoot.get(packageRoot);
  if (cached) return [...cached];
  const loaded = listChannelCatalogEntries({
    origin: "bundled",
    env
  }).map((entry) => entry.pluginId).toSorted((left, right) => left.localeCompare(right));
  bundledChannelPluginIdsByRoot.set(packageRoot, loaded);
  return [...loaded];
}
function listBundledChannelPluginIds() {
  return listBundledChannelPluginIdsForRoot((0, _bundledCGMeVzvo._)().cacheKey);
}
//#endregion
//#region src/channels/plugins/bootstrap-registry.ts
const cachedBootstrapPluginsByRoot = /* @__PURE__ */new Map();
function resolveBootstrapChannelId(id) {
  return (0, _stringCoerceBUSzWgUA.s)(id) ?? "";
}
function mergePluginSection(runtimeValue, setupValue) {
  if (runtimeValue && setupValue && typeof runtimeValue === "object" && typeof setupValue === "object") {
    const merged = { ...runtimeValue };
    for (const [key, value] of Object.entries(setupValue)) if (value !== void 0) merged[key] = value;
    return { ...merged };
  }
  return setupValue ?? runtimeValue;
}
function mergeBootstrapPlugin(runtimePlugin, setupPlugin) {
  return {
    ...runtimePlugin,
    ...setupPlugin,
    meta: mergePluginSection(runtimePlugin.meta, setupPlugin.meta),
    capabilities: mergePluginSection(runtimePlugin.capabilities, setupPlugin.capabilities),
    commands: mergePluginSection(runtimePlugin.commands, setupPlugin.commands),
    doctor: mergePluginSection(runtimePlugin.doctor, setupPlugin.doctor),
    reload: mergePluginSection(runtimePlugin.reload, setupPlugin.reload),
    config: mergePluginSection(runtimePlugin.config, setupPlugin.config),
    setup: mergePluginSection(runtimePlugin.setup, setupPlugin.setup),
    messaging: mergePluginSection(runtimePlugin.messaging, setupPlugin.messaging),
    actions: mergePluginSection(runtimePlugin.actions, setupPlugin.actions),
    secrets: mergePluginSection(runtimePlugin.secrets, setupPlugin.secrets)
  };
}
function buildBootstrapPlugins(cacheKey, env = process.env) {
  return {
    sortedIds: listBundledChannelPluginIdsForRoot(cacheKey, env),
    byId: /* @__PURE__ */new Map(),
    secretsById: /* @__PURE__ */new Map(),
    missingIds: /* @__PURE__ */new Set()
  };
}
function getBootstrapPlugins(cacheKey = (0, _bundledCGMeVzvo._)().cacheKey, env = process.env) {
  const cached = cachedBootstrapPluginsByRoot.get(cacheKey);
  if (cached) return cached;
  const created = buildBootstrapPlugins(cacheKey, env);
  cachedBootstrapPluginsByRoot.set(cacheKey, created);
  return created;
}
function resolveActiveBootstrapPlugins() {
  return getBootstrapPlugins((0, _bundledCGMeVzvo._)().cacheKey);
}
function listBootstrapChannelPluginIds() {
  return resolveActiveBootstrapPlugins().sortedIds;
}
function* iterateBootstrapChannelPlugins() {
  for (const id of listBootstrapChannelPluginIds()) {
    const plugin = getBootstrapChannelPlugin(id);
    if (plugin) yield plugin;
  }
}
function getBootstrapChannelPlugin(id) {
  const resolvedId = resolveBootstrapChannelId(id);
  if (!resolvedId) return;
  const registry = resolveActiveBootstrapPlugins();
  const cached = registry.byId.get(resolvedId);
  if (cached) return cached;
  if (registry.missingIds.has(resolvedId)) return;
  const runtimePlugin = (0, _bundledCGMeVzvo.n)(resolvedId);
  const setupPlugin = (0, _bundledCGMeVzvo.i)(resolvedId);
  const merged = runtimePlugin && setupPlugin ? mergeBootstrapPlugin(runtimePlugin, setupPlugin) : setupPlugin ?? runtimePlugin;
  if (!merged) {
    registry.missingIds.add(resolvedId);
    return;
  }
  registry.byId.set(resolvedId, merged);
  return merged;
}
function getBootstrapChannelSecrets(id) {
  const resolvedId = resolveBootstrapChannelId(id);
  if (!resolvedId) return;
  const registry = resolveActiveBootstrapPlugins();
  const cached = registry.secretsById.get(resolvedId);
  if (cached) return cached;
  if (registry.secretsById.has(resolvedId)) return;
  const merged = mergePluginSection((0, _bundledCGMeVzvo.r)(resolvedId), (0, _bundledCGMeVzvo.a)(resolvedId));
  registry.secretsById.set(resolvedId, merged ?? null);
  return merged;
}
//#endregion /* v9-aa3f9120614f4fee */
