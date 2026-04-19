"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveInboundSessionEnvelopeContext;var _storeDFXcceZJ = require("./store-DFXcceZJ.js");
require("./sessions-vP2E4vs-.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
var _envelopeB1SOAhzt = require("./envelope-B1SOAhzt.js");
//#region src/channels/session-envelope.ts
function resolveInboundSessionEnvelopeContext(params) {
  const storePath = (0, _pathsCZMxg3hs.u)(params.cfg.session?.store, { agentId: params.agentId });
  return {
    storePath,
    envelopeOptions: (0, _envelopeB1SOAhzt.a)(params.cfg),
    previousTimestamp: (0, _storeDFXcceZJ.r)({
      storePath,
      sessionKey: params.sessionKey
    })
  };
}
//#endregion /* v9-6a500d221001482b */
