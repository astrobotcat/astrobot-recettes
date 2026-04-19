"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveChannelMediaMaxBytes;var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
//#region src/channels/plugins/media-limits.ts
const MB = 1024 * 1024;
function resolveChannelMediaMaxBytes(params) {
  const accountId = (0, _accountIdJ7GeQlaZ.n)(params.accountId);
  const channelLimit = params.resolveChannelLimitMb({
    cfg: params.cfg,
    accountId
  });
  if (channelLimit) return channelLimit * MB;
  if (params.cfg.agents?.defaults?.mediaMaxMb) return params.cfg.agents.defaults.mediaMaxMb * MB;
}
//#endregion /* v9-db301f9dd1b8d6ab */
