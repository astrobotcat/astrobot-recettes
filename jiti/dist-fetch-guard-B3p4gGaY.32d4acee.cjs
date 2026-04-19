"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = withTrustedEnvProxyGuardedFetchMode;exports.i = withStrictGuardedFetchMode;exports.n = fetchWithSsrFGuard;exports.o = withTrustedExplicitProxyGuardedFetchMode;exports.r = retainSafeHeadersForCrossOriginRedirectHeaders;exports.s = fetchWithRuntimeDispatcher;exports.t = void 0;var _loggerBA_TvTc = require("./logger-BA_TvTc6.js");
var _proxyEnvQIN1SJGt = require("./proxy-env-qIN1SJGt.js");
var _runtimeCdS7ehWO = require("./runtime-CdS7ehWO.js");
var _fetchTimeoutDZD6CQL_ = require("./fetch-timeout-DZD6CQL_.js");
var _redirectHeadersClCgXR = require("./redirect-headers-Cl-CgXR8.js");
var _undiciRuntimeC_MCkNOw = require("./undici-runtime-C_MCkNOw.js");
var _ssrfDoOclwFS = require("./ssrf-DoOclwFS.js");
//#region src/infra/net/runtime-fetch.ts
function isFormDataLike(value) {
  return typeof value === "object" && value !== null && typeof value.entries === "function" && value[Symbol.toStringTag] === "FormData";
}
function normalizeRuntimeFormData(body, RuntimeFormData) {
  if (!isFormDataLike(body) || typeof RuntimeFormData !== "function") return body;
  if (body instanceof RuntimeFormData) return body;
  const next = new RuntimeFormData();
  for (const [key, value] of body.entries()) {
    const namedValue = value;
    const fileName = typeof namedValue.name === "string" && namedValue.name.trim() ? namedValue.name : void 0;
    if (fileName) next.append(key, value, fileName);else
    next.append(key, value);
  }
  return next;
}
function normalizeRuntimeRequestInit(init, RuntimeFormData) {
  if (!init?.body) return init;
  const body = normalizeRuntimeFormData(init.body, RuntimeFormData);
  if (body === init.body) return init;
  const headers = new Headers(init.headers);
  headers.delete("content-length");
  headers.delete("content-type");
  return {
    ...init,
    headers,
    body
  };
}
function isMockedFetch(fetchImpl) {
  if (typeof fetchImpl !== "function") return false;
  return typeof fetchImpl.mock === "object";
}
async function fetchWithRuntimeDispatcher(input, init) {
  const runtimeDeps = (0, _undiciRuntimeC_MCkNOw.i)();
  const runtimeFetch = runtimeDeps.fetch;
  return await runtimeFetch(input, normalizeRuntimeRequestInit(init, runtimeDeps.FormData));
}
//#endregion
//#region src/infra/net/fetch-guard.ts
const GUARDED_FETCH_MODE = exports.t = {
  STRICT: "strict",
  TRUSTED_ENV_PROXY: "trusted_env_proxy",
  TRUSTED_EXPLICIT_PROXY: "trusted_explicit_proxy"
};
const DEFAULT_MAX_REDIRECTS = 3;
function withStrictGuardedFetchMode(params) {
  return {
    ...params,
    mode: GUARDED_FETCH_MODE.STRICT
  };
}
function withTrustedEnvProxyGuardedFetchMode(params) {
  return {
    ...params,
    mode: GUARDED_FETCH_MODE.TRUSTED_ENV_PROXY
  };
}
function withTrustedExplicitProxyGuardedFetchMode(params) {
  return {
    ...params,
    mode: GUARDED_FETCH_MODE.TRUSTED_EXPLICIT_PROXY
  };
}
function resolveGuardedFetchMode(params) {
  if (params.mode) return params.mode;
  if (params.proxy === "env" && params.dangerouslyAllowEnvProxyWithoutPinnedDns === true) return GUARDED_FETCH_MODE.TRUSTED_ENV_PROXY;
  return GUARDED_FETCH_MODE.STRICT;
}
function assertExplicitProxySupportsPinnedDns(url, dispatcherPolicy, pinDns) {
  if (pinDns !== false && dispatcherPolicy?.mode === "explicit-proxy" && url.protocol !== "https:") throw new Error("Explicit proxy SSRF pinning requires HTTPS targets; plain HTTP targets are not supported");
}
function createPolicyDispatcherWithoutPinnedDns(dispatcherPolicy) {
  if (!dispatcherPolicy) return null;
  if (dispatcherPolicy.mode === "direct") return (0, _undiciRuntimeC_MCkNOw.t)(dispatcherPolicy.connect ? { connect: { ...dispatcherPolicy.connect } } : void 0);
  if (dispatcherPolicy.mode === "env-proxy") return (0, _undiciRuntimeC_MCkNOw.n)({
    ...(dispatcherPolicy.connect ? { connect: { ...dispatcherPolicy.connect } } : {}),
    ...(dispatcherPolicy.proxyTls ? { proxyTls: { ...dispatcherPolicy.proxyTls } } : {})
  });
  const proxyUrl = dispatcherPolicy.proxyUrl.trim();
  return dispatcherPolicy.proxyTls ? (0, _undiciRuntimeC_MCkNOw.r)({
    uri: proxyUrl,
    requestTls: { ...dispatcherPolicy.proxyTls }
  }) : (0, _undiciRuntimeC_MCkNOw.r)({ uri: proxyUrl });
}
async function assertExplicitProxyAllowed(dispatcherPolicy, lookupFn, policy) {
  if (!dispatcherPolicy || dispatcherPolicy.mode !== "explicit-proxy") return;
  let parsedProxyUrl;
  try {
    parsedProxyUrl = new URL(dispatcherPolicy.proxyUrl);
  } catch {
    throw new Error("Invalid explicit proxy URL");
  }
  if (!["http:", "https:"].includes(parsedProxyUrl.protocol)) throw new Error("Explicit proxy URL must use http or https");
  await (0, _ssrfDoOclwFS.h)(parsedProxyUrl.hostname, {
    lookupFn,
    policy: dispatcherPolicy.allowPrivateProxy === true ? {
      ...policy,
      allowPrivateNetwork: true,
      hostnameAllowlist: void 0
    } : policy
  });
}
function isRedirectStatus(status) {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}
function isAmbientGlobalFetch(params) {
  return typeof params.fetchImpl === "function" && typeof params.globalFetch === "function" && params.fetchImpl === params.globalFetch;
}
function retainSafeHeadersForCrossOriginRedirectHeaders(headers) {
  return (0, _redirectHeadersClCgXR.t)(headers);
}
function retainSafeHeadersForCrossOriginRedirect(init) {
  if (!init?.headers) return init;
  return {
    ...init,
    headers: (0, _redirectHeadersClCgXR.t)(init.headers)
  };
}
function dropBodyHeaders(headers) {
  if (!headers) return headers;
  const nextHeaders = new Headers(headers);
  nextHeaders.delete("content-encoding");
  nextHeaders.delete("content-language");
  nextHeaders.delete("content-length");
  nextHeaders.delete("content-location");
  nextHeaders.delete("content-type");
  nextHeaders.delete("transfer-encoding");
  return nextHeaders;
}
function rewriteRedirectInitForMethod(params) {
  const { init, status } = params;
  if (!init) return init;
  const currentMethod = init.method?.toUpperCase() ?? "GET";
  if (!(status === 303 ? currentMethod !== "GET" && currentMethod !== "HEAD" : (status === 301 || status === 302) && currentMethod === "POST")) return init;
  return {
    ...init,
    method: "GET",
    body: void 0,
    headers: dropBodyHeaders(init.headers)
  };
}
function rewriteRedirectInitForCrossOrigin(params) {
  const { init, allowUnsafeReplay } = params;
  if (!init || allowUnsafeReplay) return init;
  const currentMethod = init.method?.toUpperCase() ?? "GET";
  if (currentMethod === "GET" || currentMethod === "HEAD") return init;
  return {
    ...init,
    body: void 0,
    headers: dropBodyHeaders(init.headers)
  };
}
async function fetchWithSsrFGuard(params) {
  const defaultFetch = params.fetchImpl ?? globalThis.fetch;
  if (!defaultFetch) throw new Error("fetch is not available");
  const maxRedirects = typeof params.maxRedirects === "number" && Number.isFinite(params.maxRedirects) ? Math.max(0, Math.floor(params.maxRedirects)) : DEFAULT_MAX_REDIRECTS;
  const mode = resolveGuardedFetchMode(params);
  const { signal, cleanup } = (0, _fetchTimeoutDZD6CQL_.n)({
    timeoutMs: params.timeoutMs,
    signal: params.signal
  });
  let released = false;
  const release = async (dispatcher) => {
    if (released) return;
    released = true;
    cleanup();
    await (0, _ssrfDoOclwFS.i)(dispatcher ?? void 0);
  };
  const visited = new Set([params.url]);
  let currentUrl = params.url;
  let currentInit = params.init ? { ...params.init } : void 0;
  let redirectCount = 0;
  while (true) {
    let parsedUrl;
    try {
      parsedUrl = new URL(currentUrl);
    } catch {
      await release();
      throw new Error("Invalid URL: must be http or https");
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      await release();
      throw new Error("Invalid URL: must be http or https");
    }
    let dispatcher = null;
    try {
      const usesTrustedExplicitProxyMode = mode === GUARDED_FETCH_MODE.TRUSTED_EXPLICIT_PROXY && params.dispatcherPolicy?.mode === "explicit-proxy";
      assertExplicitProxySupportsPinnedDns(parsedUrl, params.dispatcherPolicy, usesTrustedExplicitProxyMode ? false : params.pinDns);
      await assertExplicitProxyAllowed(params.dispatcherPolicy, params.lookupFn, params.policy);
      if (mode === GUARDED_FETCH_MODE.TRUSTED_ENV_PROXY && (0, _proxyEnvQIN1SJGt.r)()) dispatcher = (0, _undiciRuntimeC_MCkNOw.n)();else
      if (usesTrustedExplicitProxyMode) {
        (0, _ssrfDoOclwFS.n)(parsedUrl.hostname, params.policy);
        dispatcher = createPolicyDispatcherWithoutPinnedDns(params.dispatcherPolicy);
      } else if (params.pinDns === false) {
        await (0, _ssrfDoOclwFS.h)(parsedUrl.hostname, {
          lookupFn: params.lookupFn,
          policy: params.policy
        });
        dispatcher = createPolicyDispatcherWithoutPinnedDns(params.dispatcherPolicy);
      } else dispatcher = (0, _ssrfDoOclwFS.a)(await (0, _ssrfDoOclwFS.h)(parsedUrl.hostname, {
        lookupFn: params.lookupFn,
        policy: params.policy
      }), params.dispatcherPolicy, params.policy);
      const init = {
        ...(currentInit ? { ...currentInit } : {}),
        redirect: "manual",
        ...(dispatcher ? { dispatcher } : {}),
        ...(signal ? { signal } : {})
      };
      const supportsDispatcherInit = params.fetchImpl !== void 0 && !isAmbientGlobalFetch({
        fetchImpl: params.fetchImpl,
        globalFetch: globalThis.fetch
      }) || isMockedFetch(defaultFetch);
      const response = Boolean(dispatcher) && !supportsDispatcherInit ? await fetchWithRuntimeDispatcher(parsedUrl.toString(), init) : await defaultFetch(parsedUrl.toString(), init);
      if (params.capture !== false) (0, _runtimeCdS7ehWO.t)({
        url: parsedUrl.toString(),
        method: currentInit?.method ?? "GET",
        requestHeaders: currentInit?.headers,
        requestBody: currentInit?.body ?? null,
        response,
        transport: "http",
        flowId: params.capture?.flowId,
        meta: {
          captureOrigin: "guarded-fetch",
          ...(params.auditContext ? { auditContext: params.auditContext } : {}),
          ...params.capture?.meta
        }
      });
      if (isRedirectStatus(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          await release(dispatcher);
          throw new Error(`Redirect missing location header (${response.status})`);
        }
        redirectCount += 1;
        if (redirectCount > maxRedirects) {
          await release(dispatcher);
          throw new Error(`Too many redirects (limit: ${maxRedirects})`);
        }
        const nextParsedUrl = new URL(location, parsedUrl);
        const nextUrl = nextParsedUrl.toString();
        if (visited.has(nextUrl)) {
          await release(dispatcher);
          throw new Error("Redirect loop detected");
        }
        currentInit = rewriteRedirectInitForMethod({
          init: currentInit,
          status: response.status
        });
        if (nextParsedUrl.origin !== parsedUrl.origin) {
          currentInit = rewriteRedirectInitForCrossOrigin({
            init: currentInit,
            allowUnsafeReplay: params.allowCrossOriginUnsafeRedirectReplay === true
          });
          currentInit = retainSafeHeadersForCrossOriginRedirect(currentInit);
        }
        visited.add(nextUrl);
        response.body?.cancel();
        await (0, _ssrfDoOclwFS.i)(dispatcher);
        currentUrl = nextUrl;
        continue;
      }
      return {
        response,
        finalUrl: currentUrl,
        release: async () => release(dispatcher)
      };
    } catch (err) {
      if (err instanceof _ssrfDoOclwFS.t) (0, _loggerBA_TvTc.a)(`security: blocked URL fetch (${params.auditContext ?? "url-fetch"}) target=${parsedUrl.origin}${parsedUrl.pathname} reason=${err.message}`);
      await release(dispatcher);
      throw err;
    }
  }
}
//#endregion /* v9-7986f5ee7d69fc78 */
