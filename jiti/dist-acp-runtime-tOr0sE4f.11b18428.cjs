"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = tryDispatchAcpReplyHook;exports.t = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
require("./errors-DrSVrMCJ.js");
var _managerCECGVjs = require("./manager-CECGVjs9.js");
require("./session-meta-D-nDObzR.js");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/plugin-sdk/acp-runtime.ts
let dispatchAcpRuntimePromise = null;
function loadDispatchAcpRuntime() {
  dispatchAcpRuntimePromise ??= Promise.resolve().then(() => jitiImport("./dispatch-acp.runtime-BzY8YWMn.js").then((m) => _interopRequireWildcard(m)));
  return dispatchAcpRuntimePromise;
}
function hasExplicitCommandCandidate(ctx) {
  if ((0, _stringCoerceBUSzWgUA.s)(ctx.CommandBody)) return true;
  const normalized = (0, _stringCoerceBUSzWgUA.s)(ctx.BodyForCommands);
  if (!normalized) return false;
  return normalized.startsWith("!") || normalized.startsWith("/");
}
async function tryDispatchAcpReplyHook(event, ctx) {
  if (event.sendPolicy === "deny" && !event.suppressUserDelivery && !hasExplicitCommandCandidate(event.ctx) && !event.isTailDispatch) return;
  const runtime = await loadDispatchAcpRuntime();
  const bypassForCommand = await runtime.shouldBypassAcpDispatchForCommand(event.ctx, ctx.cfg);
  if (event.sendPolicy === "deny" && !event.suppressUserDelivery && !bypassForCommand && !event.isTailDispatch) return;
  const result = await runtime.tryDispatchAcpReply({
    ctx: event.ctx,
    cfg: ctx.cfg,
    dispatcher: ctx.dispatcher,
    runId: event.runId,
    sessionKey: event.sessionKey,
    abortSignal: ctx.abortSignal,
    inboundAudio: event.inboundAudio,
    sessionTtsAuto: event.sessionTtsAuto,
    ttsChannel: event.ttsChannel,
    suppressUserDelivery: event.suppressUserDelivery,
    shouldRouteToOriginating: event.shouldRouteToOriginating,
    originatingChannel: event.originatingChannel,
    originatingTo: event.originatingTo,
    shouldSendToolSummaries: event.shouldSendToolSummaries,
    bypassForCommand,
    onReplyStart: ctx.onReplyStart,
    recordProcessed: ctx.recordProcessed,
    markIdle: ctx.markIdle
  });
  if (!result) return;
  return {
    handled: true,
    queuedFinal: result.queuedFinal,
    counts: result.counts
  };
}
const __testing = exports.t = new Proxy({}, {
  get(_target, prop, receiver) {
    if (Reflect.has(_managerCECGVjs.t, prop)) return Reflect.get(_managerCECGVjs.t, prop, receiver);
    return Reflect.get(_managerCECGVjs.r, prop, receiver);
  },
  has(_target, prop) {
    return Reflect.has(_managerCECGVjs.t, prop) || Reflect.has(_managerCECGVjs.r, prop);
  },
  ownKeys() {
    return Array.from(new Set([...Reflect.ownKeys(_managerCECGVjs.t), ...Reflect.ownKeys(_managerCECGVjs.r)]));
  },
  getOwnPropertyDescriptor(_target, prop) {
    if (Reflect.has(_managerCECGVjs.t, prop) || Reflect.has(_managerCECGVjs.r, prop)) return {
      configurable: true,
      enumerable: true
    };
  }
});
//#endregion /* v9-75b37a9bc9163793 */
