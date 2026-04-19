"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = listAgentWorkspaceDirs;var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
//#region src/agents/workspace-dirs.ts
function listAgentWorkspaceDirs(cfg) {
  const dirs = /* @__PURE__ */new Set();
  const list = cfg.agents?.list;
  if (Array.isArray(list)) {
    for (const entry of list) if (entry && typeof entry === "object" && typeof entry.id === "string") dirs.add((0, _agentScopeKFH9bkHi.b)(cfg, entry.id));
  }
  dirs.add((0, _agentScopeKFH9bkHi.b)(cfg, (0, _agentScopeKFH9bkHi.x)(cfg)));
  return [...dirs];
}
//#endregion /* v9-7c8df53b441f99d5 */
