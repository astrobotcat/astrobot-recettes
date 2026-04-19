"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = formatDocsLink;var _terminalLinkDyR9auMT = require("./terminal-link-DyR9auMT.js");
//#region src/terminal/links.ts
function resolveDocsRoot() {
  return "https://docs.openclaw.ai";
}
function formatDocsLink(path, label, opts) {
  const docsRoot = resolveDocsRoot();
  const trimmed = typeof path === "string" ? path.trim() : "";
  const url = trimmed ? trimmed.startsWith("http") ? trimmed : `${docsRoot}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}` : docsRoot;
  return (0, _terminalLinkDyR9auMT.t)(label ?? url, url, {
    fallback: opts?.fallback ?? url,
    force: opts?.force
  });
}
//#endregion /* v9-541c7179381eb67e */
