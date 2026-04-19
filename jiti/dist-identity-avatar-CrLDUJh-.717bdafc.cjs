"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveAgentAvatar;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _avatarPolicyDEMOzJv = require("./avatar-policy-DEMOzJv4.js");
var _identityB_Q39IGW = require("./identity-B_Q39IGW.js");
var _identityFileDQ369w5A = require("./identity-file-DQ369w5A.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/identity-avatar.ts
function resolveAvatarSource(cfg, agentId, opts) {
  if (opts?.includeUiOverride) {
    const fromUiConfig = (0, _stringCoerceBUSzWgUA.s)(cfg.ui?.assistant?.avatar) ?? null;
    if (fromUiConfig) return fromUiConfig;
  }
  const fromConfig = (0, _stringCoerceBUSzWgUA.s)((0, _identityB_Q39IGW.n)(cfg, agentId)?.avatar) ?? null;
  if (fromConfig) return fromConfig;
  return (0, _stringCoerceBUSzWgUA.s)((0, _identityFileDQ369w5A.n)((0, _agentScopeKFH9bkHi.b)(cfg, agentId))?.avatar) ?? null;
}
function resolveExistingPath(value) {
  try {
    return _nodeFs.default.realpathSync(value);
  } catch {
    return _nodePath.default.resolve(value);
  }
}
function resolveLocalAvatarPath(params) {
  const workspaceRoot = resolveExistingPath(params.workspaceDir);
  const raw = params.raw;
  const realPath = resolveExistingPath(raw.startsWith("~") || _nodePath.default.isAbsolute(raw) ? (0, _utilsD5DtWkEu.m)(raw) : _nodePath.default.resolve(workspaceRoot, raw));
  if (!(0, _avatarPolicyDEMOzJv.o)(workspaceRoot, realPath)) return {
    ok: false,
    reason: "outside_workspace"
  };
  if (!(0, _avatarPolicyDEMOzJv.s)(realPath)) return {
    ok: false,
    reason: "unsupported_extension"
  };
  try {
    const stat = _nodeFs.default.statSync(realPath);
    if (!stat.isFile()) return {
      ok: false,
      reason: "missing"
    };
    if (stat.size > 2097152) return {
      ok: false,
      reason: "too_large"
    };
  } catch {
    return {
      ok: false,
      reason: "missing"
    };
  }
  return {
    ok: true,
    filePath: realPath
  };
}
function resolveAgentAvatar(cfg, agentId, opts) {
  const source = resolveAvatarSource(cfg, agentId, opts);
  if (!source) return {
    kind: "none",
    reason: "missing"
  };
  if ((0, _avatarPolicyDEMOzJv.i)(source)) return {
    kind: "remote",
    url: source
  };
  if ((0, _avatarPolicyDEMOzJv.r)(source)) return {
    kind: "data",
    url: source
  };
  const resolved = resolveLocalAvatarPath({
    raw: source,
    workspaceDir: (0, _agentScopeKFH9bkHi.b)(cfg, agentId)
  });
  if (!resolved.ok) return {
    kind: "none",
    reason: resolved.reason
  };
  return {
    kind: "local",
    filePath: resolved.filePath
  };
}
//#endregion /* v9-90f3ad8fb4c83af0 */
