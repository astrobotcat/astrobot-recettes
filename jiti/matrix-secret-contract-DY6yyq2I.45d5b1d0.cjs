"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = collectRuntimeConfigAssignments;exports.t = exports.r = void 0;var _envVarsCpXNsTJq = require("./env-vars-CpXNsTJq.js");
var _accountId = require("openclaw/plugin-sdk/account-id");
var _channelSecretBasicRuntime = require("openclaw/plugin-sdk/channel-secret-basic-runtime");
//#region extensions/matrix/src/secret-contract.ts
const secretTargetRegistryEntries = exports.r = [
{
  id: "channels.matrix.accounts.*.accessToken",
  targetType: "channels.matrix.accounts.*.accessToken",
  configFile: "openclaw.json",
  pathPattern: "channels.matrix.accounts.*.accessToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.matrix.accounts.*.password",
  targetType: "channels.matrix.accounts.*.password",
  configFile: "openclaw.json",
  pathPattern: "channels.matrix.accounts.*.password",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.matrix.accessToken",
  targetType: "channels.matrix.accessToken",
  configFile: "openclaw.json",
  pathPattern: "channels.matrix.accessToken",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
},
{
  id: "channels.matrix.password",
  targetType: "channels.matrix.password",
  configFile: "openclaw.json",
  pathPattern: "channels.matrix.password",
  secretShape: "secret_input",
  expectedResolvedValue: "string",
  includeInPlan: true,
  includeInConfigure: true,
  includeInAudit: true
}];

function collectRuntimeConfigAssignments(params) {
  const resolved = (0, _channelSecretBasicRuntime.getChannelSurface)(params.config, "matrix");
  if (!resolved) return;
  const { channel: matrix, surface } = resolved;
  const envAccessTokenConfigured = (0, _channelSecretBasicRuntime.normalizeSecretStringValue)(params.context.env.MATRIX_ACCESS_TOKEN).length > 0;
  const defaultScopedAccessTokenConfigured = (0, _channelSecretBasicRuntime.normalizeSecretStringValue)(params.context.env[(0, _envVarsCpXNsTJq.t)("default").accessToken]).length > 0;
  const defaultAccountAccessTokenConfigured = surface.accounts.some(({ accountId, account }) => (0, _accountId.normalizeAccountId)(accountId) === _accountId.DEFAULT_ACCOUNT_ID && (0, _channelSecretBasicRuntime.hasConfiguredSecretInputValue)(account.accessToken, params.defaults));
  const baseAccessTokenConfigured = (0, _channelSecretBasicRuntime.hasConfiguredSecretInputValue)(matrix.accessToken, params.defaults);
  (0, _channelSecretBasicRuntime.collectSecretInputAssignment)({
    value: matrix.accessToken,
    path: "channels.matrix.accessToken",
    expected: "string",
    defaults: params.defaults,
    context: params.context,
    active: surface.channelEnabled,
    inactiveReason: "Matrix channel is disabled.",
    apply: (value) => {
      matrix.accessToken = value;
    }
  });
  (0, _channelSecretBasicRuntime.collectSecretInputAssignment)({
    value: matrix.password,
    path: "channels.matrix.password",
    expected: "string",
    defaults: params.defaults,
    context: params.context,
    active: surface.channelEnabled && !(baseAccessTokenConfigured || envAccessTokenConfigured || defaultScopedAccessTokenConfigured || defaultAccountAccessTokenConfigured),
    inactiveReason: "Matrix channel is disabled or access-token auth is configured for the default Matrix account.",
    apply: (value) => {
      matrix.password = value;
    }
  });
  if (!surface.hasExplicitAccounts) return;
  for (const { accountId, account, enabled } of surface.accounts) {
    if ((0, _channelSecretBasicRuntime.hasOwnProperty)(account, "accessToken")) (0, _channelSecretBasicRuntime.collectSecretInputAssignment)({
      value: account.accessToken,
      path: `channels.matrix.accounts.${accountId}.accessToken`,
      expected: "string",
      defaults: params.defaults,
      context: params.context,
      active: enabled,
      inactiveReason: "Matrix account is disabled.",
      apply: (value) => {
        account.accessToken = value;
      }
    });
    if (!(0, _channelSecretBasicRuntime.hasOwnProperty)(account, "password")) continue;
    const accountAccessTokenConfigured = (0, _channelSecretBasicRuntime.hasConfiguredSecretInputValue)(account.accessToken, params.defaults);
    const scopedEnvAccessTokenConfigured = (0, _channelSecretBasicRuntime.normalizeSecretStringValue)(params.context.env[(0, _envVarsCpXNsTJq.t)(accountId).accessToken]).length > 0;
    const inheritedDefaultAccountAccessTokenConfigured = (0, _accountId.normalizeAccountId)(accountId) === _accountId.DEFAULT_ACCOUNT_ID && (baseAccessTokenConfigured || envAccessTokenConfigured);
    (0, _channelSecretBasicRuntime.collectSecretInputAssignment)({
      value: account.password,
      path: `channels.matrix.accounts.${accountId}.password`,
      expected: "string",
      defaults: params.defaults,
      context: params.context,
      active: enabled && !(accountAccessTokenConfigured || scopedEnvAccessTokenConfigured || inheritedDefaultAccountAccessTokenConfigured),
      inactiveReason: "Matrix account is disabled or this account has an accessToken configured.",
      apply: (value) => {
        account.password = value;
      }
    });
  }
}
const channelSecrets = exports.t = {
  secretTargetRegistryEntries,
  collectRuntimeConfigAssignments
};
//#endregion /* v9-292f161e86b8b88c */
