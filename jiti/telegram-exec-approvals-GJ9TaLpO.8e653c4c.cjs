"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = isTelegramExecApprovalHandlerConfigured;exports.c = void 0;exports.d = shouldInjectTelegramExecApprovalButtons;exports.f = shouldSuppressLocalTelegramExecApprovalPrompt;exports.i = void 0;exports.l = shouldEnableTelegramExecApprovalButtons;exports.n = void 0;exports.o = isTelegramExecApprovalTargetRecipient;exports.r = void 0;exports.s = resolveTelegramExecApprovalConfig;exports.t = getTelegramExecApprovalApprovers;exports.u = void 0;var _accountsCoskdHdZ = require("./accounts-CoskdHdZ.js");
var _outboundParamsDPqRaEDE = require("./outbound-params-DPqRaEDE.js");
var _inlineButtonsZDRhkQx = require("./inline-buttons-zDRhkQx3.js");
var _routing = require("openclaw/plugin-sdk/routing");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
var _approvalNativeRuntime = require("openclaw/plugin-sdk/approval-native-runtime");
var _approvalAuthRuntime = require("openclaw/plugin-sdk/approval-auth-runtime");
var _approvalClientRuntime = require("openclaw/plugin-sdk/approval-client-runtime");
//#region extensions/telegram/src/exec-approvals.ts
function normalizeApproverId(value) {
  return (0, _textRuntime.normalizeOptionalString)(String(value)) ?? "";
}
function normalizeTelegramDirectApproverId(value) {
  const chatId = (0, _outboundParamsDPqRaEDE.a)(normalizeApproverId(value));
  if (!chatId || chatId.startsWith("-")) return;
  return chatId;
}
function resolveTelegramExecApprovalConfig(params) {
  const account = (0, _accountsCoskdHdZ.s)(params);
  const config = account.config.execApprovals;
  if (!config) return;
  return {
    ...config,
    enabled: account.enabled && account.tokenSource !== "none" ? config.enabled : false
  };
}
function getTelegramExecApprovalApprovers(params) {
  const account = (0, _accountsCoskdHdZ.s)(params).config;
  return (0, _approvalAuthRuntime.resolveApprovalApprovers)({
    explicit: resolveTelegramExecApprovalConfig(params)?.approvers,
    allowFrom: account.allowFrom,
    defaultTo: account.defaultTo ? String(account.defaultTo) : null,
    normalizeApprover: normalizeTelegramDirectApproverId
  });
}
function isTelegramExecApprovalTargetRecipient(params) {
  return (0, _approvalClientRuntime.isChannelExecApprovalTargetRecipient)({
    ...params,
    channel: "telegram",
    matchTarget: ({ target, normalizedSenderId }) => {
      const to = target.to ? (0, _outboundParamsDPqRaEDE.a)(target.to) : void 0;
      if (!to || to.startsWith("-")) return false;
      return to === normalizedSenderId;
    }
  });
}
function countTelegramExecApprovalEligibleAccounts(params) {
  return (0, _accountsCoskdHdZ.r)(params.cfg).filter((accountId) => {
    const account = (0, _accountsCoskdHdZ.s)({
      cfg: params.cfg,
      accountId
    });
    if (!account.enabled || account.tokenSource === "none") return false;
    const config = resolveTelegramExecApprovalConfig({
      cfg: params.cfg,
      accountId
    });
    return (0, _approvalClientRuntime.isChannelExecApprovalClientEnabledFromConfig)({
      enabled: config?.enabled,
      approverCount: getTelegramExecApprovalApprovers({
        cfg: params.cfg,
        accountId
      }).length
    }) && (0, _approvalClientRuntime.matchesApprovalRequestFilters)({
      request: params.request.request,
      agentFilter: config?.agentFilter,
      sessionFilter: config?.sessionFilter,
      fallbackAgentIdFromSessionKey: true
    });
  }).length;
}
function matchesTelegramRequestAccount(params) {
  const turnSourceChannel = (0, _textRuntime.normalizeLowercaseStringOrEmpty)(params.request.request.turnSourceChannel);
  const boundAccountId = (0, _approvalNativeRuntime.resolveApprovalRequestChannelAccountId)({
    cfg: params.cfg,
    request: params.request,
    channel: "telegram"
  });
  if (turnSourceChannel && turnSourceChannel !== "telegram" && !boundAccountId) return countTelegramExecApprovalEligibleAccounts({
    cfg: params.cfg,
    request: params.request
  }) <= 1;
  return !boundAccountId || !params.accountId || (0, _routing.normalizeAccountId)(boundAccountId) === (0, _routing.normalizeAccountId)(params.accountId);
}
const telegramExecApprovalProfile = (0, _approvalClientRuntime.createChannelExecApprovalProfile)({
  resolveConfig: resolveTelegramExecApprovalConfig,
  resolveApprovers: getTelegramExecApprovalApprovers,
  isTargetRecipient: isTelegramExecApprovalTargetRecipient,
  matchesRequestAccount: matchesTelegramRequestAccount,
  fallbackAgentIdFromSessionKey: true,
  requireClientEnabledForLocalPromptSuppression: false
});
const isTelegramExecApprovalClientEnabled = exports.i = telegramExecApprovalProfile.isClientEnabled;
const isTelegramExecApprovalApprover = exports.n = telegramExecApprovalProfile.isApprover;
const isTelegramExecApprovalAuthorizedSender = exports.r = telegramExecApprovalProfile.isAuthorizedSender;
const resolveTelegramExecApprovalTarget = exports.c = telegramExecApprovalProfile.resolveTarget;
const shouldHandleTelegramExecApprovalRequest = exports.u = telegramExecApprovalProfile.shouldHandleRequest;
function shouldInjectTelegramExecApprovalButtons(params) {
  if (!isTelegramExecApprovalClientEnabled(params)) return false;
  const target = resolveTelegramExecApprovalTarget(params);
  const chatType = (0, _outboundParamsDPqRaEDE.c)(params.to);
  if (chatType === "direct") return target === "dm" || target === "both";
  if (chatType === "group") return target === "channel" || target === "both";
  return target === "both";
}
function resolveExecApprovalButtonsExplicitlyDisabled(params) {
  const capabilities = (0, _accountsCoskdHdZ.s)(params).config.capabilities;
  return (0, _inlineButtonsZDRhkQx.n)(capabilities) === "off";
}
function shouldEnableTelegramExecApprovalButtons(params) {
  if (!shouldInjectTelegramExecApprovalButtons(params)) return false;
  return !resolveExecApprovalButtonsExplicitlyDisabled(params);
}
function shouldSuppressLocalTelegramExecApprovalPrompt(params) {
  return telegramExecApprovalProfile.shouldSuppressLocalPrompt(params);
}
function isTelegramExecApprovalHandlerConfigured(params) {
  return (0, _approvalClientRuntime.isChannelExecApprovalClientEnabledFromConfig)({
    enabled: resolveTelegramExecApprovalConfig(params)?.enabled,
    approverCount: getTelegramExecApprovalApprovers(params).length
  });
}
//#endregion /* v9-026f24ef6c655b6e */
