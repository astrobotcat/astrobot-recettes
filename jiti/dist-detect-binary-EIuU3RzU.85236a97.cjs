"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = detectBinary;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _execBAdwyfxI = require("./exec-BAdwyfxI.js");
var _execSafetyO7DICmgB = require("./exec-safety-O7DICmgB.js");
var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = _interopRequireDefault(require("node:fs/promises"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/detect-binary.ts
async function detectBinary(name) {
  if (!name?.trim()) return false;
  if (!(0, _execSafetyO7DICmgB.t)(name)) return false;
  const resolved = name.startsWith("~") ? (0, _utilsD5DtWkEu.m)(name) : name;
  if (_nodePath.default.isAbsolute(resolved) || resolved.startsWith(".") || resolved.includes("/") || resolved.includes("\\")) try {
    await _promises.default.access(resolved);
    return true;
  } catch {
    return false;
  }
  const command = process.platform === "win32" ? ["where", name] : [
  "/usr/bin/env",
  "which",
  name];

  try {
    const result = await (0, _execBAdwyfxI.r)(command, { timeoutMs: 2e3 });
    return result.code === 0 && result.stdout.trim().length > 0;
  } catch {
    return false;
  }
}
//#endregion /* v9-ea77d7ac253c4246 */
