"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _channelEntryContract = require("openclaw/plugin-sdk/channel-entry-contract");
//#region extensions/discord/setup-entry.ts
var setup_entry_default = exports.default = (0, _channelEntryContract.defineBundledChannelSetupEntry)({
  importMetaUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/extensions/discord/setup-entry.js",
  plugin: {
    specifier: "./setup-plugin-api.js",
    exportName: "discordSetupPlugin"
  }
});
//#endregion /* v9-ad5d5f6e04f60d8c */
