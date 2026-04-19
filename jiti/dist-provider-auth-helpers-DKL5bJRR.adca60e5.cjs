"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = writeOAuthCredentials;exports.n = buildApiKeyCredential;exports.r = upsertApiKeyProfile;exports.t = applyAuthProfileConfig;var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _typesSecretsCeL3gSMO = require("./types.secrets-CeL3gSMO.js");
var _providerEnvVarsSjBhOn = require("./provider-env-vars-Sj-BhOn9.js");
var _agentPathsJWlHCT = require("./agent-paths-JWlHCT48.js");
var _normalizeSecretInputDqcJmob = require("./normalize-secret-input-DqcJmob1.js");
var _identityDWKLr7xb = require("./identity-DWKLr7xb.js");
var _profilesCVErLX2C = require("./profiles-CVErLX2C.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugins/provider-auth-helpers.ts
const ENV_REF_PATTERN = /^\$\{([A-Z][A-Z0-9_]*)\}$/;
const resolveAuthAgentDir = (agentDir) => agentDir ?? (0, _agentPathsJWlHCT.t)();
function buildEnvSecretRef(id) {
  return {
    source: "env",
    provider: _typesSecretsCeL3gSMO.t,
    id
  };
}
function parseEnvSecretRef(value) {
  const match = ENV_REF_PATTERN.exec(value);
  if (!match) return null;
  return buildEnvSecretRef(match[1]);
}
function resolveProviderDefaultEnvSecretRef(provider, config) {
  const envVar = (0, _providerEnvVarsSjBhOn.t)(provider, {
    ...(config ? { config } : {}),
    includeUntrustedWorkspacePlugins: false
  })?.find((candidate) => candidate.trim().length > 0);
  if (!envVar) throw new Error(`Provider "${provider}" does not have a default env var mapping for secret-input-mode=ref.`);
  return buildEnvSecretRef(envVar);
}
function resolveApiKeySecretInput(provider, input, options) {
  if (options?.secretInputMode === "plaintext") return (0, _normalizeSecretInputDqcJmob.n)(input);
  const coercedRef = (0, _typesSecretsCeL3gSMO.i)(input);
  if (coercedRef) return coercedRef;
  const normalized = (0, _normalizeSecretInputDqcJmob.n)(input);
  const inlineEnvRef = parseEnvSecretRef(normalized);
  if (inlineEnvRef) return inlineEnvRef;
  if (options?.secretInputMode === "ref") return resolveProviderDefaultEnvSecretRef(provider, options.config);
  return normalized;
}
function buildApiKeyCredential(provider, input, metadata, options) {
  const secretInput = resolveApiKeySecretInput(provider, input, options);
  if (typeof secretInput === "string") return {
    type: "api_key",
    provider,
    key: secretInput,
    ...(metadata ? { metadata } : {})
  };
  return {
    type: "api_key",
    provider,
    keyRef: secretInput,
    ...(metadata ? { metadata } : {})
  };
}
function upsertApiKeyProfile(params) {
  const profileId = params.profileId ?? (0, _identityDWKLr7xb.t)({ providerId: params.provider });
  (0, _profilesCVErLX2C.o)({
    profileId,
    credential: buildApiKeyCredential(params.provider, params.input, params.metadata, params.options),
    agentDir: resolveAuthAgentDir(params.agentDir)
  });
  return profileId;
}
function applyAuthProfileConfig(cfg, params) {
  const normalizedProvider = (0, _providerEnvVarsSjBhOn.o)(params.provider, { config: cfg });
  const profiles = {
    ...cfg.auth?.profiles,
    [params.profileId]: {
      provider: params.provider,
      mode: params.mode,
      ...(params.email ? { email: params.email } : {}),
      ...(params.displayName ? { displayName: params.displayName } : {})
    }
  };
  const configuredProviderProfiles = Object.entries(cfg.auth?.profiles ?? {}).filter(([, profile]) => (0, _providerEnvVarsSjBhOn.o)(profile.provider, { config: cfg }) === normalizedProvider).map(([profileId, profile]) => ({
    profileId,
    mode: profile.mode
  }));
  const matchingProviderOrderEntries = Object.entries(cfg.auth?.order ?? {}).filter(([providerId]) => (0, _providerEnvVarsSjBhOn.o)(providerId, { config: cfg }) === normalizedProvider);
  const existingProviderOrder = matchingProviderOrderEntries.length > 0 ? [...new Set(matchingProviderOrderEntries.flatMap(([, order]) => order))] : void 0;
  const preferProfileFirst = params.preferProfileFirst ?? true;
  const reorderedProviderOrder = existingProviderOrder && preferProfileFirst ? [params.profileId, ...existingProviderOrder.filter((profileId) => profileId !== params.profileId)] : existingProviderOrder;
  const hasMixedConfiguredModes = configuredProviderProfiles.some(({ profileId, mode }) => profileId !== params.profileId && mode !== params.mode);
  const derivedProviderOrder = existingProviderOrder === void 0 && preferProfileFirst && hasMixedConfiguredModes ? [params.profileId, ...configuredProviderProfiles.map(({ profileId }) => profileId).filter((profileId) => profileId !== params.profileId)] : void 0;
  const baseOrder = matchingProviderOrderEntries.length > 0 ? Object.fromEntries(Object.entries(cfg.auth?.order ?? {}).filter(([providerId]) => (0, _providerEnvVarsSjBhOn.o)(providerId, { config: cfg }) !== normalizedProvider)) : cfg.auth?.order;
  const order = existingProviderOrder !== void 0 ? {
    ...baseOrder,
    [normalizedProvider]: reorderedProviderOrder?.includes(params.profileId) ? reorderedProviderOrder : [...(reorderedProviderOrder ?? []), params.profileId]
  } : derivedProviderOrder ? {
    ...baseOrder,
    [normalizedProvider]: derivedProviderOrder
  } : baseOrder;
  return {
    ...cfg,
    auth: {
      ...cfg.auth,
      profiles,
      ...(order ? { order } : {})
    }
  };
}
/** Resolve real path, returning null if the target doesn't exist. */
function safeRealpathSync(dir) {
  try {
    return _nodeFs.default.realpathSync(_nodePath.default.resolve(dir));
  } catch {
    return null;
  }
}
function resolveSiblingAgentDirs(primaryAgentDir) {
  const normalized = _nodePath.default.resolve(primaryAgentDir);
  const parentOfAgent = _nodePath.default.dirname(normalized);
  const candidateAgentsRoot = _nodePath.default.dirname(parentOfAgent);
  const agentsRoot = _nodePath.default.basename(normalized) === "agent" && _nodePath.default.basename(candidateAgentsRoot) === "agents" ? candidateAgentsRoot : _nodePath.default.join((0, _pathsDvv9VRAc._)(), "agents");
  const discovered = (() => {
    try {
      return _nodeFs.default.readdirSync(agentsRoot, { withFileTypes: true });
    } catch {
      return [];
    }
  })().filter((entry) => entry.isDirectory() || entry.isSymbolicLink()).map((entry) => _nodePath.default.join(agentsRoot, entry.name, "agent"));
  const seen = /* @__PURE__ */new Set();
  const result = [];
  for (const dir of [normalized, ...discovered]) {
    const real = safeRealpathSync(dir);
    if (real && !seen.has(real)) {
      seen.add(real);
      result.push(real);
    }
  }
  return result;
}
async function writeOAuthCredentials(provider, creds, agentDir, options) {
  const email = typeof creds.email === "string" && creds.email.trim() ? creds.email.trim() : "default";
  const profileId = (0, _identityDWKLr7xb.t)({
    providerId: provider,
    profileName: options?.profileName ?? email
  });
  const resolvedAgentDir = _nodePath.default.resolve(resolveAuthAgentDir(agentDir));
  const targetAgentDirs = options?.syncSiblingAgents ? resolveSiblingAgentDirs(resolvedAgentDir) : [resolvedAgentDir];
  const credential = {
    type: "oauth",
    provider,
    ...creds,
    ...(options?.displayName ? { displayName: options.displayName } : {})
  };
  (0, _profilesCVErLX2C.o)({
    profileId,
    credential,
    agentDir: resolvedAgentDir
  });
  if (options?.syncSiblingAgents) {
    const primaryReal = safeRealpathSync(resolvedAgentDir);
    for (const targetAgentDir of targetAgentDirs) {
      const targetReal = safeRealpathSync(targetAgentDir);
      if (targetReal && primaryReal && targetReal === primaryReal) continue;
      try {
        (0, _profilesCVErLX2C.o)({
          profileId,
          credential,
          agentDir: targetAgentDir
        });
      } catch {}
    }
  }
  return profileId;
}
//#endregion /* v9-1d6f0efb2d1a9cfb */
