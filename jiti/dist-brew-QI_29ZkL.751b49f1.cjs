"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveBrewPathDirs;exports.t = resolveBrewExecutable;var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeOs = _interopRequireDefault(require("node:os"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/brew.ts
function isExecutable(filePath) {
  try {
    _nodeFs.default.accessSync(filePath, _nodeFs.default.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
function normalizePathValue(value) {
  if (typeof value !== "string") return;
  const trimmed = value.trim();
  return trimmed ? trimmed : void 0;
}
function resolveBrewPathDirs(opts) {
  const homeDir = opts?.homeDir ?? _nodeOs.default.homedir();
  const env = opts?.env ?? process.env;
  const dirs = [];
  const prefix = normalizePathValue(env.HOMEBREW_PREFIX);
  if (prefix) dirs.push(_nodePath.default.join(prefix, "bin"), _nodePath.default.join(prefix, "sbin"));
  dirs.push(_nodePath.default.join(homeDir, ".linuxbrew", "bin"));
  dirs.push(_nodePath.default.join(homeDir, ".linuxbrew", "sbin"));
  dirs.push("/home/linuxbrew/.linuxbrew/bin", "/home/linuxbrew/.linuxbrew/sbin");
  dirs.push("/opt/homebrew/bin", "/usr/local/bin");
  return dirs;
}
function resolveBrewExecutable(opts) {
  const homeDir = opts?.homeDir ?? _nodeOs.default.homedir();
  const env = opts?.env ?? process.env;
  const candidates = [];
  const brewFile = normalizePathValue(env.HOMEBREW_BREW_FILE);
  if (brewFile) candidates.push(brewFile);
  const prefix = normalizePathValue(env.HOMEBREW_PREFIX);
  if (prefix) candidates.push(_nodePath.default.join(prefix, "bin", "brew"));
  candidates.push(_nodePath.default.join(homeDir, ".linuxbrew", "bin", "brew"));
  candidates.push("/home/linuxbrew/.linuxbrew/bin/brew");
  candidates.push("/opt/homebrew/bin/brew", "/usr/local/bin/brew");
  for (const candidate of candidates) if (isExecutable(candidate)) return candidate;
}
//#endregion /* v9-74467a4dd47ad95f */
