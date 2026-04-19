"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveTelegramPreviewStreamMode;var _channelStreaming = require("openclaw/plugin-sdk/channel-streaming");
//#region extensions/telegram/src/preview-streaming.ts
function resolveTelegramPreviewStreamMode(params = {}) {
  return (0, _channelStreaming.resolveChannelPreviewStreamMode)(params, "partial");
}
//#endregion /* v9-b69bf2c3d3559172 */
