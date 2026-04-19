"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = buildOutboundBaseSessionKey;var _resolveRouteByaGTmFk = require("./resolve-route-ByaGTmFk.js");
//#region src/infra/outbound/base-session-key.ts
function buildOutboundBaseSessionKey(params) {
  return (0, _resolveRouteByaGTmFk.t)({
    agentId: params.agentId,
    channel: params.channel,
    accountId: params.accountId,
    peer: params.peer,
    dmScope: params.cfg.session?.dmScope ?? "main",
    identityLinks: params.cfg.session?.identityLinks
  });
}
//#endregion /* v9-998bcc340131f77d */
