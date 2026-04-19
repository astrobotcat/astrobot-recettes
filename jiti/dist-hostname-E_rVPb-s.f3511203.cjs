"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = normalizeHostname;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/infra/net/hostname.ts
function normalizeHostname(hostname) {
  const normalized = (0, _stringCoerceBUSzWgUA.i)(hostname).replace(/\.$/, "");
  if (normalized.startsWith("[") && normalized.endsWith("]")) return normalized.slice(1, -1);
  return normalized;
}
//#endregion /* v9-492ab768e955292d */
