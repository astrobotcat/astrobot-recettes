"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveRuntimePlatform;exports.i = resolveConfigPath;exports.n = hasBinary;exports.r = isConfigPathTruthyWithDefaults;exports.t = evaluateRuntimeEligibility;var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/shared/config-eval.ts
function isTruthy(value) {
  if (value === void 0 || value === null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}
function resolveConfigPath(config, pathStr) {
  const parts = pathStr.split(".").filter(Boolean);
  let current = config;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return;
    current = current[part];
  }
  return current;
}
function isConfigPathTruthyWithDefaults(config, pathStr, defaults) {
  const value = resolveConfigPath(config, pathStr);
  if (value === void 0 && pathStr in defaults) return defaults[pathStr] ?? false;
  return isTruthy(value);
}
function evaluateRuntimeRequires(params) {
  const requires = params.requires;
  if (!requires) return true;
  const requiredBins = requires.bins ?? [];
  if (requiredBins.length > 0) for (const bin of requiredBins) {
    if (params.hasBin(bin)) continue;
    if (params.hasRemoteBin?.(bin)) continue;
    return false;
  }
  const requiredAnyBins = requires.anyBins ?? [];
  if (requiredAnyBins.length > 0) {
    if (!requiredAnyBins.some((bin) => params.hasBin(bin)) && !params.hasAnyRemoteBin?.(requiredAnyBins)) return false;
  }
  const requiredEnv = requires.env ?? [];
  if (requiredEnv.length > 0) {
    for (const envName of requiredEnv) if (!params.hasEnv(envName)) return false;
  }
  const requiredConfig = requires.config ?? [];
  if (requiredConfig.length > 0) {
    for (const configPath of requiredConfig) if (!params.isConfigPathTruthy(configPath)) return false;
  }
  return true;
}
function evaluateRuntimeEligibility(params) {
  const osList = params.os ?? [];
  const remotePlatforms = params.remotePlatforms ?? [];
  if (osList.length > 0 && !osList.includes(resolveRuntimePlatform()) && !remotePlatforms.some((platform) => osList.includes(platform))) return false;
  if (params.always === true) return true;
  return evaluateRuntimeRequires({
    requires: params.requires,
    hasBin: params.hasBin,
    hasRemoteBin: params.hasRemoteBin,
    hasAnyRemoteBin: params.hasAnyRemoteBin,
    hasEnv: params.hasEnv,
    isConfigPathTruthy: params.isConfigPathTruthy
  });
}
function resolveRuntimePlatform() {
  return process.platform;
}
function windowsPathExtensions() {
  const raw = process.env.PATHEXT;
  return ["", ...(raw !== void 0 ? raw.split(";").map((v) => v.trim()) : [
  ".EXE",
  ".CMD",
  ".BAT",
  ".COM"]).
  filter(Boolean)];
}
let cachedHasBinaryPath;
let cachedHasBinaryPathExt;
const hasBinaryCache = /* @__PURE__ */new Map();
function hasBinary(bin) {
  const pathEnv = process.env.PATH ?? "";
  const pathExt = process.platform === "win32" ? process.env.PATHEXT ?? "" : "";
  if (cachedHasBinaryPath !== pathEnv || cachedHasBinaryPathExt !== pathExt) {
    cachedHasBinaryPath = pathEnv;
    cachedHasBinaryPathExt = pathExt;
    hasBinaryCache.clear();
  }
  if (hasBinaryCache.has(bin)) return hasBinaryCache.get(bin);
  const parts = pathEnv.split(_nodePath.default.delimiter).filter(Boolean);
  const extensions = process.platform === "win32" ? windowsPathExtensions() : [""];
  for (const part of parts) for (const ext of extensions) {
    const candidate = _nodePath.default.join(part, bin + ext);
    try {
      _nodeFs.default.accessSync(candidate, _nodeFs.default.constants.X_OK);
      hasBinaryCache.set(bin, true);
      return true;
    } catch {}
  }
  hasBinaryCache.set(bin, false);
  return false;
}
//#endregion /* v9-451e735d52d3a1b9 */
