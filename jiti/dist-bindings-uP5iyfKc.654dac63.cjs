"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolvePreferredAccountId;exports.i = resolveDefaultAgentBoundAccountId;exports.n = listBindings;exports.r = listBoundAccountIds;exports.t = buildChannelAccountBindings;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _idsCYPyP4SY = require("./ids-CYPyP4SY.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _bindingsKvx6Ox = require("./bindings-Kvx6Ox1-.js");
//#region src/routing/bindings.ts
function normalizeBindingChannelId(raw) {
  const normalized = (0, _idsCYPyP4SY.r)(raw);
  if (normalized) return normalized;
  return (0, _stringCoerceBUSzWgUA.i)(raw) || null;
}
function listBindings(cfg) {
  return (0, _bindingsKvx6Ox.i)(cfg);
}
function resolveNormalizedBindingMatch(binding) {
  if (!binding || typeof binding !== "object") return null;
  const match = binding.match;
  if (!match || typeof match !== "object") return null;
  const channelId = normalizeBindingChannelId(match.channel);
  if (!channelId) return null;
  const accountId = typeof match.accountId === "string" ? match.accountId.trim() : "";
  if (!accountId || accountId === "*") return null;
  return {
    agentId: (0, _sessionKeyBh1lMwK.c)(binding.agentId),
    accountId: (0, _accountIdJ7GeQlaZ.n)(accountId),
    channelId
  };
}
function listBoundAccountIds(cfg, channelId) {
  const normalizedChannel = normalizeBindingChannelId(channelId);
  if (!normalizedChannel) return [];
  const ids = /* @__PURE__ */new Set();
  for (const binding of listBindings(cfg)) {
    const resolved = resolveNormalizedBindingMatch(binding);
    if (!resolved || resolved.channelId !== normalizedChannel) continue;
    ids.add(resolved.accountId);
  }
  return Array.from(ids).toSorted((a, b) => a.localeCompare(b));
}
function resolveDefaultAgentBoundAccountId(cfg, channelId) {
  const normalizedChannel = normalizeBindingChannelId(channelId);
  if (!normalizedChannel) return null;
  const defaultAgentId = (0, _sessionKeyBh1lMwK.c)((0, _agentScopeKFH9bkHi.x)(cfg));
  for (const binding of listBindings(cfg)) {
    const resolved = resolveNormalizedBindingMatch(binding);
    if (!resolved || resolved.channelId !== normalizedChannel || resolved.agentId !== defaultAgentId) continue;
    return resolved.accountId;
  }
  return null;
}
function buildChannelAccountBindings(cfg) {
  const map = /* @__PURE__ */new Map();
  for (const binding of listBindings(cfg)) {
    const resolved = resolveNormalizedBindingMatch(binding);
    if (!resolved) continue;
    const byAgent = map.get(resolved.channelId) ?? /* @__PURE__ */new Map();
    const list = byAgent.get(resolved.agentId) ?? [];
    if (!list.includes(resolved.accountId)) list.push(resolved.accountId);
    byAgent.set(resolved.agentId, list);
    map.set(resolved.channelId, byAgent);
  }
  return map;
}
function resolvePreferredAccountId(params) {
  if (params.boundAccounts.length > 0) return params.boundAccounts[0];
  return params.defaultAccountId;
}
//#endregion /* v9-6c7a34c4f9356caf */
