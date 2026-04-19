"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = formatBackupCreateSummary;exports.t = createBackupArchive;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _versionBk5OWRN = require("./version-Bk5OW-rN.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
require("./config-Q9XZc_2I.js");
var _artifactsSZgUWHP = require("./artifacts-SZgUWH-P.js");
var _cleanupUtils2ZsKRrxL = require("./cleanup-utils-2ZsKRrxL.js");
var _nodeFs = require("node:fs");
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeOs = _interopRequireDefault(require("node:os"));
var _promises = _interopRequireDefault(require("node:fs/promises"));
var _nodeCrypto = require("node:crypto");
var tar = _interopRequireWildcard(require("tar"));function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/commands/backup-shared.ts
function backupAssetPriority(kind) {
  switch (kind) {
    case "state":return 0;
    case "config":return 1;
    case "credentials":return 2;
    case "workspace":return 3;
  }
  throw new Error("Unsupported backup asset kind");
}
function buildBackupArchiveRoot(nowMs = Date.now()) {
  return `${(0, _artifactsSZgUWHP.t)(nowMs)}-openclaw-backup`;
}
function buildBackupArchiveBasename(nowMs = Date.now()) {
  return `${buildBackupArchiveRoot(nowMs)}.tar.gz`;
}
function encodeAbsolutePathForBackupArchive(sourcePath) {
  const normalized = sourcePath.replaceAll("\\", "/");
  const windowsMatch = normalized.match(/^([A-Za-z]):\/(.*)$/);
  if (windowsMatch) {
    const drive = windowsMatch[1]?.toUpperCase() ?? "UNKNOWN";
    const rest = windowsMatch[2] ?? "";
    return _nodePath.default.posix.join("windows", drive, rest);
  }
  if (normalized.startsWith("/")) return _nodePath.default.posix.join("posix", normalized.slice(1));
  return _nodePath.default.posix.join("relative", normalized);
}
function buildBackupArchivePath(archiveRoot, sourcePath) {
  return _nodePath.default.posix.join(archiveRoot, "payload", encodeAbsolutePathForBackupArchive(sourcePath));
}
async function resolveBackupPlanFromPaths(params) {
  const includeWorkspace = params.includeWorkspace ?? true;
  const onlyConfig = params.onlyConfig ?? false;
  const stateDir = params.stateDir;
  const configPath = params.configPath;
  const oauthDir = params.oauthDir;
  const archiveRoot = buildBackupArchiveRoot(params.nowMs);
  const workspaceDirs = includeWorkspace ? params.workspaceDirs ?? [] : [];
  const configInsideState = params.configInsideState ?? false;
  const oauthInsideState = params.oauthInsideState ?? false;
  if (onlyConfig) {
    const resolvedConfigPath = _nodePath.default.resolve(configPath);
    if (!(await (0, _utilsD5DtWkEu.d)(resolvedConfigPath))) return {
      stateDir,
      configPath,
      oauthDir,
      workspaceDirs: [],
      included: [],
      skipped: [{
        kind: "config",
        sourcePath: resolvedConfigPath,
        displayPath: (0, _utilsD5DtWkEu._)(resolvedConfigPath),
        reason: "missing"
      }]
    };
    const canonicalConfigPath = await canonicalizeExistingPath(resolvedConfigPath);
    return {
      stateDir,
      configPath,
      oauthDir,
      workspaceDirs: [],
      included: [{
        kind: "config",
        sourcePath: canonicalConfigPath,
        displayPath: (0, _utilsD5DtWkEu._)(canonicalConfigPath),
        archivePath: buildBackupArchivePath(archiveRoot, canonicalConfigPath)
      }],
      skipped: []
    };
  }
  const rawCandidates = [
  {
    kind: "state",
    sourcePath: _nodePath.default.resolve(stateDir)
  },
  ...(configInsideState ? [] : [{
    kind: "config",
    sourcePath: _nodePath.default.resolve(configPath)
  }]),
  ...(oauthInsideState ? [] : [{
    kind: "credentials",
    sourcePath: _nodePath.default.resolve(oauthDir)
  }]),
  ...workspaceDirs.map((workspaceDir) => ({
    kind: "workspace",
    sourcePath: _nodePath.default.resolve(workspaceDir)
  }))];

  const candidates = await Promise.all(rawCandidates.map(async (candidate) => {
    const exists = await (0, _utilsD5DtWkEu.d)(candidate.sourcePath);
    return {
      ...candidate,
      exists,
      canonicalPath: exists ? await canonicalizeExistingPath(candidate.sourcePath) : _nodePath.default.resolve(candidate.sourcePath)
    };
  }));
  const uniqueCandidates = [];
  const seenCanonicalPaths = /* @__PURE__ */new Set();
  for (const candidate of [...candidates].toSorted(compareCandidates)) {
    if (seenCanonicalPaths.has(candidate.canonicalPath)) continue;
    seenCanonicalPaths.add(candidate.canonicalPath);
    uniqueCandidates.push(candidate);
  }
  const included = [];
  const skipped = [];
  for (const candidate of uniqueCandidates) {
    if (!candidate.exists) {
      skipped.push({
        kind: candidate.kind,
        sourcePath: candidate.sourcePath,
        displayPath: (0, _utilsD5DtWkEu._)(candidate.sourcePath),
        reason: "missing"
      });
      continue;
    }
    const coveredBy = included.find((asset) => (0, _cleanupUtils2ZsKRrxL.n)(candidate.canonicalPath, asset.sourcePath));
    if (coveredBy) {
      skipped.push({
        kind: candidate.kind,
        sourcePath: candidate.canonicalPath,
        displayPath: (0, _utilsD5DtWkEu._)(candidate.canonicalPath),
        reason: "covered",
        coveredBy: coveredBy.displayPath
      });
      continue;
    }
    included.push({
      kind: candidate.kind,
      sourcePath: candidate.canonicalPath,
      displayPath: (0, _utilsD5DtWkEu._)(candidate.canonicalPath),
      archivePath: buildBackupArchivePath(archiveRoot, candidate.canonicalPath)
    });
  }
  return {
    stateDir,
    configPath,
    oauthDir,
    workspaceDirs: workspaceDirs.map((entry) => _nodePath.default.resolve(entry)),
    included,
    skipped
  };
}
function compareCandidates(left, right) {
  const depthDelta = left.canonicalPath.length - right.canonicalPath.length;
  if (depthDelta !== 0) return depthDelta;
  const priorityDelta = backupAssetPriority(left.kind) - backupAssetPriority(right.kind);
  if (priorityDelta !== 0) return priorityDelta;
  return left.canonicalPath.localeCompare(right.canonicalPath);
}
async function canonicalizeExistingPath(targetPath) {
  try {
    return await _promises.default.realpath(targetPath);
  } catch {
    return _nodePath.default.resolve(targetPath);
  }
}
async function resolveBackupPlanFromDisk(params = {}) {
  const includeWorkspace = params.includeWorkspace ?? true;
  const onlyConfig = params.onlyConfig ?? false;
  const stateDir = (0, _pathsDvv9VRAc._)();
  const configPath = (0, _pathsDvv9VRAc.o)();
  const oauthDir = (0, _pathsDvv9VRAc.h)();
  const configSnapshot = await (0, _io5pxHCi7V.l)();
  if (includeWorkspace && configSnapshot.exists && !configSnapshot.valid) throw new Error(`Config invalid at ${(0, _utilsD5DtWkEu._)(configSnapshot.path)}. OpenClaw cannot reliably discover custom workspaces for backup. Fix the config or rerun with --no-include-workspace for a partial backup.`);
  const cleanupPlan = (0, _cleanupUtils2ZsKRrxL.t)({
    cfg: configSnapshot.config,
    stateDir,
    configPath,
    oauthDir
  });
  return await resolveBackupPlanFromPaths({
    stateDir,
    configPath,
    oauthDir,
    workspaceDirs: includeWorkspace ? cleanupPlan.workspaceDirs : [],
    includeWorkspace,
    onlyConfig,
    configInsideState: cleanupPlan.configInsideState,
    oauthInsideState: cleanupPlan.oauthInsideState,
    nowMs: params.nowMs
  });
}
//#endregion
//#region src/infra/backup-create.ts
async function resolveOutputPath(params) {
  const basename = buildBackupArchiveBasename(params.nowMs);
  const rawOutput = params.output?.trim();
  if (!rawOutput) {
    const cwd = _nodePath.default.resolve(process.cwd());
    const canonicalCwd = await _promises.default.realpath(cwd).catch(() => cwd);
    const defaultDir = params.includedAssets.some((asset) => (0, _cleanupUtils2ZsKRrxL.n)(canonicalCwd, asset.sourcePath)) ? (0, _utilsD5DtWkEu.p)() ?? _nodePath.default.dirname(params.stateDir) : cwd;
    return _nodePath.default.resolve(defaultDir, basename);
  }
  const resolved = (0, _utilsD5DtWkEu.m)(rawOutput);
  if (rawOutput.endsWith("/") || rawOutput.endsWith("\\")) return _nodePath.default.join(resolved, basename);
  try {
    if ((await _promises.default.stat(resolved)).isDirectory()) return _nodePath.default.join(resolved, basename);
  } catch {}
  return resolved;
}
async function assertOutputPathReady(outputPath) {
  try {
    await _promises.default.access(outputPath);
    throw new Error(`Refusing to overwrite existing backup archive: ${outputPath}`);
  } catch (err) {
    if (err?.code === "ENOENT") return;
    throw err;
  }
}
function buildTempArchivePath(outputPath) {
  return `${outputPath}.${(0, _nodeCrypto.randomUUID)()}.tmp`;
}
function isLinkUnsupportedError(code) {
  return code === "ENOTSUP" || code === "EOPNOTSUPP" || code === "EPERM";
}
async function publishTempArchive(params) {
  try {
    await _promises.default.link(params.tempArchivePath, params.outputPath);
  } catch (err) {
    const code = err?.code;
    if (code === "EEXIST") throw new Error(`Refusing to overwrite existing backup archive: ${params.outputPath}`, { cause: err });
    if (!isLinkUnsupportedError(code)) throw err;
    try {
      await _promises.default.copyFile(params.tempArchivePath, params.outputPath, _nodeFs.constants.COPYFILE_EXCL);
    } catch (copyErr) {
      const copyCode = copyErr?.code;
      if (copyCode !== "EEXIST") await _promises.default.rm(params.outputPath, { force: true }).catch(() => void 0);
      if (copyCode === "EEXIST") throw new Error(`Refusing to overwrite existing backup archive: ${params.outputPath}`, { cause: copyErr });
      throw copyErr;
    }
  }
  await _promises.default.rm(params.tempArchivePath, { force: true });
}
async function canonicalizePathForContainment(targetPath) {
  const resolved = _nodePath.default.resolve(targetPath);
  const suffix = [];
  let probe = resolved;
  while (true) try {
    const realProbe = await _promises.default.realpath(probe);
    return suffix.length === 0 ? realProbe : _nodePath.default.join(realProbe, ...suffix.toReversed());
  } catch {
    const parent = _nodePath.default.dirname(probe);
    if (parent === probe) return resolved;
    suffix.push(_nodePath.default.basename(probe));
    probe = parent;
  }
}
function buildManifest(params) {
  return {
    schemaVersion: 1,
    createdAt: params.createdAt,
    archiveRoot: params.archiveRoot,
    runtimeVersion: (0, _versionBk5OWRN.s)(),
    platform: process.platform,
    nodeVersion: process.version,
    options: {
      includeWorkspace: params.includeWorkspace,
      onlyConfig: params.onlyConfig
    },
    paths: {
      stateDir: params.stateDir,
      configPath: params.configPath,
      oauthDir: params.oauthDir,
      workspaceDirs: params.workspaceDirs
    },
    assets: params.assets.map((asset) => ({
      kind: asset.kind,
      sourcePath: asset.sourcePath,
      archivePath: asset.archivePath
    })),
    skipped: params.skipped.map((entry) => ({
      kind: entry.kind,
      sourcePath: entry.sourcePath,
      reason: entry.reason,
      coveredBy: entry.coveredBy
    }))
  };
}
function formatBackupCreateSummary(result) {
  const lines = [`Backup archive: ${result.archivePath}`];
  lines.push(`Included ${result.assets.length} path${result.assets.length === 1 ? "" : "s"}:`);
  for (const asset of result.assets) lines.push(`- ${asset.kind}: ${asset.displayPath}`);
  if (result.skipped.length > 0) {
    lines.push(`Skipped ${result.skipped.length} path${result.skipped.length === 1 ? "" : "s"}:`);
    for (const entry of result.skipped) if (entry.reason === "covered" && entry.coveredBy) lines.push(`- ${entry.kind}: ${entry.displayPath} (${entry.reason} by ${entry.coveredBy})`);else
    lines.push(`- ${entry.kind}: ${entry.displayPath} (${entry.reason})`);
  }
  if (result.dryRun) lines.push("Dry run only; archive was not written.");else
  {
    lines.push(`Created ${result.archivePath}`);
    if (result.verified) lines.push("Archive verification: passed");
  }
  return lines;
}
function remapArchiveEntryPath(params) {
  const normalizedEntry = _nodePath.default.resolve(params.entryPath);
  if (normalizedEntry === params.manifestPath) return _nodePath.default.posix.join(params.archiveRoot, "manifest.json");
  return buildBackupArchivePath(params.archiveRoot, normalizedEntry);
}
async function createBackupArchive(opts = {}) {
  const nowMs = opts.nowMs ?? Date.now();
  const archiveRoot = buildBackupArchiveRoot(nowMs);
  const onlyConfig = Boolean(opts.onlyConfig);
  const includeWorkspace = onlyConfig ? false : opts.includeWorkspace ?? true;
  const plan = await resolveBackupPlanFromDisk({
    includeWorkspace,
    onlyConfig,
    nowMs
  });
  const outputPath = await resolveOutputPath({
    output: opts.output,
    nowMs,
    includedAssets: plan.included,
    stateDir: plan.stateDir
  });
  if (plan.included.length === 0) throw new Error(onlyConfig ? "No OpenClaw config file was found to back up." : "No local OpenClaw state was found to back up.");
  const canonicalOutputPath = await canonicalizePathForContainment(outputPath);
  const overlappingAsset = plan.included.find((asset) => (0, _cleanupUtils2ZsKRrxL.n)(canonicalOutputPath, asset.sourcePath));
  if (overlappingAsset) throw new Error(`Backup output must not be written inside a source path: ${outputPath} is inside ${overlappingAsset.sourcePath}`);
  if (!opts.dryRun) await assertOutputPathReady(outputPath);
  const createdAt = new Date(nowMs).toISOString();
  const result = {
    createdAt,
    archiveRoot,
    archivePath: outputPath,
    dryRun: Boolean(opts.dryRun),
    includeWorkspace,
    onlyConfig,
    verified: false,
    assets: plan.included,
    skipped: plan.skipped
  };
  if (opts.dryRun) return result;
  await _promises.default.mkdir(_nodePath.default.dirname(outputPath), { recursive: true });
  const tempDir = await _promises.default.mkdtemp(_nodePath.default.join(_nodeOs.default.tmpdir(), "openclaw-backup-"));
  const manifestPath = _nodePath.default.join(tempDir, "manifest.json");
  const tempArchivePath = buildTempArchivePath(outputPath);
  try {
    const manifest = buildManifest({
      createdAt,
      archiveRoot,
      includeWorkspace,
      onlyConfig,
      assets: result.assets,
      skipped: result.skipped,
      stateDir: plan.stateDir,
      configPath: plan.configPath,
      oauthDir: plan.oauthDir,
      workspaceDirs: plan.workspaceDirs
    });
    await _promises.default.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    await tar.c({
      file: tempArchivePath,
      gzip: true,
      portable: true,
      preservePaths: true,
      onWriteEntry: (entry) => {
        entry.path = remapArchiveEntryPath({
          entryPath: entry.path,
          manifestPath,
          archiveRoot
        });
      }
    }, [manifestPath, ...result.assets.map((asset) => asset.sourcePath)]);
    await publishTempArchive({
      tempArchivePath,
      outputPath
    });
  } finally {
    await _promises.default.rm(tempArchivePath, { force: true }).catch(() => void 0);
    await _promises.default.rm(tempDir, {
      recursive: true,
      force: true
    }).catch(() => void 0);
  }
  return result;
}
//#endregion /* v9-d138dcfc446efddc */
