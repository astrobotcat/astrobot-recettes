"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.hasAnyWhatsAppAuth = hasAnyWhatsAppAuth;var _credsFilesBD3Rjqo = require("./creds-files-BD3Rjqo2.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _statePaths = require("openclaw/plugin-sdk/state-paths");
var _accountResolution = require("openclaw/plugin-sdk/account-resolution");
var _accountId = require("openclaw/plugin-sdk/account-id");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region extensions/whatsapp/auth-presence.ts
function addAccountAuthDirs(authDirs, accountId, authDir, accountsRoot, env) {
  authDirs.add(_nodePath.default.join(accountsRoot, (0, _accountId.normalizeAccountId)(accountId)));
  const configuredAuthDir = authDir?.trim();
  if (configuredAuthDir) authDirs.add((0, _accountResolution.resolveUserPath)(configuredAuthDir, env));
}
function listWhatsAppAuthDirs(cfg, env = process.env) {
  const oauthDir = (0, _statePaths.resolveOAuthDir)(env);
  const accountsRoot = _nodePath.default.join(oauthDir, "whatsapp");
  const channel = cfg.channels?.whatsapp;
  const authDirs = new Set([oauthDir, _nodePath.default.join(accountsRoot, _accountId.DEFAULT_ACCOUNT_ID)]);
  addAccountAuthDirs(authDirs, _accountId.DEFAULT_ACCOUNT_ID, void 0, accountsRoot, env);
  if (channel?.defaultAccount?.trim()) addAccountAuthDirs(authDirs, channel.defaultAccount, channel.accounts?.[channel.defaultAccount]?.authDir, accountsRoot, env);
  const accounts = channel?.accounts;
  if (accounts) for (const [accountId, account] of Object.entries(accounts)) addAccountAuthDirs(authDirs, accountId, account?.authDir, accountsRoot, env);
  try {
    const entries = _nodeFs.default.readdirSync(accountsRoot, { withFileTypes: true });
    for (const entry of entries) if (entry.isDirectory()) authDirs.add(_nodePath.default.join(accountsRoot, entry.name));
  } catch {}
  return [...authDirs];
}
function hasAnyWhatsAppAuth(params, env = process.env) {
  return listWhatsAppAuthDirs(params && typeof params === "object" && "cfg" in params ? params.cfg : params, params && typeof params === "object" && "cfg" in params ? params.env ?? env : env).some((authDir) => (0, _credsFilesBD3Rjqo.t)(authDir));
}
//#endregion /* v9-d6323e0f1c103d4a */
