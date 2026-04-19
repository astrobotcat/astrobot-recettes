"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = normalizeAnyChannelId;exports.c = listChatChannels;exports.d = isChannelVisibleInSetup;exports.f = resolveChannelExposure;exports.i = listRegisteredChannelPluginIds;exports.l = buildChatChannelMetaById;exports.n = formatChannelSelectionLine;exports.o = normalizeChannelId;exports.r = getRegisteredChannelPluginMeta;exports.s = getChatChannelMeta;exports.t = formatChannelPrimerLine;exports.u = isChannelVisibleInConfiguredLists;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _idsCYPyP4SY = require("./ids-CYPyP4SY.js");
var _runtimeChannelStateCKbFw7bt = require("./runtime-channel-state-CKbFw7bt.js");
//#region src/channels/plugins/exposure.ts
function resolveChannelExposure(meta) {
  return {
    configured: meta.exposure?.configured ?? meta.showConfigured ?? true,
    setup: meta.exposure?.setup ?? meta.showInSetup ?? true,
    docs: meta.exposure?.docs ?? true
  };
}
function isChannelVisibleInConfiguredLists(meta) {
  return resolveChannelExposure(meta).configured;
}
function isChannelVisibleInSetup(meta) {
  return resolveChannelExposure(meta).setup;
}
//#endregion
//#region src/channels/chat-meta-shared.ts
const CHAT_CHANNEL_ID_SET = new Set(_idsCYPyP4SY.n);
function toChatChannelMeta(params) {
  const label = (0, _stringCoerceBUSzWgUA.s)(params.channel.label);
  if (!label) throw new Error(`Missing label for bundled chat channel "${params.id}"`);
  const exposure = resolveChannelExposure(params.channel);
  return {
    id: params.id,
    label,
    selectionLabel: (0, _stringCoerceBUSzWgUA.s)(params.channel.selectionLabel) || label,
    docsPath: (0, _stringCoerceBUSzWgUA.s)(params.channel.docsPath) || `/channels/${params.id}`,
    docsLabel: (0, _stringCoerceBUSzWgUA.s)(params.channel.docsLabel),
    blurb: (0, _stringCoerceBUSzWgUA.s)(params.channel.blurb) || "",
    ...(params.channel.aliases?.length ? { aliases: params.channel.aliases } : {}),
    ...(params.channel.order !== void 0 ? { order: params.channel.order } : {}),
    ...(params.channel.selectionDocsPrefix !== void 0 ? { selectionDocsPrefix: params.channel.selectionDocsPrefix } : {}),
    ...(params.channel.selectionDocsOmitLabel !== void 0 ? { selectionDocsOmitLabel: params.channel.selectionDocsOmitLabel } : {}),
    ...(params.channel.selectionExtras?.length ? { selectionExtras: params.channel.selectionExtras } : {}),
    ...((0, _stringCoerceBUSzWgUA.s)(params.channel.detailLabel) ? { detailLabel: (0, _stringCoerceBUSzWgUA.s)(params.channel.detailLabel) } : {}),
    ...((0, _stringCoerceBUSzWgUA.s)(params.channel.systemImage) ? { systemImage: (0, _stringCoerceBUSzWgUA.s)(params.channel.systemImage) } : {}),
    ...(params.channel.markdownCapable !== void 0 ? { markdownCapable: params.channel.markdownCapable } : {}),
    exposure,
    ...(params.channel.quickstartAllowFrom !== void 0 ? { quickstartAllowFrom: params.channel.quickstartAllowFrom } : {}),
    ...(params.channel.forceAccountBinding !== void 0 ? { forceAccountBinding: params.channel.forceAccountBinding } : {}),
    ...(params.channel.preferSessionLookupForAnnounceTarget !== void 0 ? { preferSessionLookupForAnnounceTarget: params.channel.preferSessionLookupForAnnounceTarget } : {}),
    ...(params.channel.preferOver?.length ? { preferOver: params.channel.preferOver } : {})
  };
}
function buildChatChannelMetaById() {
  const entries = /* @__PURE__ */new Map();
  for (const entry of (0, _idsCYPyP4SY.i)()) {
    const rawId = (0, _stringCoerceBUSzWgUA.s)(entry.id);
    if (!rawId || !CHAT_CHANNEL_ID_SET.has(rawId)) continue;
    const id = rawId;
    entries.set(id, toChatChannelMeta({
      id,
      channel: entry.channel
    }));
  }
  return Object.freeze(Object.fromEntries(entries));
}
//#endregion
//#region src/channels/chat-meta.ts
const CHAT_CHANNEL_META = buildChatChannelMetaById();
function listChatChannels() {
  return _idsCYPyP4SY.n.map((id) => CHAT_CHANNEL_META[id]);
}
function getChatChannelMeta(id) {
  return CHAT_CHANNEL_META[id];
}
//#endregion
//#region src/channels/registry.ts
function listRegisteredChannelPluginEntries() {
  const channelRegistry = (0, _runtimeChannelStateCKbFw7bt.t)();
  if (channelRegistry && channelRegistry.channels && channelRegistry.channels.length > 0) return channelRegistry.channels;
  return [];
}
function findRegisteredChannelPluginEntry(normalizedKey) {
  return listRegisteredChannelPluginEntries().find((entry) => {
    const id = (0, _stringCoerceBUSzWgUA.o)(entry.plugin.id ?? "") ?? "";
    if (id && id === normalizedKey) return true;
    return (entry.plugin.meta?.aliases ?? []).some((alias) => (0, _stringCoerceBUSzWgUA.o)(alias) === normalizedKey);
  });
}
function findRegisteredChannelPluginEntryById(id) {
  const normalizedId = (0, _stringCoerceBUSzWgUA.o)(id);
  if (!normalizedId) return;
  return listRegisteredChannelPluginEntries().find((entry) => (0, _stringCoerceBUSzWgUA.o)(entry.plugin.id) === normalizedId);
}
function normalizeChannelId(raw) {
  return (0, _idsCYPyP4SY.r)(raw);
}
function normalizeAnyChannelId(raw) {
  const key = (0, _stringCoerceBUSzWgUA.o)(raw);
  if (!key) return null;
  return findRegisteredChannelPluginEntry(key)?.plugin.id ?? null;
}
function listRegisteredChannelPluginIds() {
  return listRegisteredChannelPluginEntries().flatMap((entry) => {
    const id = (0, _stringCoerceBUSzWgUA.s)(entry.plugin.id);
    return id ? [id] : [];
  });
}
function getRegisteredChannelPluginMeta(id) {
  return findRegisteredChannelPluginEntryById(id)?.plugin.meta ?? null;
}
function formatChannelPrimerLine(meta) {
  return `${meta.label}: ${meta.blurb}`;
}
function formatChannelSelectionLine(meta, docsLink) {
  const docsPrefix = meta.selectionDocsPrefix ?? "Docs:";
  const docsLabel = meta.docsLabel ?? meta.id;
  const docs = meta.selectionDocsOmitLabel ? docsLink(meta.docsPath) : docsLink(meta.docsPath, docsLabel);
  const extras = (meta.selectionExtras ?? []).filter(Boolean).join(" ");
  return `${meta.label} — ${meta.blurb} ${docsPrefix ? `${docsPrefix} ` : ""}${docs}${extras ? ` ${extras}` : ""}`;
}
//#endregion /* v9-551af54b9b956da9 */
