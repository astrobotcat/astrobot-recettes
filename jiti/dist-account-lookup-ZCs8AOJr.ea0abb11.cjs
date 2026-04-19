"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveNormalizedAccountEntry;exports.t = resolveAccountEntry;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/routing/account-lookup.ts
function resolveAccountEntry(accounts, accountId) {
  if (!accounts || typeof accounts !== "object") return;
  if (Object.hasOwn(accounts, accountId)) return accounts[accountId];
  const normalized = (0, _stringCoerceBUSzWgUA.i)(accountId);
  const matchKey = Object.keys(accounts).find((key) => (0, _stringCoerceBUSzWgUA.i)(key) === normalized);
  return matchKey ? accounts[matchKey] : void 0;
}
function resolveNormalizedAccountEntry(accounts, accountId, normalizeAccountId) {
  if (!accounts || typeof accounts !== "object") return;
  if (Object.hasOwn(accounts, accountId)) return accounts[accountId];
  const normalized = normalizeAccountId(accountId);
  const matchKey = Object.keys(accounts).find((key) => normalizeAccountId(key) === normalized);
  return matchKey ? accounts[matchKey] : void 0;
}
//#endregion /* v9-42439ad16db7727c */
