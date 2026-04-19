"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = void 0;exports.c = resolveBrowserConfig;exports.i = void 0;exports.l = resolveProfile;exports.t = exports.s = exports.r = exports.o = exports.n = void 0;var _tmpOpenclawDirEyAoWbVe = require("./tmp-openclaw-dir-eyAoWbVe.js");
var _facadeLoaderCGu7k8Om = require("./facade-loader-CGu7k8Om.js");
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugin-sdk/browser-profiles.ts
const DEFAULT_OPENCLAW_BROWSER_ENABLED = exports.a = true;
const DEFAULT_BROWSER_EVALUATE_ENABLED = exports.r = true;
const DEFAULT_OPENCLAW_BROWSER_COLOR = exports.i = "#FF4500";
const DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME = exports.o = "openclaw";
const DEFAULT_BROWSER_DEFAULT_PROFILE_NAME = exports.n = "openclaw";
const DEFAULT_AI_SNAPSHOT_MAX_CHARS = exports.t = 8e4;
const DEFAULT_UPLOAD_DIR = exports.s = _nodePath.default.join((0, _tmpOpenclawDirEyAoWbVe.n)(), "uploads");
function loadBrowserProfilesSurface() {
  return (0, _facadeLoaderCGu7k8Om.i)({
    dirName: "browser",
    artifactBasename: "browser-profiles.js"
  });
}
function resolveBrowserConfig(cfg, rootConfig) {
  return loadBrowserProfilesSurface().resolveBrowserConfig(cfg, rootConfig);
}
function resolveProfile(resolved, profileName) {
  return loadBrowserProfilesSurface().resolveProfile(resolved, profileName);
}
//#endregion /* v9-3fe757734eeccd7e */
