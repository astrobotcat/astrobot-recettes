"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = promptYesNo;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _globalStateLrCGCReA = require("./global-state-LrCGCReA.js");
require("./globals-De6QTwLG.js");
var _nodeProcess = require("node:process");
var _promises = _interopRequireDefault(require("node:readline/promises"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/cli/prompt.ts
async function promptYesNo(question, defaultYes = false) {
  if ((0, _globalStateLrCGCReA.t)() && (0, _globalStateLrCGCReA.n)()) return true;
  if ((0, _globalStateLrCGCReA.n)()) return true;
  const rl = _promises.default.createInterface({
    input: _nodeProcess.stdin,
    output: _nodeProcess.stdout
  });
  const suffix = defaultYes ? " [Y/n] " : " [y/N] ";
  const answer = (0, _stringCoerceBUSzWgUA.i)(await rl.question(`${question}${suffix}`));
  rl.close();
  if (!answer) return defaultYes;
  return answer.startsWith("y");
}
//#endregion /* v9-e59ee6ba7e30ee61 */
