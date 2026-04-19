"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveProxyFetchFromEnv;exports.n = getProxyUrlFromFetch;exports.r = makeProxyFetch;exports.t = void 0;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _loggerBA_TvTc = require("./logger-BA_TvTc6.js");
var _proxyEnvQIN1SJGt = require("./proxy-env-qIN1SJGt.js");
var _undici = require("undici");
//#region src/infra/net/proxy-fetch.ts
const PROXY_FETCH_PROXY_URL = exports.t = Symbol.for("openclaw.proxyFetch.proxyUrl");
/**
* Create a fetch function that routes requests through the given HTTP proxy.
* Uses undici's ProxyAgent under the hood.
*/
function makeProxyFetch(proxyUrl) {
  let agent = null;
  const resolveAgent = () => {
    if (!agent) agent = new _undici.ProxyAgent(proxyUrl);
    return agent;
  };
  const proxyFetch = (input, init) => (0, _undici.fetch)(input, {
    ...init,
    dispatcher: resolveAgent()
  });
  Object.defineProperty(proxyFetch, PROXY_FETCH_PROXY_URL, {
    value: proxyUrl,
    enumerable: false,
    configurable: false,
    writable: false
  });
  return proxyFetch;
}
function getProxyUrlFromFetch(fetchImpl) {
  const proxyUrl = fetchImpl?.[PROXY_FETCH_PROXY_URL];
  if (typeof proxyUrl !== "string") return;
  const trimmed = proxyUrl.trim();
  return trimmed ? trimmed : void 0;
}
/**
* Resolve a proxy-aware fetch from standard environment variables
* (HTTPS_PROXY, HTTP_PROXY, https_proxy, http_proxy).
* Respects NO_PROXY / no_proxy exclusions via undici's EnvHttpProxyAgent.
* Returns undefined when no proxy is configured.
* Gracefully returns undefined if the proxy URL is malformed.
*/
function resolveProxyFetchFromEnv(env = process.env) {
  if (!(0, _proxyEnvQIN1SJGt.n)("https", env)) return;
  try {
    const agent = new _undici.EnvHttpProxyAgent();
    return (input, init) => (0, _undici.fetch)(input, {
      ...init,
      dispatcher: agent
    });
  } catch (err) {
    (0, _loggerBA_TvTc.a)(`Proxy env var set but agent creation failed — falling back to direct fetch: ${(0, _errorsD8p6rxH.i)(err)}`);
    return;
  }
}
//#endregion /* v9-1bd9d939d783ab5a */
