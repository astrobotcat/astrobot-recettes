"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = defineBundledChannelSetupEntry;exports.r = loadBundledEntryExportSync;exports.t = defineBundledChannelEntry;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _boundaryFileReadDXLy_w6L = require("./boundary-file-read-DXLy_w6L.js");
var _configSchemaSgVTuroC = require("./config-schema-sgVTuroC.js");
var _sdkAliasW29OTN9p = require("./sdk-alias-w29OTN9p.js");
var _jitiLoaderCacheD_0TILck = require("./jiti-loader-cache-D_0TILck.js");
var _nodeModule = require("node:module");
var _nodeUrl = require("node:url");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugin-sdk/channel-entry-contract.ts
const nodeRequire = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/channel-entry-contract-mcFqxQzW.js");
const jitiLoaders = /* @__PURE__ */new Map();
const loadedModuleExports = /* @__PURE__ */new Map();
const disableBundledEntrySourceFallbackEnv = "OPENCLAW_DISABLE_BUNDLED_ENTRY_SOURCE_FALLBACK";
function isTruthyEnvFlag(value) {
  return value !== void 0 && !/^(?:0|false)$/iu.test(value.trim());
}
function resolveSpecifierCandidates(modulePath) {
  const ext = (0, _stringCoerceBUSzWgUA.i)(_nodePath.default.extname(modulePath));
  if (ext === ".js") return [modulePath, modulePath.slice(0, -3) + ".ts"];
  if (ext === ".mjs") return [modulePath, modulePath.slice(0, -4) + ".mts"];
  if (ext === ".cjs") return [modulePath, modulePath.slice(0, -4) + ".cts"];
  return [modulePath];
}
function resolveEntryBoundaryRoot(importMetaUrl) {
  return _nodePath.default.dirname((0, _nodeUrl.fileURLToPath)(importMetaUrl));
}
function addBundledEntryCandidates(candidates, basePath, boundaryRoot) {
  for (const candidate of resolveSpecifierCandidates(basePath)) {
    if (candidates.some((entry) => entry.path === candidate && entry.boundaryRoot === boundaryRoot)) continue;
    candidates.push({
      path: candidate,
      boundaryRoot
    });
  }
}
function resolveBundledEntryModuleCandidates(importMetaUrl, specifier) {
  const importerPath = (0, _nodeUrl.fileURLToPath)(importMetaUrl);
  const importerDir = _nodePath.default.dirname(importerPath);
  const boundaryRoot = resolveEntryBoundaryRoot(importMetaUrl);
  const candidates = [];
  addBundledEntryCandidates(candidates, _nodePath.default.resolve(importerDir, specifier), boundaryRoot);
  const sourceRelativeSpecifier = specifier.replace(/^\.\/src\//u, "./");
  if (sourceRelativeSpecifier !== specifier) addBundledEntryCandidates(candidates, _nodePath.default.resolve(importerDir, sourceRelativeSpecifier), boundaryRoot);
  const packageRoot = (0, _sdkAliasW29OTN9p.l)({
    modulePath: importerPath,
    moduleUrl: importMetaUrl,
    cwd: importerDir,
    argv1: process.argv[1]
  });
  if (!packageRoot) return candidates;
  const distExtensionsRoot = _nodePath.default.join(packageRoot, "dist", "extensions") + _nodePath.default.sep;
  if (!importerPath.startsWith(distExtensionsRoot)) return candidates;
  if (isTruthyEnvFlag(process.env[disableBundledEntrySourceFallbackEnv])) return candidates;
  const pluginDirName = _nodePath.default.basename(importerDir);
  const sourcePluginRoot = _nodePath.default.join(packageRoot, "extensions", pluginDirName);
  if (sourcePluginRoot === boundaryRoot) return candidates;
  addBundledEntryCandidates(candidates, _nodePath.default.resolve(sourcePluginRoot, specifier), sourcePluginRoot);
  if (sourceRelativeSpecifier !== specifier) addBundledEntryCandidates(candidates, _nodePath.default.resolve(sourcePluginRoot, sourceRelativeSpecifier), sourcePluginRoot);
  return candidates;
}
function formatBundledEntryUnknownError(error) {
  if (typeof error === "string") return error;
  if (error === void 0) return "boundary validation failed";
  try {
    return JSON.stringify(error);
  } catch {
    return "non-serializable error";
  }
}
function formatBundledEntryModuleOpenFailure(params) {
  const importerPath = (0, _nodeUrl.fileURLToPath)(params.importMetaUrl);
  const errorDetail = params.failure.error instanceof Error ? params.failure.error.message : formatBundledEntryUnknownError(params.failure.error);
  return [
  `bundled plugin entry "${params.specifier}" failed to open`,
  `from "${importerPath}"`,
  `(resolved "${params.resolvedPath}", plugin root "${params.boundaryRoot}",`,
  `reason "${params.failure.reason}"): ${errorDetail}`].
  join(" ");
}
function resolveBundledEntryModulePath(importMetaUrl, specifier) {
  const candidates = resolveBundledEntryModuleCandidates(importMetaUrl, specifier);
  const fallbackCandidate = candidates[0] ?? {
    path: _nodePath.default.resolve(_nodePath.default.dirname((0, _nodeUrl.fileURLToPath)(importMetaUrl)), specifier),
    boundaryRoot: resolveEntryBoundaryRoot(importMetaUrl)
  };
  let firstFailure = null;
  for (const candidate of candidates) {
    const opened = (0, _boundaryFileReadDXLy_w6L.i)({
      absolutePath: candidate.path,
      rootPath: candidate.boundaryRoot,
      boundaryLabel: "plugin root",
      rejectHardlinks: false,
      skipLexicalRootCheck: true
    });
    if (opened.ok) {
      _nodeFs.default.closeSync(opened.fd);
      return opened.path;
    }
    firstFailure ??= {
      candidate,
      failure: opened
    };
  }
  const failure = firstFailure;
  if (!failure) throw new Error(formatBundledEntryModuleOpenFailure({
    importMetaUrl,
    specifier,
    resolvedPath: fallbackCandidate.path,
    boundaryRoot: fallbackCandidate.boundaryRoot,
    failure: {
      ok: false,
      reason: "path",
      error: /* @__PURE__ */new Error(`ENOENT: no such file or directory, lstat '${fallbackCandidate.path}'`)
    }
  }));
  throw new Error(formatBundledEntryModuleOpenFailure({
    importMetaUrl,
    specifier,
    resolvedPath: failure.candidate.path,
    boundaryRoot: failure.candidate.boundaryRoot,
    failure: failure.failure
  }));
}
function getJiti(modulePath) {
  return (0, _jitiLoaderCacheD_0TILck.t)({
    cache: jitiLoaders,
    modulePath,
    importerUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/channel-entry-contract-mcFqxQzW.js",
    preferBuiltDist: true,
    jitiFilename: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/channel-entry-contract-mcFqxQzW.js"
  });
}
function loadBundledEntryModuleSync(importMetaUrl, specifier) {
  const modulePath = resolveBundledEntryModulePath(importMetaUrl, specifier);
  const cached = loadedModuleExports.get(modulePath);
  if (cached !== void 0) return cached;
  let loaded;
  if (process.platform === "win32" && modulePath.includes(`${_nodePath.default.sep}dist${_nodePath.default.sep}`) && [
  ".js",
  ".mjs",
  ".cjs"].
  includes((0, _stringCoerceBUSzWgUA.i)(_nodePath.default.extname(modulePath)))) try {
    loaded = nodeRequire(modulePath);
  } catch {
    loaded = getJiti(modulePath)(modulePath);
  } else
  loaded = getJiti(modulePath)(modulePath);
  loadedModuleExports.set(modulePath, loaded);
  return loaded;
}
function loadBundledEntryExportSync(importMetaUrl, reference) {
  const loaded = loadBundledEntryModuleSync(importMetaUrl, reference.specifier);
  const resolved = loaded && typeof loaded === "object" && "default" in loaded ? loaded.default : loaded;
  if (!reference.exportName) return resolved;
  const record = resolved ?? loaded;
  if (!record || !(reference.exportName in record)) throw new Error(`missing export "${reference.exportName}" from bundled entry module ${reference.specifier}`);
  return record[reference.exportName];
}
function defineBundledChannelEntry({ id, name, description, importMetaUrl, plugin, secrets, configSchema, runtime, accountInspect, features, registerCliMetadata, registerFull }) {
  const resolvedConfigSchema = typeof configSchema === "function" ? configSchema() : configSchema ?? (0, _configSchemaSgVTuroC.a)();
  const loadChannelPlugin = () => loadBundledEntryExportSync(importMetaUrl, plugin);
  const loadChannelSecrets = secrets ? () => loadBundledEntryExportSync(importMetaUrl, secrets) : void 0;
  const loadChannelAccountInspector = accountInspect ? () => loadBundledEntryExportSync(importMetaUrl, accountInspect) : void 0;
  const setChannelRuntime = runtime ? (pluginRuntime) => {
    loadBundledEntryExportSync(importMetaUrl, runtime)(pluginRuntime);
  } : void 0;
  return {
    kind: "bundled-channel-entry",
    id,
    name,
    description,
    configSchema: resolvedConfigSchema,
    ...(features || accountInspect ? { features: {
        ...features,
        ...(accountInspect ? { accountInspect: true } : {})
      } } : {}),
    register(api) {
      if (api.registrationMode === "cli-metadata") {
        registerCliMetadata?.(api);
        return;
      }
      setChannelRuntime?.(api.runtime);
      api.registerChannel({ plugin: loadChannelPlugin() });
      if (api.registrationMode !== "full") return;
      registerCliMetadata?.(api);
      registerFull?.(api);
    },
    loadChannelPlugin,
    ...(loadChannelSecrets ? { loadChannelSecrets } : {}),
    ...(loadChannelAccountInspector ? { loadChannelAccountInspector } : {}),
    ...(setChannelRuntime ? { setChannelRuntime } : {})
  };
}
function defineBundledChannelSetupEntry({ importMetaUrl, plugin, secrets, runtime, features }) {
  const setChannelRuntime = runtime ? (pluginRuntime) => {
    loadBundledEntryExportSync(importMetaUrl, runtime)(pluginRuntime);
  } : void 0;
  return {
    kind: "bundled-channel-setup-entry",
    loadSetupPlugin: () => loadBundledEntryExportSync(importMetaUrl, plugin),
    ...(secrets ? { loadSetupSecrets: () => loadBundledEntryExportSync(importMetaUrl, secrets) } : {}),
    ...(setChannelRuntime ? { setChannelRuntime } : {}),
    ...(features ? { features } : {})
  };
}
//#endregion /* v9-1ed1683c01964659 */
