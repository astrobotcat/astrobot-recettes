"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = drainReconnectQueue;exports.t = drainPendingDeliveries;require("./errors-D8p6rxH8.js");
require("./tmp-openclaw-dir-eyAoWbVe.js");
require("./env-BiSxzotM.js");
require("./file-lock-BMw37VAn.js");
require("./undici-global-dispatcher-yJO9KyXW.js");
require("./fetch-guard-B3p4gGaY.js");
require("./ssrf-DoOclwFS.js");
require("./exec-approvals-DqhUu-iS.js");
require("./fs-safe-B7mHodgb.js");
require("./proxy-fetch-5deRg8He.js");
var _deliveryQueueCDEI8gW = require("./delivery-queue-CDEI8gW6.js");
require("./system-events-Dq_M0n12.js");
require("./retry-cGVSdz2T.js");
require("./secret-file-BlBf_gtc.js");
require("./http-body-CmkD5yuo.js");
require("./exec-approval-reply-D_dFeWJb.js");
require("./approval-native-runtime-B1-LcwZj.js");
require("./exec-approval-command-display-BXRwRjXB.js");
require("./exec-approval-session-target-bO6xI_Ze.js");
require("./heartbeat-visibility-K-nKdcA-.js");
require("./transport-ready-Dto5g1sj.js");
require("./identity-zKl_6vuv.js");
require("./retry-policy-DOGOeyKz.js");
require("./ssrf-policy-CChtVzhj.js");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/plugin-sdk/infra-runtime.ts
function normalizeWhatsAppReconnectAccountId(accountId) {
  return (accountId ?? "").trim() || "default";
}
const WHATSAPP_NO_LISTENER_ERROR_RE = /No active WhatsApp Web listener/i;
let outboundDeliverRuntimePromise = null;
async function loadOutboundDeliverRuntime() {
  outboundDeliverRuntimePromise ??= Promise.resolve().then(() => jitiImport("./deliver-runtime-C_1KCZF4.js").then((m) => _interopRequireWildcard(m)));
  return await outboundDeliverRuntimePromise;
}
async function drainPendingDeliveries(opts) {
  const deliver = opts.deliver ?? (await loadOutboundDeliverRuntime()).deliverOutboundPayloads;
  await (0, _deliveryQueueCDEI8gW.n)({
    ...opts,
    deliver
  });
}
/**
* @deprecated Prefer plugin-owned reconnect policy wired through
* `drainPendingDeliveries(...)`. This compatibility shim preserves the
* historical public SDK symbol for existing plugin callers.
*/
async function drainReconnectQueue(opts) {
  const normalizedAccountId = normalizeWhatsAppReconnectAccountId(opts.accountId);
  await drainPendingDeliveries({
    drainKey: `whatsapp:${normalizedAccountId}`,
    logLabel: "WhatsApp reconnect drain",
    cfg: opts.cfg,
    log: opts.log,
    stateDir: opts.stateDir,
    deliver: opts.deliver,
    selectEntry: (entry) => ({
      match: entry.channel === "whatsapp" && normalizeWhatsAppReconnectAccountId(entry.accountId) === normalizedAccountId && typeof entry.lastError === "string" && WHATSAPP_NO_LISTENER_ERROR_RE.test(entry.lastError),
      bypassBackoff: true
    })
  });
}
//#endregion /* v9-157c589f58a24c3b */
