"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = discoverModels;exports.c = scrubLegacyStaticAuthJsonEntriesForDiscovery;exports.i = discoverAuthStorage;exports.n = void 0;exports.o = normalizeDiscoveredPiModel;exports.r = addEnvBackedPiCredentials;exports.s = resolvePiCredentialsForDiscovery;exports.t = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _runtimeState2uqC88Ju = require("./runtime-state-2uqC88Ju.js");
var _storeC1I9Mkh = require("./store-C1I9Mkh8.js");
var _providerRuntimeKhVgWetm = require("./provider-runtime-khVgWetm.js");
var _modelAuthMarkersVeOgG6R = require("./model-auth-markers-ve-OgG6R.js");
var _modelAuthEnvB45Q6PX = require("./model-auth-env-B-45Q6PX.js");
var _providerModelCompatDsxuyzi = require("./provider-model-compat-Dsxuyzi4.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var PiCodingAgent = _interopRequireWildcard(require("@mariozechner/pi-coding-agent"));function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugins/synthetic-auth.runtime.ts
const BUNDLED_SYNTHETIC_AUTH_PROVIDER_REFS = [
"claude-cli",
"ollama",
"xai"];

function uniqueProviderRefs(values) {
  const seen = /* @__PURE__ */new Set();
  const next = [];
  for (const raw of values) {
    const trimmed = raw.trim();
    const normalized = (0, _providerIdKaStHhRz.r)(trimmed);
    if (!trimmed || seen.has(normalized)) continue;
    seen.add(normalized);
    next.push(trimmed);
  }
  return next;
}
function resolveRuntimeSyntheticAuthProviderRefs() {
  const registry = (0, _runtimeState2uqC88Ju.r)()?.activeRegistry;
  if (registry) return uniqueProviderRefs([...(registry.providers ?? []).filter((entry) => "resolveSyntheticAuth" in entry.provider && typeof entry.provider.resolveSyntheticAuth === "function").map((entry) => entry.provider.id), ...(registry.cliBackends ?? []).filter((entry) => "resolveSyntheticAuth" in entry.backend && typeof entry.backend.resolveSyntheticAuth === "function").map((entry) => entry.backend.id)]);
  return uniqueProviderRefs(BUNDLED_SYNTHETIC_AUTH_PROVIDER_REFS);
}
//#endregion
//#region src/agents/pi-auth-credentials.ts
function convertAuthProfileCredentialToPi(cred) {
  if (cred.type === "api_key") {
    const key = (0, _stringCoerceBUSzWgUA.s)(cred.key) ?? "";
    if (!key) return null;
    return {
      type: "api_key",
      key
    };
  }
  if (cred.type === "token") {
    const token = (0, _stringCoerceBUSzWgUA.s)(cred.token) ?? "";
    if (!token) return null;
    if (typeof cred.expires === "number" && Number.isFinite(cred.expires) && Date.now() >= cred.expires) return null;
    return {
      type: "api_key",
      key: token
    };
  }
  if (cred.type === "oauth") {
    const access = (0, _stringCoerceBUSzWgUA.s)(cred.access) ?? "";
    const refresh = (0, _stringCoerceBUSzWgUA.s)(cred.refresh) ?? "";
    if (!access || !refresh || !Number.isFinite(cred.expires) || cred.expires <= 0) return null;
    return {
      type: "oauth",
      access,
      refresh,
      expires: cred.expires
    };
  }
  return null;
}
function resolvePiCredentialMapFromStore(store) {
  const credentials = {};
  for (const credential of Object.values(store.profiles)) {
    const provider = (0, _providerIdKaStHhRz.r)(credential.provider ?? "");
    if (!provider || credentials[provider]) continue;
    const converted = convertAuthProfileCredentialToPi(credential);
    if (converted) credentials[provider] = converted;
  }
  return credentials;
}
//#endregion
//#region src/agents/pi-model-discovery.ts
const PiAuthStorageClass = exports.t = PiCodingAgent.AuthStorage;
const PiModelRegistryClass = exports.n = PiCodingAgent.ModelRegistry;
function createInMemoryAuthStorageBackend(initialData) {
  let snapshot = JSON.stringify(initialData, null, 2);
  return { withLock(update) {
      const { result, next } = update(snapshot);
      if (typeof next === "string") snapshot = next;
      return result;
    } };
}
function normalizeDiscoveredPiModel(value, agentDir) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return value;
  if (typeof value.id !== "string" || typeof value.name !== "string" || typeof value.provider !== "string") return value;
  const model = value;
  const pluginNormalized = (0, _providerRuntimeKhVgWetm._)({
    provider: model.provider,
    context: {
      provider: model.provider,
      modelId: model.id,
      model,
      agentDir
    }
  }) ?? model;
  const compatNormalized = (0, _providerRuntimeKhVgWetm.i)({
    provider: model.provider,
    context: {
      provider: model.provider,
      modelId: model.id,
      model: pluginNormalized,
      agentDir
    }
  }) ?? pluginNormalized;
  const transportNormalized = (0, _providerRuntimeKhVgWetm.a)({
    provider: model.provider,
    context: {
      provider: model.provider,
      modelId: model.id,
      model: compatNormalized,
      agentDir
    }
  }) ?? compatNormalized;
  if (!(0, _utilsD5DtWkEu.l)(transportNormalized) || typeof transportNormalized.id !== "string" || typeof transportNormalized.name !== "string" || typeof transportNormalized.provider !== "string" || typeof transportNormalized.api !== "string") return value;
  return (0, _providerModelCompatDsxuyzi.i)(transportNormalized);
}
function instantiatePiModelRegistry(authStorage, modelsJsonPath) {
  const Registry = PiModelRegistryClass;
  if (typeof Registry.create === "function") return Registry.create(authStorage, modelsJsonPath);
  return new Registry(authStorage, modelsJsonPath);
}
function createOpenClawModelRegistry(authStorage, modelsJsonPath, agentDir) {
  const registry = instantiatePiModelRegistry(authStorage, modelsJsonPath);
  const getAll = registry.getAll.bind(registry);
  const getAvailable = registry.getAvailable.bind(registry);
  const find = registry.find.bind(registry);
  registry.getAll = () => getAll().map((entry) => normalizeDiscoveredPiModel(entry, agentDir));
  registry.getAvailable = () => getAvailable().map((entry) => normalizeDiscoveredPiModel(entry, agentDir));
  registry.find = (provider, modelId) => normalizeDiscoveredPiModel(find(provider, modelId), agentDir);
  return registry;
}
function scrubLegacyStaticAuthJsonEntriesForDiscovery(pathname) {
  if (process.env.OPENCLAW_AUTH_STORE_READONLY === "1") return;
  if (!_nodeFs.default.existsSync(pathname)) return;
  let parsed;
  try {
    parsed = JSON.parse(_nodeFs.default.readFileSync(pathname, "utf8"));
  } catch {
    return;
  }
  if (!(0, _utilsD5DtWkEu.l)(parsed)) return;
  let changed = false;
  for (const [provider, value] of Object.entries(parsed)) {
    if (!(0, _utilsD5DtWkEu.l)(value)) continue;
    if (value.type !== "api_key") continue;
    delete parsed[provider];
    changed = true;
  }
  if (!changed) return;
  if (Object.keys(parsed).length === 0) {
    _nodeFs.default.rmSync(pathname, { force: true });
    return;
  }
  _nodeFs.default.writeFileSync(pathname, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  _nodeFs.default.chmodSync(pathname, 384);
}
function createAuthStorage(AuthStorageLike, path, creds) {
  const withInMemory = AuthStorageLike;
  if (typeof withInMemory.inMemory === "function") return withInMemory.inMemory(creds);
  const withFromStorage = AuthStorageLike;
  if (typeof withFromStorage.fromStorage === "function") {
    const backendCtor = PiCodingAgent.InMemoryAuthStorageBackend;
    const backend = typeof backendCtor === "function" ? new backendCtor() : createInMemoryAuthStorageBackend(creds);
    backend.withLock(() => ({
      result: void 0,
      next: JSON.stringify(creds, null, 2)
    }));
    return withFromStorage.fromStorage(backend);
  }
  const withFactory = AuthStorageLike;
  const withRuntimeOverride = typeof withFactory.create === "function" ? withFactory.create(path) : new AuthStorageLike(path);
  if (typeof withRuntimeOverride.setRuntimeApiKey === "function") for (const [provider, credential] of Object.entries(creds)) {
    if (credential.type === "api_key") {
      withRuntimeOverride.setRuntimeApiKey(provider, credential.key);
      continue;
    }
    withRuntimeOverride.setRuntimeApiKey(provider, credential.access);
  }
  return withRuntimeOverride;
}
function addEnvBackedPiCredentials(credentials, env = process.env) {
  const next = { ...credentials };
  for (const provider of Object.keys((0, _modelAuthMarkersVeOgG6R._)({ env }))) {
    if (next[provider]) continue;
    const resolved = (0, _modelAuthEnvB45Q6PX.t)(provider, env);
    if (!resolved?.apiKey) continue;
    next[provider] = {
      type: "api_key",
      key: resolved.apiKey
    };
  }
  return next;
}
function resolvePiCredentialsForDiscovery(agentDir) {
  const credentials = addEnvBackedPiCredentials(resolvePiCredentialMapFromStore((0, _storeC1I9Mkh.n)(agentDir, { allowKeychainPrompt: false })));
  for (const provider of resolveRuntimeSyntheticAuthProviderRefs()) {
    if (credentials[provider]) continue;
    const apiKey = (0, _providerRuntimeKhVgWetm.P)({
      provider,
      context: {
        config: void 0,
        provider,
        providerConfig: void 0
      }
    })?.apiKey?.trim();
    if (!apiKey) continue;
    credentials[provider] = {
      type: "api_key",
      key: apiKey
    };
  }
  return credentials;
}
function discoverAuthStorage(agentDir) {
  const credentials = resolvePiCredentialsForDiscovery(agentDir);
  const authPath = _nodePath.default.join(agentDir, "auth.json");
  scrubLegacyStaticAuthJsonEntriesForDiscovery(authPath);
  return createAuthStorage(PiAuthStorageClass, authPath, credentials);
}
function discoverModels(authStorage, agentDir) {
  return createOpenClawModelRegistry(authStorage, _nodePath.default.join(agentDir, "models.json"), agentDir);
}
//#endregion /* v9-f9cb15380462f346 */
