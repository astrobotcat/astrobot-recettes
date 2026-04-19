"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = createTarEntryPreflightChecker;exports.c = readJsonFile;exports.d = mergeExtractedTreeIntoDestination;exports.f = prepareArchiveDestinationDir;exports.i = void 0;exports.l = resolveArchiveKind;exports.n = void 0;exports.o = extractArchive;exports.p = withStagedArchiveDestination;exports.r = void 0;exports.s = fileExists;exports.t = void 0;exports.u = resolvePackedRootDir;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _fileIdentityEQApOIDl = require("./file-identity-eQApOIDl.js");
var _fsSafeB7mHodgb = require("./fs-safe-B7mHodgb.js");
var _archivePathDHk17wYF = require("./archive-path-DHk17wYF.js");
var _nodeFs = require("node:fs");
var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = _interopRequireDefault(require("node:fs/promises"));
var _nodeCrypto = require("node:crypto");
var _nodeStream = require("node:stream");
var _promises2 = require("node:stream/promises");
var tar = _interopRequireWildcard(require("tar"));
var _jszip = _interopRequireDefault(require("jszip"));function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/archive-staging.ts
const ERROR_ARCHIVE_ENTRY_TRAVERSES_SYMLINK = "archive entry traverses symlink in destination";
var ArchiveSecurityError = class extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.code = code;
    this.name = "ArchiveSecurityError";
  }
};
function symlinkTraversalError$1(originalPath) {
  return new ArchiveSecurityError("destination-symlink-traversal", `${ERROR_ARCHIVE_ENTRY_TRAVERSES_SYMLINK}: ${originalPath}`);
}
async function prepareArchiveDestinationDir(destDir) {
  const stat = await _promises.default.lstat(destDir);
  if (stat.isSymbolicLink()) throw new ArchiveSecurityError("destination-symlink", "archive destination is a symlink");
  if (!stat.isDirectory()) throw new ArchiveSecurityError("destination-not-directory", "archive destination is not a directory");
  return await _promises.default.realpath(destDir);
}
async function assertNoSymlinkTraversal(params) {
  const parts = params.relPath.split(/[\\/]+/).filter(Boolean);
  let current = _nodePath.default.resolve(params.rootDir);
  for (const part of parts) {
    current = _nodePath.default.join(current, part);
    let stat;
    try {
      stat = await _promises.default.lstat(current);
    } catch (err) {
      if ((0, _fileIdentityEQApOIDl.s)(err)) continue;
      throw err;
    }
    if (stat.isSymbolicLink()) throw symlinkTraversalError$1(params.originalPath);
  }
}
async function assertResolvedInsideDestination(params) {
  let resolved;
  try {
    resolved = await _promises.default.realpath(params.targetPath);
  } catch (err) {
    if ((0, _fileIdentityEQApOIDl.s)(err)) return;
    throw err;
  }
  if (!(0, _fileIdentityEQApOIDl.c)(params.destinationRealDir, resolved)) throw symlinkTraversalError$1(params.originalPath);
}
async function prepareArchiveOutputPath(params) {
  await assertNoSymlinkTraversal({
    rootDir: params.destinationDir,
    relPath: params.relPath,
    originalPath: params.originalPath
  });
  if (params.isDirectory) {
    await _promises.default.mkdir(params.outPath, { recursive: true });
    await assertResolvedInsideDestination({
      destinationRealDir: params.destinationRealDir,
      targetPath: params.outPath,
      originalPath: params.originalPath
    });
    return;
  }
  const parentDir = _nodePath.default.dirname(params.outPath);
  await _promises.default.mkdir(parentDir, { recursive: true });
  await assertResolvedInsideDestination({
    destinationRealDir: params.destinationRealDir,
    targetPath: parentDir,
    originalPath: params.originalPath
  });
}
async function applyStagedEntryMode(params) {
  const destinationPath = _nodePath.default.join(params.destinationRealDir, params.relPath);
  await assertResolvedInsideDestination({
    destinationRealDir: params.destinationRealDir,
    targetPath: destinationPath,
    originalPath: params.originalPath
  });
  if (params.mode !== 0) await _promises.default.chmod(destinationPath, params.mode).catch(() => void 0);
}
async function withStagedArchiveDestination(params) {
  const stagingDir = await _promises.default.mkdtemp(_nodePath.default.join(params.destinationRealDir, ".openclaw-archive-"));
  try {
    return await params.run(stagingDir);
  } finally {
    await _promises.default.rm(stagingDir, {
      recursive: true,
      force: true
    }).catch(() => void 0);
  }
}
async function mergeExtractedTreeIntoDestination(params) {
  const walk = async (currentSourceDir) => {
    const entries = await _promises.default.readdir(currentSourceDir, { withFileTypes: true });
    for (const entry of entries) {
      const sourcePath = _nodePath.default.join(currentSourceDir, entry.name);
      const relPath = _nodePath.default.relative(params.sourceDir, sourcePath);
      const originalPath = relPath.split(_nodePath.default.sep).join("/");
      const destinationPath = _nodePath.default.join(params.destinationDir, relPath);
      const sourceStat = await _promises.default.lstat(sourcePath);
      if (sourceStat.isSymbolicLink()) throw symlinkTraversalError$1(originalPath);
      if (sourceStat.isDirectory()) {
        await prepareArchiveOutputPath({
          destinationDir: params.destinationDir,
          destinationRealDir: params.destinationRealDir,
          relPath,
          outPath: destinationPath,
          originalPath,
          isDirectory: true
        });
        await walk(sourcePath);
        await applyStagedEntryMode({
          destinationRealDir: params.destinationRealDir,
          relPath,
          mode: sourceStat.mode & 511,
          originalPath
        });
        continue;
      }
      if (!sourceStat.isFile()) throw new Error(`archive staging contains unsupported entry: ${originalPath}`);
      await prepareArchiveOutputPath({
        destinationDir: params.destinationDir,
        destinationRealDir: params.destinationRealDir,
        relPath,
        outPath: destinationPath,
        originalPath,
        isDirectory: false
      });
      await (0, _fsSafeB7mHodgb.i)({
        sourcePath,
        rootDir: params.destinationRealDir,
        relativePath: relPath,
        mkdir: true
      });
      await applyStagedEntryMode({
        destinationRealDir: params.destinationRealDir,
        relPath,
        mode: sourceStat.mode & 511,
        originalPath
      });
    }
  };
  await walk(params.sourceDir);
}
function createArchiveSymlinkTraversalError(originalPath) {
  return symlinkTraversalError$1(originalPath);
}
//#endregion
//#region src/infra/archive.ts
/** @internal */
const DEFAULT_MAX_ARCHIVE_BYTES_ZIP = exports.t = 256 * 1024 * 1024;
/** @internal */
const DEFAULT_MAX_ENTRIES = exports.n = 5e4;
/** @internal */
const DEFAULT_MAX_EXTRACTED_BYTES = exports.i = 512 * 1024 * 1024;
/** @internal */
const DEFAULT_MAX_ENTRY_BYTES = exports.r = 256 * 1024 * 1024;
const ERROR_ARCHIVE_SIZE_EXCEEDS_LIMIT = "archive size exceeds limit";
const ERROR_ARCHIVE_ENTRY_COUNT_EXCEEDS_LIMIT = "archive entry count exceeds limit";
const ERROR_ARCHIVE_ENTRY_EXTRACTED_SIZE_EXCEEDS_LIMIT = "archive entry extracted size exceeds limit";
const ERROR_ARCHIVE_EXTRACTED_SIZE_EXCEEDS_LIMIT = "archive extracted size exceeds limit";
const SUPPORTS_NOFOLLOW = process.platform !== "win32" && "O_NOFOLLOW" in _nodeFs.constants;
const OPEN_WRITE_CREATE_FLAGS = _nodeFs.constants.O_WRONLY | _nodeFs.constants.O_CREAT | _nodeFs.constants.O_EXCL | (SUPPORTS_NOFOLLOW ? _nodeFs.constants.O_NOFOLLOW : 0);
const TAR_SUFFIXES = [
".tgz",
".tar.gz",
".tar"];

