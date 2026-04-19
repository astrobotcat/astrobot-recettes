"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = matchesApprovalRequestSessionFilter;exports.t = matchesApprovalRequestFilters;var _configRegexDGU0okmz = require("./config-regex-DGU0okmz.js");
var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
//#region src/infra/approval-request-filters.ts
function matchesApprovalRequestSessionFilter(sessionKey, patterns) {
  return patterns.some((pattern) => {
    if (sessionKey.includes(pattern)) return true;
    const regex = (0, _configRegexDGU0okmz.r)(pattern);
    return regex ? (0, _configRegexDGU0okmz.o)(regex, sessionKey) : false;
  });
}
function matchesApprovalRequestFilters(params) {
  if (params.agentFilter?.length) {
    const explicitAgentId = (0, _stringCoerceBUSzWgUA.s)(params.request.agentId);
    const sessionAgentId = params.fallbackAgentIdFromSessionKey ? (0, _sessionKeyBh1lMwK.x)(params.request.sessionKey)?.agentId ?? void 0 : void 0;
    const agentId = explicitAgentId ?? sessionAgentId;
    if (!agentId || !params.agentFilter.includes(agentId)) return false;
  }
  if (params.sessionFilter?.length) {
    const sessionKey = (0, _stringCoerceBUSzWgUA.s)(params.request.sessionKey);
    if (!sessionKey || !matchesApprovalRequestSessionFilter(sessionKey, params.sessionFilter)) return false;
  }
  return true;
}
//#endregion /* v9-4b663d5a4160aeaf */
