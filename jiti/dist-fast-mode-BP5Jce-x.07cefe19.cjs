"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveFastModeState;var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _thinkingSharedCAbk7EZs = require("./thinking.shared-CAbk7EZs.js");
//#region src/agents/fast-mode.ts
function resolveConfiguredFastModeRaw(params) {
  const modelKey = `${params.provider}/${params.model}`;
  const modelConfig = params.cfg?.agents?.defaults?.models?.[modelKey];
  return modelConfig?.params?.fastMode ?? modelConfig?.params?.fast_mode;
}
function resolveFastModeState(params) {
  const sessionOverride = (0, _thinkingSharedCAbk7EZs.o)(params.sessionEntry?.fastMode);
  if (sessionOverride !== void 0) return {
    enabled: sessionOverride,
    source: "session"
  };
  const agentDefault = params.agentId && params.cfg ? (0, _agentScopeKFH9bkHi._)(params.cfg, params.agentId)?.fastModeDefault : void 0;
  if (typeof agentDefault === "boolean") return {
    enabled: agentDefault,
    source: "agent"
  };
  const configured = (0, _thinkingSharedCAbk7EZs.o)(resolveConfiguredFastModeRaw(params));
  if (configured !== void 0) return {
    enabled: configured,
    source: "config"
  };
  return {
    enabled: false,
    source: "default"
  };
}
//#endregion /* v9-ffa6968022b311ec */
