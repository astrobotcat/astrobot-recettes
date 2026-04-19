"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = logRunAttempt;exports.c = logToolLoopAction;exports.d = logWebhookReceived;exports.f = resetDiagnosticStateForTest;exports.h = stopDiagnosticHeartbeat;exports.i = logMessageQueued;exports.l = logWebhookError;exports.m = startDiagnosticHeartbeat;exports.n = logActiveRuns;exports.o = logSessionStateChange;exports.p = resolveStuckSessionWarnMs;exports.r = logMessageProcessed;exports.s = logSessionStuck;exports.t = getDiagnosticSessionStateCountForTest;exports.u = logWebhookProcessed;var _io5pxHCi7V = require("./io-5pxHCi7V.js");
require("./config-Q9XZc_2I.js");
var _diagnosticEventsP3w1ZgD_ = require("./diagnostic-events-P3w1ZgD_.js");
var _diagnosticRuntimeDOaqJdZf = require("./diagnostic-runtime-DOaqJdZf.js");
var _diagnosticSessionStateBePumQl = require("./diagnostic-session-state-BePum-ql.js");function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region src/logging/diagnostic.ts
const webhookStats = {
  received: 0,
  processed: 0,
  errors: 0,
  lastReceived: 0
};
const DEFAULT_STUCK_SESSION_WARN_MS = 12e4;
const MIN_STUCK_SESSION_WARN_MS = 1e3;
const MAX_STUCK_SESSION_WARN_MS = 1440 * 60 * 1e3;
let commandPollBackoffRuntimePromise = null;
function loadCommandPollBackoffRuntime() {
  commandPollBackoffRuntimePromise ??= Promise.resolve().then(() => jitiImport("./command-poll-backoff.runtime-DnePDO7O.js").then((m) => _interopRequireWildcard(m)));
  return commandPollBackoffRuntimePromise;
}
function resolveStuckSessionWarnMs(config) {
  const raw = config?.diagnostics?.stuckSessionWarnMs;
  if (typeof raw !== "number" || !Number.isFinite(raw)) return DEFAULT_STUCK_SESSION_WARN_MS;
  const rounded = Math.floor(raw);
  if (rounded < MIN_STUCK_SESSION_WARN_MS || rounded > MAX_STUCK_SESSION_WARN_MS) return DEFAULT_STUCK_SESSION_WARN_MS;
  return rounded;
}
function logWebhookReceived(params) {
  webhookStats.received += 1;
  webhookStats.lastReceived = Date.now();
  if (_diagnosticRuntimeDOaqJdZf.t.isEnabled("debug")) _diagnosticRuntimeDOaqJdZf.t.debug(`webhook received: channel=${params.channel} type=${params.updateType ?? "unknown"} chatId=${params.chatId ?? "unknown"} total=${webhookStats.received}`);
  (0, _diagnosticEventsP3w1ZgD_.t)({
    type: "webhook.received",
    channel: params.channel,
    updateType: params.updateType,
    chatId: params.chatId
  });
  (0, _diagnosticRuntimeDOaqJdZf.a)();
}
function logWebhookProcessed(params) {
  webhookStats.processed += 1;
  if (_diagnosticRuntimeDOaqJdZf.t.isEnabled("debug")) _diagnosticRuntimeDOaqJdZf.t.debug(`webhook processed: channel=${params.channel} type=${params.updateType ?? "unknown"} chatId=${params.chatId ?? "unknown"} duration=${params.durationMs ?? 0}ms processed=${webhookStats.processed}`);
  (0, _diagnosticEventsP3w1ZgD_.t)({
    type: "webhook.processed",
    channel: params.channel,
    updateType: params.updateType,
    chatId: params.chatId,
    durationMs: params.durationMs
  });
  (0, _diagnosticRuntimeDOaqJdZf.a)();
}
function logWebhookError(params) {
  webhookStats.errors += 1;
  _diagnosticRuntimeDOaqJdZf.t.error(`webhook error: channel=${params.channel} type=${params.updateType ?? "unknown"} chatId=${params.chatId ?? "unknown"} error="${params.error}" errors=${webhookStats.errors}`);
  (0, _diagnosticEventsP3w1ZgD_.t)({
    type: "webhook.error",
    channel: params.channel,
    updateType: params.updateType,
    chatId: params.chatId,
    error: params.error
  });
  (0, _diagnosticRuntimeDOaqJdZf.a)();
}
function logMessageQueued(params) {
  const state = (0, _diagnosticSessionStateBePumQl.n)(params);
  state.queueDepth += 1;
  state.lastActivity = Date.now();
  if (_diagnosticRuntimeDOaqJdZf.t.isEnabled("debug")) _diagnosticRuntimeDOaqJdZf.t.debug(`message queued: sessionId=${state.sessionId ?? "unknown"} sessionKey=${state.sessionKey ?? "unknown"} source=${params.source} queueDepth=${state.queueDepth} sessionState=${state.state}`);
  (0, _diagnosticEventsP3w1ZgD_.t)({
    type: "message.queued",
    sessionId: state.sessionId,
    sessionKey: state.sessionKey,
    channel: params.channel,
    source: params.source,
    queueDepth: state.queueDepth
  });
  (0, _diagnosticRuntimeDOaqJdZf.a)();
}
function logMessageProcessed(params) {
  if (params.outcome === "error" ? _diagnosticRuntimeDOaqJdZf.t.isEnabled("error") : _diagnosticRuntimeDOaqJdZf.t.isEnabled("debug")) {
    const payload = `message processed: channel=${params.channel} chatId=${params.chatId ?? "unknown"} messageId=${params.messageId ?? "unknown"} sessionId=${params.sessionId ?? "unknown"} sessionKey=${params.sessionKey ?? "unknown"} outcome=${params.outcome} duration=${params.durationMs ?? 0}ms${params.reason ? ` reason=${params.reason}` : ""}${params.error ? ` error="${params.error}"` : ""}`;
    if (params.outcome === "error") _diagnosticRuntimeDOaqJdZf.t.error(payload);else
    _diagnosticRuntimeDOaqJdZf.t.debug(payload);
  }
  (0, _diagnosticEventsP3w1ZgD_.t)({
    type: "message.processed",
    channel: params.channel,
    chatId: params.chatId,
    messageId: params.messageId,
    sessionId: params.sessionId,
    sessionKey: params.sessionKey,
    durationMs: params.durationMs,
    outcome: params.outcome,
    reason: params.reason,
    error: params.error
  });
  (0, _diagnosticRuntimeDOaqJdZf.a)();
}
function logSessionStateChange(params) {
  const state = (0, _diagnosticSessionStateBePumQl.n)(params);
  const isProbeSession = state.sessionId?.startsWith("probe-") ?? false;
  const prevState = state.state;
  state.state = params.state;
  state.lastActivity = Date.now();
  if (params.state === "idle") state.queueDepth = Math.max(0, state.queueDepth - 1);
  if (!isProbeSession && _diagnosticRuntimeDOaqJdZf.t.isEnabled("debug")) _diagnosticRuntimeDOaqJdZf.t.debug(`session state: sessionId=${state.sessionId ?? "unknown"} sessionKey=${state.sessionKey ?? "unknown"} prev=${prevState} new=${params.state} reason="${params.reason ?? ""}" queueDepth=${state.queueDepth}`);
  (0, _diagnosticEventsP3w1ZgD_.t)({
    type: "session.state",
    sessionId: state.sessionId,
    sessionKey: state.sessionKey,
    prevState,
    state: params.state,
    reason: params.reason,
    queueDepth: state.queueDepth
  });
  (0, _diagnosticRuntimeDOaqJdZf.a)();
}
function logSessionStuck(params) {
  const state = (0, _diagnosticSessionStateBePumQl.n)(params);
  _diagnosticRuntimeDOaqJdZf.t.warn(`stuck session: sessionId=${state.sessionId ?? "unknown"} sessionKey=${state.sessionKey ?? "unknown"} state=${params.state} age=${Math.round(params.ageMs / 1e3)}s queueDepth=${state.queueDepth}`);
  (0, _diagnosticEventsP3w1ZgD_.t)({
    type: "session.stuck",
    sessionId: state.sessionId,
    sessionKey: state.sessionKey,
    state: params.state,
    ageMs: params.ageMs,
    queueDepth: state.queueDepth
  });
  (0, _diagnosticRuntimeDOaqJdZf.a)();
}
function logRunAttempt(params) {
  _diagnosticRuntimeDOaqJdZf.t.debug(`run attempt: sessionId=${params.sessionId ?? "unknown"} sessionKey=${params.sessionKey ?? "unknown"} runId=${params.runId} attempt=${params.attempt}`);
  (0, _diagnosticEventsP3w1ZgD_.t)({
    type: "run.attempt",
    sessionId: params.sessionId,
    sessionKey: params.sessionKey,
    runId: params.runId,
    attempt: params.attempt
  });
  (0, _diagnosticRuntimeDOaqJdZf.a)();
}
function logToolLoopAction(params) {
  const payload = `tool loop: sessionId=${params.sessionId ?? "unknown"} sessionKey=${params.sessionKey ?? "unknown"} tool=${params.toolName} level=${params.level} action=${params.action} detector=${params.detector} count=${params.count}${params.pairedToolName ? ` pairedTool=${params.pairedToolName}` : ""} message="${params.message}"`;
  if (params.level === "critical") _diagnosticRuntimeDOaqJdZf.t.error(payload);else
  _diagnosticRuntimeDOaqJdZf.t.warn(payload);
  (0, _diagnosticEventsP3w1ZgD_.t)({
    type: "tool.loop",
    sessionId: params.sessionId,
    sessionKey: params.sessionKey,
    toolName: params.toolName,
    level: params.level,
    action: params.action,
    detector: params.detector,
    count: params.count,
    message: params.message,
    pairedToolName: params.pairedToolName
  });
  (0, _diagnosticRuntimeDOaqJdZf.a)();
}
function logActiveRuns() {
  const activeSessions = Array.from(_diagnosticSessionStateBePumQl.t.entries()).filter(([, s]) => s.state === "processing").map(([id, s]) => `${id}(q=${s.queueDepth},age=${Math.round((Date.now() - s.lastActivity) / 1e3)}s)`);
  _diagnosticRuntimeDOaqJdZf.t.debug(`active runs: count=${activeSessions.length} sessions=[${activeSessions.join(", ")}]`);
  (0, _diagnosticRuntimeDOaqJdZf.a)();
}
let heartbeatInterval = null;
function startDiagnosticHeartbeat(config, opts) {
  if (heartbeatInterval) return;
  heartbeatInterval = setInterval(() => {
    let heartbeatConfig = config;
    if (!heartbeatConfig) try {
      heartbeatConfig = (opts?.getConfig ?? _io5pxHCi7V.i)();
    } catch {
      heartbeatConfig = void 0;
    }
    const stuckSessionWarnMs = resolveStuckSessionWarnMs(heartbeatConfig);
    const now = Date.now();
    (0, _diagnosticSessionStateBePumQl.i)(now, true);
    const activeCount = Array.from(_diagnosticSessionStateBePumQl.t.values()).filter((s) => s.state === "processing").length;
    const waitingCount = Array.from(_diagnosticSessionStateBePumQl.t.values()).filter((s) => s.state === "waiting").length;
    const totalQueued = Array.from(_diagnosticSessionStateBePumQl.t.values()).reduce((sum, s) => sum + s.queueDepth, 0);
    if (!((0, _diagnosticRuntimeDOaqJdZf.n)() > 0 || webhookStats.received > 0 || activeCount > 0 || waitingCount > 0 || totalQueued > 0)) return;
    if (now - (0, _diagnosticRuntimeDOaqJdZf.n)() > 12e4 && activeCount === 0 && waitingCount === 0) return;
    _diagnosticRuntimeDOaqJdZf.t.debug(`heartbeat: webhooks=${webhookStats.received}/${webhookStats.processed}/${webhookStats.errors} active=${activeCount} waiting=${waitingCount} queued=${totalQueued}`);
    (0, _diagnosticEventsP3w1ZgD_.t)({
      type: "diagnostic.heartbeat",
      webhooks: {
        received: webhookStats.received,
        processed: webhookStats.processed,
        errors: webhookStats.errors
      },
      active: activeCount,
      waiting: waitingCount,
      queued: totalQueued
    });
    loadCommandPollBackoffRuntime().then(({ pruneStaleCommandPolls }) => {
      for (const [, state] of _diagnosticSessionStateBePumQl.t) pruneStaleCommandPolls(state);
    }).catch((err) => {
      _diagnosticRuntimeDOaqJdZf.t.debug(`command-poll-backoff prune failed: ${String(err)}`);
    });
    for (const [, state] of _diagnosticSessionStateBePumQl.t) {
      const ageMs = now - state.lastActivity;
      if (state.state === "processing" && ageMs > stuckSessionWarnMs) logSessionStuck({
        sessionId: state.sessionId,
        sessionKey: state.sessionKey,
        state: state.state,
        ageMs
      });
    }
  }, 3e4);
  heartbeatInterval.unref?.();
}
function stopDiagnosticHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}
function getDiagnosticSessionStateCountForTest() {
  return (0, _diagnosticSessionStateBePumQl.r)();
}
function resetDiagnosticStateForTest() {
  (0, _diagnosticSessionStateBePumQl.a)();
  (0, _diagnosticRuntimeDOaqJdZf.o)();
  webhookStats.received = 0;
  webhookStats.processed = 0;
  webhookStats.errors = 0;
  webhookStats.lastReceived = 0;
  stopDiagnosticHeartbeat();
}
//#endregion /* v9-921e73f2d4fcd190 */
