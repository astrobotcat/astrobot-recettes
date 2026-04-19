"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = void 0;var _accountsCoskdHdZ = require("./accounts-CoskdHdZ.js");
var _outboundParamsDPqRaEDE = require("./outbound-params-DPqRaEDE.js");
var _execApprovalsGJ9TaLpO = require("./exec-approvals-GJ9TaLpO.js");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
var _approvalDeliveryRuntime = require("openclaw/plugin-sdk/approval-delivery-runtime");
var _approvalHandlerAdapterRuntime = require("openclaw/plugin-sdk/approval-handler-adapter-runtime");
var _approvalNativeRuntime = require("openclaw/plugin-sdk/approval-native-runtime");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region extensions/telegram/src/approval-native.ts
function resolveTurnSourceTelegramOriginTarget(request) {
  const turnSourceChannel = (0, _textRuntime.normalizeLowercaseStringOrEmpty)(request.request.turnSourceChannel);
  const rawTurnSourceTo = (0, _textRuntime.normalizeOptionalString)(request.request.turnSourceTo) ?? "";
  const parsedTurnSourceTarget = rawTurnSourceTo ? (0, _outboundParamsDPqRaEDE.s)(rawTurnSourceTo) : null;
  const turnSourceTo = (0, _outboundParamsDPqRaEDE.a)(parsedTurnSourceTarget?.chatId ?? rawTurnSourceTo);
  if (turnSourceChannel !== "telegram" || !turnSourceTo) return null;
  return {
    to: turnSourceTo,
    threadId: (0, _outboundParamsDPqRaEDE.r)(request.request.turnSourceThreadId ?? parsedTurnSourceTarget?.messageThreadId ?? void 0)
  };
}
function resolveSessionTelegramOriginTarget(sessionTarget) {
  return {
    to: (0, _outboundParamsDPqRaEDE.a)(sessionTarget.to) ?? sessionTarget.to,
    threadId: (0, _outboundParamsDPqRaEDE.r)(sessionTarget.threadId)
  };
}
function telegramTargetsMatch(a, b) {
  return ((0, _outboundParamsDPqRaEDE.a)(a.to) ?? a.to) === ((0, _outboundParamsDPqRaEDE.a)(b.to) ?? b.to) && a.threadId === b.threadId;
}
const telegramNativeApprovalCapability = (0, _approvalDeliveryRuntime.createApproverRestrictedNativeApprovalCapability)({
  channel: "telegram",
  channelLabel: "Telegram",
  describeExecApprovalSetup: ({ accountId }) => {
    const prefix = accountId && accountId !== "default" ? `channels.telegram.accounts.${accountId}` : "channels.telegram";
    return `Approve it from the Web UI or terminal UI for now. Telegram supports native exec approvals for this account. Configure \`${prefix}.execApprovals.approvers\`; if you leave it unset, OpenClaw can infer numeric owner IDs from \`${prefix}.allowFrom\` or direct-message \`${prefix}.defaultTo\` when possible. Leave \`${prefix}.execApprovals.enabled\` unset/\`auto\` or set it to \`true\`.`;
  },
  listAccountIds: _accountsCoskdHdZ.r,
  hasApprovers: ({ cfg, accountId }) => (0, _execApprovalsGJ9TaLpO.t)({
    cfg,
    accountId
  }).length > 0,
  isExecAuthorizedSender: ({ cfg, accountId, senderId }) => (0, _execApprovalsGJ9TaLpO.r)({
    cfg,
    accountId,
    senderId
  }),
  isPluginAuthorizedSender: ({ cfg, accountId, senderId }) => (0, _execApprovalsGJ9TaLpO.n)({
    cfg,
    accountId,
    senderId
  }),
  isNativeDeliveryEnabled: ({ cfg, accountId }) => (0, _execApprovalsGJ9TaLpO.i)({
    cfg,
    accountId
  }),
  resolveNativeDeliveryMode: ({ cfg, accountId }) => (0, _execApprovalsGJ9TaLpO.c)({
    cfg,
    accountId
  }),
  requireMatchingTurnSourceChannel: true,
  resolveSuppressionAccountId: ({ target, request }) => (0, _textRuntime.normalizeOptionalString)(target.accountId) ?? (0, _textRuntime.normalizeOptionalString)(request.request.turnSourceAccountId),
  resolveOriginTarget: (0, _approvalNativeRuntime.createChannelNativeOriginTargetResolver)({
    channel: "telegram",
    shouldHandleRequest: ({ cfg, accountId, request }) => (0, _execApprovalsGJ9TaLpO.u)({
      cfg,
      accountId,
      request
    }),
    resolveTurnSourceTarget: resolveTurnSourceTelegramOriginTarget,
    resolveSessionTarget: resolveSessionTelegramOriginTarget,
    targetsMatch: telegramTargetsMatch
  }),
  resolveApproverDmTargets: (0, _approvalNativeRuntime.createChannelApproverDmTargetResolver)({
    shouldHandleRequest: ({ cfg, accountId, request }) => (0, _execApprovalsGJ9TaLpO.u)({
      cfg,
      accountId,
      request
    }),
    resolveApprovers: _execApprovalsGJ9TaLpO.t,
    mapApprover: (approver) => ({ to: approver })
  }),
  notifyOriginWhenDmOnly: true,
  nativeRuntime: (0, _approvalHandlerAdapterRuntime.createLazyChannelApprovalNativeRuntimeAdapter)({
    eventKinds: ["exec", "plugin"],
    isConfigured: ({ cfg, accountId }) => (0, _execApprovalsGJ9TaLpO.i)({
      cfg,
      accountId
    }),
    shouldHandle: ({ cfg, accountId, request }) => (0, _execApprovalsGJ9TaLpO.u)({
      cfg,
      accountId,
      request
    }),
    load: async () => (await Promise.resolve().then(() => jitiImport("./approval-handler.runtime-byKYbOxh.js").then((m) => _interopRequireWildcard(m)))).telegramApprovalNativeRuntime
  })
});
const resolveTelegramApproveCommandBehavior = (params) => {
  const { cfg, accountId, senderId, approvalKind } = params;
  if (approvalKind !== "exec") return;
  if ((0, _execApprovalsGJ9TaLpO.i)({
    cfg,
    accountId
  })) return;
  if ((0, _execApprovalsGJ9TaLpO.o)({
    cfg,
    accountId,
    senderId
  })) return;
  if ((0, _execApprovalsGJ9TaLpO.r)({
    cfg,
    accountId,
    senderId
  }) && !(0, _execApprovalsGJ9TaLpO.n)({
    cfg,
    accountId,
    senderId
  })) return;
  return {
    kind: "reply",
    text: "❌ Telegram exec approvals are not enabled for this bot account."
  };
};
const telegramApprovalCapability = exports.t = {
  ...telegramNativeApprovalCapability,
  resolveApproveCommandBehavior: resolveTelegramApproveCommandBehavior
};
(0, _approvalDeliveryRuntime.splitChannelApprovalCapability)(telegramApprovalCapability);
//#endregion /* v9-2867b963556ddc87 */
