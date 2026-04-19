"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = isChannelExecApprovalClientEnabledFromConfig;exports.r = isChannelExecApprovalTargetRecipient;exports.t = createChannelExecApprovalProfile;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
require("./routing-BI8_fMua.js");
var _approvalRequestFiltersBVMe8VKV = require("./approval-request-filters-BVMe8VKV.js");
var _execApprovalReplyD_dFeWJb = require("./exec-approval-reply-D_dFeWJb.js");
//#region src/plugin-sdk/approval-client-helpers.ts
function isApprovalTargetsMode(cfg) {
  const execApprovals = cfg.approvals?.exec;
  if (!execApprovals?.enabled) return false;
  return execApprovals.mode === "targets" || execApprovals.mode === "both";
}
function isChannelExecApprovalClientEnabledFromConfig(params) {
  if (params.approverCount <= 0) return false;
  return params.enabled !== false;
}
function isChannelExecApprovalTargetRecipient(params) {
  const normalizeSenderId = params.normalizeSenderId ?? _stringCoerceBUSzWgUA.s;
  const normalizedSenderId = params.senderId ? normalizeSenderId(params.senderId) : void 0;
  const normalizedChannel = (0, _stringCoerceBUSzWgUA.o)(params.channel);
  if (!normalizedSenderId || !isApprovalTargetsMode(params.cfg)) return false;
  const targets = params.cfg.approvals?.exec?.targets;
  if (!targets) return false;
  const normalizedAccountId = params.accountId ? (0, _accountIdJ7GeQlaZ.n)(params.accountId) : void 0;
  return targets.some((target) => {
    if ((0, _stringCoerceBUSzWgUA.o)(target.channel) !== normalizedChannel) return false;
    if (normalizedAccountId && target.accountId && (0, _accountIdJ7GeQlaZ.n)(target.accountId) !== normalizedAccountId) return false;
    return params.matchTarget({
      target,
      normalizedSenderId,
      normalizedAccountId
    });
  });
}
function createChannelExecApprovalProfile(params) {
  const normalizeSenderId = params.normalizeSenderId ?? _stringCoerceBUSzWgUA.s;
  const isClientEnabled = (input) => {
    return isChannelExecApprovalClientEnabledFromConfig({
      enabled: params.resolveConfig(input)?.enabled,
      approverCount: params.resolveApprovers(input).length
    });
  };
  const isApprover = (input) => {
    const normalizedSenderId = input.senderId ? normalizeSenderId(input.senderId) : void 0;
    if (!normalizedSenderId) return false;
    return params.resolveApprovers(input).includes(normalizedSenderId);
  };
  const isAuthorizedSender = (input) => {
    return isApprover(input) || (params.isTargetRecipient?.(input) ?? false);
  };
  const resolveTarget = (input) => {
    return params.resolveConfig(input)?.target ?? "dm";
  };
  const shouldHandleRequest = (input) => {
    if (params.matchesRequestAccount && !params.matchesRequestAccount(input)) return false;
    const config = params.resolveConfig(input);
    const approverCount = params.resolveApprovers(input).length;
    if (!isChannelExecApprovalClientEnabledFromConfig({
      enabled: config?.enabled,
      approverCount
    })) return false;
    return (0, _approvalRequestFiltersBVMe8VKV.t)({
      request: input.request.request,
      agentFilter: config?.agentFilter,
      sessionFilter: config?.sessionFilter,
      fallbackAgentIdFromSessionKey: params.fallbackAgentIdFromSessionKey === true
    });
  };
  const shouldSuppressLocalPrompt = (input) => {
    if (params.requireClientEnabledForLocalPromptSuppression !== false && !isClientEnabled(input)) return false;
    return (0, _execApprovalReplyD_dFeWJb.u)(input.payload) !== null;
  };
  return {
    isClientEnabled,
    isApprover,
    isAuthorizedSender,
    resolveTarget,
    shouldHandleRequest,
    shouldSuppressLocalPrompt
  };
}
//#endregion /* v9-17676801c8b297a7 */
