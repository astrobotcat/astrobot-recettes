"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = replaceRuntimeAuthProfileStoreSnapshots;exports.c = resolveAuthStatePathForDisplay;exports.d = resolveLegacyAuthStorePath;exports.i = hasRuntimeAuthProfileStoreSnapshot;exports.l = resolveAuthStorePath;exports.n = clearRuntimeAuthProfileStoreSnapshots;exports.o = setRuntimeAuthProfileStoreSnapshot;exports.r = getRuntimeAuthProfileStoreSnapshot;exports.s = resolveAuthStatePath;exports.t = hasAnyAuthProfileStoreSource;exports.u = resolveAuthStorePathForDisplay;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _agentPathsJWlHCT = require("./agent-paths-JWlHCT48.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/auth-profiles/path-constants.ts
const AUTH_PROFILE_FILENAME = "auth-profiles.json";
const AUTH_STATE_FILENAME = "auth-state.json";
const LEGACY_AUTH_FILENAME = "auth.json";
//#endregion
//#region src/agents/auth-profiles/path-resolve.ts
function resolveAuthStorePath(agentDir) {
  const resolved = (0, _utilsD5DtWkEu.m)(agentDir ?? (0, _agentPathsJWlHCT.t)());
  return _nodePath.default.join(resolved, AUTH_PROFILE_FILENAME);
}
function resolveLegacyAuthStorePath(agentDir) {
  const resolved = (0, _utilsD5DtWkEu.m)(agentDir ?? (0, _agentPathsJWlHCT.t)());
  return _nodePath.default.join(resolved, LEGACY_AUTH_FILENAME);
}
function resolveAuthStatePath(agentDir) {
  const resolved = (0, _utilsD5DtWkEu.m)(agentDir ?? (0, _agentPathsJWlHCT.t)());
  return _nodePath.default.join(resolved, AUTH_STATE_FILENAME);
}
function resolveAuthStorePathForDisplay(agentDir) {
  const pathname = resolveAuthStorePath(agentDir);
  return pathname.startsWith("~") ? pathname : (0, _utilsD5DtWkEu.m)(pathname);
}
function resolveAuthStatePathForDisplay(agentDir) {
  const pathname = resolveAuthStatePath(agentDir);
  return pathname.startsWith("~") ? pathname : (0, _utilsD5DtWkEu.m)(pathname);
}
//#endregion
//#region src/agents/auth-profiles/runtime-snapshots.ts
const runtimeAuthStoreSnapshots = /* @__PURE__ */new Map();
function resolveRuntimeStoreKey(agentDir) {
  return resolveAuthStorePath(agentDir);
}
function cloneAuthProfileStore(store) {
  return structuredClone(store);
}
function getRuntimeAuthProfileStoreSnapshot(agentDir) {
  const store = runtimeAuthStoreSnapshots.get(resolveRuntimeStoreKey(agentDir));
  return store ? cloneAuthProfileStore(store) : void 0;
}
function hasRuntimeAuthProfileStoreSnapshot(agentDir) {
  return runtimeAuthStoreSnapshots.has(resolveRuntimeStoreKey(agentDir));
}
function hasAnyRuntimeAuthProfileStoreSource(agentDir) {
  const requestedStore = getRuntimeAuthProfileStoreSnapshot(agentDir);
  if (requestedStore && Object.keys(requestedStore.profiles).length > 0) return true;
  if (!agentDir) return false;
  const mainStore = getRuntimeAuthProfileStoreSnapshot();
  return Boolean(mainStore && Object.keys(mainStore.profiles).length > 0);
}
function replaceRuntimeAuthProfileStoreSnapshots(entries) {
  runtimeAuthStoreSnapshots.clear();
  for (const entry of entries) runtimeAuthStoreSnapshots.set(resolveRuntimeStoreKey(entry.agentDir), cloneAuthProfileStore(entry.store));
}
function clearRuntimeAuthProfileStoreSnapshots() {
  runtimeAuthStoreSnapshots.clear();
}
function setRuntimeAuthProfileStoreSnapshot(store, agentDir) {
  runtimeAuthStoreSnapshots.set(resolveRuntimeStoreKey(agentDir), cloneAuthProfileStore(store));
}
//#endregion
//#region src/agents/auth-profiles/source-check.ts
function hasStoredAuthProfileFiles(agentDir) {
  return _nodeFs.default.existsSync(resolveAuthStorePath(agentDir)) || _nodeFs.default.existsSync(resolveAuthStatePath(agentDir)) || _nodeFs.default.existsSync(resolveLegacyAuthStorePath(agentDir));
}
function hasAnyAuthProfileStoreSource(agentDir) {
  if (hasAnyRuntimeAuthProfileStoreSource(agentDir)) return true;
  if (hasStoredAuthProfileFiles(agentDir)) return true;
  const authPath = resolveAuthStorePath(agentDir);
  const mainAuthPath = resolveAuthStorePath();
  if (agentDir && authPath !== mainAuthPath && hasStoredAuthProfileFiles(void 0)) return true;
  return false;
}
//#endregion /* v9-2ce42e768733c220 */
