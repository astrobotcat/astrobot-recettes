"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = exports.r = exports.n = void 0;var _themeD5sxSdHD = require("./theme-D5sxSdHD.js");
//#region src/terminal/prompt-style.ts
const stylePromptMessage = (message) => (0, _themeD5sxSdHD.n)() ? _themeD5sxSdHD.r.accent(message) : message;exports.n = stylePromptMessage;
const stylePromptTitle = (title) => title && (0, _themeD5sxSdHD.n)() ? _themeD5sxSdHD.r.heading(title) : title;exports.r = stylePromptTitle;
const stylePromptHint = (hint) => hint && (0, _themeD5sxSdHD.n)() ? _themeD5sxSdHD.r.muted(hint) : hint;
//#endregion
exports.t = stylePromptHint; /* v9-3560b4cf43dbe317 */
