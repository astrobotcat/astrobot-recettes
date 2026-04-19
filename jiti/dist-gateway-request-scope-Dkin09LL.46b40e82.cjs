"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = withPluginRuntimeGatewayRequestScope;exports.r = withPluginRuntimePluginIdScope;exports.t = getPluginRuntimeGatewayRequestScope;var _globalSingletonB80lDOJ = require("./global-singleton-B80lD-oJ.js");
var _nodeAsync_hooks = require("node:async_hooks");
//#region src/plugins/runtime/gateway-request-scope.ts
const pluginRuntimeGatewayRequestScope = (0, _globalSingletonB80lDOJ.n)(Symbol.for("openclaw.pluginRuntimeGatewayRequestScope"), () => new _nodeAsync_hooks.AsyncLocalStorage());
/**
* Runs plugin gateway handlers with request-scoped context that runtime helpers can read.
*/
function withPluginRuntimeGatewayRequestScope(scope, run) {
  return pluginRuntimeGatewayRequestScope.run(scope, run);
}
/**
* Runs work under the current gateway request scope while attaching plugin identity.
*/
function withPluginRuntimePluginIdScope(pluginId, run) {
  const current = pluginRuntimeGatewayRequestScope.getStore();
  const scoped = current ? {
    ...current,
    pluginId
  } : {
    pluginId,
    isWebchatConnect: () => false
  };
  return pluginRuntimeGatewayRequestScope.run(scoped, run);
}
/**
* Returns the current plugin gateway request scope when called from a plugin request handler.
*/
function getPluginRuntimeGatewayRequestScope() {
  return pluginRuntimeGatewayRequestScope.getStore();
}
//#endregion /* v9-a163eb2cb623b4b7 */
