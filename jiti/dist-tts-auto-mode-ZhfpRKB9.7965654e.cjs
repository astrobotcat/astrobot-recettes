"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = normalizeTtsAutoMode;exports.t = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/tts/tts-auto-mode.ts
const TTS_AUTO_MODES = exports.t = new Set([
"off",
"always",
"inbound",
"tagged"]
);
function normalizeTtsAutoMode(value) {
  if (typeof value !== "string") return;
  const normalized = (0, _stringCoerceBUSzWgUA.o)(value);
  if (TTS_AUTO_MODES.has(normalized)) return normalized;
}
//#endregion /* v9-d6c7e2d04ce9c175 */
