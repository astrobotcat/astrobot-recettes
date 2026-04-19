"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = runCapability;exports.c = void 0;exports.d = resolveAttachmentKind;exports.i = resolveMediaAttachmentLocalRoots;exports.l = isAudioAttachment;exports.n = clearMediaUnderstandingBinaryCacheForTests;exports.o = createMediaAttachmentCache;exports.r = resolveAutoImageModel;exports.s = normalizeMediaAttachments;exports.t = buildProviderRegistry;exports.u = normalizeAttachments;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _unhandledRejectionsCeMi3POt = require("./unhandled-rejections-CeMi3POt.js");
var _globalsDe6QTwLG = require("./globals-De6QTwLG.js");
var _loggerBA_TvTc = require("./logger-BA_TvTc6.js");
var _execBAdwyfxI = require("./exec-BAdwyfxI.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _modelInputDFbXtnkw = require("./model-input-DFbXtnkw.js");
var _inboundPathPolicyBLO4l9wD = require("./inbound-path-policy-BLO4l9wD.js");
var _modelCatalogCdCqmHkW = require("./model-catalog-CdCqmHkW.js");
var _mimeB6nXlmtY = require("./mime-B6nXlmtY.js");
var _modelAuthKKLbMBGv = require("./model-auth-KKLbMBGv.js");
var _fetchTimeoutDZD6CQL_ = require("./fetch-timeout-DZD6CQL_.js");
var _localFileAccessCpkF4sBk = require("./local-file-access-CpkF4sBk.js");
var _localRootsBrPriMlc = require("./local-roots-BrPriMlc.js");
var _fetchBL7ekE3E = require("./fetch-BL7ekE3E.js");
var _entryCapabilities7cOlAQEs = require("./entry-capabilities-7cOlAQEs.js");
var _resolveDqYzTtEU = require("./resolve-DqYzTtEU.js");
var _channelInboundRootsN6vA7T = require("./channel-inbound-roots-n6vA7T07.js");
var _tempDownloadCR3vQhFd = require("./temp-download-CR3vQhFd.js");
require("./temp-path-H6fpiZd0.js");
var _runnerEntriesDUh05bfx = require("./runner.entries-DUh05bfx.js");
require("./shared-Csk0T9PR.js");
var _nodeFs = require("node:fs");
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeOs = _interopRequireDefault(require("node:os"));
var _promises = _interopRequireDefault(require("node:fs/promises"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/media-understanding/attachments.normalize.ts
function normalizeAttachmentPath(raw) {
  const value = (0, _stringCoerceBUSzWgUA.s)(raw);
  if (!value) return;
  if (value.startsWith("file://")) try {
    return (0, _localFileAccessCpkF4sBk.a)(value);
  } catch {
    return;
  }
  try {
    (0, _localFileAccessCpkF4sBk.t)(value, "Attachment path");
  } catch {
    return;
  }
  return value;
}
function normalizeAttachments(ctx) {
  const pathsFromArray = Array.isArray(ctx.MediaPaths) ? ctx.MediaPaths : void 0;
  const urlsFromArray = Array.isArray(ctx.MediaUrls) ? ctx.MediaUrls : void 0;
  const typesFromArray = Array.isArray(ctx.MediaTypes) ? ctx.MediaTypes : void 0;
  const resolveMime = (count, index) => {
    const typeHint = (0, _stringCoerceBUSzWgUA.s)(typesFromArray?.[index]);
    if (typeHint) return typeHint;
    return count === 1 ? ctx.MediaType : void 0;
  };
  if (pathsFromArray && pathsFromArray.length > 0) {
    const count = pathsFromArray.length;
    const urls = urlsFromArray && urlsFromArray.length > 0 ? urlsFromArray : void 0;
    return pathsFromArray.map((value, index) => ({
      path: (0, _stringCoerceBUSzWgUA.s)(value),
      url: urls?.[index] ?? ctx.MediaUrl,
      mime: resolveMime(count, index),
      index
    })).filter((entry) => Boolean(entry.path ?? (0, _stringCoerceBUSzWgUA.s)(entry.url)));
  }
  if (urlsFromArray && urlsFromArray.length > 0) {
    const count = urlsFromArray.length;
    return urlsFromArray.map((value, index) => ({
      path: void 0,
      url: (0, _stringCoerceBUSzWgUA.s)(value),
      mime: resolveMime(count, index),
      index
    })).filter((entry) => Boolean(entry.url));
  }
  const pathValue = (0, _stringCoerceBUSzWgUA.s)(ctx.MediaPath);
  const url = (0, _stringCoerceBUSzWgUA.s)(ctx.MediaUrl);
  if (!pathValue && !url) return [];
  return [{
    path: pathValue || void 0,
    url: url || void 0,
    mime: ctx.MediaType,
    index: 0
  }];
}
function resolveAttachmentKind(attachment) {
  const kind = (0, _mimeB6nXlmtY.s)(attachment.mime);
  if (kind === "image" || kind === "audio" || kind === "video") return kind;
  const ext = (0, _mimeB6nXlmtY.r)(attachment.path ?? attachment.url);
  if (!ext) return "unknown";
  if ([
  ".mp4",
  ".mov",
  ".mkv",
  ".webm",
  ".avi",
  ".m4v"].
  includes(ext)) return "video";
  if ((0, _mimeB6nXlmtY.a)(attachment.path ?? attachment.url)) return "audio";
  if ([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".bmp",
  ".tiff",
  ".tif"].
  includes(ext)) return "image";
  return "unknown";
}
function isVideoAttachment(attachment) {
  return resolveAttachmentKind(attachment) === "video";
}
function isAudioAttachment(attachment) {
  return resolveAttachmentKind(attachment) === "audio";
}
function isImageAttachment(attachment) {
  return resolveAttachmentKind(attachment) === "image";
}
//#endregion
//#region src/media-understanding/attachments.select.ts
const DEFAULT_MAX_ATTACHMENTS = 1;
function orderAttachments(attachments, prefer) {
  const list = Array.isArray(attachments) ? attachments.filter(isAttachmentRecord) : [];
  if (!prefer || prefer === "first") return list;
  if (prefer === "last") return [...list].toReversed();
  if (prefer === "path") {
    const withPath = list.filter((item) => item.path);
    const withoutPath = list.filter((item) => !item.path);
    return [...withPath, ...withoutPath];
  }
  if (prefer === "url") {
    const withUrl = list.filter((item) => item.url);
    const withoutUrl = list.filter((item) => !item.url);
    return [...withUrl, ...withoutUrl];
  }
  return list;
}
function isAttachmentRecord(value) {
  if (!value || typeof value !== "object") return false;
  const entry = value;
  if (typeof entry.index !== "number") return false;
  if (entry.path !== void 0 && typeof entry.path !== "string") return false;
  if (entry.url !== void 0 && typeof entry.url !== "string") return false;
  if (entry.mime !== void 0 && typeof entry.mime !== "string") return false;
  if (entry.alreadyTranscribed !== void 0 && typeof entry.alreadyTranscribed !== "boolean") return false;
  return true;
}
function selectAttachments(params) {
  const { capability, attachments, policy } = params;
  const matches = (Array.isArray(attachments) ? attachments.filter(isAttachmentRecord) : []).filter((item) => {
    if (capability === "audio" && item.alreadyTranscribed) return false;
    if (capability === "image") return isImageAttachment(item);
    if (capability === "audio") return isAudioAttachment(item);
    return isVideoAttachment(item);
  });
  if (matches.length === 0) return [];
  const ordered = orderAttachments(matches, policy?.prefer);
  const mode = policy?.mode ?? "first";
  const maxAttachments = policy?.maxAttachments ?? DEFAULT_MAX_ATTACHMENTS;
  if (mode === "all") return ordered.slice(0, Math.max(1, maxAttachments));
  return ordered.slice(0, 1);
}
//#endregion
//#region src/media-understanding/attachments.cache.ts
let defaultLocalPathRoots;
function getDefaultLocalPathRoots() {
  defaultLocalPathRoots ??= (0, _inboundPathPolicyBLO4l9wD.r)((0, _localRootsBrPriMlc.a)());
  return defaultLocalPathRoots;
}
function resolveRequestUrl(input) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}
var MediaAttachmentCache = class {
  constructor(attachments, options) {
    this.entries = /* @__PURE__ */new Map();
    this.attachments = attachments;
    this.localPathRoots = options?.includeDefaultLocalPathRoots === false ? (0, _inboundPathPolicyBLO4l9wD.r)(options.localPathRoots) : (0, _inboundPathPolicyBLO4l9wD.r)(options?.localPathRoots, getDefaultLocalPathRoots());
    for (const attachment of attachments) this.entries.set(attachment.index, { attachment });
  }
  async getBuffer(params) {
    const entry = await this.ensureEntry(params.attachmentIndex);
    const url = entry.attachment.url?.trim();
    if (entry.buffer) {
      if (entry.buffer.length > params.maxBytes) throw new _runnerEntriesDUh05bfx.v("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
      return {
        buffer: entry.buffer,
        mime: entry.bufferMime,
        fileName: entry.bufferFileName ?? `media-${params.attachmentIndex + 1}`,
        size: entry.buffer.length
      };
    }
    if (entry.resolvedPath) try {
      const size = await this.ensureLocalStat(entry);
      if (entry.resolvedPath) {
        if (size !== void 0 && size > params.maxBytes) throw new _runnerEntriesDUh05bfx.v("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
        const { buffer, filePath } = await this.readLocalBuffer({
          attachmentIndex: params.attachmentIndex,
          filePath: entry.resolvedPath,
          maxBytes: params.maxBytes
        });
        entry.resolvedPath = filePath;
        entry.buffer = buffer;
        entry.bufferMime = entry.bufferMime ?? entry.attachment.mime ?? (await (0, _mimeB6nXlmtY.t)({
          buffer,
          filePath
        }));
        entry.bufferFileName = _nodePath.default.basename(filePath) || `media-${params.attachmentIndex + 1}`;
        return {
          buffer,
          mime: entry.bufferMime,
          fileName: entry.bufferFileName,
          size: buffer.length
        };
      }
    } catch (err) {
      if (!(err instanceof _runnerEntriesDUh05bfx.v) || !url || err.reason !== "blocked" && err.reason !== "empty") throw err;
    }
    if (!url) throw new _runnerEntriesDUh05bfx.v("empty", `Attachment ${params.attachmentIndex + 1} has no path or URL.`);
    try {
      const fetchImpl = (input, init) => (0, _fetchTimeoutDZD6CQL_.r)(resolveRequestUrl(input), init ?? {}, params.timeoutMs, globalThis.fetch);
      const fetched = await (0, _fetchBL7ekE3E.n)({
        url,
        fetchImpl,
        maxBytes: params.maxBytes
      });
      entry.buffer = fetched.buffer;
      entry.bufferMime = entry.attachment.mime ?? fetched.contentType ?? (await (0, _mimeB6nXlmtY.t)({
        buffer: fetched.buffer,
        filePath: fetched.fileName ?? url
      }));
      entry.bufferFileName = fetched.fileName ?? `media-${params.attachmentIndex + 1}`;
      return {
        buffer: fetched.buffer,
        mime: entry.bufferMime,
        fileName: entry.bufferFileName,
        size: fetched.buffer.length
      };
    } catch (err) {
      if (err instanceof _fetchBL7ekE3E.t && err.code === "max_bytes") throw new _runnerEntriesDUh05bfx.v("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
      if ((0, _unhandledRejectionsCeMi3POt.n)(err)) throw new _runnerEntriesDUh05bfx.v("timeout", `Attachment ${params.attachmentIndex + 1} timed out while fetching.`);
      throw err;
    }
  }
  async getPath(params) {
    const entry = await this.ensureEntry(params.attachmentIndex);
    if (entry.resolvedPath) {
      if (params.maxBytes) try {
        const size = await this.ensureLocalStat(entry);
        if (entry.resolvedPath) {
          if (size !== void 0 && size > params.maxBytes) throw new _runnerEntriesDUh05bfx.v("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
        }
      } catch (err) {
        if (!(err instanceof _runnerEntriesDUh05bfx.v) || err.reason !== "blocked" && err.reason !== "empty") throw err;
      }
      if (entry.resolvedPath) return { path: entry.resolvedPath };
    }
    if (entry.tempPath) {
      if (params.maxBytes && entry.buffer && entry.buffer.length > params.maxBytes) throw new _runnerEntriesDUh05bfx.v("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
      return {
        path: entry.tempPath,
        cleanup: entry.tempCleanup
      };
    }
    const maxBytes = params.maxBytes ?? Number.POSITIVE_INFINITY;
    const bufferResult = await this.getBuffer({
      attachmentIndex: params.attachmentIndex,
      maxBytes,
      timeoutMs: params.timeoutMs
    });
    const tmpPath = (0, _tempDownloadCR3vQhFd.t)({
      prefix: "openclaw-media",
      extension: _nodePath.default.extname(bufferResult.fileName || "") || ""
    });
    await _promises.default.writeFile(tmpPath, bufferResult.buffer);
    entry.tempPath = tmpPath;
    entry.tempCleanup = async () => {
      await _promises.default.unlink(tmpPath).catch(() => {});
    };
    return {
      path: tmpPath,
      cleanup: entry.tempCleanup
    };
  }
  async cleanup() {
    const cleanups = [];
    for (const entry of this.entries.values()) if (entry.tempCleanup) {
      cleanups.push(entry.tempCleanup());
      entry.tempCleanup = void 0;
    }
    await Promise.all(cleanups);
  }
  async ensureEntry(attachmentIndex) {
    const existing = this.entries.get(attachmentIndex);
    if (existing) {
      if (!existing.resolvedPath) existing.resolvedPath = this.resolveLocalPath(existing.attachment);
      return existing;
    }
    const attachment = this.attachments.find((item) => item.index === attachmentIndex) ?? { index: attachmentIndex };
    const entry = {
      attachment,
      resolvedPath: this.resolveLocalPath(attachment)
    };
    this.entries.set(attachmentIndex, entry);
    return entry;
  }
  resolveLocalPath(attachment) {
    const rawPath = normalizeAttachmentPath(attachment.path);
    if (!rawPath) return;
    return _nodePath.default.isAbsolute(rawPath) ? rawPath : _nodePath.default.resolve(rawPath);
  }
  async ensureLocalStat(entry) {
    if (!entry.resolvedPath) return;
    if (!(0, _inboundPathPolicyBLO4l9wD.t)({
      filePath: entry.resolvedPath,
      roots: this.localPathRoots
    })) {
      entry.resolvedPath = void 0;
      if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`Blocked attachment path outside allowed roots: ${entry.attachment.path ?? entry.attachment.url ?? "(unknown)"}`);
      throw new _runnerEntriesDUh05bfx.v("blocked", `Attachment ${entry.attachment.index + 1} path is outside allowed roots.`);
    }
    if (entry.statSize !== void 0) return entry.statSize;
    try {
      const currentPath = entry.resolvedPath;
      const stat = await _promises.default.stat(currentPath);
      if (!stat.isFile()) {
        entry.resolvedPath = void 0;
        throw new _runnerEntriesDUh05bfx.v("empty", `Attachment ${entry.attachment.index + 1} path is not a regular file.`);
      }
      const canonicalPath = await this.resolveCanonicalLocalPath(currentPath);
      if (!canonicalPath) {
        entry.resolvedPath = void 0;
        throw new _runnerEntriesDUh05bfx.v("blocked", `Attachment ${entry.attachment.index + 1} could not be canonicalized.`);
      }
      if (!(0, _inboundPathPolicyBLO4l9wD.t)({
        filePath: canonicalPath,
        roots: await this.getCanonicalLocalPathRoots()
      })) {
        entry.resolvedPath = void 0;
        if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`Blocked canonicalized attachment path outside allowed roots: ${canonicalPath}`);
        throw new _runnerEntriesDUh05bfx.v("blocked", `Attachment ${entry.attachment.index + 1} path is outside allowed roots.`);
      }
      entry.resolvedPath = canonicalPath;
      entry.statSize = stat.size;
      return stat.size;
    } catch (err) {
      if (err instanceof _runnerEntriesDUh05bfx.v) throw err;
      entry.resolvedPath = void 0;
      if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`Failed to read attachment ${entry.attachment.index + 1}: ${String(err)}`);
      return;
    }
  }
  async getCanonicalLocalPathRoots() {
    if (this.canonicalLocalPathRoots) return await this.canonicalLocalPathRoots;
    this.canonicalLocalPathRoots = (async () => (0, _inboundPathPolicyBLO4l9wD.r)(this.localPathRoots, await Promise.all(this.localPathRoots.map(async (root) => {
      if (root.includes("*")) return root;
      return await _promises.default.realpath(root).catch(() => root);
    }))))();
    return await this.canonicalLocalPathRoots;
  }
  async readLocalBuffer(params) {
    const flags = _nodeFs.constants.O_RDONLY | (process.platform === "win32" ? 0 : _nodeFs.constants.O_NOFOLLOW);
    const handle = await _promises.default.open(params.filePath, flags);
    try {
      if (!(await handle.stat()).isFile()) throw new _runnerEntriesDUh05bfx.v("empty", `Attachment ${params.attachmentIndex + 1} path is not a regular file.`);
      const canonicalPath = await this.resolveCanonicalLocalPath(params.filePath);
      if (!canonicalPath) throw new _runnerEntriesDUh05bfx.v("blocked", `Attachment ${params.attachmentIndex + 1} could not be canonicalized.`);
      if (!(0, _inboundPathPolicyBLO4l9wD.t)({
        filePath: canonicalPath,
        roots: await this.getCanonicalLocalPathRoots()
      })) throw new _runnerEntriesDUh05bfx.v("blocked", `Attachment ${params.attachmentIndex + 1} path is outside allowed roots.`);
      const buffer = await handle.readFile();
      if (buffer.length > params.maxBytes) throw new _runnerEntriesDUh05bfx.v("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
      return {
        buffer,
        filePath: canonicalPath
      };
    } finally {
      await handle.close().catch(() => {});
    }
  }
  async resolveCanonicalLocalPath(filePath) {
    try {
      return await _promises.default.realpath(filePath);
    } catch (err) {
      if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`Blocked attachment path when canonicalization failed: ${filePath} (${String(err)})`);
      return;
    }
  }
};
//#endregion
//#region src/media-understanding/runner.attachments.ts
exports.c = MediaAttachmentCache;function normalizeMediaAttachments(ctx) {
  return normalizeAttachments(ctx);
}
function createMediaAttachmentCache(attachments, options) {
  return new MediaAttachmentCache(attachments, options);
}
//#endregion
//#region src/media-understanding/runner.ts
function providerSupportsCapability(provider, capability) {
  if (!provider) return false;
  if (capability === "audio") return Boolean(provider.transcribeAudio);
  if (capability === "image") return Boolean(provider.describeImage);
  return Boolean(provider.describeVideo);
}
function resolveConfiguredKeyProviderOrder(params) {
  const configuredProviders = Object.keys(params.cfg.models?.providers ?? {}).map((providerId) => (0, _entryCapabilities7cOlAQEs.r)(providerId)).filter(Boolean).filter((providerId, index, values) => values.indexOf(providerId) === index).filter((providerId) => providerSupportsCapability(params.providerRegistry.get(providerId), params.capability));
  return [...new Set([...configuredProviders, ...params.fallbackProviders])];
}
function resolveConfiguredImageModelId(params) {
  return (0, _providerIdKaStHhRz.n)(params.cfg.models?.providers, params.providerId)?.models?.find((entry) => {
    const id = entry?.id?.trim();
    return Boolean(id) && entry?.input?.includes("image");
  })?.id?.trim() || void 0;
}
function resolveCatalogImageModelId(params) {
  const matches = params.catalog.filter((entry) => (0, _entryCapabilities7cOlAQEs.r)(entry.provider) === params.providerId && (0, _modelCatalogCdCqmHkW.a)(entry));
  if (matches.length === 0) return;
  return (0, _stringCoerceBUSzWgUA.s)((matches.find((entry) => (0, _stringCoerceBUSzWgUA.i)(entry.id) === "auto") ?? matches[0])?.id);
}
async function resolveAutoImageModelId(params) {
  const explicit = (0, _stringCoerceBUSzWgUA.s)(params.explicitModel);
  if (explicit) return explicit;
  const configuredModel = resolveConfiguredImageModelId(params);
  if (configuredModel) return configuredModel;
  const defaultModel = (0, _resolveDqYzTtEU.x)({
    cfg: params.cfg,
    providerId: params.providerId,
    capability: "image"
  });
  if (defaultModel) return defaultModel;
  const catalog = await (0, _modelCatalogCdCqmHkW.r)({ config: params.cfg });
  return resolveCatalogImageModelId({
    providerId: params.providerId,
    catalog
  });
}
function buildProviderRegistry(overrides, cfg) {
  return (0, _resolveDqYzTtEU.S)(overrides, cfg);
}
function resolveMediaAttachmentLocalRoots(params) {
  return (0, _inboundPathPolicyBLO4l9wD.r)((0, _localRootsBrPriMlc.a)(), (0, _channelInboundRootsN6vA7T.t)(params));
}
const binaryCache = /* @__PURE__ */new Map();
const geminiProbeCache = /* @__PURE__ */new Map();
function clearMediaUnderstandingBinaryCacheForTests() {
  binaryCache.clear();
  geminiProbeCache.clear();
}
function expandHomeDir(value) {
  if (!value.startsWith("~")) return value;
  const home = _nodeOs.default.homedir();
  if (value === "~") return home;
  if (value.startsWith("~/")) return _nodePath.default.join(home, value.slice(2));
  return value;
}
function hasPathSeparator(value) {
  return value.includes("/") || value.includes("\\");
}
function candidateBinaryNames(name) {
  if (process.platform !== "win32") return [name];
  if (_nodePath.default.extname(name)) return [name];
  const pathext = (process.env.PATHEXT ?? ".EXE;.CMD;.BAT;.COM").split(";").map((item) => item.trim()).filter(Boolean).map((item) => item.startsWith(".") ? item : `.${item}`);
  return [name, ...Array.from(new Set(pathext)).map((item) => `${name}${item}`)];
}
async function isExecutable(filePath) {
  try {
    if (!(await _promises.default.stat(filePath)).isFile()) return false;
    if (process.platform === "win32") return true;
    await _promises.default.access(filePath, _nodeFs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
async function findBinary(name) {
  const cached = binaryCache.get(name);
  if (cached) return cached;
  const resolved = (async () => {
    const direct = expandHomeDir(name.trim());
    if (direct && hasPathSeparator(direct)) {
      for (const candidate of candidateBinaryNames(direct)) if (await isExecutable(candidate)) return candidate;
    }
    const searchName = name.trim();
    if (!searchName) return null;
    const pathEntries = (process.env.PATH ?? "").split(_nodePath.default.delimiter);
    const candidates = candidateBinaryNames(searchName);
    for (const entryRaw of pathEntries) {
      const entry = expandHomeDir(entryRaw.trim().replace(/^"(.*)"$/, "$1"));
      if (!entry) continue;
      for (const candidate of candidates) {
        const fullPath = _nodePath.default.join(entry, candidate);
        if (await isExecutable(fullPath)) return fullPath;
      }
    }
    return null;
  })();
  binaryCache.set(name, resolved);
  return resolved;
}
async function hasBinary(name) {
  return Boolean(await findBinary(name));
}
async function probeGeminiCli() {
  const cached = geminiProbeCache.get("gemini");
  if (cached) return cached;
  const resolved = (async () => {
    if (!(await hasBinary("gemini"))) return false;
    try {
      const { stdout } = await (0, _execBAdwyfxI.i)("gemini", [
      "--output-format",
      "json",
      "ok"],
      { timeoutMs: 8e3 });
      return Boolean((0, _runnerEntriesDUh05bfx.g)(stdout) ?? (0, _stringCoerceBUSzWgUA.i)(stdout).includes("ok"));
    } catch {
      return false;
    }
  })();
  geminiProbeCache.set("gemini", resolved);
  return resolved;
}
async function resolveLocalWhisperCppEntry() {
  if (!(await hasBinary("whisper-cli"))) return null;
  const envModel = process.env.WHISPER_CPP_MODEL?.trim();
  const modelPath = envModel && (await (0, _runnerEntriesDUh05bfx._)(envModel)) ? envModel : "/opt/homebrew/share/whisper-cpp/for-tests-ggml-tiny.bin";
  if (!(await (0, _runnerEntriesDUh05bfx._)(modelPath))) return null;
  return {
    type: "cli",
    command: "whisper-cli",
    args: [
    "-m",
    modelPath,
    "-otxt",
    "-of",
    "{{OutputBase}}",
    "-np",
    "-nt",
    "{{MediaPath}}"]

  };
}
async function resolveLocalWhisperEntry() {
  if (!(await hasBinary("whisper"))) return null;
  return {
    type: "cli",
    command: "whisper",
    args: [
    "--model",
    "turbo",
    "--output_format",
    "txt",
    "--output_dir",
    "{{OutputDir}}",
    "--verbose",
    "False",
    "{{MediaPath}}"]

  };
}
async function resolveSherpaOnnxEntry() {
  if (!(await hasBinary("sherpa-onnx-offline"))) return null;
  const modelDir = process.env.SHERPA_ONNX_MODEL_DIR?.trim();
  if (!modelDir) return null;
  const tokens = _nodePath.default.join(modelDir, "tokens.txt");
  const encoder = _nodePath.default.join(modelDir, "encoder.onnx");
  const decoder = _nodePath.default.join(modelDir, "decoder.onnx");
  const joiner = _nodePath.default.join(modelDir, "joiner.onnx");
  if (!(await (0, _runnerEntriesDUh05bfx._)(tokens))) return null;
  if (!(await (0, _runnerEntriesDUh05bfx._)(encoder))) return null;
  if (!(await (0, _runnerEntriesDUh05bfx._)(decoder))) return null;
  if (!(await (0, _runnerEntriesDUh05bfx._)(joiner))) return null;
  return {
    type: "cli",
    command: "sherpa-onnx-offline",
    args: [
    `--tokens=${tokens}`,
    `--encoder=${encoder}`,
    `--decoder=${decoder}`,
    `--joiner=${joiner}`,
    "{{MediaPath}}"]

  };
}
async function resolveLocalAudioEntry() {
  const sherpa = await resolveSherpaOnnxEntry();
  if (sherpa) return sherpa;
  const whisperCpp = await resolveLocalWhisperCppEntry();
  if (whisperCpp) return whisperCpp;
  return await resolveLocalWhisperEntry();
}
async function resolveGeminiCliEntry(_capability) {
  if (!(await probeGeminiCli())) return null;
  return {
    type: "cli",
    command: "gemini",
    args: [
    "--output-format",
    "json",
    "--allowed-tools",
    "read_many_files",
    "--include-directories",
    "{{MediaDir}}",
    "{{Prompt}}",
    "Use read_many_files to read {{MediaPath}} and respond with only the text output."]

  };
}
async function resolveKeyEntry(params) {
  const { cfg, agentDir, providerRegistry, capability } = params;
  const checkProvider = async (providerId, model) => {
    const provider = (0, _resolveDqYzTtEU.C)(providerId, providerRegistry);
    if (!provider) return null;
    if (capability === "audio" && !provider.transcribeAudio) return null;
    if (capability === "image" && !provider.describeImage) return null;
    if (capability === "video" && !provider.describeVideo) return null;
    if (!(await (0, _modelAuthKKLbMBGv.a)({
      provider: providerId,
      cfg,
      agentDir
    }))) return null;
    const resolvedModel = capability === "image" ? await resolveAutoImageModelId({
      cfg,
      providerId,
      explicitModel: model
    }) : model;
    if (capability === "image" && !resolvedModel) return null;
    return {
      type: "provider",
      provider: providerId,
      model: resolvedModel
    };
  };
  const activeProvider = params.activeModel?.provider?.trim();
  if (activeProvider) {
    const activeEntry = await checkProvider(activeProvider, params.activeModel?.model);
    if (activeEntry) return activeEntry;
  }
  for (const providerId of resolveConfiguredKeyProviderOrder({
    cfg,
    providerRegistry,
    capability,
    fallbackProviders: (0, _resolveDqYzTtEU.b)({
      cfg,
      capability,
      providerRegistry
    })
  })) {
    const entry = await checkProvider(providerId, void 0);
    if (entry) return entry;
  }
  return null;
}
function resolveImageModelFromAgentDefaults(cfg) {
  const refs = [];
  const primary = (0, _modelInputDFbXtnkw.n)(cfg.agents?.defaults?.imageModel);
  if (primary?.trim()) refs.push(primary.trim());
  for (const fb of (0, _modelInputDFbXtnkw.t)(cfg.agents?.defaults?.imageModel)) if (fb?.trim()) refs.push(fb.trim());
  if (refs.length === 0) return [];
  const entries = [];
  for (const ref of refs) {
    const slashIdx = ref.indexOf("/");
    if (slashIdx <= 0 || slashIdx >= ref.length - 1) continue;
    entries.push({
      type: "provider",
      provider: ref.slice(0, slashIdx),
      model: ref.slice(slashIdx + 1)
    });
  }
  return entries;
}
async function resolveAutoEntries(params) {
  const activeEntry = await resolveActiveModelEntry(params);
  if (activeEntry) return [activeEntry];
  if (params.capability === "audio") {
    const localAudio = await resolveLocalAudioEntry();
    if (localAudio) return [localAudio];
  }
  if (params.capability === "image") {
    const imageModelEntries = resolveImageModelFromAgentDefaults(params.cfg);
    if (imageModelEntries.length > 0) return imageModelEntries;
  }
  const gemini = await resolveGeminiCliEntry(params.capability);
  if (gemini) return [gemini];
  const keys = await resolveKeyEntry(params);
  if (keys) return [keys];
  return [];
}
async function resolveAutoImageModel(params) {
  const providerRegistry = buildProviderRegistry(void 0, params.cfg);
  const toActive = (entry) => {
    if (!entry || entry.type === "cli") return null;
    const provider = entry.provider;
    const model = entry.model?.trim();
    if (!provider || !model) return null;
    return {
      provider,
      model
    };
  };
  const resolvedActive = toActive(await resolveActiveModelEntry({
    cfg: params.cfg,
    agentDir: params.agentDir,
    providerRegistry,
    capability: "image",
    activeModel: params.activeModel
  }));
  if (resolvedActive) return resolvedActive;
  return toActive(await resolveKeyEntry({
    cfg: params.cfg,
    agentDir: params.agentDir,
    providerRegistry,
    capability: "image",
    activeModel: params.activeModel
  }));
}
async function resolveActiveModelEntry(params) {
  const activeProviderRaw = params.activeModel?.provider?.trim();
  if (!activeProviderRaw) return null;
  const providerId = (0, _entryCapabilities7cOlAQEs.r)(activeProviderRaw);
  if (!providerId) return null;
  const provider = (0, _resolveDqYzTtEU.C)(providerId, params.providerRegistry);
  if (!provider) return null;
  if (params.capability === "audio" && !provider.transcribeAudio) return null;
  if (params.capability === "image" && !provider.describeImage) return null;
  if (params.capability === "video" && !provider.describeVideo) return null;
  if (!(await (0, _modelAuthKKLbMBGv.a)({
    provider: providerId,
    cfg: params.cfg,
    agentDir: params.agentDir
  }))) return null;
  const model = params.capability === "image" ? await resolveAutoImageModelId({
    cfg: params.cfg,
    providerId,
    explicitModel: params.activeModel?.model
  }) : params.activeModel?.model;
  if (params.capability === "image" && !model) return null;
  return {
    type: "provider",
    provider: providerId,
    model
  };
}
async function runAttachmentEntries(params) {
  const { entries, capability } = params;
  const attempts = [];
  for (const entry of entries) {
    const entryType = entry.type ?? (entry.command ? "cli" : "provider");
    try {
      const result = entryType === "cli" ? await (0, _runnerEntriesDUh05bfx.a)({
        capability,
        entry,
        cfg: params.cfg,
        ctx: params.ctx,
        attachmentIndex: params.attachmentIndex,
        cache: params.cache,
        config: params.config
      }) : await (0, _runnerEntriesDUh05bfx.o)({
        capability,
        entry,
        cfg: params.cfg,
        ctx: params.ctx,
        attachmentIndex: params.attachmentIndex,
        cache: params.cache,
        agentDir: params.agentDir,
        providerRegistry: params.providerRegistry,
        config: params.config
      });
      if (result) {
        const decision = (0, _runnerEntriesDUh05bfx.t)({
          entry,
          entryType,
          outcome: "success"
        });
        if (result.provider) decision.provider = result.provider;
        if (result.model) decision.model = result.model;
        attempts.push(decision);
        return {
          output: result,
          attempts
        };
      }
      attempts.push((0, _runnerEntriesDUh05bfx.t)({
        entry,
        entryType,
        outcome: "skipped",
        reason: "empty output"
      }));
    } catch (err) {
      if ((0, _runnerEntriesDUh05bfx.y)(err)) {
        attempts.push((0, _runnerEntriesDUh05bfx.t)({
          entry,
          entryType,
          outcome: "skipped",
          reason: `${err.reason}: ${err.message}`
        }));
        if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`Skipping ${capability} model due to ${err.reason}: ${err.message}`);
        continue;
      }
      attempts.push((0, _runnerEntriesDUh05bfx.t)({
        entry,
        entryType,
        outcome: "failed",
        reason: String(err)
      }));
      if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`${capability} understanding failed: ${String(err)}`);
    }
  }
  return {
    output: null,
    attempts
  };
}
function hasFailedMediaAttempt(attachments) {
  return attachments.some((attachment) => attachment.attempts.some((attempt) => attempt.outcome === "failed"));
}
async function runCapability(params) {
  const { capability, cfg, ctx } = params;
  const config = params.config ?? cfg.tools?.media?.[capability];
  if (config?.enabled === false) return {
    outputs: [],
    decision: {
      capability,
      outcome: "disabled",
      attachments: []
    }
  };
  const attachmentPolicy = config?.attachments;
  const selected = selectAttachments({
    capability,
    attachments: params.media,
    policy: attachmentPolicy
  });
  if (selected.length === 0) return {
    outputs: [],
    decision: {
      capability,
      outcome: "no-attachment",
      attachments: []
    }
  };
  if ((0, _resolveDqYzTtEU.o)({
    scope: config?.scope,
    ctx
  }) === "deny") {
    if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`${capability} understanding disabled by scope policy.`);
    return {
      outputs: [],
      decision: {
        capability,
        outcome: "scope-deny",
        attachments: selected.map((item) => ({
          attachmentIndex: item.index,
          attempts: []
        }))
      }
    };
  }
  const activeProvider = params.activeModel?.provider?.trim();
  if (capability === "image" && activeProvider) {
    if ((0, _modelCatalogCdCqmHkW.a)((0, _modelCatalogCdCqmHkW.n)(await (0, _modelCatalogCdCqmHkW.r)({ config: cfg }), activeProvider, params.activeModel?.model ?? ""))) {
      if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)("Skipping image understanding: primary model supports vision natively");
      const model = params.activeModel?.model?.trim();
      const reason = "primary model supports vision natively";
      return {
        outputs: [],
        decision: {
          capability,
          outcome: "skipped",
          attachments: selected.map((item) => {
            const attempt = {
              type: "provider",
              provider: activeProvider,
              model: model || void 0,
              outcome: "skipped",
              reason
            };
            return {
              attachmentIndex: item.index,
              attempts: [attempt],
              chosen: attempt
            };
          })
        }
      };
    }
  }
  let resolvedEntries = (0, _resolveDqYzTtEU.i)({
    cfg,
    capability,
    config,
    providerRegistry: params.providerRegistry
  });
  if (resolvedEntries.length === 0) resolvedEntries = await resolveAutoEntries({
    cfg,
    agentDir: params.agentDir,
    providerRegistry: params.providerRegistry,
    capability,
    activeModel: params.activeModel
  });
  if (resolvedEntries.length === 0) return {
    outputs: [],
    decision: {
      capability,
      outcome: "skipped",
      attachments: selected.map((item) => ({
        attachmentIndex: item.index,
        attempts: []
      }))
    }
  };
  const outputs = [];
  const attachmentDecisions = [];
  for (const attachment of selected) {
    const { output, attempts } = await runAttachmentEntries({
      capability,
      cfg,
      ctx,
      attachmentIndex: attachment.index,
      agentDir: params.agentDir,
      providerRegistry: params.providerRegistry,
      cache: params.attachments,
      entries: resolvedEntries,
      config
    });
    if (output) outputs.push(output);
    attachmentDecisions.push({
      attachmentIndex: attachment.index,
      attempts,
      chosen: attempts.find((attempt) => attempt.outcome === "success")
    });
  }
  const decision = {
    capability,
    outcome: outputs.length > 0 ? "success" : hasFailedMediaAttempt(attachmentDecisions) ? "failed" : "skipped",
    attachments: attachmentDecisions
  };
  if (decision.outcome === "failed") (0, _loggerBA_TvTc.a)(`media-understanding: ${(0, _runnerEntriesDUh05bfx.r)(decision)}`);else
  if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`Media understanding ${(0, _runnerEntriesDUh05bfx.r)(decision)}`);
  return {
    outputs,
    decision
  };
}
//#endregion /* v9-2e4811a2d6879d54 */
