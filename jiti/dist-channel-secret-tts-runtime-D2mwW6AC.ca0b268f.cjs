"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = collectNestedChannelTtsAssignments;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
require("./shared-DLDubI1E.js");
var _runtimeConfigCollectorsTtsBqFxxLyS = require("./runtime-config-collectors-tts-BqFxxLyS.js");
//#region src/secrets/channel-secret-tts-runtime.ts
function collectNestedChannelTtsAssignments(params) {
  const topLevelNested = params.channel[params.nestedKey];
  if ((0, _utilsD5DtWkEu.l)(topLevelNested) && (0, _utilsD5DtWkEu.l)(topLevelNested.tts)) (0, _runtimeConfigCollectorsTtsBqFxxLyS.t)({
    tts: topLevelNested.tts,
    pathPrefix: `channels.${params.channelKey}.${params.nestedKey}.tts`,
    defaults: params.defaults,
    context: params.context,
    active: params.topLevelActive,
    inactiveReason: params.topInactiveReason
  });
  if (!params.surface.hasExplicitAccounts) return;
  for (const entry of params.surface.accounts) {
    const nested = entry.account[params.nestedKey];
    if (!(0, _utilsD5DtWkEu.l)(nested) || !(0, _utilsD5DtWkEu.l)(nested.tts)) continue;
    (0, _runtimeConfigCollectorsTtsBqFxxLyS.t)({
      tts: nested.tts,
      pathPrefix: `channels.${params.channelKey}.accounts.${entry.accountId}.${params.nestedKey}.tts`,
      defaults: params.defaults,
      context: params.context,
      active: params.accountActive(entry),
      inactiveReason: typeof params.accountInactiveReason === "function" ? params.accountInactiveReason(entry) : params.accountInactiveReason
    });
  }
}
//#endregion /* v9-fe09521bf9afc6f0 */
