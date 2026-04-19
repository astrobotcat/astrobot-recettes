"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = recordInboundSessionAndDispatchReply;exports.n = dispatchInboundReplyWithBase;exports.r = dispatchReplyFromConfigWithSettledDispatcher;exports.t = buildInboundReplyDispatchBase;var _replyPayloadDb_8BQiX = require("./reply-payload-Db_8BQiX.js");
var _dispatchJNo_iJw = require("./dispatch-JNo_iJw5.js");
var _channelReplyPipelineDHFpjrzi = require("./channel-reply-pipeline-DHFpjrzi.js");
//#region src/plugin-sdk/inbound-reply-dispatch.ts
/** Run `dispatchReplyFromConfig` with a dispatcher that always gets its settled callback. */
async function dispatchReplyFromConfigWithSettledDispatcher(params) {
  return await (0, _dispatchJNo_iJw.l)({
    dispatcher: params.dispatcher,
    onSettled: params.onSettled,
    run: () => (0, _dispatchJNo_iJw.s)({
      ctx: params.ctxPayload,
      cfg: params.cfg,
      dispatcher: params.dispatcher,
      replyOptions: params.replyOptions,
      configOverride: params.configOverride
    })
  });
}
/** Assemble the common inbound reply dispatch dependencies for a resolved route. */
function buildInboundReplyDispatchBase(params) {
  return {
    cfg: params.cfg,
    channel: params.channel,
    accountId: params.accountId,
    agentId: params.route.agentId,
    routeSessionKey: params.route.sessionKey,
    storePath: params.storePath,
    ctxPayload: params.ctxPayload,
    recordInboundSession: params.core.channel.session.recordInboundSession,
    dispatchReplyWithBufferedBlockDispatcher: params.core.channel.reply.dispatchReplyWithBufferedBlockDispatcher
  };
}
/** Resolve the shared dispatch base and immediately record + dispatch one inbound reply turn. */
async function dispatchInboundReplyWithBase(params) {
  await recordInboundSessionAndDispatchReply({
    ...buildInboundReplyDispatchBase(params),
    deliver: params.deliver,
    onRecordError: params.onRecordError,
    onDispatchError: params.onDispatchError,
    replyOptions: params.replyOptions
  });
}
/** Record the inbound session first, then dispatch the reply using normalized outbound delivery. */
async function recordInboundSessionAndDispatchReply(params) {
  await params.recordInboundSession({
    storePath: params.storePath,
    sessionKey: params.ctxPayload.SessionKey ?? params.routeSessionKey,
    ctx: params.ctxPayload,
    onRecordError: params.onRecordError
  });
  const { onModelSelected, ...replyPipeline } = (0, _channelReplyPipelineDHFpjrzi.t)({
    cfg: params.cfg,
    agentId: params.agentId,
    channel: params.channel,
    accountId: params.accountId
  });
  const deliver = (0, _replyPayloadDb_8BQiX.n)(params.deliver);
  await params.dispatchReplyWithBufferedBlockDispatcher({
    ctx: params.ctxPayload,
    cfg: params.cfg,
    dispatcherOptions: {
      ...replyPipeline,
      deliver,
      onError: params.onDispatchError
    },
    replyOptions: {
      ...params.replyOptions,
      onModelSelected
    }
  });
}
//#endregion /* v9-34b37b6197a8ef77 */
