"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = shouldAttemptTtsPayload;exports.t = resolveConfiguredTtsMode;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _ttsAutoModeZhfpRKB = require("./tts-auto-mode-ZhfpRKB9.js");
var _nodeFs = require("node:fs");
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/tts/tts-config.ts
function resolveConfiguredTtsMode(cfg) {
  return cfg.messages?.tts?.mode ?? "final";
}
function resolveTtsPrefsPathValue(prefsPath) {
  if (prefsPath?.trim()) return (0, _utilsD5DtWkEu.m)(prefsPath.trim());
  const envPath = process.env.OPENCLAW_TTS_PREFS?.trim();
  if (envPath) return (0, _utilsD5DtWkEu.m)(envPath);
  return _nodePath.default.join((0, _utilsD5DtWkEu.f)(process.env), "settings", "tts.json");
}
function readTtsPrefsAutoMode(prefsPath) {
  try {
    if (!(0, _nodeFs.existsSync)(prefsPath)) return;
    const prefs = JSON.parse((0, _nodeFs.readFileSync)(prefsPath, "utf8"));
    const auto = (0, _ttsAutoModeZhfpRKB.n)(prefs.tts?.auto);
    if (auto) return auto;
    if (typeof prefs.tts?.enabled === "boolean") return prefs.tts.enabled ? "always" : "off";
  } catch {
    return;
  }
}
function shouldAttemptTtsPayload(params) {
  const sessionAuto = (0, _ttsAutoModeZhfpRKB.n)(params.ttsAuto);
  if (sessionAuto) return sessionAuto !== "off";
  const raw = params.cfg.messages?.tts;
  const prefsAuto = readTtsPrefsAutoMode(resolveTtsPrefsPathValue(raw?.prefsPath));
  if (prefsAuto) return prefsAuto !== "off";
  const configuredAuto = (0, _ttsAutoModeZhfpRKB.n)(raw?.auto);
  if (configuredAuto) return configuredAuto !== "off";
  return raw?.enabled === true;
}
//#endregion /* v9-0df7bb2e68237bc6 */
