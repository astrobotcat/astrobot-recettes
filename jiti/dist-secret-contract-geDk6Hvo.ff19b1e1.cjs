"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = collectRuntimeConfigAssignments;exports.t = exports.r = void 0;var _typesSecretsCeL3gSMO = require("./types.secrets-CeL3gSMO.js");
var _runtimeSharedWlb0YE2R = require("./runtime-shared-Wlb0YE2R.js");
var _channelSecretBasicRuntimeCpIIzQ5k = require("./channel-secret-basic-runtime-CpIIzQ5k.js");
require("./channel-secret-basic-runtime-DRCfPgpx.js");
require("./secret-ref-runtime-Dkpiy5jI.js");
//#region extensions/googlechat/src/secret-contract.ts
const secretTargetRegistryEntries = exports.r = [{
  id: "channels.googlechat.accounts.*.serviceAccount",
  targetType: "channels.googlechat.serviceAccount",
  targetTypeAliases: ["channels.googlechat.accounts.*.serviceAccount"],
  configFile: "openclaw.json",
  pathPattern: "channels.googlechat.accounts.*.serviceAccount",
  refPathPattern: "channels.googlechat.accounts.*.serviceAccountRef",
  secretShape: "sibling_ref",
  expectedResolvedValue: "string-or-object",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true,
  accountIdPathSegmentIndex: 3
}, {
  id: "channels.googlechat.serviceAccount",
  targetType: "channels.googlechat.serviceAccount",
  configFile: "openclaw.json",
  pathPattern: "channels.googlechat.serviceAccount",
  refPathPattern: "channels.googlechat.serviceAccountRef",
  secretShape: "sibling_ref",
  expectedResolvedValue: "string-or-object",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}];
function resolveSecretInputRef(params) {
  const explicitRef = (0, _typesSecretsCeL3gSMO.i)(params.refValue, params.defaults);
  const inlineRef = explicitRef ? null : (0, _typesSecretsCeL3gSMO.i)(params.value, params.defaults);
  return {
    explicitRef,
    inlineRef,
    ref: explicitRef ?? inlineRef
  };
}
function collectGoogleChatAccountAssignment(params) {
  const { explicitRef, ref } = resolveSecretInputRef({
    value: params.target.serviceAccount,
    refValue: params.target.serviceAccountRef,
    defaults: params.defaults
  });
  if (!ref) return;
  if (params.active === false) {
    (0, _runtimeSharedWlb0YE2R.c)({
      context: params.context,
      path: `${params.path}.serviceAccount`,
      details: params.inactiveReason
    });
    return;
  }
  if (explicitRef && params.target.serviceAccount !== void 0 && !(0, _typesSecretsCeL3gSMO.i)(params.target.serviceAccount, params.defaults)) (0, _runtimeSharedWlb0YE2R.l)(params.context, {
    code: "SECRETS_REF_OVERRIDES_PLAINTEXT",
    path: params.path,
    message: `${params.path}: serviceAccountRef is set; runtime will ignore plaintext serviceAccount.`
  });
  (0, _runtimeSharedWlb0YE2R.s)(params.context, {
    ref,
    path: `${params.path}.serviceAccount`,
    expected: "string-or-object",
    apply: (value) => {
      params.target.serviceAccount = value;
    }
  });
}
function collectRuntimeConfigAssignments(params) {
  const resolved = (0, _channelSecretBasicRuntimeCpIIzQ5k.a)(params.config, "googlechat");
  if (!resolved) return;
  const googleChat = resolved.channel;
  const surface = (0, _channelSecretBasicRuntimeCpIIzQ5k.l)(googleChat);
  const topLevelServiceAccountActive = !surface.channelEnabled ? false : !surface.hasExplicitAccounts ? true : surface.accounts.some(({ account, enabled }) => enabled && !(0, _runtimeSharedWlb0YE2R.i)(account, "serviceAccount") && !(0, _runtimeSharedWlb0YE2R.i)(account, "serviceAccountRef"));
  collectGoogleChatAccountAssignment({
    target: googleChat,
    path: "channels.googlechat",
    defaults: params.defaults,
    context: params.context,
    active: topLevelServiceAccountActive,
    inactiveReason: "no enabled account inherits this top-level Google Chat serviceAccount."
  });
  if (!surface.hasExplicitAccounts) return;
  for (const { accountId, account, enabled } of surface.accounts) {
    if (!(0, _runtimeSharedWlb0YE2R.i)(account, "serviceAccount") && !(0, _runtimeSharedWlb0YE2R.i)(account, "serviceAccountRef")) continue;
    collectGoogleChatAccountAssignment({
      target: account,
      path: `channels.googlechat.accounts.${accountId}`,
      defaults: params.defaults,
      context: params.context,
      active: enabled,
      inactiveReason: "Google Chat account is disabled."
    });
  }
}
const channelSecrets = exports.t = {
  secretTargetRegistryEntries,
  collectRuntimeConfigAssignments
};
//#endregion /* v9-6231ff015ef2bc13 */
