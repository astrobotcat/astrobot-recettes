"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveAuthProfileMetadata;exports.t = buildAuthProfileId;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/agents/auth-profiles/identity.ts
function resolveStoredMetadata(store, profileId) {
  const profile = store?.profiles[profileId];
  if (!profile) return {};
  return {
    displayName: "displayName" in profile ? (0, _stringCoerceBUSzWgUA.s)(profile.displayName) : void 0,
    email: "email" in profile ? (0, _stringCoerceBUSzWgUA.s)(profile.email) : void 0
  };
}
function buildAuthProfileId(params) {
  return `${(0, _stringCoerceBUSzWgUA.s)(params.profilePrefix) ?? params.providerId}:${(0, _stringCoerceBUSzWgUA.s)(params.profileName) ?? "default"}`;
}
function resolveAuthProfileMetadata(params) {
  const configured = params.cfg?.auth?.profiles?.[params.profileId];
  const stored = resolveStoredMetadata(params.store, params.profileId);
  return {
    displayName: (0, _stringCoerceBUSzWgUA.s)(configured?.displayName) ?? stored.displayName,
    email: (0, _stringCoerceBUSzWgUA.s)(configured?.email) ?? stored.email
  };
}
//#endregion /* v9-6d728187e9cb49f3 */
