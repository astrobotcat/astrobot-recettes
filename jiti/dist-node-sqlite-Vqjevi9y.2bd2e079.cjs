"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = requireNodeSqlite;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _warningFilterDGa1PXl = require("./warning-filter-DGa1PXl5.js");
var _nodeModule = require("node:module");
//#region src/infra/node-sqlite.ts
const _require = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/node-sqlite-Vqjevi9y.js");
function requireNodeSqlite() {
  (0, _warningFilterDGa1PXl.t)();
  try {
    return _require("node:sqlite");
  } catch (err) {
    const message = (0, _errorsD8p6rxH.i)(err);
    throw new Error(`SQLite support is unavailable in this Node runtime (missing node:sqlite). ${message}`, { cause: err });
  }
}
//#endregion /* v9-9c52bc379a607633 */
