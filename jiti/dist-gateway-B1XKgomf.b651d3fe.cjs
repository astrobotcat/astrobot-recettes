"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = readGatewayCallOptions;exports.r = resolveGatewayOptions;exports.t = callGatewayTool;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _credentialPlannerCxtmVh4K = require("./credential-planner-CxtmVh4K.js");
var _credentialsDHNlrJW = require("./credentials-DH-nlrJW.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
require("./config-Q9XZc_2I.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
var _methodScopesD3xbsVVt = require("./method-scopes-D3xbsVVt.js");
var _callBA3do6C = require("./call-BA3do6C0.js");
var _commonBWtun2If = require("./common-BWtun2If.js");
//#region src/agents/tools/gateway.ts
function readGatewayCallOptions(params) {
  return {
    gatewayUrl: (0, _commonBWtun2If.h)(params, "gatewayUrl", { trim: false }),
    gatewayToken: (0, _commonBWtun2If.h)(params, "gatewayToken", { trim: false }),
    timeoutMs: typeof params.timeoutMs === "number" ? params.timeoutMs : void 0
  };
}
function canonicalizeToolGatewayWsUrl(raw) {
  const input = raw.trim();
  let url;
  try {
    url = new URL(input);
  } catch (error) {
    const message = (0, _errorsD8p6rxH.i)(error);
    throw new Error(`invalid gatewayUrl: ${input} (${message})`, { cause: error });
  }
  if (url.protocol !== "ws:" && url.protocol !== "wss:") throw new Error(`invalid gatewayUrl protocol: ${url.protocol} (expected ws:// or wss://)`);
  if (url.username || url.password) throw new Error("invalid gatewayUrl: credentials are not allowed");
  if (url.search || url.hash) throw new Error("invalid gatewayUrl: query/hash not allowed");
  if (url.pathname && url.pathname !== "/") throw new Error("invalid gatewayUrl: path not allowed");
  return {
    origin: url.origin,
    key: `${url.protocol}//${(0, _stringCoerceBUSzWgUA.i)(url.host)}`
  };
}
function validateGatewayUrlOverrideForAgentTools(params) {
  const { cfg } = params;
  const port = (0, _pathsDvv9VRAc.u)(cfg);
  const localAllowed = new Set([
  `ws://127.0.0.1:${port}`,
  `wss://127.0.0.1:${port}`,
  `ws://localhost:${port}`,
  `wss://localhost:${port}`,
  `ws://[::1]:${port}`,
  `wss://[::1]:${port}`]
  );
  let remoteKey;
  const remoteUrl = (0, _stringCoerceBUSzWgUA.s)(cfg.gateway?.remote?.url) ?? "";
  if (remoteUrl) try {
    remoteKey = canonicalizeToolGatewayWsUrl(remoteUrl).key;
  } catch {}
  const parsed = canonicalizeToolGatewayWsUrl(params.urlOverride);
  if (localAllowed.has(parsed.key)) return {
    url: parsed.origin,
    target: "local"
  };
  if (remoteKey && parsed.key === remoteKey) return {
    url: parsed.origin,
    target: "remote"
  };
  throw new Error([
  "gatewayUrl override rejected.",
  `Allowed: ws(s) loopback on port ${port} (127.0.0.1/localhost/[::1])`,
  "Or: configure gateway.remote.url and omit gatewayUrl to use the configured remote gateway."].
  join(" "));
}
function resolveGatewayOverrideToken(params) {
  if (params.explicitToken) return params.explicitToken;
  return (0, _credentialsDHNlrJW.r)({
    cfg: params.cfg,
    env: process.env,
    modeOverride: params.target,
    remoteTokenFallback: params.target === "remote" ? "remote-only" : "remote-env-local",
    remotePasswordFallback: params.target === "remote" ? "remote-only" : "remote-env-local"
  }).token;
}
function resolveGatewayOptions(opts) {
  const cfg = (0, _io5pxHCi7V.a)();
  const validatedOverride = (0, _credentialPlannerCxtmVh4K.a)(opts?.gatewayUrl) !== void 0 ? validateGatewayUrlOverrideForAgentTools({
    cfg,
    urlOverride: String(opts?.gatewayUrl)
  }) : void 0;
  const explicitToken = (0, _credentialPlannerCxtmVh4K.a)(opts?.gatewayToken);
  const token = validatedOverride ? resolveGatewayOverrideToken({
    cfg,
    target: validatedOverride.target,
    explicitToken
  }) : explicitToken;
  const timeoutMs = typeof opts?.timeoutMs === "number" && Number.isFinite(opts.timeoutMs) ? Math.max(1, Math.floor(opts.timeoutMs)) : 3e4;
  return {
    url: validatedOverride?.url,
    token,
    timeoutMs
  };
}
async function callGatewayTool(method, opts, params, extra) {
  const gateway = resolveGatewayOptions(opts);
  const scopes = Array.isArray(extra?.scopes) ? extra.scopes : (0, _methodScopesD3xbsVVt.a)(method);
  return await (0, _callBA3do6C.r)({
    url: gateway.url,
    token: gateway.token,
    method,
    params,
    timeoutMs: gateway.timeoutMs,
    expectFinal: extra?.expectFinal,
    clientName: _messageChannelCBqCPFa_.g.GATEWAY_CLIENT,
    clientDisplayName: "agent",
    mode: _messageChannelCBqCPFa_.h.BACKEND,
    scopes
  });
}
//#endregion /* v9-c4c668a3b5d689ad */
