"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = assertLocalMediaAllowed;exports.r = getDefaultLocalRoots;exports.t = void 0;var _localFileAccessCpkF4sBk = require("./local-file-access-CpkF4sBk.js");
var _localRootsBrPriMlc = require("./local-roots-BrPriMlc.js");
var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = _interopRequireDefault(require("node:fs/promises"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/media/local-media-access.ts
var LocalMediaAccessError = class extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.code = code;
    this.name = "LocalMediaAccessError";
  }
};exports.t = LocalMediaAccessError;
function getDefaultLocalRoots() {
  return (0, _localRootsBrPriMlc.a)();
}
async function assertLocalMediaAllowed(mediaPath, localRoots) {
  if (localRoots === "any") return;
  try {
    (0, _localFileAccessCpkF4sBk.t)(mediaPath, "Local media path");
  } catch (err) {
    throw new LocalMediaAccessError("network-path-not-allowed", err.message, { cause: err });
  }
  const roots = localRoots ?? getDefaultLocalRoots();
  let resolved;
  try {
    resolved = await _promises.default.realpath(mediaPath);
  } catch {
    resolved = _nodePath.default.resolve(mediaPath);
  }
  if (localRoots === void 0) {
    const workspaceRoot = roots.find((root) => _nodePath.default.basename(root) === "workspace");
    if (workspaceRoot) {
      const stateDir = _nodePath.default.dirname(workspaceRoot);
      const rel = _nodePath.default.relative(stateDir, resolved);
      if (rel && !rel.startsWith("..") && !_nodePath.default.isAbsolute(rel)) {
        if ((rel.split(_nodePath.default.sep)[0] ?? "").startsWith("workspace-")) throw new LocalMediaAccessError("path-not-allowed", `Local media path is not under an allowed directory: ${mediaPath}`);
      }
    }
  }
  for (const root of roots) {
    let resolvedRoot;
    try {
      resolvedRoot = await _promises.default.realpath(root);
    } catch {
      resolvedRoot = _nodePath.default.resolve(root);
    }
    if (resolvedRoot === _nodePath.default.parse(resolvedRoot).root) throw new LocalMediaAccessError("invalid-root", `Invalid localRoots entry (refuses filesystem root): ${root}. Pass a narrower directory.`);
    if (resolved === resolvedRoot || resolved.startsWith(resolvedRoot + _nodePath.default.sep)) return;
  }
  throw new LocalMediaAccessError("path-not-allowed", `Local media path is not under an allowed directory: ${mediaPath}`);
}
//#endregion /* v9-21ca2d99dfc3ce9f */
