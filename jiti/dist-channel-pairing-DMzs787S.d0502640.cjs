"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = createTextPairingAdapter;exports.i = createPairingPrefixStripper;exports.n = createChannelPairingController;exports.r = createLoggedPairingApprovalNotifier;exports.t = createChannelPairingChallengeIssuer;var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
require("./pairing-store-C_d7unmE.js");
var _pairingChallengeHQkUTeaB = require("./pairing-challenge-HQkUTeaB.js");
//#region src/channels/plugins/pairing-adapters.ts
function createPairingPrefixStripper(prefixRe, map = (entry) => entry) {
  return (entry) => map(entry.trim().replace(prefixRe, "").trim());
}
function createLoggedPairingApprovalNotifier(format, log = console.log) {
  return async (params) => {
    log(typeof format === "function" ? format(params) : format);
  };
}
function createTextPairingAdapter(params) {
  return {
    idLabel: params.idLabel,
    normalizeAllowEntry: params.normalizeAllowEntry,
    notifyApproval: async (ctx) => {
      await params.notify({
        ...ctx,
        message: params.message
      });
    }
  };
}
//#endregion
//#region src/plugin-sdk/pairing-access.ts
/** Scope pairing store operations to one channel/account pair for plugin-facing helpers. */
function createScopedPairingAccess(params) {
  const resolvedAccountId = (0, _accountIdJ7GeQlaZ.n)(params.accountId);
  return {
    accountId: resolvedAccountId,
    readAllowFromStore: () => params.core.channel.pairing.readAllowFromStore({
      channel: params.channel,
      accountId: resolvedAccountId
    }),
    readStoreForDmPolicy: (provider, accountId) => params.core.channel.pairing.readAllowFromStore({
      channel: provider,
      accountId: (0, _accountIdJ7GeQlaZ.n)(accountId)
    }),
    upsertPairingRequest: (input) => params.core.channel.pairing.upsertPairingRequest({
      channel: params.channel,
      accountId: resolvedAccountId,
      ...input
    })
  };
}
//#endregion
//#region src/plugin-sdk/channel-pairing.ts
/** Pre-bind the channel id and storage sink for pairing challenges. */
function createChannelPairingChallengeIssuer(params) {
  return (challenge) => (0, _pairingChallengeHQkUTeaB.t)({
    channel: params.channel,
    upsertPairingRequest: params.upsertPairingRequest,
    ...challenge
  });
}
/** Build the full scoped pairing controller used by channel runtime code. */
function createChannelPairingController(params) {
  const access = createScopedPairingAccess(params);
  return {
    ...access,
    issueChallenge: createChannelPairingChallengeIssuer({
      channel: params.channel,
      upsertPairingRequest: access.upsertPairingRequest
    })
  };
}
//#endregion /* v9-7334b6dd80c8c11d */
