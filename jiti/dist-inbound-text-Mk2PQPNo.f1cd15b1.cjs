"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = sanitizeInboundSystemTags;exports.t = normalizeInboundTextNewlines; //#region src/auto-reply/reply/inbound-text.ts
function normalizeInboundTextNewlines(input) {
  return input.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}
const BRACKETED_SYSTEM_TAG_RE = /\[\s*(System\s*Message|System|Assistant|Internal)\s*\]/gi;
const LINE_SYSTEM_PREFIX_RE = /^(\s*)System:(?=\s|$)/gim;
/**
* Neutralize user-controlled strings that spoof internal system markers.
*/
function sanitizeInboundSystemTags(input) {
  return input.replace(BRACKETED_SYSTEM_TAG_RE, (_match, tag) => `(${tag})`).replace(LINE_SYSTEM_PREFIX_RE, "$1System (untrusted):");
}
//#endregion /* v9-5a11087e9c74f93d */
