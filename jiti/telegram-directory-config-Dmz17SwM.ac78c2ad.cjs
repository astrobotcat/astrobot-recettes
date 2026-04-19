"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = exports.n = void 0;var _accountInspectC9xPCRmJ = require("./account-inspect-C9xPCRmJ.js");
var _directoryRuntime = require("openclaw/plugin-sdk/directory-runtime");
var _channelConfigHelpers = require("openclaw/plugin-sdk/channel-config-helpers");
//#region extensions/telegram/src/directory-config.ts
const listTelegramDirectoryPeersFromConfig = exports.n = (0, _directoryRuntime.createInspectedDirectoryEntriesLister)({
  kind: "user",
  inspectAccount: (cfg, accountId) => (0, _accountInspectC9xPCRmJ.t)({
    cfg,
    accountId
  }),
  resolveSources: (account) => [(0, _channelConfigHelpers.mapAllowFromEntries)(account.config.allowFrom), Object.keys(account.config.dms ?? {})],
  normalizeId: (entry) => {
    const trimmed = entry.replace(/^(telegram|tg):/i, "").trim();
    if (!trimmed) return null;
    if (/^-?\d+$/.test(trimmed)) return trimmed;
    return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
  }
});
const listTelegramDirectoryGroupsFromConfig = exports.t = (0, _directoryRuntime.createInspectedDirectoryEntriesLister)({
  kind: "group",
  inspectAccount: (cfg, accountId) => (0, _accountInspectC9xPCRmJ.t)({
    cfg,
    accountId
  }),
  resolveSources: (account) => [Object.keys(account.config.groups ?? {})],
  normalizeId: (entry) => entry.trim() || null
});
//#endregion /* v9-d176c5ca234e3d5b */
