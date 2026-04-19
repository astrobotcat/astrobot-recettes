"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolvePluginSourceRoots;exports.n = discoverOpenClawPlugins;exports.r = resolvePluginCacheInputs;exports.t = clearPluginDiscoveryCache;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _bundledDirD4Wk35JT = require("./bundled-dir-D4Wk35JT.js");
var _boundaryFileReadDXLy_w6L = require("./boundary-file-read-DXLy_w6L.js");
var _manifestDKZWfJEu = require("./manifest-DKZWfJEu.js");
var _pathSafetyCMqhKBu = require("./path-safety-cMqhKBu0.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugins/roots.ts
function resolvePluginSourceRoots(params) {
  const env = params.env ?? process.env;
  const workspaceRoot = params.workspaceDir ? (0, _utilsD5DtWkEu.m)(params.workspaceDir, env) : void 0;
  return {
    stock: (0, _bundledDirD4Wk35JT.t)(env),
    global: _nodePath.default.join((0, _utilsD5DtWkEu.f)(env), "extensions"),
    workspace: workspaceRoot ? _nodePath.default.join(workspaceRoot, ".openclaw", "extensions") : void 0
  };
}
function resolvePluginCacheInputs(params) {
  const env = params.env ?? process.env;
  return {
    roots: resolvePluginSourceRoots({
      workspaceDir: params.workspaceDir,
      env
    }),
    loadPaths: (params.loadPaths ?? []).filter((entry) => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean).map((entry) => (0, _utilsD5DtWkEu.m)(entry, env))
  };
}
//#endregion
//#region src/plugins/discovery.ts
const EXTENSION_EXTS = new Set([
".ts",
".js",
".mts",
".cts",
".mjs",
".cjs"]
);
const SCANNED_DIRECTORY_IGNORE_NAMES = new Set([
".git",
".hg",
".svn",
".turbo",
".yarn",
".yarn-cache",
"build",
"coverage",
"dist",
"node_modules"]
);
const discoveryCache = /* @__PURE__ */new Map();
const DEFAULT_DISCOVERY_CACHE_MS = 1e3;
function clearPluginDiscoveryCache() {
  discoveryCache.clear();
}
function resolveDiscoveryCacheMs(env) {
  const raw = env.OPENCLAW_PLUGIN_DISCOVERY_CACHE_MS?.trim();
  if (raw === "" || raw === "0") return 0;
  if (!raw) return DEFAULT_DISCOVERY_CACHE_MS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_DISCOVERY_CACHE_MS;
  return Math.max(0, parsed);
}
function shouldUseDiscoveryCache(env) {
  if (env.OPENCLAW_DISABLE_PLUGIN_DISCOVERY_CACHE?.trim()) return false;
  return resolveDiscoveryCacheMs(env) > 0;
}
function buildDiscoveryCacheKey(params) {
  const { roots, loadPaths } = resolvePluginCacheInputs({
    workspaceDir: params.workspaceDir,
    loadPaths: params.extraPaths,
    env: params.env
  });
  const workspaceKey = roots.workspace ?? "";
  const configExtensionsRoot = roots.global ?? "";
  const bundledRoot = roots.stock ?? "";
  return `${workspaceKey}::${params.ownershipUid ?? currentUid() ?? "none"}::${configExtensionsRoot}::${bundledRoot}::${JSON.stringify(loadPaths)}`;
}
function currentUid(overrideUid) {
  if (overrideUid !== void 0) return overrideUid;
  if (process.platform === "win32") return null;
  if (typeof process.getuid !== "function") return null;
  return process.getuid();
}
function checkSourceEscapesRoot(params) {
  const sourceRealPath = (0, _pathSafetyCMqhKBu.r)(params.source);
  const rootRealPath = (0, _pathSafetyCMqhKBu.r)(params.rootDir);
  if (!sourceRealPath || !rootRealPath) return null;
  if ((0, _pathSafetyCMqhKBu.n)(rootRealPath, sourceRealPath)) return null;
  return {
    reason: "source_escapes_root",
    sourcePath: params.source,
    rootPath: params.rootDir,
    targetPath: params.source,
    sourceRealPath,
    rootRealPath
  };
}
function checkPathStatAndPermissions(params) {
  if (process.platform === "win32") return null;
  const pathsToCheck = [params.rootDir, params.source];
  const seen = /* @__PURE__ */new Set();
  for (const targetPath of pathsToCheck) {
    const normalized = _nodePath.default.resolve(targetPath);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    let stat = (0, _pathSafetyCMqhKBu.i)(targetPath);
    if (!stat) return {
      reason: "path_stat_failed",
      sourcePath: params.source,
      rootPath: params.rootDir,
      targetPath
    };
    let modeBits = stat.mode & 511;
    if ((modeBits & 2) !== 0 && params.origin === "bundled") try {
      _nodeFs.default.chmodSync(targetPath, modeBits & -19);
      const repairedStat = (0, _pathSafetyCMqhKBu.i)(targetPath);
      if (!repairedStat) return {
        reason: "path_stat_failed",
        sourcePath: params.source,
        rootPath: params.rootDir,
        targetPath
      };
      stat = repairedStat;
      modeBits = repairedStat.mode & 511;
    } catch {}
    if ((modeBits & 2) !== 0) return {
      reason: "path_world_writable",
      sourcePath: params.source,
      rootPath: params.rootDir,
      targetPath,
      modeBits
    };
    if (params.origin !== "bundled" && params.uid !== null && typeof stat.uid === "number" && stat.uid !== params.uid && stat.uid !== 0) return {
      reason: "path_suspicious_ownership",
      sourcePath: params.source,
      rootPath: params.rootDir,
      targetPath,
      foundUid: stat.uid,
      expectedUid: params.uid
    };
  }
  return null;
}
function findCandidateBlockIssue(params) {
  const escaped = checkSourceEscapesRoot({
    source: params.source,
    rootDir: params.rootDir
  });
  if (escaped) return escaped;
  return checkPathStatAndPermissions({
    source: params.source,
    rootDir: params.rootDir,
    origin: params.origin,
    uid: currentUid(params.ownershipUid)
  });
}
function formatCandidateBlockMessage(issue) {
  if (issue.reason === "source_escapes_root") return `blocked plugin candidate: source escapes plugin root (${issue.sourcePath} -> ${issue.sourceRealPath}; root=${issue.rootRealPath})`;
  if (issue.reason === "path_stat_failed") return `blocked plugin candidate: cannot stat path (${issue.targetPath})`;
  if (issue.reason === "path_world_writable") return `blocked plugin candidate: world-writable path (${issue.targetPath}, mode=${(0, _pathSafetyCMqhKBu.t)(issue.modeBits ?? 0)})`;
  return `blocked plugin candidate: suspicious ownership (${issue.targetPath}, uid=${issue.foundUid}, expected uid=${issue.expectedUid} or root)`;
}
function isUnsafePluginCandidate(params) {
  const issue = findCandidateBlockIssue({
    source: params.source,
    rootDir: params.rootDir,
    origin: params.origin,
    ownershipUid: params.ownershipUid
  });
  if (!issue) return false;
  params.diagnostics.push({
    level: "warn",
    source: issue.targetPath,
    message: formatCandidateBlockMessage(issue)
  });
  return true;
}
function isExtensionFile(filePath) {
  const ext = _nodePath.default.extname(filePath);
  if (!EXTENSION_EXTS.has(ext)) return false;
  if (filePath.endsWith(".d.ts")) return false;
  const baseName = (0, _stringCoerceBUSzWgUA.i)(_nodePath.default.basename(filePath));
  return !baseName.includes(".test.") && !baseName.includes(".live.test.") && !baseName.includes(".e2e.test.");
}
function shouldIgnoreScannedDirectory(dirName) {
  const normalized = (0, _stringCoerceBUSzWgUA.i)(dirName);
  if (!normalized) return true;
  if (SCANNED_DIRECTORY_IGNORE_NAMES.has(normalized)) return true;
  if (normalized.endsWith(".bak")) return true;
  if (normalized.includes(".backup-")) return true;
  if (normalized.includes(".disabled")) return true;
  return false;
}
function resolvesToSameDirectory(left, right) {
  if (!left || !right) return false;
  const leftRealPath = (0, _pathSafetyCMqhKBu.r)(left);
  const rightRealPath = (0, _pathSafetyCMqhKBu.r)(right);
  if (leftRealPath && rightRealPath) return leftRealPath === rightRealPath;
  return _nodePath.default.resolve(left) === _nodePath.default.resolve(right);
}
function readPackageManifest(dir, rejectHardlinks = true) {
  const opened = (0, _boundaryFileReadDXLy_w6L.i)({
    absolutePath: _nodePath.default.join(dir, "package.json"),
    rootPath: dir,
    boundaryLabel: "plugin package directory",
    rejectHardlinks
  });
  if (!opened.ok) return null;
  try {
    const raw = _nodeFs.default.readFileSync(opened.fd, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  } finally {
    _nodeFs.default.closeSync(opened.fd);
  }
}
function deriveIdHint(params) {
  const base = _nodePath.default.basename(params.filePath, _nodePath.default.extname(params.filePath));
  const rawManifestId = params.manifestId?.trim();
  if (rawManifestId) return params.hasMultipleExtensions ? `${rawManifestId}/${base}` : rawManifestId;
  const rawPackageName = params.packageName?.trim();
  if (!rawPackageName) return base;
  const unscoped = rawPackageName.includes("/") ? rawPackageName.split("/").pop() ?? rawPackageName : rawPackageName;
  const normalizedPackageId = unscoped.endsWith("-provider") && unscoped.length > 9 ? unscoped.slice(0, -9) : unscoped;
  if (!params.hasMultipleExtensions) return normalizedPackageId;
  return `${normalizedPackageId}/${base}`;
}
function resolveIdHintManifestId(rootDir, rejectHardlinks) {
  const manifest = (0, _manifestDKZWfJEu.i)(rootDir, rejectHardlinks);
  return manifest.ok ? manifest.manifest.id : void 0;
}
function addCandidate(params) {
  const resolved = _nodePath.default.resolve(params.source);
  if (params.seen.has(resolved)) return;
  const resolvedRoot = (0, _pathSafetyCMqhKBu.r)(params.rootDir) ?? _nodePath.default.resolve(params.rootDir);
  if (isUnsafePluginCandidate({
    source: resolved,
    rootDir: resolvedRoot,
    origin: params.origin,
    diagnostics: params.diagnostics,
    ownershipUid: params.ownershipUid
  })) return;
  params.seen.add(resolved);
  const manifest = params.manifest ?? null;
  params.candidates.push({
    idHint: params.idHint,
    source: resolved,
    setupSource: params.setupSource,
    rootDir: resolvedRoot,
    origin: params.origin,
    format: params.format ?? "openclaw",
    bundleFormat: params.bundleFormat,
    workspaceDir: params.workspaceDir,
    packageName: (0, _stringCoerceBUSzWgUA.s)(manifest?.name),
    packageVersion: (0, _stringCoerceBUSzWgUA.s)(manifest?.version),
    packageDescription: (0, _stringCoerceBUSzWgUA.s)(manifest?.description),
    packageDir: params.packageDir,
    packageManifest: (0, _manifestDKZWfJEu.r)(manifest ?? void 0),
    bundledManifest: params.bundledManifest,
    bundledManifestPath: params.bundledManifestPath
  });
}
function discoverBundleInRoot(params) {
  const bundleFormat = (0, _pathSafetyCMqhKBu.c)(params.rootDir);
  if (!bundleFormat) return "none";
  const bundleManifest = (0, _pathSafetyCMqhKBu.l)({
    rootDir: params.rootDir,
    bundleFormat,
    rejectHardlinks: params.origin !== "bundled"
  });
  if (!bundleManifest.ok) {
    params.diagnostics.push({
      level: "error",
      message: bundleManifest.error,
      source: bundleManifest.manifestPath
    });
    return "invalid";
  }
  addCandidate({
    candidates: params.candidates,
    diagnostics: params.diagnostics,
    seen: params.seen,
    idHint: bundleManifest.manifest.id,
    source: params.rootDir,
    rootDir: params.rootDir,
    origin: params.origin,
    format: "bundle",
    bundleFormat,
    ownershipUid: params.ownershipUid,
    workspaceDir: params.workspaceDir
  });
  return "added";
}
function resolvePackageEntrySource(params) {
  const source = _nodePath.default.resolve(params.packageDir, params.entryPath);
  const rejectHardlinks = params.rejectHardlinks ?? true;
  const candidates = [source];
  const openCandidate = (absolutePath) => {
    const opened = (0, _boundaryFileReadDXLy_w6L.i)({
      absolutePath,
      rootPath: params.packageDir,
      boundaryLabel: "plugin package directory",
      rejectHardlinks
    });
    if (!opened.ok) return (0, _boundaryFileReadDXLy_w6L.n)(opened, {
      path: () => null,
      io: () => {
        params.diagnostics.push({
          level: "warn",
          message: `extension entry unreadable (I/O error): ${params.entryPath}`,
          source: params.sourceLabel
        });
        return null;
      },
      fallback: () => {
        params.diagnostics.push({
          level: "error",
          message: `extension entry escapes package directory: ${params.entryPath}`,
          source: params.sourceLabel
        });
        return null;
      }
    });
    const safeSource = opened.path;
    _nodeFs.default.closeSync(opened.fd);
    return safeSource;
  };
  if (!rejectHardlinks) {
    const builtCandidate = source.replace(/\.[^.]+$/u, ".js");
    if (builtCandidate !== source) candidates.push(builtCandidate);
  }
  for (const candidate of new Set(candidates)) {
    if (!_nodeFs.default.existsSync(candidate)) continue;
    return openCandidate(candidate);
  }
  return openCandidate(source);
}
function discoverInDirectory(params) {
  if (!_nodeFs.default.existsSync(params.dir)) return;
  const resolvedDir = (0, _pathSafetyCMqhKBu.r)(params.dir) ?? _nodePath.default.resolve(params.dir);
  if (params.recurseDirectories) {
    if (params.visitedDirectories?.has(resolvedDir)) return;
    params.visitedDirectories?.add(resolvedDir);
  }
  let entries = [];
  try {
    entries = _nodeFs.default.readdirSync(params.dir, { withFileTypes: true });
  } catch (err) {
    params.diagnostics.push({
      level: "warn",
      message: `failed to read extensions dir: ${params.dir} (${String(err)})`,
      source: params.dir
    });
    return;
  }
  for (const entry of entries) {
    const fullPath = _nodePath.default.join(params.dir, entry.name);
    if (entry.isFile()) {
      if (!isExtensionFile(fullPath)) continue;
      addCandidate({
        candidates: params.candidates,
        diagnostics: params.diagnostics,
        seen: params.seen,
        idHint: _nodePath.default.basename(entry.name, _nodePath.default.extname(entry.name)),
        source: fullPath,
        rootDir: _nodePath.default.dirname(fullPath),
        origin: params.origin,
        ownershipUid: params.ownershipUid,
        workspaceDir: params.workspaceDir
      });
    }
    if (!entry.isDirectory()) continue;
    if (params.skipDirectories?.has(entry.name)) continue;
    if (shouldIgnoreScannedDirectory(entry.name)) continue;
    const rejectHardlinks = params.origin !== "bundled";
    const manifest = readPackageManifest(fullPath, rejectHardlinks);
    const extensionResolution = (0, _manifestDKZWfJEu.a)(manifest ?? void 0);
    const extensions = extensionResolution.status === "ok" ? extensionResolution.entries : [];
    const manifestId = resolveIdHintManifestId(fullPath, rejectHardlinks);
    const setupEntryPath = (0, _manifestDKZWfJEu.r)(manifest ?? void 0)?.setupEntry;
    const setupSource = typeof setupEntryPath === "string" && setupEntryPath.trim().length > 0 ? resolvePackageEntrySource({
      packageDir: fullPath,
      entryPath: setupEntryPath,
      sourceLabel: fullPath,
      diagnostics: params.diagnostics,
      rejectHardlinks
    }) : null;
    if (extensions.length > 0) {
      for (const extPath of extensions) {
        const resolved = resolvePackageEntrySource({
          packageDir: fullPath,
          entryPath: extPath,
          sourceLabel: fullPath,
          diagnostics: params.diagnostics,
          rejectHardlinks
        });
        if (!resolved) continue;
        addCandidate({
          candidates: params.candidates,
          diagnostics: params.diagnostics,
          seen: params.seen,
          idHint: deriveIdHint({
            filePath: resolved,
            manifestId,
            packageName: manifest?.name,
            hasMultipleExtensions: extensions.length > 1
          }),
          source: resolved,
          ...(setupSource ? { setupSource } : {}),
          rootDir: fullPath,
          origin: params.origin,
          ownershipUid: params.ownershipUid,
          workspaceDir: params.workspaceDir,
          manifest,
          packageDir: fullPath
        });
      }
      continue;
    }
    if (discoverBundleInRoot({
      rootDir: fullPath,
      origin: params.origin,
      ownershipUid: params.ownershipUid,
      workspaceDir: params.workspaceDir,
      candidates: params.candidates,
      diagnostics: params.diagnostics,
      seen: params.seen
    }) === "added") continue;
    const indexFile = [..._manifestDKZWfJEu.t].map((candidate) => _nodePath.default.join(fullPath, candidate)).find((candidate) => _nodeFs.default.existsSync(candidate));
    if (indexFile && isExtensionFile(indexFile)) {
      addCandidate({
        candidates: params.candidates,
        diagnostics: params.diagnostics,
        seen: params.seen,
        idHint: entry.name,
        source: indexFile,
        ...(setupSource ? { setupSource } : {}),
        rootDir: fullPath,
        origin: params.origin,
        ownershipUid: params.ownershipUid,
        workspaceDir: params.workspaceDir,
        manifest,
        packageDir: fullPath
      });
      continue;
    }
    if (params.recurseDirectories) discoverInDirectory({
      ...params,
      dir: fullPath
    });
  }
}
function discoverFromPath(params) {
  const resolved = (0, _utilsD5DtWkEu.m)(params.rawPath, params.env);
  if (!_nodeFs.default.existsSync(resolved)) {
    params.diagnostics.push({
      level: "error",
      message: `plugin path not found: ${resolved}`,
      source: resolved
    });
    return;
  }
  const stat = _nodeFs.default.statSync(resolved);
  if (stat.isFile()) {
    if (!isExtensionFile(resolved)) {
      params.diagnostics.push({
        level: "error",
        message: `plugin path is not a supported file: ${resolved}`,
        source: resolved
      });
      return;
    }
    addCandidate({
      candidates: params.candidates,
      diagnostics: params.diagnostics,
      seen: params.seen,
      idHint: _nodePath.default.basename(resolved, _nodePath.default.extname(resolved)),
      source: resolved,
      rootDir: _nodePath.default.dirname(resolved),
      origin: params.origin,
      ownershipUid: params.ownershipUid,
      workspaceDir: params.workspaceDir
    });
    return;
  }
  if (stat.isDirectory()) {
    const rejectHardlinks = params.origin !== "bundled";
    const manifest = readPackageManifest(resolved, rejectHardlinks);
    const extensionResolution = (0, _manifestDKZWfJEu.a)(manifest ?? void 0);
    const extensions = extensionResolution.status === "ok" ? extensionResolution.entries : [];
    const manifestId = resolveIdHintManifestId(resolved, rejectHardlinks);
    const setupEntryPath = (0, _manifestDKZWfJEu.r)(manifest ?? void 0)?.setupEntry;
    const setupSource = typeof setupEntryPath === "string" && setupEntryPath.trim().length > 0 ? resolvePackageEntrySource({
      packageDir: resolved,
      entryPath: setupEntryPath,
      sourceLabel: resolved,
      diagnostics: params.diagnostics,
      rejectHardlinks
    }) : null;
    if (extensions.length > 0) {
      for (const extPath of extensions) {
        const source = resolvePackageEntrySource({
          packageDir: resolved,
          entryPath: extPath,
          sourceLabel: resolved,
          diagnostics: params.diagnostics,
          rejectHardlinks
        });
        if (!source) continue;
        addCandidate({
          candidates: params.candidates,
          diagnostics: params.diagnostics,
          seen: params.seen,
          idHint: deriveIdHint({
            filePath: source,
            manifestId,
            packageName: manifest?.name,
            hasMultipleExtensions: extensions.length > 1
          }),
          source,
          ...(setupSource ? { setupSource } : {}),
          rootDir: resolved,
          origin: params.origin,
          ownershipUid: params.ownershipUid,
          workspaceDir: params.workspaceDir,
          manifest,
          packageDir: resolved
        });
      }
      return;
    }
    if (discoverBundleInRoot({
      rootDir: resolved,
      origin: params.origin,
      ownershipUid: params.ownershipUid,
      workspaceDir: params.workspaceDir,
      candidates: params.candidates,
      diagnostics: params.diagnostics,
      seen: params.seen
    }) === "added") return;
    const indexFile = [..._manifestDKZWfJEu.t].map((candidate) => _nodePath.default.join(resolved, candidate)).find((candidate) => _nodeFs.default.existsSync(candidate));
    if (indexFile && isExtensionFile(indexFile)) {
      addCandidate({
        candidates: params.candidates,
        diagnostics: params.diagnostics,
        seen: params.seen,
        idHint: _nodePath.default.basename(resolved),
        source: indexFile,
        ...(setupSource ? { setupSource } : {}),
        rootDir: resolved,
        origin: params.origin,
        ownershipUid: params.ownershipUid,
        workspaceDir: params.workspaceDir,
        manifest,
        packageDir: resolved
      });
      return;
    }
    discoverInDirectory({
      dir: resolved,
      origin: params.origin,
      ownershipUid: params.ownershipUid,
      workspaceDir: params.workspaceDir,
      candidates: params.candidates,
      diagnostics: params.diagnostics,
      seen: params.seen
    });
    return;
  }
}
function discoverOpenClawPlugins(params) {
  const env = params.env ?? process.env;
  const cacheEnabled = params.cache !== false && shouldUseDiscoveryCache(env);
  const cacheKey = buildDiscoveryCacheKey({
    workspaceDir: params.workspaceDir,
    extraPaths: params.extraPaths,
    ownershipUid: params.ownershipUid,
    env
  });
  if (cacheEnabled) {
    const cached = discoveryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.result;
  }
  const candidates = [];
  const diagnostics = [];
  const seen = /* @__PURE__ */new Set();
  const workspaceDir = (0, _stringCoerceBUSzWgUA.s)(params.workspaceDir);
  const workspaceRoot = workspaceDir ? (0, _utilsD5DtWkEu.m)(workspaceDir, env) : void 0;
  const roots = resolvePluginSourceRoots({
    workspaceDir: workspaceRoot,
    env
  });
  const extra = params.extraPaths ?? [];
  for (const extraPath of extra) {
    if (typeof extraPath !== "string") continue;
    const trimmed = extraPath.trim();
    if (!trimmed) continue;
    discoverFromPath({
      rawPath: trimmed,
      origin: "config",
      ownershipUid: params.ownershipUid,
      workspaceDir,
      env,
      candidates,
      diagnostics,
      seen
    });
  }
  const workspaceMatchesBundledRoot = resolvesToSameDirectory(workspaceRoot, roots.stock);
  if (roots.workspace && workspaceRoot && !workspaceMatchesBundledRoot) discoverInDirectory({
    dir: roots.workspace,
    origin: "workspace",
    ownershipUid: params.ownershipUid,
    workspaceDir: workspaceRoot,
    candidates,
    diagnostics,
    seen
  });
  if (roots.stock) discoverInDirectory({
    dir: roots.stock,
    origin: "bundled",
    ownershipUid: params.ownershipUid,
    candidates,
    diagnostics,
    seen
  });
  discoverInDirectory({
    dir: roots.global,
    origin: "global",
    ownershipUid: params.ownershipUid,
    candidates,
    diagnostics,
    seen
  });
  const result = {
    candidates,
    diagnostics
  };
  if (cacheEnabled) {
    const ttl = resolveDiscoveryCacheMs(env);
    if (ttl > 0) discoveryCache.set(cacheKey, {
      expiresAt: Date.now() + ttl,
      result
    });
  }
  return result;
}
//#endregion /* v9-e1e5e12d9f9f6e0a */
