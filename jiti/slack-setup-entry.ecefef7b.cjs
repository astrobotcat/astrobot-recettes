"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _channelEntryContract = require("openclaw/plugin-sdk/channel-entry-contract");
//#region extensions/slack/setup-entry.ts
var setup_entry_default = exports.default = (0, _channelEntryContract.defineBundledChannelSetupEntry)({
  importMetaUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/extensions/slack/setup-entry.js",
  plugin: {
    specifier: "./setup-plugin-api.js",
    exportName: "slackSetupPlugin"
  },
  secrets: {
    specifier: "./secret-contract-api.js",
    exportName: "channelSecrets"
  }
});
//#endregion /* v9-f1dfec2b081ccadb */
