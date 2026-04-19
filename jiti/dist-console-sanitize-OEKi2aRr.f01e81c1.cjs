"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = sanitizeForConsole; //#region src/agents/console-sanitize.ts
function sanitizeForConsole(text, maxChars = 200) {
  const trimmed = text?.trim();
  if (!trimmed) return;
  const sanitized = Array.from(trimmed).filter((char) => {
    const code = char.charCodeAt(0);
    return !(code <= 8 || code === 11 || code === 12 || code >= 14 && code <= 31 || code === 127);
  }).join("").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  return sanitized.length > maxChars ? `${sanitized.slice(0, maxChars)}…` : sanitized;
}
//#endregion /* v9-0925e51f63cbe3e7 */
