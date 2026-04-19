"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveStoredModelOverride;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _modelSelectionCTdyYoio = require("./model-selection-CTdyYoio.js");
var _sessionConversationBkRPri5o = require("./session-conversation-BkRPri5o.js");
//#region src/auto-reply/reply/stored-model-override.ts
function resolveParentSessionKeyCandidate(params) {
  const explicit = (0, _stringCoerceBUSzWgUA.s)(params.parentSessionKey);
  if (explicit && explicit !== params.sessionKey) return explicit;
  const derived = (0, _sessionConversationBkRPri5o.r)(params.sessionKey);
  if (derived && derived !== params.sessionKey) return derived;
  return null;
}
function resolveStoredModelOverride(params) {
  const direct = (0, _modelSelectionCTdyYoio.g)({
    defaultProvider: params.defaultProvider,
    overrideProvider: params.sessionEntry?.providerOverride,
    overrideModel: params.sessionEntry?.modelOverride
  });
  if (direct) return {
    ...direct,
    source: "session"
  };
  const parentKey = resolveParentSessionKeyCandidate({
    sessionKey: params.sessionKey,
    parentSessionKey: params.parentSessionKey
  });
  if (!parentKey || !params.sessionStore) return null;
  const parentEntry = params.sessionStore[parentKey];
  const parentOverride = (0, _modelSelectionCTdyYoio.g)({
    defaultProvider: params.defaultProvider,
    overrideProvider: parentEntry?.providerOverride,
    overrideModel: parentEntry?.modelOverride
  });
  if (!parentOverride) return null;
  return {
    ...parentOverride,
    source: "parent"
  };
}
//#endregion /* v9-66af726eb06e8e7a */
