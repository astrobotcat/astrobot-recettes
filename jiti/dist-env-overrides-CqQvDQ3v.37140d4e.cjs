"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = isBundledSkillAllowed;exports.c = resolveSkillConfig;exports.d = resolveOpenClawMetadata;exports.f = resolveSkillInvocationPolicy;exports.i = resolveSkillRuntimeConfig;exports.l = shouldIncludeSkill;exports.n = applySkillEnvOverridesFromSnapshot;exports.o = isConfigPathTruthy;exports.p = resolveSkillKey;exports.r = getActiveSkillEnvKeys;exports.s = resolveBundledAllowlist;exports.t = applySkillEnvOverrides;exports.u = parseFrontmatter;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _hostEnvSecurityC2piJKe = require("./host-env-security-C2piJKe2.js");
var _typesSecretsCeL3gSMO = require("./types.secrets-CeL3gSMO.js");
var _stringNormalizationXm3f27dv = require("./string-normalization-xm3f27dv.js");
var _runtimeSnapshotBwqEmc6G = require("./runtime-snapshot-BwqEmc6G.js");
var _configEvalA4HeiCWe = require("./config-eval-A4HeiCWe.js");
var _npmRegistrySpecDAd5Xcsy = require("./npm-registry-spec-DAd5Xcsy.js");
var _frontmatterBzZTDWV_ = require("./frontmatter-BzZTDWV_.js");
var _sanitizeEnvVarsOg3CRoPL = require("./sanitize-env-vars-Og3CRoPL.js");
//#region src/agents/skills/frontmatter.ts
function parseFrontmatter(content) {
  return (0, _frontmatterBzZTDWV_.u)(content);
}
const BREW_FORMULA_PATTERN = /^[A-Za-z0-9][A-Za-z0-9@+._/-]*$/;
const GO_MODULE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~+\-/]*(?:@[A-Za-z0-9][A-Za-z0-9._~+\-/]*)?$/;
const UV_PACKAGE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._\-[\]=<>!~+,]*$/;
function normalizeSafeBrewFormula(raw) {
  if (typeof raw !== "string") return;
  const formula = raw.trim();
  if (!formula || formula.startsWith("-") || formula.includes("\\") || formula.includes("..")) return;
  if (!BREW_FORMULA_PATTERN.test(formula)) return;
  return formula;
}
function normalizeSafeNpmSpec(raw) {
  if (typeof raw !== "string") return;
  const spec = raw.trim();
  if (!spec || spec.startsWith("-")) return;
  if ((0, _npmRegistrySpecDAd5Xcsy.i)(spec) !== null) return;
  return spec;
}
function normalizeSafeGoModule(raw) {
  if (typeof raw !== "string") return;
  const moduleSpec = raw.trim();
  if (!moduleSpec || moduleSpec.startsWith("-") || moduleSpec.includes("\\") || moduleSpec.includes("://")) return;
  if (!GO_MODULE_PATTERN.test(moduleSpec)) return;
  return moduleSpec;
}
function normalizeSafeUvPackage(raw) {
  if (typeof raw !== "string") return;
  const pkg = raw.trim();
  if (!pkg || pkg.startsWith("-") || pkg.includes("\\") || pkg.includes("://")) return;
  if (!UV_PACKAGE_PATTERN.test(pkg)) return;
  return pkg;
}
function normalizeSafeDownloadUrl(raw) {
  if (typeof raw !== "string") return;
  const value = raw.trim();
  if (!value || /\s/.test(value)) return;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
    return parsed.toString();
  } catch {
    return;
  }
}
function parseInstallSpec(input) {
  const parsed = (0, _frontmatterBzZTDWV_.a)(input, [
  "brew",
  "node",
  "go",
  "uv",
  "download"]
  );
  if (!parsed) return;
  const { raw } = parsed;
  const spec = (0, _frontmatterBzZTDWV_.t)({ kind: parsed.kind }, parsed);
  const osList = (0, _frontmatterBzZTDWV_.r)(raw.os);
  if (osList.length > 0) spec.os = osList;
  const formula = normalizeSafeBrewFormula(raw.formula);
  if (formula) spec.formula = formula;
  const cask = normalizeSafeBrewFormula(raw.cask);
  if (!spec.formula && cask) spec.formula = cask;
  if (spec.kind === "node") {
    const pkg = normalizeSafeNpmSpec(raw.package);
    if (pkg) spec.package = pkg;
  } else if (spec.kind === "uv") {
    const pkg = normalizeSafeUvPackage(raw.package);
    if (pkg) spec.package = pkg;
  }
  const moduleSpec = normalizeSafeGoModule(raw.module);
  if (moduleSpec) spec.module = moduleSpec;
  const downloadUrl = normalizeSafeDownloadUrl(raw.url);
  if (downloadUrl) spec.url = downloadUrl;
  if (typeof raw.archive === "string") spec.archive = raw.archive;
  if (typeof raw.extract === "boolean") spec.extract = raw.extract;
  if (typeof raw.stripComponents === "number") spec.stripComponents = raw.stripComponents;
  if (typeof raw.targetDir === "string") spec.targetDir = raw.targetDir;
  if (spec.kind === "brew" && !spec.formula) return;
  if (spec.kind === "node" && !spec.package) return;
  if (spec.kind === "go" && !spec.module) return;
  if (spec.kind === "uv" && !spec.package) return;
  if (spec.kind === "download" && !spec.url) return;
  return spec;
}
function resolveOpenClawMetadata(frontmatter) {
  const metadataObj = (0, _frontmatterBzZTDWV_.o)({ frontmatter });
  if (!metadataObj) return;
  const requires = (0, _frontmatterBzZTDWV_.l)(metadataObj);
  const install = (0, _frontmatterBzZTDWV_.s)(metadataObj, parseInstallSpec);
  const osRaw = (0, _frontmatterBzZTDWV_.c)(metadataObj);
  return {
    always: typeof metadataObj.always === "boolean" ? metadataObj.always : void 0,
    emoji: (0, _stringCoerceBUSzWgUA.d)(metadataObj.emoji),
    homepage: (0, _stringCoerceBUSzWgUA.d)(metadataObj.homepage),
    skillKey: (0, _stringCoerceBUSzWgUA.d)(metadataObj.skillKey),
    primaryEnv: (0, _stringCoerceBUSzWgUA.d)(metadataObj.primaryEnv),
    os: osRaw.length > 0 ? osRaw : void 0,
    requires,
    install: install.length > 0 ? install : void 0
  };
}
function resolveSkillInvocationPolicy(frontmatter) {
  return {
    userInvocable: (0, _frontmatterBzZTDWV_.i)((0, _frontmatterBzZTDWV_.n)(frontmatter, "user-invocable"), true),
    disableModelInvocation: (0, _frontmatterBzZTDWV_.i)((0, _frontmatterBzZTDWV_.n)(frontmatter, "disable-model-invocation"), false)
  };
}
function resolveSkillKey(skill, entry) {
  return entry?.metadata?.skillKey ?? skill.name;
}
//#endregion
//#region src/agents/skills/config.ts
const DEFAULT_CONFIG_VALUES = {
  "browser.enabled": true,
  "browser.evaluateEnabled": true
};
function isConfigPathTruthy(config, pathStr) {
  return (0, _configEvalA4HeiCWe.r)(config, pathStr, DEFAULT_CONFIG_VALUES);
}
function resolveSkillConfig(config, skillKey) {
  const skills = config?.skills?.entries;
  if (!skills || typeof skills !== "object") return;
  const entry = skills[skillKey];
  if (!entry || typeof entry !== "object") return;
  return entry;
}
function normalizeAllowlist(input) {
  if (!input) return;
  if (!Array.isArray(input)) return;
  const normalized = (0, _stringNormalizationXm3f27dv.s)(input);
  return normalized.length > 0 ? normalized : void 0;
}
const BUNDLED_SOURCES = new Set(["openclaw-bundled"]);
function isBundledSkill(entry) {
  return BUNDLED_SOURCES.has((0, _sanitizeEnvVarsOg3CRoPL.r)(entry.skill));
}
function resolveBundledAllowlist(config) {
  return normalizeAllowlist(config?.skills?.allowBundled);
}
function isBundledSkillAllowed(entry, allowlist) {
  if (!allowlist || allowlist.length === 0) return true;
  if (!isBundledSkill(entry)) return true;
  const key = resolveSkillKey(entry.skill, entry);
  return allowlist.includes(key) || allowlist.includes(entry.skill.name);
}
function shouldIncludeSkill(params) {
  const { entry, config, eligibility } = params;
  const skillConfig = resolveSkillConfig(config, resolveSkillKey(entry.skill, entry));
  const allowBundled = normalizeAllowlist(config?.skills?.allowBundled);
  if (skillConfig?.enabled === false) return false;
  if (!isBundledSkillAllowed(entry, allowBundled)) return false;
  return (0, _configEvalA4HeiCWe.t)({
    os: entry.metadata?.os,
    remotePlatforms: eligibility?.remote?.platforms,
    always: entry.metadata?.always,
    requires: entry.metadata?.requires,
    hasBin: _configEvalA4HeiCWe.n,
    hasRemoteBin: eligibility?.remote?.hasBin,
    hasAnyRemoteBin: eligibility?.remote?.hasAnyBin,
    hasEnv: (envName) => Boolean(process.env[envName] || skillConfig?.env?.[envName] || skillConfig?.apiKey && entry.metadata?.primaryEnv === envName),
    isConfigPathTruthy: (configPath) => isConfigPathTruthy(config, configPath)
  });
}
//#endregion
//#region src/agents/skills/runtime-config.ts
function hasConfiguredSkillApiKeyRef(config) {
  const entries = config?.skills?.entries;
  if (!entries || typeof entries !== "object") return false;
  for (const skillConfig of Object.values(entries)) {
    if (!skillConfig || typeof skillConfig !== "object") continue;
    if ((0, _typesSecretsCeL3gSMO.i)(skillConfig.apiKey) !== null) return true;
  }
  return false;
}
function resolveSkillRuntimeConfig(config) {
  const runtimeConfig = (0, _runtimeSnapshotBwqEmc6G.r)();
  if (!runtimeConfig) return config;
  if (!config) return runtimeConfig;
  const runtimeHasRawSkillSecretRefs = hasConfiguredSkillApiKeyRef(runtimeConfig);
  const configHasRawSkillSecretRefs = hasConfiguredSkillApiKeyRef(config);
  if (runtimeHasRawSkillSecretRefs && !configHasRawSkillSecretRefs) return config;
  return runtimeConfig;
}
//#endregion
//#region src/agents/skills/env-overrides.ts
const log = (0, _subsystemCgmckbux.t)("env-overrides");
/**
* Tracks env var keys that are currently injected by skill overrides.
* Used by ACP harness spawn to strip skill-injected keys so they don't
* leak to child processes (e.g., OPENAI_API_KEY leaking to Codex CLI).
* @see https://github.com/openclaw/openclaw/issues/36280
*/
const activeSkillEnvEntries = /* @__PURE__ */new Map();
/** Returns a snapshot of env var keys currently injected by skill overrides. */
function getActiveSkillEnvKeys() {
  return new Set(activeSkillEnvEntries.keys());
}
function acquireActiveSkillEnvKey(key, value) {
  const active = activeSkillEnvEntries.get(key);
  if (active) {
    active.count += 1;
    if (process.env[key] === void 0) process.env[key] = active.value;
    return true;
  }
  if (process.env[key] !== void 0) return false;
  activeSkillEnvEntries.set(key, {
    baseline: process.env[key],
    value,
    count: 1
  });
  return true;
}
function releaseActiveSkillEnvKey(key) {
  const active = activeSkillEnvEntries.get(key);
  if (!active) return;
  active.count -= 1;
  if (active.count > 0) {
    if (process.env[key] === void 0) process.env[key] = active.value;
    return;
  }
  activeSkillEnvEntries.delete(key);
  if (active.baseline === void 0) delete process.env[key];else
  process.env[key] = active.baseline;
}
const SKILL_ALWAYS_BLOCKED_ENV_PATTERNS = [/^OPENSSL_CONF$/i];
function matchesAnyPattern(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}
function isAlwaysBlockedSkillEnvKey(key) {
  return (0, _hostEnvSecurityC2piJKe.r)(key) || (0, _hostEnvSecurityC2piJKe.n)(key) || matchesAnyPattern(key, SKILL_ALWAYS_BLOCKED_ENV_PATTERNS);
}
function sanitizeSkillEnvOverrides(params) {
  if (Object.keys(params.overrides).length === 0) return {
    allowed: {},
    blocked: [],
    warnings: []
  };
  const result = (0, _sanitizeEnvVarsOg3CRoPL.t)(params.overrides);
  const allowed = {};
  const blocked = /* @__PURE__ */new Set();
  const warnings = [...result.warnings];
  for (const [key, value] of Object.entries(result.allowed)) {
    if (isAlwaysBlockedSkillEnvKey(key)) {
      blocked.add(key);
      continue;
    }
    allowed[key] = value;
  }
  for (const key of result.blocked) {
    if (isAlwaysBlockedSkillEnvKey(key) || !params.allowedSensitiveKeys.has(key)) {
      blocked.add(key);
      continue;
    }
    const value = params.overrides[key];
    if (!value) continue;
    const warning = (0, _sanitizeEnvVarsOg3CRoPL.n)(value);
    if (warning) {
      if (warning === "Contains null bytes") {
        blocked.add(key);
        continue;
      }
      warnings.push(`${key}: ${warning}`);
    }
    allowed[key] = value;
  }
  return {
    allowed,
    blocked: [...blocked],
    warnings
  };
}
function applySkillConfigEnvOverrides(params) {
  const { updates, skillConfig, primaryEnv, requiredEnv, skillKey } = params;
  const allowedSensitiveKeys = /* @__PURE__ */new Set();
  const normalizedPrimaryEnv = primaryEnv?.trim();
  if (normalizedPrimaryEnv) allowedSensitiveKeys.add(normalizedPrimaryEnv);
  for (const envName of requiredEnv ?? []) {
    const trimmedEnv = envName.trim();
    if (trimmedEnv) allowedSensitiveKeys.add(trimmedEnv);
  }
  const pendingOverrides = {};
  if (skillConfig.env) for (const [rawKey, envValue] of Object.entries(skillConfig.env)) {
    const envKey = rawKey.trim();
    const hasExternallyManagedValue = process.env[envKey] !== void 0 && !activeSkillEnvEntries.has(envKey);
    if (!envKey || !envValue || hasExternallyManagedValue) continue;
    pendingOverrides[envKey] = envValue;
  }
  if (normalizedPrimaryEnv && (process.env[normalizedPrimaryEnv] === void 0 || activeSkillEnvEntries.has(normalizedPrimaryEnv)) && !pendingOverrides[normalizedPrimaryEnv]) {
    const resolvedApiKey = (0, _typesSecretsCeL3gSMO.c)({
      value: skillConfig.apiKey,
      path: `skills.entries.${skillKey}.apiKey`
    }) ?? "";
    if (resolvedApiKey) pendingOverrides[normalizedPrimaryEnv] = resolvedApiKey;
  }
  const sanitized = sanitizeSkillEnvOverrides({
    overrides: pendingOverrides,
    allowedSensitiveKeys
  });
  if (sanitized.blocked.length > 0) log.warn(`Blocked skill env overrides for ${skillKey}: ${sanitized.blocked.join(", ")}`);
  if (sanitized.warnings.length > 0) log.warn(`Suspicious skill env overrides for ${skillKey}: ${sanitized.warnings.join(", ")}`);
  for (const [envKey, envValue] of Object.entries(sanitized.allowed)) {
    if (!acquireActiveSkillEnvKey(envKey, envValue)) continue;
    updates.push({ key: envKey });
    process.env[envKey] = activeSkillEnvEntries.get(envKey)?.value ?? envValue;
  }
}
function createEnvReverter(updates) {
  return () => {
    for (const update of updates) releaseActiveSkillEnvKey(update.key);
  };
}
function applySkillEnvOverrides(params) {
  const { skills } = params;
  const config = resolveSkillRuntimeConfig(params.config);
  const updates = [];
  for (const entry of skills) {
    const skillKey = resolveSkillKey(entry.skill, entry);
    const skillConfig = resolveSkillConfig(config, skillKey);
    if (!skillConfig) continue;
    applySkillConfigEnvOverrides({
      updates,
      skillConfig,
      primaryEnv: entry.metadata?.primaryEnv,
      requiredEnv: entry.metadata?.requires?.env,
      skillKey
    });
  }
  return createEnvReverter(updates);
}
function applySkillEnvOverridesFromSnapshot(params) {
  const { snapshot } = params;
  const config = resolveSkillRuntimeConfig(params.config);
  if (!snapshot) return () => {};
  const updates = [];
  for (const skill of snapshot.skills) {
    const skillConfig = resolveSkillConfig(config, skill.name);
    if (!skillConfig) continue;
    applySkillConfigEnvOverrides({
      updates,
      skillConfig,
      primaryEnv: skill.primaryEnv,
      requiredEnv: skill.requiredEnv,
      skillKey: skill.name
    });
  }
  return createEnvReverter(updates);
}
//#endregion /* v9-36f0cefa28e472a8 */
