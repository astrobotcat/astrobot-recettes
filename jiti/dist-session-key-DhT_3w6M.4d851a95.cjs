"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveSessionKey;exports.t = deriveSessionKey;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
require("./plugins-D4ODSIPT.js");
var _storeDFXcceZJ = require("./store-DFXcceZJ.js");
//#region src/config/sessions/explicit-session-key-normalization.ts
function resolveExplicitSessionKeyNormalizerCandidates(sessionKey, ctx) {
  const normalizedProvider = (0, _stringCoerceBUSzWgUA.o)(ctx.Provider);
  const normalizedSurface = (0, _stringCoerceBUSzWgUA.o)(ctx.Surface);
  const normalizedFrom = (0, _stringCoerceBUSzWgUA.i)(ctx.From);
  const candidates = /* @__PURE__ */new Set();
  const maybeAdd = (value) => {
    const normalized = (0, _messageChannelCBqCPFa_.u)(value);
    if (normalized) candidates.add(normalized);
  };
  maybeAdd(normalizedSurface);
  maybeAdd(normalizedProvider);
  maybeAdd(normalizedFrom.split(":", 1)[0]);
  for (const plugin of (0, _registryDelpa74L.r)()) {
    const pluginId = (0, _messageChannelCBqCPFa_.u)(plugin.id);
    if (!pluginId) continue;
    if (sessionKey.startsWith(`${pluginId}:`) || sessionKey.includes(`:${pluginId}:`)) candidates.add(pluginId);
  }
  return [...candidates];
}
function normalizeExplicitSessionKey(sessionKey, ctx) {
  const normalized = (0, _stringCoerceBUSzWgUA.i)(sessionKey);
  for (const channelId of resolveExplicitSessionKeyNormalizerCandidates(normalized, ctx)) {
    const normalize = (0, _registryDelpa74L.t)(channelId)?.messaging?.normalizeExplicitSessionKey;
    const next = normalize?.({
      sessionKey: normalized,
      ctx
    });
    if (typeof next === "string" && next.trim()) return (0, _stringCoerceBUSzWgUA.i)(next);
  }
  return normalized;
}
//#endregion
//#region src/config/sessions/session-key.ts
function deriveSessionKey(scope, ctx) {
  if (scope === "global") return "global";
  const resolvedGroup = (0, _storeDFXcceZJ.S)(ctx);
  if (resolvedGroup) return resolvedGroup.key;
  return (ctx.From ? (0, _utilsD5DtWkEu.u)(ctx.From) : "") || "unknown";
}
/**
* Resolve the session key with a canonical direct-chat bucket (default: "main").
* All non-group direct chats collapse to this bucket; groups stay isolated.
*/
function resolveSessionKey(scope, ctx, mainKey) {
  const explicit = ctx.SessionKey?.trim();
  if (explicit) return normalizeExplicitSessionKey(explicit, ctx);
  const raw = deriveSessionKey(scope, ctx);
  if (scope === "global") return raw;
  const canonical = (0, _sessionKeyBh1lMwK.r)({
    agentId: _sessionKeyBh1lMwK.t,
    mainKey: (0, _sessionKeyBh1lMwK.l)(mainKey)
  });
  if (!(raw.includes(":group:") || raw.includes(":channel:"))) return canonical;
  return `agent:${_sessionKeyBh1lMwK.t}:${raw}`;
}
//#endregion /* v9-f4f66c9b3dd5de4f */
