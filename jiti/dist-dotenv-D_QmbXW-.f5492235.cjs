"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = loadGlobalRuntimeDotEnvFiles;exports.r = loadWorkspaceDotEnvFile;exports.t = loadDotEnv;var _homeDirBEqRdfoa = require("./home-dir-BEqRdfoa.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _hostEnvSecurityC2piJKe = require("./host-env-security-C2piJKe2.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeOs = _interopRequireDefault(require("node:os"));
var _dotenv = _interopRequireDefault(require("dotenv"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/dotenv.ts
const BLOCKED_WORKSPACE_DOTENV_KEYS = new Set([
"ALL_PROXY",
"ANTHROPIC_API_KEY",
"ANTHROPIC_OAUTH_TOKEN",
"BROWSER_EXECUTABLE_PATH",
"CLAWHUB_AUTH_TOKEN",
"CLAWHUB_CONFIG_PATH",
"CLAWHUB_TOKEN",
"CLAWHUB_URL",
"HTTP_PROXY",
"HTTPS_PROXY",
"NODE_TLS_REJECT_UNAUTHORIZED",
"NO_PROXY",
"OPENAI_API_KEY",
"OPENAI_API_KEYS",
"OPENCLAW_AGENT_DIR",
"OPENCLAW_ALLOW_INSECURE_PRIVATE_WS",
"OPENCLAW_ALLOW_PROJECT_LOCAL_BIN",
"OPENCLAW_BROWSER_EXECUTABLE_PATH",
"OPENCLAW_BROWSER_CONTROL_MODULE",
"OPENCLAW_BUNDLED_HOOKS_DIR",
"OPENCLAW_BUNDLED_PLUGINS_DIR",
"OPENCLAW_BUNDLED_SKILLS_DIR",
"OPENCLAW_CACHE_TRACE",
"OPENCLAW_CACHE_TRACE_FILE",
"OPENCLAW_CACHE_TRACE_MESSAGES",
"OPENCLAW_CACHE_TRACE_PROMPT",
"OPENCLAW_CACHE_TRACE_SYSTEM",
"OPENCLAW_CONFIG_PATH",
"OPENCLAW_GATEWAY_PASSWORD",
"OPENCLAW_GATEWAY_PORT",
"OPENCLAW_GATEWAY_SECRET",
"OPENCLAW_GATEWAY_TOKEN",
"OPENCLAW_GATEWAY_URL",
"OPENCLAW_HOME",
"OPENCLAW_LIVE_ANTHROPIC_KEY",
"OPENCLAW_LIVE_ANTHROPIC_KEYS",
"OPENCLAW_LIVE_GEMINI_KEY",
"OPENCLAW_LIVE_OPENAI_KEY",
"OPENCLAW_MPM_CATALOG_PATHS",
"OPENCLAW_NODE_EXEC_FALLBACK",
"OPENCLAW_NODE_EXEC_HOST",
"OPENCLAW_OAUTH_DIR",
"OPENCLAW_PINNED_PYTHON",
"OPENCLAW_PINNED_WRITE_PYTHON",
"OPENCLAW_PLUGIN_CATALOG_PATHS",
"OPENCLAW_PROFILE",
"OPENCLAW_RAW_STREAM",
"OPENCLAW_RAW_STREAM_PATH",
"OPENCLAW_SHOW_SECRETS",
"OPENCLAW_SKIP_BROWSER_CONTROL_SERVER",
"OPENCLAW_STATE_DIR",
"OPENCLAW_TEST_TAILSCALE_BINARY",
"PI_CODING_AGENT_DIR",
"PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH",
"UV_PYTHON"]
);
const BLOCKED_WORKSPACE_DOTENV_SUFFIXES = ["_BASE_URL"];
const BLOCKED_WORKSPACE_DOTENV_PREFIXES = [
"ANTHROPIC_API_KEY_",
"CLAWHUB_",
"OPENAI_API_KEY_",
"OPENCLAW_CLAWHUB_",
"OPENCLAW_DISABLE_",
"OPENCLAW_SKIP_",
"OPENCLAW_UPDATE_"];

function shouldBlockWorkspaceRuntimeDotEnvKey(key) {
  return (0, _hostEnvSecurityC2piJKe.r)(key) || (0, _hostEnvSecurityC2piJKe.n)(key);
}
function shouldBlockRuntimeDotEnvKey(key) {
  return false;
}
function shouldBlockWorkspaceDotEnvKey(key) {
  const upper = key.toUpperCase();
  return shouldBlockWorkspaceRuntimeDotEnvKey(upper) || BLOCKED_WORKSPACE_DOTENV_KEYS.has(upper) || BLOCKED_WORKSPACE_DOTENV_PREFIXES.some((prefix) => upper.startsWith(prefix)) || BLOCKED_WORKSPACE_DOTENV_SUFFIXES.some((suffix) => upper.endsWith(suffix));
}
function readDotEnvFile(params) {
  let content;
  try {
    content = _nodeFs.default.readFileSync(params.filePath, "utf8");
  } catch (error) {
    if (!params.quiet) {
      if ((error && typeof error === "object" && "code" in error ? String(error.code) : void 0) !== "ENOENT") console.warn(`[dotenv] Failed to read ${params.filePath}: ${String(error)}`);
    }
    return null;
  }
  let parsed;
  try {
    parsed = _dotenv.default.parse(content);
  } catch (error) {
    if (!params.quiet) console.warn(`[dotenv] Failed to parse ${params.filePath}: ${String(error)}`);
    return null;
  }
  const entries = [];
  for (const [rawKey, value] of Object.entries(parsed)) {
    const key = (0, _hostEnvSecurityC2piJKe.i)(rawKey, { portable: true });
    if (!key || params.shouldBlockKey(key)) continue;
    entries.push({
      key,
      value
    });
  }
  return {
    filePath: params.filePath,
    entries
  };
}
function loadWorkspaceDotEnvFile(filePath, opts) {
  const parsed = readDotEnvFile({
    filePath,
    shouldBlockKey: shouldBlockWorkspaceDotEnvKey,
    quiet: opts?.quiet ?? true
  });
  if (!parsed) return;
  for (const { key, value } of parsed.entries) {
    if (process.env[key] !== void 0) continue;
    process.env[key] = value;
  }
}
function loadParsedDotEnvFiles(files) {
  const preExistingKeys = new Set(Object.keys(process.env));
  const conflicts = /* @__PURE__ */new Map();
  const firstSeen = /* @__PURE__ */new Map();
  for (const file of files) for (const { key, value } of file.entries) {
    if (preExistingKeys.has(key)) continue;
    const previous = firstSeen.get(key);
    if (previous) {
      if (previous.value !== value) {
        const conflictKey = `${previous.filePath}\u0000${file.filePath}`;
        const existing = conflicts.get(conflictKey);
        if (existing) existing.keys.add(key);else
        conflicts.set(conflictKey, {
          keptPath: previous.filePath,
          ignoredPath: file.filePath,
          keys: new Set([key])
        });
      }
      continue;
    }
    firstSeen.set(key, {
      value,
      filePath: file.filePath
    });
    if (process.env[key] === void 0) process.env[key] = value;
  }
  for (const conflict of conflicts.values()) {
    const keys = [...conflict.keys].toSorted();
    if (keys.length === 0) continue;
    console.warn(`[dotenv] Conflicting values in ${conflict.keptPath} and ${conflict.ignoredPath} for ${keys.join(", ")}; keeping ${conflict.keptPath}.`);
  }
}
function loadGlobalRuntimeDotEnvFiles(opts) {
  const quiet = opts?.quiet ?? true;
  const stateEnvPath = opts?.stateEnvPath ?? _nodePath.default.join((0, _utilsD5DtWkEu.f)(process.env), ".env");
  const defaultStateEnvPath = _nodePath.default.join((0, _homeDirBEqRdfoa.o)(process.env, _nodeOs.default.homedir), ".openclaw", ".env");
  const hasExplicitNonDefaultStateDir = process.env.OPENCLAW_STATE_DIR?.trim() !== void 0 && _nodePath.default.resolve(stateEnvPath) !== _nodePath.default.resolve(defaultStateEnvPath);
  const parsedFiles = [readDotEnvFile({
    filePath: stateEnvPath,
    shouldBlockKey: shouldBlockRuntimeDotEnvKey,
    quiet
  })];
  if (!hasExplicitNonDefaultStateDir) parsedFiles.push(readDotEnvFile({
    filePath: _nodePath.default.join((0, _homeDirBEqRdfoa.o)(process.env, _nodeOs.default.homedir), ".config", "openclaw", "gateway.env"),
    shouldBlockKey: shouldBlockRuntimeDotEnvKey,
    quiet
  }));
  loadParsedDotEnvFiles(parsedFiles.filter((file) => file !== null));
}
function loadDotEnv(opts) {
  const quiet = opts?.quiet ?? true;
  loadWorkspaceDotEnvFile(_nodePath.default.join(process.cwd(), ".env"), { quiet });
  loadGlobalRuntimeDotEnvFiles({ quiet });
}
//#endregion /* v9-ce7e858e61fedc4d */
