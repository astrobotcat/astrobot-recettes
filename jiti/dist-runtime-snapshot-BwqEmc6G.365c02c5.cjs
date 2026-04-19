"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = getRuntimeConfigSourceSnapshot;exports.c = registerRuntimeConfigWriteListener;exports.d = setRuntimeConfigSnapshotRefreshHandler;exports.i = getRuntimeConfigSnapshotRefreshHandler;exports.l = resetConfigRuntimeState;exports.n = finalizeRuntimeSnapshotWrite;exports.o = loadPinnedRuntimeConfig;exports.r = getRuntimeConfigSnapshot;exports.s = notifyRuntimeConfigWriteListeners;exports.t = clearRuntimeConfigSnapshot;exports.u = setRuntimeConfigSnapshot; //#region src/config/runtime-snapshot.ts
let runtimeConfigSnapshot = null;
let runtimeConfigSourceSnapshot = null;
let runtimeConfigSnapshotRefreshHandler = null;
const runtimeConfigWriteListeners = /* @__PURE__ */new Set();
function setRuntimeConfigSnapshot(config, sourceConfig) {
  runtimeConfigSnapshot = config;
  runtimeConfigSourceSnapshot = sourceConfig ?? null;
}
function resetConfigRuntimeState() {
  runtimeConfigSnapshot = null;
  runtimeConfigSourceSnapshot = null;
}
function clearRuntimeConfigSnapshot() {
  resetConfigRuntimeState();
}
function getRuntimeConfigSnapshot() {
  return runtimeConfigSnapshot;
}
function getRuntimeConfigSourceSnapshot() {
  return runtimeConfigSourceSnapshot;
}
function setRuntimeConfigSnapshotRefreshHandler(refreshHandler) {
  runtimeConfigSnapshotRefreshHandler = refreshHandler;
}
function getRuntimeConfigSnapshotRefreshHandler() {
  return runtimeConfigSnapshotRefreshHandler;
}
function registerRuntimeConfigWriteListener(listener) {
  runtimeConfigWriteListeners.add(listener);
  return () => {
    runtimeConfigWriteListeners.delete(listener);
  };
}
function notifyRuntimeConfigWriteListeners(event) {
  for (const listener of runtimeConfigWriteListeners) try {
    listener(event);
  } catch {}
}
function loadPinnedRuntimeConfig(loadFresh) {
  if (runtimeConfigSnapshot) return runtimeConfigSnapshot;
  const config = loadFresh();
  setRuntimeConfigSnapshot(config);
  return getRuntimeConfigSnapshot() ?? config;
}
async function finalizeRuntimeSnapshotWrite(params) {
  const refreshHandler = getRuntimeConfigSnapshotRefreshHandler();
  if (refreshHandler) try {
    if (await refreshHandler.refresh({ sourceConfig: params.nextSourceConfig })) {
      params.notifyCommittedWrite();
      return;
    }
  } catch (error) {
    try {
      refreshHandler.clearOnRefreshFailure?.();
    } catch {}
    throw params.createRefreshError(params.formatRefreshError(error), error);
  }
  if (params.hadBothSnapshots) {
    setRuntimeConfigSnapshot(params.loadFreshConfig(), params.nextSourceConfig);
    params.notifyCommittedWrite();
    return;
  }
  if (params.hadRuntimeSnapshot) {
    setRuntimeConfigSnapshot(params.loadFreshConfig());
    params.notifyCommittedWrite();
    return;
  }
  setRuntimeConfigSnapshot(params.loadFreshConfig());
  params.notifyCommittedWrite();
}
//#endregion /* v9-6861fc29066c8e2b */
