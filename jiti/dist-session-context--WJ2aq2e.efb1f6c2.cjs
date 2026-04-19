"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = buildOutboundSessionContext;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
//#region src/infra/outbound/session-context.ts
function buildOutboundSessionContext(params) {
  const key = (0, _stringCoerceBUSzWgUA.s)(params.sessionKey);
  const explicitAgentId = (0, _stringCoerceBUSzWgUA.s)(params.agentId);
  const requesterAccountId = (0, _stringCoerceBUSzWgUA.s)(params.requesterAccountId);
  const requesterSenderId = (0, _stringCoerceBUSzWgUA.s)(params.requesterSenderId);
  const requesterSenderName = (0, _stringCoerceBUSzWgUA.s)(params.requesterSenderName);
  const requesterSenderUsername = (0, _stringCoerceBUSzWgUA.s)(params.requesterSenderUsername);
  const requesterSenderE164 = (0, _stringCoerceBUSzWgUA.s)(params.requesterSenderE164);
  const derivedAgentId = key ? (0, _agentScopeKFH9bkHi.p)({
    sessionKey: key,
    config: params.cfg
  }) : void 0;
  const agentId = explicitAgentId ?? derivedAgentId;
  if (!key && !agentId && !requesterAccountId && !requesterSenderId && !requesterSenderName && !requesterSenderUsername && !requesterSenderE164) return;
  return {
    ...(key ? { key } : {}),
    ...(agentId ? { agentId } : {}),
    ...(requesterAccountId ? { requesterAccountId } : {}),
    ...(requesterSenderId ? { requesterSenderId } : {}),
    ...(requesterSenderName ? { requesterSenderName } : {}),
    ...(requesterSenderUsername ? { requesterSenderUsername } : {}),
    ...(requesterSenderE164 ? { requesterSenderE164 } : {})
  };
}
//#endregion /* v9-fa8425bf7e0472d5 */
