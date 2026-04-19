"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = buildPluginApprovalResolvedReplyPayload;exports.n = buildApprovalResolvedReplyPayload;exports.r = buildPluginApprovalPendingReplyPayload;exports.t = buildApprovalPendingReplyPayload;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _pluginApprovalsB00c1v = require("./plugin-approvals-B00c1v1-.js");
var _execApprovalReplyD_dFeWJb = require("./exec-approval-reply-D_dFeWJb.js");
//#region src/plugin-sdk/approval-renderers.ts
const DEFAULT_ALLOWED_DECISIONS = [
"allow-once",
"allow-always",
"deny"];

function buildApprovalPendingReplyPayload(params) {
  const allowedDecisions = params.allowedDecisions ?? DEFAULT_ALLOWED_DECISIONS;
  return {
    text: params.text,
    interactive: (0, _execApprovalReplyD_dFeWJb.t)({
      approvalId: params.approvalId,
      allowedDecisions
    }),
    channelData: {
      execApproval: {
        approvalId: params.approvalId,
        approvalSlug: params.approvalSlug,
        approvalKind: params.approvalKind ?? "exec",
        agentId: (0, _stringCoerceBUSzWgUA.s)(params.agentId),
        allowedDecisions,
        sessionKey: (0, _stringCoerceBUSzWgUA.s)(params.sessionKey),
        state: "pending"
      },
      ...params.channelData
    }
  };
}
function buildApprovalResolvedReplyPayload(params) {
  return {
    text: params.text,
    channelData: {
      execApproval: {
        approvalId: params.approvalId,
        approvalSlug: params.approvalSlug,
        state: "resolved"
      },
      ...params.channelData
    }
  };
}
function buildPluginApprovalPendingReplyPayload(params) {
  return buildApprovalPendingReplyPayload({
    approvalKind: "plugin",
    approvalId: params.request.id,
    approvalSlug: params.approvalSlug ?? params.request.id.slice(0, 8),
    text: params.text ?? (0, _pluginApprovalsB00c1v.s)(params.request, params.nowMs),
    allowedDecisions: params.allowedDecisions,
    channelData: params.channelData
  });
}
function buildPluginApprovalResolvedReplyPayload(params) {
  return buildApprovalResolvedReplyPayload({
    approvalId: params.resolved.id,
    approvalSlug: params.approvalSlug ?? params.resolved.id.slice(0, 8),
    text: params.text ?? (0, _pluginApprovalsB00c1v.c)(params.resolved),
    channelData: params.channelData
  });
}
//#endregion /* v9-4f4d79312a0c2423 */
