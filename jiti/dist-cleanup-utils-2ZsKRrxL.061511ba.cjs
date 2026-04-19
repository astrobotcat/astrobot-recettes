"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = removeStateAndLinkedPaths;exports.i = removePath;exports.n = isPathWithin;exports.o = removeWorkspaceDirs;exports.r = listAgentSessionDirs;exports.t = buildCleanupPlan;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _workspaceHhTlRYqM = require("./workspace-hhTlRYqM.js");
var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = _interopRequireDefault(require("node:fs/promises"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/commands/cleanup-utils.ts
function collectWorkspaceDirs(cfg) {
  const dirs = /* @__PURE__ */new Set();
  const defaults = cfg?.agents?.defaults;
  if (typeof defaults?.workspace === "string" && defaults.workspace.trim()) dirs.add((0, _utilsD5DtWkEu.m)(defaults.workspace));
  const list = Array.isArray(cfg?.agents?.list) ? cfg?.agents?.list : [];
  for (const agent of list) {
    const workspace = agent.workspace;
    if (typeof workspace === "string" && workspace.trim()) dirs.add((0, _utilsD5DtWkEu.m)(workspace));
  }
  if (dirs.size === 0) dirs.add((0, _workspaceHhTlRYqM.g)());
  return [...dirs];
}
function buildCleanupPlan(params) {
  return {
    configInsideState: isPathWithin(params.configPath, params.stateDir),
    oauthInsideState: isPathWithin(params.oauthDir, params.stateDir),
    workspaceDirs: collectWorkspaceDirs(params.cfg)
  };
}
function isPathWithin(child, parent) {
  const relative = _nodePath.default.relative(parent, child);
  return relative === "" || !relative.startsWith("..") && !_nodePath.default.isAbsolute(relative);
}
function isUnsafeRemovalTarget(target) {
  if (!target.trim()) return true;
  const resolved = _nodePath.default.resolve(target);
  if (resolved === _nodePath.default.parse(resolved).root) return true;
  const home = (0, _utilsD5DtWkEu.p)();
  if (home && resolved === _nodePath.default.resolve(home)) return true;
  return false;
}
async function removePath(target, runtime, opts) {
  if (!target?.trim()) return {
    ok: false,
    skipped: true
  };
  const resolved = _nodePath.default.resolve(target);
  const displayLabel = (0, _utilsD5DtWkEu.g)(opts?.label ?? resolved);
  if (isUnsafeRemovalTarget(resolved)) {
    runtime.error(`Refusing to remove unsafe path: ${displayLabel}`);
    return { ok: false };
  }
  if (opts?.dryRun) {
    runtime.log(`[dry-run] remove ${displayLabel}`);
    return {
      ok: true,
      skipped: true
    };
  }
  try {
    await _promises.default.rm(resolved, {
      recursive: true,
      force: true
    });
    runtime.log(`Removed ${displayLabel}`);
    return { ok: true };
  } catch (err) {
    runtime.error(`Failed to remove ${displayLabel}: ${String(err)}`);
    return { ok: false };
  }
}
async function removeStateAndLinkedPaths(cleanup, runtime, opts) {
  await removePath(cleanup.stateDir, runtime, {
    dryRun: opts?.dryRun,
    label: cleanup.stateDir
  });
  if (!cleanup.configInsideState) await removePath(cleanup.configPath, runtime, {
    dryRun: opts?.dryRun,
    label: cleanup.configPath
  });
  if (!cleanup.oauthInsideState) await removePath(cleanup.oauthDir, runtime, {
    dryRun: opts?.dryRun,
    label: cleanup.oauthDir
  });
}
async function removeWorkspaceDirs(workspaceDirs, runtime, opts) {
  for (const workspace of workspaceDirs) await removePath(workspace, runtime, {
    dryRun: opts?.dryRun,
    label: workspace
  });
}
async function listAgentSessionDirs(stateDir) {
  const root = _nodePath.default.join(stateDir, "agents");
  try {
    return (await _promises.default.readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => _nodePath.default.join(root, entry.name, "sessions"));
  } catch {
    return [];
  }
}
//#endregion /* v9-ab386879e759b609 */
