"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = normalizeElevatedLevel;exports.c = normalizeThinkLevel;exports.d = normalizeVerboseLevel;exports.f = resolveResponseUsageMode;exports.i = listThinkingLevels;exports.l = normalizeTraceLevel;exports.n = formatXHighModelHint;exports.o = normalizeFastMode;exports.p = resolveThinkingDefaultForModel;exports.r = listThinkingLevelLabels;exports.s = normalizeReasoningLevel;exports.t = formatThinkingLevels;exports.u = normalizeUsageDisplay;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/auto-reply/thinking.shared.ts
const NO_THINKING_LEVELS = [...[
"off",
"minimal",
"low",
"medium",
"high",
"adaptive"]];

function isBinaryThinkingProvider(provider) {
  return false;
}
function normalizeThinkLevel(raw) {
  const key = (0, _stringCoerceBUSzWgUA.o)(raw);
  if (!key) return;
  const collapsed = key.replace(/[\s_-]+/g, "");
  if (collapsed === "adaptive" || collapsed === "auto") return "adaptive";
  if (collapsed === "xhigh" || collapsed === "extrahigh") return "xhigh";
  if (["off"].includes(key)) return "off";
  if ([
  "on",
  "enable",
  "enabled"].
  includes(key)) return "low";
  if (["min", "minimal"].includes(key)) return "minimal";
  if ([
  "low",
  "thinkhard",
  "think-hard",
  "think_hard"].
  includes(key)) return "low";
  if ([
  "mid",
  "med",
  "medium",
  "thinkharder",
  "think-harder",
  "harder"].
  includes(key)) return "medium";
  if ([
  "high",
  "ultra",
  "ultrathink",
  "think-hard",
  "thinkhardest",
  "highest",
  "max"].
  includes(key)) return "high";
  if (["think"].includes(key)) return "minimal";
}
function listThinkingLevels(_provider, _model) {
  return [...NO_THINKING_LEVELS];
}
function listThinkingLevelLabels(provider, model) {
  if (isBinaryThinkingProvider(provider)) return ["off", "on"];
  return listThinkingLevels(provider, model);
}
function formatThinkingLevels(provider, model, separator = ", ") {
  return listThinkingLevelLabels(provider, model).join(separator);
}
function formatXHighModelHint() {
  return "provider models that advertise xhigh reasoning";
}
function resolveThinkingDefaultForModel(params) {
  if (params.catalog?.find((entry) => entry.provider === params.provider && entry.id === params.model)?.reasoning) return "low";
  return "off";
}
function normalizeOnOffFullLevel(raw) {
  const key = (0, _stringCoerceBUSzWgUA.o)(raw);
  if (!key) return;
  if ([
  "off",
  "false",
  "no",
  "0"].
  includes(key)) return "off";
  if ([
  "full",
  "all",
  "everything"].
  includes(key)) return "full";
  if ([
  "on",
  "minimal",
  "true",
  "yes",
  "1"].
  includes(key)) return "on";
}
function normalizeVerboseLevel(raw) {
  return normalizeOnOffFullLevel(raw);
}
function normalizeTraceLevel(raw) {
  const key = (0, _stringCoerceBUSzWgUA.o)(raw);
  if (!key) return;
  if ([
  "off",
  "false",
  "no",
  "0"].
  includes(key)) return "off";
  if ([
  "on",
  "true",
  "yes",
  "1"].
  includes(key)) return "on";
  if (["raw", "unfiltered"].includes(key)) return "raw";
}
function normalizeUsageDisplay(raw) {
  if (!raw) return;
  const key = (0, _stringCoerceBUSzWgUA.i)(raw);
  if ([
  "off",
  "false",
  "no",
  "0",
  "disable",
  "disabled"].
  includes(key)) return "off";
  if ([
  "on",
  "true",
  "yes",
  "1",
  "enable",
  "enabled"].
  includes(key)) return "tokens";
  if ([
  "tokens",
  "token",
  "tok",
  "minimal",
  "min"].
  includes(key)) return "tokens";
  if (["full", "session"].includes(key)) return "full";
}
function resolveResponseUsageMode(raw) {
  return normalizeUsageDisplay(raw) ?? "off";
}
function normalizeFastMode(raw) {
  if (typeof raw === "boolean") return raw;
  if (!raw) return;
  const key = (0, _stringCoerceBUSzWgUA.i)(raw);
  if ([
  "off",
  "false",
  "no",
  "0",
  "disable",
  "disabled",
  "normal"].
  includes(key)) return false;
  if ([
  "on",
  "true",
  "yes",
  "1",
  "enable",
  "enabled",
  "fast"].
  includes(key)) return true;
}
function normalizeElevatedLevel(raw) {
  if (!raw) return;
  const key = (0, _stringCoerceBUSzWgUA.i)(raw);
  if ([
  "off",
  "false",
  "no",
  "0"].
  includes(key)) return "off";
  if ([
  "full",
  "auto",
  "auto-approve",
  "autoapprove"].
  includes(key)) return "full";
  if ([
  "ask",
  "prompt",
  "approval",
  "approve"].
  includes(key)) return "ask";
  if ([
  "on",
  "true",
  "yes",
  "1"].
  includes(key)) return "on";
}
function normalizeReasoningLevel(raw) {
  if (!raw) return;
  const key = (0, _stringCoerceBUSzWgUA.i)(raw);
  if ([
  "off",
  "false",
  "no",
  "0",
  "hide",
  "hidden",
  "disable",
  "disabled"].
  includes(key)) return "off";
  if ([
  "on",
  "true",
  "yes",
  "1",
  "show",
  "visible",
  "enable",
  "enabled"].
  includes(key)) return "on";
  if ([
  "stream",
  "streaming",
  "draft",
  "live"].
  includes(key)) return "stream";
}
//#endregion /* v9-b51ea25c59e99b69 */
