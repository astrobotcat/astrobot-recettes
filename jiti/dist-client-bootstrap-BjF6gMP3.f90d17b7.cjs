"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveGatewayClientBootstrap;var _connectionDetailsDVKcA1hM = require("./connection-details-DVKcA1hM.js");
var _connectionAuthDpK91pkc = require("./connection-auth-DpK91pkc.js");
//#region src/gateway/client-bootstrap.ts
function resolveGatewayUrlOverrideSource(urlSource) {
  if (urlSource === "cli --url") return "cli";
  if (urlSource === "env OPENCLAW_GATEWAY_URL") return "env";
}
async function resolveGatewayClientBootstrap(params) {
  const connection = (0, _connectionDetailsDVKcA1hM.t)({
    config: params.config,
    url: params.gatewayUrl
  });
  const urlOverrideSource = resolveGatewayUrlOverrideSource(connection.urlSource);
  const auth = await (0, _connectionAuthDpK91pkc.t)({
    config: params.config,
    explicitAuth: params.explicitAuth,
    env: params.env ?? process.env,
    urlOverride: urlOverrideSource ? connection.url : void 0,
    urlOverrideSource
  });
  return {
    url: connection.url,
    urlSource: connection.urlSource,
    auth
  };
}
//#endregion /* v9-df407e17a6b908cb */
