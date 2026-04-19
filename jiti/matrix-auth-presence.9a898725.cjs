"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.hasAnyMatrixAuth = hasAnyMatrixAuth;var _storagePathsDEBfRoQT = require("./storage-paths-DEBfRoQT.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodeOs = _interopRequireDefault(require("node:os"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _statePaths = require("openclaw/plugin-sdk/state-paths");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region extensions/matrix/auth-presence.ts
function listMatrixCredentialPaths(_cfg, env = process.env) {
  const credentialsDir = (0, _storagePathsDEBfRoQT.r)((0, _statePaths.resolveStateDir)(env, _nodeOs.default.homedir));
  const paths = new Set([(0, _storagePathsDEBfRoQT.i)(), (0, _storagePathsDEBfRoQT.i)("default")]);
  try {
    const entries = _nodeFs.default.readdirSync(credentialsDir, { withFileTypes: true });
    for (const entry of entries) if (entry.isFile() && /^credentials(?:-[a-z0-9._-]+)?\.json$/i.test(entry.name)) paths.add(entry.name);
  } catch {}
  return [...paths].map((filename) => _nodePath.default.join(credentialsDir, filename));
}
function hasAnyMatrixAuth(params, env = process.env) {
  return listMatrixCredentialPaths(params && typeof params === "object" && "cfg" in params ? params.cfg : params, params && typeof params === "object" && "cfg" in params ? params.env ?? env : env).some((filePath) => {
    try {
      return _nodeFs.default.existsSync(filePath);
    } catch {
      return false;
    }
  });
}
//#endregion /* v9-e2045f29b71391b3 */
