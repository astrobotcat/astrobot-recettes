"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = generatePkceVerifierChallenge;exports.r = toFormUrlEncoded;exports.t = isProviderApiKeyConfigured;require("./types.secrets-CeL3gSMO.js");
require("./ref-contract-B0QmVSlT.js");
require("./provider-env-vars-Sj-BhOn9.js");
var _storeC1I9Mkh = require("./store-C1I9Mkh8.js");
require("./model-auth-markers-ve-OgG6R.js");
var _modelAuthEnvB45Q6PX = require("./model-auth-env-B-45Q6PX.js");
require("./models-config.providers.secrets-ClAqHxSG.js");
var _profilesCVErLX2C = require("./profiles-CVErLX2C.js");
require("./repair-taA0zK8p.js");
require("./provider-auth-input-fye6IC_1.js");
require("./provider-auth-helpers-DKL5bJRR.js");
require("./provider-api-key-auth-nkL4zxbI.js");
var _nodeCrypto = require("node:crypto");
//#region src/plugin-sdk/oauth-utils.ts
/** Encode a flat object as application/x-www-form-urlencoded form data. */
function toFormUrlEncoded(data) {
  return Object.entries(data).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
}
/** Generate a PKCE verifier/challenge pair suitable for OAuth authorization flows. */
function generatePkceVerifierChallenge() {
  const verifier = (0, _nodeCrypto.randomBytes)(32).toString("base64url");
  return {
    verifier,
    challenge: (0, _nodeCrypto.createHash)("sha256").update(verifier).digest("base64url")
  };
}
//#endregion
//#region src/plugin-sdk/provider-auth.ts
function isProviderApiKeyConfigured(params) {
  if ((0, _modelAuthEnvB45Q6PX.t)(params.provider)?.apiKey) return true;
  const agentDir = params.agentDir?.trim();
  if (!agentDir) return false;
  return (0, _profilesCVErLX2C.n)((0, _storeC1I9Mkh.n)(agentDir, { allowKeychainPrompt: false }), params.provider).length > 0;
}
//#endregion /* v9-59af525c192aada6 */
