"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveChannelRemoteInboundAttachmentRoots;exports.t = resolveChannelInboundAttachmentRoots;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _bootstrapRegistryBI6Zdzz = require("./bootstrap-registry-BI6Zdzz5.js");
//#region src/media/channel-inbound-roots.ts
function findChannelMessagingAdapter(channelId) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(channelId);
  if (!normalized) return;
  return (0, _bootstrapRegistryBI6Zdzz.t)(normalized)?.messaging;
}
function resolveChannelInboundAttachmentRoots(params) {
  return findChannelMessagingAdapter(params.ctx.Surface ?? params.ctx.Provider)?.resolveInboundAttachmentRoots?.({
    cfg: params.cfg,
    accountId: params.ctx.AccountId
  });
}
function resolveChannelRemoteInboundAttachmentRoots(params) {
  return findChannelMessagingAdapter(params.ctx.Surface ?? params.ctx.Provider)?.resolveRemoteInboundAttachmentRoots?.({
    cfg: params.cfg,
    accountId: params.ctx.AccountId
  });
}
//#endregion /* v9-14977ac8806338e6 */
