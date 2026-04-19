"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveMainSessionKeyFromConfig;exports.t = extractDeliveryInfo;var _io5pxHCi7V = require("./io-5pxHCi7V.js");
require("./store-DFXcceZJ.js");
var _mainSessionDtefsIzj = require("./main-session-DtefsIzj.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
require("./reset-CkBotYFL.js");
require("./session-key-DhT_3w6M.js");
var _deliveryContextSharedEClQPjt = require("./delivery-context.shared-EClQPjt-.js");
var _storeLoadDjLNEIy = require("./store-load-DjLNEIy9.js");
require("./session-file-B_37cdL1.js");
var _threadInfoDA0w7q1W = require("./thread-info-DA0w7q1W.js");
require("./transcript-BYlhLemN.js");
require("./targets-Cxfatkj9.js");
//#region src/config/sessions/main-session.runtime.ts
function resolveMainSessionKeyFromConfig() {
  return (0, _mainSessionDtefsIzj.i)((0, _io5pxHCi7V.a)());
}
//#endregion
//#region src/config/sessions/delivery-info.ts
function extractDeliveryInfo(sessionKey) {
  const hasRoutableDeliveryContext = (context) => Boolean(context?.channel && context?.to);
  const { baseSessionKey, threadId } = (0, _threadInfoDA0w7q1W.t)(sessionKey);
  if (!sessionKey || !baseSessionKey) return {
    deliveryContext: void 0,
    threadId
  };
  let deliveryContext;
  try {
    const store = (0, _storeLoadDjLNEIy.t)((0, _pathsCZMxg3hs.u)((0, _io5pxHCi7V.a)().session?.store));
    let entry = store[sessionKey];
    let storedDeliveryContext = (0, _deliveryContextSharedEClQPjt.t)(entry);
    if (!hasRoutableDeliveryContext(storedDeliveryContext) && baseSessionKey !== sessionKey) {
      entry = store[baseSessionKey];
      storedDeliveryContext = (0, _deliveryContextSharedEClQPjt.t)(entry);
    }
    if (hasRoutableDeliveryContext(storedDeliveryContext)) deliveryContext = {
      channel: storedDeliveryContext.channel,
      to: storedDeliveryContext.to,
      accountId: storedDeliveryContext.accountId,
      threadId: storedDeliveryContext.threadId != null ? String(storedDeliveryContext.threadId) : void 0
    };
  } catch {}
  return {
    deliveryContext,
    threadId
  };
}
//#endregion /* v9-4c40ec394f13f4ff */
