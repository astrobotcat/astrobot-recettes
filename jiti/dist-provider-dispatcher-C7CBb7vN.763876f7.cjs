"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = exports.n = void 0;var _dispatchJNo_iJw = require("./dispatch-JNo_iJw5.js");
//#region src/auto-reply/reply/provider-dispatcher.ts
const dispatchReplyWithBufferedBlockDispatcher = async (params) => {
  return await (0, _dispatchJNo_iJw.n)({
    ctx: params.ctx,
    cfg: params.cfg,
    dispatcherOptions: params.dispatcherOptions,
    replyResolver: params.replyResolver,
    replyOptions: params.replyOptions
  });
};exports.t = dispatchReplyWithBufferedBlockDispatcher;
const dispatchReplyWithDispatcher = async (params) => {
  return await (0, _dispatchJNo_iJw.r)({
    ctx: params.ctx,
    cfg: params.cfg,
    dispatcherOptions: params.dispatcherOptions,
    replyResolver: params.replyResolver,
    replyOptions: params.replyOptions
  });
};
//#endregion
exports.n = dispatchReplyWithDispatcher; /* v9-03a3c6d776f424cd */
