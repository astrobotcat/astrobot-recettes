"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveEnvApiKey;var _shellEnvDTnWMCId = require("./shell-env-DTnWMCId.js");
var _providerEnvVarsSjBhOn = require("./provider-env-vars-Sj-BhOn9.js");
var _setupRegistryYtDuF5P = require("./setup-registry-ytDuF5P6.js");
var _modelAuthMarkersVeOgG6R = require("./model-auth-markers-ve-OgG6R.js");
var _normalizeSecretInputDqcJmob = require("./normalize-secret-input-DqcJmob1.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeOs = _interopRequireDefault(require("node:os"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/model-auth-env.ts
function hasGoogleVertexAdcCredentials(env) {
  const explicitCredentialsPath = (0, _normalizeSecretInputDqcJmob.t)(env.GOOGLE_APPLICATION_CREDENTIALS);
  if (explicitCredentialsPath) return _nodeFs.default.existsSync(explicitCredentialsPath);
  const homeDir = (0, _normalizeSecretInputDqcJmob.t)(env.HOME) ?? _nodeOs.default.homedir();
  return _nodeFs.default.existsSync(_nodePath.default.join(homeDir, ".config", "gcloud", "application_default_credentials.json"));
}
function resolveGoogleVertexEnvApiKey(env) {
  const explicitApiKey = (0, _normalizeSecretInputDqcJmob.t)(env.GOOGLE_CLOUD_API_KEY);
  if (explicitApiKey) return explicitApiKey;
  const hasProject = Boolean(env.GOOGLE_CLOUD_PROJECT || env.GCLOUD_PROJECT);
  const hasLocation = Boolean(env.GOOGLE_CLOUD_LOCATION);
  return hasProject && hasLocation && hasGoogleVertexAdcCredentials(env) ? _modelAuthMarkersVeOgG6R.n : void 0;
}
function resolveEnvApiKey(provider, env = process.env) {
  const normalized = (0, _providerEnvVarsSjBhOn.o)(provider, { env });
  const candidateMap = (0, _modelAuthMarkersVeOgG6R._)({ env });
  const applied = new Set((0, _shellEnvDTnWMCId.t)());
  const pick = (envVar) => {
    const value = (0, _normalizeSecretInputDqcJmob.t)(env[envVar]);
    if (!value) return null;
    return {
      apiKey: value,
      source: applied.has(envVar) ? `shell env: ${envVar}` : `env: ${envVar}`
    };
  };
  const candidates = Object.hasOwn(candidateMap, normalized) ? candidateMap[normalized] : void 0;
  if (Array.isArray(candidates)) {
    for (const envVar of candidates) {
      const resolved = pick(envVar);
      if (resolved) return resolved;
    }
    return null;
  }
  if (normalized === "google-vertex") {
    const envKey = resolveGoogleVertexEnvApiKey(env);
    if (!envKey) return null;
    return {
      apiKey: envKey,
      source: "gcloud adc"
    };
  }
  const setupProvider = (0, _setupRegistryYtDuF5P.r)({
    provider: normalized,
    env
  });
  if (setupProvider?.resolveConfigApiKey) {
    const resolved = setupProvider.resolveConfigApiKey({
      provider: normalized,
      env
    });
    if (resolved?.trim()) return {
      apiKey: resolved,
      source: resolved === "gcp-vertex-credentials" ? "gcloud adc" : "env"
    };
  }
  return null;
}
//#endregion /* v9-6bbb7c7aa5f55adf */
