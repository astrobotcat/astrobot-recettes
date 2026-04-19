"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveOutboundChannelPlugin;exports.t = normalizeDeliverableOutboundChannel;var _registryDelpa74L = require("./registry-Delpa74L.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
require("./plugins-D4ODSIPT.js");
var _runtimeBB1a2aCy = require("./runtime-BB1a2aCy.js");
var _channelBootstrapRuntimeCDGNuZu = require("./channel-bootstrap.runtime-CD-GNuZu.js");
//#region src/infra/outbound/channel-resolution.ts
function normalizeDeliverableOutboundChannel(raw) {
  const normalized = (0, _messageChannelCBqCPFa_.u)(raw);
  if (!normalized || !(0, _messageChannelCBqCPFa_.s)(normalized)) return;
  return normalized;
}
function maybeBootstrapChannelPlugin(params) {
  (0, _channelBootstrapRuntimeCDGNuZu.t)(params);
}
function resolveDirectFromActiveRegistry(channel) {
  const activeRegistry = (0, _runtimeBB1a2aCy.r)();
  if (!activeRegistry) return;
  for (const entry of activeRegistry.channels) {
    const plugin = entry?.plugin;
    if (plugin?.id === channel) return plugin;
  }
}
function resolveOutboundChannelPlugin(params) {
  const normalized = normalizeDeliverableOutboundChannel(params.channel);
  if (!normalized) return;
  const resolveLoaded = () => (0, _registryDelpa74L.n)(normalized);
  const resolve = () => (0, _registryDelpa74L.t)(normalized);
  const current = resolveLoaded();
  if (current) return current;
  const directCurrent = resolveDirectFromActiveRegistry(normalized);
  if (directCurrent) return directCurrent;
  maybeBootstrapChannelPlugin({
    channel: normalized,
    cfg: params.cfg
  });
  return resolveLoaded() ?? resolveDirectFromActiveRegistry(normalized) ?? resolve();
}
//#endregion /* v9-b2dfb041563c3d9e */
