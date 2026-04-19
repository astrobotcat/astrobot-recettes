"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = movePathToTrash;var _execBAdwyfxI = require("./exec-BAdwyfxI.js");
var _secureRandomDHoiZOqc = require("./secure-random-DHoiZOqc.js");
require("./browser-node-runtime-Cr9m9xwX.js");
require("./browser-security-runtime-DCYxvSMK.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeOs = _interopRequireDefault(require("node:os"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region extensions/browser/src/browser/trash.ts
async function movePathToTrash(targetPath) {
  try {
    await (0, _execBAdwyfxI.i)("trash", [targetPath], { timeoutMs: 1e4 });
    return targetPath;
  } catch {
    const trashDir = _nodePath.default.join(_nodeOs.default.homedir(), ".Trash");
    _nodeFs.default.mkdirSync(trashDir, { recursive: true });
    const base = _nodePath.default.basename(targetPath);
    let dest = _nodePath.default.join(trashDir, `${base}-${Date.now()}`);
    if (_nodeFs.default.existsSync(dest)) dest = _nodePath.default.join(trashDir, `${base}-${Date.now()}-${(0, _secureRandomDHoiZOqc.i)(6)}`);
    _nodeFs.default.renameSync(targetPath, dest);
    return dest;
  }
}
//#endregion /* v9-8db1faccde02cf88 */
