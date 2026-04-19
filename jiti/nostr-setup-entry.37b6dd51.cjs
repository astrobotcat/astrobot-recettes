"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _channelEntryContract = require("openclaw/plugin-sdk/channel-entry-contract");
//#region extensions/nostr/setup-entry.ts
var setup_entry_default = exports.default = (0, _channelEntryContract.defineBundledChannelSetupEntry)({
  importMetaUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/extensions/nostr/setup-entry.js",
  plugin: {
    specifier: "./api.js",
    exportName: "nostrPlugin"
  }
});
//#endregion /* v9-6472e46b9e6f0a5c */
