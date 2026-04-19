"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = logInboundDrop;exports.r = logTypingFailure;exports.t = logAckFailure; //#region src/channels/logging.ts
function logInboundDrop(params) {
  const target = params.target ? ` target=${params.target}` : "";
  params.log(`${params.channel}: drop ${params.reason}${target}`);
}
function logTypingFailure(params) {
  const target = params.target ? ` target=${params.target}` : "";
  const action = params.action ? ` action=${params.action}` : "";
  params.log(`${params.channel} typing${action} failed${target}: ${String(params.error)}`);
}
function logAckFailure(params) {
  const target = params.target ? ` target=${params.target}` : "";
  params.log(`${params.channel} ack cleanup failed${target}: ${String(params.error)}`);
}
//#endregion /* v9-0fb968e07b2b78df */
