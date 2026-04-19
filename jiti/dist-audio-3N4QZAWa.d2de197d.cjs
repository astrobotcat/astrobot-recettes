"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = isVoiceCompatibleAudio;exports.n = void 0;exports.r = isTelegramVoiceCompatibleAudio;exports.t = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _mimeB6nXlmtY = require("./mime-B6nXlmtY.js");
//#region src/media/audio.ts
const TELEGRAM_VOICE_AUDIO_EXTENSIONS = exports.t = new Set([
".oga",
".ogg",
".opus",
".mp3",
".m4a"]
);
/**
* MIME types compatible with voice messages.
* Telegram sendVoice supports OGG/Opus, MP3, and M4A.
* https://core.telegram.org/bots/api#sendvoice
*/
const TELEGRAM_VOICE_MIME_TYPES = exports.n = new Set([
"audio/ogg",
"audio/opus",
"audio/mpeg",
"audio/mp3",
"audio/mp4",
"audio/x-m4a",
"audio/m4a"]
);
function isTelegramVoiceCompatibleAudio(opts) {
  const mime = (0, _mimeB6nXlmtY.l)(opts.contentType);
  if (mime && TELEGRAM_VOICE_MIME_TYPES.has(mime)) return true;
  const fileName = (0, _stringCoerceBUSzWgUA.s)(opts.fileName);
  if (!fileName) return false;
  const ext = (0, _mimeB6nXlmtY.r)(fileName);
  if (!ext) return false;
  return TELEGRAM_VOICE_AUDIO_EXTENSIONS.has(ext);
}
/**
* Backward-compatible alias used across plugin/runtime call sites.
* Keeps existing behavior while making Telegram-specific policy explicit.
*/
function isVoiceCompatibleAudio(opts) {
  return isTelegramVoiceCompatibleAudio(opts);
}
//#endregion /* v9-5c11534081de3e0f */
