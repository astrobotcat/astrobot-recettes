"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports._ = hasGatewayClientCap;exports.a = isOperatorUiClient;exports.c = isGatewayMessageChannel;exports.d = resolveGatewayMessageChannel;exports.f = resolveMessageChannel;exports.h = exports.g = void 0;exports.i = isMarkdownCapableMessageChannel;exports.m = exports.l = void 0;exports.n = isGatewayCliClient;exports.o = isWebchatClient;exports.p = void 0;exports.r = isInternalMessageChannel;exports.s = isDeliverableMessageChannel;exports.t = isBrowserOperatorUiClient;exports.u = normalizeMessageChannel;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _idsCYPyP4SY = require("./ids-CYPyP4SY.js");
var _registryCENZffQG = require("./registry-CENZffQG.js");
var _messageChannelCoreBIZsQ6dr = require("./message-channel-core-BIZsQ6dr.js");
//#region src/gateway/protocol/client-info.ts
const GATEWAY_CLIENT_IDS = exports.m = {
  WEBCHAT_UI: "webchat-ui",
  CONTROL_UI: "openclaw-control-ui",
  TUI: "openclaw-tui",
  WEBCHAT: "webchat",
  CLI: "cli",
  GATEWAY_CLIENT: "gateway-client",
  MACOS_APP: "openclaw-macos",
  IOS_APP: "openclaw-ios",
  ANDROID_APP: "openclaw-android",
  NODE_HOST: "node-host",
  TEST: "test",
  FINGERPRINT: "fingerprint",
  PROBE: "openclaw-probe"
};
const GATEWAY_CLIENT_NAMES = exports.g = GATEWAY_CLIENT_IDS;
const GATEWAY_CLIENT_MODES = exports.h = {
  WEBCHAT: "webchat",
  CLI: "cli",
  UI: "ui",
  BACKEND: "backend",
  NODE: "node",
  PROBE: "probe",
  TEST: "test"
};
const GATEWAY_CLIENT_CAPS = exports.p = { TOOL_EVENTS: "tool-events" };
const GATEWAY_CLIENT_ID_SET = new Set(Object.values(GATEWAY_CLIENT_IDS));
const GATEWAY_CLIENT_MODE_SET = new Set(Object.values(GATEWAY_CLIENT_MODES));
function normalizeGatewayClientId(raw) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(raw);
  if (!normalized) return;
  return GATEWAY_CLIENT_ID_SET.has(normalized) ? normalized : void 0;
}
function normalizeGatewayClientName(raw) {
  return normalizeGatewayClientId(raw);
}
function normalizeGatewayClientMode(raw) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(raw);
  if (!normalized) return;
  return GATEWAY_CLIENT_MODE_SET.has(normalized) ? normalized : void 0;
}
function hasGatewayClientCap(caps, cap) {
  if (!Array.isArray(caps)) return false;
  return caps.includes(cap);
}
//#endregion
//#region src/utils/message-channel-normalize.ts
function normalizeMessageChannel(raw) {
  return (0, _messageChannelCoreBIZsQ6dr.n)(raw);
}
const listPluginChannelIds = () => {
  return (0, _registryCENZffQG.i)();
};
const listDeliverableMessageChannels = () => Array.from(new Set([..._idsCYPyP4SY.t, ...listPluginChannelIds()]));exports.l = listDeliverableMessageChannels;
const listGatewayMessageChannels = () => [...listDeliverableMessageChannels(), _messageChannelCoreBIZsQ6dr.r];
function isGatewayMessageChannel(value) {
  return listGatewayMessageChannels().includes(value);
}
function isDeliverableMessageChannel(value) {
  return listDeliverableMessageChannels().includes(value);
}
function resolveGatewayMessageChannel(raw) {
  const normalized = normalizeMessageChannel(raw);
  if (!normalized) return;
  return isGatewayMessageChannel(normalized) ? normalized : void 0;
}
function resolveMessageChannel(primary, fallback) {
  return normalizeMessageChannel(primary) ?? normalizeMessageChannel(fallback);
}
//#endregion
//#region src/utils/message-channel.ts
function isGatewayCliClient(client) {
  return normalizeGatewayClientMode(client?.mode) === GATEWAY_CLIENT_MODES.CLI;
}
function isOperatorUiClient(client) {
  const clientId = normalizeGatewayClientName(client?.id);
  return clientId === GATEWAY_CLIENT_NAMES.CONTROL_UI || clientId === GATEWAY_CLIENT_NAMES.TUI;
}
function isBrowserOperatorUiClient(client) {
  return normalizeGatewayClientName(client?.id) === GATEWAY_CLIENT_NAMES.CONTROL_UI;
}
function isInternalMessageChannel(raw) {
  return normalizeMessageChannel(raw) === _messageChannelCoreBIZsQ6dr.r;
}
function isWebchatClient(client) {
  if (normalizeGatewayClientMode(client?.mode) === GATEWAY_CLIENT_MODES.WEBCHAT) return true;
  return normalizeGatewayClientName(client?.id) === GATEWAY_CLIENT_NAMES.WEBCHAT_UI;
}
function isMarkdownCapableMessageChannel(raw) {
  const channel = normalizeMessageChannel(raw);
  if (!channel) return false;
  if (channel === "webchat" || channel === "tui") return true;
  const builtInChannel = (0, _idsCYPyP4SY.r)(channel);
  if (builtInChannel) return (0, _registryCENZffQG.s)(builtInChannel).markdownCapable === true;
  return (0, _registryCENZffQG.r)(channel)?.markdownCapable === true;
}
//#endregion /* v9-bb3890c3b5d97c6f */
