"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveConfiguredBindingRoute;exports.t = ensureConfiguredBindingRouteReady;var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _resolveRouteByaGTmFk = require("./resolve-route-ByaGTmFk.js");
var _bindingRegistryEbIwreS = require("./binding-registry-ebIwre-S.js");
var _bindingTargetsXmalh8ui = require("./binding-targets-xmalh8ui.js");
//#region src/channels/plugins/binding-routing.ts
function resolveConfiguredBindingConversationRef(params) {
  if ("conversation" in params) return params.conversation;
  return {
    channel: params.channel,
    accountId: params.accountId,
    conversationId: params.conversationId,
    parentConversationId: params.parentConversationId
  };
}
function resolveConfiguredBindingRoute(params) {
  const bindingResolution = (0, _bindingRegistryEbIwreS.n)({
    cfg: params.cfg,
    conversation: resolveConfiguredBindingConversationRef(params)
  }) ?? null;
  if (!bindingResolution) return {
    bindingResolution: null,
    route: params.route
  };
  const boundSessionKey = bindingResolution.statefulTarget.sessionKey.trim();
  if (!boundSessionKey) return {
    bindingResolution,
    route: params.route
  };
  const boundAgentId = (0, _sessionKeyBh1lMwK.u)(boundSessionKey) || bindingResolution.statefulTarget.agentId;
  return {
    bindingResolution,
    boundSessionKey,
    boundAgentId,
    route: {
      ...params.route,
      sessionKey: boundSessionKey,
      agentId: boundAgentId,
      lastRoutePolicy: (0, _resolveRouteByaGTmFk.n)({
        sessionKey: boundSessionKey,
        mainSessionKey: params.route.mainSessionKey
      }),
      matchedBy: "binding.channel"
    }
  };
}
async function ensureConfiguredBindingRouteReady(params) {
  return await (0, _bindingTargetsXmalh8ui.t)(params);
}
//#endregion /* v9-ed71adbd61753edc */
