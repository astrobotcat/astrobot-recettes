"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveChannelMessageToolSchemaProperties;exports.i = resolveChannelMessageToolMediaSourceParamKeys;exports.n = channelSupportsMessageCapabilityForChannel;exports.o = resolveMessageActionDiscoveryChannelId;exports.r = createMessageActionDiscoveryContext;exports.s = resolveMessageActionDiscoveryForPlugin;exports.t = channelSupportsMessageCapability;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _runtimeDx7oeLYq = require("./runtime-Dx7oeLYq.js");
var _registryCENZffQG = require("./registry-CENZffQG.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
require("./plugins-D4ODSIPT.js");
//#region src/channels/plugins/message-action-discovery.ts
const loggedMessageActionErrors = /* @__PURE__ */new Set();
function resolveMessageActionDiscoveryChannelId(raw) {
  return (0, _registryCENZffQG.a)(raw) ?? (0, _stringCoerceBUSzWgUA.s)(raw);
}
function createMessageActionDiscoveryContext(params) {
  const currentChannelProvider = resolveMessageActionDiscoveryChannelId(params.channel ?? params.currentChannelProvider);
  return {
    cfg: params.cfg ?? {},
    currentChannelId: params.currentChannelId,
    currentChannelProvider,
    currentThreadTs: params.currentThreadTs,
    currentMessageId: params.currentMessageId,
    accountId: params.accountId,
    sessionKey: params.sessionKey,
    sessionId: params.sessionId,
    agentId: params.agentId,
    requesterSenderId: params.requesterSenderId,
    senderIsOwner: params.senderIsOwner
  };
}
function logMessageActionError(params) {
  const message = (0, _errorsD8p6rxH.i)(params.error);
  const key = `${params.pluginId}:${params.operation}:${message}`;
  if (loggedMessageActionErrors.has(key)) return;
  loggedMessageActionErrors.add(key);
  const stack = params.error instanceof Error && params.error.stack ? params.error.stack : null;
  _runtimeDx7oeLYq.n.error?.(`[message-action-discovery] ${params.pluginId}.actions.${params.operation} failed: ${stack ?? message}`);
}
function describeMessageToolSafely(params) {
  try {
    return params.describeMessageTool(params.context) ?? null;
  } catch (error) {
    logMessageActionError({
      pluginId: params.pluginId,
      operation: "describeMessageTool",
      error
    });
    return null;
  }
}
function normalizeToolSchemaContributions(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
function normalizeMessageToolMediaSourceParams(mediaSourceParams, action) {
  if (Array.isArray(mediaSourceParams)) return mediaSourceParams;
  if (!mediaSourceParams || typeof mediaSourceParams !== "object") return [];
  const scopedMediaSourceParams = mediaSourceParams;
  if (action) {
    const scoped = scopedMediaSourceParams[action];
    return Array.isArray(scoped) ? scoped : [];
  }
  return Object.values(scopedMediaSourceParams).flatMap((scoped) => Array.isArray(scoped) ? scoped : []);
}
function resolveCurrentChannelPluginActions(channel) {
  const channelId = resolveMessageActionDiscoveryChannelId(channel);
  if (!channelId) return null;
  const plugin = (0, _registryDelpa74L.t)(channelId);
  if (!plugin?.actions) return null;
  return {
    pluginId: plugin.id,
    actions: plugin.actions
  };
}
function resolveMessageActionDiscoveryForPlugin(params) {
  const adapter = params.actions;
  if (!adapter) return {
    actions: [],
    capabilities: [],
    schemaContributions: [],
    mediaSourceParams: []
  };
  const described = describeMessageToolSafely({
    pluginId: params.pluginId,
    context: params.context,
    describeMessageTool: adapter.describeMessageTool
  });
  return {
    actions: params.includeActions && Array.isArray(described?.actions) ? [...described.actions] : [],
    capabilities: params.includeCapabilities && Array.isArray(described?.capabilities) ? described.capabilities : [],
    schemaContributions: params.includeSchema ? normalizeToolSchemaContributions(described?.schema) : [],
    mediaSourceParams: normalizeMessageToolMediaSourceParams(described?.mediaSourceParams, params.action)
  };
}
function listChannelMessageCapabilities(cfg) {
  const capabilities = /* @__PURE__ */new Set();
  for (const plugin of (0, _registryDelpa74L.r)()) for (const capability of resolveMessageActionDiscoveryForPlugin({
    pluginId: plugin.id,
    actions: plugin.actions,
    context: { cfg },
    includeCapabilities: true
  }).capabilities) capabilities.add(capability);
  return Array.from(capabilities);
}
function listChannelMessageCapabilitiesForChannel(params) {
  const pluginActions = resolveCurrentChannelPluginActions(params.channel);
  if (!pluginActions) return [];
  return Array.from(resolveMessageActionDiscoveryForPlugin({
    pluginId: pluginActions.pluginId,
    actions: pluginActions.actions,
    context: createMessageActionDiscoveryContext(params),
    includeCapabilities: true
  }).capabilities);
}
function mergeToolSchemaProperties(target, source) {
  if (!source) return;
  for (const [name, schema] of Object.entries(source)) if (!(name in target)) target[name] = schema;
}
function resolveChannelMessageToolSchemaProperties(params) {
  const properties = {};
  const currentChannel = resolveMessageActionDiscoveryChannelId(params.channel);
  const discoveryBase = createMessageActionDiscoveryContext(params);
  for (const plugin of (0, _registryDelpa74L.r)()) {
    if (!plugin.actions) continue;
    for (const contribution of resolveMessageActionDiscoveryForPlugin({
      pluginId: plugin.id,
      actions: plugin.actions,
      context: discoveryBase,
      includeSchema: true
    }).schemaContributions) {
      const visibility = contribution.visibility ?? "current-channel";
      if (currentChannel) {
        if (visibility === "all-configured" || plugin.id === currentChannel) mergeToolSchemaProperties(properties, contribution.properties);
        continue;
      }
      mergeToolSchemaProperties(properties, contribution.properties);
    }
  }
  return properties;
}
function resolveChannelMessageToolMediaSourceParamKeys(params) {
  const pluginActions = resolveCurrentChannelPluginActions(params.channel);
  if (!pluginActions) return [];
  const described = resolveMessageActionDiscoveryForPlugin({
    pluginId: pluginActions.pluginId,
    actions: pluginActions.actions,
    context: createMessageActionDiscoveryContext(params),
    action: params.action,
    includeSchema: false
  });
  return Array.from(new Set(described.mediaSourceParams));
}
function channelSupportsMessageCapability(cfg, capability) {
  return listChannelMessageCapabilities(cfg).includes(capability);
}
function channelSupportsMessageCapabilityForChannel(params, capability) {
  return listChannelMessageCapabilitiesForChannel(params).includes(capability);
}
//#endregion /* v9-9286d38133814a03 */
