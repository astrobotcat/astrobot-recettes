"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveBlockStreamingChunking;exports.r = resolveEffectiveBlockStreamingConfig;exports.t = clampPositiveInteger;var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
require("./plugins-D4ODSIPT.js");
var _accountLookupZCs8AOJr = require("./account-lookup-ZCs8AOJr.js");
var _channelStreamingDxZqCxKM = require("./channel-streaming-DxZqCxKM.js");
var _chunkC8HOq7ak = require("./chunk-C8HOq7ak.js");
//#region src/auto-reply/reply/block-streaming.ts
const DEFAULT_BLOCK_STREAM_MIN = 800;
const DEFAULT_BLOCK_STREAM_MAX = 1200;
const DEFAULT_BLOCK_STREAM_COALESCE_IDLE_MS = 1e3;
function resolveProviderChunkContext(cfg, provider, accountId) {
  const providerKey = provider ? (0, _messageChannelCBqCPFa_.u)(provider) : void 0;
  const providerId = providerKey ? (0, _registryDelpa74L.i)(providerKey) : null;
  return {
    providerKey,
    providerId,
    textLimit: (0, _chunkC8HOq7ak.c)(cfg, providerKey, accountId, { fallbackLimit: providerId ? (0, _registryDelpa74L.t)(providerId)?.outbound?.textChunkLimit : void 0 })
  };
}
function resolveProviderBlockStreamingCoalesce(params) {
  const { cfg, providerKey, accountId } = params;
  if (!cfg || !providerKey) return;
  const providerCfg = cfg[providerKey];
  if (!providerCfg || typeof providerCfg !== "object") return;
  const normalizedAccountId = (0, _accountIdJ7GeQlaZ.n)(accountId);
  const typed = providerCfg;
  const accountCfg = (0, _accountLookupZCs8AOJr.t)(typed.accounts, normalizedAccountId);
  return (0, _channelStreamingDxZqCxKM.r)(accountCfg) ?? (0, _channelStreamingDxZqCxKM.r)(typed) ?? accountCfg?.blockStreamingCoalesce ?? typed.blockStreamingCoalesce;
}
function clampPositiveInteger(value, fallback, bounds) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const rounded = Math.round(value);
  if (rounded < bounds.min) return bounds.min;
  if (rounded > bounds.max) return bounds.max;
  return rounded;
}
function resolveEffectiveBlockStreamingConfig(params) {
  const { textLimit } = resolveProviderChunkContext(params.cfg, params.provider, params.accountId);
  const chunkingDefaults = params.chunking ?? resolveBlockStreamingChunking(params.cfg, params.provider, params.accountId);
  const chunkingMax = clampPositiveInteger(params.maxChunkChars, chunkingDefaults.maxChars, {
    min: 1,
    max: Math.max(1, textLimit)
  });
  const chunking = {
    ...chunkingDefaults,
    minChars: Math.min(chunkingDefaults.minChars, chunkingMax),
    maxChars: chunkingMax
  };
  const coalescingDefaults = resolveBlockStreamingCoalescing(params.cfg, params.provider, params.accountId, chunking);
  const coalescingMax = Math.max(1, Math.min(coalescingDefaults?.maxChars ?? chunking.maxChars, chunking.maxChars));
  return {
    chunking,
    coalescing: {
      minChars: Math.min(coalescingDefaults?.minChars ?? chunking.minChars, coalescingMax),
      maxChars: coalescingMax,
      idleMs: clampPositiveInteger(params.coalesceIdleMs, coalescingDefaults?.idleMs ?? DEFAULT_BLOCK_STREAM_COALESCE_IDLE_MS, {
        min: 0,
        max: 5e3
      }),
      joiner: coalescingDefaults?.joiner ?? (chunking.breakPreference === "sentence" ? " " : chunking.breakPreference === "newline" ? "\n" : "\n\n"),
      ...(coalescingDefaults?.flushOnEnqueue === true ? { flushOnEnqueue: true } : {})
    }
  };
}
function resolveBlockStreamingChunking(cfg, provider, accountId) {
  const { providerKey, textLimit } = resolveProviderChunkContext(cfg, provider, accountId);
  const chunkCfg = cfg?.agents?.defaults?.blockStreamingChunk;
  const chunkMode = (0, _chunkC8HOq7ak.s)(cfg, providerKey, accountId);
  const maxRequested = Math.max(1, Math.floor(chunkCfg?.maxChars ?? DEFAULT_BLOCK_STREAM_MAX));
  const maxChars = Math.max(1, Math.min(maxRequested, textLimit));
  const minFallback = DEFAULT_BLOCK_STREAM_MIN;
  const minRequested = Math.max(1, Math.floor(chunkCfg?.minChars ?? minFallback));
  return {
    minChars: Math.min(minRequested, maxChars),
    maxChars,
    breakPreference: chunkCfg?.breakPreference === "newline" || chunkCfg?.breakPreference === "sentence" ? chunkCfg.breakPreference : "paragraph",
    flushOnParagraph: chunkMode === "newline"
  };
}
function resolveBlockStreamingCoalescing(cfg, provider, accountId, chunking) {
  const { providerKey, providerId, textLimit } = resolveProviderChunkContext(cfg, provider, accountId);
  const providerDefaults = providerId ? (0, _registryDelpa74L.t)(providerId)?.streaming?.blockStreamingCoalesceDefaults : void 0;
  const coalesceCfg = resolveProviderBlockStreamingCoalesce({
    cfg,
    providerKey,
    accountId
  }) ?? cfg?.agents?.defaults?.blockStreamingCoalesce;
  const minRequested = Math.max(1, Math.floor(coalesceCfg?.minChars ?? providerDefaults?.minChars ?? chunking?.minChars ?? DEFAULT_BLOCK_STREAM_MIN));
  const maxRequested = Math.max(1, Math.floor(coalesceCfg?.maxChars ?? textLimit));
  const maxChars = Math.max(1, Math.min(maxRequested, textLimit));
  const minChars = Math.min(minRequested, maxChars);
  const idleMs = Math.max(0, Math.floor(coalesceCfg?.idleMs ?? providerDefaults?.idleMs ?? DEFAULT_BLOCK_STREAM_COALESCE_IDLE_MS));
  const preference = chunking?.breakPreference ?? "paragraph";
  return {
    minChars,
    maxChars,
    idleMs,
    joiner: preference === "sentence" ? " " : preference === "newline" ? "\n" : "\n\n"
  };
}
//#endregion /* v9-1a349cd64e9679fb */
