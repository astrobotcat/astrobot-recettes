"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = getCachedPluginJitiLoader;var _sdkAliasW29OTN9p = require("./sdk-alias-w29OTN9p.js");
var _jiti = require("jiti");
//#region src/plugins/jiti-loader-cache.ts
function getCachedPluginJitiLoader(params) {
  const defaultConfig = params.aliasMap || typeof params.tryNative === "boolean" ? (0, _sdkAliasW29OTN9p.u)({
    modulePath: params.modulePath,
    argv1: params.argvEntry ?? process.argv[1],
    moduleUrl: params.importerUrl,
    ...(params.preferBuiltDist ? { preferBuiltDist: true } : {})
  }) : null;
  const { tryNative, aliasMap } = defaultConfig ? {
    tryNative: params.tryNative ?? defaultConfig.tryNative,
    aliasMap: params.aliasMap ?? defaultConfig.aliasMap
  } : (0, _sdkAliasW29OTN9p.u)({
    modulePath: params.modulePath,
    argv1: params.argvEntry ?? process.argv[1],
    moduleUrl: params.importerUrl,
    ...(params.preferBuiltDist ? { preferBuiltDist: true } : {})
  });
  const cacheKey = (0, _sdkAliasW29OTN9p.r)({
    tryNative,
    aliasMap
  });
  const scopedCacheKey = `${params.jitiFilename ?? params.modulePath}::${params.cacheScopeKey ?? cacheKey}`;
  const cached = params.cache.get(scopedCacheKey);
  if (cached) return cached;
  const loader = (params.createLoader ?? _jiti.createJiti)(params.jitiFilename ?? params.modulePath, {
    ...(0, _sdkAliasW29OTN9p.n)(aliasMap),
    tryNative
  });
  params.cache.set(scopedCacheKey, loader);
  return loader;
}
//#endregion /* v9-16e4c5660d4a69b9 */
