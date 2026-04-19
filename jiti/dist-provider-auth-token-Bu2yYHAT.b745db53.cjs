"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = validateAnthropicSetupToken;exports.t = buildTokenProfileId;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
//#region src/plugins/provider-auth-token.ts
const ANTHROPIC_SETUP_TOKEN_PREFIX = "sk-ant-oat01-";
const DEFAULT_TOKEN_PROFILE_NAME = "default";
function normalizeTokenProfileName(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_TOKEN_PROFILE_NAME;
  return (0, _stringCoerceBUSzWgUA.i)(trimmed).replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "") || "default";
}
function buildTokenProfileId(params) {
  return `${(0, _providerIdKaStHhRz.r)(params.provider)}:${normalizeTokenProfileName(params.name)}`;
}
function validateAnthropicSetupToken(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "Required";
  if (!trimmed.startsWith("sk-ant-oat01-")) return `Expected token starting with ${ANTHROPIC_SETUP_TOKEN_PREFIX}`;
  if (trimmed.length < 80) return "Token looks too short; paste the full setup-token";
}
//#endregion /* v9-63d055b60f6b1930 */
