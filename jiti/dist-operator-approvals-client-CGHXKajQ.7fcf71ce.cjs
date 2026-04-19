"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = withOperatorApprovalsGatewayClient;exports.t = createOperatorApprovalsGatewayClient;var _clientDkWAat_P = require("./client-DkWAat_P.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
var _clientBootstrapBjF6gMP = require("./client-bootstrap-BjF6gMP3.js");
//#region src/gateway/operator-approvals-client.ts
async function createOperatorApprovalsGatewayClient(params) {
  const bootstrap = await (0, _clientBootstrapBjF6gMP.t)({
    config: params.config,
    gatewayUrl: params.gatewayUrl,
    env: process.env
  });
  return new _clientDkWAat_P.t({
    url: bootstrap.url,
    token: bootstrap.auth.token,
    password: bootstrap.auth.password,
    clientName: _messageChannelCBqCPFa_.g.GATEWAY_CLIENT,
    clientDisplayName: params.clientDisplayName,
    mode: _messageChannelCBqCPFa_.h.BACKEND,
    scopes: ["operator.approvals"],
    onEvent: params.onEvent,
    onHelloOk: params.onHelloOk,
    onConnectError: params.onConnectError,
    onClose: params.onClose
  });
}
async function withOperatorApprovalsGatewayClient(params, run) {
  let readySettled = false;
  let resolveReady;
  let rejectReady;
  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  const markReady = () => {
    if (readySettled) return;
    readySettled = true;
    resolveReady();
  };
  const failReady = (err) => {
    if (readySettled) return;
    readySettled = true;
    rejectReady(err);
  };
  const gatewayClient = await createOperatorApprovalsGatewayClient({
    config: params.config,
    gatewayUrl: params.gatewayUrl,
    clientDisplayName: params.clientDisplayName,
    onHelloOk: () => {
      markReady();
    },
    onConnectError: (err) => {
      failReady(err);
    },
    onClose: (code, reason) => {
      failReady(/* @__PURE__ */new Error(`gateway closed (${code}): ${reason}`));
    }
  });
  try {
    gatewayClient.start();
    await ready;
    return await run(gatewayClient);
  } finally {
    await gatewayClient.stopAndWait().catch(() => {
      gatewayClient.stop();
    });
  }
}
//#endregion /* v9-6ed2eab4abc4f3b6 */
