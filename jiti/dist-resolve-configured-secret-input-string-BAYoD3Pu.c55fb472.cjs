"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveConfiguredSecretInputWithFallback;exports.r = resolveRequiredConfiguredSecretRefInputString;exports.t = resolveConfiguredSecretInputString;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _typesSecretsCeL3gSMO = require("./types.secrets-CeL3gSMO.js");
var _refContractB0QmVSlT = require("./ref-contract-B0QmVSlT.js");
var _resolveBKszWuwe = require("./resolve-BKszWuwe.js");
//#region src/gateway/resolve-configured-secret-input-string.ts
function buildUnresolvedReason(params) {
  if (params.style === "generic") return `${params.path} SecretRef is unresolved (${params.refLabel}).`;
  if (params.kind === "non-string") return `${params.path} SecretRef resolved to a non-string value.`;
  if (params.kind === "empty") return `${params.path} SecretRef resolved to an empty value.`;
  return `${params.path} SecretRef is unresolved (${params.refLabel}).`;
}
async function resolveConfiguredSecretInputString(params) {
  const style = params.unresolvedReasonStyle ?? "generic";
  const { ref } = (0, _typesSecretsCeL3gSMO.d)({
    value: params.value,
    defaults: params.config.secrets?.defaults
  });
  if (!ref) return { value: (0, _stringCoerceBUSzWgUA.s)(params.value) };
  const refLabel = `${ref.source}:${ref.provider}:${ref.id}`;
  try {
    const resolvedValue = (await (0, _resolveBKszWuwe.o)([ref], {
      config: params.config,
      env: params.env
    })).get((0, _refContractB0QmVSlT.u)(ref));
    if (typeof resolvedValue !== "string") return { unresolvedRefReason: buildUnresolvedReason({
        path: params.path,
        style,
        kind: "non-string",
        refLabel
      }) };
    const trimmed = (0, _stringCoerceBUSzWgUA.s)(resolvedValue);
    if (!trimmed) return { unresolvedRefReason: buildUnresolvedReason({
        path: params.path,
        style,
        kind: "empty",
        refLabel
      }) };
    return { value: trimmed };
  } catch {
    return { unresolvedRefReason: buildUnresolvedReason({
        path: params.path,
        style,
        kind: "unresolved",
        refLabel
      }) };
  }
}
async function resolveConfiguredSecretInputWithFallback(params) {
  const { ref } = (0, _typesSecretsCeL3gSMO.d)({
    value: params.value,
    defaults: params.config.secrets?.defaults
  });
  const configValue = !ref ? (0, _stringCoerceBUSzWgUA.s)(params.value) : void 0;
  if (configValue) return {
    value: configValue,
    source: "config",
    secretRefConfigured: false
  };
  if (!ref) {
    const fallback = params.readFallback?.();
    if (fallback) return {
      value: fallback,
      source: "fallback",
      secretRefConfigured: false
    };
    return { secretRefConfigured: false };
  }
  const resolved = await resolveConfiguredSecretInputString({
    config: params.config,
    env: params.env,
    value: params.value,
    path: params.path,
    unresolvedReasonStyle: params.unresolvedReasonStyle
  });
  if (resolved.value) return {
    value: resolved.value,
    source: "secretRef",
    secretRefConfigured: true
  };
  const fallback = params.readFallback?.();
  if (fallback) return {
    value: fallback,
    source: "fallback",
    secretRefConfigured: true
  };
  return {
    unresolvedRefReason: resolved.unresolvedRefReason,
    secretRefConfigured: true
  };
}
async function resolveRequiredConfiguredSecretRefInputString(params) {
  const { ref } = (0, _typesSecretsCeL3gSMO.d)({
    value: params.value,
    defaults: params.config.secrets?.defaults
  });
  if (!ref) return;
  const resolved = await resolveConfiguredSecretInputString({
    config: params.config,
    env: params.env,
    value: params.value,
    path: params.path,
    unresolvedReasonStyle: params.unresolvedReasonStyle
  });
  if (resolved.value) return resolved.value;
  throw new Error(resolved.unresolvedRefReason ?? `${params.path} resolved to an empty value.`);
}
//#endregion /* v9-696adde019dc9f4c */
