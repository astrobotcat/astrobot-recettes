"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = normalizeCapabilityProviderId;exports.t = buildCapabilityProviderMaps;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/plugins/provider-registry-shared.ts
function normalizeCapabilityProviderId(providerId) {
  return (0, _stringCoerceBUSzWgUA.o)(providerId);
}
function buildCapabilityProviderMaps(providers, normalizeId = normalizeCapabilityProviderId) {
  const canonical = /* @__PURE__ */new Map();
  const aliases = /* @__PURE__ */new Map();
  for (const provider of providers) {
    const id = normalizeId(provider.id);
    if (!id) continue;
    canonical.set(id, provider);
    aliases.set(id, provider);
    for (const alias of provider.aliases ?? []) {
      const normalizedAlias = normalizeId(alias);
      if (normalizedAlias) aliases.set(normalizedAlias, provider);
    }
  }
  return {
    canonical,
    aliases
  };
}
//#endregion /* v9-7129cdebc37d2f22 */
