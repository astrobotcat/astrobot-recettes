"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = loadBundledPluginPublicSurfaceModuleSync;exports.r = tryLoadActivatedBundledPluginPublicSurfaceModuleSync;exports.t = loadActivatedBundledPluginPublicSurfaceModuleSync;var _bundledDirD4Wk35JT = require("./bundled-dir-D4Wk35JT.js");
var _publicSurfaceRuntimeNilbjlrn = require("./public-surface-runtime-nilbjlrn.js");
var _sdkAliasW29OTN9p = require("./sdk-alias-w29OTN9p.js");
var _jitiLoaderCacheD_0TILck = require("./jiti-loader-cache-D_0TILck.js");
var _facadeLoaderCGu7k8Om = require("./facade-loader-CGu7k8Om.js");
var _nodeModule = require("node:module");
var _nodeUrl = require("node:url");
require("node:fs");
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugin-sdk/facade-runtime.ts
const OPENCLAW_PACKAGE_ROOT = (0, _sdkAliasW29OTN9p.l)({
  modulePath: (0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-runtime-gSGchfr7.js"),
  moduleUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-runtime-gSGchfr7.js"
}) ?? (0, _nodeUrl.fileURLToPath)(new URL("../..", "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-runtime-gSGchfr7.js"));
const CURRENT_MODULE_PATH = (0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-runtime-gSGchfr7.js");
const OPENCLAW_SOURCE_EXTENSIONS_ROOT = _nodePath.default.resolve(OPENCLAW_PACKAGE_ROOT, "extensions");
const cachedFacadeModuleLocationsByKey = /* @__PURE__ */new Map();
function createFacadeResolutionKey(params) {
  const bundledPluginsDir = (0, _bundledDirD4Wk35JT.t)(params.env ?? process.env);
  return `${params.dirName}::${params.artifactBasename}::${bundledPluginsDir ? _nodePath.default.resolve(bundledPluginsDir) : "<default>"}`;
}
function resolveRegistryPluginModuleLocation(params) {
  return loadFacadeActivationCheckRuntime().resolveRegistryPluginModuleLocation({
    ...params,
    resolutionKey: createFacadeResolutionKey(params)
  });
}
function resolveFacadeModuleLocationUncached(params) {
  const bundledPluginsDir = (0, _bundledDirD4Wk35JT.t)(params.env ?? process.env);
  if (!CURRENT_MODULE_PATH.includes(`${_nodePath.default.sep}dist${_nodePath.default.sep}`)) {
    const modulePath = (0, _publicSurfaceRuntimeNilbjlrn.i)({
      ...params,
      sourceRoot: bundledPluginsDir ?? _nodePath.default.resolve(OPENCLAW_PACKAGE_ROOT, "extensions")
    }) ?? (0, _publicSurfaceRuntimeNilbjlrn.r)({
      rootDir: OPENCLAW_PACKAGE_ROOT,
      env: params.env,
      ...(bundledPluginsDir ? { bundledPluginsDir } : {}),
      dirName: params.dirName,
      artifactBasename: params.artifactBasename
    });
    if (modulePath) return {
      modulePath,
      boundaryRoot: bundledPluginsDir && modulePath.startsWith(_nodePath.default.resolve(bundledPluginsDir) + _nodePath.default.sep) ? _nodePath.default.resolve(bundledPluginsDir) : OPENCLAW_PACKAGE_ROOT
    };
    return resolveRegistryPluginModuleLocation(params);
  }
  const modulePath = (0, _publicSurfaceRuntimeNilbjlrn.r)({
    rootDir: OPENCLAW_PACKAGE_ROOT,
    env: params.env,
    ...(bundledPluginsDir ? { bundledPluginsDir } : {}),
    dirName: params.dirName,
    artifactBasename: params.artifactBasename
  });
  if (modulePath) return {
    modulePath,
    boundaryRoot: bundledPluginsDir && modulePath.startsWith(_nodePath.default.resolve(bundledPluginsDir) + _nodePath.default.sep) ? _nodePath.default.resolve(bundledPluginsDir) : OPENCLAW_PACKAGE_ROOT
  };
  return resolveRegistryPluginModuleLocation(params);
}
function resolveFacadeModuleLocation(params) {
  const key = createFacadeResolutionKey(params);
  if (cachedFacadeModuleLocationsByKey.has(key)) return cachedFacadeModuleLocationsByKey.get(key) ?? null;
  const resolved = resolveFacadeModuleLocationUncached(params);
  cachedFacadeModuleLocationsByKey.set(key, resolved);
  return resolved;
}
const nodeRequire = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-runtime-gSGchfr7.js");
const FACADE_ACTIVATION_CHECK_RUNTIME_CANDIDATES = ["./facade-activation-check.runtime.js", "./facade-activation-check.runtime.ts"];
let facadeActivationCheckRuntimeModule;
const facadeActivationCheckRuntimeJitiLoaders = /* @__PURE__ */new Map();
function getFacadeActivationCheckRuntimeJiti(modulePath) {
  return (0, _jitiLoaderCacheD_0TILck.t)({
    cache: facadeActivationCheckRuntimeJitiLoaders,
    modulePath,
    importerUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-runtime-gSGchfr7.js",
    jitiFilename: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-runtime-gSGchfr7.js",
    aliasMap: {},
    tryNative: false
  });
}
function loadFacadeActivationCheckRuntimeFromCandidates(loadCandidate) {
  for (const candidate of FACADE_ACTIVATION_CHECK_RUNTIME_CANDIDATES) try {
    return loadCandidate(candidate);
  } catch {}
}
function loadFacadeActivationCheckRuntime() {
  if (facadeActivationCheckRuntimeModule) return facadeActivationCheckRuntimeModule;
  facadeActivationCheckRuntimeModule = loadFacadeActivationCheckRuntimeFromCandidates((candidate) => nodeRequire(candidate));
  if (facadeActivationCheckRuntimeModule) return facadeActivationCheckRuntimeModule;
  facadeActivationCheckRuntimeModule = loadFacadeActivationCheckRuntimeFromCandidates((candidate) => getFacadeActivationCheckRuntimeJiti(candidate)(candidate));
  if (facadeActivationCheckRuntimeModule) return facadeActivationCheckRuntimeModule;
  throw new Error("Unable to load facade activation check runtime");
}
function loadFacadeModuleAtLocationSync(params) {
  return (0, _facadeLoaderCGu7k8Om.a)(params);
}
function buildFacadeActivationCheckParams(params, location = resolveFacadeModuleLocation(params)) {
  return {
    ...params,
    location,
    sourceExtensionsRoot: OPENCLAW_SOURCE_EXTENSIONS_ROOT,
    resolutionKey: createFacadeResolutionKey(params)
  };
}
function loadBundledPluginPublicSurfaceModuleSync(params) {
  const location = resolveFacadeModuleLocation(params);
  const trackedPluginId = () => loadFacadeActivationCheckRuntime().resolveTrackedFacadePluginId(buildFacadeActivationCheckParams(params, location));
  if (!location) return (0, _facadeLoaderCGu7k8Om.i)({
    ...params,
    trackedPluginId
  });
  return loadFacadeModuleAtLocationSync({
    location,
    trackedPluginId
  });
}
function loadActivatedBundledPluginPublicSurfaceModuleSync(params) {
  loadFacadeActivationCheckRuntime().resolveActivatedBundledPluginPublicSurfaceAccessOrThrow(buildFacadeActivationCheckParams(params));
  return loadBundledPluginPublicSurfaceModuleSync(params);
}
function tryLoadActivatedBundledPluginPublicSurfaceModuleSync(params) {
  if (!loadFacadeActivationCheckRuntime().resolveBundledPluginPublicSurfaceAccess(buildFacadeActivationCheckParams(params)).allowed) return null;
  return loadBundledPluginPublicSurfaceModuleSync(params);
}
//#endregion /* v9-72eb56f492b77cd0 */
