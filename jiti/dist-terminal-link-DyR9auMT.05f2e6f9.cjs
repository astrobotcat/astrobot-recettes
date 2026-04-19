"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = formatTerminalLink; //#region src/terminal/terminal-link.ts
function formatTerminalLink(label, url, opts) {
  const esc = "\x1B";
  const safeLabel = label.replaceAll(esc, "");
  const safeUrl = url.replaceAll(esc, "");
  if (!(opts?.force === true ? true : opts?.force === false ? false : process.stdout.isTTY)) return opts?.fallback ?? `${safeLabel} (${safeUrl})`;
  return `\u001b]8;;${safeUrl}\u0007${safeLabel}\u001b]8;;\u0007`;
}
//#endregion /* v9-0efc21ad488533d9 */
