"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = setReplyPayloadMetadata;exports.t = getReplyPayloadMetadata; //#region src/auto-reply/reply-payload.ts
const replyPayloadMetadata = /* @__PURE__ */new WeakMap();
function setReplyPayloadMetadata(payload, metadata) {
  const previous = replyPayloadMetadata.get(payload);
  replyPayloadMetadata.set(payload, {
    ...previous,
    ...metadata
  });
  return payload;
}
function getReplyPayloadMetadata(payload) {
  return replyPayloadMetadata.get(payload);
}
//#endregion /* v9-e32061df10b11927 */
