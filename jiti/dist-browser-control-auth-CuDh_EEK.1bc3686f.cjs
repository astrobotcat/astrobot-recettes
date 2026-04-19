"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveBrowserControlAuth;exports.r = shouldAutoGenerateBrowserAuth;exports.t = ensureBrowserControlAuth;var _facadeLoaderCGu7k8Om = require("./facade-loader-CGu7k8Om.js");
//#region src/plugin-sdk/browser-control-auth.ts
function loadBrowserControlAuthSurface() {
  return (0, _facadeLoaderCGu7k8Om.i)({
    dirName: "browser",
    artifactBasename: "browser-control-auth.js"
  });
}
function resolveBrowserControlAuth(cfg, env = process.env) {
  return loadBrowserControlAuthSurface().resolveBrowserControlAuth(cfg, env);
}
function shouldAutoGenerateBrowserAuth(env) {
  return loadBrowserControlAuthSurface().shouldAutoGenerateBrowserAuth(env);
}
async function ensureBrowserControlAuth(params) {
  return await loadBrowserControlAuthSurface().ensureBrowserControlAuth(params);
}
//#endregion /* v9-859155010d93059f */
