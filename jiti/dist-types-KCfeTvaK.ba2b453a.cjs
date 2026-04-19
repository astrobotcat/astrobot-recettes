"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = normalizeSessionRuntimeModelFields;exports.c = resolveSessionPluginTraceLines;exports.i = mergeSessionEntryWithPolicy;exports.l = setSessionRuntimeModel;exports.n = mergeSessionEntry;exports.o = resolveFreshSessionTotalTokens;exports.r = mergeSessionEntryPreserveActivity;exports.s = resolveSessionPluginStatusLines;exports.t = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/config/sessions/types.ts
function isSessionPluginTraceLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("🔎 ") || /(?:^|\s)(?:Debug|Trace):/.test(trimmed);
}
function resolveSessionPluginStatusLines(entry) {
  return Array.isArray(entry?.pluginDebugEntries) ? entry.pluginDebugEntries.flatMap((pluginEntry) => Array.isArray(pluginEntry?.lines) ? pluginEntry.lines.filter((line) => typeof line === "string" && line.trim().length > 0 && !isSessionPluginTraceLine(line)) : []) : [];
}
function resolveSessionPluginTraceLines(entry) {
  return Array.isArray(entry?.pluginDebugEntries) ? entry.pluginDebugEntries.flatMap((pluginEntry) => Array.isArray(pluginEntry?.lines) ? pluginEntry.lines.filter((line) => typeof line === "string" && line.trim().length > 0 && isSessionPluginTraceLine(line)) : []) : [];
}
function normalizeSessionRuntimeModelFields(entry) {
  const normalizedModel = (0, _stringCoerceBUSzWgUA.s)(entry.model);
  const normalizedProvider = (0, _stringCoerceBUSzWgUA.s)(entry.modelProvider);
  let next = entry;
  if (!normalizedModel) {
    if (entry.model !== void 0 || entry.modelProvider !== void 0) {
      next = { ...next };
      delete next.model;
      delete next.modelProvider;
    }
    return next;
  }
  if (entry.model !== normalizedModel) {
    if (next === entry) next = { ...next };
    next.model = normalizedModel;
  }
  if (!normalizedProvider) {
    if (entry.modelProvider !== void 0) {
      if (next === entry) next = { ...next };
      delete next.modelProvider;
    }
    return next;
  }
  if (entry.modelProvider !== normalizedProvider) {
    if (next === entry) next = { ...next };
    next.modelProvider = normalizedProvider;
  }
  return next;
}
function setSessionRuntimeModel(entry, runtime) {
  const provider = runtime.provider.trim();
  const model = runtime.model.trim();
  if (!provider || !model) return false;
  entry.modelProvider = provider;
  entry.model = model;
  return true;
}
function resolveMergedUpdatedAt(existing, patch, options) {
  if (options?.policy === "preserve-activity" && existing) return existing.updatedAt ?? patch.updatedAt ?? options.now ?? Date.now();
  return Math.max(existing?.updatedAt ?? 0, patch.updatedAt ?? 0, options?.now ?? Date.now());
}
function mergeSessionEntryWithPolicy(existing, patch, options) {
  const sessionId = patch.sessionId ?? existing?.sessionId ?? _nodeCrypto.default.randomUUID();
  const updatedAt = resolveMergedUpdatedAt(existing, patch, options);
  if (!existing) return normalizeSessionRuntimeModelFields({
    ...patch,
    sessionId,
    updatedAt
  });
  const next = {
    ...existing,
    ...patch,
    sessionId,
    updatedAt
  };
  if (Object.hasOwn(patch, "model") && !Object.hasOwn(patch, "modelProvider")) {
    const patchedModel = (0, _stringCoerceBUSzWgUA.s)(patch.model);
    const existingModel = (0, _stringCoerceBUSzWgUA.s)(existing.model);
    if (patchedModel && patchedModel !== existingModel) delete next.modelProvider;
  }
  return normalizeSessionRuntimeModelFields(next);
}
function mergeSessionEntry(existing, patch) {
  return mergeSessionEntryWithPolicy(existing, patch);
}
function mergeSessionEntryPreserveActivity(existing, patch) {
  return mergeSessionEntryWithPolicy(existing, patch, { policy: "preserve-activity" });
}
function resolveFreshSessionTotalTokens(entry) {
  const total = entry?.totalTokens;
  if (typeof total !== "number" || !Number.isFinite(total) || total < 0) return;
  if (entry?.totalTokensFresh === false) return;
  return total;
}
const DEFAULT_RESET_TRIGGERS = exports.t = ["/new", "/reset"];
//#endregion /* v9-903ed40b6452ce7b */
