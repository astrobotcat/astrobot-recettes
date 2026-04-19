"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports._ = resolveAgentConfig;exports.a = resolveAgentIdByWorkspacePath;exports.b = resolveAgentWorkspaceDir;exports.c = resolveAgentModelPrimary;exports.d = resolveFallbackAgentId;exports.f = resolveRunModelFallbacksOverride;exports.g = listAgentIds;exports.h = listAgentEntries;exports.i = resolveAgentExplicitModelPrimary;exports.l = resolveAgentSkillsFilter;exports.m = resolveSessionAgentIds;exports.n = resolveAgentEffectiveModelPrimary;exports.o = resolveAgentIdsByWorkspacePath;exports.p = resolveSessionAgentId;exports.r = resolveAgentExecutionContract;exports.s = resolveAgentModelFallbacksOverride;exports.t = hasConfiguredModelFallbacks;exports.u = resolveEffectiveModelFallbacks;exports.v = resolveAgentContextLimits;exports.x = resolveDefaultAgentId;exports.y = resolveAgentDir;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _modelInputDFbXtnkw = require("./model-input-DFbXtnkw.js");
var _workspaceHhTlRYqM = require("./workspace-hhTlRYqM.js");
var _agentFilterCYpmRQt = require("./agent-filter-CYpmR-qt.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/agent-scope-config.ts
let log = null;
let defaultAgentWarned = false;
function getLog() {
  log ??= (0, _subsystemCgmckbux.t)("agent-scope");
  return log;
}
/** Strip null bytes from paths to prevent ENOTDIR errors. */
function stripNullBytes$1(s) {
  return s.replaceAll("\0", "");
}
function listAgentEntries(cfg) {
  const list = cfg.agents?.list;
  if (!Array.isArray(list)) return [];
  return list.filter((entry) => entry !== null && typeof entry === "object");
}
function listAgentIds(cfg) {
  const agents = listAgentEntries(cfg);
  if (agents.length === 0) return [_sessionKeyBh1lMwK.t];
  const seen = /* @__PURE__ */new Set();
  const ids = [];
  for (const entry of agents) {
    const id = (0, _sessionKeyBh1lMwK.c)(entry?.id);
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids.length > 0 ? ids : [_sessionKeyBh1lMwK.t];
}
function resolveDefaultAgentId(cfg) {
  const agents = listAgentEntries(cfg);
  if (agents.length === 0) return _sessionKeyBh1lMwK.t;
  const defaults = agents.filter((agent) => agent?.default);
  if (defaults.length > 1 && !defaultAgentWarned) {
    defaultAgentWarned = true;
    getLog().warn("Multiple agents marked default=true; using the first entry as default.");
  }
  const chosen = (defaults[0] ?? agents[0])?.id?.trim();
  return (0, _sessionKeyBh1lMwK.c)(chosen || "main");
}
function resolveAgentEntry(cfg, agentId) {
  const id = (0, _sessionKeyBh1lMwK.c)(agentId);
  return listAgentEntries(cfg).find((entry) => (0, _sessionKeyBh1lMwK.c)(entry.id) === id);
}
function resolveAgentConfig(cfg, agentId) {
  const entry = resolveAgentEntry(cfg, (0, _sessionKeyBh1lMwK.c)(agentId));
  if (!entry) return;
  const agentDefaults = cfg.agents?.defaults;
  return {
    name: (0, _stringCoerceBUSzWgUA.d)(entry.name),
    workspace: (0, _stringCoerceBUSzWgUA.d)(entry.workspace),
    agentDir: (0, _stringCoerceBUSzWgUA.d)(entry.agentDir),
    systemPromptOverride: (0, _stringCoerceBUSzWgUA.d)(entry.systemPromptOverride),
    model: typeof entry.model === "string" || entry.model && typeof entry.model === "object" ? entry.model : void 0,
    thinkingDefault: entry.thinkingDefault,
    verboseDefault: entry.verboseDefault ?? agentDefaults?.verboseDefault,
    reasoningDefault: entry.reasoningDefault,
    fastModeDefault: entry.fastModeDefault,
    skills: Array.isArray(entry.skills) ? entry.skills : void 0,
    memorySearch: entry.memorySearch,
    humanDelay: entry.humanDelay,
    contextLimits: typeof entry.contextLimits === "object" && entry.contextLimits ? {
      ...agentDefaults?.contextLimits,
      ...entry.contextLimits
    } : agentDefaults?.contextLimits,
    heartbeat: entry.heartbeat,
    identity: entry.identity,
    groupChat: entry.groupChat,
    subagents: typeof entry.subagents === "object" && entry.subagents ? entry.subagents : void 0,
    embeddedPi: typeof entry.embeddedPi === "object" && entry.embeddedPi ? entry.embeddedPi : void 0,
    sandbox: entry.sandbox,
    tools: entry.tools
  };
}
function resolveAgentContextLimits(cfg, agentId) {
  const defaults = cfg?.agents?.defaults?.contextLimits;
  if (!cfg || !agentId) return defaults;
  return resolveAgentConfig(cfg, agentId)?.contextLimits ?? defaults;
}
function resolveAgentWorkspaceDir(cfg, agentId) {
  const id = (0, _sessionKeyBh1lMwK.c)(agentId);
  const configured = resolveAgentConfig(cfg, id)?.workspace?.trim();
  if (configured) return stripNullBytes$1((0, _utilsD5DtWkEu.m)(configured));
  const defaultAgentId = resolveDefaultAgentId(cfg);
  const fallback = cfg.agents?.defaults?.workspace?.trim();
  if (id === defaultAgentId) {
    if (fallback) return stripNullBytes$1((0, _utilsD5DtWkEu.m)(fallback));
    return stripNullBytes$1((0, _workspaceHhTlRYqM.g)(process.env));
  }
  if (fallback) return stripNullBytes$1(_nodePath.default.join((0, _utilsD5DtWkEu.m)(fallback), id));
  const stateDir = (0, _pathsDvv9VRAc._)(process.env);
  return stripNullBytes$1(_nodePath.default.join(stateDir, `workspace-${id}`));
}
function resolveAgentDir(cfg, agentId, env = process.env) {
  const id = (0, _sessionKeyBh1lMwK.c)(agentId);
  const configured = resolveAgentConfig(cfg, id)?.agentDir?.trim();
  if (configured) return (0, _utilsD5DtWkEu.m)(configured, env);
  const root = (0, _pathsDvv9VRAc._)(env);
  return _nodePath.default.join(root, "agents", id, "agent");
}
//#endregion
//#region src/agents/agent-scope.ts
/** Strip null bytes from paths to prevent ENOTDIR errors. */
function stripNullBytes(s) {
  return s.replace(/\0/g, "");
}
function resolveSessionAgentIds(params) {
  const defaultAgentId = resolveDefaultAgentId(params.config ?? {});
  const explicitAgentIdRaw = (0, _stringCoerceBUSzWgUA.i)(params.agentId);
  const explicitAgentId = explicitAgentIdRaw ? (0, _sessionKeyBh1lMwK.c)(explicitAgentIdRaw) : null;
  const sessionKey = params.sessionKey?.trim();
  const normalizedSessionKey = sessionKey ? (0, _stringCoerceBUSzWgUA.i)(sessionKey) : void 0;
  const parsed = normalizedSessionKey ? (0, _sessionKeyBh1lMwK.x)(normalizedSessionKey) : null;
  return {
    defaultAgentId,
    sessionAgentId: explicitAgentId ?? (parsed?.agentId ? (0, _sessionKeyBh1lMwK.c)(parsed.agentId) : defaultAgentId)
  };
}
function resolveSessionAgentId(params) {
  return resolveSessionAgentIds(params).sessionAgentId;
}
function resolveAgentExecutionContract(cfg, agentId) {
  const defaultContract = cfg?.agents?.defaults?.embeddedPi?.executionContract;
  if (!cfg || !agentId) return defaultContract;
  return resolveAgentConfig(cfg, agentId)?.embeddedPi?.executionContract ?? defaultContract;
}
function resolveAgentSkillsFilter(cfg, agentId) {
  return (0, _agentFilterCYpmRQt.t)(cfg, agentId);
}
function resolveAgentExplicitModelPrimary(cfg, agentId) {
  const raw = resolveAgentConfig(cfg, agentId)?.model;
  return (0, _stringCoerceBUSzWgUA.f)(raw);
}
function resolveAgentEffectiveModelPrimary(cfg, agentId) {
  return resolveAgentExplicitModelPrimary(cfg, agentId) ?? (0, _stringCoerceBUSzWgUA.f)(cfg.agents?.defaults?.model);
}
function resolveAgentModelPrimary(cfg, agentId) {
  return resolveAgentExplicitModelPrimary(cfg, agentId);
}
function resolveAgentModelFallbacksOverride(cfg, agentId) {
  const raw = resolveAgentConfig(cfg, agentId)?.model;
  if (!raw || typeof raw === "string") return;
  if (!Object.hasOwn(raw, "fallbacks")) return;
  return Array.isArray(raw.fallbacks) ? raw.fallbacks : void 0;
}
function resolveFallbackAgentId(params) {
  const explicitAgentId = (0, _stringCoerceBUSzWgUA.s)(params.agentId) ?? "";
  if (explicitAgentId) return (0, _sessionKeyBh1lMwK.c)(explicitAgentId);
  return (0, _sessionKeyBh1lMwK.u)(params.sessionKey);
}
function resolveRunModelFallbacksOverride(params) {
  if (!params.cfg) return;
  return resolveAgentModelFallbacksOverride(params.cfg, resolveFallbackAgentId({
    agentId: params.agentId,
    sessionKey: params.sessionKey
  }));
}
function hasConfiguredModelFallbacks(params) {
  const fallbacksOverride = resolveRunModelFallbacksOverride(params);
  const defaultFallbacks = (0, _modelInputDFbXtnkw.t)(params.cfg?.agents?.defaults?.model);
  return (fallbacksOverride ?? defaultFallbacks).length > 0;
}
function resolveEffectiveModelFallbacks(params) {
  const agentFallbacksOverride = resolveAgentModelFallbacksOverride(params.cfg, params.agentId);
  if (!params.hasSessionModelOverride) return agentFallbacksOverride;
  const defaultFallbacks = (0, _modelInputDFbXtnkw.t)(params.cfg.agents?.defaults?.model);
  return agentFallbacksOverride ?? defaultFallbacks;
}
function normalizePathForComparison(input) {
  const resolved = _nodePath.default.resolve(stripNullBytes((0, _utilsD5DtWkEu.m)(input)));
  let normalized = resolved;
  try {
    normalized = _nodeFs.default.realpathSync.native(resolved);
  } catch {}
  if (process.platform === "win32") return (0, _stringCoerceBUSzWgUA.r)(normalized);
  return normalized;
}
function isPathWithinRoot(candidatePath, rootPath) {
  const relative = _nodePath.default.relative(rootPath, candidatePath);
  return relative === "" || !relative.startsWith("..") && !_nodePath.default.isAbsolute(relative);
}
function resolveAgentIdsByWorkspacePath(cfg, workspacePath) {
  const normalizedWorkspacePath = normalizePathForComparison(workspacePath);
  const ids = listAgentIds(cfg);
  const matches = [];
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const workspaceDir = normalizePathForComparison(resolveAgentWorkspaceDir(cfg, id));
    if (!isPathWithinRoot(normalizedWorkspacePath, workspaceDir)) continue;
    matches.push({
      id,
      workspaceDir,
      order: index
    });
  }
  matches.sort((left, right) => {
    const workspaceLengthDelta = right.workspaceDir.length - left.workspaceDir.length;
    if (workspaceLengthDelta !== 0) return workspaceLengthDelta;
    return left.order - right.order;
  });
  return matches.map((entry) => entry.id);
}
function resolveAgentIdByWorkspacePath(cfg, workspacePath) {
  return resolveAgentIdsByWorkspacePath(cfg, workspacePath)[0];
}
//#endregion /* v9-1f5370240dd6567c */
