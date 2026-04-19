"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = normalizeMessageChannel;exports.r = void 0;exports.t = isDeliverableMessageChannel;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _idsCYPyP4SY = require("./ids-CYPyP4SY.js");
var _runtimeChannelStateCKbFw7bt = require("./runtime-channel-state-CKbFw7bt.js");
//#region src/utils/message-channel-constants.ts
const INTERNAL_MESSAGE_CHANNEL = exports.r = "webchat";
//#endregion
//#region src/channels/registry-normalize.ts
function listRegisteredChannelPluginEntries() {
  const channelRegistry = (0, _runtimeChannelStateCKbFw7bt.t)();
  if (channelRegistry?.channels && channelRegistry.channels.length > 0) return channelRegistry.channels;
  return [];
}
function normalizeAnyChannelId(raw) {
  const key = (0, _stringCoerceBUSzWgUA.o)(raw);
  if (!key) return null;
  return listRegisteredChannelPluginEntries().find((entry) => {
    const id = (0, _stringCoerceBUSzWgUA.o)(entry.plugin.id ?? "") ?? "";
    if (id && id === key) return true;
    return (entry.plugin.meta?.aliases ?? []).some((alias) => (0, _stringCoerceBUSzWgUA.o)(alias) === key);
  })?.plugin.id ?? null;
}
//#endregion
//#region src/utils/message-channel-core.ts
function normalizeMessageChannel(raw) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(raw);
  if (!normalized) return;
  if (normalized === "webchat") return INTERNAL_MESSAGE_CHANNEL;
  const builtIn = (0, _idsCYPyP4SY.r)(normalized);
  if (builtIn) return builtIn;
  return normalizeAnyChannelId(normalized) ?? normalized;
}
function isDeliverableMessageChannel(value) {
  const normalized = normalizeMessageChannel(value);
  return normalized !== void 0 && normalized !== "webchat" && normalized === value;
}
//#endregion /* v9-aa3a455b98d29597 */
