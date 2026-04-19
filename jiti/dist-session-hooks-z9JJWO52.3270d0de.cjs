"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = buildSessionStartHookPayload;exports.t = buildSessionEndHookPayload;var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
//#region src/auto-reply/reply/session-hooks.ts
function buildSessionHookContext(params) {
  return {
    sessionId: params.sessionId,
    sessionKey: params.sessionKey,
    agentId: (0, _agentScopeKFH9bkHi.p)({
      sessionKey: params.sessionKey,
      config: params.cfg
    })
  };
}
function buildSessionStartHookPayload(params) {
  return {
    event: {
      sessionId: params.sessionId,
      sessionKey: params.sessionKey,
      resumedFrom: params.resumedFrom
    },
    context: buildSessionHookContext({
      sessionId: params.sessionId,
      sessionKey: params.sessionKey,
      cfg: params.cfg
    })
  };
}
function buildSessionEndHookPayload(params) {
  return {
    event: {
      sessionId: params.sessionId,
      sessionKey: params.sessionKey,
      messageCount: params.messageCount ?? 0,
      durationMs: params.durationMs,
      reason: params.reason,
      sessionFile: params.sessionFile,
      transcriptArchived: params.transcriptArchived,
      nextSessionId: params.nextSessionId,
      nextSessionKey: params.nextSessionKey
    },
    context: buildSessionHookContext({
      sessionId: params.sessionId,
      sessionKey: params.sessionKey,
      cfg: params.cfg
    })
  };
}
//#endregion /* v9-3b5f8131db79abd9 */
