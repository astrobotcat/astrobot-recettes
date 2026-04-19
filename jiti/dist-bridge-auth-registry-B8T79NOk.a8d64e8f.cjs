"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = getBridgeAuthForPort;exports.r = setBridgeAuthForPort;exports.t = deleteBridgeAuthForPort;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
require("./text-runtime-DTMxvodz.js");
//#region extensions/browser/src/browser/bridge-auth-registry.ts
const authByPort = /* @__PURE__ */new Map();
function setBridgeAuthForPort(port, auth) {
  if (!Number.isFinite(port) || port <= 0) return;
  const token = (0, _stringCoerceBUSzWgUA.s)(auth.token) ?? "";
  const password = (0, _stringCoerceBUSzWgUA.s)(auth.password) ?? "";
  authByPort.set(port, {
    token: token || void 0,
    password: password || void 0
  });
}
function getBridgeAuthForPort(port) {
  if (!Number.isFinite(port) || port <= 0) return;
  return authByPort.get(port);
}
function deleteBridgeAuthForPort(port) {
  if (!Number.isFinite(port) || port <= 0) return;
  authByPort.delete(port);
}
//#endregion /* v9-7577bcb831f2561f */
