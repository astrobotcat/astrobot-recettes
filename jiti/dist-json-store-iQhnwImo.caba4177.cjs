"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = writeJsonFileAtomically;exports.t = readJsonFileWithFallback;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _jsonFilesL0zR3LSb = require("./json-files-L0zR3LSb.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugin-sdk/json-store.ts
/** Read JSON from disk and fall back cleanly when the file is missing or invalid. */
async function readJsonFileWithFallback(filePath, fallback) {
  try {
    const parsed = (0, _utilsD5DtWkEu.h)(await _nodeFs.default.promises.readFile(filePath, "utf-8"));
    if (parsed == null) return {
      value: fallback,
      exists: true
    };
    return {
      value: parsed,
      exists: true
    };
  } catch (err) {
    if (err.code === "ENOENT") return {
      value: fallback,
      exists: false
    };
    return {
      value: fallback,
      exists: false
    };
  }
}
/** Write JSON with secure file permissions and atomic replacement semantics. */
async function writeJsonFileAtomically(filePath, value) {
  await (0, _jsonFilesL0zR3LSb.r)(filePath, value, {
    mode: 384,
    trailingNewline: true,
    ensureDirMode: 448
  });
}
//#endregion /* v9-1f2d3f6cc4b35abf */
