"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resetGlobalUndiciStreamTimeoutsForTests;exports.n = ensureGlobalUndiciEnvProxyDispatcher;exports.r = ensureGlobalUndiciStreamTimeouts;exports.t = void 0;var _wslDlWsqZ4r = require("./wsl-DlWsqZ4r.js");
var _proxyEnvQIN1SJGt = require("./proxy-env-qIN1SJGt.js");
var net$1 = _interopRequireWildcard(require("node:net"));
var _undici = require("undici");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/infra/net/undici-global-dispatcher.ts
const DEFAULT_UNDICI_STREAM_TIMEOUT_MS = exports.t = 1800 * 1e3;
const AUTO_SELECT_FAMILY_ATTEMPT_TIMEOUT_MS = 300;
let lastAppliedTimeoutKey = null;
let lastAppliedProxyBootstrap = false;
function resolveDispatcherKind(dispatcher) {
  const ctorName = dispatcher?.constructor?.name;
  if (typeof ctorName !== "string" || ctorName.length === 0) return "unsupported";
  if (ctorName.includes("EnvHttpProxyAgent")) return "env-proxy";
  if (ctorName.includes("ProxyAgent")) return "unsupported";
  if (ctorName.includes("Agent")) return "agent";
  return "unsupported";
}
function resolveAutoSelectFamily() {
  if (typeof net$1.getDefaultAutoSelectFamily !== "function") return;
  try {
    const systemDefault = net$1.getDefaultAutoSelectFamily();
    if (systemDefault && (0, _wslDlWsqZ4r.n)()) return false;
    return systemDefault;
  } catch {
    return;
  }
}
function resolveConnectOptions(autoSelectFamily) {
  if (autoSelectFamily === void 0) return;
  return {
    autoSelectFamily,
    autoSelectFamilyAttemptTimeout: AUTO_SELECT_FAMILY_ATTEMPT_TIMEOUT_MS
  };
}
function resolveDispatcherKey(params) {
  const autoSelectToken = params.autoSelectFamily === void 0 ? "na" : params.autoSelectFamily ? "on" : "off";
  return `${params.kind}:${params.timeoutMs}:${autoSelectToken}`;
}
function resolveCurrentDispatcherKind() {
  let dispatcher;
  try {
    dispatcher = (0, _undici.getGlobalDispatcher)();
  } catch {
    return null;
  }
  const currentKind = resolveDispatcherKind(dispatcher);
  return currentKind === "unsupported" ? null : currentKind;
}
function ensureGlobalUndiciEnvProxyDispatcher() {
  if (!(0, _proxyEnvQIN1SJGt.n)("https")) return;
  if (lastAppliedProxyBootstrap) {
    if (resolveCurrentDispatcherKind() === "env-proxy") return;
    lastAppliedProxyBootstrap = false;
  }
  const currentKind = resolveCurrentDispatcherKind();
  if (currentKind === null) return;
  if (currentKind === "env-proxy") {
    lastAppliedProxyBootstrap = true;
    return;
  }
  try {
    (0, _undici.setGlobalDispatcher)(new _undici.EnvHttpProxyAgent());
    lastAppliedProxyBootstrap = true;
  } catch {}
}
function ensureGlobalUndiciStreamTimeouts(opts) {
  const timeoutMsRaw = opts?.timeoutMs ?? 18e5;
  const timeoutMs = Math.max(1, Math.floor(timeoutMsRaw));
  if (!Number.isFinite(timeoutMsRaw)) return;
  const kind = resolveCurrentDispatcherKind();
  if (kind === null) return;
  const autoSelectFamily = resolveAutoSelectFamily();
  const nextKey = resolveDispatcherKey({
    kind,
    timeoutMs,
    autoSelectFamily
  });
  if (lastAppliedTimeoutKey === nextKey) return;
  const connect = resolveConnectOptions(autoSelectFamily);
  try {
    if (kind === "env-proxy") (0, _undici.setGlobalDispatcher)(new _undici.EnvHttpProxyAgent({
      bodyTimeout: timeoutMs,
      headersTimeout: timeoutMs,
      ...(connect ? { connect } : {})
    }));else
    (0, _undici.setGlobalDispatcher)(new _undici.Agent({
      bodyTimeout: timeoutMs,
      headersTimeout: timeoutMs,
      ...(connect ? { connect } : {})
    }));
    lastAppliedTimeoutKey = nextKey;
  } catch {}
}
function resetGlobalUndiciStreamTimeoutsForTests() {
  lastAppliedTimeoutKey = null;
  lastAppliedProxyBootstrap = false;
}
//#endregion /* v9-bbd0e35bf634f7ed */
