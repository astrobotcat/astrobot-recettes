"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _channelEntryContract = require("openclaw/plugin-sdk/channel-entry-contract");
//#region extensions/whatsapp/setup-entry.ts
var setup_entry_default = exports.default = (0, _channelEntryContract.defineBundledChannelSetupEntry)({
  importMetaUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/extensions/whatsapp/setup-entry.js",
  features: {
    legacyStateMigrations: true,
    legacySessionSurfaces: true
  },
  plugin: {
    specifier: "./setup-plugin-api.js",
    exportName: "whatsappSetupPlugin"
  }
});
//#endregion /* v9-3af0e3038c459a9a */
