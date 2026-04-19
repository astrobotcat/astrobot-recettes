"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _channelEntryContract = require("openclaw/plugin-sdk/channel-entry-contract");
//#region extensions/matrix/setup-entry.ts
var setup_entry_default = exports.default = (0, _channelEntryContract.defineBundledChannelSetupEntry)({
  importMetaUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/extensions/matrix/setup-entry.js",
  plugin: {
    specifier: "./channel-plugin-api.js",
    exportName: "matrixPlugin"
  },
  secrets: {
    specifier: "./secret-contract-api.js",
    exportName: "channelSecrets"
  },
  runtime: {
    specifier: "./runtime-api.js",
    exportName: "setMatrixRuntime"
  }
});
//#endregion /* v9-2d4cc1cc0f546a1d */
