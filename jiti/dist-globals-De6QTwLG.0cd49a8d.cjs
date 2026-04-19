"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = shouldLogVerbose;exports.i = logVerboseConsole;exports.o = exports.n = void 0;exports.r = logVerbose;exports.t = exports.s = void 0;var _loggerD8OnBgBc = require("./logger-D8OnBgBc.js");
var _globalStateLrCGCReA = require("./global-state-LrCGCReA.js");
var _themeD5sxSdHD = require("./theme-D5sxSdHD.js");
//#region src/globals.ts
function shouldLogVerbose() {
  return (0, _globalStateLrCGCReA.t)() || (0, _loggerD8OnBgBc.s)("debug");
}
function logVerbose(message) {
  if (!shouldLogVerbose()) return;
  try {
    (0, _loggerD8OnBgBc.a)().debug({ message }, "verbose");
  } catch {}
  if (!(0, _globalStateLrCGCReA.t)()) return;
  console.log(_themeD5sxSdHD.r.muted(message));
}
function logVerboseConsole(message) {
  if (!(0, _globalStateLrCGCReA.t)()) return;
  console.log(_themeD5sxSdHD.r.muted(message));
}
const success = exports.o = _themeD5sxSdHD.r.success;
const warn = exports.s = _themeD5sxSdHD.r.warn;
const info = exports.n = _themeD5sxSdHD.r.info;
const danger = exports.t = _themeD5sxSdHD.r.error;
//#endregion /* v9-411b0fb6af7eae9e */
