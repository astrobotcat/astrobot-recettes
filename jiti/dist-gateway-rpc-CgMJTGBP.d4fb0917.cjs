"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = callGatewayFromCli;exports.t = addGatewayClientOptions;function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);} //#region src/cli/gateway-rpc.ts
let gatewayRpcRuntimePromise;
async function loadGatewayRpcRuntime() {
  gatewayRpcRuntimePromise ??= Promise.resolve().then(() => jitiImport("./gateway-rpc.runtime-CspmwJWz.js").then((m) => _interopRequireWildcard(m)));
  return gatewayRpcRuntimePromise;
}
function addGatewayClientOptions(cmd) {
  return cmd.option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--timeout <ms>", "Timeout in ms", "30000").option("--expect-final", "Wait for final response (agent)", false);
}
async function callGatewayFromCli(method, opts, params, extra) {
  return await (await loadGatewayRpcRuntime()).callGatewayFromCliRuntime(method, opts, params, extra);
}
//#endregion /* v9-1950566946e2555b */
