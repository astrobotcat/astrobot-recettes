"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = normalizeDeviceAuthScopes;exports.t = normalizeDeviceAuthRole; //#region src/shared/device-auth.ts
function normalizeDeviceAuthRole(role) {
  return role.trim();
}
function normalizeDeviceAuthScopes(scopes) {
  if (!Array.isArray(scopes)) return [];
  const out = /* @__PURE__ */new Set();
  for (const scope of scopes) {
    const trimmed = scope.trim();
    if (trimmed) out.add(trimmed);
  }
  if (out.has("operator.admin")) {
    out.add("operator.read");
    out.add("operator.write");
  } else if (out.has("operator.write")) out.add("operator.read");
  return [...out].toSorted();
}
//#endregion /* v9-237fcdb42fdd1408 */
