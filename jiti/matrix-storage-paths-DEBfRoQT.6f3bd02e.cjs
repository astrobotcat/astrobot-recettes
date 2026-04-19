"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveMatrixCredentialsPath;exports.c = resolveMatrixLegacyFlatStoreRoot;exports.i = resolveMatrixCredentialsFilename;exports.l = sanitizeMatrixPathSegment;exports.n = resolveMatrixAccountStorageRoot;exports.o = resolveMatrixHomeserverKey;exports.r = resolveMatrixCredentialsDir;exports.s = resolveMatrixLegacyFlatStoragePaths;exports.t = hashMatrixAccessToken;var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
var _accountId = require("openclaw/plugin-sdk/account-id");
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region extensions/matrix/src/storage-paths.ts
function sanitizeMatrixPathSegment(value) {
  return (0, _textRuntime.normalizeLowercaseStringOrEmpty)(value).replace(/[^a-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "unknown";
}
function resolveMatrixHomeserverKey(homeserver) {
  try {
    const url = new URL(homeserver);
    if (url.host) return sanitizeMatrixPathSegment(url.host);
  } catch {}
  return sanitizeMatrixPathSegment(homeserver);
}
function hashMatrixAccessToken(accessToken) {
  return _nodeCrypto.default.createHash("sha256").update(accessToken).digest("hex").slice(0, 16);
}
function resolveMatrixCredentialsFilename(accountId) {
  const normalized = (0, _accountId.normalizeAccountId)(accountId);
  return normalized === _accountId.DEFAULT_ACCOUNT_ID ? "credentials.json" : `credentials-${normalized}.json`;
}
function resolveMatrixCredentialsDir(stateDir) {
  return _nodePath.default.join(stateDir, "credentials", "matrix");
}
function resolveMatrixCredentialsPath(params) {
  return _nodePath.default.join(resolveMatrixCredentialsDir(params.stateDir), resolveMatrixCredentialsFilename(params.accountId));
}
function resolveMatrixLegacyFlatStoreRoot(stateDir) {
  return _nodePath.default.join(stateDir, "matrix");
}
function resolveMatrixLegacyFlatStoragePaths(stateDir) {
  const rootDir = resolveMatrixLegacyFlatStoreRoot(stateDir);
  return {
    rootDir,
    storagePath: _nodePath.default.join(rootDir, "bot-storage.json"),
    cryptoPath: _nodePath.default.join(rootDir, "crypto")
  };
}
function resolveMatrixAccountStorageRoot(params) {
  const accountKey = sanitizeMatrixPathSegment(params.accountId ?? _accountId.DEFAULT_ACCOUNT_ID);
  const userKey = sanitizeMatrixPathSegment(params.userId);
  const serverKey = resolveMatrixHomeserverKey(params.homeserver);
  const tokenHash = hashMatrixAccessToken(params.accessToken);
  return {
    rootDir: _nodePath.default.join(params.stateDir, "matrix", "accounts", accountKey, `${serverKey}__${userKey}`, tokenHash),
    accountKey,
    tokenHash
  };
}
//#endregion /* v9-50e11e81d6f76a96 */
