"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = listPluginSdkAliasCandidates;exports.c = resolveExtensionApiAlias;exports.d = resolvePluginLoaderJitiTryNative;exports.f = resolvePluginRuntimeModulePath;exports.g = shouldPreferNativeJiti;exports.h = resolvePluginSdkScopedAliasMap;exports.i = isBundledPluginExtensionPath;exports.l = resolveLoaderPackageRoot;exports.m = resolvePluginSdkAliasFile;exports.n = buildPluginLoaderJitiOptions;exports.o = listPluginSdkExportedSubpaths;exports.p = resolvePluginSdkAliasCandidateOrder;exports.r = createPluginLoaderJitiCacheKey;exports.s = normalizeJitiAliasTargetPath;exports.t = buildPluginLoaderAliasMap;exports.u = resolvePluginLoaderJitiConfig;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _openclawRootBNWw3cXT = require("./openclaw-root-BNWw3cXT.js");
var _nodeUrl = require("node:url");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugins/sdk-alias.ts
const STARTUP_ARGV1 = process.argv[1];
function normalizeJitiAliasTargetPath(targetPath) {
  return process.platform === "win32" ? targetPath.replace(/\\/g, "/") : targetPath;
}
function resolveLoaderModulePath(params = {}) {
  return params.modulePath ?? (0, _nodeUrl.fileURLToPath)(params.moduleUrl ?? "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/sdk-alias-w29OTN9p.js");
}
function readPluginSdkPackageJson(packageRoot) {
  try {
    const pkgRaw = _nodeFs.default.readFileSync(_nodePath.default.join(packageRoot, "package.json"), "utf-8");
    return JSON.parse(pkgRaw);
  } catch {
    return null;
  }
}
function isSafePluginSdkSubpathSegment(subpath) {
  return /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(subpath);
}
function listPluginSdkSubpathsFromPackageJson(pkg) {
  return Object.keys(pkg.exports ?? {}).filter((key) => key.startsWith("./plugin-sdk/")).map((key) => key.slice(13)).filter((subpath) => isSafePluginSdkSubpathSegment(subpath)).toSorted();
}
function hasTrustedOpenClawRootIndicator(params) {
  const packageExports = params.packageJson.exports ?? {};
  if (!Object.prototype.hasOwnProperty.call(packageExports, "./plugin-sdk")) return false;
  const hasCliEntryExport = Object.prototype.hasOwnProperty.call(packageExports, "./cli-entry");
  const hasOpenClawBin = typeof params.packageJson.bin === "string" && (0, _stringCoerceBUSzWgUA.i)(params.packageJson.bin).includes("openclaw") || typeof params.packageJson.bin === "object" && params.packageJson.bin !== null && typeof params.packageJson.bin.openclaw === "string";
  const hasOpenClawEntrypoint = _nodeFs.default.existsSync(_nodePath.default.join(params.packageRoot, "openclaw.mjs"));
  return hasCliEntryExport || hasOpenClawBin || hasOpenClawEntrypoint;
}
function readPluginSdkSubpathsFromPackageRoot(packageRoot) {
  const pkg = readPluginSdkPackageJson(packageRoot);
  if (!pkg) return null;
  if (!hasTrustedOpenClawRootIndicator({
    packageRoot,
    packageJson: pkg
  })) return null;
  const subpaths = listPluginSdkSubpathsFromPackageJson(pkg);
  return subpaths.length > 0 ? subpaths : null;
}
function resolveTrustedOpenClawRootFromArgvHint(params) {
  if (!params.argv1) return null;
  const packageRoot = (0, _openclawRootBNWw3cXT.n)({
    cwd: params.cwd,
    argv1: params.argv1
  });
  if (!packageRoot) return null;
  const packageJson = readPluginSdkPackageJson(packageRoot);
  if (!packageJson) return null;
  return hasTrustedOpenClawRootIndicator({
    packageRoot,
    packageJson
  }) ? packageRoot : null;
}
function findNearestPluginSdkPackageRoot(startDir, maxDepth = 12) {
  let cursor = _nodePath.default.resolve(startDir);
  for (let i = 0; i < maxDepth; i += 1) {
    if (readPluginSdkSubpathsFromPackageRoot(cursor)) return cursor;
    const parent = _nodePath.default.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  return null;
}
function resolveLoaderPackageRoot(params) {
  const cwd = params.cwd ?? _nodePath.default.dirname(params.modulePath);
  const fromModulePath = (0, _openclawRootBNWw3cXT.n)({ cwd });
  if (fromModulePath) return fromModulePath;
  const argv1 = params.argv1 ?? process.argv[1];
  const moduleUrl = params.moduleUrl ?? (params.modulePath ? void 0 : "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/sdk-alias-w29OTN9p.js");
  return (0, _openclawRootBNWw3cXT.n)({
    cwd,
    ...(argv1 ? { argv1 } : {}),
    ...(moduleUrl ? { moduleUrl } : {})
  });
}
function resolveLoaderPluginSdkPackageRoot(params) {
  const cwd = params.cwd ?? _nodePath.default.dirname(params.modulePath);
  const fromCwd = (0, _openclawRootBNWw3cXT.n)({ cwd });
  const fromExplicitHints = resolveTrustedOpenClawRootFromArgvHint({
    cwd,
    argv1: params.argv1
  }) ?? (params.moduleUrl ? (0, _openclawRootBNWw3cXT.n)({
    cwd,
    moduleUrl: params.moduleUrl
  }) : null);
  return fromCwd ?? fromExplicitHints ?? findNearestPluginSdkPackageRoot(_nodePath.default.dirname(params.modulePath)) ?? (params.cwd ? findNearestPluginSdkPackageRoot(params.cwd) : null) ?? findNearestPluginSdkPackageRoot(process.cwd());
}
function resolvePluginSdkAliasCandidateOrder(params) {
  if (params.pluginSdkResolution === "dist") return ["dist", "src"];
  if (params.pluginSdkResolution === "src") return ["src", "dist"];
  return params.modulePath.replace(/\\/g, "/").includes("/dist/") || params.isProduction ? ["dist", "src"] : ["src", "dist"];
}
function listPluginSdkAliasCandidates(params) {
  const orderedKinds = resolvePluginSdkAliasCandidateOrder({
    modulePath: params.modulePath,
    isProduction: true,
    pluginSdkResolution: params.pluginSdkResolution
  });
  const packageRoot = resolveLoaderPluginSdkPackageRoot(params);
  if (packageRoot) {
    const candidateMap = {
      src: _nodePath.default.join(packageRoot, "src", "plugin-sdk", params.srcFile),
      dist: _nodePath.default.join(packageRoot, "dist", "plugin-sdk", params.distFile)
    };
    return orderedKinds.map((kind) => candidateMap[kind]);
  }
  let cursor = _nodePath.default.dirname(params.modulePath);
  const candidates = [];
  for (let i = 0; i < 6; i += 1) {
    const candidateMap = {
      src: _nodePath.default.join(cursor, "src", "plugin-sdk", params.srcFile),
      dist: _nodePath.default.join(cursor, "dist", "plugin-sdk", params.distFile)
    };
    for (const kind of orderedKinds) candidates.push(candidateMap[kind]);
    const parent = _nodePath.default.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  return candidates;
}
function resolvePluginSdkAliasFile(params) {
  try {
    const modulePath = resolveLoaderModulePath(params);
    for (const candidate of listPluginSdkAliasCandidates({
      srcFile: params.srcFile,
      distFile: params.distFile,
      modulePath,
      argv1: params.argv1,
      cwd: params.cwd,
      moduleUrl: params.moduleUrl,
      pluginSdkResolution: params.pluginSdkResolution
    })) if (_nodeFs.default.existsSync(candidate)) return candidate;
  } catch {}
  return null;
}
const cachedPluginSdkExportedSubpaths = /* @__PURE__ */new Map();
const cachedPluginSdkScopedAliasMaps = /* @__PURE__ */new Map();
const PLUGIN_SDK_PACKAGE_NAMES = ["openclaw/plugin-sdk", "@openclaw/plugin-sdk"];
const PLUGIN_SDK_SOURCE_CANDIDATE_EXTENSIONS = [
".ts",
".mts",
".js",
".mjs",
".cts",
".cjs"];

function readPrivateLocalOnlyPluginSdkSubpaths(packageRoot) {
  try {
    const raw = _nodeFs.default.readFileSync(_nodePath.default.join(packageRoot, "scripts", "lib", "plugin-sdk-private-local-only-subpaths.json"), "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((subpath) => isSafePluginSdkSubpathSegment(subpath));
  } catch {
    return [];
  }
}
function shouldIncludePrivateLocalOnlyPluginSdkSubpaths() {
  return process.env.OPENCLAW_ENABLE_PRIVATE_QA_CLI === "1";
}
function hasPluginSdkSubpathArtifact(packageRoot, subpath) {
  const distPath = _nodePath.default.join(packageRoot, "dist", "plugin-sdk", `${subpath}.js`);
  if (_nodeFs.default.existsSync(distPath)) return true;
  return PLUGIN_SDK_SOURCE_CANDIDATE_EXTENSIONS.some((ext) => _nodeFs.default.existsSync(_nodePath.default.join(packageRoot, "src", "plugin-sdk", `${subpath}${ext}`)));
}
function listPrivateLocalOnlyPluginSdkSubpaths(packageRoot) {
  if (!shouldIncludePrivateLocalOnlyPluginSdkSubpaths()) return [];
  return readPrivateLocalOnlyPluginSdkSubpaths(packageRoot).filter((subpath) => hasPluginSdkSubpathArtifact(packageRoot, subpath));
}
function listPluginSdkExportedSubpaths(params = {}) {
  const packageRoot = resolveLoaderPluginSdkPackageRoot({
    modulePath: params.modulePath ?? (0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/sdk-alias-w29OTN9p.js"),
    argv1: params.argv1,
    moduleUrl: params.moduleUrl
  });
  if (!packageRoot) return [];
  const cacheKey = `${packageRoot}::privateQa=${shouldIncludePrivateLocalOnlyPluginSdkSubpaths() ? "1" : "0"}`;
  const cached = cachedPluginSdkExportedSubpaths.get(cacheKey);
  if (cached) return cached;
  const subpaths = [...new Set([...(readPluginSdkSubpathsFromPackageRoot(packageRoot) ?? []), ...listPrivateLocalOnlyPluginSdkSubpaths(packageRoot)])].toSorted();
  cachedPluginSdkExportedSubpaths.set(cacheKey, subpaths);
  return subpaths;
}
function resolvePluginSdkScopedAliasMap(params = {}) {
  const modulePath = params.modulePath ?? (0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/sdk-alias-w29OTN9p.js");
  const packageRoot = resolveLoaderPluginSdkPackageRoot({
    modulePath,
    argv1: params.argv1,
    moduleUrl: params.moduleUrl
  });
  if (!packageRoot) return {};
  const orderedKinds = resolvePluginSdkAliasCandidateOrder({
    modulePath,
    isProduction: true,
    pluginSdkResolution: params.pluginSdkResolution
  });
  const cacheKey = `${packageRoot}::${orderedKinds.join(",")}::privateQa=${shouldIncludePrivateLocalOnlyPluginSdkSubpaths() ? "1" : "0"}`;
  const cached = cachedPluginSdkScopedAliasMaps.get(cacheKey);
  if (cached) return cached;
  const aliasMap = {};
  for (const subpath of listPluginSdkExportedSubpaths({
    modulePath,
    argv1: params.argv1,
    moduleUrl: params.moduleUrl,
    pluginSdkResolution: params.pluginSdkResolution
  })) for (const kind of orderedKinds) {
    if (kind === "dist") {
      const candidate = _nodePath.default.join(packageRoot, "dist", "plugin-sdk", `${subpath}.js`);
      if (_nodeFs.default.existsSync(candidate)) {
        for (const packageName of PLUGIN_SDK_PACKAGE_NAMES) aliasMap[`${packageName}/${subpath}`] = candidate;
        break;
      }
      continue;
    }
    for (const ext of PLUGIN_SDK_SOURCE_CANDIDATE_EXTENSIONS) {
      const candidate = _nodePath.default.join(packageRoot, "src", "plugin-sdk", `${subpath}${ext}`);
      if (!_nodeFs.default.existsSync(candidate)) continue;
      for (const packageName of PLUGIN_SDK_PACKAGE_NAMES) aliasMap[`${packageName}/${subpath}`] = candidate;
      break;
    }
    if (Object.prototype.hasOwnProperty.call(aliasMap, `openclaw/plugin-sdk/${subpath}`)) break;
  }
  cachedPluginSdkScopedAliasMaps.set(cacheKey, aliasMap);
  return aliasMap;
}
function resolveExtensionApiAlias(params = {}) {
  try {
    const modulePath = resolveLoaderModulePath(params);
    const packageRoot = resolveLoaderPackageRoot({
      ...params,
      modulePath
    });
    if (!packageRoot) return null;
    const orderedKinds = resolvePluginSdkAliasCandidateOrder({
      modulePath,
      isProduction: true,
      pluginSdkResolution: params.pluginSdkResolution
    });
    for (const kind of orderedKinds) {
      if (kind === "dist") {
        const candidate = _nodePath.default.join(packageRoot, "dist", "extensionAPI.js");
        if (_nodeFs.default.existsSync(candidate)) return candidate;
        continue;
      }
      for (const ext of PLUGIN_SDK_SOURCE_CANDIDATE_EXTENSIONS) {
        const candidate = _nodePath.default.join(packageRoot, "src", `extensionAPI${ext}`);
        if (_nodeFs.default.existsSync(candidate)) return candidate;
      }
    }
  } catch {}
  return null;
}
function buildPluginLoaderAliasMap(modulePath, argv1 = STARTUP_ARGV1, moduleUrl, pluginSdkResolution = "auto") {
  const pluginSdkAlias = resolvePluginSdkAliasFile({
    srcFile: "root-alias.cjs",
    distFile: "root-alias.cjs",
    modulePath,
    argv1,
    moduleUrl,
    pluginSdkResolution
  });
  const extensionApiAlias = resolveExtensionApiAlias({
    modulePath,
    pluginSdkResolution
  });
  return {
    ...(extensionApiAlias ? { "openclaw/extension-api": normalizeJitiAliasTargetPath(extensionApiAlias) } : {}),
    ...(pluginSdkAlias ? Object.fromEntries(PLUGIN_SDK_PACKAGE_NAMES.map((packageName) => [packageName, normalizeJitiAliasTargetPath(pluginSdkAlias)])) : {}),
    ...Object.fromEntries(Object.entries(resolvePluginSdkScopedAliasMap({
      modulePath,
      argv1,
      moduleUrl,
      pluginSdkResolution
    })).map(([key, value]) => [key, normalizeJitiAliasTargetPath(value)]))
  };
}
function resolvePluginRuntimeModulePath(params = {}) {
  try {
    const modulePath = resolveLoaderModulePath(params);
    const orderedKinds = resolvePluginSdkAliasCandidateOrder({
      modulePath,
      isProduction: true,
      pluginSdkResolution: params.pluginSdkResolution
    });
    const packageRoot = resolveLoaderPackageRoot({
      ...params,
      modulePath
    });
    const candidates = packageRoot ? orderedKinds.map((kind) => kind === "src" ? _nodePath.default.join(packageRoot, "src", "plugins", "runtime", "index.ts") : _nodePath.default.join(packageRoot, "dist", "plugins", "runtime", "index.js")) : [_nodePath.default.join(_nodePath.default.dirname(modulePath), "runtime", "index.ts"), _nodePath.default.join(_nodePath.default.dirname(modulePath), "runtime", "index.js")];
    for (const candidate of candidates) if (_nodeFs.default.existsSync(candidate)) return candidate;
  } catch {}
  return null;
}
function buildPluginLoaderJitiOptions(aliasMap) {
  return {
    interopDefault: true,
    tryNative: true,
    extensions: [
    ".ts",
    ".tsx",
    ".mts",
    ".cts",
    ".mtsx",
    ".ctsx",
    ".js",
    ".mjs",
    ".cjs",
    ".json"],

    ...(Object.keys(aliasMap).length > 0 ? { alias: aliasMap } : {})
  };
}
function supportsNativeJitiRuntime() {
  return typeof process.versions.bun !== "string" && process.platform !== "win32";
}
function isBundledPluginDistModulePath(modulePath) {
  return modulePath.replace(/\\/g, "/").includes("/dist/extensions/");
}
function shouldPreferNativeJiti(modulePath) {
  if (!supportsNativeJitiRuntime()) return false;
  switch ((0, _stringCoerceBUSzWgUA.i)(_nodePath.default.extname(modulePath))) {
    case ".js":
    case ".mjs":
    case ".cjs":
    case ".json":return true;
    default:return false;
  }
}
function resolvePluginLoaderJitiTryNative(modulePath, options) {
  if (isBundledPluginDistModulePath(modulePath)) return false;
  return shouldPreferNativeJiti(modulePath) || supportsNativeJitiRuntime() && options?.preferBuiltDist === true && modulePath.includes(`${_nodePath.default.sep}dist${_nodePath.default.sep}`);
}
function createPluginLoaderJitiCacheKey(params) {
  return JSON.stringify({
    tryNative: params.tryNative,
    aliasMap: Object.entries(params.aliasMap).toSorted(([left], [right]) => left.localeCompare(right))
  });
}
function resolvePluginLoaderJitiConfig(params) {
  const tryNative = resolvePluginLoaderJitiTryNative(params.modulePath, params.preferBuiltDist ? { preferBuiltDist: true } : {});
  const aliasMap = buildPluginLoaderAliasMap(params.modulePath, params.argv1, params.moduleUrl);
  return {
    tryNative,
    aliasMap,
    cacheKey: createPluginLoaderJitiCacheKey({
      tryNative,
      aliasMap
    })
  };
}
function isBundledPluginExtensionPath(params) {
  const normalizedModulePath = _nodePath.default.resolve(params.modulePath);
  return [
  params.bundledPluginsDir ? _nodePath.default.resolve(params.bundledPluginsDir) : null,
  _nodePath.default.join(params.openClawPackageRoot, "extensions"),
  _nodePath.default.join(params.openClawPackageRoot, "dist", "extensions"),
  _nodePath.default.join(params.openClawPackageRoot, "dist-runtime", "extensions")].
  filter((root) => typeof root === "string").some((root) => normalizedModulePath === root || normalizedModulePath.startsWith(`${root}${_nodePath.default.sep}`));
}
//#endregion /* v9-91ef94d15ee391cb */
