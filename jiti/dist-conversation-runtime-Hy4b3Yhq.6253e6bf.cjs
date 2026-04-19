"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = recordInboundSessionMetaSafe;require("./session-binding-service-CP3mZirT.js");
require("./binding-registry-ebIwre-S.js");
require("./conversation-binding-COoBmA8F.js");
require("./session-CHI_eL18.js");
require("./pairing-store-C_d7unmE.js");
require("./dm-policy-shared-B7IvP1oD.js");
require("./binding-targets-xmalh8ui.js");
require("./binding-routing-DXUukGe4.js");
require("./thread-bindings-policy-BdnKXnQj.js");
require("./pairing-labels-BNRiD4Up.js");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/channels/session-meta.ts
let inboundSessionRuntimePromise = null;
function loadInboundSessionRuntime() {
  inboundSessionRuntimePromise ??= Promise.resolve().then(() => jitiImport("./inbound.runtime-DLlKRcSc.js").then((m) => _interopRequireWildcard(m)));
  return inboundSessionRuntimePromise;
}
async function recordInboundSessionMetaSafe(params) {
  const runtime = await loadInboundSessionRuntime();
  const storePath = runtime.resolveStorePath(params.cfg.session?.store, { agentId: params.agentId });
  try {
    await runtime.recordSessionMetaFromInbound({
      storePath,
      sessionKey: params.sessionKey,
      ctx: params.ctx
    });
  } catch (err) {
    params.onError?.(err);
  }
}
//#endregion /* v9-6453006632727b58 */
