"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = exports.n = void 0;var _runtimeStore = require("openclaw/plugin-sdk/runtime-store");
//#region extensions/telegram/src/runtime.ts
const { setRuntime: setTelegramRuntime, clearRuntime: clearTelegramRuntime, getRuntime: getTelegramRuntime } = (0, _runtimeStore.createPluginRuntimeStore)({
  pluginId: "telegram",
  errorMessage: "Telegram runtime not initialized"
});
//#endregion
exports.t = getTelegramRuntime;exports.n = setTelegramRuntime; /* v9-7b0f5d819993a465 */
