"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _channelEntryContract = require("openclaw/plugin-sdk/channel-entry-contract");
//#region extensions/feishu/setup-entry.ts
var setup_entry_default = exports.default = (0, _channelEntryContract.defineBundledChannelSetupEntry)({
  importMetaUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/extensions/feishu/setup-entry.js",
  plugin: {
    specifier: "./api.js",
    exportName: "feishuPlugin"
  },
  secrets: {
    specifier: "./secret-contract-api.js",
    exportName: "channelSecrets"
  }
});
//#endregion /* v9-0279c32dedb6dbcd */
