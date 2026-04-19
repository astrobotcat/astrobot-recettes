"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveAgentSessionDirs;exports.n = resolveAllAgentSessionStoreTargetsSync;exports.r = resolveSessionStoreTargets;exports.t = resolveAllAgentSessionStoreTargets;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = _interopRequireDefault(require("node:fs/promises"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/session-dirs.ts
function mapAgentSessionDirs(agentsDir, entries) {
  return entries.filter((entry) => entry.isDirectory()).map((entry) => _nodePath.default.join(agentsDir, entry.name, "sessions")).toSorted((a, b) => a.localeCompare(b));
}
async function resolveAgentSessionDirsFromAgentsDir(agentsDir) {
  let entries = [];
  try {
    entries = await _promises.default.readdir(agentsDir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  return mapAgentSessionDirs(agentsDir, entries);
}
function resolveAgentSessionDirsFromAgentsDirSync(agentsDir) {
  let entries = [];
  try {
    entries = _nodeFs.default.readdirSync(agentsDir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  return mapAgentSessionDirs(agentsDir, entries);
}
async function resolveAgentSessionDirs(stateDir) {
  return await resolveAgentSessionDirsFromAgentsDir(_nodePath.default.join(stateDir, "agents"));
}
//#endregion
//#region src/config/sessions/targets.ts
const NON_FATAL_DISCOVERY_ERROR_CODES = new Set([
"EACCES",
"ELOOP",
"ENOENT",
"ENOTDIR",
"EPERM",
"ESTALE"]
);
function dedupeTargetsByStorePath(targets) {
  const deduped = /* @__PURE__ */new Map();
  for (const target of targets) if (!deduped.has(target.storePath)) deduped.set(target.storePath, target);
  return [...deduped.values()];
}
function shouldSkipDiscoveryError(err) {
  const code = err?.code;
  return typeof code === "string" && NON_FATAL_DISCOVERY_ERROR_CODES.has(code);
}
function isWithinRoot(realPath, realRoot) {
  return realPath === realRoot || realPath.startsWith(`${realRoot}${_nodePath.default.sep}`);
}
function shouldSkipDiscoveredAgentDirName(dirName, agentId) {
  return agentId === "main" && (0, _stringCoerceBUSzWgUA.i)(dirName) !== "main";
}
function resolveValidatedDiscoveredStorePathSync(params) {
  const storePath = _nodePath.default.join(params.sessionsDir, "sessions.json");
  try {
    const stat = _nodeFs.default.lstatSync(storePath);
    if (stat.isSymbolicLink() || !stat.isFile()) return;
    const realStorePath = _nodeFs.default.realpathSync.native(storePath);
    return isWithinRoot(realStorePath, params.realAgentsRoot ?? _nodeFs.default.realpathSync.native(params.agentsRoot)) ? realStorePath : void 0;
  } catch (err) {
    if (shouldSkipDiscoveryError(err)) return;
    throw err;
  }
}
async function resolveValidatedDiscoveredStorePath(params) {
  const storePath = _nodePath.default.join(params.sessionsDir, "sessions.json");
  try {
    const stat = await _promises.default.lstat(storePath);
    if (stat.isSymbolicLink() || !stat.isFile()) return;
    const realStorePath = await _promises.default.realpath(storePath);
    return isWithinRoot(realStorePath, params.realAgentsRoot ?? (await _promises.default.realpath(params.agentsRoot))) ? realStorePath : void 0;
  } catch (err) {
    if (shouldSkipDiscoveryError(err)) return;
    throw err;
  }
}
function resolveSessionStoreDiscoveryState(cfg, env) {
  const configuredTargets = resolveSessionStoreTargets(cfg, { allAgents: true }, { env });
  const agentsRoots = /* @__PURE__ */new Set();
  for (const target of configuredTargets) {
    const agentsDir = (0, _pathsCZMxg3hs.n)(target.storePath);
    if (agentsDir) agentsRoots.add(agentsDir);
  }
  agentsRoots.add(_nodePath.default.join((0, _pathsDvv9VRAc._)(env), "agents"));
  return {
    configuredTargets,
    agentsRoots: [...agentsRoots]
  };
}
function toDiscoveredSessionStoreTarget(sessionsDir, storePath) {
  const dirName = _nodePath.default.basename(_nodePath.default.dirname(sessionsDir));
  const agentId = (0, _sessionKeyBh1lMwK.c)(dirName);
  if (shouldSkipDiscoveredAgentDirName(dirName, agentId)) return;
  return {
    agentId,
    storePath
  };
}
function resolveAllAgentSessionStoreTargetsSync(cfg, params = {}) {
  const { configuredTargets, agentsRoots } = resolveSessionStoreDiscoveryState(cfg, params.env ?? process.env);
  const realAgentsRoots = /* @__PURE__ */new Map();
  const getRealAgentsRoot = (agentsRoot) => {
    const cached = realAgentsRoots.get(agentsRoot);
    if (cached !== void 0) return cached;
    try {
      const realAgentsRoot = _nodeFs.default.realpathSync.native(agentsRoot);
      realAgentsRoots.set(agentsRoot, realAgentsRoot);
      return realAgentsRoot;
    } catch (err) {
      if (shouldSkipDiscoveryError(err)) return;
      throw err;
    }
  };
  const validatedConfiguredTargets = configuredTargets.flatMap((target) => {
    const agentsRoot = (0, _pathsCZMxg3hs.n)(target.storePath);
    if (!agentsRoot) return [target];
    const realAgentsRoot = getRealAgentsRoot(agentsRoot);
    if (!realAgentsRoot) return [];
    const validatedStorePath = resolveValidatedDiscoveredStorePathSync({
      sessionsDir: _nodePath.default.dirname(target.storePath),
      agentsRoot,
      realAgentsRoot
    });
    return validatedStorePath ? [{
      ...target,
      storePath: validatedStorePath
    }] : [];
  });
  const discoveredTargets = agentsRoots.flatMap((agentsDir) => {
    try {
      const realAgentsRoot = getRealAgentsRoot(agentsDir);
      if (!realAgentsRoot) return [];
      return resolveAgentSessionDirsFromAgentsDirSync(agentsDir).flatMap((sessionsDir) => {
        const validatedStorePath = resolveValidatedDiscoveredStorePathSync({
          sessionsDir,
          agentsRoot: agentsDir,
          realAgentsRoot
        });
        const target = validatedStorePath ? toDiscoveredSessionStoreTarget(sessionsDir, validatedStorePath) : void 0;
        return target ? [target] : [];
      });
    } catch (err) {
      if (shouldSkipDiscoveryError(err)) return [];
      throw err;
    }
  });
  return dedupeTargetsByStorePath([...validatedConfiguredTargets, ...discoveredTargets]);
}
async function resolveAllAgentSessionStoreTargets(cfg, params = {}) {
  const { configuredTargets, agentsRoots } = resolveSessionStoreDiscoveryState(cfg, params.env ?? process.env);
  const realAgentsRoots = /* @__PURE__ */new Map();
  const getRealAgentsRoot = async (agentsRoot) => {
    const cached = realAgentsRoots.get(agentsRoot);
    if (cached !== void 0) return cached;
    try {
      const realAgentsRoot = await _promises.default.realpath(agentsRoot);
      realAgentsRoots.set(agentsRoot, realAgentsRoot);
      return realAgentsRoot;
    } catch (err) {
      if (shouldSkipDiscoveryError(err)) return;
      throw err;
    }
  };
  const validatedConfiguredTargets = (await Promise.all(configuredTargets.map(async (target) => {
    const agentsRoot = (0, _pathsCZMxg3hs.n)(target.storePath);
    if (!agentsRoot) return target;
    const realAgentsRoot = await getRealAgentsRoot(agentsRoot);
    if (!realAgentsRoot) return;
    const validatedStorePath = await resolveValidatedDiscoveredStorePath({
      sessionsDir: _nodePath.default.dirname(target.storePath),
      agentsRoot,
      realAgentsRoot
    });
    return validatedStorePath ? {
      ...target,
      storePath: validatedStorePath
    } : void 0;
  }))).filter((target) => Boolean(target));
  const discoveredTargets = (await Promise.all(agentsRoots.map(async (agentsDir) => {
    try {
      const realAgentsRoot = await getRealAgentsRoot(agentsDir);
      if (!realAgentsRoot) return [];
      const sessionsDirs = await resolveAgentSessionDirsFromAgentsDir(agentsDir);
      return (await Promise.all(sessionsDirs.map(async (sessionsDir) => {
        const validatedStorePath = await resolveValidatedDiscoveredStorePath({
          sessionsDir,
          agentsRoot: agentsDir,
          realAgentsRoot
        });
        return validatedStorePath ? toDiscoveredSessionStoreTarget(sessionsDir, validatedStorePath) : void 0;
      }))).filter((target) => Boolean(target));
    } catch (err) {
      if (shouldSkipDiscoveryError(err)) return [];
      throw err;
    }
  }))).flat();
  return dedupeTargetsByStorePath([...validatedConfiguredTargets, ...discoveredTargets]);
}
function resolveSessionStoreTargets(cfg, opts, params = {}) {
  const env = params.env ?? process.env;
  const defaultAgentId = (0, _agentScopeKFH9bkHi.x)(cfg);
  const hasAgent = Boolean(opts.agent?.trim());
  const allAgents = opts.allAgents === true;
  if (hasAgent && allAgents) throw new Error("--agent and --all-agents cannot be used together");
  if (opts.store && (hasAgent || allAgents)) throw new Error("--store cannot be combined with --agent or --all-agents");
  if (opts.store) return [{
    agentId: defaultAgentId,
    storePath: (0, _pathsCZMxg3hs.u)(opts.store, {
      agentId: defaultAgentId,
      env
    })
  }];
  if (allAgents) return dedupeTargetsByStorePath((0, _agentScopeKFH9bkHi.g)(cfg).map((agentId) => ({
    agentId,
    storePath: (0, _pathsCZMxg3hs.u)(cfg.session?.store, {
      agentId,
      env
    })
  })));
  if (hasAgent) {
    const knownAgents = (0, _agentScopeKFH9bkHi.g)(cfg);
    const requested = (0, _sessionKeyBh1lMwK.c)(opts.agent ?? "");
    if (!knownAgents.includes(requested)) throw new Error(`Unknown agent id "${opts.agent}". Use "openclaw agents list" to see configured agents.`);
    return [{
      agentId: requested,
      storePath: (0, _pathsCZMxg3hs.u)(cfg.session?.store, {
        agentId: requested,
        env
      })
    }];
  }
  return [{
    agentId: defaultAgentId,
    storePath: (0, _pathsCZMxg3hs.u)(cfg.session?.store, {
      agentId: defaultAgentId,
      env
    })
  }];
}
//#endregion /* v9-2c49ce1f319455b7 */
