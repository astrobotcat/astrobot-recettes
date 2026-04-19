"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolvePackageExtensionEntries;exports.i = loadPluginManifest;exports.n = void 0;exports.o = resolveManifestCommandAliasOwnerInRegistry;exports.r = getPackageManifestMetadata;exports.t = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _boundaryFileReadDXLy_w6L = require("./boundary-file-read-DXLy_w6L.js");
var _legacyNamesC9DuzOy_ = require("./legacy-names-C9DuzOy_.js");
var _stringNormalizationXm3f27dv = require("./string-normalization-xm3f27dv.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _json = _interopRequireDefault(require("json5"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugins/manifest-command-aliases.ts
function normalizeManifestCommandAliases(value) {
  if (!Array.isArray(value)) return;
  const normalized = [];
  for (const entry of value) {
    if (typeof entry === "string") {
      const name = (0, _stringCoerceBUSzWgUA.s)(entry) ?? "";
      if (name) normalized.push({ name });
      continue;
    }
    if (!(0, _utilsD5DtWkEu.l)(entry)) continue;
    const name = (0, _stringCoerceBUSzWgUA.s)(entry.name) ?? "";
    if (!name) continue;
    const kind = entry.kind === "runtime-slash" ? entry.kind : void 0;
    const cliCommand = (0, _stringCoerceBUSzWgUA.s)(entry.cliCommand) ?? "";
    normalized.push({
      name,
      ...(kind ? { kind } : {}),
      ...(cliCommand ? { cliCommand } : {})
    });
  }
  return normalized.length > 0 ? normalized : void 0;
}
function resolveManifestCommandAliasOwnerInRegistry(params) {
  const normalizedCommand = (0, _stringCoerceBUSzWgUA.o)(params.command);
  if (!normalizedCommand) return;
  if (params.registry.plugins.some((plugin) => (0, _stringCoerceBUSzWgUA.o)(plugin.id) === normalizedCommand)) return;
  for (const plugin of params.registry.plugins) {
    const alias = plugin.commandAliases?.find((entry) => (0, _stringCoerceBUSzWgUA.o)(entry.name) === normalizedCommand);
    if (alias) return {
      ...alias,
      pluginId: plugin.id
    };
  }
}
//#endregion
//#region src/plugins/manifest.ts
const PLUGIN_MANIFEST_FILENAME = exports.n = "openclaw.plugin.json";
const PLUGIN_MANIFEST_FILENAMES = [PLUGIN_MANIFEST_FILENAME];
function normalizeStringListRecord(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return;
  const normalized = {};
  for (const [key, rawValues] of Object.entries(value)) {
    const providerId = (0, _stringCoerceBUSzWgUA.s)(key) ?? "";
    if (!providerId) continue;
    const values = (0, _stringNormalizationXm3f27dv.l)(rawValues);
    if (values.length === 0) continue;
    normalized[providerId] = values;
  }
  return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function normalizeStringRecord(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return;
  const normalized = {};
  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = (0, _stringCoerceBUSzWgUA.s)(rawKey) ?? "";
    const value = (0, _stringCoerceBUSzWgUA.s)(rawValue) ?? "";
    if (!key || !value) continue;
    normalized[key] = value;
  }
  return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function normalizeManifestContracts(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return;
  const memoryEmbeddingProviders = (0, _stringNormalizationXm3f27dv.l)(value.memoryEmbeddingProviders);
  const speechProviders = (0, _stringNormalizationXm3f27dv.l)(value.speechProviders);
  const realtimeTranscriptionProviders = (0, _stringNormalizationXm3f27dv.l)(value.realtimeTranscriptionProviders);
  const realtimeVoiceProviders = (0, _stringNormalizationXm3f27dv.l)(value.realtimeVoiceProviders);
  const mediaUnderstandingProviders = (0, _stringNormalizationXm3f27dv.l)(value.mediaUnderstandingProviders);
  const imageGenerationProviders = (0, _stringNormalizationXm3f27dv.l)(value.imageGenerationProviders);
  const videoGenerationProviders = (0, _stringNormalizationXm3f27dv.l)(value.videoGenerationProviders);
  const musicGenerationProviders = (0, _stringNormalizationXm3f27dv.l)(value.musicGenerationProviders);
  const webFetchProviders = (0, _stringNormalizationXm3f27dv.l)(value.webFetchProviders);
  const webSearchProviders = (0, _stringNormalizationXm3f27dv.l)(value.webSearchProviders);
  const tools = (0, _stringNormalizationXm3f27dv.l)(value.tools);
  const contracts = {
    ...(memoryEmbeddingProviders.length > 0 ? { memoryEmbeddingProviders } : {}),
    ...(speechProviders.length > 0 ? { speechProviders } : {}),
    ...(realtimeTranscriptionProviders.length > 0 ? { realtimeTranscriptionProviders } : {}),
    ...(realtimeVoiceProviders.length > 0 ? { realtimeVoiceProviders } : {}),
    ...(mediaUnderstandingProviders.length > 0 ? { mediaUnderstandingProviders } : {}),
    ...(imageGenerationProviders.length > 0 ? { imageGenerationProviders } : {}),
    ...(videoGenerationProviders.length > 0 ? { videoGenerationProviders } : {}),
    ...(musicGenerationProviders.length > 0 ? { musicGenerationProviders } : {}),
    ...(webFetchProviders.length > 0 ? { webFetchProviders } : {}),
    ...(webSearchProviders.length > 0 ? { webSearchProviders } : {}),
    ...(tools.length > 0 ? { tools } : {})
  };
  return Object.keys(contracts).length > 0 ? contracts : void 0;
}
function isManifestConfigLiteral(value) {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function normalizeManifestDangerousConfigFlags(value) {
  if (!Array.isArray(value)) return;
  const normalized = [];
  for (const entry of value) {
    if (!(0, _utilsD5DtWkEu.l)(entry)) continue;
    const path = (0, _stringCoerceBUSzWgUA.s)(entry.path) ?? "";
    if (!path || !isManifestConfigLiteral(entry.equals)) continue;
    normalized.push({
      path,
      equals: entry.equals
    });
  }
  return normalized.length > 0 ? normalized : void 0;
}
function normalizeManifestSecretInputPaths(value) {
  if (!Array.isArray(value)) return;
  const normalized = [];
  for (const entry of value) {
    if (!(0, _utilsD5DtWkEu.l)(entry)) continue;
    const path = (0, _stringCoerceBUSzWgUA.s)(entry.path) ?? "";
    if (!path) continue;
    const expected = entry.expected === "string" ? entry.expected : void 0;
    normalized.push({
      path,
      ...(expected ? { expected } : {})
    });
  }
  return normalized.length > 0 ? normalized : void 0;
}
function normalizeManifestConfigContracts(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return;
  const compatibilityMigrationPaths = (0, _stringNormalizationXm3f27dv.l)(value.compatibilityMigrationPaths);
  const compatibilityRuntimePaths = (0, _stringNormalizationXm3f27dv.l)(value.compatibilityRuntimePaths);
  const rawSecretInputs = (0, _utilsD5DtWkEu.l)(value.secretInputs) ? value.secretInputs : void 0;
  const dangerousFlags = normalizeManifestDangerousConfigFlags(value.dangerousFlags);
  const secretInputPaths = rawSecretInputs ? normalizeManifestSecretInputPaths(rawSecretInputs.paths) : void 0;
  const secretInputs = secretInputPaths && secretInputPaths.length > 0 ? {
    ...(rawSecretInputs?.bundledDefaultEnabled === true ? { bundledDefaultEnabled: true } : rawSecretInputs?.bundledDefaultEnabled === false ? { bundledDefaultEnabled: false } : {}),
    paths: secretInputPaths
  } : void 0;
  const configContracts = {
    ...(compatibilityMigrationPaths.length > 0 ? { compatibilityMigrationPaths } : {}),
    ...(compatibilityRuntimePaths.length > 0 ? { compatibilityRuntimePaths } : {}),
    ...(dangerousFlags ? { dangerousFlags } : {}),
    ...(secretInputs ? { secretInputs } : {})
  };
  return Object.keys(configContracts).length > 0 ? configContracts : void 0;
}
function normalizeManifestModelSupport(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return;
  const modelPrefixes = (0, _stringNormalizationXm3f27dv.l)(value.modelPrefixes);
  const modelPatterns = (0, _stringNormalizationXm3f27dv.l)(value.modelPatterns);
  const modelSupport = {
    ...(modelPrefixes.length > 0 ? { modelPrefixes } : {}),
    ...(modelPatterns.length > 0 ? { modelPatterns } : {})
  };
  return Object.keys(modelSupport).length > 0 ? modelSupport : void 0;
}
function normalizeManifestActivation(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return;
  const onProviders = (0, _stringNormalizationXm3f27dv.l)(value.onProviders);
  const onAgentHarnesses = (0, _stringNormalizationXm3f27dv.l)(value.onAgentHarnesses);
  const onCommands = (0, _stringNormalizationXm3f27dv.l)(value.onCommands);
  const onChannels = (0, _stringNormalizationXm3f27dv.l)(value.onChannels);
  const onRoutes = (0, _stringNormalizationXm3f27dv.l)(value.onRoutes);
  const onCapabilities = (0, _stringNormalizationXm3f27dv.l)(value.onCapabilities).filter((capability) => capability === "provider" || capability === "channel" || capability === "tool" || capability === "hook");
  const activation = {
    ...(onProviders.length > 0 ? { onProviders } : {}),
    ...(onAgentHarnesses.length > 0 ? { onAgentHarnesses } : {}),
    ...(onCommands.length > 0 ? { onCommands } : {}),
    ...(onChannels.length > 0 ? { onChannels } : {}),
    ...(onRoutes.length > 0 ? { onRoutes } : {}),
    ...(onCapabilities.length > 0 ? { onCapabilities } : {})
  };
  return Object.keys(activation).length > 0 ? activation : void 0;
}
function normalizeManifestSetupProviders(value) {
  if (!Array.isArray(value)) return;
  const normalized = [];
  for (const entry of value) {
    if (!(0, _utilsD5DtWkEu.l)(entry)) continue;
    const id = (0, _stringCoerceBUSzWgUA.s)(entry.id) ?? "";
    if (!id) continue;
    const authMethods = (0, _stringNormalizationXm3f27dv.l)(entry.authMethods);
    const envVars = (0, _stringNormalizationXm3f27dv.l)(entry.envVars);
    normalized.push({
      id,
      ...(authMethods.length > 0 ? { authMethods } : {}),
      ...(envVars.length > 0 ? { envVars } : {})
    });
  }
  return normalized.length > 0 ? normalized : void 0;
}
function normalizeManifestSetup(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return;
  const providers = normalizeManifestSetupProviders(value.providers);
  const cliBackends = (0, _stringNormalizationXm3f27dv.l)(value.cliBackends);
  const configMigrations = (0, _stringNormalizationXm3f27dv.l)(value.configMigrations);
  const requiresRuntime = typeof value.requiresRuntime === "boolean" ? value.requiresRuntime : void 0;
  const setup = {
    ...(providers ? { providers } : {}),
    ...(cliBackends.length > 0 ? { cliBackends } : {}),
    ...(configMigrations.length > 0 ? { configMigrations } : {}),
    ...(requiresRuntime !== void 0 ? { requiresRuntime } : {})
  };
  return Object.keys(setup).length > 0 ? setup : void 0;
}
function normalizeManifestQaRunners(value) {
  if (!Array.isArray(value)) return;
  const normalized = [];
  for (const entry of value) {
    if (!(0, _utilsD5DtWkEu.l)(entry)) continue;
    const commandName = (0, _stringCoerceBUSzWgUA.s)(entry.commandName) ?? "";
    if (!commandName) continue;
    const description = (0, _stringCoerceBUSzWgUA.s)(entry.description) ?? "";
    normalized.push({
      commandName,
      ...(description ? { description } : {})
    });
  }
  return normalized.length > 0 ? normalized : void 0;
}
function normalizeProviderAuthChoices(value) {
  if (!Array.isArray(value)) return;
  const normalized = [];
  for (const entry of value) {
    if (!(0, _utilsD5DtWkEu.l)(entry)) continue;
    const provider = (0, _stringCoerceBUSzWgUA.s)(entry.provider) ?? "";
    const method = (0, _stringCoerceBUSzWgUA.s)(entry.method) ?? "";
    const choiceId = (0, _stringCoerceBUSzWgUA.s)(entry.choiceId) ?? "";
    if (!provider || !method || !choiceId) continue;
    const choiceLabel = (0, _stringCoerceBUSzWgUA.s)(entry.choiceLabel) ?? "";
    const choiceHint = (0, _stringCoerceBUSzWgUA.s)(entry.choiceHint) ?? "";
    const assistantPriority = typeof entry.assistantPriority === "number" && Number.isFinite(entry.assistantPriority) ? entry.assistantPriority : void 0;
    const assistantVisibility = entry.assistantVisibility === "manual-only" || entry.assistantVisibility === "visible" ? entry.assistantVisibility : void 0;
    const deprecatedChoiceIds = (0, _stringNormalizationXm3f27dv.l)(entry.deprecatedChoiceIds);
    const groupId = (0, _stringCoerceBUSzWgUA.s)(entry.groupId) ?? "";
    const groupLabel = (0, _stringCoerceBUSzWgUA.s)(entry.groupLabel) ?? "";
    const groupHint = (0, _stringCoerceBUSzWgUA.s)(entry.groupHint) ?? "";
    const optionKey = (0, _stringCoerceBUSzWgUA.s)(entry.optionKey) ?? "";
    const cliFlag = (0, _stringCoerceBUSzWgUA.s)(entry.cliFlag) ?? "";
    const cliOption = (0, _stringCoerceBUSzWgUA.s)(entry.cliOption) ?? "";
    const cliDescription = (0, _stringCoerceBUSzWgUA.s)(entry.cliDescription) ?? "";
    const onboardingScopes = (0, _stringNormalizationXm3f27dv.l)(entry.onboardingScopes).filter((scope) => scope === "text-inference" || scope === "image-generation");
    normalized.push({
      provider,
      method,
      choiceId,
      ...(choiceLabel ? { choiceLabel } : {}),
      ...(choiceHint ? { choiceHint } : {}),
      ...(assistantPriority !== void 0 ? { assistantPriority } : {}),
      ...(assistantVisibility ? { assistantVisibility } : {}),
      ...(deprecatedChoiceIds.length > 0 ? { deprecatedChoiceIds } : {}),
      ...(groupId ? { groupId } : {}),
      ...(groupLabel ? { groupLabel } : {}),
      ...(groupHint ? { groupHint } : {}),
      ...(optionKey ? { optionKey } : {}),
      ...(cliFlag ? { cliFlag } : {}),
      ...(cliOption ? { cliOption } : {}),
      ...(cliDescription ? { cliDescription } : {}),
      ...(onboardingScopes.length > 0 ? { onboardingScopes } : {})
    });
  }
  return normalized.length > 0 ? normalized : void 0;
}
function normalizeChannelConfigs(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return;
  const normalized = {};
  for (const [key, rawEntry] of Object.entries(value)) {
    const channelId = (0, _stringCoerceBUSzWgUA.s)(key) ?? "";
    if (!channelId || !(0, _utilsD5DtWkEu.l)(rawEntry)) continue;
    const schema = (0, _utilsD5DtWkEu.l)(rawEntry.schema) ? rawEntry.schema : null;
    if (!schema) continue;
    const uiHints = (0, _utilsD5DtWkEu.l)(rawEntry.uiHints) ? rawEntry.uiHints : void 0;
    const runtime = (0, _utilsD5DtWkEu.l)(rawEntry.runtime) && typeof rawEntry.runtime.safeParse === "function" ? rawEntry.runtime : void 0;
    const label = (0, _stringCoerceBUSzWgUA.s)(rawEntry.label) ?? "";
    const description = (0, _stringCoerceBUSzWgUA.s)(rawEntry.description) ?? "";
    const preferOver = (0, _stringNormalizationXm3f27dv.l)(rawEntry.preferOver);
    normalized[channelId] = {
      schema,
      ...(uiHints ? { uiHints } : {}),
      ...(runtime ? { runtime } : {}),
      ...(label ? { label } : {}),
      ...(description ? { description } : {}),
      ...(preferOver.length > 0 ? { preferOver } : {})
    };
  }
  return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function resolvePluginManifestPath(rootDir) {
  for (const filename of PLUGIN_MANIFEST_FILENAMES) {
    const candidate = _nodePath.default.join(rootDir, filename);
    if (_nodeFs.default.existsSync(candidate)) return candidate;
  }
  return _nodePath.default.join(rootDir, PLUGIN_MANIFEST_FILENAME);
}
function parsePluginKind(raw) {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw.length > 0 && raw.every((k) => typeof k === "string")) return raw.length === 1 ? raw[0] : raw;
}
function loadPluginManifest(rootDir, rejectHardlinks = true) {
  const manifestPath = resolvePluginManifestPath(rootDir);
  const opened = (0, _boundaryFileReadDXLy_w6L.i)({
    absolutePath: manifestPath,
    rootPath: rootDir,
    boundaryLabel: "plugin root",
    rejectHardlinks
  });
  if (!opened.ok) return (0, _boundaryFileReadDXLy_w6L.n)(opened, {
    path: () => ({
      ok: false,
      error: `plugin manifest not found: ${manifestPath}`,
      manifestPath
    }),
    fallback: (failure) => ({
      ok: false,
      error: `unsafe plugin manifest path: ${manifestPath} (${failure.reason})`,
      manifestPath
    })
  });
  let raw;
  try {
    raw = _json.default.parse(_nodeFs.default.readFileSync(opened.fd, "utf-8"));
  } catch (err) {
    return {
      ok: false,
      error: `failed to parse plugin manifest: ${String(err)}`,
      manifestPath
    };
  } finally {
    _nodeFs.default.closeSync(opened.fd);
  }
  if (!(0, _utilsD5DtWkEu.l)(raw)) return {
    ok: false,
    error: "plugin manifest must be an object",
    manifestPath
  };
  const id = (0, _stringCoerceBUSzWgUA.s)(raw.id) ?? "";
  if (!id) return {
    ok: false,
    error: "plugin manifest requires id",
    manifestPath
  };
  const configSchema = (0, _utilsD5DtWkEu.l)(raw.configSchema) ? raw.configSchema : null;
  if (!configSchema) return {
    ok: false,
    error: "plugin manifest requires configSchema",
    manifestPath
  };
  const kind = parsePluginKind(raw.kind);
  const enabledByDefault = raw.enabledByDefault === true;
  const legacyPluginIds = (0, _stringNormalizationXm3f27dv.l)(raw.legacyPluginIds);
  const autoEnableWhenConfiguredProviders = (0, _stringNormalizationXm3f27dv.l)(raw.autoEnableWhenConfiguredProviders);
  const name = (0, _stringCoerceBUSzWgUA.s)(raw.name);
  const description = (0, _stringCoerceBUSzWgUA.s)(raw.description);
  const version = (0, _stringCoerceBUSzWgUA.s)(raw.version);
  const channels = (0, _stringNormalizationXm3f27dv.l)(raw.channels);
  const providers = (0, _stringNormalizationXm3f27dv.l)(raw.providers);
  const providerDiscoveryEntry = (0, _stringCoerceBUSzWgUA.s)(raw.providerDiscoveryEntry);
  const modelSupport = normalizeManifestModelSupport(raw.modelSupport);
  const cliBackends = (0, _stringNormalizationXm3f27dv.l)(raw.cliBackends);
  const commandAliases = normalizeManifestCommandAliases(raw.commandAliases);
  const providerAuthEnvVars = normalizeStringListRecord(raw.providerAuthEnvVars);
  const providerAuthAliases = normalizeStringRecord(raw.providerAuthAliases);
  const channelEnvVars = normalizeStringListRecord(raw.channelEnvVars);
  const providerAuthChoices = normalizeProviderAuthChoices(raw.providerAuthChoices);
  const activation = normalizeManifestActivation(raw.activation);
  const setup = normalizeManifestSetup(raw.setup);
  const qaRunners = normalizeManifestQaRunners(raw.qaRunners);
  const skills = (0, _stringNormalizationXm3f27dv.l)(raw.skills);
  const contracts = normalizeManifestContracts(raw.contracts);
  const configContracts = normalizeManifestConfigContracts(raw.configContracts);
  const channelConfigs = normalizeChannelConfigs(raw.channelConfigs);
  let uiHints;
  if ((0, _utilsD5DtWkEu.l)(raw.uiHints)) uiHints = raw.uiHints;
  return {
    ok: true,
    manifest: {
      id,
      configSchema,
      ...(enabledByDefault ? { enabledByDefault } : {}),
      ...(legacyPluginIds.length > 0 ? { legacyPluginIds } : {}),
      ...(autoEnableWhenConfiguredProviders.length > 0 ? { autoEnableWhenConfiguredProviders } : {}),
      kind,
      channels,
      providers,
      providerDiscoveryEntry,
      modelSupport,
      cliBackends,
      commandAliases,
      providerAuthEnvVars,
      providerAuthAliases,
      channelEnvVars,
      providerAuthChoices,
      activation,
      setup,
      qaRunners,
      skills,
      name,
      description,
      version,
      uiHints,
      contracts,
      configContracts,
      channelConfigs
    },
    manifestPath
  };
}
const DEFAULT_PLUGIN_ENTRY_CANDIDATES = exports.t = [
"index.ts",
"index.js",
"index.mjs",
"index.cjs"];

function getPackageManifestMetadata(manifest) {
  if (!manifest) return;
  return manifest[_legacyNamesC9DuzOy_.n];
}
function resolvePackageExtensionEntries(manifest) {
  const raw = getPackageManifestMetadata(manifest)?.extensions;
  if (!Array.isArray(raw)) return {
    status: "missing",
    entries: []
  };
  const entries = raw.map((entry) => (0, _stringCoerceBUSzWgUA.s)(entry) ?? "").filter(Boolean);
  if (entries.length === 0) return {
    status: "empty",
    entries: []
  };
  return {
    status: "ok",
    entries
  };
}
//#endregion /* v9-6be766e4e1a91561 */
