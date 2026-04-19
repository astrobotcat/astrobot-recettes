"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = listChannelSupportedActions;exports.c = resolveChannelReactionGuidance;exports.d = resolvePluginTools;exports.i = listChannelAgentTools;exports.l = copyPluginToolMeta;exports.n = getChannelAgentToolMeta;exports.o = resolveChannelMessageToolCapabilities;exports.r = listAllChannelSupportedActions;exports.s = resolveChannelMessageToolHints;exports.t = copyChannelAgentToolMeta;exports.u = getPluginToolMeta;var _registryCENZffQG = require("./registry-CENZffQG.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
var _configStateCcN3bZ9D = require("./config-state-CcN3bZ9D.js");
var _loaderDYW2PvbF = require("./loader-DYW2PvbF.js");
require("./plugins-D4ODSIPT.js");
var _runtimeBB1a2aCy = require("./runtime-BB1a2aCy.js");
var _loadContextHY3FwKJn = require("./load-context-HY3FwKJn.js");
var _toolPolicyC3rJHw = require("./tool-policy-C3rJHw58.js");
var _messageActionDiscoveryBTz8VrH = require("./message-action-discovery-BTz8VrH1.js");
//#region src/plugins/tools.ts
const pluginToolMeta = /* @__PURE__ */new WeakMap();
function getPluginToolMeta(tool) {
  return pluginToolMeta.get(tool);
}
function copyPluginToolMeta(source, target) {
  const meta = pluginToolMeta.get(source);
  if (meta) pluginToolMeta.set(target, meta);
}
function normalizeAllowlist(list) {
  return new Set((list ?? []).map(_toolPolicyC3rJHw.l).filter(Boolean));
}
function isOptionalToolAllowed(params) {
  if (params.allowlist.size === 0) return false;
  const toolName = (0, _toolPolicyC3rJHw.l)(params.toolName);
  if (params.allowlist.has(toolName)) return true;
  const pluginKey = (0, _toolPolicyC3rJHw.l)(params.pluginId);
  if (params.allowlist.has(pluginKey)) return true;
  return params.allowlist.has("group:plugins");
}
function resolvePluginToolRegistry(params) {
  if (params.allowGatewaySubagentBinding && (0, _runtimeBB1a2aCy.i)() && (0, _runtimeBB1a2aCy.s)() === "gateway-bindable") return (0, _runtimeBB1a2aCy.r)() ?? (0, _loaderDYW2PvbF.a)(params.loadOptions);
  return (0, _loaderDYW2PvbF.a)(params.loadOptions);
}
function resolvePluginTools(params) {
  const env = params.env ?? process.env;
  const context = (0, _loadContextHY3FwKJn.i)({
    config: (0, _configStateCcN3bZ9D.t)(params.context.config ?? {}, env),
    env,
    workspaceDir: params.context.workspaceDir
  });
  if (!(0, _configStateCcN3bZ9D.a)(context.config.plugins).enabled) return [];
  const registry = resolvePluginToolRegistry({
    loadOptions: (0, _loadContextHY3FwKJn.t)(context, { runtimeOptions: params.allowGatewaySubagentBinding ? { allowGatewaySubagentBinding: true } : void 0 }),
    allowGatewaySubagentBinding: params.allowGatewaySubagentBinding
  });
  if (!registry) return [];
  const tools = [];
  const existing = params.existingToolNames ?? /* @__PURE__ */new Set();
  const existingNormalized = new Set(Array.from(existing, (tool) => (0, _toolPolicyC3rJHw.l)(tool)));
  const allowlist = normalizeAllowlist(params.toolAllowlist);
  const blockedPlugins = /* @__PURE__ */new Set();
  for (const entry of registry.tools) {
    if (blockedPlugins.has(entry.pluginId)) continue;
    const pluginIdKey = (0, _toolPolicyC3rJHw.l)(entry.pluginId);
    if (existingNormalized.has(pluginIdKey)) {
      const message = `plugin id conflicts with core tool name (${entry.pluginId})`;
      if (!params.suppressNameConflicts) {
        context.logger.error(message);
        registry.diagnostics.push({
          level: "error",
          pluginId: entry.pluginId,
          source: entry.source,
          message
        });
      }
      blockedPlugins.add(entry.pluginId);
      continue;
    }
    let resolved = null;
    try {
      resolved = entry.factory(params.context);
    } catch (err) {
      context.logger.error(`plugin tool failed (${entry.pluginId}): ${String(err)}`);
      continue;
    }
    if (!resolved) {
      if (entry.names.length > 0) context.logger.debug?.(`plugin tool factory returned null (${entry.pluginId}): [${entry.names.join(", ")}]`);
      continue;
    }
    const listRaw = Array.isArray(resolved) ? resolved : [resolved];
    const list = entry.optional ? listRaw.filter((tool) => isOptionalToolAllowed({
      toolName: tool.name,
      pluginId: entry.pluginId,
      allowlist
    })) : listRaw;
    if (list.length === 0) continue;
    const nameSet = /* @__PURE__ */new Set();
    for (const tool of list) {
      if (nameSet.has(tool.name) || existing.has(tool.name)) {
        const message = `plugin tool name conflict (${entry.pluginId}): ${tool.name}`;
        if (!params.suppressNameConflicts) {
          context.logger.error(message);
          registry.diagnostics.push({
            level: "error",
            pluginId: entry.pluginId,
            source: entry.source,
            message
          });
        }
        continue;
      }
      nameSet.add(tool.name);
      existing.add(tool.name);
      pluginToolMeta.set(tool, {
        pluginId: entry.pluginId,
        optional: entry.optional
      });
      tools.push(tool);
    }
  }
  return tools;
}
//#endregion
//#region src/agents/channel-tools.ts
const channelAgentToolMeta = /* @__PURE__ */new WeakMap();
function getChannelAgentToolMeta(tool) {
  return channelAgentToolMeta.get(tool);
}
function copyChannelAgentToolMeta(source, target) {
  const meta = channelAgentToolMeta.get(source);
  if (meta) channelAgentToolMeta.set(target, meta);
}
/**
* Get the list of supported message actions for a specific channel.
* Returns an empty array if channel is not found or has no actions configured.
*/
function listChannelSupportedActions(params) {
  const channelId = (0, _messageActionDiscoveryBTz8VrH.o)(params.channel);
  if (!channelId) return [];
  const plugin = (0, _registryDelpa74L.t)(channelId);
  if (!plugin?.actions) return [];
  return (0, _messageActionDiscoveryBTz8VrH.s)({
    pluginId: plugin.id,
    actions: plugin.actions,
    context: (0, _messageActionDiscoveryBTz8VrH.r)(params),
    includeActions: true
  }).actions;
}
/**
* Get the list of all supported message actions across all configured channels.
*/
function listAllChannelSupportedActions(params) {
  const actions = /* @__PURE__ */new Set();
  for (const plugin of (0, _registryDelpa74L.r)()) {
    const channelActions = (0, _messageActionDiscoveryBTz8VrH.s)({
      pluginId: plugin.id,
      actions: plugin.actions,
      context: (0, _messageActionDiscoveryBTz8VrH.r)({
        ...params,
        currentChannelProvider: plugin.id
      }),
      includeActions: true
    }).actions;
    for (const action of channelActions) actions.add(action);
  }
  return Array.from(actions);
}
function listChannelAgentTools(params) {
  const tools = [];
  for (const plugin of (0, _registryDelpa74L.r)()) {
    const entry = plugin.agentTools;
    if (!entry) continue;
    const resolved = typeof entry === "function" ? entry(params) : entry;
    if (Array.isArray(resolved)) {
      for (const tool of resolved) channelAgentToolMeta.set(tool, { channelId: plugin.id });
      tools.push(...resolved);
    }
  }
  return tools;
}
function resolveChannelMessageToolHints(params) {
  const channelId = (0, _registryCENZffQG.a)(params.channel);
  if (!channelId) return [];
  const resolve = (0, _registryDelpa74L.t)(channelId)?.agentPrompt?.messageToolHints;
  if (!resolve) return [];
  return (resolve({
    cfg: params.cfg ?? {},
    accountId: params.accountId
  }) ?? []).map((entry) => entry.trim()).filter(Boolean);
}
function resolveChannelMessageToolCapabilities(params) {
  const channelId = (0, _registryCENZffQG.a)(params.channel);
  if (!channelId) return [];
  const resolve = (0, _registryDelpa74L.t)(channelId)?.agentPrompt?.messageToolCapabilities;
  if (!resolve) return [];
  return (resolve({
    cfg: params.cfg ?? {},
    accountId: params.accountId
  }) ?? []).map((entry) => entry.trim()).filter(Boolean);
}
function resolveChannelReactionGuidance(params) {
  const channelId = (0, _registryCENZffQG.a)(params.channel);
  if (!channelId) return;
  const resolve = (0, _registryDelpa74L.t)(channelId)?.agentPrompt?.reactionGuidance;
  if (!resolve) return;
  const resolved = resolve({
    cfg: params.cfg ?? {},
    accountId: params.accountId
  });
  if (!resolved?.level) return;
  return {
    level: resolved.level,
    channel: resolved.channelLabel?.trim() || channelId
  };
}
//#endregion /* v9-850898c95dc3fadc */
