"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = respondUnavailableOnNodeInvokeError;exports.i = respondInvalidParams;exports.n = mergeGatewayAuthConfig;exports.o = respondUnavailableOnThrow;exports.r = mergeGatewayTailscaleConfig;exports.s = safeParseJson;exports.t = ensureGatewayStartupAuth;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _authModePolicyCMqSiMvK = require("./auth-mode-policy-CMqSiMvK.js");
var _credentialPlannerCxtmVh4K = require("./credential-planner-CxtmVh4K.js");
require("./credentials-DH-nlrJW.js");
var _authDN1PwXy = require("./auth-DN1PwXy9.js");
var _configQ9XZc_2I = require("./config-Q9XZc_2I.js");
var _protocolC6T5DFc = require("./protocol-C6T5DFc8.js");
var _wsLogDHlv01OL = require("./ws-log-DHlv01OL.js");
var _authConfigUtilsDwWV5R_E = require("./auth-config-utils-DwWV5R_E.js");
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/gateway/server-methods/nodes.helpers.ts
function respondInvalidParams(params) {
  params.respond(false, void 0, (0, _protocolC6T5DFc.rn)(_protocolC6T5DFc.nn.INVALID_REQUEST, `invalid ${params.method} params: ${(0, _protocolC6T5DFc.t)(params.validator.errors)}`));
}
async function respondUnavailableOnThrow(respond, fn) {
  try {
    await fn();
  } catch (err) {
    respond(false, void 0, (0, _protocolC6T5DFc.rn)(_protocolC6T5DFc.nn.UNAVAILABLE, (0, _wsLogDHlv01OL.t)(err)));
  }
}
function safeParseJson(value) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(value);
  if (!trimmed) return;
  try {
    return JSON.parse(trimmed);
  } catch {
    return { payloadJSON: value };
  }
}
function respondUnavailableOnNodeInvokeError(respond, res) {
  if (res.ok) return true;
  const nodeError = res.error && typeof res.error === "object" ? res.error : null;
  const nodeCode = (0, _stringCoerceBUSzWgUA.s)(nodeError?.code) ?? "";
  const nodeMessage = (0, _stringCoerceBUSzWgUA.s)(nodeError?.message) ?? "node invoke failed";
  const message = nodeCode ? `${nodeCode}: ${nodeMessage}` : nodeMessage;
  respond(false, void 0, (0, _protocolC6T5DFc.rn)(_protocolC6T5DFc.nn.UNAVAILABLE, message, { details: { nodeError: res.error ?? null } }));
  return false;
}
//#endregion
//#region src/gateway/startup-auth.ts
/**
* Placeholder credentials that have ever shipped in `.env.example` or been
* used as copy-paste examples in onboarding docs. If any of these ever
* becomes the resolved gateway credential at startup, reject the launch —
* the operator almost certainly copied an example file verbatim without
* replacing the sentinel, which would otherwise leave the gateway protected
* by a publicly-known credential.
*
* This is a belt-and-suspenders complement to keeping `.env.example` blank:
* the example file alone does not protect users who follow an older doc
* snippet or copy a tutorial command line.
*/
const KNOWN_WEAK_GATEWAY_TOKENS = new Set(["change-me-to-a-long-random-token"]);
const KNOWN_WEAK_GATEWAY_PASSWORDS = new Set(["change-me-to-a-strong-password"]);
function mergeGatewayAuthConfig(base, override) {
  const merged = { ...base };
  if (!override) return merged;
  if (override.mode !== void 0) merged.mode = override.mode;
  if (override.token !== void 0) merged.token = override.token;
  if (override.password !== void 0) merged.password = override.password;
  if (override.allowTailscale !== void 0) merged.allowTailscale = override.allowTailscale;
  if (override.rateLimit !== void 0) merged.rateLimit = override.rateLimit;
  if (override.trustedProxy !== void 0) merged.trustedProxy = override.trustedProxy;
  return merged;
}
function mergeGatewayTailscaleConfig(base, override) {
  const merged = { ...base };
  if (!override) return merged;
  if (override.mode !== void 0) merged.mode = override.mode;
  if (override.resetOnExit !== void 0) merged.resetOnExit = override.resetOnExit;
  return merged;
}
function resolveGatewayAuthFromConfig(params) {
  const tailscaleConfig = mergeGatewayTailscaleConfig(params.cfg.gateway?.tailscale, params.tailscaleOverride);
  return (0, _authDN1PwXy.o)({
    authConfig: params.cfg.gateway?.auth,
    authOverride: params.authOverride,
    env: params.env,
    tailscaleMode: tailscaleConfig.mode ?? "off"
  });
}
function shouldPersistGeneratedToken(params) {
  if (!params.persistRequested) return false;
  if (params.resolvedAuth.modeSource === "override") return false;
  return true;
}
function hasGatewayTokenCandidate(params) {
  if ((0, _credentialPlannerCxtmVh4K.a)(params.env.OPENCLAW_GATEWAY_TOKEN)) return true;
  if (typeof params.authOverride?.token === "string" && params.authOverride.token.trim().length > 0) return true;
  return (0, _authConfigUtilsDwWV5R_E.t)(params.cfg, "gateway.auth.token");
}
function hasGatewayTokenOverrideCandidate(params) {
  return typeof params.authOverride?.token === "string" && params.authOverride.token.trim().length > 0;
}
function hasGatewayPasswordOverrideCandidate(params) {
  if ((0, _credentialPlannerCxtmVh4K.n)(params.env)) return true;
  return typeof params.authOverride?.password === "string" && params.authOverride.password.trim().length > 0;
}
async function ensureGatewayStartupAuth(params) {
  (0, _authModePolicyCMqSiMvK.t)(params.cfg);
  const env = params.env ?? process.env;
  const persistRequested = params.persist === true;
  const explicitMode = params.authOverride?.mode ?? params.cfg.gateway?.auth?.mode;
  const [resolvedTokenRefValue, resolvedPasswordRefValue] = await Promise.all([(0, _authConfigUtilsDwWV5R_E.i)({
    cfg: params.cfg,
    env,
    mode: explicitMode,
    hasTokenCandidate: hasGatewayTokenOverrideCandidate({ authOverride: params.authOverride }) || (0, _credentialPlannerCxtmVh4K.r)(env),
    hasPasswordCandidate: hasGatewayPasswordOverrideCandidate({
      env,
      authOverride: params.authOverride
    }) || (0, _authConfigUtilsDwWV5R_E.t)(params.cfg, "gateway.auth.password")
  }), (0, _authConfigUtilsDwWV5R_E.r)({
    cfg: params.cfg,
    env,
    mode: explicitMode,
    hasPasswordCandidate: hasGatewayPasswordOverrideCandidate({
      env,
      authOverride: params.authOverride
    }),
    hasTokenCandidate: hasGatewayTokenCandidate({
      cfg: params.cfg,
      env,
      authOverride: params.authOverride
    })
  })]);
  const authOverride = params.authOverride || resolvedTokenRefValue || resolvedPasswordRefValue ? {
    ...params.authOverride,
    ...(resolvedTokenRefValue ? { token: resolvedTokenRefValue } : {}),
    ...(resolvedPasswordRefValue ? { password: resolvedPasswordRefValue } : {})
  } : void 0;
  const resolved = resolveGatewayAuthFromConfig({
    cfg: params.cfg,
    env,
    authOverride,
    tailscaleOverride: params.tailscaleOverride
  });
  if (resolved.mode !== "token" || (resolved.token?.trim().length ?? 0) > 0) {
    assertGatewayAuthNotKnownWeak(resolved);
    assertHooksTokenSeparateFromGatewayAuth({
      cfg: params.cfg,
      auth: resolved
    });
    return {
      cfg: params.cfg,
      auth: resolved,
      persistedGeneratedToken: false
    };
  }
  const generatedToken = _nodeCrypto.default.randomBytes(24).toString("hex");
  const nextCfg = {
    ...params.cfg,
    gateway: {
      ...params.cfg.gateway,
      auth: {
        ...params.cfg.gateway?.auth,
        mode: "token",
        token: generatedToken
      }
    }
  };
  const persist = shouldPersistGeneratedToken({
    persistRequested,
    resolvedAuth: resolved
  });
  if (persist) await (0, _configQ9XZc_2I.r)({
    nextConfig: nextCfg,
    baseHash: params.baseHash
  });
  const nextAuth = resolveGatewayAuthFromConfig({
    cfg: nextCfg,
    env,
    authOverride: params.authOverride,
    tailscaleOverride: params.tailscaleOverride
  });
  assertGatewayAuthNotKnownWeak(nextAuth);
  assertHooksTokenSeparateFromGatewayAuth({
    cfg: nextCfg,
    auth: nextAuth
  });
  return {
    cfg: nextCfg,
    auth: nextAuth,
    generatedToken,
    persistedGeneratedToken: persist
  };
}
function assertGatewayAuthNotKnownWeak(auth) {
  if (auth.mode === "token") {
    const token = auth.token?.trim() ?? "";
    if (token && KNOWN_WEAK_GATEWAY_TOKENS.has(token)) throw new Error("Invalid config: gateway auth token is set to the example placeholder from .env.example. Generate a real secret (e.g. `openssl rand -hex 32`) and set OPENCLAW_GATEWAY_TOKEN or gateway.auth.token before starting the gateway.");
    return;
  }
  if (auth.mode === "password") {
    const password = auth.password?.trim() ?? "";
    if (password && KNOWN_WEAK_GATEWAY_PASSWORDS.has(password)) throw new Error("Invalid config: gateway auth password is set to the example placeholder from .env.example. Choose a real password and set OPENCLAW_GATEWAY_PASSWORD or gateway.auth.password before starting the gateway.");
  }
}
function assertHooksTokenSeparateFromGatewayAuth(params) {
  if (params.cfg.hooks?.enabled !== true) return;
  const hooksToken = (0, _stringCoerceBUSzWgUA.s)(params.cfg.hooks.token) ?? "";
  if (!hooksToken) return;
  const gatewayToken = params.auth.mode === "token" ? (0, _stringCoerceBUSzWgUA.s)(params.auth.token) ?? "" : "";
  if (!gatewayToken) return;
  if (hooksToken !== gatewayToken) return;
  throw new Error("Invalid config: hooks.token must not match gateway auth token. Set a distinct hooks.token for hook ingress.");
}
//#endregion /* v9-162fd4a8efc92927 */
