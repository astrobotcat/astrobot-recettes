"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = buildChannelApprovalNativeTargetKey;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/infra/approval-native-target-key.ts
function buildChannelApprovalNativeTargetKey(target) {
  return `${(0, _stringCoerceBUSzWgUA.s)(target.to) ?? ""}\u0000${target.threadId == null ? "" : (0, _stringCoerceBUSzWgUA.s)(String(target.threadId)) ?? ""}`;
}
//#endregion /* v9-f818f2ce48677e96 */
