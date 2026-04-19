"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = inspectReadOnlyChannelAccount;var _bundledCGMeVzvo = require("./bundled-CGMeVzvo.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
//#region src/channels/read-only-account-inspect.ts
async function inspectReadOnlyChannelAccount(params) {
  const inspectAccount = (0, _registryDelpa74L.n)(params.channelId)?.config.inspectAccount ?? (0, _bundledCGMeVzvo.t)(params.channelId);
  if (!inspectAccount) return null;
  return await Promise.resolve(inspectAccount(params.cfg, params.accountId));
}
//#endregion /* v9-c45abad8cb564418 */
