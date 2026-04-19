"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = loadBundledPluginPublicArtifactModuleSync;var _bundledDirD4Wk35JT = require("./bundled-dir-D4Wk35JT.js");
var _boundaryFileReadDXLy_w6L = require("./boundary-file-read-DXLy_w6L.js");
var _publicSurfaceRuntimeNilbjlrn = require("./public-surface-runtime-nilbjlrn.js");
var _sdkAliasW29OTN9p = require("./sdk-alias-w29OTN9p.js");
var _jitiLoaderCacheD_0TILck = require("./jiti-loader-cache-D_0TILck.js");
var _nodeModule = require("node:module");
var _nodeUrl = require("node:url");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugins/public-surface-loader.ts
const OPENCLAW_PACKAGE_ROOT = (0, _sdkAliasW29OTN9p.l)({
  modulePath: (0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/public-surface-loader-Ij2r4j4v.js"),
  moduleUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/public-surface-loader-Ij2r4j4v.js"
}) ?? (0, _nodeUrl.fileURLToPath)(new URL("../..", "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/public-surface-loader-Ij2r4j4v.js"));
const loadedPublicSurfaceModules = /* @__PURE__ */new Map();
const sourceArtifactRequire = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/public-surface-loader-Ij2r4j4v.js");
const publicSurfaceLocations = /* @__PURE__ */new Map();
const jitiLoaders = /* @__PURE__ */new Map();
const sharedBundledPublicSurfaceJitiLoaders = /* @__PURE__ */new Map();
function isSourceArtifactPath(modulePath) {
  switch (_nodePath.default.extname(modulePath).toLowerCase()) {
    case ".ts":
    case ".tsx":
    case ".mts":
    case ".cts":
    case ".mtsx":
    case ".ctsx":return true;
    default:return false;
  }
}
function canUseSourceArtifactRequire(params) {
  return !params.tryNative && isSourceArtifactPath(params.modulePath) && typeof sourceArtifactRequire.extensions?.[".ts"] === "function";
}
function createResolutionKey(params) {
  const bundledPluginsDir = (0, _bundledDirD4Wk35JT.t)();
  return `${params.dirName}::${params.artifactBasename}::${bundledPluginsDir ? _nodePath.default.resolve(bundledPluginsDir) : "<default>"}`;
}
function resolvePublicSurfaceLocationUncached(params) {
  const bundledPluginsDir = (0, _bundledDirD4Wk35JT.t)();
  const modulePath = (0, _publicSurfaceRuntimeNilbjlrn.r)({
    rootDir: OPENCLAW_PACKAGE_ROOT,
    ...(bundledPluginsDir ? { bundledPluginsDir } : {}),
    dirName: params.dirName,
    artifactBasename: params.artifactBasename
  });
  if (!modulePath) return null;
  return {
    modulePath,
    boundaryRoot: bundledPluginsDir && modulePath.startsWith(_nodePath.default.resolve(bundledPluginsDir) + _nodePath.default.sep) ? _nodePath.default.resolve(bundledPluginsDir) : OPENCLAW_PACKAGE_ROOT
  };
}
function resolvePublicSurfaceLocation(params) {
  const key = createResolutionKey(params);
  if (publicSurfaceLocations.has(key)) return publicSurfaceLocations.get(key) ?? null;
  const resolved = resolvePublicSurfaceLocationUncached(params);
  publicSurfaceLocations.set(key, resolved);
  return resolved;
}
function getJiti(modulePath) {
  const sharedLoader = getSharedBundledPublicSurfaceJiti(modulePath, (0, _sdkAliasW29OTN9p.d)(modulePath, { preferBuiltDist: true }));
  if (sharedLoader) return sharedLoader;
  return (0, _jitiLoaderCacheD_0TILck.t)({
    cache: jitiLoaders,
    modulePath,
    importerUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/public-surface-loader-Ij2r4j4v.js",
    preferBuiltDist: true,
    jitiFilename: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/public-surface-loader-Ij2r4j4v.js"
  });
}
function loadPublicSurfaceModule(modulePath) {
  if (canUseSourceArtifactRequire({
    modulePath,
    tryNative: (0, _sdkAliasW29OTN9p.d)(modulePath, { preferBuiltDist: true })
  })) return sourceArtifactRequire(modulePath);
  return getJiti(modulePath)(modulePath);
}
function getSharedBundledPublicSurfaceJiti(modulePath, tryNative) {
  const bundledPluginsDir = (0, _bundledDirD4Wk35JT.t)();
  if (!(0, _sdkAliasW29OTN9p.i)({
    modulePath,
    openClawPackageRoot: OPENCLAW_PACKAGE_ROOT,
    ...(bundledPluginsDir ? { bundledPluginsDir } : {})
  })) return null;
  const cacheKey = tryNative ? "bundled:native" : "bundled:source";
  const aliasMap = (0, _sdkAliasW29OTN9p.t)(modulePath, process.argv[1], "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/public-surface-loader-Ij2r4j4v.js");
  return (0, _jitiLoaderCacheD_0TILck.t)({
    cache: sharedBundledPublicSurfaceJitiLoaders,
    modulePath,
    importerUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/public-surface-loader-Ij2r4j4v.js",
    jitiFilename: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/public-surface-loader-Ij2r4j4v.js",
    cacheScopeKey: cacheKey,
    aliasMap,
    tryNative
  });
}
function loadBundledPluginPublicArtifactModuleSync(params) {
  const location = resolvePublicSurfaceLocation(params);
  if (!location) throw new Error(`Unable to resolve bundled plugin public surface ${params.dirName}/${params.artifactBasename}`);
  const cached = loadedPublicSurfaceModules.get(location.modulePath);
  if (cached) return cached;
  const opened = (0, _boundaryFileReadDXLy_w6L.i)({
    absolutePath: location.modulePath,
    rootPath: location.boundaryRoot,
    boundaryLabel: location.boundaryRoot === OPENCLAW_PACKAGE_ROOT ? "OpenClaw package root" : "bundled plugin directory",
    rejectHardlinks: false
  });
  if (!opened.ok) throw new Error(`Unable to open bundled plugin public surface ${params.dirName}/${params.artifactBasename}`, { cause: opened.error });
  _nodeFs.default.closeSync(opened.fd);
  const sentinel = {};
  loadedPublicSurfaceModules.set(location.modulePath, sentinel);
  try {
    const loaded = loadPublicSurfaceModule(location.modulePath);
    Object.assign(sentinel, loaded);
    return sentinel;
  } catch (error) {
    loadedPublicSurfaceModules.delete(location.modulePath);
    throw error;
  }
}
//#endregion /* v9-37171e5af3a31d10 */
