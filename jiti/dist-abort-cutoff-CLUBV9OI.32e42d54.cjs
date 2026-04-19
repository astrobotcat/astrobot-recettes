"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = shouldPersistAbortCutoff;exports.i = resolveAbortCutoffFromContext;exports.n = hasAbortCutoff;exports.o = shouldSkipMessageByAbortCutoff;exports.r = readAbortCutoffFromSessionEntry;exports.t = applyAbortCutoffToSessionEntry;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/auto-reply/reply/abort-cutoff.ts
function resolveAbortCutoffFromContext(ctx) {
  const messageSid = (0, _stringCoerceBUSzWgUA.s)(ctx.MessageSidFull) ?? (0, _stringCoerceBUSzWgUA.s)(ctx.MessageSid);
  const timestamp = typeof ctx.Timestamp === "number" && Number.isFinite(ctx.Timestamp) ? ctx.Timestamp : void 0;
  if (!messageSid && timestamp === void 0) return;
  return {
    messageSid,
    timestamp
  };
}
function readAbortCutoffFromSessionEntry(entry) {
  if (!entry) return;
  const messageSid = (0, _stringCoerceBUSzWgUA.s)(entry.abortCutoffMessageSid);
  const timestamp = typeof entry.abortCutoffTimestamp === "number" && Number.isFinite(entry.abortCutoffTimestamp) ? entry.abortCutoffTimestamp : void 0;
  if (!messageSid && timestamp === void 0) return;
  return {
    messageSid,
    timestamp
  };
}
function hasAbortCutoff(entry) {
  return readAbortCutoffFromSessionEntry(entry) !== void 0;
}
function applyAbortCutoffToSessionEntry(entry, cutoff) {
  entry.abortCutoffMessageSid = cutoff?.messageSid;
  entry.abortCutoffTimestamp = cutoff?.timestamp;
}
function toNumericMessageSid(value) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(value);
  if (!trimmed || !/^\d+$/.test(trimmed)) return;
  try {
    return BigInt(trimmed);
  } catch {
    return;
  }
}
function shouldSkipMessageByAbortCutoff(params) {
  const cutoffSid = (0, _stringCoerceBUSzWgUA.s)(params.cutoffMessageSid);
  const currentSid = (0, _stringCoerceBUSzWgUA.s)(params.messageSid);
  if (cutoffSid && currentSid) {
    const cutoffNumeric = toNumericMessageSid(cutoffSid);
    const currentNumeric = toNumericMessageSid(currentSid);
    if (cutoffNumeric !== void 0 && currentNumeric !== void 0) return currentNumeric <= cutoffNumeric;
    if (currentSid === cutoffSid) return true;
  }
  if (typeof params.cutoffTimestamp === "number" && Number.isFinite(params.cutoffTimestamp) && typeof params.timestamp === "number" && Number.isFinite(params.timestamp)) return params.timestamp <= params.cutoffTimestamp;
  return false;
}
function shouldPersistAbortCutoff(params) {
  const commandSessionKey = (0, _stringCoerceBUSzWgUA.s)(params.commandSessionKey);
  const targetSessionKey = (0, _stringCoerceBUSzWgUA.s)(params.targetSessionKey);
  if (!commandSessionKey || !targetSessionKey) return true;
  return commandSessionKey === targetSessionKey;
}
//#endregion /* v9-7802187aaebc5063 */
