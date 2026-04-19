"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = createEmptyChannelResult;exports.i = createAttachedChannelResultAdapter;exports.n = attachChannelToResults;exports.o = createRawChannelSendResultAdapter;exports.r = buildChannelSendResult;exports.t = attachChannelToResult; //#region src/plugin-sdk/channel-send-result.ts
function attachChannelToResult(channel, result) {
  return {
    channel,
    ...result
  };
}
function attachChannelToResults(channel, results) {
  return results.map((result) => attachChannelToResult(channel, result));
}
function createEmptyChannelResult(channel, result = {}) {
  return attachChannelToResult(channel, {
    messageId: "",
    ...result
  });
}
function createAttachedChannelResultAdapter(params) {
  return {
    sendText: params.sendText ? async (ctx) => attachChannelToResult(params.channel, await params.sendText(ctx)) : void 0,
    sendMedia: params.sendMedia ? async (ctx) => attachChannelToResult(params.channel, await params.sendMedia(ctx)) : void 0,
    sendPoll: params.sendPoll ? async (ctx) => attachChannelToResult(params.channel, await params.sendPoll(ctx)) : void 0
  };
}
function createRawChannelSendResultAdapter(params) {
  return {
    sendText: params.sendText ? async (ctx) => buildChannelSendResult(params.channel, await params.sendText(ctx)) : void 0,
    sendMedia: params.sendMedia ? async (ctx) => buildChannelSendResult(params.channel, await params.sendMedia(ctx)) : void 0
  };
}
/** Normalize raw channel send results into the shape shared outbound callers expect. */
function buildChannelSendResult(channel, result) {
  return {
    channel,
    ok: result.ok,
    messageId: result.messageId ?? "",
    error: result.error ? new Error(result.error) : void 0
  };
}
//#endregion /* v9-9a9f24dbab7f013a */
