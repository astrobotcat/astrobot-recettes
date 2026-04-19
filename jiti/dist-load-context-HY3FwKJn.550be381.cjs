"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolvePluginRuntimeLoadContext;exports.n = buildPluginRuntimeLoadOptionsFromValues;exports.r = createPluginRuntimeLoaderLogger;exports.t = buildPluginRuntimeLoadOptions;var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
require("./config-Q9XZc_2I.js");
var _pluginAutoEnableBbVfCcz = require("./plugin-auto-enable-BbVfCcz-.js");
require("./logging-DW_bR-rY.js");
//#region src/plugins/runtime/load-context.ts
const log = (0, _subsystemCgmckbux.t)("plugins");
function createPluginRuntimeLoaderLogger() {
  return {
    info: (message) => log.info(message),
    warn: (message) => log.warn(message),
    error: (message) => log.error(message),
    debug: (message) => log.debug(message)
  };
}
function resolvePluginRuntimeLoadContext(options) {
  const env = options?.env ?? process.env;
  const rawConfig = options?.config ?? (0, _io5pxHCi7V.a)();
  const autoEnabled = (0, _pluginAutoEnableBbVfCcz.t)({
    config: rawConfig,
    env
  });
  const config = autoEnabled.config;
  const workspaceDir = options?.workspaceDir ?? (0, _agentScopeKFH9bkHi.b)(config, (0, _agentScopeKFH9bkHi.x)(config));
  return {
    rawConfig,
    config,
    activationSourceConfig: options?.activationSourceConfig ?? rawConfig,
    autoEnabledReasons: autoEnabled.autoEnabledReasons,
    workspaceDir,
    env,
    logger: options?.logger ?? createPluginRuntimeLoaderLogger()
  };
}
function buildPluginRuntimeLoadOptions(context, overrides) {
  return buildPluginRuntimeLoadOptionsFromValues(context, overrides);
}
function buildPluginRuntimeLoadOptionsFromValues(values, overrides) {
  return {
    config: values.config,
    activationSourceConfig: values.activationSourceConfig,
    autoEnabledReasons: values.autoEnabledReasons,
    workspaceDir: values.workspaceDir,
    env: values.env,
    logger: values.logger,
    ...overrides
  };
}
//#endregion /* v9-d662c8747b60ef1c */
