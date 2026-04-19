"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = createConfigRuntimeEnv;exports.n = readStateDirDotEnvVarsFromStateDir;exports.r = applyConfigEnvVars;exports.t = collectDurableServiceEnvVars;var _hostEnvSecurityC2piJKe = require("./host-env-security-C2piJKe2.js");
var _envSubstitution3wGlQjxu = require("./env-substitution-3wGlQjxu.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _dotenv = _interopRequireDefault(require("dotenv"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/config/config-env-vars.ts
function isBlockedConfigEnvVar(key) {
  return (0, _hostEnvSecurityC2piJKe.r)(key) || (0, _hostEnvSecurityC2piJKe.n)(key);
}
function collectConfigEnvVarsByTarget(cfg) {
  const envConfig = cfg?.env;
  if (!envConfig) return {};
  const entries = {};
  if (envConfig.vars) for (const [rawKey, value] of Object.entries(envConfig.vars)) {
    if (!value) continue;
    const key = (0, _hostEnvSecurityC2piJKe.i)(rawKey, { portable: true });
    if (!key) continue;
    if (isBlockedConfigEnvVar(key)) continue;
    entries[key] = value;
  }
  for (const [rawKey, value] of Object.entries(envConfig)) {
    if (rawKey === "shellEnv" || rawKey === "vars") continue;
    if (typeof value !== "string" || !value.trim()) continue;
    const key = (0, _hostEnvSecurityC2piJKe.i)(rawKey, { portable: true });
    if (!key) continue;
    if (isBlockedConfigEnvVar(key)) continue;
    entries[key] = value;
  }
  return entries;
}
function collectConfigRuntimeEnvVars(cfg) {
  return collectConfigEnvVarsByTarget(cfg);
}
function collectConfigServiceEnvVars(cfg) {
  return collectConfigEnvVarsByTarget(cfg);
}
function createConfigRuntimeEnv(cfg, baseEnv = process.env) {
  const env = { ...baseEnv };
  applyConfigEnvVars(cfg, env);
  return env;
}
function applyConfigEnvVars(cfg, env = process.env) {
  const entries = collectConfigRuntimeEnvVars(cfg);
  for (const [key, value] of Object.entries(entries)) {
    if (env[key]?.trim()) continue;
    if ((0, _envSubstitution3wGlQjxu.n)(value)) continue;
    env[key] = value;
  }
}
//#endregion
//#region src/config/state-dir-dotenv.ts
function isBlockedServiceEnvVar(key) {
  return (0, _hostEnvSecurityC2piJKe.r)(key) || (0, _hostEnvSecurityC2piJKe.n)(key);
}
function parseStateDirDotEnvContent(content) {
  const parsed = _dotenv.default.parse(content);
  const entries = {};
  for (const [rawKey, value] of Object.entries(parsed)) {
    if (!value?.trim()) continue;
    const key = (0, _hostEnvSecurityC2piJKe.i)(rawKey, { portable: true });
    if (!key) continue;
    if (isBlockedServiceEnvVar(key)) continue;
    entries[key] = value;
  }
  return entries;
}
function readStateDirDotEnvVarsFromStateDir(stateDir) {
  const dotEnvPath = _nodePath.default.join(stateDir, ".env");
  try {
    return parseStateDirDotEnvContent(_nodeFs.default.readFileSync(dotEnvPath, "utf8"));
  } catch {
    return {};
  }
}
/**
* Read and parse `~/.openclaw/.env` (or `$OPENCLAW_STATE_DIR/.env`), returning
* a filtered record of key-value pairs suitable for embedding in a service
* environment (LaunchAgent plist, systemd unit, Scheduled Task).
*/
function readStateDirDotEnvVars(env) {
  return readStateDirDotEnvVarsFromStateDir((0, _pathsDvv9VRAc._)(env));
}
/**
* Durable service env sources survive beyond the invoking shell and are safe to
* persist into gateway install metadata.
*
* Precedence:
* 1. state-dir `.env` file vars
* 2. config service env vars
*/
function collectDurableServiceEnvVars(params) {
  return {
    ...readStateDirDotEnvVars(params.env),
    ...collectConfigServiceEnvVars(params.config)
  };
}
//#endregion /* v9-9f09005a9892785c */
