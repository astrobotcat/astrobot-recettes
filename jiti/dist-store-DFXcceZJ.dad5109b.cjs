"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.S = resolveGroupSessionKey;exports._ = deriveGroupSessionPatch;exports.a = resolveSessionStoreEntry;exports.b = snapshotSessionOrigin;exports.c = updateSessionStore;exports.d = getActiveSessionMaintenanceWarning;exports.f = pruneStaleEntries;exports.g = enforceSessionDiskBudget;exports.h = rotateSessionFile;exports.i = recordSessionMetaFromInbound;exports.l = updateSessionStoreEntry;exports.m = resolveMaintenanceConfigFromInput;exports.n = normalizeStoreSessionKey;exports.o = saveSessionStore;exports.p = resolveMaintenanceConfig;exports.r = readSessionUpdatedAt;exports.s = updateLastRoute;exports.t = archiveRemovedSessionTranscripts;exports.u = capEntryCount;exports.v = deriveSessionMetaPatch;exports.x = buildGroupDisplayName;exports.y = deriveSessionOrigin;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _stringNormalizationXm3f27dv = require("./string-normalization-xm3f27dv.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
var _zodSchemaBO9ySEsE = require("./zod-schema-BO9ySEsE.js");
var _parseDurationDHL2gXIv = require("./parse-duration-DHL2gXIv.js");
require("./config-Q9XZc_2I.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
require("./plugins-D4ODSIPT.js");
var _artifactsSZgUWHP = require("./artifacts-SZgUWH-P.js");
var _chatTypeDFnPOWna = require("./chat-type-DFnPOWna.js");
var _conversationLabelCio1HuOl = require("./conversation-label-Cio1HuOl.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
var _typesKCfeTvaK = require("./types-KCfeTvaK.js");
var _sessionWriteLockCcI4KSH = require("./session-write-lock-CcI4KSH8.js");
var _jsonFilesL0zR3LSb = require("./json-files-L0zR3LSb.js");
var _deliveryContextSharedEClQPjt = require("./delivery-context.shared-EClQPjt-.js");
var _storeCacheC6102ouP = require("./store-cache-C6102ouP.js");
var _storeLoadDjLNEIy = require("./store-load-DjLNEIy9.js");
var _storeLockStateCuGBI9_ = require("./store-lock-state-Cu-GBI9_.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/config/sessions/group.ts
const getGroupSurfaces = () => new Set([...(0, _messageChannelCBqCPFa_.l)(), "webchat"]);
function resolveImplicitGroupSurface(params) {
  if (params.from.endsWith("@g.us")) return {
    provider: "whatsapp",
    chatType: "group"
  };
  if (params.normalizedChatType) return null;
  return null;
}
function resolveLegacyGroupSessionKey(ctx) {
  for (const plugin of (0, _registryDelpa74L.r)()) {
    const resolved = plugin.messaging?.resolveLegacyGroupSessionKey?.(ctx);
    if (resolved) return resolved;
  }
  return null;
}
function normalizeGroupLabel(raw) {
  return (0, _stringNormalizationXm3f27dv.i)(raw);
}
function shortenGroupId(value) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(value) ?? "";
  if (!trimmed) return "";
  if (trimmed.length <= 14) return trimmed;
  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
}
function buildGroupDisplayName(params) {
  const providerKey = (0, _stringCoerceBUSzWgUA.o)(params.provider) ?? "group";
  const groupChannel = (0, _stringCoerceBUSzWgUA.s)(params.groupChannel);
  const space = (0, _stringCoerceBUSzWgUA.s)(params.space);
  const subject = (0, _stringCoerceBUSzWgUA.s)(params.subject);
  const detail = (groupChannel && space ? `${space}${groupChannel.startsWith("#") ? "" : "#"}${groupChannel}` : groupChannel || subject || space || "") || "";
  const fallbackId = (0, _stringCoerceBUSzWgUA.s)(params.id) ?? params.key;
  const rawLabel = detail || fallbackId;
  let token = normalizeGroupLabel(rawLabel);
  if (!token) token = normalizeGroupLabel(shortenGroupId(rawLabel));
  if (!params.groupChannel && token.startsWith("#")) token = token.replace(/^#+/, "");
  if (token && !/^[@#]/.test(token) && !token.startsWith("g-") && !token.includes("#")) token = `g-${token}`;
  return token ? `${providerKey}:${token}` : providerKey;
}
function resolveGroupSessionKey(ctx) {
  const from = (0, _stringCoerceBUSzWgUA.s)(ctx.From) ?? "";
  const chatType = (0, _stringCoerceBUSzWgUA.o)(ctx.ChatType);
  const normalizedChatType = chatType === "channel" ? "channel" : chatType === "group" ? "group" : void 0;
  const implicitGroupSurface = resolveImplicitGroupSurface({
    from,
    normalizedChatType
  });
  const legacyResolution = resolveLegacyGroupSessionKey(ctx);
  if (!(normalizedChatType === "group" || normalizedChatType === "channel" || from.includes(":group:") || from.includes(":channel:") || implicitGroupSurface !== null || legacyResolution !== null)) return null;
  const providerHint = (0, _stringCoerceBUSzWgUA.o)(ctx.Provider);
  const parts = from.split(":").filter(Boolean);
  const head = (0, _stringCoerceBUSzWgUA.i)(parts[0]);
  const headIsSurface = head ? getGroupSurfaces().has(head) : false;
  if (!headIsSurface && !providerHint && legacyResolution) return legacyResolution;
  const provider = headIsSurface ? head : providerHint ?? implicitGroupSurface?.provider ?? legacyResolution?.channel;
  if (!provider) return null;
  const second = (0, _stringCoerceBUSzWgUA.o)(parts[1]);
  const secondIsKind = second === "group" || second === "channel";
  const kind = secondIsKind ? second : from.includes(":channel:") || normalizedChatType === "channel" ? "channel" : implicitGroupSurface?.chatType ?? "group";
  const finalId = (0, _stringCoerceBUSzWgUA.i)(headIsSurface ? secondIsKind ? parts.slice(2).join(":") : parts.slice(1).join(":") : from);
  if (!finalId) return null;
  return {
    key: `${provider}:${kind}:${finalId}`,
    channel: provider,
    id: finalId,
    chatType: kind === "channel" ? "channel" : "group"
  };
}
//#endregion
//#region src/config/sessions/metadata.ts
const mergeOrigin = (existing, next) => {
  if (!existing && !next) return;
  const merged = existing ? { ...existing } : {};
  if (next?.label) merged.label = next.label;
  if (next?.provider) merged.provider = next.provider;
  if (next?.surface) merged.surface = next.surface;
  if (next?.chatType) merged.chatType = next.chatType;
  if (next?.from) merged.from = next.from;
  if (next?.to) merged.to = next.to;
  if (next?.nativeChannelId) merged.nativeChannelId = next.nativeChannelId;
  if (next?.nativeDirectUserId) merged.nativeDirectUserId = next.nativeDirectUserId;
  if (next?.accountId) merged.accountId = next.accountId;
  if (next?.threadId != null && next.threadId !== "") merged.threadId = next.threadId;
  return Object.keys(merged).length > 0 ? merged : void 0;
};
function deriveSessionOrigin(ctx, opts) {
  const isSystemEventProvider = ctx.Provider === "heartbeat" || ctx.Provider === "cron-event" || ctx.Provider === "exec-event";
  if (opts?.skipSystemEventOrigin && isSystemEventProvider) return;
  const label = (0, _stringCoerceBUSzWgUA.s)((0, _conversationLabelCio1HuOl.t)(ctx));
  const provider = (0, _messageChannelCBqCPFa_.u)(typeof ctx.OriginatingChannel === "string" && ctx.OriginatingChannel || ctx.Surface || ctx.Provider);
  const surface = (0, _stringCoerceBUSzWgUA.o)(ctx.Surface);
  const chatType = (0, _chatTypeDFnPOWna.t)(ctx.ChatType) ?? void 0;
  const from = (0, _stringCoerceBUSzWgUA.s)(ctx.From);
  const to = (0, _stringCoerceBUSzWgUA.s)(typeof ctx.OriginatingTo === "string" ? ctx.OriginatingTo : ctx.To);
  const nativeChannelId = (0, _stringCoerceBUSzWgUA.s)(ctx.NativeChannelId);
  const nativeDirectUserId = (0, _stringCoerceBUSzWgUA.s)(ctx.NativeDirectUserId);
  const accountId = (0, _stringCoerceBUSzWgUA.s)(ctx.AccountId);
  const threadId = ctx.MessageThreadId ?? void 0;
  const origin = {};
  if (label) origin.label = label;
  if (provider) origin.provider = provider;
  if (surface) origin.surface = surface;
  if (chatType) origin.chatType = chatType;
  if (from) origin.from = from;
  if (to) origin.to = to;
  if (nativeChannelId) origin.nativeChannelId = nativeChannelId;
  if (nativeDirectUserId) origin.nativeDirectUserId = nativeDirectUserId;
  if (accountId) origin.accountId = accountId;
  if (threadId != null && threadId !== "") origin.threadId = threadId;
  return Object.keys(origin).length > 0 ? origin : void 0;
}
function snapshotSessionOrigin(entry) {
  if (!entry?.origin) return;
  return { ...entry.origin };
}
function deriveGroupSessionPatch(params) {
  const resolution = params.groupResolution ?? resolveGroupSessionKey(params.ctx);
  if (!resolution?.channel) return null;
  const channel = resolution.channel;
  const subject = params.ctx.GroupSubject?.trim();
  const space = params.ctx.GroupSpace?.trim();
  const explicitChannel = params.ctx.GroupChannel?.trim();
  const subjectLooksChannel = Boolean(subject?.startsWith("#"));
  const normalizedChannel = subjectLooksChannel && resolution.chatType !== "channel" ? (0, _registryDelpa74L.i)(channel) : null;
  const isChannelProvider = Boolean(normalizedChannel && (0, _registryDelpa74L.t)(normalizedChannel)?.capabilities.chatTypes.includes("channel"));
  const nextGroupChannel = explicitChannel ?? (subjectLooksChannel && subject && (resolution.chatType === "channel" || isChannelProvider) ? subject : void 0);
  const nextSubject = nextGroupChannel ? void 0 : subject;
  const patch = {
    chatType: resolution.chatType ?? "group",
    channel,
    groupId: resolution.id
  };
  if (nextSubject) patch.subject = nextSubject;
  if (nextGroupChannel) patch.groupChannel = nextGroupChannel;
  if (space) patch.space = space;
  const displayName = buildGroupDisplayName({
    provider: channel,
    subject: nextSubject ?? params.existing?.subject,
    groupChannel: nextGroupChannel ?? params.existing?.groupChannel,
    space: space ?? params.existing?.space,
    id: resolution.id,
    key: params.sessionKey
  });
  if (displayName) patch.displayName = displayName;
  return patch;
}
function deriveSessionMetaPatch(params) {
  const groupPatch = deriveGroupSessionPatch(params);
  const origin = deriveSessionOrigin(params.ctx, { skipSystemEventOrigin: params.skipSystemEventOrigin });
  if (!groupPatch && !origin) return null;
  const patch = groupPatch ? { ...groupPatch } : {};
  const mergedOrigin = mergeOrigin(params.existing?.origin, origin);
  if (mergedOrigin) patch.origin = mergedOrigin;
  return Object.keys(patch).length > 0 ? patch : null;
}
//#endregion
//#region src/config/sessions/disk-budget.ts
const NOOP_LOGGER = {
  warn: () => {},
  info: () => {}
};
function canonicalizePathForComparison(filePath) {
  const resolved = _nodePath.default.resolve(filePath);
  try {
    return _nodeFs.default.realpathSync(resolved);
  } catch {
    return resolved;
  }
}
function measureStoreBytes(store) {
  return Buffer.byteLength(JSON.stringify(store, null, 2), "utf-8");
}
function measureStoreEntryChunkBytes(key, entry) {
  const singleEntryStore = JSON.stringify({ [key]: entry }, null, 2);
  if (!singleEntryStore.startsWith("{\n") || !singleEntryStore.endsWith("\n}")) return measureStoreBytes({ [key]: entry }) - 4;
  const chunk = singleEntryStore.slice(2, -2);
  return Buffer.byteLength(chunk, "utf-8");
}
function buildStoreEntryChunkSizeMap(store) {
  const out = /* @__PURE__ */new Map();
  for (const [key, entry] of Object.entries(store)) out.set(key, measureStoreEntryChunkBytes(key, entry));
  return out;
}
function getEntryUpdatedAt$1(entry) {
  if (!entry) return 0;
  const updatedAt = entry.updatedAt;
  return Number.isFinite(updatedAt) ? updatedAt : 0;
}
function buildSessionIdRefCounts(store) {
  const counts = /* @__PURE__ */new Map();
  for (const entry of Object.values(store)) {
    const sessionId = entry?.sessionId;
    if (!sessionId) continue;
    counts.set(sessionId, (counts.get(sessionId) ?? 0) + 1);
  }
  return counts;
}
function resolveSessionTranscriptPathForEntry(params) {
  if (!params.entry.sessionId) return null;
  try {
    const resolved = (0, _pathsCZMxg3hs.i)(params.entry.sessionId, params.entry, { sessionsDir: params.sessionsDir });
    const resolvedSessionsDir = canonicalizePathForComparison(params.sessionsDir);
    const resolvedPath = canonicalizePathForComparison(resolved);
    const relative = _nodePath.default.relative(resolvedSessionsDir, resolvedPath);
    if (!relative || relative.startsWith("..") || _nodePath.default.isAbsolute(relative)) return null;
    return resolvedPath;
  } catch {
    return null;
  }
}
function resolveReferencedSessionTranscriptPaths(params) {
  const referenced = /* @__PURE__ */new Set();
  for (const entry of Object.values(params.store)) {
    const resolved = resolveSessionTranscriptPathForEntry({
      sessionsDir: params.sessionsDir,
      entry
    });
    if (resolved) referenced.add(canonicalizePathForComparison(resolved));
  }
  return referenced;
}
async function readSessionsDirFiles(sessionsDir) {
  const dirEntries = await _nodeFs.default.promises.readdir(sessionsDir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const dirent of dirEntries) {
    if (!dirent.isFile()) continue;
    const filePath = _nodePath.default.join(sessionsDir, dirent.name);
    const stat = await _nodeFs.default.promises.stat(filePath).catch(() => null);
    if (!stat?.isFile()) continue;
    files.push({
      path: filePath,
      canonicalPath: canonicalizePathForComparison(filePath),
      name: dirent.name,
      size: stat.size,
      mtimeMs: stat.mtimeMs
    });
  }
  return files;
}
async function removeFileIfExists(filePath) {
  const stat = await _nodeFs.default.promises.stat(filePath).catch(() => null);
  if (!stat?.isFile()) return 0;
  await _nodeFs.default.promises.rm(filePath, { force: true }).catch(() => void 0);
  return stat.size;
}
async function removeFileForBudget(params) {
  const resolvedPath = _nodePath.default.resolve(params.filePath);
  const canonicalPath = params.canonicalPath ?? canonicalizePathForComparison(resolvedPath);
  if (params.dryRun) {
    if (params.simulatedRemovedPaths.has(canonicalPath)) return 0;
    const size = params.fileSizesByPath.get(canonicalPath) ?? 0;
    if (size <= 0) return 0;
    params.simulatedRemovedPaths.add(canonicalPath);
    return size;
  }
  return removeFileIfExists(resolvedPath);
}
async function enforceSessionDiskBudget(params) {
  const maxBytes = params.maintenance.maxDiskBytes;
  const highWaterBytes = params.maintenance.highWaterBytes;
  if (maxBytes == null || highWaterBytes == null) return null;
  const log = params.log ?? NOOP_LOGGER;
  const dryRun = params.dryRun === true;
  const sessionsDir = _nodePath.default.dirname(params.storePath);
  const files = await readSessionsDirFiles(sessionsDir);
  const fileSizesByPath = new Map(files.map((file) => [file.canonicalPath, file.size]));
  const simulatedRemovedPaths = /* @__PURE__ */new Set();
  const resolvedStorePath = canonicalizePathForComparison(params.storePath);
  const storeFile = files.find((file) => file.canonicalPath === resolvedStorePath);
  let projectedStoreBytes = measureStoreBytes(params.store);
  let total = files.reduce((sum, file) => sum + file.size, 0) - (storeFile?.size ?? 0) + projectedStoreBytes;
  const totalBefore = total;
  if (total <= maxBytes) return {
    totalBytesBefore: totalBefore,
    totalBytesAfter: total,
    removedFiles: 0,
    removedEntries: 0,
    freedBytes: 0,
    maxBytes,
    highWaterBytes,
    overBudget: false
  };
  if (params.warnOnly) {
    log.warn("session disk budget exceeded (warn-only mode)", {
      sessionsDir,
      totalBytes: total,
      maxBytes,
      highWaterBytes
    });
    return {
      totalBytesBefore: totalBefore,
      totalBytesAfter: total,
      removedFiles: 0,
      removedEntries: 0,
      freedBytes: 0,
      maxBytes,
      highWaterBytes,
      overBudget: true
    };
  }
  let removedFiles = 0;
  let removedEntries = 0;
  let freedBytes = 0;
  const referencedPaths = resolveReferencedSessionTranscriptPaths({
    sessionsDir,
    store: params.store
  });
  const removableFileQueue = files.filter((file) => (0, _artifactsSZgUWHP.r)(file.name) || (0, _artifactsSZgUWHP.n)(file.name) && !referencedPaths.has(file.canonicalPath)).toSorted((a, b) => a.mtimeMs - b.mtimeMs);
  for (const file of removableFileQueue) {
    if (total <= highWaterBytes) break;
    const deletedBytes = await removeFileForBudget({
      filePath: file.path,
      canonicalPath: file.canonicalPath,
      dryRun,
      fileSizesByPath,
      simulatedRemovedPaths
    });
    if (deletedBytes <= 0) continue;
    total -= deletedBytes;
    freedBytes += deletedBytes;
    removedFiles += 1;
  }
  if (total > highWaterBytes) {
    const activeSessionKey = (0, _stringCoerceBUSzWgUA.o)(params.activeSessionKey);
    const sessionIdRefCounts = buildSessionIdRefCounts(params.store);
    const entryChunkBytesByKey = buildStoreEntryChunkSizeMap(params.store);
    const keys = Object.keys(params.store).toSorted((a, b) => {
      return getEntryUpdatedAt$1(params.store[a]) - getEntryUpdatedAt$1(params.store[b]);
    });
    for (const key of keys) {
      if (total <= highWaterBytes) break;
      if (activeSessionKey && (0, _stringCoerceBUSzWgUA.i)(key) === activeSessionKey) continue;
      const entry = params.store[key];
      if (!entry) continue;
      const previousProjectedBytes = projectedStoreBytes;
      delete params.store[key];
      const chunkBytes = entryChunkBytesByKey.get(key);
      entryChunkBytesByKey.delete(key);
      if (typeof chunkBytes === "number" && Number.isFinite(chunkBytes) && chunkBytes >= 0) projectedStoreBytes = Math.max(2, projectedStoreBytes - (chunkBytes + 2));else
      projectedStoreBytes = measureStoreBytes(params.store);
      total += projectedStoreBytes - previousProjectedBytes;
      removedEntries += 1;
      const sessionId = entry.sessionId;
      if (!sessionId) continue;
      const nextRefCount = (sessionIdRefCounts.get(sessionId) ?? 1) - 1;
      if (nextRefCount > 0) {
        sessionIdRefCounts.set(sessionId, nextRefCount);
        continue;
      }
      sessionIdRefCounts.delete(sessionId);
      const transcriptPath = resolveSessionTranscriptPathForEntry({
        sessionsDir,
        entry
      });
      if (!transcriptPath) continue;
      const deletedBytes = await removeFileForBudget({
        filePath: transcriptPath,
        dryRun,
        fileSizesByPath,
        simulatedRemovedPaths
      });
      if (deletedBytes <= 0) continue;
      total -= deletedBytes;
      freedBytes += deletedBytes;
      removedFiles += 1;
    }
  }
  if (!dryRun) {
    if (total > highWaterBytes) log.warn("session disk budget still above high-water target after cleanup", {
      sessionsDir,
      totalBytes: total,
      maxBytes,
      highWaterBytes,
      removedFiles,
      removedEntries
    });else
    if (removedFiles > 0 || removedEntries > 0) log.info("applied session disk budget cleanup", {
      sessionsDir,
      totalBytesBefore: totalBefore,
      totalBytesAfter: total,
      maxBytes,
      highWaterBytes,
      removedFiles,
      removedEntries
    });
  }
  return {
    totalBytesBefore: totalBefore,
    totalBytesAfter: total,
    removedFiles,
    removedEntries,
    freedBytes,
    maxBytes,
    highWaterBytes,
    overBudget: true
  };
}
//#endregion
//#region src/config/sessions/store-maintenance.ts
const log$1 = (0, _subsystemCgmckbux.t)("sessions/store");
const DEFAULT_SESSION_PRUNE_AFTER_MS = 720 * 60 * 60 * 1e3;
const DEFAULT_SESSION_MAX_ENTRIES = 500;
const DEFAULT_SESSION_ROTATE_BYTES = 10485760;
const DEFAULT_SESSION_MAINTENANCE_MODE = "warn";
const DEFAULT_SESSION_DISK_BUDGET_HIGH_WATER_RATIO = .8;
function resolvePruneAfterMs(maintenance) {
  const normalized = (0, _stringCoerceBUSzWgUA.u)(maintenance?.pruneAfter ?? maintenance?.pruneDays);
  if (!normalized) return DEFAULT_SESSION_PRUNE_AFTER_MS;
  try {
    return (0, _parseDurationDHL2gXIv.t)(normalized, { defaultUnit: "d" });
  } catch {
    return DEFAULT_SESSION_PRUNE_AFTER_MS;
  }
}
function resolveRotateBytes(maintenance) {
  const raw = maintenance?.rotateBytes;
  const normalized = (0, _stringCoerceBUSzWgUA.u)(raw);
  if (!normalized) return DEFAULT_SESSION_ROTATE_BYTES;
  try {
    return (0, _zodSchemaBO9ySEsE.r)(normalized, { defaultUnit: "b" });
  } catch {
    return DEFAULT_SESSION_ROTATE_BYTES;
  }
}
function resolveResetArchiveRetentionMs(maintenance, pruneAfterMs) {
  const raw = maintenance?.resetArchiveRetention;
  if (raw === false) return null;
  const normalized = (0, _stringCoerceBUSzWgUA.u)(raw);
  if (!normalized) return pruneAfterMs;
  try {
    return (0, _parseDurationDHL2gXIv.t)(normalized, { defaultUnit: "d" });
  } catch {
    return pruneAfterMs;
  }
}
function resolveMaxDiskBytes(maintenance) {
  const raw = maintenance?.maxDiskBytes;
  const normalized = (0, _stringCoerceBUSzWgUA.u)(raw);
  if (!normalized) return null;
  try {
    return (0, _zodSchemaBO9ySEsE.r)(normalized, { defaultUnit: "b" });
  } catch {
    return null;
  }
}
function resolveHighWaterBytes(maintenance, maxDiskBytes) {
  const computeDefault = () => {
    if (maxDiskBytes == null) return null;
    if (maxDiskBytes <= 0) return 0;
    return Math.max(1, Math.min(maxDiskBytes, Math.floor(maxDiskBytes * DEFAULT_SESSION_DISK_BUDGET_HIGH_WATER_RATIO)));
  };
  if (maxDiskBytes == null) return null;
  const raw = maintenance?.highWaterBytes;
  const normalized = (0, _stringCoerceBUSzWgUA.u)(raw);
  if (!normalized) return computeDefault();
  try {
    const parsed = (0, _zodSchemaBO9ySEsE.r)(normalized, { defaultUnit: "b" });
    return Math.min(parsed, maxDiskBytes);
  } catch {
    return computeDefault();
  }
}
/**
* Resolve maintenance settings from openclaw.json (`session.maintenance`).
* Falls back to built-in defaults when config is missing or unset.
*/
function resolveMaintenanceConfigFromInput(maintenance) {
  const pruneAfterMs = resolvePruneAfterMs(maintenance);
  const maxDiskBytes = resolveMaxDiskBytes(maintenance);
  return {
    mode: maintenance?.mode ?? DEFAULT_SESSION_MAINTENANCE_MODE,
    pruneAfterMs,
    maxEntries: maintenance?.maxEntries ?? DEFAULT_SESSION_MAX_ENTRIES,
    rotateBytes: resolveRotateBytes(maintenance),
    resetArchiveRetentionMs: resolveResetArchiveRetentionMs(maintenance, pruneAfterMs),
    maxDiskBytes,
    highWaterBytes: resolveHighWaterBytes(maintenance, maxDiskBytes)
  };
}
function resolveMaintenanceConfig() {
  let maintenance;
  try {
    maintenance = (0, _io5pxHCi7V.a)().session?.maintenance;
  } catch {}
  return resolveMaintenanceConfigFromInput(maintenance);
}
/**
* Remove entries whose `updatedAt` is older than the configured threshold.
* Entries without `updatedAt` are kept (cannot determine staleness).
* Mutates `store` in-place.
*/
function pruneStaleEntries(store, overrideMaxAgeMs, opts = {}) {
  const maxAgeMs = overrideMaxAgeMs ?? resolveMaintenanceConfig().pruneAfterMs;
  const cutoffMs = Date.now() - maxAgeMs;
  let pruned = 0;
  for (const [key, entry] of Object.entries(store)) if (entry?.updatedAt != null && entry.updatedAt < cutoffMs) {
    opts.onPruned?.({
      key,
      entry
    });
    delete store[key];
    pruned++;
  }
  if (pruned > 0 && opts.log !== false) log$1.info("pruned stale session entries", {
    pruned,
    maxAgeMs
  });
  return pruned;
}
function getEntryUpdatedAt(entry) {
  return entry?.updatedAt ?? Number.NEGATIVE_INFINITY;
}
function getActiveSessionMaintenanceWarning(params) {
  const activeSessionKey = params.activeSessionKey.trim();
  if (!activeSessionKey) return null;
  const activeEntry = params.store[activeSessionKey];
  if (!activeEntry) return null;
  const cutoffMs = (params.nowMs ?? Date.now()) - params.pruneAfterMs;
  const wouldPrune = activeEntry.updatedAt != null ? activeEntry.updatedAt < cutoffMs : false;
  const keys = Object.keys(params.store);
  const wouldCap = keys.length > params.maxEntries && keys.toSorted((a, b) => getEntryUpdatedAt(params.store[b]) - getEntryUpdatedAt(params.store[a])).slice(params.maxEntries).includes(activeSessionKey);
  if (!wouldPrune && !wouldCap) return null;
  return {
    activeSessionKey,
    activeUpdatedAt: activeEntry.updatedAt,
    totalEntries: keys.length,
    pruneAfterMs: params.pruneAfterMs,
    maxEntries: params.maxEntries,
    wouldPrune,
    wouldCap
  };
}
/**
* Cap the store to the N most recently updated entries.
* Entries without `updatedAt` are sorted last (removed first when over limit).
* Mutates `store` in-place.
*/
function capEntryCount(store, overrideMax, opts = {}) {
  const maxEntries = overrideMax ?? resolveMaintenanceConfig().maxEntries;
  const keys = Object.keys(store);
  if (keys.length <= maxEntries) return 0;
  const toRemove = keys.toSorted((a, b) => {
    const aTime = getEntryUpdatedAt(store[a]);
    return getEntryUpdatedAt(store[b]) - aTime;
  }).slice(maxEntries);
  for (const key of toRemove) {
    const entry = store[key];
    if (entry) opts.onCapped?.({
      key,
      entry
    });
    delete store[key];
  }
  if (opts.log !== false) log$1.info("capped session entry count", {
    removed: toRemove.length,
    maxEntries
  });
  return toRemove.length;
}
async function getSessionFileSize(storePath) {
  try {
    return (await _nodeFs.default.promises.stat(storePath)).size;
  } catch {
    return null;
  }
}
/**
* Rotate the sessions file if it exceeds the configured size threshold.
* Renames the current file to `sessions.json.bak.{timestamp}` and cleans up
* old rotation backups, keeping only the 3 most recent `.bak.*` files.
*/
async function rotateSessionFile(storePath, overrideBytes) {
  const maxBytes = overrideBytes ?? resolveMaintenanceConfig().rotateBytes;
  const fileSize = await getSessionFileSize(storePath);
  if (fileSize == null) return false;
  if (fileSize <= maxBytes) return false;
  const backupPath = `${storePath}.bak.${Date.now()}`;
  try {
    await _nodeFs.default.promises.rename(storePath, backupPath);
    log$1.info("rotated session store file", {
      backupPath: _nodePath.default.basename(backupPath),
      sizeBytes: fileSize
    });
  } catch {
    return false;
  }
  try {
    const dir = _nodePath.default.dirname(storePath);
    const baseName = _nodePath.default.basename(storePath);
    const backups = (await _nodeFs.default.promises.readdir(dir)).filter((f) => f.startsWith(`${baseName}.bak.`)).toSorted().toReversed();
    const maxBackups = 3;
    if (backups.length > maxBackups) {
      const toDelete = backups.slice(maxBackups);
      for (const old of toDelete) await _nodeFs.default.promises.unlink(_nodePath.default.join(dir, old)).catch(() => void 0);
      log$1.info("cleaned up old session store backups", { deleted: toDelete.length });
    }
  } catch {}
  return true;
}
//#endregion
//#region src/config/sessions/store.ts
const log = (0, _subsystemCgmckbux.t)("sessions/store");
let sessionArchiveRuntimePromise = null;
let sessionWriteLockAcquirerForTests = null;
function loadSessionArchiveRuntime() {
  sessionArchiveRuntimePromise ??= Promise.resolve().then(() => jitiImport("./session-archive.runtime-BckiZHtD.js").then((m) => _interopRequireWildcard(m)));
  return sessionArchiveRuntimePromise;
}
function removeThreadFromDeliveryContext(context) {
  if (!context || context.threadId == null) return context;
  const next = { ...context };
  delete next.threadId;
  return next;
}
function normalizeStoreSessionKey(sessionKey) {
  return (0, _stringCoerceBUSzWgUA.i)(sessionKey);
}
function resolveSessionStoreEntry(params) {
  const trimmedKey = params.sessionKey.trim();
  const normalizedKey = normalizeStoreSessionKey(trimmedKey);
  const legacyKeySet = /* @__PURE__ */new Set();
  if (trimmedKey !== normalizedKey && Object.prototype.hasOwnProperty.call(params.store, trimmedKey)) legacyKeySet.add(trimmedKey);
  let existing = params.store[normalizedKey] ?? (legacyKeySet.size > 0 ? params.store[trimmedKey] : void 0);
  let existingUpdatedAt = existing?.updatedAt ?? 0;
  for (const [candidateKey, candidateEntry] of Object.entries(params.store)) {
    if (candidateKey === normalizedKey) continue;
    if (normalizeStoreSessionKey(candidateKey) !== normalizedKey) continue;
    legacyKeySet.add(candidateKey);
    const candidateUpdatedAt = candidateEntry?.updatedAt ?? 0;
    if (!existing || candidateUpdatedAt > existingUpdatedAt) {
      existing = candidateEntry;
      existingUpdatedAt = candidateUpdatedAt;
    }
  }
  return {
    normalizedKey,
    existing,
    legacyKeys: [...legacyKeySet]
  };
}
function readSessionUpdatedAt(params) {
  try {
    return resolveSessionStoreEntry({
      store: (0, _storeLoadDjLNEIy.t)(params.storePath),
      sessionKey: params.sessionKey
    }).existing?.updatedAt;
  } catch {
    return;
  }
}
function updateSessionStoreWriteCaches(params) {
  const fileStat = (0, _storeCacheC6102ouP.l)(params.storePath);
  (0, _storeCacheC6102ouP.o)(params.storePath, params.serialized);
  if (!(0, _storeCacheC6102ouP.i)()) {
    (0, _storeCacheC6102ouP.n)(params.storePath);
    return;
  }
  (0, _storeCacheC6102ouP.s)({
    storePath: params.storePath,
    store: params.store,
    mtimeMs: fileStat?.mtimeMs,
    sizeBytes: fileStat?.sizeBytes,
    serialized: params.serialized
  });
}
function resolveMutableSessionStoreKey(store, sessionKey) {
  const trimmed = sessionKey.trim();
  if (!trimmed) return;
  if (Object.prototype.hasOwnProperty.call(store, trimmed)) return trimmed;
  const normalized = normalizeStoreSessionKey(trimmed);
  if (Object.prototype.hasOwnProperty.call(store, normalized)) return normalized;
  return Object.keys(store).find((key) => normalizeStoreSessionKey(key) === normalized);
}
function collectAcpMetadataSnapshot(store) {
  const snapshot = /* @__PURE__ */new Map();
  for (const [sessionKey, entry] of Object.entries(store)) if (entry?.acp) snapshot.set(sessionKey, entry.acp);
  return snapshot;
}
function preserveExistingAcpMetadata(params) {
  const allowDrop = new Set((params.allowDropSessionKeys ?? []).map((key) => normalizeStoreSessionKey(key)));
  for (const [previousKey, previousAcp] of params.previousAcpByKey.entries()) {
    const normalizedKey = normalizeStoreSessionKey(previousKey);
    if (allowDrop.has(normalizedKey)) continue;
    const nextKey = resolveMutableSessionStoreKey(params.nextStore, previousKey);
    if (!nextKey) continue;
    const nextEntry = params.nextStore[nextKey];
    if (!nextEntry || nextEntry.acp) continue;
    params.nextStore[nextKey] = {
      ...nextEntry,
      acp: previousAcp
    };
  }
}
async function saveSessionStoreUnlocked(storePath, store, opts) {
  (0, _storeLoadDjLNEIy.n)(store);
  if (!opts?.skipMaintenance) {
    const maintenance = opts?.maintenanceConfig ? {
      ...opts.maintenanceConfig,
      ...opts?.maintenanceOverride
    } : {
      ...resolveMaintenanceConfig(),
      ...opts?.maintenanceOverride
    };
    const shouldWarnOnly = maintenance.mode === "warn";
    const beforeCount = Object.keys(store).length;
    if (shouldWarnOnly) {
      const activeSessionKey = opts?.activeSessionKey?.trim();
      if (activeSessionKey) {
        const warning = getActiveSessionMaintenanceWarning({
          store,
          activeSessionKey,
          pruneAfterMs: maintenance.pruneAfterMs,
          maxEntries: maintenance.maxEntries
        });
        if (warning) {
          log.warn("session maintenance would evict active session; skipping enforcement", {
            activeSessionKey: warning.activeSessionKey,
            wouldPrune: warning.wouldPrune,
            wouldCap: warning.wouldCap,
            pruneAfterMs: warning.pruneAfterMs,
            maxEntries: warning.maxEntries
          });
          await opts?.onWarn?.(warning);
        }
      }
      const diskBudget = await enforceSessionDiskBudget({
        store,
        storePath,
        activeSessionKey: opts?.activeSessionKey,
        maintenance,
        warnOnly: true,
        log
      });
      await opts?.onMaintenanceApplied?.({
        mode: maintenance.mode,
        beforeCount,
        afterCount: Object.keys(store).length,
        pruned: 0,
        capped: 0,
        diskBudget
      });
    } else {
      const removedSessionFiles = /* @__PURE__ */new Map();
      const pruned = pruneStaleEntries(store, maintenance.pruneAfterMs, { onPruned: ({ entry }) => {
          rememberRemovedSessionFile(removedSessionFiles, entry);
        } });
      const capped = capEntryCount(store, maintenance.maxEntries, { onCapped: ({ entry }) => {
          rememberRemovedSessionFile(removedSessionFiles, entry);
        } });
      const archivedDirs = /* @__PURE__ */new Set();
      const archivedForDeletedSessions = await archiveRemovedSessionTranscripts({
        removedSessionFiles,
        referencedSessionIds: new Set(Object.values(store).map((entry) => entry?.sessionId).filter((id) => Boolean(id))),
        storePath,
        reason: "deleted",
        restrictToStoreDir: true
      });
      for (const archivedDir of archivedForDeletedSessions) archivedDirs.add(archivedDir);
      if (archivedDirs.size > 0 || maintenance.resetArchiveRetentionMs != null) {
        const { cleanupArchivedSessionTranscripts } = await loadSessionArchiveRuntime();
        const targetDirs = archivedDirs.size > 0 ? [...archivedDirs] : [_nodePath.default.dirname(_nodePath.default.resolve(storePath))];
        await cleanupArchivedSessionTranscripts({
          directories: targetDirs,
          olderThanMs: maintenance.pruneAfterMs,
          reason: "deleted"
        });
        if (maintenance.resetArchiveRetentionMs != null) await cleanupArchivedSessionTranscripts({
          directories: targetDirs,
          olderThanMs: maintenance.resetArchiveRetentionMs,
          reason: "reset"
        });
      }
      await rotateSessionFile(storePath, maintenance.rotateBytes);
      const diskBudget = await enforceSessionDiskBudget({
        store,
        storePath,
        activeSessionKey: opts?.activeSessionKey,
        maintenance,
        warnOnly: false,
        log
      });
      await opts?.onMaintenanceApplied?.({
        mode: maintenance.mode,
        beforeCount,
        afterCount: Object.keys(store).length,
        pruned,
        capped,
        diskBudget
      });
    }
  }
  await _nodeFs.default.promises.mkdir(_nodePath.default.dirname(storePath), { recursive: true });
  const json = JSON.stringify(store, null, 2);
  if ((0, _storeCacheC6102ouP.r)(storePath) === json) {
    updateSessionStoreWriteCaches({
      storePath,
      store,
      serialized: json
    });
    return;
  }
  if (process.platform === "win32") {
    for (let i = 0; i < 5; i++) try {
      await writeSessionStoreAtomic({
        storePath,
        store,
        serialized: json
      });
      return;
    } catch (err) {
      if (getErrorCode(err) === "ENOENT") return;
      if (i < 4) {
        await new Promise((r) => setTimeout(r, 50 * (i + 1)));
        continue;
      }
      log.warn(`atomic write failed after 5 attempts: ${storePath}`);
    }
    return;
  }
  try {
    await writeSessionStoreAtomic({
      storePath,
      store,
      serialized: json
    });
  } catch (err) {
    if (getErrorCode(err) === "ENOENT") {
      try {
        await writeSessionStoreAtomic({
          storePath,
          store,
          serialized: json
        });
      } catch (err2) {
        if (getErrorCode(err2) === "ENOENT") return;
        throw err2;
      }
      return;
    }
    throw err;
  }
}
async function saveSessionStore(storePath, store, opts) {
  await withSessionStoreLock(storePath, async () => {
    await saveSessionStoreUnlocked(storePath, store, opts);
  });
}
async function updateSessionStore(storePath, mutator, opts) {
  return await withSessionStoreLock(storePath, async () => {
    const store = (0, _storeLoadDjLNEIy.t)(storePath, { skipCache: true });
    const previousAcpByKey = collectAcpMetadataSnapshot(store);
    const result = await mutator(store);
    preserveExistingAcpMetadata({
      previousAcpByKey,
      nextStore: store,
      allowDropSessionKeys: opts?.allowDropAcpMetaSessionKeys
    });
    await saveSessionStoreUnlocked(storePath, store, opts);
    return result;
  });
}
const SESSION_STORE_LOCK_MIN_HOLD_MS = 5e3;
const SESSION_STORE_LOCK_TIMEOUT_GRACE_MS = 5e3;
function getErrorCode(error) {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  return String(error.code);
}
function rememberRemovedSessionFile(removedSessionFiles, entry) {
  if (!removedSessionFiles.has(entry.sessionId) || entry.sessionFile) removedSessionFiles.set(entry.sessionId, entry.sessionFile);
}
async function archiveRemovedSessionTranscripts(params) {
  const { archiveSessionTranscripts } = await loadSessionArchiveRuntime();
  const archivedDirs = /* @__PURE__ */new Set();
  for (const [sessionId, sessionFile] of params.removedSessionFiles) {
    if (params.referencedSessionIds.has(sessionId)) continue;
    const archived = archiveSessionTranscripts({
      sessionId,
      storePath: params.storePath,
      sessionFile,
      reason: params.reason,
      restrictToStoreDir: params.restrictToStoreDir
    });
    for (const archivedPath of archived) archivedDirs.add(_nodePath.default.dirname(archivedPath));
  }
  return archivedDirs;
}
async function writeSessionStoreAtomic(params) {
  await (0, _jsonFilesL0zR3LSb.i)(params.storePath, params.serialized, { mode: 384 });
  updateSessionStoreWriteCaches({
    storePath: params.storePath,
    store: params.store,
    serialized: params.serialized
  });
}
async function persistResolvedSessionEntry(params) {
  params.store[params.resolved.normalizedKey] = params.next;
  for (const legacyKey of params.resolved.legacyKeys) delete params.store[legacyKey];
  await saveSessionStoreUnlocked(params.storePath, params.store, { activeSessionKey: params.resolved.normalizedKey });
  return params.next;
}
function lockTimeoutError(storePath) {
  return /* @__PURE__ */new Error(`timeout waiting for session store lock: ${storePath}`);
}
function resolveSessionStoreLockMaxHoldMs(timeoutMs) {
  if (timeoutMs == null || !Number.isFinite(timeoutMs) || timeoutMs <= 0) return;
  return (0, _sessionWriteLockCcI4KSH.i)({
    timeoutMs,
    graceMs: SESSION_STORE_LOCK_TIMEOUT_GRACE_MS,
    minMs: SESSION_STORE_LOCK_MIN_HOLD_MS
  });
}
function getOrCreateLockQueue(storePath) {
  const existing = _storeLockStateCuGBI9_.t.get(storePath);
  if (existing) return existing;
  const created = {
    running: false,
    pending: [],
    drainPromise: null
  };
  _storeLockStateCuGBI9_.t.set(storePath, created);
  return created;
}
async function drainSessionStoreLockQueue(storePath) {
  const queue = _storeLockStateCuGBI9_.t.get(storePath);
  if (!queue) return;
  if (queue.drainPromise) {
    await queue.drainPromise;
    return;
  }
  queue.running = true;
  queue.drainPromise = (async () => {
    try {
      while (queue.pending.length > 0) {
        const task = queue.pending.shift();
        if (!task) continue;
        const remainingTimeoutMs = task.timeoutMs ?? Number.POSITIVE_INFINITY;
        if (task.timeoutMs != null && remainingTimeoutMs <= 0) {
          task.reject(lockTimeoutError(storePath));
          continue;
        }
        let lock;
        let result;
        let failed;
        let hasFailure = false;
        try {
          lock = await (sessionWriteLockAcquirerForTests ?? _sessionWriteLockCcI4KSH.t)({
            sessionFile: storePath,
            timeoutMs: remainingTimeoutMs,
            staleMs: task.staleMs,
            maxHoldMs: resolveSessionStoreLockMaxHoldMs(task.timeoutMs)
          });
          result = await task.fn();
        } catch (err) {
          hasFailure = true;
          failed = err;
        } finally {
          await lock?.release().catch(() => void 0);
        }
        if (hasFailure) {
          task.reject(failed);
          continue;
        }
        task.resolve(result);
      }
    } finally {
      queue.running = false;
      queue.drainPromise = null;
      if (queue.pending.length === 0) _storeLockStateCuGBI9_.t.delete(storePath);else
      queueMicrotask(() => {
        drainSessionStoreLockQueue(storePath);
      });
    }
  })();
  await queue.drainPromise;
}
async function withSessionStoreLock(storePath, fn, opts = {}) {
  if (!storePath || typeof storePath !== "string") throw new Error(`withSessionStoreLock: storePath must be a non-empty string, got ${JSON.stringify(storePath)}`);
  const timeoutMs = opts.timeoutMs ?? 1e4;
  const staleMs = opts.staleMs ?? 3e4;
  opts.pollIntervalMs;
  const hasTimeout = timeoutMs > 0 && Number.isFinite(timeoutMs);
  const queue = getOrCreateLockQueue(storePath);
  return await new Promise((resolve, reject) => {
    const task = {
      fn: async () => await fn(),
      resolve: (value) => resolve(value),
      reject,
      timeoutMs: hasTimeout ? timeoutMs : void 0,
      staleMs
    };
    queue.pending.push(task);
    drainSessionStoreLockQueue(storePath);
  });
}
async function updateSessionStoreEntry(params) {
  const { storePath, sessionKey, update } = params;
  return await withSessionStoreLock(storePath, async () => {
    const store = (0, _storeLoadDjLNEIy.t)(storePath, { skipCache: true });
    const resolved = resolveSessionStoreEntry({
      store,
      sessionKey
    });
    const existing = resolved.existing;
    if (!existing) return null;
    const patch = await update(existing);
    if (!patch) return existing;
    return await persistResolvedSessionEntry({
      storePath,
      store,
      resolved,
      next: (0, _typesKCfeTvaK.n)(existing, patch)
    });
  });
}
async function recordSessionMetaFromInbound(params) {
  const { storePath, sessionKey, ctx } = params;
  const createIfMissing = params.createIfMissing ?? true;
  return await updateSessionStore(storePath, (store) => {
    const resolved = resolveSessionStoreEntry({
      store,
      sessionKey
    });
    const existing = resolved.existing;
    const patch = deriveSessionMetaPatch({
      ctx,
      sessionKey: resolved.normalizedKey,
      existing,
      groupResolution: params.groupResolution
    });
    if (!patch) {
      if (existing && resolved.legacyKeys.length > 0) {
        store[resolved.normalizedKey] = existing;
        for (const legacyKey of resolved.legacyKeys) delete store[legacyKey];
      }
      return existing ?? null;
    }
    if (!existing && !createIfMissing) return null;
    const next = existing ? (0, _typesKCfeTvaK.r)(existing, patch) : (0, _typesKCfeTvaK.n)(existing, patch);
    store[resolved.normalizedKey] = next;
    for (const legacyKey of resolved.legacyKeys) delete store[legacyKey];
    return next;
  }, { activeSessionKey: normalizeStoreSessionKey(sessionKey) });
}
async function updateLastRoute(params) {
  const { storePath, sessionKey, channel, to, accountId, threadId, ctx } = params;
  return await withSessionStoreLock(storePath, async () => {
    const store = (0, _storeLoadDjLNEIy.t)(storePath);
    const resolved = resolveSessionStoreEntry({
      store,
      sessionKey
    });
    const existing = resolved.existing;
    const now = Date.now();
    const explicitContext = (0, _deliveryContextSharedEClQPjt.i)(params.deliveryContext);
    const inlineContext = (0, _deliveryContextSharedEClQPjt.i)({
      channel,
      to,
      accountId,
      threadId
    });
    const mergedInput = (0, _deliveryContextSharedEClQPjt.r)(explicitContext, inlineContext);
    const explicitDeliveryContext = params.deliveryContext;
    const explicitThreadValue = (explicitDeliveryContext != null && Object.prototype.hasOwnProperty.call(explicitDeliveryContext, "threadId") ? explicitDeliveryContext.threadId : void 0) ?? (threadId != null && threadId !== "" ? threadId : void 0);
    const merged = (0, _deliveryContextSharedEClQPjt.r)(mergedInput, Boolean(explicitContext?.channel || explicitContext?.to || inlineContext?.channel || inlineContext?.to) && explicitThreadValue == null ? removeThreadFromDeliveryContext((0, _deliveryContextSharedEClQPjt.t)(existing)) : (0, _deliveryContextSharedEClQPjt.t)(existing));
    const normalized = (0, _deliveryContextSharedEClQPjt.a)({ deliveryContext: {
        channel: merged?.channel,
        to: merged?.to,
        accountId: merged?.accountId,
        threadId: merged?.threadId
      } });
    const metaPatch = ctx ? deriveSessionMetaPatch({
      ctx,
      sessionKey: resolved.normalizedKey,
      existing,
      groupResolution: params.groupResolution
    }) : null;
    const basePatch = {
      updatedAt: Math.max(existing?.updatedAt ?? 0, now),
      deliveryContext: normalized.deliveryContext,
      lastChannel: normalized.lastChannel,
      lastTo: normalized.lastTo,
      lastAccountId: normalized.lastAccountId,
      lastThreadId: normalized.lastThreadId
    };
    return await persistResolvedSessionEntry({
      storePath,
      store,
      resolved,
      next: (0, _typesKCfeTvaK.n)(existing, metaPatch ? {
        ...basePatch,
        ...metaPatch
      } : basePatch)
    });
  });
}
//#endregion /* v9-2be3f694c07c9201 */
