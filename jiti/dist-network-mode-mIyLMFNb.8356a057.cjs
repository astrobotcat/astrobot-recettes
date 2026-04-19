"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = isDangerousNetworkMode;exports.r = normalizeNetworkMode;exports.t = getBlockedNetworkModeReason;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/agents/sandbox/network-mode.ts
function normalizeNetworkMode(network) {
  return (0, _stringCoerceBUSzWgUA.o)(network) || void 0;
}
function getBlockedNetworkModeReason(params) {
  const normalized = normalizeNetworkMode(params.network);
  if (!normalized) return null;
  if (normalized === "host") return "host";
  if (normalized.startsWith("container:") && params.allowContainerNamespaceJoin !== true) return "container_namespace_join";
  return null;
}
function isDangerousNetworkMode(network) {
  const normalized = normalizeNetworkMode(network);
  return normalized === "host" || normalized?.startsWith("container:") === true;
}
//#endregion /* v9-c2513ca46d71cc96 */
