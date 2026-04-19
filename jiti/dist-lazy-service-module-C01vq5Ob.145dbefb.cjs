"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = startLazyPluginServiceModule;var _envBiSxzotM = require("./env-BiSxzotM.js");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/plugins/lazy-service-module.ts
function resolveExport(mod, names) {
  for (const name of names) {
    const value = mod[name];
    if (typeof value === "function") return value;
  }
  return null;
}
async function startLazyPluginServiceModule(params) {
  const skipEnvVar = params.skipEnvVar?.trim();
  if (skipEnvVar && (0, _envBiSxzotM.t)(process.env[skipEnvVar])) return null;
  const overrideEnvVar = params.overrideEnvVar?.trim();
  const override = overrideEnvVar ? process.env[overrideEnvVar]?.trim() : void 0;
  const loadOverrideModule = params.loadOverrideModule ?? (async (specifier) => await ((specifier) => new Promise((r) => r(`${specifier}`)).then((s) => jitiImport(s).then((m) => _interopRequireWildcard(m))))(specifier));
  const validatedOverride = override && params.validateOverrideSpecifier ? params.validateOverrideSpecifier(override) : override;
  const mod = validatedOverride ? await loadOverrideModule(validatedOverride) : await params.loadDefaultModule();
  const start = resolveExport(mod, params.startExportNames);
  if (!start) return null;
  const stop = params.stopExportNames && params.stopExportNames.length > 0 ? resolveExport(mod, params.stopExportNames) : null;
  await start();
  return { stop: stop ?? (async () => {}) };
}
//#endregion /* v9-5786ce491ee4eb07 */
