"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _channelEntryContract = require("openclaw/plugin-sdk/channel-entry-contract");
//#region extensions/qqbot/setup-entry.ts
var setup_entry_default = exports.default = (0, _channelEntryContract.defineBundledChannelSetupEntry)({
  importMetaUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/extensions/qqbot/setup-entry.js",
  plugin: {
    specifier: "./api.js",
    exportName: "qqbotSetupPlugin"
  }
});
//#endregion /* v9-bca4af88f35297c2 */
