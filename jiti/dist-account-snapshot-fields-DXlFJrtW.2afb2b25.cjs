"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveConfiguredFromCredentialStatuses;exports.i = projectSafeChannelAccountSnapshotFields;exports.n = hasResolvedCredentialValue;exports.o = resolveConfiguredFromRequiredCredentialStatuses;exports.r = projectCredentialSnapshotFields;exports.t = hasConfiguredUnavailableCredentialStatus;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
//#region src/shared/net/url-userinfo.ts
function stripUrlUserInfo(value) {
  try {
    const parsed = new URL(value);
    if (!parsed.username && !parsed.password) return value;
    parsed.username = "";
    parsed.password = "";
    return parsed.toString();
  } catch {
    return value;
  }
}
//#endregion
//#region src/channels/account-snapshot-fields.ts
const CREDENTIAL_STATUS_KEYS = [
"tokenStatus",
"botTokenStatus",
"appTokenStatus",
"signingSecretStatus",
"userTokenStatus"];

function readBoolean(record, key) {
  return typeof record[key] === "boolean" ? record[key] : void 0;
}
function readNumber(record, key) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function readStringArray(record, key) {
  const value = record[key];
  if (!Array.isArray(value)) return;
  const normalized = value.map((entry) => typeof entry === "string" || typeof entry === "number" ? String(entry) : "").map((entry) => entry.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : void 0;
}
function readCredentialStatus(record, key) {
  const value = record[key];
  return value === "available" || value === "configured_unavailable" || value === "missing" ? value : void 0;
}
function resolveConfiguredFromCredentialStatuses(account) {
  const record = (0, _utilsD5DtWkEu.l)(account) ? account : null;
  if (!record) return;
  let sawCredentialStatus = false;
  for (const key of CREDENTIAL_STATUS_KEYS) {
    const status = readCredentialStatus(record, key);
    if (!status) continue;
    sawCredentialStatus = true;
    if (status !== "missing") return true;
  }
  return sawCredentialStatus ? false : void 0;
}
function resolveConfiguredFromRequiredCredentialStatuses(account, requiredKeys) {
  const record = (0, _utilsD5DtWkEu.l)(account) ? account : null;
  if (!record) return;
  let sawCredentialStatus = false;
  for (const key of requiredKeys) {
    const status = readCredentialStatus(record, key);
    if (!status) continue;
    sawCredentialStatus = true;
    if (status === "missing") return false;
  }
  return sawCredentialStatus ? true : void 0;
}
function hasConfiguredUnavailableCredentialStatus(account) {
  const record = (0, _utilsD5DtWkEu.l)(account) ? account : null;
  if (!record) return false;
  return CREDENTIAL_STATUS_KEYS.some((key) => readCredentialStatus(record, key) === "configured_unavailable");
}
function hasResolvedCredentialValue(account) {
  const record = (0, _utilsD5DtWkEu.l)(account) ? account : null;
  if (!record) return false;
  return [
  "token",
  "botToken",
  "appToken",
  "signingSecret",
  "userToken"].
  some((key) => {
    return (0, _stringCoerceBUSzWgUA.s)(record[key]) !== void 0;
  }) || CREDENTIAL_STATUS_KEYS.some((key) => readCredentialStatus(record, key) === "available");
}
function projectCredentialSnapshotFields(account) {
  const record = (0, _utilsD5DtWkEu.l)(account) ? account : null;
  if (!record) return {};
  const tokenSource = (0, _stringCoerceBUSzWgUA.s)(record.tokenSource);
  const botTokenSource = (0, _stringCoerceBUSzWgUA.s)(record.botTokenSource);
  const appTokenSource = (0, _stringCoerceBUSzWgUA.s)(record.appTokenSource);
  const signingSecretSource = (0, _stringCoerceBUSzWgUA.s)(record.signingSecretSource);
  return {
    ...(tokenSource ? { tokenSource } : {}),
    ...(botTokenSource ? { botTokenSource } : {}),
    ...(appTokenSource ? { appTokenSource } : {}),
    ...(signingSecretSource ? { signingSecretSource } : {}),
    ...(readCredentialStatus(record, "tokenStatus") ? { tokenStatus: readCredentialStatus(record, "tokenStatus") } : {}),
    ...(readCredentialStatus(record, "botTokenStatus") ? { botTokenStatus: readCredentialStatus(record, "botTokenStatus") } : {}),
    ...(readCredentialStatus(record, "appTokenStatus") ? { appTokenStatus: readCredentialStatus(record, "appTokenStatus") } : {}),
    ...(readCredentialStatus(record, "signingSecretStatus") ? { signingSecretStatus: readCredentialStatus(record, "signingSecretStatus") } : {}),
    ...(readCredentialStatus(record, "userTokenStatus") ? { userTokenStatus: readCredentialStatus(record, "userTokenStatus") } : {})
  };
}
function projectSafeChannelAccountSnapshotFields(account) {
  const record = (0, _utilsD5DtWkEu.l)(account) ? account : null;
  if (!record) return {};
  const name = (0, _stringCoerceBUSzWgUA.s)(record.name);
  const healthState = (0, _stringCoerceBUSzWgUA.s)(record.healthState);
  const mode = (0, _stringCoerceBUSzWgUA.s)(record.mode);
  const dmPolicy = (0, _stringCoerceBUSzWgUA.s)(record.dmPolicy);
  const baseUrl = (0, _stringCoerceBUSzWgUA.s)(record.baseUrl);
  const cliPath = (0, _stringCoerceBUSzWgUA.s)(record.cliPath);
  const dbPath = (0, _stringCoerceBUSzWgUA.s)(record.dbPath);
  return {
    ...(name ? { name } : {}),
    ...(readBoolean(record, "linked") !== void 0 ? { linked: readBoolean(record, "linked") } : {}),
    ...(readBoolean(record, "running") !== void 0 ? { running: readBoolean(record, "running") } : {}),
    ...(readBoolean(record, "connected") !== void 0 ? { connected: readBoolean(record, "connected") } : {}),
    ...(readNumber(record, "reconnectAttempts") !== void 0 ? { reconnectAttempts: readNumber(record, "reconnectAttempts") } : {}),
    ...(readNumber(record, "lastInboundAt") !== void 0 ? { lastInboundAt: readNumber(record, "lastInboundAt") } : {}),
    ...(healthState ? { healthState } : {}),
    ...(mode ? { mode } : {}),
    ...(dmPolicy ? { dmPolicy } : {}),
    ...(readStringArray(record, "allowFrom") ? { allowFrom: readStringArray(record, "allowFrom") } : {}),
    ...projectCredentialSnapshotFields(account),
    ...(baseUrl ? { baseUrl: stripUrlUserInfo(baseUrl) } : {}),
    ...(readBoolean(record, "allowUnmentionedGroups") !== void 0 ? { allowUnmentionedGroups: readBoolean(record, "allowUnmentionedGroups") } : {}),
    ...(cliPath ? { cliPath } : {}),
    ...(dbPath ? { dbPath } : {}),
    ...(readNumber(record, "port") !== void 0 ? { port: readNumber(record, "port") } : {})
  };
}
//#endregion /* v9-1c8ef684f5f40d04 */
