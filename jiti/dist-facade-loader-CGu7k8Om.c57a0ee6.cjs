"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = loadFacadeModuleAtLocationSync;exports.i = loadBundledPluginPublicSurfaceModuleSync;exports.n = createLazyFacadeObjectValue;exports.r = listImportedBundledPluginFacadeIds;exports.t = createLazyFacadeArrayValue;var _bundledDirD4Wk35JT = require("./bundled-dir-D4Wk35JT.js");
var _boundaryFileReadDXLy_w6L = require("./boundary-file-read-DXLy_w6L.js");
var _publicSurfaceRuntimeNilbjlrn = require("./public-surface-runtime-nilbjlrn.js");
var _sdkAliasW29OTN9p = require("./sdk-alias-w29OTN9p.js");
var _jitiLoaderCacheD_0TILck = require("./jiti-loader-cache-D_0TILck.js");
var _nodeModule = require("node:module");
var _nodeUrl = require("node:url");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugin-sdk/facade-loader.ts
const CURRENT_MODULE_PATH = (0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-loader-CGu7k8Om.js");
const nodeRequire = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-loader-CGu7k8Om.js");
const jitiLoaders = /* @__PURE__ */new Map();
const loadedFacadeModules = /* @__PURE__ */new Map();
const loadedFacadePluginIds = /* @__PURE__ */new Set();
const cachedFacadeModuleLocationsByKey = /* @__PURE__ */new Map();
let facadeLoaderJitiFactory;
let cachedOpenClawPackageRoot;
function getJitiFactory() {
  if (facadeLoaderJitiFactory) return facadeLoaderJitiFactory;
  const { createJiti } = nodeRequire("jiti");
  facadeLoaderJitiFactory = createJiti;
  return facadeLoaderJitiFactory;
}
function getOpenClawPackageRoot() {
  if (cachedOpenClawPackageRoot) return cachedOpenClawPackageRoot;
  cachedOpenClawPackageRoot = (0, _sdkAliasW29OTN9p.l)({
    modulePath: (0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-loader-CGu7k8Om.js"),
    moduleUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-loader-CGu7k8Om.js"
  }) ?? (0, _nodeUrl.fileURLToPath)(new URL("../..", "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-loader-CGu7k8Om.js"));
  return cachedOpenClawPackageRoot;
}
function createFacadeResolutionKey(params) {
  const bundledPluginsDir = (0, _bundledDirD4Wk35JT.t)(params.env ?? process.env);
  return `${params.dirName}::${params.artifactBasename}::${bundledPluginsDir ? _nodePath.default.resolve(bundledPluginsDir) : "<default>"}`;
}
function resolveFacadeModuleLocationUncached(params) {
  const bundledPluginsDir = (0, _bundledDirD4Wk35JT.t)(params.env ?? process.env);
  if (!CURRENT_MODULE_PATH.includes(`${_nodePath.default.sep}dist${_nodePath.default.sep}`)) {
    const modulePath = (0, _publicSurfaceRuntimeNilbjlrn.i)({
      ...params,
      sourceRoot: bundledPluginsDir ?? _nodePath.default.resolve(getOpenClawPackageRoot(), "extensions")
    }) ?? (0, _publicSurfaceRuntimeNilbjlrn.r)({
      rootDir: getOpenClawPackageRoot(),
      env: params.env,
      ...(bundledPluginsDir ? { bundledPluginsDir } : {}),
      dirName: params.dirName,
      artifactBasename: params.artifactBasename
    });
    if (modulePath) return {
      modulePath,
      boundaryRoot: bundledPluginsDir && modulePath.startsWith(_nodePath.default.resolve(bundledPluginsDir) + _nodePath.default.sep) ? _nodePath.default.resolve(bundledPluginsDir) : getOpenClawPackageRoot()
    };
    return null;
  }
  const modulePath = (0, _publicSurfaceRuntimeNilbjlrn.r)({
    rootDir: getOpenClawPackageRoot(),
    env: params.env,
    ...(bundledPluginsDir ? { bundledPluginsDir } : {}),
    dirName: params.dirName,
    artifactBasename: params.artifactBasename
  });
  if (!modulePath) return null;
  return {
    modulePath,
    boundaryRoot: bundledPluginsDir && modulePath.startsWith(_nodePath.default.resolve(bundledPluginsDir) + _nodePath.default.sep) ? _nodePath.default.resolve(bundledPluginsDir) : getOpenClawPackageRoot()
  };
}
function resolveFacadeModuleLocation(params) {
  const key = createFacadeResolutionKey(params);
  if (cachedFacadeModuleLocationsByKey.has(key)) return cachedFacadeModuleLocationsByKey.get(key) ?? null;
  const resolved = resolveFacadeModuleLocationUncached(params);
  cachedFacadeModuleLocationsByKey.set(key, resolved);
  return resolved;
}
function getJiti(modulePath) {
  return (0, _jitiLoaderCacheD_0TILck.t)({
    cache: jitiLoaders,
    modulePath,
    importerUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-loader-CGu7k8Om.js",
    preferBuiltDist: true,
    jitiFilename: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/facade-loader-CGu7k8Om.js",
    createLoader: getJitiFactory()
  });
}
function createLazyFacadeValueLoader(load) {
  let loaded = false;
  let value;
  return () => {
    if (!loaded) {
      value = load();
      loaded = true;
    }
    return value;
  };
}
function createLazyFacadeProxyValue(params) {
  const resolve = createLazyFacadeValueLoader(params.load);
  return new Proxy(params.target, {
    defineProperty(_target, property, descriptor) {
      return Reflect.defineProperty(resolve(), property, descriptor);
    },
    deleteProperty(_target, property) {
      return Reflect.deleteProperty(resolve(), property);
    },
    get(_target, property, receiver) {
      return Reflect.get(resolve(), property, receiver);
    },
    getOwnPropertyDescriptor(_target, property) {
      return Reflect.getOwnPropertyDescriptor(resolve(), property);
    },
    getPrototypeOf() {
      return Reflect.getPrototypeOf(resolve());
    },
    has(_target, property) {
      return Reflect.has(resolve(), property);
    },
    isExtensible() {
      return Reflect.isExtensible(resolve());
    },
    ownKeys() {
      return Reflect.ownKeys(resolve());
    },
    preventExtensions() {
      return Reflect.preventExtensions(resolve());
    },
    set(_target, property, value, receiver) {
      return Reflect.set(resolve(), property, value, receiver);
    },
    setPrototypeOf(_target, prototype) {
      return Reflect.setPrototypeOf(resolve(), prototype);
    }
  });
}
function createLazyFacadeObjectValue(load) {
  return createLazyFacadeProxyValue({
    load,
    target: {}
  });
}
function createLazyFacadeArrayValue(load) {
  return createLazyFacadeProxyValue({
    load,
    target: []
  });
}
function loadFacadeModuleAtLocationSync(params) {
  const cached = loadedFacadeModules.get(params.location.modulePath);
  if (cached) return cached;
  const opened = (0, _boundaryFileReadDXLy_w6L.i)({
    absolutePath: params.location.modulePath,
    rootPath: params.location.boundaryRoot,
    boundaryLabel: params.location.boundaryRoot === getOpenClawPackageRoot() ? "OpenClaw package root" : (() => {
      const bundledDir = (0, _bundledDirD4Wk35JT.t)();
      return bundledDir && _nodePath.default.resolve(params.location.boundaryRoot) === _nodePath.default.resolve(bundledDir) ? "bundled plugin directory" : "plugin root";
    })(),
    rejectHardlinks: false
  });
  if (!opened.ok) throw new Error(`Unable to open bundled plugin public surface ${params.location.modulePath}`, { cause: opened.error });
  _nodeFs.default.closeSync(opened.fd);
  const sentinel = {};
  loadedFacadeModules.set(params.location.modulePath, sentinel);
  let loaded;
  try {
    loaded = params.loadModule?.(params.location.modulePath) ?? getJiti(params.location.modulePath)(params.location.modulePath);
    Object.assign(sentinel, loaded);
    loadedFacadePluginIds.add(typeof params.trackedPluginId === "function" ? params.trackedPluginId() : params.trackedPluginId);
  } catch (err) {
    loadedFacadeModules.delete(params.location.modulePath);
    throw err;
  }
  return sentinel;
}
function loadBundledPluginPublicSurfaceModuleSync(params) {
  const location = resolveFacadeModuleLocation(params);
  if (!location) throw new Error(`Unable to resolve bundled plugin public surface ${params.dirName}/${params.artifactBasename}`);
  return loadFacadeModuleAtLocationSync({
    location,
    trackedPluginId: params.trackedPluginId ?? params.dirName
  });
}
function listImportedBundledPluginFacadeIds() {
  return [...loadedFacadePluginIds].toSorted((left, right) => left.localeCompare(right));
}
//#endregion /* v9-f73a62e1eb96edfc */
