"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = issuePairingChallenge;var _pairingMessages_8WsWs = require("./pairing-messages-_8Ws-ws8.js");
//#region src/pairing/pairing-challenge.ts
/**
* Shared pairing challenge issuance for DM pairing policy pathways.
* Ensures every channel follows the same create-if-missing + reply flow.
*/
async function issuePairingChallenge(params) {
  const { code, created } = await params.upsertPairingRequest({
    id: params.senderId,
    meta: params.meta
  });
  if (!created) return { created: false };
  params.onCreated?.({ code });
  const replyText = params.buildReplyText?.({
    code,
    senderIdLine: params.senderIdLine
  }) ?? (0, _pairingMessages_8WsWs.t)({
    channel: params.channel,
    idLine: params.senderIdLine,
    code
  });
  try {
    await params.sendPairingReply(replyText);
  } catch (err) {
    params.onReplyError?.(err);
  }
  return {
    created: true,
    code
  };
}
//#endregion /* v9-2078623b2026bbb7 */
