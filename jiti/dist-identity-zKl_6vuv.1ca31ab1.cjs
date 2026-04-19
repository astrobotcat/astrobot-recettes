"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveAgentOutboundIdentity;exports.t = normalizeOutboundIdentity;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _identityB_Q39IGW = require("./identity-B_Q39IGW.js");
var _identityAvatarCrLDUJh = require("./identity-avatar-CrLDUJh-.js");
//#region src/infra/outbound/identity.ts
function normalizeOutboundIdentity(identity) {
  if (!identity) return;
  const name = (0, _stringCoerceBUSzWgUA.s)(identity.name);
  const avatarUrl = (0, _stringCoerceBUSzWgUA.s)(identity.avatarUrl);
  const emoji = (0, _stringCoerceBUSzWgUA.s)(identity.emoji);
  const theme = (0, _stringCoerceBUSzWgUA.s)(identity.theme);
  if (!name && !avatarUrl && !emoji && !theme) return;
  return {
    name,
    avatarUrl,
    emoji,
    theme
  };
}
function resolveAgentOutboundIdentity(cfg, agentId) {
  const agentIdentity = (0, _identityB_Q39IGW.n)(cfg, agentId);
  const avatar = (0, _identityAvatarCrLDUJh.t)(cfg, agentId);
  return normalizeOutboundIdentity({
    name: agentIdentity?.name,
    emoji: agentIdentity?.emoji,
    avatarUrl: avatar.kind === "remote" ? avatar.url : void 0,
    theme: agentIdentity?.theme
  });
}
//#endregion /* v9-3e552a263ffaab90 */
