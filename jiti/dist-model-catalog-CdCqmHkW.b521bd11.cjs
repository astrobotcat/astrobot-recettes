"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = modelSupportsVision;exports.i = modelSupportsDocument;exports.n = findModelInCatalog;exports.o = resetModelCatalogCacheForTest;exports.r = loadModelCatalog;exports.t = __setModelCatalogImportForTest;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
require("./config-Q9XZc_2I.js");
var _agentPathsJWlHCT = require("./agent-paths-JWlHCT48.js");
var _providerRuntimeRuntimeCAFBfBB = require("./provider-runtime.runtime-CA-FBfBB.js");
var _modelsConfigCkfuLeV = require("./models-config-CkfuLe-V.js");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/agents/model-catalog.ts
const log = (0, _subsystemCgmckbux.t)("model-catalog");
let modelCatalogPromise = null;
let hasLoggedModelCatalogError = false;
const defaultImportPiSdk = () => Promise.resolve().then(() => jitiImport("./agents/pi-model-discovery-runtime.js").then((m) => _interopRequireWildcard(m)));
let importPiSdk = defaultImportPiSdk;
let modelSuppressionPromise;
function shouldLogModelCatalogTiming() {
  return process.env.OPENCLAW_DEBUG_INGRESS_TIMING === "1";
}
function loadModelSuppression() {
  modelSuppressionPromise ??= Promise.resolve().then(() => jitiImport("./model-suppression.runtime-CBASwNzB.js").then((m) => _interopRequireWildcard(m)));
  return modelSuppressionPromise;
}
function resetModelCatalogCacheForTest() {
  modelCatalogPromise = null;
  hasLoggedModelCatalogError = false;
  importPiSdk = defaultImportPiSdk;
}
function __setModelCatalogImportForTest(loader) {
  importPiSdk = loader ?? defaultImportPiSdk;
}
function instantiatePiModelRegistry(piSdk, authStorage, modelsFile) {
  const Registry = piSdk.ModelRegistry;
  if (typeof Registry.create === "function") return Registry.create(authStorage, modelsFile);
  return new Registry(authStorage, modelsFile);
}
async function loadModelCatalog(params) {
  if (params?.useCache === false) modelCatalogPromise = null;
  if (modelCatalogPromise) return modelCatalogPromise;
  modelCatalogPromise = (async () => {
    const models = [];
    const timingEnabled = shouldLogModelCatalogTiming();
    const startMs = timingEnabled ? Date.now() : 0;
    const logStage = (stage, extra) => {
      if (!timingEnabled) return;
      const suffix = extra ? ` ${extra}` : "";
      log.info(`model-catalog stage=${stage} elapsedMs=${Date.now() - startMs}${suffix}`);
    };
    const sortModels = (entries) => entries.sort((a, b) => {
      const p = a.provider.localeCompare(b.provider);
      if (p !== 0) return p;
      return a.name.localeCompare(b.name);
    });
    try {
      const cfg = params?.config ?? (0, _io5pxHCi7V.a)();
      await (0, _modelsConfigCkfuLeV.t)(cfg);
      logStage("models-json-ready");
      const piSdk = await importPiSdk();
      logStage("pi-sdk-imported");
      const agentDir = (0, _agentPathsJWlHCT.t)();
      const { shouldSuppressBuiltInModel } = await loadModelSuppression();
      logStage("catalog-deps-ready");
      const { join } = await Promise.resolve().then(() => jitiImport("node:path").then((m) => _interopRequireWildcard(m)));
      const authStorage = piSdk.discoverAuthStorage(agentDir);
      logStage("auth-storage-ready");
      const registry = instantiatePiModelRegistry(piSdk, authStorage, join(agentDir, "models.json"));
      logStage("registry-ready");
      const entries = Array.isArray(registry) ? registry : registry.getAll();
      logStage("registry-read", `entries=${entries.length}`);
      for (const entry of entries) {
        const id = (0, _stringCoerceBUSzWgUA.s)(entry?.id) ?? "";
        if (!id) continue;
        const provider = (0, _stringCoerceBUSzWgUA.s)(entry?.provider) ?? "";
        if (!provider) continue;
        if (shouldSuppressBuiltInModel({
          provider,
          id,
          config: cfg
        })) continue;
        const name = (0, _stringCoerceBUSzWgUA.s)(entry?.name ?? id) || id;
        const contextWindow = typeof entry?.contextWindow === "number" && entry.contextWindow > 0 ? entry.contextWindow : void 0;
        const reasoning = typeof entry?.reasoning === "boolean" ? entry.reasoning : void 0;
        const input = Array.isArray(entry?.input) ? entry.input : void 0;
        models.push({
          id,
          name,
          provider,
          contextWindow,
          reasoning,
          input
        });
      }
      const supplemental = await (0, _providerRuntimeRuntimeCAFBfBB.t)({
        config: cfg,
        env: process.env,
        context: {
          config: cfg,
          agentDir,
          env: process.env,
          entries: [...models]
        }
      });
      if (supplemental.length > 0) {
        const seen = new Set(models.map((entry) => `${(0, _stringCoerceBUSzWgUA.i)(entry.provider)}::${(0, _stringCoerceBUSzWgUA.i)(entry.id)}`));
        for (const entry of supplemental) {
          const key = `${(0, _stringCoerceBUSzWgUA.i)(entry.provider)}::${(0, _stringCoerceBUSzWgUA.i)(entry.id)}`;
          if (seen.has(key)) continue;
          models.push(entry);
          seen.add(key);
        }
      }
      logStage("plugin-models-merged", `entries=${models.length}`);
      if (models.length === 0) modelCatalogPromise = null;
      const sorted = sortModels(models);
      logStage("complete", `entries=${sorted.length}`);
      return sorted;
    } catch (error) {
      if (!hasLoggedModelCatalogError) {
        hasLoggedModelCatalogError = true;
        log.warn(`Failed to load model catalog: ${String(error)}`);
      }
      modelCatalogPromise = null;
      if (models.length > 0) return sortModels(models);
      return [];
    }
  })();
  return modelCatalogPromise;
}
/**
* Check if a model supports image input based on its catalog entry.
*/
function modelSupportsVision(entry) {
  return entry?.input?.includes("image") ?? false;
}
/**
* Check if a model supports native document/PDF input based on its catalog entry.
*/
function modelSupportsDocument(entry) {
  return entry?.input?.includes("document") ?? false;
}
/**
* Find a model in the catalog by provider and model ID.
*/
function findModelInCatalog(catalog, provider, modelId) {
  const normalizedProvider = (0, _providerIdKaStHhRz.r)(provider);
  const normalizedModelId = (0, _stringCoerceBUSzWgUA.i)(modelId);
  return catalog.find((entry) => (0, _providerIdKaStHhRz.r)(entry.provider) === normalizedProvider && (0, _stringCoerceBUSzWgUA.i)(entry.id) === normalizedModelId);
}
//#endregion /* v9-d8e6f97ab83285f3 */
