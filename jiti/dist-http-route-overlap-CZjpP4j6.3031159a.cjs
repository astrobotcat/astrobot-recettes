"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = normalizePluginHttpPath;exports.i = canonicalizePathVariant;exports.n = void 0;exports.r = canonicalizePathForSecurity;exports.t = findOverlappingPluginHttpRoute;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/plugins/http-path.ts
function normalizePluginHttpPath(path, fallback) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(path);
  if (!trimmed) {
    const fallbackTrimmed = (0, _stringCoerceBUSzWgUA.s)(fallback);
    if (!fallbackTrimmed) return null;
    return fallbackTrimmed.startsWith("/") ? fallbackTrimmed : `/${fallbackTrimmed}`;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
//#endregion
//#region src/gateway/security-path.ts
const MAX_PATH_DECODE_PASSES = 32;
function normalizePathSeparators(pathname) {
  const collapsed = pathname.replace(/\/{2,}/g, "/");
  if (collapsed.length <= 1) return collapsed;
  return collapsed.replace(/\/+$/, "");
}
function resolveDotSegments(pathname) {
  try {
    return new URL(pathname, "http://localhost").pathname;
  } catch {
    return pathname;
  }
}
function normalizePathForSecurity(pathname) {
  return normalizePathSeparators((0, _stringCoerceBUSzWgUA.i)(resolveDotSegments(pathname))) || "/";
}
function pushNormalizedCandidate(candidates, seen, value) {
  const normalized = normalizePathForSecurity(value);
  if (seen.has(normalized)) return;
  seen.add(normalized);
  candidates.push(normalized);
}
function buildCanonicalPathCandidates(pathname, maxDecodePasses = MAX_PATH_DECODE_PASSES) {
  const candidates = [];
  const seen = /* @__PURE__ */new Set();
  pushNormalizedCandidate(candidates, seen, pathname);
  let decoded = pathname;
  let malformedEncoding = false;
  let decodePasses = 0;
  for (let pass = 0; pass < maxDecodePasses; pass++) {
    let nextDecoded = decoded;
    try {
      nextDecoded = decodeURIComponent(decoded);
    } catch {
      malformedEncoding = true;
      break;
    }
    if (nextDecoded === decoded) break;
    decodePasses += 1;
    decoded = nextDecoded;
    pushNormalizedCandidate(candidates, seen, decoded);
  }
  let decodePassLimitReached = false;
  if (!malformedEncoding) try {
    decodePassLimitReached = decodeURIComponent(decoded) !== decoded;
  } catch {
    malformedEncoding = true;
  }
  return {
    candidates,
    decodePasses,
    decodePassLimitReached,
    malformedEncoding
  };
}
function canonicalizePathVariant(pathname) {
  const { candidates } = buildCanonicalPathCandidates(pathname);
  return candidates[candidates.length - 1] ?? "/";
}
function canonicalizePathForSecurity(pathname) {
  const { candidates, decodePasses, decodePassLimitReached, malformedEncoding } = buildCanonicalPathCandidates(pathname);
  return {
    canonicalPath: candidates[candidates.length - 1] ?? "/",
    candidates,
    decodePasses,
    decodePassLimitReached,
    malformedEncoding,
    rawNormalizedPath: normalizePathSeparators((0, _stringCoerceBUSzWgUA.i)(pathname)) || "/"
  };
}
const PROTECTED_PLUGIN_ROUTE_PREFIXES = exports.n = ["/api/channels"];
//#endregion
//#region src/plugins/http-route-overlap.ts
function prefixMatchPath(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`${prefix}%`);
}
function doPluginHttpRoutesOverlap(a, b) {
  const aPath = canonicalizePathVariant(a.path);
  const bPath = canonicalizePathVariant(b.path);
  if (a.match === "exact" && b.match === "exact") return aPath === bPath;
  if (a.match === "prefix" && b.match === "prefix") return prefixMatchPath(aPath, bPath) || prefixMatchPath(bPath, aPath);
  const prefixRoute = a.match === "prefix" ? a : b;
  return prefixMatchPath(canonicalizePathVariant((a.match === "exact" ? a : b).path), canonicalizePathVariant(prefixRoute.path));
}
function findOverlappingPluginHttpRoute(routes, candidate) {
  return routes.find((route) => doPluginHttpRoutesOverlap(route, candidate));
}
//#endregion /* v9-5c3e3800d69456a5 */
