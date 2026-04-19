"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = getChannelSurface;exports.c = normalizeSecretStringValue;exports.i = getChannelRecord;exports.l = resolveChannelAccountSurface;exports.n = collectNestedChannelFieldAssignments;exports.o = hasConfiguredSecretInputValue;exports.r = collectSimpleChannelFieldAssignments;exports.s = isBaseFieldActiveForChannelSurface;exports.t = collectConditionalChannelFieldAssignments;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _typesSecretsCeL3gSMO = require("./types.secrets-CeL3gSMO.js");
require("./shared-DLDubI1E.js");
var _runtimeSharedWlb0YE2R = require("./runtime-shared-Wlb0YE2R.js");
//#region src/secrets/channel-secret-basic-runtime.ts
function getChannelRecord(config, channelKey) {
  const channels = config.channels;
  if (!(0, _utilsD5DtWkEu.l)(channels)) return;
  const channel = channels[channelKey];
  return (0, _utilsD5DtWkEu.l)(channel) ? channel : void 0;
}
function getChannelSurface(config, channelKey) {
  const channel = getChannelRecord(config, channelKey);
  if (!channel) return null;
  return {
    channel,
    surface: resolveChannelAccountSurface(channel)
  };
}
function resolveChannelAccountSurface(channel) {
  const channelEnabled = (0, _runtimeSharedWlb0YE2R.o)(channel);
  const accounts = channel.accounts;
  if (!(0, _utilsD5DtWkEu.l)(accounts) || Object.keys(accounts).length === 0) return {
    hasExplicitAccounts: false,
    channelEnabled,
    accounts: [{
      accountId: "default",
      account: channel,
      enabled: channelEnabled
    }]
  };
  const accountEntries = [];
  for (const [accountId, account] of Object.entries(accounts)) {
    if (!(0, _utilsD5DtWkEu.l)(account)) continue;
    accountEntries.push({
      accountId,
      account,
      enabled: (0, _runtimeSharedWlb0YE2R.a)(channel, account)
    });
  }
  return {
    hasExplicitAccounts: true,
    channelEnabled,
    accounts: accountEntries
  };
}
function isBaseFieldActiveForChannelSurface(surface, rootKey) {
  if (!surface.channelEnabled) return false;
  if (!surface.hasExplicitAccounts) return true;
  return surface.accounts.some(({ account, enabled }) => enabled && !(0, _runtimeSharedWlb0YE2R.i)(account, rootKey));
}
function normalizeSecretStringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}
function hasConfiguredSecretInputValue(value, defaults) {
  return normalizeSecretStringValue(value).length > 0 || (0, _typesSecretsCeL3gSMO.i)(value, defaults) !== null;
}
function collectSimpleChannelFieldAssignments(params) {
  (0, _runtimeSharedWlb0YE2R.n)({
    value: params.channel[params.field],
    path: `channels.${params.channelKey}.${params.field}`,
    expected: "string",
    defaults: params.defaults,
    context: params.context,
    active: isBaseFieldActiveForChannelSurface(params.surface, params.field),
    inactiveReason: params.topInactiveReason,
    apply: (value) => {
      params.channel[params.field] = value;
    }
  });
  if (!params.surface.hasExplicitAccounts) return;
  for (const { accountId, account, enabled } of params.surface.accounts) {
    if (!(0, _runtimeSharedWlb0YE2R.i)(account, params.field)) continue;
    (0, _runtimeSharedWlb0YE2R.n)({
      value: account[params.field],
      path: `channels.${params.channelKey}.accounts.${accountId}.${params.field}`,
      expected: "string",
      defaults: params.defaults,
      context: params.context,
      active: enabled,
      inactiveReason: params.accountInactiveReason,
      apply: (value) => {
        account[params.field] = value;
      }
    });
  }
}
function isConditionalTopLevelFieldActive(params) {
  if (!params.surface.channelEnabled) return false;
  if (!params.surface.hasExplicitAccounts) return params.activeWithoutAccounts;
  return params.surface.accounts.some(params.inheritedAccountActive);
}
function collectConditionalChannelFieldAssignments(params) {
  (0, _runtimeSharedWlb0YE2R.n)({
    value: params.channel[params.field],
    path: `channels.${params.channelKey}.${params.field}`,
    expected: "string",
    defaults: params.defaults,
    context: params.context,
    active: isConditionalTopLevelFieldActive({
      surface: params.surface,
      activeWithoutAccounts: params.topLevelActiveWithoutAccounts,
      inheritedAccountActive: params.topLevelInheritedAccountActive
    }),
    inactiveReason: params.topInactiveReason,
    apply: (value) => {
      params.channel[params.field] = value;
    }
  });
  if (!params.surface.hasExplicitAccounts) return;
  for (const entry of params.surface.accounts) {
    if (!(0, _runtimeSharedWlb0YE2R.i)(entry.account, params.field)) continue;
    (0, _runtimeSharedWlb0YE2R.n)({
      value: entry.account[params.field],
      path: `channels.${params.channelKey}.accounts.${entry.accountId}.${params.field}`,
      expected: "string",
      defaults: params.defaults,
      context: params.context,
      active: params.accountActive(entry),
      inactiveReason: typeof params.accountInactiveReason === "function" ? params.accountInactiveReason(entry) : params.accountInactiveReason,
      apply: (value) => {
        entry.account[params.field] = value;
      }
    });
  }
}
function collectNestedChannelFieldAssignments(params) {
  const topLevelNested = params.channel[params.nestedKey];
  if ((0, _utilsD5DtWkEu.l)(topLevelNested)) (0, _runtimeSharedWlb0YE2R.n)({
    value: topLevelNested[params.field],
    path: `channels.${params.channelKey}.${params.nestedKey}.${params.field}`,
    expected: "string",
    defaults: params.defaults,
    context: params.context,
    active: params.topLevelActive,
    inactiveReason: params.topInactiveReason,
    apply: (value) => {
      topLevelNested[params.field] = value;
    }
  });
  if (!params.surface.hasExplicitAccounts) return;
  for (const entry of params.surface.accounts) {
    const nested = entry.account[params.nestedKey];
    if (!(0, _utilsD5DtWkEu.l)(nested)) continue;
    (0, _runtimeSharedWlb0YE2R.n)({
      value: nested[params.field],
      path: `channels.${params.channelKey}.accounts.${entry.accountId}.${params.nestedKey}.${params.field}`,
      expected: "string",
      defaults: params.defaults,
      context: params.context,
      active: params.accountActive(entry),
      inactiveReason: typeof params.accountInactiveReason === "function" ? params.accountInactiveReason(entry) : params.accountInactiveReason,
      apply: (value) => {
        nested[params.field] = value;
      }
    });
  }
}
//#endregion /* v9-344e2911ddea77d9 */