function resolveArchiveKind(filePath) {
  const lower = (0, _stringCoerceBUSzWgUA.i)(filePath);
  if (lower.endsWith(".zip")) return "zip";
  if (TAR_SUFFIXES.some((suffix) => lower.endsWith(suffix))) return "tar";
  return null;
}
async function hasPackedRootMarker(extractDir, rootMarkers) {
  for (const marker of rootMarkers) {
    const trimmed = marker.trim();
    if (!trimmed) continue;
    try {
      await _promises.default.stat(_nodePath.default.join(extractDir, trimmed));
      return true;
    } catch {}
  }
  return false;
}
async function resolvePackedRootDir(extractDir, options) {
  const direct = _nodePath.default.join(extractDir, "package");
  try {
    if ((await _promises.default.stat(direct)).isDirectory()) return direct;
  } catch {}
  if ((options?.rootMarkers?.length ?? 0) > 0) {
    if (await hasPackedRootMarker(extractDir, options?.rootMarkers ?? [])) return extractDir;
  }
  const dirs = (await _promises.default.readdir(extractDir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  if (dirs.length !== 1) throw new Error(`unexpected archive layout (dirs: ${dirs.join(", ")})`);
  const onlyDir = dirs[0];
  if (!onlyDir) throw new Error("unexpected archive layout (no package dir found)");
  return _nodePath.default.join(extractDir, onlyDir);
}
async function withTimeout(promise, timeoutMs, label) {
  let timeoutId;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(/* @__PURE__ */new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    })]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
function clampLimit(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return;
  const v = Math.floor(value);
  return v > 0 ? v : void 0;
}
function resolveExtractLimits(limits) {
  return {
    maxArchiveBytes: clampLimit(limits?.maxArchiveBytes) ?? 268435456,
    maxEntries: clampLimit(limits?.maxEntries) ?? 5e4,
    maxExtractedBytes: clampLimit(limits?.maxExtractedBytes) ?? 536870912,
    maxEntryBytes: clampLimit(limits?.maxEntryBytes) ?? 268435456
  };
}
function assertArchiveEntryCountWithinLimit(entryCount, limits) {
  if (entryCount > limits.maxEntries) throw new Error(ERROR_ARCHIVE_ENTRY_COUNT_EXCEEDS_LIMIT);
}
function createByteBudgetTracker(limits) {
  let entryBytes = 0;
  let extractedBytes = 0;
  const addBytes = (bytes) => {
    const b = Math.max(0, Math.floor(bytes));
    if (b === 0) return;
    entryBytes += b;
    if (entryBytes > limits.maxEntryBytes) throw new Error(ERROR_ARCHIVE_ENTRY_EXTRACTED_SIZE_EXCEEDS_LIMIT);
    extractedBytes += b;
    if (extractedBytes > limits.maxExtractedBytes) throw new Error(ERROR_ARCHIVE_EXTRACTED_SIZE_EXCEEDS_LIMIT);
  };
  return {
    startEntry() {
      entryBytes = 0;
    },
    addBytes,
    addEntrySize(size) {
      const s = Math.max(0, Math.floor(size));
      if (s > limits.maxEntryBytes) throw new Error(ERROR_ARCHIVE_ENTRY_EXTRACTED_SIZE_EXCEEDS_LIMIT);
      addBytes(s);
    }
  };
}
function createExtractBudgetTransform(params) {
  return new _nodeStream.Transform({ transform(chunk, _encoding, callback) {
      try {
        const buf = chunk instanceof Buffer ? chunk : Buffer.from(chunk);
        params.onChunkBytes(buf.byteLength);
        callback(null, buf);
      } catch (err) {
        callback(err instanceof Error ? err : new Error(String(err)));
      }
    } });
}
function symlinkTraversalError(originalPath) {
  return createArchiveSymlinkTraversalError(originalPath);
}
async function openZipOutputFile(params) {
  try {
    return await (0, _fsSafeB7mHodgb.l)({
      rootDir: params.destinationRealDir,
      relativePath: params.relPath,
      mkdir: false,
      mode: 438
    });
  } catch (err) {
    if (err instanceof _fsSafeB7mHodgb.t && (err.code === "invalid-path" || err.code === "outside-workspace" || err.code === "path-mismatch")) throw symlinkTraversalError(params.originalPath);
    throw err;
  }
}
async function cleanupPartialRegularFile(filePath) {
  let stat;
  try {
    stat = await _promises.default.lstat(filePath);
  } catch (err) {
    if ((0, _fileIdentityEQApOIDl.s)(err)) return;
    throw err;
  }
  if (stat.isFile()) await _promises.default.unlink(filePath).catch(() => void 0);
}
function buildArchiveAtomicTempPath(targetPath) {
  return _nodePath.default.join(_nodePath.default.dirname(targetPath), `.${_nodePath.default.basename(targetPath)}.${process.pid}.${(0, _nodeCrypto.randomUUID)()}.tmp`);
}
async function verifyZipWriteResult(params) {
  const opened = await (0, _fsSafeB7mHodgb.s)({
    rootDir: params.destinationRealDir,
    relativePath: params.relPath,
    rejectHardlinks: true
  });
  try {
    if (!(0, _fileIdentityEQApOIDl.t)(opened.stat, params.expectedStat)) throw new _fsSafeB7mHodgb.t("path-mismatch", "path changed during zip extract");
    return opened.realPath;
  } finally {
    await opened.handle.close().catch(() => void 0);
  }
}
async function readZipEntryStream(entry) {
  if (typeof entry.nodeStream === "function") return entry.nodeStream();
  const buf = await entry.async("nodebuffer");
  return _nodeStream.Readable.from(buf);
}
function resolveZipOutputPath(params) {
  (0, _archivePathDHk17wYF.i)(params.entryPath);
  const relPath = (0, _archivePathDHk17wYF.r)(params.entryPath, params.strip);
  if (!relPath) return null;
  (0, _archivePathDHk17wYF.i)(relPath);
  return {
    relPath,
    outPath: (0, _archivePathDHk17wYF.n)({
      rootDir: params.destinationDir,
      relPath,
      originalPath: params.entryPath
    })
  };
}
async function prepareZipOutputPath(params) {
  await prepareArchiveOutputPath(params);
}
async function writeZipFileEntry(params) {
  const opened = await openZipOutputFile({
    relPath: params.relPath,
    originalPath: params.entry.name,
    destinationRealDir: params.destinationRealDir
  });
  params.budget.startEntry();
  const readable = await readZipEntryStream(params.entry);
  const destinationPath = opened.openedRealPath;
  const targetMode = opened.openedStat.mode & 511;
  await opened.handle.close().catch(() => void 0);
  let tempHandle = null;
  let tempPath = null;
  let tempStat = null;
  let handleClosedByStream = false;
  try {
    tempPath = buildArchiveAtomicTempPath(destinationPath);
    tempHandle = await _promises.default.open(tempPath, OPEN_WRITE_CREATE_FLAGS, targetMode || 438);
    const writable = tempHandle.createWriteStream();
    writable.once("close", () => {
      handleClosedByStream = true;
    });
    await (0, _promises2.pipeline)(readable, createExtractBudgetTransform({ onChunkBytes: params.budget.addBytes }), writable);
    tempStat = await _promises.default.stat(tempPath);
    if (!tempStat) throw new Error("zip temp write did not produce file metadata");
    if (!handleClosedByStream) {
      await tempHandle.close().catch(() => void 0);
      handleClosedByStream = true;
    }
    tempHandle = null;
    await _promises.default.rename(tempPath, destinationPath);
    tempPath = null;
    const verifiedPath = await verifyZipWriteResult({
      destinationRealDir: params.destinationRealDir,
      relPath: params.relPath,
      expectedStat: tempStat
    });
    if (typeof params.entry.unixPermissions === "number") {
      const mode = params.entry.unixPermissions & 511;
      if (mode !== 0) await _promises.default.chmod(verifiedPath, mode).catch(() => void 0);
    }
  } catch (err) {
    if (tempPath) await _promises.default.rm(tempPath, { force: true }).catch(() => void 0);else
    await cleanupPartialRegularFile(destinationPath).catch(() => void 0);
    if (err instanceof _fsSafeB7mHodgb.t) throw symlinkTraversalError(params.entry.name);
    throw err;
  } finally {
    if (tempHandle && !handleClosedByStream) await tempHandle.close().catch(() => void 0);
  }
}
async function extractZip(params) {
  const limits = resolveExtractLimits(params.limits);
  const destinationRealDir = await prepareArchiveDestinationDir(params.destDir);
  if ((await _promises.default.stat(params.archivePath)).size > limits.maxArchiveBytes) throw new Error(ERROR_ARCHIVE_SIZE_EXCEEDS_LIMIT);
  const buffer = await _promises.default.readFile(params.archivePath);
  const zip = await _jszip.default.loadAsync(buffer);
  const entries = Object.values(zip.files);
  const strip = Math.max(0, Math.floor(params.stripComponents ?? 0));
  assertArchiveEntryCountWithinLimit(entries.length, limits);
  const budget = createByteBudgetTracker(limits);
  for (const entry of entries) {
    const output = resolveZipOutputPath({
      entryPath: entry.name,
      strip,
      destinationDir: params.destDir
    });
    if (!output) continue;
    await prepareZipOutputPath({
      destinationDir: params.destDir,
      destinationRealDir,
      relPath: output.relPath,
      outPath: output.outPath,
      originalPath: entry.name,
      isDirectory: entry.dir
    });
    if (entry.dir) continue;
    await writeZipFileEntry({
      entry,
      relPath: output.relPath,
      destinationRealDir,
      budget
    });
  }
}
const BLOCKED_TAR_ENTRY_TYPES = new Set([
"SymbolicLink",
"Link",
"BlockDevice",
"CharacterDevice",
"FIFO",
"Socket"]
);
function readTarEntryInfo(entry) {
  return {
    path: typeof entry === "object" && entry !== null && "path" in entry ? String(entry.path) : "",
    type: typeof entry === "object" && entry !== null && "type" in entry ? String(entry.type) : "",
    size: typeof entry === "object" && entry !== null && "size" in entry && typeof entry.size === "number" && Number.isFinite(entry.size) ? Math.max(0, Math.floor(entry.size)) : 0
  };
}
function createTarEntryPreflightChecker(params) {
  const strip = Math.max(0, Math.floor(params.stripComponents ?? 0));
  const limits = resolveExtractLimits(params.limits);
  let entryCount = 0;
  const budget = createByteBudgetTracker(limits);
  return (entry) => {
    (0, _archivePathDHk17wYF.i)(entry.path, { escapeLabel: params.escapeLabel });
    const relPath = (0, _archivePathDHk17wYF.r)(entry.path, strip);
    if (!relPath) return;
    (0, _archivePathDHk17wYF.i)(relPath, { escapeLabel: params.escapeLabel });
    (0, _archivePathDHk17wYF.n)({
      rootDir: params.rootDir,
      relPath,
      originalPath: entry.path,
      escapeLabel: params.escapeLabel
    });
    if (BLOCKED_TAR_ENTRY_TYPES.has(entry.type)) throw new Error(`tar entry is a link: ${entry.path}`);
    entryCount += 1;
    assertArchiveEntryCountWithinLimit(entryCount, limits);
    budget.addEntrySize(entry.size);
  };
}
async function extractArchive(params) {
  const kind = params.kind ?? resolveArchiveKind(params.archivePath);
  if (!kind) throw new Error(`unsupported archive: ${params.archivePath}`);
  const label = kind === "zip" ? "extract zip" : "extract tar";
  if (kind === "tar") {
    await withTimeout((async () => {
      const limits = resolveExtractLimits(params.limits);
      if ((await _promises.default.stat(params.archivePath)).size > limits.maxArchiveBytes) throw new Error(ERROR_ARCHIVE_SIZE_EXCEEDS_LIMIT);
      const destinationRealDir = await prepareArchiveDestinationDir(params.destDir);
      await withStagedArchiveDestination({
        destinationRealDir,
        run: async (stagingDir) => {
          const checkTarEntrySafety = createTarEntryPreflightChecker({
            rootDir: destinationRealDir,
            stripComponents: params.stripComponents,
            limits
          });
          await tar.x({
            file: params.archivePath,
            cwd: stagingDir,
            strip: Math.max(0, Math.floor(params.stripComponents ?? 0)),
            gzip: params.tarGzip,
            preservePaths: false,
            strict: true,
            onReadEntry(entry) {
              try {
                checkTarEntrySafety(readTarEntryInfo(entry));
              } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                this.abort?.(error);
              }
            }
          });
          await mergeExtractedTreeIntoDestination({
            sourceDir: stagingDir,
            destinationDir: destinationRealDir,
            destinationRealDir
          });
        }
      });
    })(), params.timeoutMs, label);
    return;
  }
  await withTimeout(extractZip({
    archivePath: params.archivePath,
    destDir: params.destDir,
    stripComponents: params.stripComponents,
    limits: params.limits
  }), params.timeoutMs, label);
}
async function fileExists(filePath) {
  try {
    await _promises.default.stat(filePath);
    return true;
  } catch {
    return false;
  }
}
async function readJsonFile(filePath) {
  const raw = await _promises.default.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}
//#endregion /* v9-3c9d116348ac4145 */
