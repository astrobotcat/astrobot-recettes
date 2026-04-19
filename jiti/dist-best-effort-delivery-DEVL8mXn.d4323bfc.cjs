"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = shouldDowngradeDeliveryToSessionOnly;exports.t = resolveExternalBestEffortDeliveryTarget;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
require("./message-channel-core-BIZsQ6dr.js");
//#region src/infra/outbound/best-effort-delivery.ts
function resolveExternalBestEffortDeliveryTarget(params) {
  const normalizedChannel = (0, _messageChannelCBqCPFa_.u)(params.channel);
  const channel = normalizedChannel && (0, _messageChannelCBqCPFa_.s)(normalizedChannel) ? normalizedChannel : void 0;
  const to = (0, _stringCoerceBUSzWgUA.s)(params.to);
  const deliver = Boolean(channel && to);
  return {
    deliver,
    channel: deliver ? channel : void 0,
    to: deliver ? to : void 0,
    accountId: deliver ? (0, _stringCoerceBUSzWgUA.s)(params.accountId) : void 0,
    threadId: deliver && params.threadId != null && params.threadId !== "" ? String(params.threadId) : void 0
  };
}
function shouldDowngradeDeliveryToSessionOnly(params) {
  return params.wantsDelivery && params.bestEffortDeliver && params.resolvedChannel === "webchat";
}
//#endregion /* v9-357b622103d65963 */
