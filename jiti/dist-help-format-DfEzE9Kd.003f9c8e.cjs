"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = formatHelpExamples;var _themeD5sxSdHD = require("./theme-D5sxSdHD.js");
//#region src/cli/help-format.ts
function formatHelpExample(command, description) {
  return `  ${_themeD5sxSdHD.r.command(command)}\n    ${_themeD5sxSdHD.r.muted(description)}`;
}
function formatHelpExampleLine(command, description) {
  if (!description) return `  ${_themeD5sxSdHD.r.command(command)}`;
  return `  ${_themeD5sxSdHD.r.command(command)} ${_themeD5sxSdHD.r.muted(`# ${description}`)}`;
}
function formatHelpExamples(examples, inline = false) {
  const formatter = inline ? formatHelpExampleLine : formatHelpExample;
  return examples.map(([command, description]) => formatter(command, description)).join("\n");
}
//#endregion /* v9-d7f35dc4f5565d8e */
