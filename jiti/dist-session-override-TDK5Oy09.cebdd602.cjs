"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveSessionAuthProfileOverride;exports.t = clearSessionAuthProfileOverride;var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _sourceCheckD7Bxh6E = require("./source-check-D7Bxh6-e.js");
var _storeC1I9Mkh = require("./store-C1I9Mkh8.js");
require("./model-selection-CTdyYoio.js");
var _orderT2w38pFY = require("./order-t2w38pFY.js");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/agents/auth-profiles/session-override.ts
let sessionStoreRuntimePromise;
function loadSessionStoreRuntime() {
  sessionStoreRuntimePromise ??= Promise.resolve().then(() => jitiImport("./store.runtime-Cz_llyv3.js").then((m) => _interopRequireWildcard(m)));
  return sessionStoreRuntimePromise;
}
function isProfileForProvider(params) {
  const entry = params.store.profiles[params.profileId];
  if (!entry?.provider) return false;
  return (0, _providerIdKaStHhRz.r)(entry.provider) === (0, _providerIdKaStHhRz.r)(params.provider);
}
async function clearSessionAuthProfileOverride(params) {
  const { sessionEntry, sessionStore, sessionKey, storePath } = params;
  delete sessionEntry.authProfileOverride;
  delete sessionEntry.authProfileOverrideSource;
  delete sessionEntry.authProfileOverrideCompactionCount;
  sessionEntry.updatedAt = Date.now();
  sessionStore[sessionKey] = sessionEntry;
  if (storePath) await (await loadSessionStoreRuntime()).updateSessionStore(storePath, (store) => {
    store[sessionKey] = sessionEntry;
  });
}
async function resolveSessionAuthProfileOverride(params) {
  const { cfg, provider, agentDir, sessionEntry, sessionStore, sessionKey, storePath, isNewSession } = params;
  if (!sessionEntry || !sessionStore || !sessionKey) return sessionEntry?.authProfileOverride;
  const hasConfiguredAuthProfiles = Boolean(params.cfg.auth?.profiles && Object.keys(params.cfg.auth.profiles).length > 0) || Boolean(params.cfg.auth?.order && Object.keys(params.cfg.auth.order).length > 0);
  if (!sessionEntry.authProfileOverride?.trim() && !hasConfiguredAuthProfiles && !(0, _sourceCheckD7Bxh6E.t)(agentDir)) return;
  const store = (0, _storeC1I9Mkh.n)(agentDir, { allowKeychainPrompt: false });
  const order = (0, _orderT2w38pFY.n)({
    cfg,
    store,
    provider
  });
  let current = sessionEntry.authProfileOverride?.trim();
  const source = sessionEntry.authProfileOverrideSource ?? (typeof sessionEntry.authProfileOverrideCompactionCount === "number" ? "auto" : current ? "user" : void 0);
  if (current && !store.profiles[current]) {
    await clearSessionAuthProfileOverride({
      sessionEntry,
      sessionStore,
      sessionKey,
      storePath
    });
    current = void 0;
  }
  if (current && !isProfileForProvider({
    provider,
    profileId: current,
    store
  })) {
    await clearSessionAuthProfileOverride({
      sessionEntry,
      sessionStore,
      sessionKey,
      storePath
    });
    current = void 0;
  }
  if (current && order.length > 0 && !order.includes(current) && source !== "user") {
    await clearSessionAuthProfileOverride({
      sessionEntry,
      sessionStore,
      sessionKey,
      storePath
    });
    current = void 0;
  }
  if (order.length === 0) return;
  const pickFirstAvailable = () => order.find((profileId) => !(0, _orderT2w38pFY.s)(store, profileId)) ?? order[0];
  const pickNextAvailable = (active) => {
    const startIndex = order.indexOf(active);
    if (startIndex < 0) return pickFirstAvailable();
    for (let offset = 1; offset <= order.length; offset += 1) {
      const candidate = order[(startIndex + offset) % order.length];
      if (!(0, _orderT2w38pFY.s)(store, candidate)) return candidate;
    }
    return order[startIndex] ?? order[0];
  };
  const compactionCount = sessionEntry.compactionCount ?? 0;
  const storedCompaction = typeof sessionEntry.authProfileOverrideCompactionCount === "number" ? sessionEntry.authProfileOverrideCompactionCount : compactionCount;
  if (source === "user" && current && !isNewSession) return current;
  let next = current;
  if (isNewSession) next = current ? pickNextAvailable(current) : pickFirstAvailable();else
  if (current && compactionCount > storedCompaction) next = pickNextAvailable(current);else
  if (!current || (0, _orderT2w38pFY.s)(store, current)) next = pickFirstAvailable();
  if (!next) return current;
  if (next !== sessionEntry.authProfileOverride || sessionEntry.authProfileOverrideSource !== "auto" || sessionEntry.authProfileOverrideCompactionCount !== compactionCount) {
    sessionEntry.authProfileOverride = next;
    sessionEntry.authProfileOverrideSource = "auto";
    sessionEntry.authProfileOverrideCompactionCount = compactionCount;
    sessionEntry.updatedAt = Date.now();
    sessionStore[sessionKey] = sessionEntry;
    if (storePath) await (await loadSessionStoreRuntime()).updateSessionStore(storePath, (store) => {
      store[sessionKey] = sessionEntry;
    });
  }
  return next;
}
//#endregion /* v9-82f7997a481b68eb */
