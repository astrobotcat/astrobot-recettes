"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = identityHasStableSessionId;exports.c = resolveRuntimeHandleIdentifiersFromIdentity;exports.i = identityEquals;exports.l = resolveRuntimeResumeSessionId;exports.n = createIdentityFromHandleEvent;exports.o = isSessionIdentityPending;exports.r = createIdentityFromStatus;exports.s = mergeSessionIdentity;exports.t = createIdentityFromEnsure;exports.u = resolveSessionIdentityFromMeta;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/acp/runtime/session-identity.ts
function normalizeIdentityState(value) {
  if (value !== "pending" && value !== "resolved") return;
  return value;
}
function normalizeIdentitySource(value) {
  if (value !== "ensure" && value !== "status" && value !== "event") return;
  return value;
}
function normalizeIdentity(identity) {
  if (!identity) return;
  const state = normalizeIdentityState(identity.state);
  const source = normalizeIdentitySource(identity.source);
  const acpxRecordId = (0, _stringCoerceBUSzWgUA.s)(identity.acpxRecordId);
  const acpxSessionId = (0, _stringCoerceBUSzWgUA.s)(identity.acpxSessionId);
  const agentSessionId = (0, _stringCoerceBUSzWgUA.s)(identity.agentSessionId);
  const lastUpdatedAt = typeof identity.lastUpdatedAt === "number" && Number.isFinite(identity.lastUpdatedAt) ? identity.lastUpdatedAt : void 0;
  if (!state && !source && !Boolean(acpxRecordId || acpxSessionId || agentSessionId) && lastUpdatedAt === void 0) return;
  return {
    state: state ?? (Boolean(acpxSessionId || agentSessionId) ? "resolved" : "pending"),
    ...(acpxRecordId ? { acpxRecordId } : {}),
    ...(acpxSessionId ? { acpxSessionId } : {}),
    ...(agentSessionId ? { agentSessionId } : {}),
    source: source ?? "status",
    lastUpdatedAt: lastUpdatedAt ?? Date.now()
  };
}
function resolveSessionIdentityFromMeta(meta) {
  if (!meta) return;
  return normalizeIdentity(meta.identity);
}
function identityHasStableSessionId(identity) {
  return Boolean(identity?.acpxSessionId || identity?.agentSessionId);
}
function resolveRuntimeResumeSessionId(identity) {
  if (!identity) return;
  return (0, _stringCoerceBUSzWgUA.s)(identity.agentSessionId) ?? (0, _stringCoerceBUSzWgUA.s)(identity.acpxSessionId);
}
function isSessionIdentityPending(identity) {
  if (!identity) return true;
  return identity.state === "pending";
}
function identityEquals(left, right) {
  const a = normalizeIdentity(left);
  const b = normalizeIdentity(right);
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.state === b.state && a.acpxRecordId === b.acpxRecordId && a.acpxSessionId === b.acpxSessionId && a.agentSessionId === b.agentSessionId && a.source === b.source;
}
function mergeSessionIdentity(params) {
  const current = normalizeIdentity(params.current);
  const incoming = normalizeIdentity(params.incoming);
  if (!current) {
    if (!incoming) return;
    return {
      ...incoming,
      lastUpdatedAt: params.now
    };
  }
  if (!incoming) return current;
  const currentResolved = current.state === "resolved";
  const incomingResolved = incoming.state === "resolved";
  const allowIncomingValue = !currentResolved || incomingResolved;
  const nextRecordId = allowIncomingValue && incoming.acpxRecordId ? incoming.acpxRecordId : current.acpxRecordId;
  const nextAcpxSessionId = allowIncomingValue && incoming.acpxSessionId ? incoming.acpxSessionId : current.acpxSessionId;
  const nextAgentSessionId = allowIncomingValue && incoming.agentSessionId ? incoming.agentSessionId : current.agentSessionId;
  const nextState = Boolean(nextAcpxSessionId || nextAgentSessionId) ? "resolved" : currentResolved ? "resolved" : incoming.state;
  const nextSource = allowIncomingValue ? incoming.source : current.source;
  return {
    state: nextState,
    ...(nextRecordId ? { acpxRecordId: nextRecordId } : {}),
    ...(nextAcpxSessionId ? { acpxSessionId: nextAcpxSessionId } : {}),
    ...(nextAgentSessionId ? { agentSessionId: nextAgentSessionId } : {}),
    source: nextSource,
    lastUpdatedAt: params.now
  };
}
function createIdentityFromEnsure(params) {
  const acpxRecordId = (0, _stringCoerceBUSzWgUA.s)(params.handle.acpxRecordId);
  const acpxSessionId = (0, _stringCoerceBUSzWgUA.s)(params.handle.backendSessionId);
  const agentSessionId = (0, _stringCoerceBUSzWgUA.s)(params.handle.agentSessionId);
  if (!acpxRecordId && !acpxSessionId && !agentSessionId) return;
  return {
    state: "pending",
    ...(acpxRecordId ? { acpxRecordId } : {}),
    ...(acpxSessionId ? { acpxSessionId } : {}),
    ...(agentSessionId ? { agentSessionId } : {}),
    source: "ensure",
    lastUpdatedAt: params.now
  };
}
function createIdentityFromHandleEvent(params) {
  const acpxRecordId = (0, _stringCoerceBUSzWgUA.s)(params.handle.acpxRecordId);
  const acpxSessionId = (0, _stringCoerceBUSzWgUA.s)(params.handle.backendSessionId);
  const agentSessionId = (0, _stringCoerceBUSzWgUA.s)(params.handle.agentSessionId);
  if (!acpxRecordId && !acpxSessionId && !agentSessionId) return;
  return {
    state: agentSessionId ? "resolved" : "pending",
    ...(acpxRecordId ? { acpxRecordId } : {}),
    ...(acpxSessionId ? { acpxSessionId } : {}),
    ...(agentSessionId ? { agentSessionId } : {}),
    source: "event",
    lastUpdatedAt: params.now
  };
}
function createIdentityFromStatus(params) {
  if (!params.status) return;
  const details = params.status.details;
  const acpxRecordId = (0, _stringCoerceBUSzWgUA.s)(params.status.acpxRecordId) ?? (0, _stringCoerceBUSzWgUA.s)(details?.acpxRecordId);
  const acpxSessionId = (0, _stringCoerceBUSzWgUA.s)(params.status.backendSessionId) ?? (0, _stringCoerceBUSzWgUA.s)(details?.backendSessionId) ?? (0, _stringCoerceBUSzWgUA.s)(details?.acpxSessionId);
  const agentSessionId = (0, _stringCoerceBUSzWgUA.s)(params.status.agentSessionId) ?? (0, _stringCoerceBUSzWgUA.s)(details?.agentSessionId);
  if (!acpxRecordId && !acpxSessionId && !agentSessionId) return;
  return {
    state: Boolean(acpxSessionId || agentSessionId) ? "resolved" : "pending",
    ...(acpxRecordId ? { acpxRecordId } : {}),
    ...(acpxSessionId ? { acpxSessionId } : {}),
    ...(agentSessionId ? { agentSessionId } : {}),
    source: "status",
    lastUpdatedAt: params.now
  };
}
function resolveRuntimeHandleIdentifiersFromIdentity(identity) {
  if (!identity) return {};
  return {
    ...(identity.acpxSessionId ? { backendSessionId: identity.acpxSessionId } : {}),
    ...(identity.agentSessionId ? { agentSessionId: identity.agentSessionId } : {})
  };
}
//#endregion /* v9-5acd16a6f63dc58e */
