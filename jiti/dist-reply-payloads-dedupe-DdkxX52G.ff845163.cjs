"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = filterMessagingToolMediaDuplicates;exports.r = shouldSuppressMessagingToolReplies;exports.t = filterMessagingToolDuplicates;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
var _registryCENZffQG = require("./registry-CENZffQG.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
require("./plugins-D4ODSIPT.js");
var _piEmbeddedHelpers6UMMUO8y = require("./pi-embedded-helpers-6UMMUO8y.js");
var _targetNormalizationJ5fHpTkf = require("./target-normalization-j5fHpTkf.js");
//#region src/auto-reply/reply/reply-payloads-dedupe.ts
function filterMessagingToolDuplicates(params) {
  const { payloads, sentTexts } = params;
  if (sentTexts.length === 0) return payloads;
  return payloads.filter((payload) => !(0, _piEmbeddedHelpers6UMMUO8y.i)(payload.text ?? "", sentTexts));
}
function filterMessagingToolMediaDuplicates(params) {
  const normalizeMediaForDedupe = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (!(0, _stringCoerceBUSzWgUA.i)(trimmed).startsWith("file://")) return trimmed;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "file:") return decodeURIComponent(parsed.pathname || "");
    } catch {}
    return trimmed.replace(/^file:\/\//i, "");
  };
  const { payloads, sentMediaUrls } = params;
  if (sentMediaUrls.length === 0) return payloads;
  const sentSet = new Set(sentMediaUrls.map(normalizeMediaForDedupe).filter(Boolean));
  return payloads.map((payload) => {
    const mediaUrl = payload.mediaUrl;
    const mediaUrls = payload.mediaUrls;
    const stripSingle = mediaUrl && sentSet.has(normalizeMediaForDedupe(mediaUrl));
    const filteredUrls = mediaUrls?.filter((u) => !sentSet.has(normalizeMediaForDedupe(u)));
    if (!stripSingle && (!mediaUrls || filteredUrls?.length === mediaUrls.length)) return payload;
    return {
      ...payload,
      mediaUrl: stripSingle ? void 0 : mediaUrl,
      mediaUrls: filteredUrls?.length ? filteredUrls : void 0
    };
  });
}
function normalizeProviderForComparison(value) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(value);
  if (!trimmed) return;
  const lowered = (0, _stringCoerceBUSzWgUA.i)(trimmed);
  const normalizedChannel = (0, _registryCENZffQG.a)(trimmed);
  if (normalizedChannel) return normalizedChannel;
  return lowered;
}
function normalizeThreadIdForComparison(value) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(value);
  if (!trimmed) return;
  if (/^-?\d+$/.test(trimmed)) return String(Number.parseInt(trimmed, 10));
  return (0, _stringCoerceBUSzWgUA.i)(trimmed);
}
function resolveTargetProviderForComparison(params) {
  const targetProvider = normalizeProviderForComparison(params.targetProvider);
  if (!targetProvider || targetProvider === "message") return params.currentProvider;
  return targetProvider;
}
function targetsMatchForSuppression(params) {
  const pluginMatch = (0, _registryDelpa74L.t)(params.provider)?.outbound?.targetsMatchForReplySuppression;
  if (pluginMatch) return pluginMatch({
    originTarget: params.originTarget,
    targetKey: params.targetKey,
    targetThreadId: normalizeThreadIdForComparison(params.targetThreadId)
  });
  return params.targetKey === params.originTarget;
}
function shouldSuppressMessagingToolReplies(params) {
  const provider = normalizeProviderForComparison(params.messageProvider);
  if (!provider) return false;
  const originRawTarget = (0, _stringCoerceBUSzWgUA.s)(params.originatingTo);
  const originAccount = (0, _accountIdJ7GeQlaZ.r)(params.accountId);
  const sentTargets = params.messagingToolSentTargets ?? [];
  if (sentTargets.length === 0) return false;
  return sentTargets.some((target) => {
    const targetProvider = resolveTargetProviderForComparison({
      currentProvider: provider,
      targetProvider: target?.provider
    });
    if (targetProvider !== provider) return false;
    const targetAccount = (0, _accountIdJ7GeQlaZ.r)(target.accountId);
    if (originAccount && targetAccount && originAccount !== targetAccount) return false;
    const targetRaw = (0, _stringCoerceBUSzWgUA.s)(target.to);
    if (originRawTarget && targetRaw === originRawTarget && !target.threadId) return true;
    const originTarget = (0, _targetNormalizationJ5fHpTkf.a)(provider, originRawTarget);
    if (!originTarget) return false;
    const targetKey = (0, _targetNormalizationJ5fHpTkf.a)(targetProvider, targetRaw);
    if (!targetKey) return false;
    return targetsMatchForSuppression({
      provider,
      originTarget,
      targetKey,
      targetThreadId: target.threadId
    });
  });
}
//#endregion /* v9-4e7b3fa6ad1a161b */
