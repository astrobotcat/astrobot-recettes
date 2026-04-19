"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = isToolAllowed;exports.f = exports.d = exports.c = void 0;exports.i = classifyToolAgainstSandboxToolPolicy;exports.l = void 0;exports.n = resolveSandboxConfigForAgent;exports.o = resolveSandboxToolPolicyForAgent;exports.p = void 0;exports.r = resolveSandboxScope;exports.s = void 0;exports.t = resolveSandboxBrowserDockerCreateConfig;exports.u = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _idsCYPyP4SY = require("./ids-CYPyP4SY.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _typesSecretsCeL3gSMO = require("./types.secrets-CeL3gSMO.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _toolPolicyC3rJHw = require("./tool-policy-C3rJHw58.js");
var _globPatternDcufYsPS = require("./glob-pattern-DcufYsPS.js");
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/sandbox/constants.ts
const DEFAULT_SANDBOX_WORKSPACE_ROOT = _nodePath.default.join(_pathsDvv9VRAc.r, "sandboxes");
const DEFAULT_SANDBOX_IMAGE = exports.l = "openclaw-sandbox:bookworm-slim";
const DEFAULT_TOOL_ALLOW = [
"exec",
"process",
"read",
"write",
"edit",
"apply_patch",
"image",
"sessions_list",
"sessions_history",
"sessions_send",
"sessions_spawn",
"sessions_yield",
"subagents",
"session_status"];

const DEFAULT_TOOL_DENY = [
"browser",
"canvas",
"nodes",
"cron",
"gateway",
..._idsCYPyP4SY.t];

const DEFAULT_SANDBOX_BROWSER_IMAGE = exports.s = "openclaw-sandbox-browser:bookworm-slim";
const DEFAULT_SANDBOX_COMMON_IMAGE = exports.c = "openclaw-sandbox-common:bookworm-slim";
const SANDBOX_BROWSER_SECURITY_HASH_EPOCH = exports.f = "2026-04-05-cdp-source-range";
const SANDBOX_AGENT_WORKSPACE_MOUNT = exports.u = "/agent";
const SANDBOX_STATE_DIR = _nodePath.default.join(_pathsDvv9VRAc.r, "sandbox");
const SANDBOX_REGISTRY_PATH = exports.p = _nodePath.default.join(SANDBOX_STATE_DIR, "containers.json");
const SANDBOX_BROWSER_REGISTRY_PATH = exports.d = _nodePath.default.join(SANDBOX_STATE_DIR, "browsers.json");
//#endregion
//#region src/agents/sandbox/tool-policy.ts
function buildSource(params) {
  return {
    source: params.scope,
    key: params.key
  };
}
function pickConfiguredList(params) {
  if (Array.isArray(params.agent)) return {
    values: params.agent,
    source: buildSource({
      scope: "agent",
      key: "agents.list[].tools.sandbox.tools.allow"
    })
  };
  if (Array.isArray(params.global)) return {
    values: params.global,
    source: buildSource({
      scope: "global",
      key: "tools.sandbox.tools.allow"
    })
  };
  return {
    values: void 0,
    source: buildSource({
      scope: "default",
      key: "tools.sandbox.tools.allow"
    })
  };
}
function pickConfiguredDeny(params) {
  if (Array.isArray(params.agent)) return {
    values: params.agent,
    source: buildSource({
      scope: "agent",
      key: "agents.list[].tools.sandbox.tools.deny"
    })
  };
  if (Array.isArray(params.global)) return {
    values: params.global,
    source: buildSource({
      scope: "global",
      key: "tools.sandbox.tools.deny"
    })
  };
  return {
    values: void 0,
    source: buildSource({
      scope: "default",
      key: "tools.sandbox.tools.deny"
    })
  };
}
function pickConfiguredAlsoAllow(params) {
  if (Array.isArray(params.agent)) return {
    values: params.agent,
    source: buildSource({
      scope: "agent",
      key: "agents.list[].tools.sandbox.tools.alsoAllow"
    })
  };
  if (Array.isArray(params.global)) return {
    values: params.global,
    source: buildSource({
      scope: "global",
      key: "tools.sandbox.tools.alsoAllow"
    })
  };
  return {
    values: void 0,
    source: void 0
  };
}
function mergeAllowlist(base, extra) {
  if (Array.isArray(base)) {
    if (base.length === 0) return [];
    if (!Array.isArray(extra) || extra.length === 0) return [...base];
    return Array.from(new Set([...base, ...extra]));
  }
  if (Array.isArray(extra) && extra.length > 0) return Array.from(new Set([...DEFAULT_TOOL_ALLOW, ...extra]));
  return [...DEFAULT_TOOL_ALLOW];
}
function pickAllowSource(params) {
  if (params.allowDefined && params.allow.source === "agent") return params.allow;
  if (params.alsoAllow?.source === "agent") return params.alsoAllow;
  if (params.allowDefined && params.allow.source === "global") return params.allow;
  if (params.alsoAllow?.source === "global") return params.alsoAllow;
  return params.allow;
}
function resolveExplicitSandboxReAllowPatterns(params) {
  return Array.from(new Set([...(params.allow ?? []), ...(params.alsoAllow ?? [])]));
}
function filterDefaultDenyForExplicitAllows(params) {
  if (params.explicitAllowPatterns.length === 0) return [...params.deny];
  const allowPatterns = (0, _globPatternDcufYsPS.t)({
    raw: (0, _toolPolicyC3rJHw.c)(params.explicitAllowPatterns),
    normalize: _toolPolicyC3rJHw.l
  });
  if (allowPatterns.length === 0) return [...params.deny];
  return params.deny.filter((toolName) => !(0, _globPatternDcufYsPS.n)((0, _toolPolicyC3rJHw.l)(toolName), allowPatterns));
}
function expandResolvedPolicy(policy) {
  const expandedDeny = (0, _toolPolicyC3rJHw.c)(policy.deny ?? []);
  let expandedAllow = (0, _toolPolicyC3rJHw.c)(policy.allow ?? []);
  const expandedDenyLower = expandedDeny.map(_stringCoerceBUSzWgUA.i);
  const expandedAllowLower = expandedAllow.map(_stringCoerceBUSzWgUA.i);
  if (expandedAllow.length > 0 && !expandedDenyLower.includes("image") && !expandedAllowLower.includes("image")) expandedAllow = [...expandedAllow, "image"];
  return {
    allow: expandedAllow,
    deny: expandedDeny
  };
}
function classifyToolAgainstSandboxToolPolicy(name, policy) {
  if (!policy) return {
    blockedByDeny: false,
    blockedByAllow: false
  };
  const normalized = (0, _toolPolicyC3rJHw.l)(name);
  const blockedByDeny = (0, _globPatternDcufYsPS.n)(normalized, (0, _globPatternDcufYsPS.t)({
    raw: (0, _toolPolicyC3rJHw.c)(policy.deny ?? []),
    normalize: _toolPolicyC3rJHw.l
  }));
  const allow = (0, _globPatternDcufYsPS.t)({
    raw: (0, _toolPolicyC3rJHw.c)(policy.allow ?? []),
    normalize: _toolPolicyC3rJHw.l
  });
  return {
    blockedByDeny,
    blockedByAllow: !blockedByDeny && allow.length > 0 && !(0, _globPatternDcufYsPS.n)(normalized, allow)
  };
}
function isToolAllowed(policy, name) {
  const { blockedByDeny, blockedByAllow } = classifyToolAgainstSandboxToolPolicy(name, policy);
  return !blockedByDeny && !blockedByAllow;
}
function resolveSandboxToolPolicyForAgent(cfg, agentId) {
  const agentPolicy = (cfg && agentId ? (0, _agentScopeKFH9bkHi._)(cfg, agentId) : void 0)?.tools?.sandbox?.tools;
  const globalPolicy = cfg?.tools?.sandbox?.tools;
  const allowConfig = pickConfiguredList({
    agent: agentPolicy?.allow,
    global: globalPolicy?.allow
  });
  const alsoAllowConfig = pickConfiguredAlsoAllow({
    agent: agentPolicy?.alsoAllow,
    global: globalPolicy?.alsoAllow
  });
  const denyConfig = pickConfiguredDeny({
    agent: agentPolicy?.deny,
    global: globalPolicy?.deny
  });
  const explicitAllowPatterns = resolveExplicitSandboxReAllowPatterns({
    allow: allowConfig.values,
    alsoAllow: alsoAllowConfig.values
  });
  const expanded = expandResolvedPolicy({
    allow: mergeAllowlist(allowConfig.values, alsoAllowConfig.values),
    deny: Array.isArray(denyConfig.values) ? [...denyConfig.values] : filterDefaultDenyForExplicitAllows({
      deny: [...DEFAULT_TOOL_DENY],
      explicitAllowPatterns
    })
  });
  return {
    allow: expanded.allow ?? [],
    deny: expanded.deny ?? [],
    sources: {
      allow: pickAllowSource({
        allow: allowConfig.source,
        allowDefined: Array.isArray(allowConfig.values),
        alsoAllow: alsoAllowConfig.source
      }),
      deny: denyConfig.source
    }
  };
}
//#endregion
//#region src/agents/sandbox/config.ts
const DANGEROUS_SANDBOX_DOCKER_BOOLEAN_KEYS = [
"dangerouslyAllowReservedContainerTargets",
"dangerouslyAllowExternalBindSources",
"dangerouslyAllowContainerNamespaceJoin"];

const DEFAULT_SANDBOX_SSH_COMMAND = "ssh";
const DEFAULT_SANDBOX_SSH_WORKSPACE_ROOT = "/tmp/openclaw-sandboxes";
function resolveDangerousSandboxDockerBooleans(agentDocker, globalDocker) {
  const resolved = {};
  for (const key of DANGEROUS_SANDBOX_DOCKER_BOOLEAN_KEYS) resolved[key] = agentDocker?.[key] ?? globalDocker?.[key];
  return resolved;
}
function resolveSandboxBrowserDockerCreateConfig(params) {
  const browserNetwork = params.browser.network.trim();
  const base = {
    ...params.docker,
    network: browserNetwork || "openclaw-sandbox-browser",
    image: params.browser.image
  };
  return params.browser.binds !== void 0 ? {
    ...base,
    binds: params.browser.binds
  } : base;
}
function resolveSandboxScope(params) {
  if (params.scope) return params.scope;
  if (typeof params.perSession === "boolean") return params.perSession ? "session" : "shared";
  return "agent";
}
function resolveSandboxDockerConfig(params) {
  const agentDocker = params.scope === "shared" ? void 0 : params.agentDocker;
  const globalDocker = params.globalDocker;
  const env = agentDocker?.env ? {
    ...(globalDocker?.env ?? { LANG: "C.UTF-8" }),
    ...agentDocker.env
  } : globalDocker?.env ?? { LANG: "C.UTF-8" };
  const ulimits = agentDocker?.ulimits ? {
    ...globalDocker?.ulimits,
    ...agentDocker.ulimits
  } : globalDocker?.ulimits;
  const binds = [...(globalDocker?.binds ?? []), ...(agentDocker?.binds ?? [])];
  return {
    image: agentDocker?.image ?? globalDocker?.image ?? "openclaw-sandbox:bookworm-slim",
    containerPrefix: agentDocker?.containerPrefix ?? globalDocker?.containerPrefix ?? "openclaw-sbx-",
    workdir: agentDocker?.workdir ?? globalDocker?.workdir ?? "/workspace",
    readOnlyRoot: agentDocker?.readOnlyRoot ?? globalDocker?.readOnlyRoot ?? true,
    tmpfs: agentDocker?.tmpfs ?? globalDocker?.tmpfs ?? [
    "/tmp",
    "/var/tmp",
    "/run"],

    network: agentDocker?.network ?? globalDocker?.network ?? "none",
    user: agentDocker?.user ?? globalDocker?.user,
    capDrop: agentDocker?.capDrop ?? globalDocker?.capDrop ?? ["ALL"],
    env,
    setupCommand: agentDocker?.setupCommand ?? globalDocker?.setupCommand,
    pidsLimit: agentDocker?.pidsLimit ?? globalDocker?.pidsLimit,
    memory: agentDocker?.memory ?? globalDocker?.memory,
    memorySwap: agentDocker?.memorySwap ?? globalDocker?.memorySwap,
    cpus: agentDocker?.cpus ?? globalDocker?.cpus,
    ulimits,
    seccompProfile: agentDocker?.seccompProfile ?? globalDocker?.seccompProfile,
    apparmorProfile: agentDocker?.apparmorProfile ?? globalDocker?.apparmorProfile,
    dns: agentDocker?.dns ?? globalDocker?.dns,
    extraHosts: agentDocker?.extraHosts ?? globalDocker?.extraHosts,
    binds: binds.length ? binds : void 0,
    ...resolveDangerousSandboxDockerBooleans(agentDocker, globalDocker)
  };
}
function resolveSandboxBrowserConfig(params) {
  const agentBrowser = params.scope === "shared" ? void 0 : params.agentBrowser;
  const globalBrowser = params.globalBrowser;
  const binds = [...(globalBrowser?.binds ?? []), ...(agentBrowser?.binds ?? [])];
  const bindsConfigured = globalBrowser?.binds !== void 0 || agentBrowser?.binds !== void 0;
  return {
    enabled: agentBrowser?.enabled ?? globalBrowser?.enabled ?? false,
    image: agentBrowser?.image ?? globalBrowser?.image ?? "openclaw-sandbox-browser:bookworm-slim",
    containerPrefix: agentBrowser?.containerPrefix ?? globalBrowser?.containerPrefix ?? "openclaw-sbx-browser-",
    network: agentBrowser?.network ?? globalBrowser?.network ?? "openclaw-sandbox-browser",
    cdpPort: agentBrowser?.cdpPort ?? globalBrowser?.cdpPort ?? 9222,
    cdpSourceRange: agentBrowser?.cdpSourceRange ?? globalBrowser?.cdpSourceRange,
    vncPort: agentBrowser?.vncPort ?? globalBrowser?.vncPort ?? 5900,
    noVncPort: agentBrowser?.noVncPort ?? globalBrowser?.noVncPort ?? 6080,
    headless: agentBrowser?.headless ?? globalBrowser?.headless ?? false,
    enableNoVnc: agentBrowser?.enableNoVnc ?? globalBrowser?.enableNoVnc ?? true,
    allowHostControl: agentBrowser?.allowHostControl ?? globalBrowser?.allowHostControl ?? false,
    autoStart: agentBrowser?.autoStart ?? globalBrowser?.autoStart ?? true,
    autoStartTimeoutMs: agentBrowser?.autoStartTimeoutMs ?? globalBrowser?.autoStartTimeoutMs ?? 12e3,
    binds: bindsConfigured ? binds : void 0
  };
}
function resolveSandboxPruneConfig(params) {
  const agentPrune = params.scope === "shared" ? void 0 : params.agentPrune;
  const globalPrune = params.globalPrune;
  return {
    idleHours: agentPrune?.idleHours ?? globalPrune?.idleHours ?? 24,
    maxAgeDays: agentPrune?.maxAgeDays ?? globalPrune?.maxAgeDays ?? 7
  };
}
function normalizeRemoteRoot(value, fallback) {
  const normalized = (0, _stringCoerceBUSzWgUA.s)(value) ?? fallback;
  const posix = normalized.replaceAll("\\", "/");
  if (!posix.startsWith("/")) throw new Error(`Sandbox SSH workspaceRoot must be an absolute POSIX path: ${normalized}`);
  return posix.replace(/\/+$/g, "") || "/";
}
function resolveSandboxSshConfig(params) {
  const agentSsh = params.scope === "shared" ? void 0 : params.agentSsh;
  const globalSsh = params.globalSsh;
  return {
    target: (0, _stringCoerceBUSzWgUA.s)(agentSsh?.target ?? globalSsh?.target),
    command: (0, _stringCoerceBUSzWgUA.s)(agentSsh?.command ?? globalSsh?.command) ?? DEFAULT_SANDBOX_SSH_COMMAND,
    workspaceRoot: normalizeRemoteRoot(agentSsh?.workspaceRoot ?? globalSsh?.workspaceRoot, DEFAULT_SANDBOX_SSH_WORKSPACE_ROOT),
    strictHostKeyChecking: agentSsh?.strictHostKeyChecking ?? globalSsh?.strictHostKeyChecking ?? true,
    updateHostKeys: agentSsh?.updateHostKeys ?? globalSsh?.updateHostKeys ?? true,
    identityFile: (0, _stringCoerceBUSzWgUA.s)(agentSsh?.identityFile ?? globalSsh?.identityFile),
    certificateFile: (0, _stringCoerceBUSzWgUA.s)(agentSsh?.certificateFile ?? globalSsh?.certificateFile),
    knownHostsFile: (0, _stringCoerceBUSzWgUA.s)(agentSsh?.knownHostsFile ?? globalSsh?.knownHostsFile),
    identityData: (0, _typesSecretsCeL3gSMO.l)(agentSsh?.identityData ?? globalSsh?.identityData),
    certificateData: (0, _typesSecretsCeL3gSMO.l)(agentSsh?.certificateData ?? globalSsh?.certificateData),
    knownHostsData: (0, _typesSecretsCeL3gSMO.l)(agentSsh?.knownHostsData ?? globalSsh?.knownHostsData)
  };
}
function resolveSandboxConfigForAgent(cfg, agentId) {
  const agent = cfg?.agents?.defaults?.sandbox;
  let agentSandbox;
  const agentConfig = cfg && agentId ? (0, _agentScopeKFH9bkHi._)(cfg, agentId) : void 0;
  if (agentConfig?.sandbox) agentSandbox = agentConfig.sandbox;
  const legacyAgentSandbox = agentSandbox;
  const legacyDefaultSandbox = agent;
  const scope = resolveSandboxScope({
    scope: agentSandbox?.scope ?? agent?.scope,
    perSession: legacyAgentSandbox?.perSession ?? legacyDefaultSandbox?.perSession
  });
  const toolPolicy = resolveSandboxToolPolicyForAgent(cfg, agentId);
  return {
    mode: agentSandbox?.mode ?? agent?.mode ?? "off",
    backend: agentSandbox?.backend?.trim() || agent?.backend?.trim() || "docker",
    scope,
    workspaceAccess: agentSandbox?.workspaceAccess ?? agent?.workspaceAccess ?? "none",
    workspaceRoot: agentSandbox?.workspaceRoot ?? agent?.workspaceRoot ?? DEFAULT_SANDBOX_WORKSPACE_ROOT,
    docker: resolveSandboxDockerConfig({
      scope,
      globalDocker: agent?.docker,
      agentDocker: agentSandbox?.docker
    }),
    ssh: resolveSandboxSshConfig({
      scope,
      globalSsh: agent?.ssh,
      agentSsh: agentSandbox?.ssh
    }),
    browser: resolveSandboxBrowserConfig({
      scope,
      globalBrowser: agent?.browser,
      agentBrowser: agentSandbox?.browser
    }),
    tools: {
      allow: toolPolicy.allow,
      deny: toolPolicy.deny
    },
    prune: resolveSandboxPruneConfig({
      scope,
      globalPrune: agent?.prune,
      agentPrune: agentSandbox?.prune
    })
  };
}
//#endregion /* v9-fc44adb68908a52a */
