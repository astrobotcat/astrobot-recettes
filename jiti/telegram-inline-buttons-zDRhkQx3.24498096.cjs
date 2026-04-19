"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveTelegramInlineButtonsScopeFromCapabilities;exports.n = resolveTelegramInlineButtonsConfigScope;exports.r = resolveTelegramInlineButtonsScope;exports.t = isTelegramInlineButtonsEnabled;var _accountsCoskdHdZ = require("./accounts-CoskdHdZ.js");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
//#region extensions/telegram/src/inline-buttons.ts
const DEFAULT_INLINE_BUTTONS_SCOPE = "allowlist";
function normalizeInlineButtonsScope(value) {
  const trimmed = (0, _textRuntime.normalizeOptionalLowercaseString)(value);
  if (!trimmed) return;
  if (trimmed === "off" || trimmed === "dm" || trimmed === "group" || trimmed === "all" || trimmed === "allowlist") return trimmed;
}
function readInlineButtonsCapability(value) {
  if (!value || Array.isArray(value) || typeof value !== "object" || !("inlineButtons" in value)) return;
  return value.inlineButtons;
}
function resolveTelegramInlineButtonsConfigScope(capabilities) {
  return normalizeInlineButtonsScope(readInlineButtonsCapability(capabilities));
}
function resolveTelegramInlineButtonsScopeFromCapabilities(capabilities) {
  if (!capabilities) return DEFAULT_INLINE_BUTTONS_SCOPE;
  if (Array.isArray(capabilities)) return capabilities.some((entry) => (0, _textRuntime.normalizeLowercaseStringOrEmpty)(String(entry)) === "inlinebuttons") ? "all" : "off";
  if (typeof capabilities === "object") return resolveTelegramInlineButtonsConfigScope(capabilities) ?? DEFAULT_INLINE_BUTTONS_SCOPE;
  return DEFAULT_INLINE_BUTTONS_SCOPE;
}
function resolveTelegramInlineButtonsScope(params) {
  return resolveTelegramInlineButtonsScopeFromCapabilities((0, _accountsCoskdHdZ.s)({
    cfg: params.cfg,
    accountId: params.accountId
  }).config.capabilities);
}
function isTelegramInlineButtonsEnabled(params) {
  if (params.accountId) return resolveTelegramInlineButtonsScope(params) !== "off";
  const accountIds = (0, _accountsCoskdHdZ.r)(params.cfg);
  if (accountIds.length === 0) return resolveTelegramInlineButtonsScope(params) !== "off";
  return accountIds.some((accountId) => resolveTelegramInlineButtonsScope({
    cfg: params.cfg,
    accountId
  }) !== "off");
}
//#endregion /* v9-5dbd447d7708f1d1 */
