"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = hasAvailableAuthForProvider;exports.c = resolveModelAuthMode;exports.i = getCustomProviderApiKey;exports.l = resolveUsableCustomProviderApiKey;exports.n = applyLocalNoAuthHeaderOverride;exports.o = hasUsableCustomProviderApiKey;exports.r = getApiKeyForModel;exports.s = resolveApiKeyForProvider;exports.t = applyAuthHeaderOverride;exports.u = shouldPreferExplicitConfigApiKeyAuth;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _commandFormatDd3uP = require("./command-format-Dd3uP9-6.js");
var _typesSecretsCeL3gSMO = require("./types.secrets-CeL3gSMO.js");
var _refContractB0QmVSlT = require("./ref-contract-B0QmVSlT.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _shellEnvDTnWMCId = require("./shell-env-DTnWMCId.js");
var _runtimeSnapshotBwqEmc6G = require("./runtime-snapshot-BwqEmc6G.js");
require("./config-Q9XZc_2I.js");
var _sourceCheckD7Bxh6E = require("./source-check-D7Bxh6-e.js");
var _storeC1I9Mkh = require("./store-C1I9Mkh8.js");
var _pluginAutoEnableBbVfCcz = require("./plugin-auto-enable-BbVfCcz-.js");
var _providerRuntimeKhVgWetm = require("./provider-runtime-khVgWetm.js");
var _modelAuthMarkersVeOgG6R = require("./model-auth-markers-ve-OgG6R.js");
require("./model-selection-CTdyYoio.js");
var _normalizeSecretInputDqcJmob = require("./normalize-secret-input-DqcJmob1.js");
var _modelAuthEnvB45Q6PX = require("./model-auth-env-B-45Q6PX.js");
var _authProfilesBQEgLpFI = require("./auth-profiles-BQEgLpFI.js");
var _orderT2w38pFY = require("./order-t2w38pFY.js");
var _profilesCVErLX2C = require("./profiles-CVErLX2C.js");
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/model-auth.ts
const log = (0, _subsystemCgmckbux.t)("model-auth");
function resolveProviderConfig(cfg, provider) {
  const providers = cfg?.models?.providers ?? {};
  const direct = providers[provider];
  if (direct) return direct;
  const normalized = (0, _providerIdKaStHhRz.r)(provider);
  if (normalized === provider) return Object.entries(providers).find(([key]) => (0, _providerIdKaStHhRz.r)(key) === normalized)?.[1];
  return providers[normalized] ?? Object.entries(providers).find(([key]) => (0, _providerIdKaStHhRz.r)(key) === normalized)?.[1];
}
function getCustomProviderApiKey(cfg, provider) {
  const entry = resolveProviderConfig(cfg, provider);
  const literal = (0, _normalizeSecretInputDqcJmob.t)(entry?.apiKey);
  if (literal) return literal;
  const ref = (0, _typesSecretsCeL3gSMO.i)(entry?.apiKey);
  if (!ref) return;
  if (ref.source === "env") return ref.id.trim() || "secretref-managed";
  return _modelAuthMarkersVeOgG6R.i;
}
function canResolveEnvSecretRefInReadOnlyPath(params) {
  const providerConfig = params.cfg?.secrets?.providers?.[params.provider];
  if (!providerConfig) return params.provider === (0, _refContractB0QmVSlT.l)(params.cfg ?? {}, "env");
  if (providerConfig.source !== "env") return false;
  const allowlist = providerConfig.allowlist;
  return !allowlist || allowlist.includes(params.id);
}
function resolveUsableCustomProviderApiKey(params) {
  const apiKeyRef = (0, _typesSecretsCeL3gSMO.i)(resolveProviderConfig(params.cfg, params.provider)?.apiKey);
  if (apiKeyRef) {
    if (apiKeyRef.source !== "env") return null;
    const envVarName = apiKeyRef.id.trim();
    if (!envVarName) return null;
    if (!canResolveEnvSecretRefInReadOnlyPath({
      cfg: params.cfg,
      provider: apiKeyRef.provider,
      id: envVarName
    })) return null;
    const envValue = (0, _normalizeSecretInputDqcJmob.t)((params.env ?? process.env)[envVarName]);
    if (!envValue) return null;
    return {
      apiKey: envValue,
      source: resolveEnvSourceLabel({
        applied: new Set((0, _shellEnvDTnWMCId.t)()),
        envVars: [envVarName],
        label: `${envVarName} (models.json secretref)`
      })
    };
  }
  const customKey = getCustomProviderApiKey(params.cfg, params.provider);
  if (!customKey) return null;
  if (!(0, _modelAuthMarkersVeOgG6R.u)(customKey)) return {
    apiKey: customKey,
    source: "models.json"
  };
  if (!(0, _modelAuthMarkersVeOgG6R.l)(customKey)) return null;
  const envValue = (0, _normalizeSecretInputDqcJmob.t)((params.env ?? process.env)[customKey]);
  if (!envValue) return null;
  return {
    apiKey: envValue,
    source: resolveEnvSourceLabel({
      applied: new Set((0, _shellEnvDTnWMCId.t)()),
      envVars: [customKey],
      label: `${customKey} (models.json marker)`
    })
  };
}
function hasUsableCustomProviderApiKey(cfg, provider, env) {
  return Boolean(resolveUsableCustomProviderApiKey({
    cfg,
    provider,
    env
  }));
}
function shouldPreferExplicitConfigApiKeyAuth(cfg, provider) {
  const providerConfig = resolveProviderConfig(cfg, provider);
  return resolveProviderAuthOverride(cfg, provider) === "api-key" && providerConfig !== void 0 && hasExplicitProviderApiKeyConfig(providerConfig);
}
function resolveProviderAuthOverride(cfg, provider) {
  const auth = resolveProviderConfig(cfg, provider)?.auth;
  if (auth === "api-key" || auth === "aws-sdk" || auth === "oauth" || auth === "token") return auth;
}
function isLocalBaseUrl(baseUrl) {
  try {
    const host = (0, _stringCoerceBUSzWgUA.i)(new URL(baseUrl).hostname);
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "[::1]" || host === "[::ffff:7f00:1]" || host === "[::ffff:127.0.0.1]";
  } catch {
    return false;
  }
}
function hasExplicitProviderApiKeyConfig(providerConfig) {
  return (0, _normalizeSecretInputDqcJmob.t)(providerConfig.apiKey) !== void 0 || (0, _typesSecretsCeL3gSMO.i)(providerConfig.apiKey) !== null;
}
function isCustomLocalProviderConfig(providerConfig) {
  return typeof providerConfig.baseUrl === "string" && providerConfig.baseUrl.trim().length > 0 && typeof providerConfig.api === "string" && providerConfig.api.trim().length > 0 && Array.isArray(providerConfig.models) && providerConfig.models.length > 0;
}
function isManagedSecretRefApiKeyMarker(apiKey) {
  return apiKey?.trim() === _modelAuthMarkersVeOgG6R.i;
}
function resolveProviderSyntheticRuntimeAuth(params) {
  const resolveFromConfig = (config) => {
    const providerConfig = resolveProviderConfig(config, params.provider);
    return (0, _providerRuntimeKhVgWetm.P)({
      provider: params.provider,
      config,
      context: {
        config,
        provider: params.provider,
        providerConfig
      }
    });
  };
  const directAuth = resolveFromConfig(params.cfg);
  if (!directAuth) return {};
  if (!isManagedSecretRefApiKeyMarker(directAuth.apiKey)) return { auth: directAuth };
  const runtimeConfig = (0, _runtimeSnapshotBwqEmc6G.r)();
  if (!runtimeConfig || runtimeConfig === params.cfg) return { blockedOnManagedSecretRef: true };
  const runtimeAuth = resolveFromConfig(runtimeConfig);
  const runtimeApiKey = runtimeAuth?.apiKey;
  if (!runtimeAuth || !runtimeApiKey || (0, _modelAuthMarkersVeOgG6R.u)(runtimeApiKey)) return { blockedOnManagedSecretRef: true };
  return { auth: runtimeAuth };
}
function resolveSyntheticLocalProviderAuth(params) {
  const syntheticProviderAuth = resolveProviderSyntheticRuntimeAuth(params);
  if (syntheticProviderAuth.auth) return syntheticProviderAuth.auth;
  if (syntheticProviderAuth.blockedOnManagedSecretRef) return null;
  const providerConfig = resolveProviderConfig(params.cfg, params.provider);
  if (!providerConfig) return null;
  if (!(Boolean(providerConfig.api?.trim()) || Boolean(providerConfig.baseUrl?.trim()) || Array.isArray(providerConfig.models) && providerConfig.models.length > 0)) return null;
  const authOverride = resolveProviderAuthOverride(params.cfg, params.provider);
  if (authOverride && authOverride !== "api-key") return null;
  if (!isCustomLocalProviderConfig(providerConfig)) return null;
  if (hasExplicitProviderApiKeyConfig(providerConfig)) return null;
  if (providerConfig.baseUrl && isLocalBaseUrl(providerConfig.baseUrl)) return {
    apiKey: _modelAuthMarkersVeOgG6R.t,
    source: `models.providers.${params.provider} (synthetic local key)`,
    mode: "api-key"
  };
  return null;
}
function resolveEnvSourceLabel(params) {
  return `${params.envVars.some((envVar) => params.applied.has(envVar)) ? "shell env: " : "env: "}${params.label}`;
}
function resolveAwsSdkAuthInfo() {
  const applied = new Set((0, _shellEnvDTnWMCId.t)());
  if (process.env.AWS_BEARER_TOKEN_BEDROCK?.trim()) return {
    mode: "aws-sdk",
    source: resolveEnvSourceLabel({
      applied,
      envVars: ["AWS_BEARER_TOKEN_BEDROCK"],
      label: "AWS_BEARER_TOKEN_BEDROCK"
    })
  };
  if (process.env.AWS_ACCESS_KEY_ID?.trim() && process.env.AWS_SECRET_ACCESS_KEY?.trim()) return {
    mode: "aws-sdk",
    source: resolveEnvSourceLabel({
      applied,
      envVars: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
      label: "AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY"
    })
  };
  if (process.env.AWS_PROFILE?.trim()) return {
    mode: "aws-sdk",
    source: resolveEnvSourceLabel({
      applied,
      envVars: ["AWS_PROFILE"],
      label: "AWS_PROFILE"
    })
  };
  return {
    mode: "aws-sdk",
    source: "aws-sdk default chain"
  };
}
function shouldDeferSyntheticProfileAuth(params) {
  const providerConfig = resolveProviderConfig(params.cfg, params.provider);
  return (0, _providerRuntimeKhVgWetm.W)({
    provider: params.provider,
    config: params.cfg,
    context: {
      config: params.cfg,
      provider: params.provider,
      providerConfig,
      resolvedApiKey: params.resolvedApiKey
    }
  }) === true;
}
async function resolveApiKeyForProvider(params) {
  const { provider, cfg, profileId, preferredProfile } = params;
  if (profileId) {
    const store = params.store ?? (0, _storeC1I9Mkh.n)(params.agentDir);
    const resolved = await (0, _authProfilesBQEgLpFI.t)({
      cfg,
      store,
      profileId,
      agentDir: params.agentDir
    });
    if (!resolved) throw new Error(`No credentials found for profile "${profileId}".`);
    const mode = store.profiles[profileId]?.type;
    const result = {
      apiKey: resolved.apiKey,
      profileId,
      source: `profile:${profileId}`,
      mode: mode === "oauth" ? "oauth" : mode === "token" ? "token" : "api-key"
    };
    if (!params.lockedProfile && shouldDeferSyntheticProfileAuth({
      cfg,
      provider,
      resolvedApiKey: resolved.apiKey
    })) return resolveApiKeyForProvider({
      ...params,
      profileId: void 0,
      lockedProfile: true
    }).catch(() => result);
    return result;
  }
  const authOverride = resolveProviderAuthOverride(cfg, provider);
  if (authOverride === "aws-sdk") return resolveAwsSdkAuthInfo();
  if (shouldPreferExplicitConfigApiKeyAuth(cfg, provider)) {
    const customKey = resolveUsableCustomProviderApiKey({
      cfg,
      provider
    });
    if (customKey) return {
      apiKey: customKey.apiKey,
      source: customKey.source,
      mode: "api-key"
    };
  }
  const normalized = (0, _providerIdKaStHhRz.r)(provider);
  if (authOverride === void 0 && normalized === "amazon-bedrock") return resolveAwsSdkAuthInfo();
  if (params.credentialPrecedence === "env-first") {
    const envResolved = (0, _modelAuthEnvB45Q6PX.t)(provider);
    if (envResolved) {
      const resolvedMode = envResolved.source.includes("OAUTH_TOKEN") ? "oauth" : "api-key";
      return {
        apiKey: envResolved.apiKey,
        source: envResolved.source,
        mode: resolvedMode
      };
    }
  }
  const providerConfig = resolveProviderConfig(cfg, provider);
  const store = params.store ?? (0, _storeC1I9Mkh.n)(params.agentDir);
  const order = (0, _orderT2w38pFY.n)({
    cfg,
    store,
    provider,
    preferredProfile
  });
  let deferredAuthProfileResult = null;
  for (const candidate of order) try {
    const resolved = await (0, _authProfilesBQEgLpFI.t)({
      cfg,
      store,
      profileId: candidate,
      agentDir: params.agentDir
    });
    if (resolved) {
      const mode = store.profiles[candidate]?.type;
      const resolvedMode = mode === "oauth" ? "oauth" : mode === "token" ? "token" : "api-key";
      const result = {
        apiKey: resolved.apiKey,
        profileId: candidate,
        source: `profile:${candidate}`,
        mode: resolvedMode
      };
      if (shouldDeferSyntheticProfileAuth({
        cfg,
        provider,
        resolvedApiKey: resolved.apiKey
      })) {
        deferredAuthProfileResult ??= result;
        continue;
      }
      return result;
    }
  } catch (err) {
    log.debug?.(`auth profile "${candidate}" failed for provider "${provider}": ${String(err)}`);
  }
  const envResolved = (0, _modelAuthEnvB45Q6PX.t)(provider);
  if (envResolved) {
    const resolvedMode = envResolved.source.includes("OAUTH_TOKEN") ? "oauth" : "api-key";
    return {
      apiKey: envResolved.apiKey,
      source: envResolved.source,
      mode: resolvedMode
    };
  }
  const customKey = resolveUsableCustomProviderApiKey({
    cfg,
    provider
  });
  if (customKey) return {
    apiKey: customKey.apiKey,
    source: customKey.source,
    mode: "api-key"
  };
  if (deferredAuthProfileResult) return deferredAuthProfileResult;
  const syntheticLocalAuth = resolveSyntheticLocalProviderAuth({
    cfg,
    provider
  });
  if (syntheticLocalAuth) return syntheticLocalAuth;
  if ((!(Array.isArray(providerConfig?.models) && providerConfig.models.length > 0) ? (0, _pluginAutoEnableBbVfCcz.u)({
    provider,
    config: cfg
  }) : void 0)?.length) {
    const pluginMissingAuthMessage = (0, _providerRuntimeKhVgWetm.c)({
      provider,
      config: cfg,
      context: {
        config: cfg,
        agentDir: params.agentDir,
        env: process.env,
        provider,
        listProfileIds: (providerId) => (0, _profilesCVErLX2C.n)(store, providerId)
      }
    });
    if (pluginMissingAuthMessage) throw new Error(pluginMissingAuthMessage);
  }
  const authStorePath = (0, _sourceCheckD7Bxh6E.u)(params.agentDir);
  const resolvedAgentDir = _nodePath.default.dirname(authStorePath);
  throw new Error([
  `No API key found for provider "${provider}".`,
  `Auth store: ${authStorePath} (agentDir: ${resolvedAgentDir}).`,
  `Configure auth for this agent (${(0, _commandFormatDd3uP.t)("openclaw agents add <id>")}) or copy auth-profiles.json from the main agentDir.`].
  join(" "));
}
function resolveModelAuthMode(provider, cfg, store) {
  const resolved = provider?.trim();
  if (!resolved) return;
  const authOverride = resolveProviderAuthOverride(cfg, resolved);
  if (authOverride === "aws-sdk") return "aws-sdk";
  const authStore = store ?? (0, _storeC1I9Mkh.n)();
  const profiles = (0, _profilesCVErLX2C.n)(authStore, resolved);
  if (profiles.length > 0) {
    const modes = new Set(profiles.map((id) => authStore.profiles[id]?.type).filter((mode) => Boolean(mode)));
    if ([
    "oauth",
    "token",
    "api_key"].
    filter((k) => modes.has(k)).length >= 2) return "mixed";
    if (modes.has("oauth")) return "oauth";
    if (modes.has("token")) return "token";
    if (modes.has("api_key")) return "api-key";
  }
  if (authOverride === void 0 && (0, _providerIdKaStHhRz.r)(resolved) === "amazon-bedrock") return "aws-sdk";
  const envKey = (0, _modelAuthEnvB45Q6PX.t)(resolved);
  if (envKey?.apiKey) return envKey.source.includes("OAUTH_TOKEN") ? "oauth" : "api-key";
  if (hasUsableCustomProviderApiKey(cfg, resolved)) return "api-key";
  return "unknown";
}
async function hasAvailableAuthForProvider(params) {
  const { provider, cfg, preferredProfile } = params;
  const authOverride = resolveProviderAuthOverride(cfg, provider);
  if (authOverride === "aws-sdk") return true;
  if ((0, _modelAuthEnvB45Q6PX.t)(provider)) return true;
  if (resolveUsableCustomProviderApiKey({
    cfg,
    provider
  })) return true;
  if (resolveSyntheticLocalProviderAuth({
    cfg,
    provider
  })) return true;
  if (authOverride === void 0 && (0, _providerIdKaStHhRz.r)(provider) === "amazon-bedrock") return true;
  const store = params.store ?? (0, _storeC1I9Mkh.n)(params.agentDir);
  const order = (0, _orderT2w38pFY.n)({
    cfg,
    store,
    provider,
    preferredProfile
  });
  for (const candidate of order) try {
    if (await (0, _authProfilesBQEgLpFI.t)({
      cfg,
      store,
      profileId: candidate,
      agentDir: params.agentDir
    })) return true;
  } catch (err) {
    log.debug?.(`auth profile "${candidate}" failed for provider "${provider}": ${String(err)}`);
  }
  return false;
}
async function getApiKeyForModel(params) {
  return resolveApiKeyForProvider({
    provider: params.model.provider,
    cfg: params.cfg,
    profileId: params.profileId,
    preferredProfile: params.preferredProfile,
    store: params.store,
    agentDir: params.agentDir,
    lockedProfile: params.lockedProfile,
    credentialPrecedence: params.credentialPrecedence
  });
}
function applyLocalNoAuthHeaderOverride(model, auth) {
  if (auth?.apiKey !== "custom-local" || model.api !== "openai-completions") return model;
  const headers = {
    ...model.headers,
    Authorization: null
  };
  return {
    ...model,
    headers
  };
}
/**
* When the provider config sets `authHeader: true`, inject an explicit
* `Authorization: Bearer <apiKey>` header into the model so downstream SDKs
* (e.g. `@google/genai`) send credentials via the standard HTTP Authorization
* header instead of vendor-specific headers like `x-goog-api-key`.
*
* This is a no-op when `authHeader` is not `true`, when no API key is
* available, or when the API key is a synthetic marker (e.g. local-server
* placeholders) rather than a real credential.
*/
function applyAuthHeaderOverride(model, auth, cfg) {
  if (!auth?.apiKey) return model;
  if ((0, _modelAuthMarkersVeOgG6R.u)(auth.apiKey)) return model;
  if (!resolveProviderConfig(cfg, model.provider)?.authHeader) return model;
  const headers = {};
  if (model.headers) {
    for (const [key, value] of Object.entries(model.headers)) if ((0, _stringCoerceBUSzWgUA.o)(key) !== "authorization") headers[key] = value;
  }
  headers.Authorization = `Bearer ${auth.apiKey}`;
  return {
    ...model,
    headers
  };
}
//#endregion /* v9-16919d2df78b4fd5 */
