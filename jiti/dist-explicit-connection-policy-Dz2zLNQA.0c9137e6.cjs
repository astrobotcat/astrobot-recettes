"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = isGatewayConfigBypassCommandPath;exports.t = canSkipGatewayConfigLoad;var _credentialPlannerCxtmVh4K = require("./credential-planner-CxtmVh4K.js");
require("./credentials-DH-nlrJW.js");
//#region src/gateway/explicit-connection-policy.ts
function hasExplicitGatewayConnectionAuth(auth) {
  return Boolean((0, _credentialPlannerCxtmVh4K.a)(auth?.token) || (0, _credentialPlannerCxtmVh4K.a)(auth?.password));
}
function canSkipGatewayConfigLoad(params) {
  return !params.config && Boolean((0, _credentialPlannerCxtmVh4K.a)(params.urlOverride)) && hasExplicitGatewayConnectionAuth(params.explicitAuth);
}
function isGatewayConfigBypassCommandPath(commandPath) {
  return commandPath[0] === "cron";
}
//#endregion /* v9-96ad0de7aaf920c8 */
