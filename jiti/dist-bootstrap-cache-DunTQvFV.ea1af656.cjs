"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = clearBootstrapSnapshotOnSessionRollover;exports.r = getOrLoadBootstrapFiles;exports.t = clearBootstrapSnapshot;var _workspaceHhTlRYqM = require("./workspace-hhTlRYqM.js");
//#region src/agents/bootstrap-cache.ts
const cache = /* @__PURE__ */new Map();
async function getOrLoadBootstrapFiles(params) {
  const existing = cache.get(params.sessionKey);
  if (existing) return existing;
  const files = await (0, _workspaceHhTlRYqM.h)(params.workspaceDir);
  cache.set(params.sessionKey, files);
  return files;
}
function clearBootstrapSnapshot(sessionKey) {
  cache.delete(sessionKey);
}
function clearBootstrapSnapshotOnSessionRollover(params) {
  if (!params.sessionKey || !params.previousSessionId) return;
  clearBootstrapSnapshot(params.sessionKey);
}
//#endregion /* v9-bcbce7706bfa14ed */
