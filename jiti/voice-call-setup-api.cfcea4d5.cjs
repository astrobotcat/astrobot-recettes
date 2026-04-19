"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _utilsD5DtWkEu = require("../../utils-D5DtWkEu.js");
require("../../text-runtime-DTMxvodz.js");
var _pluginEntryBkat4og = require("../../plugin-entry-Bkat4og3.js");
var _configCompatJRRoF70f = require("../../config-compat-jRRoF70f.js");
//#region extensions/voice-call/setup-api.ts
function migrateVoiceCallPluginConfig(config) {
  const rawVoiceCallConfig = config.plugins?.entries?.["voice-call"]?.config;
  if (!(0, _utilsD5DtWkEu.l)(rawVoiceCallConfig)) return null;
  const migration = (0, _configCompatJRRoF70f.n)({
    value: rawVoiceCallConfig,
    configPathPrefix: "plugins.entries.voice-call.config"
  });
  if (migration.changes.length === 0) return null;
  const plugins = structuredClone(config.plugins ?? {});
  const entries = { ...plugins.entries };
  entries["voice-call"] = {
    ...((0, _utilsD5DtWkEu.l)(entries["voice-call"]) ? entries["voice-call"] : {}),
    config: migration.config
  };
  plugins.entries = entries;
  return {
    config: {
      ...config,
      plugins
    },
    changes: migration.changes
  };
}
var setup_api_default = exports.default = (0, _pluginEntryBkat4og.t)({
  id: "voice-call",
  name: "Voice Call Setup",
  description: "Lightweight Voice Call setup hooks",
  register(api) {
    api.registerConfigMigration((config) => migrateVoiceCallPluginConfig(config));
  }
});
//#endregion /* v9-51ddde7b86e14eda */
