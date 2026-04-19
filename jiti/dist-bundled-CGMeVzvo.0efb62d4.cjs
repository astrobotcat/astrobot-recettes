"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports._ = resolveBundledChannelRootScope;exports.a = getBundledChannelSetupSecrets;exports.c = listBundledChannelPlugins;exports.d = requireBundledChannelPlugin;exports.f = setBundledChannelRuntime;exports.g = unwrapDefaultModuleExport;exports.h = resolveExistingPluginModulePath;exports.i = getBundledChannelSetupPlugin;exports.l = listBundledChannelSetupPlugins;exports.m = loadChannelPluginModule;exports.n = getBundledChannelPlugin;exports.o = hasBundledChannelEntryFeature;exports.p = isJavaScriptModulePath;exports.r = getBundledChannelSecrets;exports.s = listBundledChannelPluginIds;exports.t = getBundledChannelAccountInspector;exports.u = listBundledChannelSetupPluginsByFeature;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _openclawRootBNWw3cXT = require("./openclaw-root-BNWw3cXT.js");
var _bundledDirD4Wk35JT = require("./bundled-dir-D4Wk35JT.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _boundaryFileReadDXLy_w6L = require("./boundary-file-read-DXLy_w6L.js");
var _bundledPluginMetadataDaMNAHv = require("./bundled-plugin-metadata-Da-MNAHv.js");
var _jitiLoaderCacheD_0TILck = require("./jiti-loader-cache-D_0TILck.js");
var _nodeModule = require("node:module");
var _nodeUrl = require("node:url");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/channels/plugins/bundled-root.ts
const OPENCLAW_PACKAGE_ROOT = (0, _openclawRootBNWw3cXT.n)({
  argv1: process.argv[1],
  cwd: process.cwd(),
  moduleUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/bundled-CGMeVzvo.js".startsWith("file:") ? "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/bundled-CGMeVzvo.js" : void 0
}) ?? ("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/bundled-CGMeVzvo.js".startsWith("file:") ? _nodePath.default.resolve((0, _nodeUrl.fileURLToPath)(new URL("../../..", "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/bundled-CGMeVzvo.js"))) : process.cwd());
function derivePackageRootFromExtensionsDir(extensionsDir) {
  const parentDir = _nodePath.default.dirname(extensionsDir);
  const parentBase = _nodePath.default.basename(parentDir);
  if (parentBase === "dist" || parentBase === "dist-runtime") return _nodePath.default.dirname(parentDir);
  return parentDir;
}
function resolveBundledChannelRootScope(env = process.env) {
  const bundledPluginsDir = (0, _bundledDirD4Wk35JT.t)(env);
  if (!bundledPluginsDir) return {
    packageRoot: OPENCLAW_PACKAGE_ROOT,
    cacheKey: OPENCLAW_PACKAGE_ROOT
  };
  const resolvedPluginsDir = _nodePath.default.resolve(bundledPluginsDir);
  return {
    packageRoot: _nodePath.default.basename(resolvedPluginsDir) === "extensions" ? derivePackageRootFromExtensionsDir(resolvedPluginsDir) : resolvedPluginsDir,
    cacheKey: resolvedPluginsDir,
    pluginsDir: resolvedPluginsDir
  };
}
//#endregion
//#region src/plugins/bundled-channel-runtime.ts
function listBundledChannelPluginMetadata(params) {
  return (0, _bundledPluginMetadataDaMNAHv.n)(params);
}
function resolveBundledChannelGeneratedPath(rootDir, entry, pluginDirName, scanDir) {
  return (0, _bundledPluginMetadataDaMNAHv.r)(rootDir, entry, pluginDirName, scanDir);
}
//#endregion
//#region src/plugins/module-export.ts
function unwrapDefaultModuleExport(moduleExport) {
  let resolved = moduleExport;
  const seen = /* @__PURE__ */new Set();
  while (resolved && typeof resolved === "object" && "default" in resolved && !seen.has(resolved)) {
    seen.add(resolved);
    resolved = resolved.default;
  }
  return resolved;
}
//#endregion
//#region src/channels/plugins/module-loader.ts
const nodeRequire = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/bundled-CGMeVzvo.js");
function createModuleLoader() {
  const jitiLoaders = /* @__PURE__ */new Map();
  return (modulePath) => {
    return (0, _jitiLoaderCacheD_0TILck.t)({
      cache: jitiLoaders,
      modulePath,
      importerUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/bundled-CGMeVzvo.js",
      argvEntry: process.argv[1],
      preferBuiltDist: true,
      jitiFilename: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/bundled-CGMeVzvo.js"
    });
  };
}
let loadModule = createModuleLoader();
function isJavaScriptModulePath(modulePath) {
  return [
  ".js",
  ".mjs",
  ".cjs"].
  includes((0, _stringCoerceBUSzWgUA.i)(_nodePath.default.extname(modulePath)));
}
function resolvePluginModuleCandidates(rootDir, specifier) {
  const normalizedSpecifier = specifier.replace(/\\/g, "/");
  const resolvedPath = _nodePath.default.resolve(rootDir, normalizedSpecifier);
  if (_nodePath.default.extname(resolvedPath)) return [resolvedPath];
  return [
  resolvedPath,
  `${resolvedPath}.ts`,
  `${resolvedPath}.mts`,
  `${resolvedPath}.js`,
  `${resolvedPath}.mjs`,
  `${resolvedPath}.cts`,
  `${resolvedPath}.cjs`];

}
function resolveExistingPluginModulePath(rootDir, specifier) {
  for (const candidate of resolvePluginModuleCandidates(rootDir, specifier)) if (_nodeFs.default.existsSync(candidate)) return candidate;
  return _nodePath.default.resolve(rootDir, specifier);
}
function loadChannelPluginModule(params) {
  const opened = (0, _boundaryFileReadDXLy_w6L.i)({
    absolutePath: params.modulePath,
    rootPath: params.boundaryRootDir ?? params.rootDir,
    boundaryLabel: params.boundaryLabel ?? "plugin root",
    rejectHardlinks: false,
    skipLexicalRootCheck: true
  });
  if (!opened.ok) throw new Error(`${params.boundaryLabel ?? "plugin"} module path escapes plugin root or fails alias checks`);
  const safePath = opened.path;
  _nodeFs.default.closeSync(opened.fd);
  if (process.platform === "win32" && params.shouldTryNativeRequire?.(safePath)) try {
    return nodeRequire(safePath);
  } catch {}
  return loadModule(safePath)(safePath);
}
//#endregion
//#region src/channels/plugins/bundled.ts
const log = (0, _subsystemCgmckbux.t)("channels");
function resolveChannelPluginModuleEntry(moduleExport) {
  const resolved = unwrapDefaultModuleExport(moduleExport);
  if (!resolved || typeof resolved !== "object") return null;
  const record = resolved;
  if (record.kind !== "bundled-channel-entry") return null;
  if (typeof record.id !== "string" || typeof record.name !== "string" || typeof record.description !== "string" || typeof record.register !== "function" || typeof record.loadChannelPlugin !== "function") return null;
  return record;
}
function resolveChannelSetupModuleEntry(moduleExport) {
  const resolved = unwrapDefaultModuleExport(moduleExport);
  if (!resolved || typeof resolved !== "object") return null;
  const record = resolved;
  if (record.kind !== "bundled-channel-setup-entry") return null;
  if (typeof record.loadSetupPlugin !== "function") return null;
  return record;
}
function hasSetupEntryFeature(entry, feature) {
  return entry?.features?.[feature] === true;
}
function hasChannelEntryFeature(entry, feature) {
  return entry?.features?.[feature] === true;
}
function resolveBundledChannelBoundaryRoot(params) {
  const overrideRoot = params.pluginsDir ? _nodePath.default.resolve(params.pluginsDir, params.metadata.dirName) : null;
  if (overrideRoot && (params.modulePath === overrideRoot || params.modulePath.startsWith(`${overrideRoot}${_nodePath.default.sep}`))) return overrideRoot;
  const distRoot = _nodePath.default.resolve(params.packageRoot, "dist", "extensions", params.metadata.dirName);
  if (params.modulePath === distRoot || params.modulePath.startsWith(`${distRoot}${_nodePath.default.sep}`)) return distRoot;
  return _nodePath.default.resolve(params.packageRoot, "extensions", params.metadata.dirName);
}
function resolveBundledChannelScanDir(rootScope) {
  return rootScope.pluginsDir;
}
function resolveGeneratedBundledChannelModulePath(params) {
  if (!params.entry) return null;
  return resolveBundledChannelGeneratedPath(params.rootScope.packageRoot, params.entry, params.metadata.dirName, resolveBundledChannelScanDir(params.rootScope));
}
function loadGeneratedBundledChannelModule(params) {
  const modulePath = resolveGeneratedBundledChannelModulePath(params);
  if (!modulePath) throw new Error(`missing generated module for bundled channel ${params.metadata.manifest.id}`);
  const scanDir = resolveBundledChannelScanDir(params.rootScope);
  const boundaryRoot = resolveBundledChannelBoundaryRoot({
    packageRoot: params.rootScope.packageRoot,
    ...(scanDir ? { pluginsDir: scanDir } : {}),
    metadata: params.metadata,
    modulePath
  });
  return loadChannelPluginModule({
    modulePath,
    rootDir: boundaryRoot,
    boundaryRootDir: boundaryRoot,
    shouldTryNativeRequire: (safePath) => safePath.includes(`${_nodePath.default.sep}dist${_nodePath.default.sep}`) && isJavaScriptModulePath(safePath)
  });
}
function loadGeneratedBundledChannelEntry(params) {
  try {
    const entry = resolveChannelPluginModuleEntry(loadGeneratedBundledChannelModule({
      rootScope: params.rootScope,
      metadata: params.metadata,
      entry: params.metadata.source
    }));
    if (!entry) {
      log.warn(`[channels] bundled channel entry ${params.metadata.manifest.id} missing bundled-channel-entry contract; skipping`);
      return null;
    }
    const setupEntry = params.includeSetup && params.metadata.setupSource ? resolveChannelSetupModuleEntry(loadGeneratedBundledChannelModule({
      rootScope: params.rootScope,
      metadata: params.metadata,
      entry: params.metadata.setupSource
    })) : null;
    return {
      id: params.metadata.manifest.id,
      entry,
      ...(setupEntry ? { setupEntry } : {})
    };
  } catch (error) {
    const detail = (0, _errorsD8p6rxH.i)(error);
    log.warn(`[channels] failed to load bundled channel ${params.metadata.manifest.id}: ${detail}`);
    return null;
  }
}
const cachedBundledChannelMetadata = /* @__PURE__ */new Map();
const bundledChannelCacheContexts = /* @__PURE__ */new Map();
function createBundledChannelCacheContext() {
  return {
    pluginLoadInProgressIds: /* @__PURE__ */new Set(),
    setupPluginLoadInProgressIds: /* @__PURE__ */new Set(),
    entryLoadInProgressIds: /* @__PURE__ */new Set(),
    lazyEntriesById: /* @__PURE__ */new Map(),
    lazyPluginsById: /* @__PURE__ */new Map(),
    lazySetupPluginsById: /* @__PURE__ */new Map(),
    lazySecretsById: /* @__PURE__ */new Map(),
    lazySetupSecretsById: /* @__PURE__ */new Map(),
    lazyAccountInspectorsById: /* @__PURE__ */new Map()
  };
}
function getBundledChannelCacheContext(cacheKey) {
  const cached = bundledChannelCacheContexts.get(cacheKey);
  if (cached) return cached;
  const created = createBundledChannelCacheContext();
  bundledChannelCacheContexts.set(cacheKey, created);
  return created;
}
function resolveActiveBundledChannelCacheScope() {
  const rootScope = resolveBundledChannelRootScope();
  return {
    rootScope,
    cacheContext: getBundledChannelCacheContext(rootScope.cacheKey)
  };
}
function listBundledChannelMetadata(rootScope = resolveBundledChannelRootScope()) {
  const cached = cachedBundledChannelMetadata.get(rootScope.cacheKey);
  if (cached) return cached;
  const scanDir = resolveBundledChannelScanDir(rootScope);
  const loaded = listBundledChannelPluginMetadata({
    rootDir: rootScope.packageRoot,
    ...(scanDir ? { scanDir } : {}),
    includeChannelConfigs: false,
    includeSyntheticChannelConfigs: false
  }).filter((metadata) => (metadata.manifest.channels?.length ?? 0) > 0);
  cachedBundledChannelMetadata.set(rootScope.cacheKey, loaded);
  return loaded;
}
function listBundledChannelPluginIdsForRoot(rootScope) {
  return listBundledChannelMetadata(rootScope).map((metadata) => metadata.manifest.id).toSorted((left, right) => left.localeCompare(right));
}
function listBundledChannelPluginIds() {
  return listBundledChannelPluginIdsForRoot(resolveBundledChannelRootScope());
}
function resolveBundledChannelMetadata(id, rootScope) {
  return listBundledChannelMetadata(rootScope).find((metadata) => metadata.manifest.id === id || metadata.manifest.channels?.includes(id));
}
function getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext, params) {
  const cached = cacheContext.lazyEntriesById.get(id);
  if (cached && (!params?.includeSetup || cached.setupEntry)) return cached;
  if (cached === null && !params?.includeSetup) return null;
  const metadata = resolveBundledChannelMetadata(id, rootScope);
  if (!metadata) {
    cacheContext.lazyEntriesById.set(id, null);
    return null;
  }
  if (cacheContext.entryLoadInProgressIds.has(id)) return null;
  cacheContext.entryLoadInProgressIds.add(id);
  try {
    const entry = loadGeneratedBundledChannelEntry({
      rootScope,
      metadata,
      includeSetup: params?.includeSetup === true
    });
    cacheContext.lazyEntriesById.set(id, entry);
    if (entry?.entry.id && entry.entry.id !== id) cacheContext.lazyEntriesById.set(entry.entry.id, entry);
    return entry;
  } finally {
    cacheContext.entryLoadInProgressIds.delete(id);
  }
}
function getBundledChannelPluginForRoot(id, rootScope, cacheContext) {
  const cached = cacheContext.lazyPluginsById.get(id);
  if (cached) return cached;
  if (cacheContext.pluginLoadInProgressIds.has(id)) return;
  const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
  if (!entry) return;
  cacheContext.pluginLoadInProgressIds.add(id);
  try {
    const plugin = entry.loadChannelPlugin();
    cacheContext.lazyPluginsById.set(id, plugin);
    return plugin;
  } finally {
    cacheContext.pluginLoadInProgressIds.delete(id);
  }
}
function getBundledChannelSecretsForRoot(id, rootScope, cacheContext) {
  if (cacheContext.lazySecretsById.has(id)) return cacheContext.lazySecretsById.get(id) ?? void 0;
  const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
  if (!entry) return;
  const secrets = entry.loadChannelSecrets?.() ?? getBundledChannelPluginForRoot(id, rootScope, cacheContext)?.secrets;
  cacheContext.lazySecretsById.set(id, secrets ?? null);
  return secrets;
}
function getBundledChannelAccountInspectorForRoot(id, rootScope, cacheContext) {
  if (cacheContext.lazyAccountInspectorsById.has(id)) return cacheContext.lazyAccountInspectorsById.get(id) ?? void 0;
  const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
  if (!entry?.loadChannelAccountInspector) {
    cacheContext.lazyAccountInspectorsById.set(id, null);
    return;
  }
  const inspector = entry.loadChannelAccountInspector();
  cacheContext.lazyAccountInspectorsById.set(id, inspector);
  return inspector;
}
function getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext) {
  const cached = cacheContext.lazySetupPluginsById.get(id);
  if (cached) return cached;
  if (cacheContext.setupPluginLoadInProgressIds.has(id)) return;
  const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext, { includeSetup: true })?.setupEntry;
  if (!entry) return;
  cacheContext.setupPluginLoadInProgressIds.add(id);
  try {
    const plugin = entry.loadSetupPlugin();
    cacheContext.lazySetupPluginsById.set(id, plugin);
    return plugin;
  } finally {
    cacheContext.setupPluginLoadInProgressIds.delete(id);
  }
}
function getBundledChannelSetupSecretsForRoot(id, rootScope, cacheContext) {
  if (cacheContext.lazySetupSecretsById.has(id)) return cacheContext.lazySetupSecretsById.get(id) ?? void 0;
  const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext, { includeSetup: true })?.setupEntry;
  if (!entry) return;
  const secrets = entry.loadSetupSecrets?.() ?? getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext)?.secrets;
  cacheContext.lazySetupSecretsById.set(id, secrets ?? null);
  return secrets;
}
function listBundledChannelPlugins() {
  const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
  return listBundledChannelPluginIdsForRoot(rootScope).flatMap((id) => {
    const plugin = getBundledChannelPluginForRoot(id, rootScope, cacheContext);
    return plugin ? [plugin] : [];
  });
}
function listBundledChannelSetupPlugins() {
  const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
  return listBundledChannelPluginIdsForRoot(rootScope).flatMap((id) => {
    const plugin = getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext);
    return plugin ? [plugin] : [];
  });
}
function listBundledChannelSetupPluginsByFeature(feature) {
  const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
  return listBundledChannelPluginIdsForRoot(rootScope).flatMap((id) => {
    const setupEntry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext, { includeSetup: true })?.setupEntry;
    if (!hasSetupEntryFeature(setupEntry, feature)) return [];
    const plugin = getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext);
    return plugin ? [plugin] : [];
  });
}
function hasBundledChannelEntryFeature(id, feature) {
  const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
  const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
  return hasChannelEntryFeature(entry, feature);
}
function getBundledChannelAccountInspector(id) {
  const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
  return getBundledChannelAccountInspectorForRoot(id, rootScope, cacheContext);
}
function getBundledChannelPlugin(id) {
  const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
  return getBundledChannelPluginForRoot(id, rootScope, cacheContext);
}
function getBundledChannelSecrets(id) {
  const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
  return getBundledChannelSecretsForRoot(id, rootScope, cacheContext);
}
function getBundledChannelSetupPlugin(id) {
  const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
  return getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext);
}
function getBundledChannelSetupSecrets(id) {
  const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
  return getBundledChannelSetupSecretsForRoot(id, rootScope, cacheContext);
}
function requireBundledChannelPlugin(id) {
  const plugin = getBundledChannelPlugin(id);
  if (!plugin) throw new Error(`missing bundled channel plugin: ${id}`);
  return plugin;
}
function setBundledChannelRuntime(id, runtime) {
  const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
  const setter = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry.setChannelRuntime;
  if (!setter) throw new Error(`missing bundled channel runtime setter: ${id}`);
  setter(runtime);
}
//#endregion /* v9-e565ae28cd6244c2 */
