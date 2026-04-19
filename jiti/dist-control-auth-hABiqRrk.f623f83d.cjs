"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveBrowserControlAuth;exports.r = shouldAutoGenerateBrowserAuth;exports.t = ensureBrowserControlAuth;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _authDN1PwXy = require("./auth-DN1PwXy9.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
require("./text-runtime-DTMxvodz.js");
require("./browser-config-runtime-Db5LKdcQ.js");
var _startupAuthDJG2oyd = require("./startup-auth-DJG2oyd0.js");
require("./browser-node-runtime-Cr9m9xwX.js");
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region extensions/browser/src/browser/control-auth.ts
function resolveBrowserControlAuth(cfg, env = process.env) {
  const auth = (0, _authDN1PwXy.o)({
    authConfig: cfg?.gateway?.auth,
    env,
    tailscaleMode: cfg?.gateway?.tailscale?.mode
  });
  const token = (0, _stringCoerceBUSzWgUA.s)(auth.token) ?? "";
  const password = (0, _stringCoerceBUSzWgUA.s)(auth.password) ?? "";
  return {
    token: token || void 0,
    password: password || void 0
  };
}
function shouldAutoGenerateBrowserAuth(env) {
  if ((0, _stringCoerceBUSzWgUA.i)(env.NODE_ENV) === "test") return false;
  const vitest = (0, _stringCoerceBUSzWgUA.i)(env.VITEST);
  if (vitest && vitest !== "0" && vitest !== "false" && vitest !== "off") return false;
  return true;
}
function hasExplicitNonStringGatewayCredentialForMode(params) {
  const { cfg, mode } = params;
  const auth = cfg?.gateway?.auth;
  if (!auth) return false;
  if (mode === "none") return auth.token != null && typeof auth.token !== "string";
  return auth.password != null && typeof auth.password !== "string";
}
function generateBrowserControlToken() {
  return _nodeCrypto.default.randomBytes(24).toString("hex");
}
async function generateAndPersistBrowserControlToken(params) {
  const token = generateBrowserControlToken();
  await (0, _io5pxHCi7V.g)({
    ...params.cfg,
    gateway: {
      ...params.cfg.gateway,
      auth: {
        ...params.cfg.gateway?.auth,
        token
      }
    }
  });
  const persistedAuth = resolveBrowserControlAuth((0, _io5pxHCi7V.a)(), params.env);
  if (persistedAuth.token || persistedAuth.password) return {
    auth: persistedAuth,
    generatedToken: persistedAuth.token === token ? token : void 0
  };
  return {
    auth: { token },
    generatedToken: token
  };
}
async function generateAndPersistBrowserControlPassword(params) {
  const password = generateBrowserControlToken();
  await (0, _io5pxHCi7V.g)({
    ...params.cfg,
    gateway: {
      ...params.cfg.gateway,
      auth: {
        ...params.cfg.gateway?.auth,
        password
      }
    }
  });
  const persistedAuth = resolveBrowserControlAuth((0, _io5pxHCi7V.a)(), params.env);
  if (persistedAuth.token || persistedAuth.password) return {
    auth: persistedAuth,
    generatedToken: persistedAuth.password === password ? password : void 0
  };
  return {
    auth: { password },
    generatedToken: password
  };
}
async function ensureBrowserControlAuth(params) {
  const env = params.env ?? process.env;
  const auth = resolveBrowserControlAuth(params.cfg, env);
  if (auth.token || auth.password) return { auth };
  if (!shouldAutoGenerateBrowserAuth(env)) return { auth };
  if (params.cfg.gateway?.auth?.mode === "password") return { auth };
  const latestCfg = (0, _io5pxHCi7V.a)();
  const latestAuth = resolveBrowserControlAuth(latestCfg, env);
  if (latestAuth.token || latestAuth.password) return { auth: latestAuth };
  if (latestCfg.gateway?.auth?.mode === "password") return { auth: latestAuth };
  const latestMode = latestCfg.gateway?.auth?.mode;
  if (latestMode === "none" || latestMode === "trusted-proxy") {
    if (hasExplicitNonStringGatewayCredentialForMode({
      cfg: latestCfg,
      mode: latestMode
    })) return { auth: latestAuth };
    if (latestMode === "trusted-proxy") return await generateAndPersistBrowserControlPassword({
      cfg: latestCfg,
      env
    });
    return await generateAndPersistBrowserControlToken({
      cfg: latestCfg,
      env
    });
  }
  const ensured = await (0, _startupAuthDJG2oyd.t)({
    cfg: latestCfg,
    env,
    persist: true
  });
  return {
    auth: {
      token: ensured.auth.token,
      password: ensured.auth.password
    },
    generatedToken: ensured.generatedToken
  };
}
//#endregion /* v9-4266d810eea76ef0 */
