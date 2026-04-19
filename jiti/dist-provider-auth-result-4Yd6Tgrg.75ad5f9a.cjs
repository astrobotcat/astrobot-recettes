"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = buildOauthProviderAuthResult;var _identityDWKLr7xb = require("./identity-DWKLr7xb.js");
//#region src/plugin-sdk/provider-auth-result.ts
/** Build the standard auth result payload for OAuth-style provider login flows. */
function buildOauthProviderAuthResult(params) {
  const email = params.email ?? void 0;
  const displayName = params.displayName ?? void 0;
  return {
    profiles: [{
      profileId: (0, _identityDWKLr7xb.t)({
        providerId: params.providerId,
        profilePrefix: params.profilePrefix,
        profileName: params.profileName ?? email
      }),
      credential: {
        type: "oauth",
        provider: params.providerId,
        access: params.access,
        ...(params.refresh ? { refresh: params.refresh } : {}),
        ...(Number.isFinite(params.expires) ? { expires: params.expires } : {}),
        ...(email ? { email } : {}),
        ...(displayName ? { displayName } : {}),
        ...params.credentialExtra
      }
    }],
    configPatch: params.configPatch ?? { agents: { defaults: { models: { [params.defaultModel]: {} } } } },
    defaultModel: params.defaultModel,
    notes: params.notes
  };
}
//#endregion /* v9-4c2dbebc05517936 */
