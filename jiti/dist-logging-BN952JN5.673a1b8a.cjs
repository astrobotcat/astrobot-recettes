"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = logConfigUpdated;exports.t = formatConfigPath;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
//#region src/config/logging.ts
function formatConfigPath(path = (0, _io5pxHCi7V.r)().configPath) {
  return (0, _utilsD5DtWkEu.a)(path);
}
function logConfigUpdated(runtime, opts = {}) {
  const path = formatConfigPath(opts.path ?? (0, _io5pxHCi7V.r)().configPath);
  const suffix = opts.suffix ? ` ${opts.suffix}` : "";
  runtime.log(`Updated ${path}${suffix}`);
}
//#endregion /* v9-9e94423a765e0e9e */
