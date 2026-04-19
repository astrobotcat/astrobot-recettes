"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveMarkdownTableMode;var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
require("./plugins-D4ODSIPT.js");
var _runtimeBB1a2aCy = require("./runtime-BB1a2aCy.js");
var _accountLookupZCs8AOJr = require("./account-lookup-ZCs8AOJr.js");
//#region src/config/markdown-tables.ts
function buildDefaultTableModes() {
  return new Map((0, _registryDelpa74L.r)().flatMap((plugin) => {
    const defaultMarkdownTableMode = plugin.messaging?.defaultMarkdownTableMode;
    return defaultMarkdownTableMode ? [[plugin.id, defaultMarkdownTableMode]] : [];
  }).toSorted(([left], [right]) => left.localeCompare(right)));
}
let cachedDefaultTableModes = null;
let cachedDefaultTableModesRegistryVersion = null;
function getDefaultTableModes() {
  const registryVersion = (0, _runtimeBB1a2aCy.n)();
  if (!cachedDefaultTableModes || cachedDefaultTableModesRegistryVersion !== registryVersion) {
    cachedDefaultTableModes = buildDefaultTableModes();
    cachedDefaultTableModesRegistryVersion = registryVersion;
  }
  return cachedDefaultTableModes;
}
const EMPTY_DEFAULT_TABLE_MODES = /* @__PURE__ */new Map();
function bindDefaultTableModesMethod(value) {
  if (typeof value !== "function") return value;
  return value.bind(getDefaultTableModes());
}
new Proxy(EMPTY_DEFAULT_TABLE_MODES, { get(_target, prop, _receiver) {
    return bindDefaultTableModesMethod(Reflect.get(getDefaultTableModes(), prop));
  } });
const isMarkdownTableMode = (value) => value === "off" || value === "bullets" || value === "code" || value === "block";
function resolveMarkdownModeFromSection(section, accountId) {
  if (!section) return;
  const normalizedAccountId = (0, _accountIdJ7GeQlaZ.n)(accountId);
  const accounts = section.accounts;
  if (accounts && typeof accounts === "object") {
    const matchMode = (0, _accountLookupZCs8AOJr.t)(accounts, normalizedAccountId)?.markdown?.tables;
    if (isMarkdownTableMode(matchMode)) return matchMode;
  }
  const sectionMode = section.markdown?.tables;
  return isMarkdownTableMode(sectionMode) ? sectionMode : void 0;
}
function resolveMarkdownTableMode(params) {
  const channel = (0, _registryDelpa74L.i)(params.channel);
  const defaultMode = channel ? getDefaultTableModes().get(channel) ?? "code" : "code";
  if (!channel || !params.cfg) return defaultMode;
  const resolved = resolveMarkdownModeFromSection(params.cfg.channels?.[channel] ?? params.cfg?.[channel], params.accountId) ?? defaultMode;
  return resolved === "block" ? "code" : resolved;
}
//#endregion /* v9-8f9936dc9b770e8d */
