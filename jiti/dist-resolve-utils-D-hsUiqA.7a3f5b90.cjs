"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = patchAllowlistUsersInConfigEntries;exports.i = mergeAllowlist;exports.n = buildAllowlistResolutionSummary;exports.o = summarizeMapping;exports.r = canonicalizeAllowlistWithResolvedIds;exports.t = addAllowlistUserEntriesFromConfigEntry;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _channelConfigHelpers9F9ZxFrZ = require("./channel-config-helpers-9F9ZxFrZ.js");
var _stringSampleBSLrcV_ = require("./string-sample-BSLrcV_0.js");
//#region src/channels/allowlists/resolve-utils.ts
function dedupeAllowlistEntries(entries) {
  const seen = /* @__PURE__ */new Set();
  const deduped = [];
  for (const entry of entries) {
    const normalized = entry.trim();
    if (!normalized) continue;
    const key = (0, _stringCoerceBUSzWgUA.i)(normalized);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(normalized);
  }
  return deduped;
}
function mergeAllowlist(params) {
  return dedupeAllowlistEntries([...(0, _channelConfigHelpers9F9ZxFrZ.h)(params.existing), ...params.additions]);
}
function buildAllowlistResolutionSummary(resolvedUsers, opts) {
  const resolvedMap = new Map(resolvedUsers.map((entry) => [entry.input, entry]));
  const resolvedOk = (entry) => Boolean(entry.resolved && entry.id);
  const formatResolved = opts?.formatResolved ?? ((entry) => `${entry.input}→${entry.id}`);
  const formatUnresolved = opts?.formatUnresolved ?? ((entry) => entry.input);
  const mapping = resolvedUsers.filter(resolvedOk).map(formatResolved);
  const additions = resolvedUsers.filter(resolvedOk).map((entry) => entry.id).filter((entry) => Boolean(entry));
  return {
    resolvedMap,
    mapping,
    unresolved: resolvedUsers.filter((entry) => !resolvedOk(entry)).map(formatUnresolved),
    additions
  };
}
function resolveAllowlistIdAdditions(params) {
  const additions = [];
  for (const entry of params.existing) {
    const trimmed = (0, _stringCoerceBUSzWgUA.s)(entry) ?? "";
    const resolved = params.resolvedMap.get(trimmed);
    if (resolved?.resolved && resolved.id) additions.push(resolved.id);
  }
  return additions;
}
function canonicalizeAllowlistWithResolvedIds(params) {
  const canonicalized = [];
  for (const entry of params.existing ?? []) {
    const trimmed = (0, _stringCoerceBUSzWgUA.s)(entry) ?? "";
    if (!trimmed) continue;
    if (trimmed === "*") {
      canonicalized.push(trimmed);
      continue;
    }
    const resolved = params.resolvedMap.get(trimmed);
    canonicalized.push(resolved?.resolved && resolved.id ? resolved.id : trimmed);
  }
  return dedupeAllowlistEntries(canonicalized);
}
function patchAllowlistUsersInConfigEntries(params) {
  const nextEntries = { ...params.entries };
  for (const [entryKey, entryConfig] of Object.entries(params.entries)) {
    if (!entryConfig || typeof entryConfig !== "object") continue;
    const users = entryConfig.users;
    if (!Array.isArray(users) || users.length === 0) continue;
    const resolvedUsers = params.strategy === "canonicalize" ? canonicalizeAllowlistWithResolvedIds({
      existing: users,
      resolvedMap: params.resolvedMap
    }) : mergeAllowlist({
      existing: users,
      additions: resolveAllowlistIdAdditions({
        existing: users,
        resolvedMap: params.resolvedMap
      })
    });
    nextEntries[entryKey] = {
      ...entryConfig,
      users: resolvedUsers
    };
  }
  return nextEntries;
}
function addAllowlistUserEntriesFromConfigEntry(target, entry) {
  if (!entry || typeof entry !== "object") return;
  const users = entry.users;
  if (!Array.isArray(users)) return;
  for (const value of users) {
    const trimmed = (0, _stringCoerceBUSzWgUA.s)(value) ?? "";
    if (trimmed && trimmed !== "*") target.add(trimmed);
  }
}
function summarizeMapping(label, mapping, unresolved, runtime) {
  const lines = [];
  if (mapping.length > 0) lines.push(`${label} resolved: ${(0, _stringSampleBSLrcV_.t)({
    entries: mapping,
    limit: 6
  })}`);
  if (unresolved.length > 0) lines.push(`${label} unresolved: ${(0, _stringSampleBSLrcV_.t)({
    entries: unresolved,
    limit: 6
  })}`);
  if (lines.length > 0) runtime.log?.(lines.join("\n"));
}
//#endregion /* v9-e552d93620d6b705 */
