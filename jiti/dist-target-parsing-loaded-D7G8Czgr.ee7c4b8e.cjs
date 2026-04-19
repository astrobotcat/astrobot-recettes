"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = parseExplicitTargetForLoadedChannel;exports.r = resolveComparableTargetForLoadedChannel;exports.t = comparableChannelTargetsShareRoute;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _registryLoadedReadB9a4LkEi = require("./registry-loaded-read-B9a4LkEi.js");
//#region src/channels/plugins/target-parsing-loaded.ts
function parseExplicitTargetForLoadedChannel(channel, rawTarget) {
  const resolvedChannel = (0, _stringCoerceBUSzWgUA.s)(channel);
  if (!resolvedChannel) return null;
  return (0, _registryLoadedReadB9a4LkEi.t)(resolvedChannel)?.messaging?.parseExplicitTarget?.({ raw: rawTarget }) ?? null;
}
function resolveComparableTargetForLoadedChannel(params) {
  const rawTo = (0, _stringCoerceBUSzWgUA.s)(params.rawTarget);
  if (!rawTo) return null;
  const parsed = parseExplicitTargetForLoadedChannel(params.channel, rawTo);
  const fallbackThreadId = (0, _stringCoerceBUSzWgUA.l)(params.fallbackThreadId);
  return {
    rawTo,
    to: parsed?.to ?? rawTo,
    threadId: (0, _stringCoerceBUSzWgUA.l)(parsed?.threadId ?? fallbackThreadId),
    chatType: parsed?.chatType
  };
}
function comparableChannelTargetsShareRoute(params) {
  const left = params.left;
  const right = params.right;
  if (!left || !right) return false;
  if (left.to !== right.to) return false;
  if (left.threadId == null || right.threadId == null) return true;
  return left.threadId === right.threadId;
}
//#endregion /* v9-a9c380d1601eae00 */
