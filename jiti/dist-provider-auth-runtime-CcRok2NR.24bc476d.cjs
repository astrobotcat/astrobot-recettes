"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveApiKeyForProvider;exports.t = getRuntimeAuthForModel;require("./model-auth-markers-ve-OgG6R.js");
require("./model-auth-env-B-45Q6PX.js");
var _nodeUrl = require("node:url");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/plugin-sdk/provider-auth-runtime.ts
const RUNTIME_MODEL_AUTH_CANDIDATES = ["./runtime-model-auth.runtime", "../plugins/runtime/runtime-model-auth.runtime"];
const RUNTIME_MODEL_AUTH_EXTENSIONS = [
".js",
".ts",
".mjs",
".mts",
".cjs",
".cts"];

function resolveRuntimeModelAuthModuleHref() {
  const baseDir = _nodePath.default.dirname((0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/provider-auth-runtime-CcRok2NR.js"));
  for (const relativeBase of RUNTIME_MODEL_AUTH_CANDIDATES) for (const ext of RUNTIME_MODEL_AUTH_EXTENSIONS) {
    const candidate = _nodePath.default.resolve(baseDir, `${relativeBase}${ext}`);
    if (_nodeFs.default.existsSync(candidate)) return (0, _nodeUrl.pathToFileURL)(candidate).href;
  }
  throw new Error(`Unable to resolve runtime model auth module from ${"file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/provider-auth-runtime-CcRok2NR.js"}`);
}
async function loadRuntimeModelAuthModule() {
  return await ((specifier) => new Promise((r) => r(`${specifier}`)).then((s) => jitiImport(s).then((m) => _interopRequireWildcard(m))))(resolveRuntimeModelAuthModuleHref());
}
async function resolveApiKeyForProvider(params) {
  const { resolveApiKeyForProvider } = await loadRuntimeModelAuthModule();
  return resolveApiKeyForProvider(params);
}
async function getRuntimeAuthForModel(params) {
  const { getRuntimeAuthForModel } = await loadRuntimeModelAuthModule();
  return getRuntimeAuthForModel(params);
}
//#endregion /* v9-37bb8d830ecfa814 */
