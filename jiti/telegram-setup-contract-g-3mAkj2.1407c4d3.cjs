"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = normalizeCompatibilityConfig;exports.t = exports.r = exports.n = void 0;var _previewStreamingDHVltX4_ = require("./preview-streaming-DHVltX4_.js");
var _runtimeDoctor = require("openclaw/plugin-sdk/runtime-doctor");
//#region extensions/telegram/src/doctor-contract.ts
function hasLegacyTelegramStreamingAliases(value) {
  return (0, _runtimeDoctor.hasLegacyStreamingAliases)(value, { includePreviewChunk: true });
}
function resolveCompatibleDefaultGroupEntry(section) {
  const existingGroups = section.groups;
  if (existingGroups !== void 0 && !(0, _runtimeDoctor.asObjectRecord)(existingGroups)) return null;
  const groups = (0, _runtimeDoctor.asObjectRecord)(existingGroups) ?? {};
  const existingEntry = groups["*"];
  if (existingEntry !== void 0 && !(0, _runtimeDoctor.asObjectRecord)(existingEntry)) return null;
  return {
    groups,
    entry: (0, _runtimeDoctor.asObjectRecord)(existingEntry) ?? {}
  };
}
const legacyConfigRules = exports.r = [
{
  path: [
  "channels",
  "telegram",
  "groupMentionsOnly"],

  message: "channels.telegram.groupMentionsOnly was removed; use channels.telegram.groups.\"*\".requireMention instead. Run \"openclaw doctor --fix\"."
},
{
  path: ["channels", "telegram"],
  message: "channels.telegram.streamMode, channels.telegram.streaming (scalar), chunkMode, blockStreaming, draftChunk, and blockStreamingCoalesce are legacy; use channels.telegram.streaming.{mode,chunkMode,preview.chunk,block.enabled,block.coalesce}.",
  match: hasLegacyTelegramStreamingAliases
},
{
  path: [
  "channels",
  "telegram",
  "accounts"],

  message: "channels.telegram.accounts.<id>.streamMode, streaming (scalar), chunkMode, blockStreaming, draftChunk, and blockStreamingCoalesce are legacy; use channels.telegram.accounts.<id>.streaming.{mode,chunkMode,preview.chunk,block.enabled,block.coalesce}.",
  match: (value) => (0, _runtimeDoctor.hasLegacyAccountStreamingAliases)(value, hasLegacyTelegramStreamingAliases)
}];

function normalizeCompatibilityConfig({ cfg }) {
  const rawEntry = (0, _runtimeDoctor.asObjectRecord)(cfg.channels?.telegram);
  if (!rawEntry) return {
    config: cfg,
    changes: []
  };
  const changes = [];
  let updated = rawEntry;
  let changed = false;
  if (updated.groupMentionsOnly !== void 0) {
    const defaultGroupEntry = resolveCompatibleDefaultGroupEntry(updated);
    if (!defaultGroupEntry) changes.push("Skipped channels.telegram.groupMentionsOnly migration because channels.telegram.groups already has an incompatible shape; fix remaining issues manually.");else
    {
      const { groups, entry } = defaultGroupEntry;
      if (entry.requireMention === void 0) {
        entry.requireMention = updated.groupMentionsOnly;
        groups["*"] = entry;
        updated = {
          ...updated,
          groups
        };
        changes.push("Moved channels.telegram.groupMentionsOnly → channels.telegram.groups.\"*\".requireMention.");
      } else changes.push("Removed channels.telegram.groupMentionsOnly (channels.telegram.groups.\"*\" already set).");
      const { groupMentionsOnly: _ignored, ...rest } = updated;
      updated = rest;
      changed = true;
    }
  }
  const streaming = (0, _runtimeDoctor.normalizeLegacyStreamingAliases)({
    entry: updated,
    pathPrefix: "channels.telegram",
    changes,
    includePreviewChunk: true,
    resolvedMode: (0, _previewStreamingDHVltX4_.t)(updated)
  });
  updated = streaming.entry;
  changed = changed || streaming.changed;
  const rawAccounts = (0, _runtimeDoctor.asObjectRecord)(updated.accounts);
  if (rawAccounts) {
    let accountsChanged = false;
    const accounts = { ...rawAccounts };
    for (const [accountId, rawAccount] of Object.entries(rawAccounts)) {
      const account = (0, _runtimeDoctor.asObjectRecord)(rawAccount);
      if (!account) continue;
      const accountStreaming = (0, _runtimeDoctor.normalizeLegacyStreamingAliases)({
        entry: account,
        pathPrefix: `channels.telegram.accounts.${accountId}`,
        changes,
        includePreviewChunk: true,
        resolvedMode: (0, _previewStreamingDHVltX4_.t)(account)
      });
      if (accountStreaming.changed) {
        accounts[accountId] = accountStreaming.entry;
        accountsChanged = true;
      }
    }
    if (accountsChanged) {
      updated = {
        ...updated,
        accounts
      };
      changed = true;
    }
  }
  if (!changed && changes.length === 0) return {
    config: cfg,
    changes: []
  };
  return {
    config: {
      ...cfg,
      channels: {
        ...cfg.channels,
        telegram: updated
      }
    },
    changes
  };
}
//#endregion
//#region extensions/telegram/src/setup-contract.ts
const singleAccountKeysToMove = exports.n = ["streaming"];
const namedAccountPromotionKeys = exports.t = ["botToken", "tokenFile"];
//#endregion /* v9-dfe72c48978f422c */
