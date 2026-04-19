"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveSingleAccountPromotionTarget;exports.t = resolveSingleAccountKeysToMove;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _bundledCGMeVzvo = require("./bundled-CGMeVzvo.js");
var _accountIdJ7GeQlaZ = require("./account-id-j7GeQlaZ.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
//#region src/channels/plugins/setup-promotion-helpers.ts
const COMMON_SINGLE_ACCOUNT_KEYS_TO_MOVE = new Set([
"name",
"token",
"tokenFile",
"botToken",
"appToken",
"account",
"signalNumber",
"authDir",
"cliPath",
"dbPath",
"httpUrl",
"httpHost",
"httpPort",
"webhookPath",
"webhookUrl",
"webhookSecret",
"service",
"region",
"homeserver",
"userId",
"accessToken",
"password",
"deviceName",
"url",
"code",
"dmPolicy",
"allowFrom",
"groupPolicy",
"groupAllowFrom",
"defaultTo"]
);
const BUNDLED_SINGLE_ACCOUNT_PROMOTION_FALLBACKS = { telegram: ["streaming"] };
const BUNDLED_NAMED_ACCOUNT_PROMOTION_FALLBACKS = { telegram: ["botToken", "tokenFile"] };
function getChannelSetupPromotionSurface(channelKey) {
  const setup = (0, _registryDelpa74L.t)(channelKey)?.setup ?? (0, _bundledCGMeVzvo.n)(channelKey)?.setup;
  if (!setup || typeof setup !== "object") return null;
  return setup;
}
function shouldMoveSingleAccountChannelKey(params) {
  if (COMMON_SINGLE_ACCOUNT_KEYS_TO_MOVE.has(params.key)) return true;
  if (getChannelSetupPromotionSurface(params.channelKey)?.singleAccountKeysToMove?.includes(params.key)) return true;
  if (BUNDLED_SINGLE_ACCOUNT_PROMOTION_FALLBACKS[params.channelKey]?.includes(params.key)) return true;
  return false;
}
function resolveSingleAccountKeysToMove(params) {
  const hasNamedAccounts = Object.keys(params.channel.accounts ?? {}).filter(Boolean).length > 0;
  const namedAccountPromotionKeys = getChannelSetupPromotionSurface(params.channelKey)?.namedAccountPromotionKeys ?? BUNDLED_NAMED_ACCOUNT_PROMOTION_FALLBACKS[params.channelKey];
  return Object.entries(params.channel).filter(([key, value]) => {
    if (key === "accounts" || key === "enabled" || value === void 0) return false;
    if (!shouldMoveSingleAccountChannelKey({
      channelKey: params.channelKey,
      key
    })) return false;
    if (hasNamedAccounts && namedAccountPromotionKeys && !namedAccountPromotionKeys.includes(key)) return false;
    return true;
  }).map(([key]) => key);
}
function resolveSingleAccountPromotionTarget(params) {
  const accounts = params.channel.accounts ?? {};
  const resolveExistingAccountId = (targetAccountId) => {
    const normalizedTargetAccountId = (0, _accountIdJ7GeQlaZ.n)(targetAccountId);
    return Object.keys(accounts).find((accountId) => (0, _accountIdJ7GeQlaZ.n)(accountId) === normalizedTargetAccountId) ?? normalizedTargetAccountId;
  };
  const resolved = getChannelSetupPromotionSurface(params.channelKey)?.resolveSingleAccountPromotionTarget?.({ channel: params.channel });
  const normalizedResolved = (0, _stringCoerceBUSzWgUA.s)(resolved);
  if (normalizedResolved) return resolveExistingAccountId(normalizedResolved);
  return resolveExistingAccountId(_accountIdJ7GeQlaZ.t);
}
//#endregion /* v9-6d0294143493ec67 */
