"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = void 0;exports.c = injectCanvasLiveReload;exports.i = void 0;exports.l = normalizeUrlPath;exports.n = loadWebMediaRaw;exports.o = void 0;exports.r = optimizeImageToJpeg;exports.s = handleA2uiHttpRequest;exports.t = loadWebMedia;exports.u = resolveFileWithinRoot;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _globalsDe6QTwLG = require("./globals-De6QTwLG.js");
var _mimeB6nXlmtY = require("./mime-B6nXlmtY.js");
var _imageOpsF0rEOT4L = require("./image-ops-f0rEOT4L.js");
var _fsSafeB7mHodgb = require("./fs-safe-B7mHodgb.js");
var _localFileAccessCpkF4sBk = require("./local-file-access-CpkF4sBk.js");
var _fetchBL7ekE3E = require("./fetch-BL7ekE3E.js");
var _localMediaAccessBjcJKJws = require("./local-media-access-BjcJKJws.js");
var _nodeUrl = require("node:url");
var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = _interopRequireDefault(require("node:fs/promises"));
require("node:crypto");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/canvas-host/file-resolver.ts
function normalizeUrlPath(rawPath) {
  const decoded = decodeURIComponent(rawPath || "/");
  const normalized = _nodePath.default.posix.normalize(decoded);
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
async function resolveFileWithinRoot(rootReal, urlPath) {
  const normalized = normalizeUrlPath(urlPath);
  const rel = normalized.replace(/^\/+/, "");
  if (rel.split("/").some((p) => p === "..")) return null;
  const tryOpen = async (relative) => {
    try {
      return await (0, _fsSafeB7mHodgb.s)({
        rootDir: rootReal,
        relativePath: relative
      });
    } catch (err) {
      if (err instanceof _fsSafeB7mHodgb.t) return null;
      throw err;
    }
  };
  if (normalized.endsWith("/")) return await tryOpen(_nodePath.default.posix.join(rel, "index.html"));
  const candidate = _nodePath.default.join(rootReal, rel);
  try {
    const st = await _promises.default.lstat(candidate);
    if (st.isSymbolicLink()) return null;
    if (st.isDirectory()) return await tryOpen(_nodePath.default.posix.join(rel, "index.html"));
  } catch {}
  return await tryOpen(rel);
}
//#endregion
//#region src/canvas-host/a2ui.ts
const A2UI_PATH = exports.i = "/__openclaw__/a2ui";
const CANVAS_HOST_PATH = exports.a = "/__openclaw__/canvas";
const CANVAS_WS_PATH = exports.o = "/__openclaw__/ws";
let cachedA2uiRootReal;
let resolvingA2uiRoot = null;
let cachedA2uiResolvedAtMs = 0;
const A2UI_ROOT_RETRY_NULL_AFTER_MS = 1e4;
async function resolveA2uiRoot() {
  const here = _nodePath.default.dirname((0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/web-media-B2LIgj-X.js"));
  const entryDir = process.argv[1] ? _nodePath.default.dirname(_nodePath.default.resolve(process.argv[1])) : null;
  const candidates = [
  _nodePath.default.resolve(here, "a2ui"),
  _nodePath.default.resolve(here, "canvas-host/a2ui"),
  _nodePath.default.resolve(here, "../canvas-host/a2ui"),
  ...(entryDir ? [
  _nodePath.default.resolve(entryDir, "a2ui"),
  _nodePath.default.resolve(entryDir, "canvas-host/a2ui"),
  _nodePath.default.resolve(entryDir, "../canvas-host/a2ui")] :
  []),
  _nodePath.default.resolve(here, "../../src/canvas-host/a2ui"),
  _nodePath.default.resolve(here, "../src/canvas-host/a2ui"),
  _nodePath.default.resolve(process.cwd(), "src/canvas-host/a2ui"),
  _nodePath.default.resolve(process.cwd(), "dist/canvas-host/a2ui")];

  if (process.execPath) candidates.unshift(_nodePath.default.resolve(_nodePath.default.dirname(process.execPath), "a2ui"));
  for (const dir of candidates) try {
    const indexPath = _nodePath.default.join(dir, "index.html");
    const bundlePath = _nodePath.default.join(dir, "a2ui.bundle.js");
    await _promises.default.stat(indexPath);
    await _promises.default.stat(bundlePath);
    return dir;
  } catch {}
  return null;
}
async function resolveA2uiRootReal() {
  if (cachedA2uiRootReal !== void 0 && (cachedA2uiRootReal !== null || Date.now() - cachedA2uiResolvedAtMs < A2UI_ROOT_RETRY_NULL_AFTER_MS)) return cachedA2uiRootReal;
  if (!resolvingA2uiRoot) resolvingA2uiRoot = (async () => {
    const root = await resolveA2uiRoot();
    cachedA2uiRootReal = root ? await _promises.default.realpath(root) : null;
    cachedA2uiResolvedAtMs = Date.now();
    resolvingA2uiRoot = null;
    return cachedA2uiRootReal;
  })();
  return resolvingA2uiRoot;
}
function injectCanvasLiveReload(html) {
  const snippet = `
<script>
(() => {
  // Cross-platform action bridge helper.
  // Works on:
  // - iOS: window.webkit.messageHandlers.openclawCanvasA2UIAction.postMessage(...)
  // - Android: window.openclawCanvasA2UIAction.postMessage(...)
  const handlerNames = ["openclawCanvasA2UIAction"];
  function postToNode(payload) {
    try {
      const raw = typeof payload === "string" ? payload : JSON.stringify(payload);
      for (const name of handlerNames) {
        const iosHandler = globalThis.webkit?.messageHandlers?.[name];
        if (iosHandler && typeof iosHandler.postMessage === "function") {
          iosHandler.postMessage(raw);
          return true;
        }
        const androidHandler = globalThis[name];
        if (androidHandler && typeof androidHandler.postMessage === "function") {
          // Important: call as a method on the interface object (binding matters on Android WebView).
          androidHandler.postMessage(raw);
          return true;
        }
      }
    } catch {}
    return false;
  }
  function sendUserAction(userAction) {
    const id =
      (userAction && typeof userAction.id === "string" && userAction.id.trim()) ||
      (globalThis.crypto?.randomUUID?.() ?? String(Date.now()));
    const action = { ...userAction, id };
    return postToNode({ userAction: action });
  }
  globalThis.OpenClaw = globalThis.OpenClaw ?? {};
  globalThis.OpenClaw.postMessage = postToNode;
  globalThis.OpenClaw.sendUserAction = sendUserAction;
  globalThis.openclawPostMessage = postToNode;
  globalThis.openclawSendUserAction = sendUserAction;

  try {
    const cap = new URLSearchParams(location.search).get("oc_cap");
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const capQuery = cap ? "?oc_cap=" + encodeURIComponent(cap) : "";
    const ws = new WebSocket(proto + "://" + location.host + ${JSON.stringify(CANVAS_WS_PATH)} + capQuery);
    ws.onmessage = (ev) => {
      if (String(ev.data || "") === "reload") location.reload();
    };
  } catch {}
})();
<\/script>
`.trim();
  const idx = (0, _stringCoerceBUSzWgUA.r)(html).lastIndexOf("</body>");
  if (idx >= 0) return `${html.slice(0, idx)}\n${snippet}\n${html.slice(idx)}`;
  return `${html}\n${snippet}\n`;
}
async function handleA2uiHttpRequest(req, res) {
  const urlRaw = req.url;
  if (!urlRaw) return false;
  const url = new URL(urlRaw, "http://localhost");
  const basePath = url.pathname === "/__openclaw__/a2ui" || url.pathname.startsWith(`/__openclaw__/a2ui/`) ? A2UI_PATH : void 0;
  if (!basePath) return false;
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Method Not Allowed");
    return true;
  }
  const a2uiRootReal = await resolveA2uiRootReal();
  if (!a2uiRootReal) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("A2UI assets not found");
    return true;
  }
  const result = await resolveFileWithinRoot(a2uiRootReal, url.pathname.slice(basePath.length) || "/");
  if (!result) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("not found");
    return true;
  }
  try {
    const lower = (0, _stringCoerceBUSzWgUA.r)(result.realPath);
    const mime = lower.endsWith(".html") || lower.endsWith(".htm") ? "text/html" : (await (0, _mimeB6nXlmtY.t)({ filePath: result.realPath })) ?? "application/octet-stream";
    res.setHeader("Cache-Control", "no-store");
    if (req.method === "HEAD") {
      res.setHeader("Content-Type", mime === "text/html" ? "text/html; charset=utf-8" : mime);
      res.end();
      return true;
    }
    if (mime === "text/html") {
      const buf = await result.handle.readFile({ encoding: "utf8" });
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(injectCanvasLiveReload(buf));
      return true;
    }
    res.setHeader("Content-Type", mime);
    res.end(await result.handle.readFile());
    return true;
  } finally {
    await result.handle.close().catch(() => {});
  }
}
//#endregion
//#region src/gateway/canvas-documents.ts
const CANVAS_DOCUMENTS_DIR_NAME = "documents";
function normalizeLogicalPath(value) {
  const parts = value.replaceAll("\\", "/").replace(/^\/+/, "").split("/").filter(Boolean);
  if (parts.length === 0 || parts.some((part) => part === "." || part === "..")) throw new Error("canvas document logicalPath invalid");
  return parts.join("/");
}
function normalizeCanvasDocumentId(value) {
  const normalized = value.trim();
  if (!normalized || normalized === "." || normalized === ".." || !/^[A-Za-z0-9._-]+$/.test(normalized)) throw new Error("canvas document id invalid");
  return normalized;
}
function resolveCanvasRootDir(rootDir, stateDir = (0, _pathsDvv9VRAc._)()) {
  const resolved = rootDir?.trim() ? (0, _utilsD5DtWkEu.m)(rootDir) : _nodePath.default.join(stateDir, "canvas");
  return _nodePath.default.resolve(resolved);
}
function resolveCanvasDocumentsDir(rootDir, stateDir = (0, _pathsDvv9VRAc._)()) {
  return _nodePath.default.join(resolveCanvasRootDir(rootDir, stateDir), CANVAS_DOCUMENTS_DIR_NAME);
}
function resolveCanvasDocumentDir(documentId, options) {
  return _nodePath.default.join(resolveCanvasDocumentsDir(options?.rootDir, options?.stateDir), documentId);
}
function resolveCanvasHttpPathToLocalPath(requestPath, options) {
  const trimmed = requestPath.trim();
  const prefix = `${CANVAS_HOST_PATH}/${CANVAS_DOCUMENTS_DIR_NAME}/`;
  if (!trimmed.startsWith(prefix)) return null;
  const segments = trimmed.replace(/[?#].*$/, "").slice(prefix.length).split("/").map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  }).filter(Boolean);
  if (segments.length < 2) return null;
  const [rawDocumentId, ...entrySegments] = segments;
  try {
    const documentId = normalizeCanvasDocumentId(rawDocumentId);
    const normalizedEntrypoint = normalizeLogicalPath(entrySegments.join("/"));
    const documentsDir = _nodePath.default.resolve(resolveCanvasDocumentsDir(options?.rootDir, options?.stateDir));
    const candidatePath = _nodePath.default.resolve(resolveCanvasDocumentDir(documentId, options), normalizedEntrypoint);
    if (!(candidatePath === documentsDir || candidatePath.startsWith(`${documentsDir}${_nodePath.default.sep}`))) return null;
    return candidatePath;
  } catch {
    return null;
  }
}
//#endregion
//#region src/media/web-media.ts
function resolveWebMediaOptions(params) {
  if (typeof params.maxBytesOrOptions === "number" || params.maxBytesOrOptions === void 0) return {
    maxBytes: params.maxBytesOrOptions,
    optimizeImages: params.optimizeImages,
    ssrfPolicy: params.options?.ssrfPolicy,
    localRoots: params.options?.localRoots
  };
  return {
    ...params.maxBytesOrOptions,
    optimizeImages: params.optimizeImages ? params.maxBytesOrOptions.optimizeImages ?? true : false
  };
}
const HEIC_MIME_RE = /^image\/hei[cf]$/i;
const HEIC_EXT_RE = /\.(heic|heif)$/i;
const WINDOWS_DRIVE_RE = /^[A-Za-z]:[\\/]/;
const HOST_READ_ALLOWED_DOCUMENT_MIMES = new Set([
"application/msword",
"application/pdf",
"application/vnd.ms-excel",
"application/vnd.ms-powerpoint",
"application/vnd.openxmlformats-officedocument.presentationml.presentation",
"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
"text/csv",
"text/markdown"]
);
const HOST_READ_TEXT_PLAIN_ALIASES = new Set(["text/csv", "text/markdown"]);
const MB = 1024 * 1024;
function getTextStats(text) {
  if (!text) return { printableRatio: 0 };
  let printable = 0;
  let control = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code === 9 || code === 10 || code === 13 || code === 32) {
      printable += 1;
      continue;
    }
    if (code < 32 || code >= 127 && code <= 159) {
      control += 1;
      continue;
    }
    printable += 1;
  }
  const total = printable + control;
  if (total === 0) return { printableRatio: 0 };
  return { printableRatio: printable / total };
}
function hasSingleByteTextShape(buffer) {
  if (buffer.length === 0) return true;
  let asciiText = 0;
  let control = 0;
  for (const byte of buffer) {
    if (byte === 9 || byte === 10 || byte === 13 || byte >= 32 && byte <= 126) {
      asciiText += 1;
      continue;
    }
    if (byte < 32 || byte === 127) control += 1;
  }
  const total = buffer.length;
  const highBytes = total - asciiText - control;
  return control === 0 && asciiText / total >= .7 && highBytes / total <= .3;
}
function decodeHostReadText(buffer) {
  if (buffer.length === 0) return "";
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    if (!hasSingleByteTextShape(buffer)) return;
    return new TextDecoder("latin1").decode(buffer);
  }
}
function isValidatedHostReadText(buffer) {
  if (!buffer) return false;
  if (buffer.length === 0) return true;
  const text = decodeHostReadText(buffer);
  if (text === void 0) return false;
  const { printableRatio } = getTextStats(text);
  return printableRatio > .95;
}
function formatMb(bytes, digits = 2) {
  return (bytes / MB).toFixed(digits);
}
function formatCapLimit(label, cap, size) {
  return `${label} exceeds ${formatMb(cap, 0)}MB limit (got ${formatMb(size)}MB)`;
}
function formatCapReduce(label, cap, size) {
  return `${label} could not be reduced below ${formatMb(cap, 0)}MB (got ${formatMb(size)}MB)`;
}
function isHeicSource(opts) {
  if (opts.contentType && HEIC_MIME_RE.test(opts.contentType.trim())) return true;
  if (opts.fileName && HEIC_EXT_RE.test(opts.fileName.trim())) return true;
  return false;
}
function assertHostReadMediaAllowed(params) {
  const declaredMime = (0, _mimeB6nXlmtY.l)((0, _mimeB6nXlmtY.c)(params.filePath));
  const normalizedMime = (0, _mimeB6nXlmtY.l)(params.contentType);
  if (declaredMime && HOST_READ_TEXT_PLAIN_ALIASES.has(declaredMime)) {
    if (!params.sniffedContentType && params.buffer && isValidatedHostReadText(params.buffer)) return;
    throw new _localMediaAccessBjcJKJws.t("path-not-allowed", "hostReadCapability permits only validated plain-text CSV/Markdown documents for local reads");
  }
  const sniffedKind = (0, _mimeB6nXlmtY.s)(params.sniffedContentType);
  if (sniffedKind === "image" || sniffedKind === "audio" || sniffedKind === "video") return;
  const sniffedMime = (0, _mimeB6nXlmtY.l)(params.sniffedContentType);
  if (sniffedKind === "document" && sniffedMime && HOST_READ_ALLOWED_DOCUMENT_MIMES.has(sniffedMime)) return;
  if (sniffedMime === "application/x-cfb" && [
  ".doc",
  ".ppt",
  ".xls"].
  includes((0, _mimeB6nXlmtY.r)(params.filePath) ?? "")) return;
  if (!sniffedMime && normalizedMime && HOST_READ_TEXT_PLAIN_ALIASES.has(normalizedMime) && params.buffer && isValidatedHostReadText(params.buffer)) return;
  if (params.kind === "document" && normalizedMime && HOST_READ_ALLOWED_DOCUMENT_MIMES.has(normalizedMime)) throw new _localMediaAccessBjcJKJws.t("path-not-allowed", `Host-local media sends require buffer-verified media/document types (got fallback ${normalizedMime}).`);
  throw new _localMediaAccessBjcJKJws.t("path-not-allowed", `Host-local media sends only allow buffer-verified images, audio, video, PDF, and Office documents (got ${sniffedMime ?? normalizedMime ?? "unknown"}).`);
}
function toJpegFileName(fileName) {
  if (!fileName) return;
  const trimmed = fileName.trim();
  if (!trimmed) return fileName;
  const parsed = _nodePath.default.parse(trimmed);
  if (!parsed.ext || HEIC_EXT_RE.test(parsed.ext)) return _nodePath.default.format({
    dir: parsed.dir,
    name: parsed.name || trimmed,
    ext: ".jpg"
  });
  return _nodePath.default.format({
    dir: parsed.dir,
    name: parsed.name,
    ext: ".jpg"
  });
}
function logOptimizedImage(params) {
  if (!(0, _globalsDe6QTwLG.a)()) return;
  if (params.optimized.optimizedSize >= params.originalSize) return;
  if (params.optimized.format === "png") {
    (0, _globalsDe6QTwLG.r)(`Optimized PNG (preserving alpha) from ${formatMb(params.originalSize)}MB to ${formatMb(params.optimized.optimizedSize)}MB (side<=${params.optimized.resizeSide}px)`);
    return;
  }
  (0, _globalsDe6QTwLG.r)(`Optimized media from ${formatMb(params.originalSize)}MB to ${formatMb(params.optimized.optimizedSize)}MB (side<=${params.optimized.resizeSide}px, q=${params.optimized.quality})`);
}
async function optimizeImageWithFallback(params) {
  const { buffer, cap, meta } = params;
  if ((meta?.contentType === "image/png" || meta?.fileName?.toLowerCase().endsWith(".png")) && (await (0, _imageOpsF0rEOT4L.o)(buffer))) {
    const optimized = await (0, _imageOpsF0rEOT4L.c)(buffer, cap);
    if (optimized.buffer.length <= cap) return {
      ...optimized,
      format: "png"
    };
    if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`PNG with alpha still exceeds ${formatMb(cap, 0)}MB after optimization; falling back to JPEG`);
  }
  return {
    ...(await optimizeImageToJpeg(buffer, cap, meta)),
    format: "jpeg"
  };
}
async function loadWebMediaInternal(mediaUrl, options = {}) {
  const { maxBytes, optimizeImages = true, ssrfPolicy, workspaceDir, localRoots, sandboxValidated = false, readFile: readFileOverride, hostReadCapability = false } = options;
  mediaUrl = mediaUrl.replace(/^\s*MEDIA\s*:\s*/i, "");
  if (mediaUrl.startsWith("file://")) try {
    mediaUrl = (0, _localFileAccessCpkF4sBk.a)(mediaUrl);
  } catch (err) {
    throw new _localMediaAccessBjcJKJws.t("invalid-file-url", err.message, { cause: err });
  }
  mediaUrl = resolveCanvasHttpPathToLocalPath(mediaUrl) ?? mediaUrl;
  const optimizeAndClampImage = async (buffer, cap, meta) => {
    const originalSize = buffer.length;
    const optimized = await optimizeImageWithFallback({
      buffer,
      cap,
      meta
    });
    logOptimizedImage({
      originalSize,
      optimized
    });
    if (optimized.buffer.length > cap) throw new Error(formatCapReduce("Media", cap, optimized.buffer.length));
    const contentType = optimized.format === "png" ? "image/png" : "image/jpeg";
    const fileName = optimized.format === "jpeg" && meta && isHeicSource(meta) ? toJpegFileName(meta.fileName) : meta?.fileName;
    return {
      buffer: optimized.buffer,
      contentType,
      kind: "image",
      fileName
    };
  };
  const clampAndFinalize = async (params) => {
    const cap = maxBytes !== void 0 ? maxBytes : (0, _mimeB6nXlmtY.m)(params.kind ?? "document");
    if (params.kind === "image") {
      const isGif = params.contentType === "image/gif";
      if (isGif || !optimizeImages) {
        if (params.buffer.length > cap) throw new Error(formatCapLimit(isGif ? "GIF" : "Media", cap, params.buffer.length));
        return {
          buffer: params.buffer,
          contentType: params.contentType,
          kind: params.kind,
          fileName: params.fileName
        };
      }
      return { ...(await optimizeAndClampImage(params.buffer, cap, {
          contentType: params.contentType,
          fileName: params.fileName
        })) };
    }
    if (params.buffer.length > cap) throw new Error(formatCapLimit("Media", cap, params.buffer.length));
    return {
      buffer: params.buffer,
      contentType: params.contentType ?? void 0,
      kind: params.kind,
      fileName: params.fileName
    };
  };
  if (/^https?:\/\//i.test(mediaUrl)) {
    const defaultFetchCap = (0, _mimeB6nXlmtY.m)("document");
    const { buffer, contentType, fileName } = await (0, _fetchBL7ekE3E.n)({
      url: mediaUrl,
      maxBytes: maxBytes === void 0 ? defaultFetchCap : optimizeImages ? Math.max(maxBytes, defaultFetchCap) : maxBytes,
      ssrfPolicy
    });
    return await clampAndFinalize({
      buffer,
      contentType,
      kind: (0, _mimeB6nXlmtY.s)(contentType),
      fileName
    });
  }
  if (mediaUrl.startsWith("~")) mediaUrl = (0, _utilsD5DtWkEu.m)(mediaUrl);
  if (workspaceDir && !_nodePath.default.isAbsolute(mediaUrl) && !WINDOWS_DRIVE_RE.test(mediaUrl)) mediaUrl = _nodePath.default.resolve(workspaceDir, mediaUrl);
  try {
    (0, _localFileAccessCpkF4sBk.t)(mediaUrl, "Local media path");
  } catch (err) {
    throw new _localMediaAccessBjcJKJws.t("network-path-not-allowed", err.message, { cause: err });
  }
  if ((sandboxValidated || localRoots === "any") && !readFileOverride) throw new _localMediaAccessBjcJKJws.t("unsafe-bypass", "Refusing localRoots bypass without readFile override. Use sandboxValidated with readFile, or pass explicit localRoots.");
  if (!(sandboxValidated || localRoots === "any")) await (0, _localMediaAccessBjcJKJws.n)(mediaUrl, localRoots);
  let data;
  if (readFileOverride) data = await readFileOverride(mediaUrl);else
  try {
    data = (await (0, _fsSafeB7mHodgb.d)({ filePath: mediaUrl })).buffer;
  } catch (err) {
    if (err instanceof _fsSafeB7mHodgb.t) {
      if (err.code === "not-found") throw new _localMediaAccessBjcJKJws.t("not-found", `Local media file not found: ${mediaUrl}`, { cause: err });
      if (err.code === "not-file") throw new _localMediaAccessBjcJKJws.t("not-file", `Local media path is not a file: ${mediaUrl}`, { cause: err });
      throw new _localMediaAccessBjcJKJws.t("invalid-path", `Local media path is not safe to read: ${mediaUrl}`, { cause: err });
    }
    throw err;
  }
  const sniffedMime = await (0, _mimeB6nXlmtY.t)({ buffer: data });
  const mime = await (0, _mimeB6nXlmtY.t)({
    buffer: data,
    filePath: mediaUrl
  });
  const kind = (0, _mimeB6nXlmtY.s)(mime);
  if (hostReadCapability) assertHostReadMediaAllowed({
    sniffedContentType: sniffedMime,
    contentType: mime,
    filePath: mediaUrl,
    kind,
    buffer: data
  });
  let fileName = _nodePath.default.basename(mediaUrl) || void 0;
  if (fileName && !_nodePath.default.extname(fileName) && mime) {
    const ext = (0, _mimeB6nXlmtY.n)(mime);
    if (ext) fileName = `${fileName}${ext}`;
  }
  return await clampAndFinalize({
    buffer: data,
    contentType: mime,
    kind,
    fileName
  });
}
async function loadWebMedia(mediaUrl, maxBytesOrOptions, options) {
  return await loadWebMediaInternal(mediaUrl, resolveWebMediaOptions({
    maxBytesOrOptions,
    options,
    optimizeImages: true
  }));
}
async function loadWebMediaRaw(mediaUrl, maxBytesOrOptions, options) {
  return await loadWebMediaInternal(mediaUrl, resolveWebMediaOptions({
    maxBytesOrOptions,
    options,
    optimizeImages: false
  }));
}
async function optimizeImageToJpeg(buffer, maxBytes, opts = {}) {
  let source = buffer;
  if (isHeicSource(opts)) try {
    source = await (0, _imageOpsF0rEOT4L.i)(buffer);
  } catch (err) {
    throw new Error(`HEIC image conversion failed: ${String(err)}`, { cause: err });
  }
  const sides = [
  2048,
  1536,
  1280,
  1024,
  800];

  const qualities = [
  80,
  70,
  60,
  50,
  40];

  let smallest = null;
  for (const side of sides) for (const quality of qualities) try {
    const out = await (0, _imageOpsF0rEOT4L.l)({
      buffer: source,
      maxSide: side,
      quality,
      withoutEnlargement: true
    });
    const size = out.length;
    if (!smallest || size < smallest.size) smallest = {
      buffer: out,
      size,
      resizeSide: side,
      quality
    };
    if (size <= maxBytes) return {
      buffer: out,
      optimizedSize: size,
      resizeSide: side,
      quality
    };
  } catch {}
  if (smallest) return {
    buffer: smallest.buffer,
    optimizedSize: smallest.size,
    resizeSide: smallest.resizeSide,
    quality: smallest.quality
  };
  throw new Error("Failed to optimize image");
}
//#endregion /* v9-51e630a2b2662326 */
