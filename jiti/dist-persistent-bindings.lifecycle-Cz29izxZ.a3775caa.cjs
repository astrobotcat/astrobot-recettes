"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveConfiguredAcpBindingSpecBySessionKey;exports.n = ensureConfiguredAcpBindingSession;exports.r = resolveConfiguredAcpBindingRecord;exports.t = ensureConfiguredAcpBindingReady;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _globalsDe6QTwLG = require("./globals-De6QTwLG.js");
var _managerCECGVjs = require("./manager-CECGVjs9.js");
require("./session-meta-D-nDObzR.js");
var _bindingRegistryEbIwreS = require("./binding-registry-ebIwre-S.js");
//#region src/acp/persistent-bindings.resolve.ts
function resolveConfiguredAcpBindingRecord(params) {
  const resolved = (0, _bindingRegistryEbIwreS.r)(params);
  return resolved ? (0, _bindingRegistryEbIwreS.l)(resolved.record) : null;
}
function resolveConfiguredAcpBindingSpecBySessionKey(params) {
  const resolved = (0, _bindingRegistryEbIwreS.i)(params);
  return resolved ? (0, _bindingRegistryEbIwreS.c)(resolved.record) : null;
}
//#endregion
//#region src/acp/persistent-bindings.lifecycle.ts
function sessionMatchesConfiguredBinding(params) {
  if (params.meta.state === "error") return false;
  const desiredAgent = (0, _stringCoerceBUSzWgUA.i)(params.spec.acpAgentId ?? params.spec.agentId);
  const currentAgent = (0, _stringCoerceBUSzWgUA.i)(params.meta.agent);
  if (!currentAgent || currentAgent !== desiredAgent) return false;
  if (params.meta.mode !== params.spec.mode) return false;
  const desiredBackend = (0, _stringCoerceBUSzWgUA.s)(params.spec.backend) ?? (0, _stringCoerceBUSzWgUA.s)(params.cfg.acp?.backend) ?? "";
  if (desiredBackend) {
    const currentBackend = (params.meta.backend ?? "").trim();
    if (!currentBackend || currentBackend !== desiredBackend) return false;
  }
  const desiredCwd = (0, _stringCoerceBUSzWgUA.s)(params.spec.cwd);
  if (desiredCwd !== void 0) {
    if (desiredCwd !== (params.meta.runtimeOptions?.cwd ?? params.meta.cwd ?? "").trim()) return false;
  }
  return true;
}
async function ensureConfiguredAcpBindingSession(params) {
  const sessionKey = (0, _bindingRegistryEbIwreS.o)(params.spec);
  const acpManager = (0, _managerCECGVjs.n)();
  try {
    const resolution = acpManager.resolveSession({
      cfg: params.cfg,
      sessionKey
    });
    if (resolution.kind === "ready" && sessionMatchesConfiguredBinding({
      cfg: params.cfg,
      spec: params.spec,
      meta: resolution.meta
    })) return {
      ok: true,
      sessionKey
    };
    if (resolution.kind !== "none") await acpManager.closeSession({
      cfg: params.cfg,
      sessionKey,
      reason: "config-binding-reconfigure",
      clearMeta: false,
      allowBackendUnavailable: true,
      requireAcpSession: false
    });
    await acpManager.initializeSession({
      cfg: params.cfg,
      sessionKey,
      agent: params.spec.acpAgentId ?? params.spec.agentId,
      mode: params.spec.mode,
      cwd: params.spec.cwd,
      backendId: params.spec.backend
    });
    return {
      ok: true,
      sessionKey
    };
  } catch (error) {
    const message = (0, _errorsD8p6rxH.i)(error);
    (0, _globalsDe6QTwLG.r)(`acp-configured-binding: failed ensuring ${params.spec.channel}:${params.spec.accountId}:${params.spec.conversationId} -> ${sessionKey}: ${message}`);
    return {
      ok: false,
      sessionKey,
      error: message
    };
  }
}
async function ensureConfiguredAcpBindingReady(params) {
  if (!params.configuredBinding) return { ok: true };
  const ensured = await ensureConfiguredAcpBindingSession({
    cfg: params.cfg,
    spec: params.configuredBinding.spec
  });
  if (ensured.ok) return { ok: true };
  return {
    ok: false,
    error: ensured.error ?? "unknown error"
  };
}
//#endregion /* v9-057f8499c0ae7d08 */
