"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveGroupAllowFromSources;exports.n = isSenderIdAllowed;exports.r = mergeDmAllowFromSources;exports.t = firstDefined;var _stringNormalizationXm3f27dv = require("./string-normalization-xm3f27dv.js");
//#region src/channels/allow-from.ts
function mergeDmAllowFromSources(params) {
  const storeEntries = params.dmPolicy === "allowlist" ? [] : params.storeAllowFrom ?? [];
  return (0, _stringNormalizationXm3f27dv.s)([...(params.allowFrom ?? []), ...storeEntries]);
}
function resolveGroupAllowFromSources(params) {
  const explicitGroupAllowFrom = Array.isArray(params.groupAllowFrom) && params.groupAllowFrom.length > 0 ? params.groupAllowFrom : void 0;
  return (0, _stringNormalizationXm3f27dv.s)(explicitGroupAllowFrom ? explicitGroupAllowFrom : params.fallbackToAllowFrom === false ? [] : params.allowFrom ?? []);
}
function firstDefined(...values) {
  for (const value of values) if (typeof value !== "undefined") return value;
}
function isSenderIdAllowed(allow, senderId, allowWhenEmpty) {
  if (!allow.hasEntries) return allowWhenEmpty;
  if (allow.hasWildcard) return true;
  if (!senderId) return false;
  return allow.entries.includes(senderId);
}
//#endregion /* v9-d4298023550f14fb */
