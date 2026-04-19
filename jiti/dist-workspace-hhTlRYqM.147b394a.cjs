"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports._ = resolveWorkspaceTemplateDir;exports.c = exports.a = void 0;exports.d = ensureAgentWorkspace;exports.f = filterBootstrapFilesForSession;exports.g = resolveDefaultAgentWorkspaceDir;exports.h = loadWorkspaceBootstrapFiles;exports.l = exports.i = void 0;exports.m = loadExtraBootstrapFilesWithDiagnostics;exports.o = exports.n = void 0;exports.p = isWorkspaceSetupCompleted;exports.u = exports.t = exports.s = exports.r = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _homeDirBEqRdfoa = require("./home-dir-BEqRdfoa.js");
var _openclawRootBNWw3cXT = require("./openclaw-root-BNWw3cXT.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _execBAdwyfxI = require("./exec-BAdwyfxI.js");
var _boundaryFileReadDXLy_w6L = require("./boundary-file-read-DXLy_w6L.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _nodeUrl = require("node:url");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeOs = _interopRequireDefault(require("node:os"));
var _promises = _interopRequireDefault(require("node:fs/promises"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/workspace-templates.ts
const FALLBACK_TEMPLATE_DIR = _nodePath.default.resolve(_nodePath.default.dirname((0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/workspace-hhTlRYqM.js")), "../../docs/reference/templates");
let cachedTemplateDir;
let resolvingTemplateDir;
async function resolveWorkspaceTemplateDir(opts) {
  if (cachedTemplateDir) return cachedTemplateDir;
  if (resolvingTemplateDir) return resolvingTemplateDir;
  resolvingTemplateDir = (async () => {
    const moduleUrl = opts?.moduleUrl ?? "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/workspace-hhTlRYqM.js";
    const argv1 = opts?.argv1 ?? process.argv[1];
    const cwd = opts?.cwd ?? process.cwd();
    const packageRoot = await (0, _openclawRootBNWw3cXT.t)({
      moduleUrl,
      argv1,
      cwd
    });
    const candidates = [
    packageRoot ? _nodePath.default.join(packageRoot, "docs", "reference", "templates") : null,
    cwd ? _nodePath.default.resolve(cwd, "docs", "reference", "templates") : null,
    FALLBACK_TEMPLATE_DIR].
    filter(Boolean);
    for (const candidate of candidates) if (await (0, _utilsD5DtWkEu.d)(candidate)) {
      cachedTemplateDir = candidate;
      return candidate;
    }
    cachedTemplateDir = candidates[0] ?? FALLBACK_TEMPLATE_DIR;
    return cachedTemplateDir;
  })();
  try {
    return await resolvingTemplateDir;
  } finally {
    resolvingTemplateDir = void 0;
  }
}
//#endregion
//#region src/agents/workspace.ts
function resolveDefaultAgentWorkspaceDir(env = process.env, homedir = _nodeOs.default.homedir) {
  const home = (0, _homeDirBEqRdfoa.o)(env, homedir);
  const profile = env.OPENCLAW_PROFILE?.trim();
  if (profile && (0, _stringCoerceBUSzWgUA.o)(profile) !== "default") return _nodePath.default.join(home, ".openclaw", `workspace-${profile}`);
  return _nodePath.default.join(home, ".openclaw", "workspace");
}
const DEFAULT_AGENT_WORKSPACE_DIR = exports.n = resolveDefaultAgentWorkspaceDir();
const DEFAULT_AGENTS_FILENAME = exports.t = "AGENTS.md";
const DEFAULT_SOUL_FILENAME = exports.c = "SOUL.md";
const DEFAULT_TOOLS_FILENAME = exports.l = "TOOLS.md";
const DEFAULT_IDENTITY_FILENAME = exports.a = "IDENTITY.md";
const DEFAULT_USER_FILENAME = exports.u = "USER.md";
const DEFAULT_HEARTBEAT_FILENAME = exports.i = "HEARTBEAT.md";
const DEFAULT_BOOTSTRAP_FILENAME = exports.r = "BOOTSTRAP.md";
const DEFAULT_MEMORY_FILENAME = exports.s = "MEMORY.md";
const DEFAULT_MEMORY_ALT_FILENAME = exports.o = "memory.md";
const WORKSPACE_STATE_DIRNAME = ".openclaw";
const WORKSPACE_STATE_FILENAME = "workspace-state.json";
const WORKSPACE_STATE_VERSION = 1;
const workspaceTemplateCache = /* @__PURE__ */new Map();
let gitAvailabilityPromise = null;
const MAX_WORKSPACE_BOOTSTRAP_FILE_BYTES = 2 * 1024 * 1024;
const workspaceFileCache = /* @__PURE__ */new Map();
function workspaceFileIdentity(stat, canonicalPath) {
  return `${canonicalPath}|${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}`;
}
async function readWorkspaceFileWithGuards(params) {
  const opened = await (0, _boundaryFileReadDXLy_w6L.r)({
    absolutePath: params.filePath,
    rootPath: params.workspaceDir,
    boundaryLabel: "workspace root",
    maxBytes: MAX_WORKSPACE_BOOTSTRAP_FILE_BYTES
  });
  if (!opened.ok) {
    workspaceFileCache.delete(params.filePath);
    return opened;
  }
  const identity = workspaceFileIdentity(opened.stat, opened.path);
  const cached = workspaceFileCache.get(params.filePath);
  if (cached && cached.identity === identity) {
    _nodeFs.default.closeSync(opened.fd);
    return {
      ok: true,
      content: cached.content
    };
  }
  try {
    const content = _nodeFs.default.readFileSync(opened.fd, "utf-8");
    workspaceFileCache.set(params.filePath, {
      content,
      identity
    });
    return {
      ok: true,
      content
    };
  } catch (error) {
    workspaceFileCache.delete(params.filePath);
    return {
      ok: false,
      reason: "io",
      error
    };
  } finally {
    _nodeFs.default.closeSync(opened.fd);
  }
}
function stripFrontMatter(content) {
  if (!content.startsWith("---")) return content;
  const endIndex = content.indexOf("\n---", 3);
  if (endIndex === -1) return content;
  const start = endIndex + 4;
  let trimmed = content.slice(start);
  trimmed = trimmed.replace(/^\s+/, "");
  return trimmed;
}
async function loadTemplate(name) {
  const cached = workspaceTemplateCache.get(name);
  if (cached) return cached;
  const pending = (async () => {
    const templateDir = await resolveWorkspaceTemplateDir();
    const templatePath = _nodePath.default.join(templateDir, name);
    try {
      return stripFrontMatter(await _promises.default.readFile(templatePath, "utf-8"));
    } catch {
      throw new Error(`Missing workspace template: ${name} (${templatePath}). Ensure docs/reference/templates are packaged.`);
    }
  })();
  workspaceTemplateCache.set(name, pending);
  try {
    return await pending;
  } catch (error) {
    workspaceTemplateCache.delete(name);
    throw error;
  }
}
/** Set of recognized bootstrap filenames for runtime validation */
const VALID_BOOTSTRAP_NAMES = new Set([
DEFAULT_AGENTS_FILENAME,
DEFAULT_SOUL_FILENAME,
DEFAULT_TOOLS_FILENAME,
DEFAULT_IDENTITY_FILENAME,
DEFAULT_USER_FILENAME,
DEFAULT_HEARTBEAT_FILENAME,
DEFAULT_BOOTSTRAP_FILENAME,
DEFAULT_MEMORY_FILENAME,
DEFAULT_MEMORY_ALT_FILENAME]
);
async function writeFileIfMissing(filePath, content) {
  try {
    await _promises.default.writeFile(filePath, content, {
      encoding: "utf-8",
      flag: "wx"
    });
    return true;
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
    return false;
  }
}
async function fileExists(filePath) {
  try {
    await _promises.default.access(filePath);
    return true;
  } catch {
    return false;
  }
}
function resolveWorkspaceStatePath(dir) {
  return _nodePath.default.join(dir, WORKSPACE_STATE_DIRNAME, WORKSPACE_STATE_FILENAME);
}
function parseWorkspaceSetupState(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const legacyCompletedAt = (0, _stringCoerceBUSzWgUA.d)(parsed.onboardingCompletedAt);
    return {
      version: WORKSPACE_STATE_VERSION,
      bootstrapSeededAt: (0, _stringCoerceBUSzWgUA.d)(parsed.bootstrapSeededAt),
      setupCompletedAt: (0, _stringCoerceBUSzWgUA.d)(parsed.setupCompletedAt) ?? legacyCompletedAt
    };
  } catch {
    return null;
  }
}
async function readWorkspaceSetupState(statePath) {
  try {
    const raw = await _promises.default.readFile(statePath, "utf-8");
    const parsed = parseWorkspaceSetupState(raw);
    if (parsed && raw.includes("\"onboardingCompletedAt\"") && !raw.includes("\"setupCompletedAt\"") && parsed.setupCompletedAt) await writeWorkspaceSetupState(statePath, parsed);
    return parsed ?? { version: WORKSPACE_STATE_VERSION };
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    return { version: WORKSPACE_STATE_VERSION };
  }
}
async function readWorkspaceSetupStateForDir(dir) {
  return await readWorkspaceSetupState(resolveWorkspaceStatePath((0, _utilsD5DtWkEu.m)(dir)));
}
async function isWorkspaceSetupCompleted(dir) {
  const state = await readWorkspaceSetupStateForDir(dir);
  return typeof state.setupCompletedAt === "string" && state.setupCompletedAt.trim().length > 0;
}
async function writeWorkspaceSetupState(statePath, state) {
  await _promises.default.mkdir(_nodePath.default.dirname(statePath), { recursive: true });
  const payload = `${JSON.stringify(state, null, 2)}\n`;
  const tmpPath = `${statePath}.tmp-${process.pid}-${Date.now().toString(36)}`;
  try {
    await _promises.default.writeFile(tmpPath, payload, { encoding: "utf-8" });
    await _promises.default.rename(tmpPath, statePath);
  } catch (err) {
    await _promises.default.unlink(tmpPath).catch(() => {});
    throw err;
  }
}
async function hasGitRepo(dir) {
  try {
    await _promises.default.stat(_nodePath.default.join(dir, ".git"));
    return true;
  } catch {
    return false;
  }
}
async function isGitAvailable() {
  if (gitAvailabilityPromise) return gitAvailabilityPromise;
  gitAvailabilityPromise = (async () => {
    try {
      return (await (0, _execBAdwyfxI.r)(["git", "--version"], { timeoutMs: 2e3 })).code === 0;
    } catch {
      return false;
    }
  })();
  return gitAvailabilityPromise;
}
async function ensureGitRepo(dir, isBrandNewWorkspace) {
  if (!isBrandNewWorkspace) return;
  if (await hasGitRepo(dir)) return;
  if (!(await isGitAvailable())) return;
  try {
    await (0, _execBAdwyfxI.r)(["git", "init"], {
      cwd: dir,
      timeoutMs: 1e4
    });
  } catch {}
}
async function ensureAgentWorkspace(params) {
  const dir = (0, _utilsD5DtWkEu.m)(params?.dir?.trim() ? params.dir.trim() : DEFAULT_AGENT_WORKSPACE_DIR);
  await _promises.default.mkdir(dir, { recursive: true });
  if (!params?.ensureBootstrapFiles) return { dir };
  const agentsPath = _nodePath.default.join(dir, DEFAULT_AGENTS_FILENAME);
  const soulPath = _nodePath.default.join(dir, DEFAULT_SOUL_FILENAME);
  const toolsPath = _nodePath.default.join(dir, DEFAULT_TOOLS_FILENAME);
  const identityPath = _nodePath.default.join(dir, DEFAULT_IDENTITY_FILENAME);
  const userPath = _nodePath.default.join(dir, DEFAULT_USER_FILENAME);
  const heartbeatPath = _nodePath.default.join(dir, DEFAULT_HEARTBEAT_FILENAME);
  const bootstrapPath = _nodePath.default.join(dir, DEFAULT_BOOTSTRAP_FILENAME);
  const statePath = resolveWorkspaceStatePath(dir);
  const isBrandNewWorkspace = await (async () => {
    const templatePaths = [
    agentsPath,
    soulPath,
    toolsPath,
    identityPath,
    userPath,
    heartbeatPath];

    const userContentPaths = [
    _nodePath.default.join(dir, "memory"),
    _nodePath.default.join(dir, DEFAULT_MEMORY_FILENAME),
    _nodePath.default.join(dir, ".git")];

    const paths = [...templatePaths, ...userContentPaths];
    return (await Promise.all(paths.map(async (p) => {
      try {
        await _promises.default.access(p);
        return true;
      } catch {
        return false;
      }
    }))).every((v) => !v);
  })();
  const agentsTemplate = await loadTemplate(DEFAULT_AGENTS_FILENAME);
  const soulTemplate = await loadTemplate(DEFAULT_SOUL_FILENAME);
  const toolsTemplate = await loadTemplate(DEFAULT_TOOLS_FILENAME);
  const identityTemplate = await loadTemplate(DEFAULT_IDENTITY_FILENAME);
  const userTemplate = await loadTemplate(DEFAULT_USER_FILENAME);
  const heartbeatTemplate = await loadTemplate(DEFAULT_HEARTBEAT_FILENAME);
  await writeFileIfMissing(agentsPath, agentsTemplate);
  await writeFileIfMissing(soulPath, soulTemplate);
  await writeFileIfMissing(toolsPath, toolsTemplate);
  const identityPathCreated = await writeFileIfMissing(identityPath, identityTemplate);
  await writeFileIfMissing(userPath, userTemplate);
  await writeFileIfMissing(heartbeatPath, heartbeatTemplate);
  let state = await readWorkspaceSetupState(statePath);
  let stateDirty = false;
  const markState = (next) => {
    state = {
      ...state,
      ...next
    };
    stateDirty = true;
  };
  const nowIso = () => (/* @__PURE__ */new Date()).toISOString();
  let bootstrapExists = await fileExists(bootstrapPath);
  if (!state.bootstrapSeededAt && bootstrapExists) markState({ bootstrapSeededAt: nowIso() });
  if (!state.setupCompletedAt && state.bootstrapSeededAt && !bootstrapExists) markState({ setupCompletedAt: nowIso() });
  if (!state.bootstrapSeededAt && !state.setupCompletedAt && !bootstrapExists) {
    const [identityContent, userContent] = await Promise.all([_promises.default.readFile(identityPath, "utf-8"), _promises.default.readFile(userPath, "utf-8")]);
    const hasUserContent = await (async () => {
      const indicators = [
      _nodePath.default.join(dir, "memory"),
      _nodePath.default.join(dir, DEFAULT_MEMORY_FILENAME),
      _nodePath.default.join(dir, ".git")];

      for (const indicator of indicators) try {
        await _promises.default.access(indicator);
        return true;
      } catch {}
      return false;
    })();
    if (identityContent !== identityTemplate || userContent !== userTemplate || hasUserContent) markState({ setupCompletedAt: nowIso() });else
    {
      if (!(await writeFileIfMissing(bootstrapPath, await loadTemplate("BOOTSTRAP.md")))) bootstrapExists = await fileExists(bootstrapPath);else
      bootstrapExists = true;
      if (bootstrapExists && !state.bootstrapSeededAt) markState({ bootstrapSeededAt: nowIso() });
    }
  }
  if (stateDirty) await writeWorkspaceSetupState(statePath, state);
  await ensureGitRepo(dir, isBrandNewWorkspace);
  return {
    dir,
    agentsPath,
    soulPath,
    toolsPath,
    identityPath,
    userPath,
    heartbeatPath,
    bootstrapPath,
    identityPathCreated
  };
}
async function resolveMemoryBootstrapEntry(resolvedDir) {
  for (const name of [DEFAULT_MEMORY_FILENAME, DEFAULT_MEMORY_ALT_FILENAME]) {
    const filePath = _nodePath.default.join(resolvedDir, name);
    try {
      await _promises.default.access(filePath);
      return {
        name,
        filePath
      };
    } catch {}
  }
  return null;
}
async function loadWorkspaceBootstrapFiles(dir) {
  const resolvedDir = (0, _utilsD5DtWkEu.m)(dir);
  const entries = [
  {
    name: DEFAULT_AGENTS_FILENAME,
    filePath: _nodePath.default.join(resolvedDir, DEFAULT_AGENTS_FILENAME)
  },
  {
    name: DEFAULT_SOUL_FILENAME,
    filePath: _nodePath.default.join(resolvedDir, DEFAULT_SOUL_FILENAME)
  },
  {
    name: DEFAULT_TOOLS_FILENAME,
    filePath: _nodePath.default.join(resolvedDir, DEFAULT_TOOLS_FILENAME)
  },
  {
    name: DEFAULT_IDENTITY_FILENAME,
    filePath: _nodePath.default.join(resolvedDir, DEFAULT_IDENTITY_FILENAME)
  },
  {
    name: DEFAULT_USER_FILENAME,
    filePath: _nodePath.default.join(resolvedDir, DEFAULT_USER_FILENAME)
  },
  {
    name: DEFAULT_HEARTBEAT_FILENAME,
    filePath: _nodePath.default.join(resolvedDir, DEFAULT_HEARTBEAT_FILENAME)
  },
  {
    name: DEFAULT_BOOTSTRAP_FILENAME,
    filePath: _nodePath.default.join(resolvedDir, DEFAULT_BOOTSTRAP_FILENAME)
  }];

  const memoryEntry = await resolveMemoryBootstrapEntry(resolvedDir);
  if (memoryEntry) entries.push(memoryEntry);
  const result = [];
  for (const entry of entries) {
    const loaded = await readWorkspaceFileWithGuards({
      filePath: entry.filePath,
      workspaceDir: resolvedDir
    });
    if (loaded.ok) result.push({
      name: entry.name,
      path: entry.filePath,
      content: loaded.content,
      missing: false
    });else
    result.push({
      name: entry.name,
      path: entry.filePath,
      missing: true
    });
  }
  return result;
}
const MINIMAL_BOOTSTRAP_ALLOWLIST = new Set([
DEFAULT_AGENTS_FILENAME,
DEFAULT_TOOLS_FILENAME,
DEFAULT_SOUL_FILENAME,
DEFAULT_IDENTITY_FILENAME,
DEFAULT_USER_FILENAME]
);
function filterBootstrapFilesForSession(files, sessionKey) {
  if (!sessionKey || !(0, _sessionKeyBh1lMwK.b)(sessionKey) && !(0, _sessionKeyBh1lMwK.y)(sessionKey)) return files;
  return files.filter((file) => MINIMAL_BOOTSTRAP_ALLOWLIST.has(file.name));
}
async function loadExtraBootstrapFilesWithDiagnostics(dir, extraPatterns) {
  if (!extraPatterns.length) return {
    files: [],
    diagnostics: []
  };
  const resolvedDir = (0, _utilsD5DtWkEu.m)(dir);
  const resolvedPaths = /* @__PURE__ */new Set();
  for (const pattern of extraPatterns) if (pattern.includes("*") || pattern.includes("?") || pattern.includes("{")) try {
    const matches = _promises.default.glob(pattern, { cwd: resolvedDir });
    for await (const m of matches) resolvedPaths.add(m);
  } catch {
    resolvedPaths.add(pattern);
  } else
  resolvedPaths.add(pattern);
  const files = [];
  const diagnostics = [];
  for (const relPath of resolvedPaths) {
    const filePath = _nodePath.default.resolve(resolvedDir, relPath);
    const baseName = _nodePath.default.basename(relPath);
    if (!VALID_BOOTSTRAP_NAMES.has(baseName)) {
      diagnostics.push({
        path: filePath,
        reason: "invalid-bootstrap-filename",
        detail: `unsupported bootstrap basename: ${baseName}`
      });
      continue;
    }
    const loaded = await readWorkspaceFileWithGuards({
      filePath,
      workspaceDir: resolvedDir
    });
    if (loaded.ok) {
      files.push({
        name: baseName,
        path: filePath,
        content: loaded.content,
        missing: false
      });
      continue;
    }
    const reason = loaded.reason === "path" ? "missing" : loaded.reason === "validation" ? "security" : "io";
    diagnostics.push({
      path: filePath,
      reason,
      detail: loaded.error instanceof Error ? loaded.error.message : typeof loaded.error === "string" ? loaded.error : reason
    });
  }
  return {
    files,
    diagnostics
  };
}
//#endregion /* v9-90f23bb10d46aeb4 */
