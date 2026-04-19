"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = collectTtsApiKeyAssignments;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
require("./shared-DLDubI1E.js");
var _runtimeSharedWlb0YE2R = require("./runtime-shared-Wlb0YE2R.js");
//#region src/secrets/runtime-config-collectors-tts.ts
function collectProviderApiKeyAssignment(params) {
  (0, _runtimeSharedWlb0YE2R.n)({
    value: params.providerConfig.apiKey,
    path: `${params.pathPrefix}.providers.${params.providerId}.apiKey`,
    expected: "string",
    defaults: params.defaults,
    context: params.context,
    active: params.active,
    inactiveReason: params.inactiveReason,
    apply: (value) => {
      params.providerConfig.apiKey = value;
    }
  });
}
function collectTtsApiKeyAssignments(params) {
  const providers = params.tts.providers;
  if ((0, _utilsD5DtWkEu.l)(providers)) {
    for (const [providerId, providerConfig] of Object.entries(providers)) {
      if (!(0, _utilsD5DtWkEu.l)(providerConfig)) continue;
      collectProviderApiKeyAssignment({
        providerId,
        providerConfig,
        pathPrefix: params.pathPrefix,
        defaults: params.defaults,
        context: params.context,
        active: params.active,
        inactiveReason: params.inactiveReason
      });
    }
    return;
  }
}
//#endregion /* v9-85610ba5aa0d76b7 */
