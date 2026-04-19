"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveSessionThreadInfo;exports.n = resolveSessionConversationRef;exports.r = resolveSessionParentSessionKey;exports.t = resolveSessionConversation;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _registryCENZffQG = require("./registry-CENZffQG.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
var _runtimeSnapshotBwqEmc6G = require("./runtime-snapshot-BwqEmc6G.js");
var _runtimeBB1a2aCy = require("./runtime-BB1a2aCy.js");
var _facadeRuntimeGSGchfr = require("./facade-runtime-gSGchfr7.js");
//#region src/channels/plugins/session-conversation.ts
const SESSION_KEY_API_ARTIFACT_BASENAME = "session-key-api.js";
const bundledSessionConversationFallbackCache = /* @__PURE__ */new Map();
function normalizeResolvedChannel(channel) {
  return (0, _registryDelpa74L.i)(channel) ?? (0, _registryCENZffQG.o)(channel) ?? (0, _stringCoerceBUSzWgUA.o)(channel) ?? "";
}
function getMessagingAdapter(channel) {
  const normalizedChannel = normalizeResolvedChannel(channel);
  try {
    return (0, _registryDelpa74L.n)(normalizedChannel)?.messaging;
  } catch {
    return;
  }
}
function dedupeConversationIds(values) {
  const seen = /* @__PURE__ */new Set();
  const resolved = [];
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    resolved.push(trimmed);
  }
  return resolved;
}
function buildGenericConversationResolution(rawId) {
  const trimmed = rawId.trim();
  if (!trimmed) return null;
  const parsed = (0, _sessionKeyBh1lMwK.C)(trimmed);
  const id = (parsed.baseSessionKey ?? trimmed).trim();
  if (!id) return null;
  return {
    id,
    threadId: parsed.threadId,
    baseConversationId: id,
    parentConversationCandidates: dedupeConversationIds(parsed.threadId ? [parsed.baseSessionKey] : [])
  };
}
function normalizeSessionConversationResolution(resolved) {
  if (!resolved?.id?.trim()) return null;
  return {
    id: resolved.id.trim(),
    threadId: (0, _stringCoerceBUSzWgUA.s)(resolved.threadId),
    baseConversationId: (0, _stringCoerceBUSzWgUA.s)(resolved.baseConversationId) ?? dedupeConversationIds(resolved.parentConversationCandidates ?? []).at(-1) ?? resolved.id.trim(),
    parentConversationCandidates: dedupeConversationIds(resolved.parentConversationCandidates ?? []),
    hasExplicitParentConversationCandidates: Object.hasOwn(resolved, "parentConversationCandidates")
  };
}
function resolveBundledSessionConversationFallback(params) {
  if (isBundledSessionConversationFallbackDisabled(params.channel)) return null;
  const dirName = normalizeResolvedChannel(params.channel);
  const version = (0, _runtimeBB1a2aCy.n)();
  let cached = bundledSessionConversationFallbackCache.get(dirName);
  if (!cached || cached.version !== version) {
    let resolveSessionConversation = null;
    try {
      const loaded = (0, _facadeRuntimeGSGchfr.r)({
        dirName,
        artifactBasename: SESSION_KEY_API_ARTIFACT_BASENAME
      });
      resolveSessionConversation = typeof loaded?.resolveSessionConversation === "function" ? loaded.resolveSessionConversation : null;
    } catch {
      resolveSessionConversation = null;
    }
    cached = {
      version,
      resolveSessionConversation
    };
    bundledSessionConversationFallbackCache.set(dirName, cached);
  }
  if (typeof cached.resolveSessionConversation !== "function") return null;
  return normalizeSessionConversationResolution(cached.resolveSessionConversation({
    kind: params.kind,
    rawId: params.rawId
  }));
}
function isBundledSessionConversationFallbackDisabled(channel) {
  const snapshot = (0, _runtimeSnapshotBwqEmc6G.r)();
  if (!snapshot?.plugins) return false;
  if (snapshot.plugins.enabled === false) return true;
  const entry = snapshot.plugins.entries?.[normalizeResolvedChannel(channel)];
  return !!entry && typeof entry === "object" && entry.enabled === false;
}
function shouldProbeBundledSessionConversationFallback(rawId) {
  return rawId.includes(":");
}
function resolveSessionConversationResolution(params) {
  const rawId = params.rawId.trim();
  if (!rawId) return null;
  const messaging = getMessagingAdapter(params.channel);
  const pluginResolved = normalizeSessionConversationResolution(messaging?.resolveSessionConversation?.({
    kind: params.kind,
    rawId
  }));
  const shouldTryBundledFallback = params.bundledFallback !== false && !messaging && shouldProbeBundledSessionConversationFallback(rawId);
  const resolved = pluginResolved ?? (shouldTryBundledFallback ? resolveBundledSessionConversationFallback({
    channel: params.channel,
    kind: params.kind,
    rawId
  }) : null) ?? buildGenericConversationResolution(rawId);
  if (!resolved) return null;
  const parentConversationCandidates = dedupeConversationIds(pluginResolved?.hasExplicitParentConversationCandidates ? resolved.parentConversationCandidates : messaging?.resolveParentConversationCandidates?.({
    kind: params.kind,
    rawId
  }) ?? resolved.parentConversationCandidates);
  const baseConversationId = parentConversationCandidates.at(-1) ?? resolved.baseConversationId ?? resolved.id;
  return {
    ...resolved,
    baseConversationId,
    parentConversationCandidates
  };
}
function resolveSessionConversation(params) {
  return resolveSessionConversationResolution(params);
}
function buildBaseSessionKey(raw, id) {
  return `${raw.prefix}:${id}`;
}
function resolveSessionConversationRef(sessionKey, opts = {}) {
  const raw = (0, _sessionKeyBh1lMwK.S)(sessionKey);
  if (!raw) return null;
  const resolved = resolveSessionConversation({
    ...raw,
    bundledFallback: opts.bundledFallback
  });
  if (!resolved) return null;
  return {
    channel: normalizeResolvedChannel(raw.channel),
    kind: raw.kind,
    rawId: raw.rawId,
    id: resolved.id,
    threadId: resolved.threadId,
    baseSessionKey: buildBaseSessionKey(raw, resolved.id),
    baseConversationId: resolved.baseConversationId,
    parentConversationCandidates: resolved.parentConversationCandidates
  };
}
function resolveSessionThreadInfo(sessionKey, opts = {}) {
  const resolved = resolveSessionConversationRef(sessionKey, opts);
  if (!resolved) return (0, _sessionKeyBh1lMwK.C)(sessionKey);
  return {
    baseSessionKey: resolved.threadId ? resolved.baseSessionKey : (0, _stringCoerceBUSzWgUA.s)(sessionKey),
    threadId: resolved.threadId
  };
}
function resolveSessionParentSessionKey(sessionKey) {
  const { baseSessionKey, threadId } = resolveSessionThreadInfo(sessionKey);
  if (!threadId) return null;
  return baseSessionKey ?? null;
}
//#endregion /* v9-abfae3672aeb7185 */
