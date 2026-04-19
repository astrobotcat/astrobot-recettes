"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = getDefaultMediaLocalRoots;exports.c = resolveEffectiveToolFsWorkspaceOnly;exports.i = getAgentScopedMediaLocalRootsForSources;exports.l = resolveToolFsConfig;exports.n = buildMediaLocalRoots;exports.o = createToolFsPolicy;exports.r = getAgentScopedMediaLocalRoots;exports.s = resolveEffectiveToolFsRootExpansionAllowed;exports.t = appendLocalMediaParentRoots;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _tmpOpenclawDirEyAoWbVe = require("./tmp-openclaw-dir-eyAoWbVe.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _toolPolicyC3rJHw = require("./tool-policy-C3rJHw58.js");
var _localFileAccessCpkF4sBk = require("./local-file-access-CpkF4sBk.js");
var _mediaSourceUrlCTCb935r = require("./media-source-url-CTCb935r.js");
var _toolPolicyMatchCu6gJ6QQ = require("./tool-policy-match-Cu6gJ6QQ.js");
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/tool-fs-policy.ts
function createToolFsPolicy(params) {
  return { workspaceOnly: params.workspaceOnly === true };
}
function resolveToolFsConfig(params) {
  const cfg = params.cfg;
  const globalFs = cfg?.tools?.fs;
  return { workspaceOnly: (cfg && params.agentId ? (0, _agentScopeKFH9bkHi._)(cfg, params.agentId)?.tools?.fs : void 0)?.workspaceOnly ?? globalFs?.workspaceOnly };
}
function resolveEffectiveToolFsWorkspaceOnly(params) {
  return resolveToolFsConfig(params).workspaceOnly === true;
}
function resolveEffectiveToolFsRootExpansionAllowed(params) {
  const cfg = params.cfg;
  if (!cfg) return true;
  const agentTools = params.agentId ? (0, _agentScopeKFH9bkHi._)(cfg, params.agentId)?.tools : void 0;
  const globalTools = cfg.tools;
  const profile = agentTools?.profile ?? globalTools?.profile;
  const profileAlsoAllow = new Set(agentTools?.alsoAllow ?? globalTools?.alsoAllow ?? []);
  const fsConfig = resolveToolFsConfig(params);
  const hasExplicitFsConfig = agentTools?.fs !== void 0 || globalTools?.fs !== void 0;
  if (fsConfig.workspaceOnly === true) return false;
  if (hasExplicitFsConfig) {
    profileAlsoAllow.add("read");
    profileAlsoAllow.add("write");
    profileAlsoAllow.add("edit");
  }
  return (0, _toolPolicyMatchCu6gJ6QQ.t)("read", [
  (0, _toolPolicyC3rJHw.o)((0, _toolPolicyC3rJHw.u)(profile), profileAlsoAllow.size > 0 ? Array.from(profileAlsoAllow) : void 0),
  (0, _toolPolicyMatchCu6gJ6QQ.r)(globalTools),
  (0, _toolPolicyMatchCu6gJ6QQ.r)(agentTools)]
  );
}
//#endregion
//#region src/media/local-roots.ts
let cachedPreferredTmpDir;
const DATA_URL_RE = /^data:/i;
const WINDOWS_DRIVE_RE = /^[A-Za-z]:[\\/]/;
function resolveCachedPreferredTmpDir() {
  if (!cachedPreferredTmpDir) cachedPreferredTmpDir = (0, _tmpOpenclawDirEyAoWbVe.n)();
  return cachedPreferredTmpDir;
}
function buildMediaLocalRoots(stateDir, configDir, options = {}) {
  const resolvedStateDir = _nodePath.default.resolve(stateDir);
  const resolvedConfigDir = _nodePath.default.resolve(configDir);
  const preferredTmpDir = options.preferredTmpDir ?? resolveCachedPreferredTmpDir();
  return Array.from(new Set([
  preferredTmpDir,
  _nodePath.default.join(resolvedConfigDir, "media"),
  _nodePath.default.join(resolvedStateDir, "media"),
  _nodePath.default.join(resolvedStateDir, "canvas"),
  _nodePath.default.join(resolvedStateDir, "workspace"),
  _nodePath.default.join(resolvedStateDir, "sandboxes")]
  ));
}
function getDefaultMediaLocalRoots() {
  return buildMediaLocalRoots((0, _pathsDvv9VRAc._)(), (0, _utilsD5DtWkEu.f)());
}
function getAgentScopedMediaLocalRoots(cfg, agentId) {
  const roots = buildMediaLocalRoots((0, _pathsDvv9VRAc._)(), (0, _utilsD5DtWkEu.f)());
  const normalizedAgentId = (0, _stringCoerceBUSzWgUA.s)(agentId);
  if (!normalizedAgentId) return roots;
  const workspaceDir = (0, _agentScopeKFH9bkHi.b)(cfg, normalizedAgentId);
  if (!workspaceDir) return roots;
  const normalizedWorkspaceDir = _nodePath.default.resolve(workspaceDir);
  if (!roots.includes(normalizedWorkspaceDir)) roots.push(normalizedWorkspaceDir);
  return roots;
}
function resolveLocalMediaPath(source) {
  const trimmed = source.trim();
  if (!trimmed || (0, _mediaSourceUrlCTCb935r.t)(trimmed) || DATA_URL_RE.test(trimmed)) return;
  if (trimmed.startsWith("file://")) try {
    return (0, _localFileAccessCpkF4sBk.a)(trimmed);
  } catch {
    return;
  }
  if (trimmed.startsWith("~")) return (0, _utilsD5DtWkEu.m)(trimmed);
  if (_nodePath.default.isAbsolute(trimmed) || WINDOWS_DRIVE_RE.test(trimmed)) return _nodePath.default.resolve(trimmed);
}
function appendLocalMediaParentRoots(roots, mediaSources) {
  const appended = Array.from(new Set(roots.map((root) => _nodePath.default.resolve(root))));
  for (const source of mediaSources ?? []) {
    const localPath = resolveLocalMediaPath(source);
    if (!localPath) continue;
    const parentDir = _nodePath.default.dirname(localPath);
    if (parentDir === _nodePath.default.parse(parentDir).root) continue;
    const normalizedParent = _nodePath.default.resolve(parentDir);
    if (!appended.includes(normalizedParent)) appended.push(normalizedParent);
  }
  return appended;
}
function getAgentScopedMediaLocalRootsForSources(params) {
  const roots = getAgentScopedMediaLocalRoots(params.cfg, params.agentId);
  if (resolveEffectiveToolFsWorkspaceOnly({
    cfg: params.cfg,
    agentId: params.agentId
  })) return roots;
  if (!resolveEffectiveToolFsRootExpansionAllowed({
    cfg: params.cfg,
    agentId: params.agentId
  })) return roots;
  return appendLocalMediaParentRoots(roots, params.mediaSources);
}
//#endregion /* v9-c6cbe84980134da3 */
