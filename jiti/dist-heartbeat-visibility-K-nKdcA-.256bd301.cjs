"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resetHeartbeatEventsForTest;exports.i = onHeartbeatEvent;exports.n = emitHeartbeatEvent;exports.o = resolveIndicatorType;exports.r = getLastHeartbeatEvent;exports.t = resolveHeartbeatVisibility;var _globalSingletonB80lDOJ = require("./global-singleton-B80lD-oJ.js");
var _listeners_47QWN = require("./listeners-_47QWN8-.js");
//#region src/infra/heartbeat-events.ts
function resolveIndicatorType(status) {
  switch (status) {
    case "ok-empty":
    case "ok-token":return "ok";
    case "sent":return "alert";
    case "failed":return "error";
    case "skipped":return;
  }
  throw new Error("Unsupported heartbeat status");
}
const state = (0, _globalSingletonB80lDOJ.n)(Symbol.for("openclaw.heartbeatEvents.state"), () => ({
  lastHeartbeat: null,
  listeners: /* @__PURE__ */new Set()
}));
function emitHeartbeatEvent(evt) {
  const enriched = {
    ts: Date.now(),
    ...evt
  };
  state.lastHeartbeat = enriched;
  (0, _listeners_47QWN.t)(state.listeners, enriched);
}
function onHeartbeatEvent(listener) {
  return (0, _listeners_47QWN.n)(state.listeners, listener);
}
function getLastHeartbeatEvent() {
  return state.lastHeartbeat;
}
function resetHeartbeatEventsForTest() {
  state.lastHeartbeat = null;
  state.listeners.clear();
}
//#endregion
//#region src/infra/heartbeat-visibility.ts
const DEFAULT_VISIBILITY = {
  showOk: false,
  showAlerts: true,
  useIndicator: true
};
/**
* Resolve heartbeat visibility settings for a channel.
* Supports both deliverable channels (telegram, signal, etc.) and webchat.
* For webchat, uses channels.defaults.heartbeat since webchat doesn't have per-channel config.
*/
function resolveHeartbeatVisibility(params) {
  const { cfg, channel, accountId } = params;
  if (channel === "webchat") {
    const channelDefaults = cfg.channels?.defaults?.heartbeat;
    return {
      showOk: channelDefaults?.showOk ?? DEFAULT_VISIBILITY.showOk,
      showAlerts: channelDefaults?.showAlerts ?? DEFAULT_VISIBILITY.showAlerts,
      useIndicator: channelDefaults?.useIndicator ?? DEFAULT_VISIBILITY.useIndicator
    };
  }
  const channelDefaults = cfg.channels?.defaults?.heartbeat;
  const channelCfg = cfg.channels?.[channel];
  const perChannel = channelCfg?.heartbeat;
  const perAccount = (accountId ? channelCfg?.accounts?.[accountId] : void 0)?.heartbeat;
  return {
    showOk: perAccount?.showOk ?? perChannel?.showOk ?? channelDefaults?.showOk ?? DEFAULT_VISIBILITY.showOk,
    showAlerts: perAccount?.showAlerts ?? perChannel?.showAlerts ?? channelDefaults?.showAlerts ?? DEFAULT_VISIBILITY.showAlerts,
    useIndicator: perAccount?.useIndicator ?? perChannel?.useIndicator ?? channelDefaults?.useIndicator ?? DEFAULT_VISIBILITY.useIndicator
  };
}
//#endregion /* v9-8ada2f3ba5b2acc4 */
