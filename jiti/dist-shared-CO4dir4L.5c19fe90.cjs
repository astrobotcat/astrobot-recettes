"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = void 0;exports.c = normalizeAlias;exports.d = resolveModelTarget;exports.f = updateConfig;exports.i = void 0;exports.l = resolveKnownAgentId;exports.n = void 0;exports.o = loadValidConfigOrThrow;exports.p = upsertCanonicalModelConfigEntry;exports.r = void 0;exports.s = mergePrimaryFallbackConfig;exports.t = applyDefaultModelPrimaryUpdate;exports.u = resolveModelKeysFromEntries;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _commandFormatDd3uP = require("./command-format-Dd3uP9-6.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _defaultsCiQa3xnX = require("./defaults-CiQa3xnX.js");
var _modelInputDFbXtnkw = require("./model-input-DFbXtnkw.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _configQ9XZc_2I = require("./config-Q9XZc_2I.js");
var _issueFormatEKtDEAmx = require("./issue-format-EKtDEAmx.js");
var _modelSelectionCli_3Gn8Wcd = require("./model-selection-cli-_3Gn8Wcd.js");
var _modelSelectionCTdyYoio = require("./model-selection-CTdyYoio.js");
//#region src/commands/models/shared.ts
const ensureFlagCompatibility = (opts) => {
  if (opts.json && opts.plain) throw new Error("Choose either --json or --plain, not both.");
};exports.n = ensureFlagCompatibility;
const formatTokenK = (value) => {
  if (!value || !Number.isFinite(value)) return "-";
  if (value < 1024) return `${Math.round(value)}`;
  return `${Math.round(value / 1024)}k`;
};exports.i = formatTokenK;
const formatMs = (value) => {
  if (value === null || value === void 0) return "-";
  if (!Number.isFinite(value)) return "-";
  if (value < 1e3) return `${Math.round(value)}ms`;
  return `${Math.round(value / 100) / 10}s`;
};exports.r = formatMs;
const isLocalBaseUrl = (baseUrl) => {
  try {
    const host = (0, _stringCoerceBUSzWgUA.i)(new URL(baseUrl).hostname);
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" || host.endsWith(".local");
  } catch {
    return false;
  }
};exports.a = isLocalBaseUrl;
async function loadValidConfigOrThrow() {
  const snapshot = await (0, _io5pxHCi7V.l)();
  if (!snapshot.valid) {
    const issues = (0, _issueFormatEKtDEAmx.n)(snapshot.issues, "-").join("\n");
    throw new Error(`Invalid config at ${snapshot.path}\n${issues}`);
  }
  return snapshot.runtimeConfig ?? snapshot.config;
}
async function updateConfig(mutator) {
  const snapshot = await (0, _io5pxHCi7V.l)();
  if (!snapshot.valid) {
    const issues = (0, _issueFormatEKtDEAmx.n)(snapshot.issues, "-").join("\n");
    throw new Error(`Invalid config at ${snapshot.path}\n${issues}`);
  }
  const next = mutator(structuredClone(snapshot.sourceConfig ?? snapshot.config));
  await (0, _configQ9XZc_2I.r)({
    nextConfig: next,
    baseHash: snapshot.hash
  });
  return next;
}
function resolveModelTarget(params) {
  const aliasIndex = (0, _modelSelectionCTdyYoio.i)({
    cfg: params.cfg,
    defaultProvider: _defaultsCiQa3xnX.r
  });
  const resolved = (0, _modelSelectionCTdyYoio.m)({
    raw: params.raw,
    defaultProvider: _defaultsCiQa3xnX.r,
    aliasIndex
  });
  if (!resolved) throw new Error(`Invalid model reference: ${params.raw}`);
  return resolved.ref;
}
function resolveModelKeysFromEntries(params) {
  const aliasIndex = (0, _modelSelectionCTdyYoio.i)({
    cfg: params.cfg,
    defaultProvider: _defaultsCiQa3xnX.r
  });
  return params.entries.map((entry) => (0, _modelSelectionCTdyYoio.m)({
    raw: entry,
    defaultProvider: _defaultsCiQa3xnX.r,
    aliasIndex
  })).filter((entry) => Boolean(entry)).map((entry) => (0, _modelSelectionCli_3Gn8Wcd.f)(entry.ref.provider, entry.ref.model));
}
function normalizeAlias(alias) {
  const trimmed = alias.trim();
  if (!trimmed) throw new Error("Alias cannot be empty.");
  if (!/^[A-Za-z0-9_.:-]+$/.test(trimmed)) throw new Error("Alias must use letters, numbers, dots, underscores, colons, or dashes.");
  return trimmed;
}
function resolveKnownAgentId(params) {
  const raw = params.rawAgentId?.trim();
  if (!raw) return;
  const agentId = (0, _sessionKeyBh1lMwK.c)(raw);
  if (!(0, _agentScopeKFH9bkHi.g)(params.cfg).includes(agentId)) throw new Error(`Unknown agent id "${raw}". Use "${(0, _commandFormatDd3uP.t)("openclaw agents list")}" to see configured agents.`);
  return agentId;
}
function upsertCanonicalModelConfigEntry(models, params) {
  const key = (0, _modelSelectionCli_3Gn8Wcd.f)(params.provider, params.model);
  const legacyKey = (0, _modelSelectionCli_3Gn8Wcd.d)(params.provider, params.model);
  if (!models[key]) if (legacyKey && models[legacyKey]) models[key] = models[legacyKey];else
  models[key] = {};
  if (legacyKey) delete models[legacyKey];
  return key;
}
function mergePrimaryFallbackConfig(existing, patch) {
  const next = { ...(existing && typeof existing === "object" ? existing : void 0) };
  if (patch.primary !== void 0) next.primary = patch.primary;
  if (patch.fallbacks !== void 0) next.fallbacks = patch.fallbacks;
  return next;
}
function applyDefaultModelPrimaryUpdate(params) {
  const resolved = resolveModelTarget({
    raw: params.modelRaw,
    cfg: params.cfg
  });
  const nextModels = { ...params.cfg.agents?.defaults?.models };
  const key = upsertCanonicalModelConfigEntry(nextModels, resolved);
  const defaults = params.cfg.agents?.defaults ?? {};
  const existing = (0, _modelInputDFbXtnkw.r)(defaults[params.field]);
  return {
    ...params.cfg,
    agents: {
      ...params.cfg.agents,
      defaults: {
        ...defaults,
        [params.field]: mergePrimaryFallbackConfig(existing, { primary: key }),
        models: nextModels
      }
    }
  };
}
/**
* Model key format: "provider/model"
*
* The model key is displayed in `/model status` and used to reference models.
* When using `/model <key>`, use the exact format shown (e.g., "openrouter/moonshotai/kimi-k2").
*
* For providers with hierarchical model IDs (e.g., OpenRouter), the model ID may include
* sub-providers (e.g., "moonshotai/kimi-k2"), resulting in a key like "openrouter/moonshotai/kimi-k2".
*/
//#endregion /* v9-3a45654c23e9f180 */
