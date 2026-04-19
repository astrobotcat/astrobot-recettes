"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveGatewayTokenSecretRefValue;exports.n = materializeGatewayAuthSecretRefs;exports.r = resolveGatewayPasswordSecretRefValue;exports.t = hasConfiguredGatewayAuthSecretInput;var _typesSecretsCeL3gSMO = require("./types.secrets-CeL3gSMO.js");
var _resolveConfiguredSecretInputStringBAYoD3Pu = require("./resolve-configured-secret-input-string-BAYoD3Pu.js");
var _credentialsSecretInputsCW0my3bl = require("./credentials-secret-inputs-CW0my3bl.js");
//#region src/gateway/auth-config-utils.ts
function hasConfiguredGatewayAuthSecretInput(cfg, path) {
  return (0, _typesSecretsCeL3gSMO.a)((0, _credentialsSecretInputsCW0my3bl.r)(cfg, path), cfg.secrets?.defaults);
}
function shouldResolveGatewayAuthSecretRef(params) {
  const isTokenPath = params.path === "gateway.auth.token";
  if (isTokenPath ? params.hasTokenCandidate : params.hasPasswordCandidate) return false;
  if (params.mode === (isTokenPath ? "token" : "password")) return true;
  if (params.mode === "token" || params.mode === "none" || params.mode === "trusted-proxy") return false;
  if (params.mode === "password") return !isTokenPath;
  return isTokenPath ? !params.hasPasswordCandidate : !params.hasTokenCandidate;
}
function shouldResolveGatewayTokenSecretRef(params) {
  return shouldResolveGatewayAuthSecretRef({
    mode: params.mode,
    path: "gateway.auth.token",
    hasPasswordCandidate: params.hasPasswordCandidate,
    hasTokenCandidate: params.hasTokenCandidate
  });
}
function shouldResolveGatewayPasswordSecretRef(params) {
  return shouldResolveGatewayAuthSecretRef({
    mode: params.mode,
    path: "gateway.auth.password",
    hasPasswordCandidate: params.hasPasswordCandidate,
    hasTokenCandidate: params.hasTokenCandidate
  });
}
async function resolveGatewayAuthSecretRefValue(params) {
  if (!params.shouldResolve) return;
  const value = await (0, _resolveConfiguredSecretInputStringBAYoD3Pu.r)({
    config: params.cfg,
    env: params.env,
    value: (0, _credentialsSecretInputsCW0my3bl.r)(params.cfg, params.path),
    path: params.path
  });
  if (!value) return;
  return value;
}
async function resolveGatewayTokenSecretRefValue(params) {
  return resolveGatewayAuthSecretRefValue({
    cfg: params.cfg,
    env: params.env,
    path: "gateway.auth.token",
    shouldResolve: shouldResolveGatewayTokenSecretRef(params)
  });
}
async function resolveGatewayPasswordSecretRefValue(params) {
  return resolveGatewayAuthSecretRefValue({
    cfg: params.cfg,
    env: params.env,
    path: "gateway.auth.password",
    shouldResolve: shouldResolveGatewayPasswordSecretRef(params)
  });
}
async function resolveGatewayAuthSecretRef(params) {
  const value = await resolveGatewayAuthSecretRefValue(params);
  if (!value) return params.cfg;
  const nextConfig = structuredClone(params.cfg);
  nextConfig.gateway ??= {};
  nextConfig.gateway.auth ??= {};
  (0, _credentialsSecretInputsCW0my3bl.n)({
    config: nextConfig,
    path: params.path,
    value
  });
  return nextConfig;
}
async function resolveGatewayPasswordSecretRef(params) {
  return resolveGatewayAuthSecretRef({
    cfg: params.cfg,
    env: params.env,
    path: "gateway.auth.password",
    shouldResolve: shouldResolveGatewayPasswordSecretRef(params)
  });
}
async function materializeGatewayAuthSecretRefs(params) {
  const cfgWithToken = await resolveGatewayAuthSecretRef({
    cfg: params.cfg,
    env: params.env,
    path: "gateway.auth.token",
    shouldResolve: shouldResolveGatewayTokenSecretRef(params)
  });
  return await resolveGatewayPasswordSecretRef({
    cfg: cfgWithToken,
    env: params.env,
    mode: params.mode,
    hasPasswordCandidate: params.hasPasswordCandidate,
    hasTokenCandidate: params.hasTokenCandidate || hasConfiguredGatewayAuthSecretInput(cfgWithToken, "gateway.auth.token")
  });
}
//#endregion /* v9-ff8c8c2230eaad3e */
