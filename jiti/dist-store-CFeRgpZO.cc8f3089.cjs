"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = ensureMediaDir;exports.c = resolveMediaBufferPath;exports.d = setMediaStoreNetworkDepsForTest;exports.i = deleteMediaBuffer;exports.l = saveMediaBuffer;exports.n = void 0;exports.o = extractOriginalFilename;exports.r = cleanOldMedia;exports.s = getMediaDir;exports.t = void 0;exports.u = saveMediaSource;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _mimeB6nXlmtY = require("./mime-B6nXlmtY.js");
var _redirectHeadersClCgXR = require("./redirect-headers-Cl-CgXR8.js");
var _ssrfDoOclwFS = require("./ssrf-DoOclwFS.js");
var _fsSafeB7mHodgb = require("./fs-safe-B7mHodgb.js");
var _nodeFs = require("node:fs");
var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = _interopRequireDefault(require("node:fs/promises"));
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
var _promises2 = require("node:stream/promises");
var _nodeHttp = require("node:http");
var _nodeHttps = require("node:https");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/media/store.runtime.ts
const readLocalFileSafely = _fsSafeB7mHodgb.d;
function isSafeOpenError(error) {
  return error instanceof _fsSafeB7mHodgb.t;
}
//#endregion
//#region src/media/store.ts
const resolveMediaDir = () => _nodePath.default.join((0, _utilsD5DtWkEu.f)(), "media");
const MEDIA_MAX_BYTES = exports.t = 5 * 1024 * 1024;
const MAX_BYTES = MEDIA_MAX_BYTES;
const DEFAULT_TTL_MS = 120 * 1e3;
const MEDIA_FILE_MODE = 420;
const defaultHttpRequestImpl = _nodeHttp.request;
const defaultHttpsRequestImpl = _nodeHttps.request;
const defaultResolvePinnedHostnameImpl = _ssrfDoOclwFS.m;
function formatMediaLimitMb(maxBytes) {
  return `${(maxBytes / (1024 * 1024)).toFixed(0)}MB`;
}
let httpRequestImpl = defaultHttpRequestImpl;
let httpsRequestImpl = defaultHttpsRequestImpl;
let resolvePinnedHostnameImpl = defaultResolvePinnedHostnameImpl;
function setMediaStoreNetworkDepsForTest(deps) {
  httpRequestImpl = deps?.httpRequest ?? defaultHttpRequestImpl;
  httpsRequestImpl = deps?.httpsRequest ?? defaultHttpsRequestImpl;
  resolvePinnedHostnameImpl = deps?.resolvePinnedHostname ?? defaultResolvePinnedHostnameImpl;
}
/**
* Sanitize a filename for cross-platform safety.
* Removes chars unsafe on Windows/SharePoint/all platforms.
* Keeps: alphanumeric, dots, hyphens, underscores, Unicode letters/numbers.
*/
function sanitizeFilename(name) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.replace(/[^\p{L}\p{N}._-]+/gu, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 60);
}
/**
* Extract original filename from path if it matches the embedded format.
* Pattern: {original}---{uuid}.{ext} → returns "{original}.{ext}"
* Falls back to basename if no pattern match, or "file.bin" if empty.
*/
function extractOriginalFilename(filePath) {
  const basename = _nodePath.default.basename(filePath);
  if (!basename) return "file.bin";
  const ext = _nodePath.default.extname(basename);
  const match = _nodePath.default.basename(basename, ext).match(/^(.+)---[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i);
  if (match?.[1]) return `${match[1]}${ext}`;
  return basename;
}
function getMediaDir() {
  return resolveMediaDir();
}
async function ensureMediaDir() {
  const mediaDir = resolveMediaDir();
  await _promises.default.mkdir(mediaDir, {
    recursive: true,
    mode: 448
  });
  return mediaDir;
}
function isMissingPathError(err) {
  return err instanceof Error && "code" in err && err.code === "ENOENT";
}
async function retryAfterRecreatingDir(dir, run) {
  try {
    return await run();
  } catch (err) {
    if (!isMissingPathError(err)) throw err;
    await _promises.default.mkdir(dir, {
      recursive: true,
      mode: 448
    });
    return await run();
  }
}
async function cleanOldMedia(ttlMs = DEFAULT_TTL_MS, options = {}) {
  const mediaDir = await ensureMediaDir();
  const now = Date.now();
  const recursive = options.recursive ?? false;
  const pruneEmptyDirs = recursive && (options.pruneEmptyDirs ?? false);
  const removeExpiredFilesInDir = async (dir) => {
    const dirEntries = await _promises.default.readdir(dir).catch(() => null);
    if (!dirEntries) return false;
    for (const entry of dirEntries) {
      const fullPath = _nodePath.default.join(dir, entry);
      const stat = await _promises.default.lstat(fullPath).catch(() => null);
      if (!stat || stat.isSymbolicLink()) continue;
      if (stat.isDirectory()) {
        if (recursive) {
          if (await removeExpiredFilesInDir(fullPath)) await _promises.default.rmdir(fullPath).catch(() => {});
        }
        continue;
      }
      if (!stat.isFile()) continue;
      if (now - stat.mtimeMs > ttlMs) await _promises.default.rm(fullPath, { force: true }).catch(() => {});
    }
    if (!pruneEmptyDirs) return false;
    const remainingEntries = await _promises.default.readdir(dir).catch(() => null);
    return remainingEntries !== null && remainingEntries.length === 0;
  };
  const entries = await _promises.default.readdir(mediaDir).catch(() => []);
  for (const file of entries) {
    const full = _nodePath.default.join(mediaDir, file);
    const stat = await _promises.default.lstat(full).catch(() => null);
    if (!stat || stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) {
      if (await removeExpiredFilesInDir(full)) await _promises.default.rmdir(full).catch(() => {});
      continue;
    }
    if (stat.isFile() && now - stat.mtimeMs > ttlMs) await _promises.default.rm(full, { force: true }).catch(() => {});
  }
}
function looksLikeUrl(src) {
  return /^https?:\/\//i.test(src);
}
/**
* Download media to disk while capturing the first few KB for mime sniffing.
*/
async function downloadToFile(url, dest, headers, maxRedirects = 5, maxBytes = MAX_BYTES) {
  return await new Promise((resolve, reject) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      reject(/* @__PURE__ */new Error("Invalid URL"));
      return;
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      reject(/* @__PURE__ */new Error(`Invalid URL protocol: ${parsedUrl.protocol}. Only HTTP/HTTPS allowed.`));
      return;
    }
    const requestImpl = parsedUrl.protocol === "https:" ? httpsRequestImpl : httpRequestImpl;
    resolvePinnedHostnameImpl(parsedUrl.hostname).then((pinned) => {
      const req = requestImpl(parsedUrl, {
        headers,
        lookup: pinned.lookup
      }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
          const location = res.headers.location;
          if (!location || maxRedirects <= 0) {
            reject(/* @__PURE__ */new Error(`Redirect loop or missing Location header`));
            return;
          }
          const redirectUrl = new URL(location, url).href;
          resolve(downloadToFile(redirectUrl, dest, new URL(redirectUrl).origin === parsedUrl.origin ? headers : (0, _redirectHeadersClCgXR.t)(headers), maxRedirects - 1, maxBytes));
          return;
        }
        if (!res.statusCode || res.statusCode >= 400) {
          reject(/* @__PURE__ */new Error(`HTTP ${res.statusCode ?? "?"} downloading media`));
          return;
        }
        let total = 0;
        const sniffChunks = [];
        let sniffLen = 0;
        const out = (0, _nodeFs.createWriteStream)(dest, { mode: MEDIA_FILE_MODE });
        res.on("data", (chunk) => {
          total += chunk.length;
          if (sniffLen < 16384) {
            sniffChunks.push(chunk);
            sniffLen += chunk.length;
          }
          if (total > maxBytes) req.destroy(/* @__PURE__ */new Error(`Media exceeds ${formatMediaLimitMb(maxBytes)} limit`));
        });
        (0, _promises2.pipeline)(res, out).then(() => {
          const sniffBuffer = Buffer.concat(sniffChunks, Math.min(sniffLen, 16384));
          const rawHeader = res.headers["content-type"];
          resolve({
            headerMime: Array.isArray(rawHeader) ? rawHeader[0] : rawHeader,
            sniffBuffer,
            size: total
          });
        }).catch(async (err) => {
          await _promises.default.rm(dest, { force: true }).catch(() => {});
          reject(err);
        });
      });
      req.on("error", reject);
      req.end();
    }).catch(reject);
  });
}
function buildSavedMediaId(params) {
  if (!params.originalFilename) return params.ext ? `${params.baseId}${params.ext}` : params.baseId;
  const base = _nodePath.default.parse(params.originalFilename).name;
  const sanitized = sanitizeFilename(base);
  return sanitized ? `${sanitized}---${params.baseId}${params.ext}` : `${params.baseId}${params.ext}`;
}
function buildSavedMediaResult(params) {
  return {
    id: params.id,
    path: _nodePath.default.join(params.dir, params.id),
    size: params.size,
    contentType: params.contentType
  };
}
async function writeSavedMediaBuffer(params) {
  const dest = _nodePath.default.join(params.dir, params.id);
  await retryAfterRecreatingDir(params.dir, () => _promises.default.writeFile(dest, params.buffer, { mode: MEDIA_FILE_MODE }));
  return dest;
}
var SaveMediaSourceError = class extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.code = code;
    this.name = "SaveMediaSourceError";
  }
};exports.n = SaveMediaSourceError;
function toSaveMediaSourceError(err, maxBytes = MAX_BYTES) {
  switch (err.code) {
    case "symlink":return new SaveMediaSourceError("invalid-path", "Media path must not be a symlink", { cause: err });
    case "not-file":return new SaveMediaSourceError("not-file", "Media path is not a file", { cause: err });
    case "path-mismatch":return new SaveMediaSourceError("path-mismatch", "Media path changed during read", { cause: err });
    case "too-large":return new SaveMediaSourceError("too-large", `Media exceeds ${formatMediaLimitMb(maxBytes)} limit`, { cause: err });
    case "not-found":return new SaveMediaSourceError("not-found", "Media path does not exist", { cause: err });
    case "outside-workspace":return new SaveMediaSourceError("invalid-path", "Media path is outside workspace root", { cause: err });
    default:return new SaveMediaSourceError("invalid-path", "Media path is not safe to read", { cause: err });
  }
}
async function saveMediaSource(source, headers, subdir = "", maxBytes = MAX_BYTES) {
  const baseDir = resolveMediaDir();
  const dir = subdir ? _nodePath.default.join(baseDir, subdir) : baseDir;
  await _promises.default.mkdir(dir, {
    recursive: true,
    mode: 448
  });
  await cleanOldMedia(DEFAULT_TTL_MS, { recursive: false });
  const baseId = _nodeCrypto.default.randomUUID();
  if (looksLikeUrl(source)) {
    const tempDest = _nodePath.default.join(dir, `${baseId}.tmp`);
    const { headerMime, sniffBuffer, size } = await retryAfterRecreatingDir(dir, () => downloadToFile(source, tempDest, headers, 5, maxBytes));
    const mime = await (0, _mimeB6nXlmtY.t)({
      buffer: sniffBuffer,
      headerMime,
      filePath: source
    });
    const id = buildSavedMediaId({
      baseId,
      ext: (0, _mimeB6nXlmtY.n)(mime) ?? _nodePath.default.extname(new URL(source).pathname)
    });
    const finalDest = _nodePath.default.join(dir, id);
    await _promises.default.rename(tempDest, finalDest);
    return buildSavedMediaResult({
      dir,
      id,
      size,
      contentType: mime
    });
  }
  try {
    const { buffer, stat } = await readLocalFileSafely({
      filePath: source,
      maxBytes
    });
    const mime = await (0, _mimeB6nXlmtY.t)({
      buffer,
      filePath: source
    });
    const id = buildSavedMediaId({
      baseId,
      ext: (0, _mimeB6nXlmtY.n)(mime) ?? _nodePath.default.extname(source)
    });
    await writeSavedMediaBuffer({
      dir,
      id,
      buffer
    });
    return buildSavedMediaResult({
      dir,
      id,
      size: stat.size,
      contentType: mime
    });
  } catch (err) {
    if (isSafeOpenError(err)) throw toSaveMediaSourceError(err, maxBytes);
    throw err;
  }
}
async function saveMediaBuffer(buffer, contentType, subdir = "inbound", maxBytes = MAX_BYTES, originalFilename) {
  if (buffer.byteLength > maxBytes) throw new Error(`Media exceeds ${formatMediaLimitMb(maxBytes)} limit`);
  const dir = _nodePath.default.join(resolveMediaDir(), subdir);
  await _promises.default.mkdir(dir, {
    recursive: true,
    mode: 448
  });
  const uuid = _nodeCrypto.default.randomUUID();
  const headerExt = (0, _mimeB6nXlmtY.n)((0, _stringCoerceBUSzWgUA.s)(contentType?.split(";")[0]));
  const mime = await (0, _mimeB6nXlmtY.t)({
    buffer,
    headerMime: contentType
  });
  const id = buildSavedMediaId({
    baseId: uuid,
    ext: headerExt ?? (0, _mimeB6nXlmtY.n)(mime) ?? "",
    originalFilename
  });
  await writeSavedMediaBuffer({
    dir,
    id,
    buffer
  });
  return buildSavedMediaResult({
    dir,
    id,
    size: buffer.byteLength,
    contentType: mime
  });
}
/**
* Resolves a media ID saved by saveMediaBuffer to its absolute physical path.
*
* This is the read-side counterpart to saveMediaBuffer and is used by the
* agent runner to hydrate opaque `media://inbound/<id>` URIs written by the
* Gateway's claim-check offload path.
*
* Security:
* - Rejects IDs containing path separators, "..", or null bytes to prevent
*   directory traversal and path injection outside the resolved subdir.
* - Verifies the resolved path is a regular file (not a symlink or directory)
*   before returning it, matching the write-side MEDIA_FILE_MODE policy.
*
* @param id      The media ID as returned by SavedMedia.id (may include
*                extension and original-filename prefix,
*                e.g. "photo---<uuid>.png" or "图片---<uuid>.png").
* @param subdir  The subdirectory the file was saved into (default "inbound").
* @returns       Absolute path to the file on disk.
* @throws        If the ID is unsafe, the file does not exist, or is not a
*                regular file.
*/
async function resolveMediaBufferPath(id, subdir = "inbound") {
  if (!id || id.includes("/") || id.includes("\\") || id.includes("\0") || id === "..") throw new Error(`resolveMediaBufferPath: unsafe media ID: ${JSON.stringify(id)}`);
  const dir = _nodePath.default.join(resolveMediaDir(), subdir);
  const resolved = _nodePath.default.join(dir, id);
  if (!resolved.startsWith(dir + _nodePath.default.sep) && resolved !== dir) throw new Error(`resolveMediaBufferPath: path escapes media directory: ${JSON.stringify(id)}`);
  const stat = await _promises.default.lstat(resolved);
  if (stat.isSymbolicLink()) throw new Error(`resolveMediaBufferPath: refusing to follow symlink for media ID: ${JSON.stringify(id)}`);
  if (!stat.isFile()) throw new Error(`resolveMediaBufferPath: media ID does not resolve to a file: ${JSON.stringify(id)}`);
  return resolved;
}
/**
* Deletes a file previously saved by saveMediaBuffer.
*
* This is used by parseMessageWithAttachments to clean up files that were
* successfully offloaded earlier in the same request when a later attachment
* fails validation and the entire parse is aborted, preventing orphaned files
* from accumulating on disk ahead of the periodic TTL sweep.
*
* Uses resolveMediaBufferPath to apply the same path-safety guards as the
* read path (separator checks, symlink rejection, etc.) before unlinking.
*
* Errors are intentionally not suppressed — callers that want best-effort
* cleanup should catch and discard exceptions themselves (e.g. via
* Promise.allSettled).
*
* @param id     The media ID as returned by SavedMedia.id.
* @param subdir The subdirectory the file was saved into (default "inbound").
*/
async function deleteMediaBuffer(id, subdir = "inbound") {
  const physicalPath = await resolveMediaBufferPath(id, subdir);
  await _promises.default.unlink(physicalPath);
}
//#endregion /* v9-f4c887f78bd92dd7 */
