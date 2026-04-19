"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = createChannelNativeOriginTargetResolver;exports.t = createChannelApproverDmTargetResolver;var _execApprovalSessionTargetBO6xI_Ze = require("./exec-approval-session-target-bO6xI_Ze.js");
//#region src/plugin-sdk/approval-native-helpers.ts
function createChannelNativeOriginTargetResolver(params) {
  return (input) => {
    if (params.shouldHandleRequest && !params.shouldHandleRequest(input)) return null;
    return (0, _execApprovalSessionTargetBO6xI_Ze.t)({
      cfg: input.cfg,
      request: input.request,
      channel: params.channel,
      accountId: input.accountId,
      resolveTurnSourceTarget: params.resolveTurnSourceTarget,
      resolveSessionTarget: (sessionTarget) => params.resolveSessionTarget(sessionTarget, input.request),
      targetsMatch: params.targetsMatch,
      resolveFallbackTarget: params.resolveFallbackTarget
    });
  };
}
function createChannelApproverDmTargetResolver(params) {
  return (input) => {
    if (params.shouldHandleRequest && !params.shouldHandleRequest(input)) return [];
    const targets = [];
    for (const approver of params.resolveApprovers({
      cfg: input.cfg,
      accountId: input.accountId
    })) {
      const target = params.mapApprover(approver, input);
      if (target) targets.push(target);
    }
    return targets;
  };
}
//#endregion /* v9-c47d9a4875f2a14b */
