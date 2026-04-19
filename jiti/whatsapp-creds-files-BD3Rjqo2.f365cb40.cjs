"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveWebCredsBackupPath;exports.r = resolveWebCredsPath;exports.t = hasWebCredsSync;var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region extensions/whatsapp/src/creds-files.ts
function resolveWebCredsPath(authDir) {
  return _nodePath.default.join(authDir, "creds.json");
}
function resolveWebCredsBackupPath(authDir) {
  return _nodePath.default.join(authDir, "creds.json.bak");
}
function hasWebCredsSync(authDir) {
  try {
    const stats = _nodeFs.default.statSync(resolveWebCredsPath(authDir));
    return stats.isFile() && stats.size > 1;
  } catch {
    return false;
  }
}
//#endregion /* v9-e4586bb4013d690b */
