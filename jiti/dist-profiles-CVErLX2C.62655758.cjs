"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = setAuthProfileOrder;exports.i = removeProviderAuthProfilesWithLock;exports.n = listProfilesForProvider;exports.o = upsertAuthProfile;exports.r = markAuthProfileGood;exports.s = upsertAuthProfileWithLock;exports.t = dedupeProfileIds;var _stringNormalizationXm3f27dv = require("./string-normalization-xm3f27dv.js");
var _providerIdKaStHhRz = require("./provider-id-KaStHhRz.js");
var _providerEnvVarsSjBhOn = require("./provider-env-vars-Sj-BhOn9.js");
var _storeC1I9Mkh = require("./store-C1I9Mkh8.js");
var _normalizeSecretInputDqcJmob = require("./normalize-secret-input-DqcJmob1.js");
//#region src/agents/auth-profiles/profiles.ts
function dedupeProfileIds(profileIds) {
  return [...new Set(profileIds)];
}
async function setAuthProfileOrder(params) {
  const providerKey = (0, _providerIdKaStHhRz.r)(params.provider);
  const deduped = dedupeProfileIds(params.order && Array.isArray(params.order) ? (0, _stringNormalizationXm3f27dv.s)(params.order) : []);
  return await (0, _storeC1I9Mkh.l)({
    agentDir: params.agentDir,
    updater: (store) => {
      store.order = store.order ?? {};
      if (deduped.length === 0) {
        if (!store.order[providerKey]) return false;
        delete store.order[providerKey];
        if (Object.keys(store.order).length === 0) store.order = void 0;
        return true;
      }
      store.order[providerKey] = deduped;
      return true;
    }
  });
}
function upsertAuthProfile(params) {
  const credential = params.credential.type === "api_key" ? {
    ...params.credential,
    ...(typeof params.credential.key === "string" ? { key: (0, _normalizeSecretInputDqcJmob.n)(params.credential.key) } : {})
  } : params.credential.type === "token" ? {
    ...params.credential,
    token: (0, _normalizeSecretInputDqcJmob.n)(params.credential.token)
  } : params.credential;
  const store = (0, _storeC1I9Mkh.r)(params.agentDir);
  store.profiles[params.profileId] = credential;
  (0, _storeC1I9Mkh.c)(store, params.agentDir, {
    filterExternalAuthProfiles: false,
    syncExternalCli: false
  });
}
async function upsertAuthProfileWithLock(params) {
  return await (0, _storeC1I9Mkh.l)({
    agentDir: params.agentDir,
    updater: (store) => {
      store.profiles[params.profileId] = params.credential;
      return true;
    }
  });
}
async function removeProviderAuthProfilesWithLock(params) {
  const providerKey = (0, _providerEnvVarsSjBhOn.o)(params.provider);
  const storeOrderKey = (0, _providerIdKaStHhRz.r)(params.provider);
  return await (0, _storeC1I9Mkh.l)({
    agentDir: params.agentDir,
    updater: (store) => {
      const profileIds = listProfilesForProvider(store, params.provider);
      let changed = false;
      for (const profileId of profileIds) {
        if (store.profiles[profileId]) {
          delete store.profiles[profileId];
          changed = true;
        }
        if (store.usageStats?.[profileId]) {
          delete store.usageStats[profileId];
          changed = true;
        }
      }
      if (store.order?.[storeOrderKey]) {
        delete store.order[storeOrderKey];
        changed = true;
        if (Object.keys(store.order).length === 0) store.order = void 0;
      }
      if (store.lastGood?.[providerKey]) {
        delete store.lastGood[providerKey];
        changed = true;
        if (Object.keys(store.lastGood).length === 0) store.lastGood = void 0;
      }
      if (store.usageStats && Object.keys(store.usageStats).length === 0) store.usageStats = void 0;
      return changed;
    }
  });
}
function listProfilesForProvider(store, provider) {
  const providerKey = (0, _providerEnvVarsSjBhOn.o)(provider);
  return Object.entries(store.profiles).filter(([, cred]) => (0, _providerEnvVarsSjBhOn.o)(cred.provider) === providerKey).map(([id]) => id);
}
async function markAuthProfileGood(params) {
  const { store, provider, profileId, agentDir } = params;
  const providerKey = (0, _providerEnvVarsSjBhOn.o)(provider);
  const updated = await (0, _storeC1I9Mkh.l)({
    agentDir,
    updater: (freshStore) => {
      const profile = freshStore.profiles[profileId];
      if (!profile || (0, _providerEnvVarsSjBhOn.o)(profile.provider) !== providerKey) return false;
      freshStore.lastGood = {
        ...freshStore.lastGood,
        [providerKey]: profileId
      };
      return true;
    }
  });
  if (updated) {
    store.lastGood = updated.lastGood;
    return;
  }
  const profile = store.profiles[profileId];
  if (!profile || (0, _providerEnvVarsSjBhOn.o)(profile.provider) !== providerKey) return;
  store.lastGood = {
    ...store.lastGood,
    [providerKey]: profileId
  };
  (0, _storeC1I9Mkh.c)(store, agentDir);
}
//#endregion /* v9-438c31cbc0830c84 */
