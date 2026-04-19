"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveOriginMessageProvider;exports.r = resolveOriginMessageTo;exports.t = resolveOriginAccountId;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/auto-reply/reply/origin-routing.ts
function resolveOriginMessageProvider(params) {
  return (0, _stringCoerceBUSzWgUA.o)(params.originatingChannel) ?? (0, _stringCoerceBUSzWgUA.o)(params.provider);
}
function resolveOriginMessageTo(params) {
  return params.originatingTo ?? params.to;
}
function resolveOriginAccountId(params) {
  return params.originatingAccountId ?? params.accountId;
}
//#endregion /* v9-514f6fa5baf5e790 */
