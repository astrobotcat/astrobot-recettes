"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveGatewayConnectionAuth;require("./credentials-DH-nlrJW.js");
var _credentialsSecretInputsCW0my3bl = require("./credentials-secret-inputs-CW0my3bl.js");
//#region src/gateway/connection-auth.ts
function toGatewayCredentialOptions(params) {
  return {
    cfg: params.cfg,
    env: params.env,
    explicitAuth: params.explicitAuth,
    urlOverride: params.urlOverride,
    urlOverrideSource: params.urlOverrideSource,
    modeOverride: params.modeOverride,
    localTokenPrecedence: params.localTokenPrecedence,
    localPasswordPrecedence: params.localPasswordPrecedence,
    remoteTokenPrecedence: params.remoteTokenPrecedence,
    remotePasswordPrecedence: params.remotePasswordPrecedence,
    remoteTokenFallback: params.remoteTokenFallback,
    remotePasswordFallback: params.remotePasswordFallback
  };
}
async function resolveGatewayConnectionAuth(params) {
  return await (0, _credentialsSecretInputsCW0my3bl.t)({
    config: params.config,
    ...toGatewayCredentialOptions({
      ...params,
      cfg: params.config
    })
  });
}
//#endregion /* v9-6f635c7ebac92f3a */
