"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = listPotentialConfiguredChannelIds;exports.t = hasPotentialConfiguredChannels;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _bootstrapRegistryBI6Zdzz = require("./bootstrap-registry-BI6Zdzz5.js");
var _persistedAuthStateBkBSoJRA = require("./persisted-auth-state-BkBSoJRA.js");
var _channelTargetDu58lo8P = require("./channel-target-Du58lo8P.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodeOs = _interopRequireDefault(require("node:os"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/channels/config-presence.ts
const IGNORED_CHANNEL_CONFIG_KEYS = new Set(["defaults", "modelByChannel"]);
function hasMeaningfulChannelConfig(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return false;
  return Object.keys(value).some((key) => key !== "enabled");
}
function listChannelEnvPrefixes(channelIds) {
  return channelIds.map((channelId) => [`${channelId.replace(/[^a-z0-9]+/gi, "_").toUpperCase()}_`, channelId]);
}
function hasPersistedChannelState(env) {
  return _nodeFs.default.existsSync((0, _pathsDvv9VRAc._)(env, _nodeOs.default.homedir));
}
let persistedAuthStateChannelIds = null;
function listPersistedAuthStateChannelIds(options) {
  const override = options.persistedAuthStateProbe?.listChannelIds();
  if (override) return override;
  if (persistedAuthStateChannelIds) return persistedAuthStateChannelIds;
  persistedAuthStateChannelIds = (0, _persistedAuthStateBkBSoJRA.n)();
  return persistedAuthStateChannelIds;
}
function hasPersistedAuthState(params) {
  const override = params.options.persistedAuthStateProbe;
  if (override) return override.hasState(params);
  return (0, _persistedAuthStateBkBSoJRA.t)(params);
}
function listPotentialConfiguredChannelIds(cfg, env = process.env, options = {}) {
  const configuredChannelIds = /* @__PURE__ */new Set();
  const channelEnvPrefixes = listChannelEnvPrefixes((0, _bootstrapRegistryBI6Zdzz.i)());
  const channels = (0, _utilsD5DtWkEu.l)(cfg.channels) ? cfg.channels : null;
  if (channels) for (const [key, value] of Object.entries(channels)) {
    if (IGNORED_CHANNEL_CONFIG_KEYS.has(key)) continue;
    if (hasMeaningfulChannelConfig(value)) configuredChannelIds.add(key);
  }
  for (const [key, value] of Object.entries(env)) {
    if (!(0, _channelTargetDu58lo8P.i)(value)) continue;
    for (const [prefix, channelId] of channelEnvPrefixes) if (key.startsWith(prefix)) configuredChannelIds.add(channelId);
  }
  if (options.includePersistedAuthState !== false && hasPersistedChannelState(env)) {
    for (const channelId of listPersistedAuthStateChannelIds(options)) if (hasPersistedAuthState({
      channelId,
      cfg,
      env,
      options
    })) configuredChannelIds.add(channelId);
  }
  return [...configuredChannelIds];
}
function hasEnvConfiguredChannel(cfg, env, options = {}) {
  const channelEnvPrefixes = listChannelEnvPrefixes((0, _bootstrapRegistryBI6Zdzz.i)());
  for (const [key, value] of Object.entries(env)) {
    if (!(0, _channelTargetDu58lo8P.i)(value)) continue;
    if (channelEnvPrefixes.some(([prefix]) => key.startsWith(prefix))) return true;
  }
  if (options.includePersistedAuthState === false || !hasPersistedChannelState(env)) return false;
  return listPersistedAuthStateChannelIds(options).some((channelId) => hasPersistedAuthState({
    channelId,
    cfg,
    env,
    options
  }));
}
function hasPotentialConfiguredChannels(cfg, env = process.env, options = {}) {
  const channels = (0, _utilsD5DtWkEu.l)(cfg?.channels) ? cfg.channels : null;
  if (channels) for (const [key, value] of Object.entries(channels)) {
    if (IGNORED_CHANNEL_CONFIG_KEYS.has(key)) continue;
    if (hasMeaningfulChannelConfig(value)) return true;
  }
  return hasEnvConfiguredChannel(cfg ?? {}, env, options);
}
//#endregion /* v9-c1abc8e79afa641e */
