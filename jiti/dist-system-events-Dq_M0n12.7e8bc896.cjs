"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = hasSystemEvents;exports.c = peekSystemEvents;exports.i = enqueueSystemEvent;exports.l = resetSystemEventsForTest;exports.n = drainSystemEventEntries;exports.o = isSystemEventContextChanged;exports.r = drainSystemEvents;exports.s = peekSystemEventEntries;exports.t = consumeSystemEventEntries;exports.u = resolveSystemEventDeliveryContext;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _globalSingletonB80lDOJ = require("./global-singleton-B80lD-oJ.js");
var _deliveryContextSharedEClQPjt = require("./delivery-context.shared-EClQPjt-.js");
//#region src/infra/system-events.ts
const MAX_EVENTS = 20;
const queues = (0, _globalSingletonB80lDOJ.t)(Symbol.for("openclaw.systemEvents.queues"));
function requireSessionKey(key) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(key) ?? "";
  if (!trimmed) throw new Error("system events require a sessionKey");
  return trimmed;
}
function normalizeContextKey(key) {
  return (0, _stringCoerceBUSzWgUA.o)(key) ?? null;
}
function getSessionQueue(sessionKey) {
  return queues.get(requireSessionKey(sessionKey));
}
function getOrCreateSessionQueue(sessionKey) {
  const key = requireSessionKey(sessionKey);
  const existing = queues.get(key);
  if (existing) return existing;
  const created = {
    queue: [],
    lastText: null,
    lastContextKey: null
  };
  queues.set(key, created);
  return created;
}
function cloneSystemEvent(event) {
  return {
    ...event,
    ...(event.deliveryContext ? { deliveryContext: { ...event.deliveryContext } } : {})
  };
}
function isSystemEventContextChanged(sessionKey, contextKey) {
  const existing = getSessionQueue(sessionKey);
  return normalizeContextKey(contextKey) !== (existing?.lastContextKey ?? null);
}
function enqueueSystemEvent(text, options) {
  const entry = getOrCreateSessionQueue(requireSessionKey(options?.sessionKey));
  const cleaned = text.trim();
  if (!cleaned) return false;
  const normalizedContextKey = normalizeContextKey(options?.contextKey);
  const normalizedDeliveryContext = (0, _deliveryContextSharedEClQPjt.i)(options?.deliveryContext);
  entry.lastContextKey = normalizedContextKey;
  if (entry.lastText === cleaned) return false;
  entry.lastText = cleaned;
  entry.queue.push({
    text: cleaned,
    ts: Date.now(),
    contextKey: normalizedContextKey,
    deliveryContext: normalizedDeliveryContext,
    trusted: options.trusted !== false
  });
  if (entry.queue.length > MAX_EVENTS) entry.queue.shift();
  return true;
}
function drainSystemEventEntries(sessionKey) {
  const key = requireSessionKey(sessionKey);
  const entry = getSessionQueue(key);
  if (!entry || entry.queue.length === 0) return [];
  const out = entry.queue.map(cloneSystemEvent);
  entry.queue.length = 0;
  entry.lastText = null;
  entry.lastContextKey = null;
  queues.delete(key);
  return out;
}
function areDeliveryContextsEqual(left, right) {
  if (!left && !right) return true;
  if (!left || !right) return false;
  return (left.channel ?? void 0) === (right.channel ?? void 0) && (left.to ?? void 0) === (right.to ?? void 0) && (left.threadId ?? void 0) === (right.threadId ?? void 0);
}
function areSystemEventsEqual(left, right) {
  return left.text === right.text && left.ts === right.ts && (left.contextKey ?? null) === (right.contextKey ?? null) && (left.trusted ?? true) === (right.trusted ?? true) && areDeliveryContextsEqual(left.deliveryContext, right.deliveryContext);
}
function consumeSystemEventEntries(sessionKey, consumedEntries) {
  const key = requireSessionKey(sessionKey);
  const entry = getSessionQueue(key);
  if (!entry || entry.queue.length === 0 || consumedEntries.length === 0) return [];
  if (consumedEntries.length > entry.queue.length || !consumedEntries.every((event, index) => areSystemEventsEqual(entry.queue[index], event))) return [];
  const removed = entry.queue.splice(0, consumedEntries.length).map(cloneSystemEvent);
  if (entry.queue.length === 0) {
    entry.lastText = null;
    entry.lastContextKey = null;
    queues.delete(key);
  } else {
    const newest = entry.queue[entry.queue.length - 1];
    entry.lastText = newest.text;
    entry.lastContextKey = newest.contextKey ?? null;
  }
  return removed;
}
function drainSystemEvents(sessionKey) {
  return drainSystemEventEntries(sessionKey).map((event) => event.text);
}
function peekSystemEventEntries(sessionKey) {
  return getSessionQueue(sessionKey)?.queue.map(cloneSystemEvent) ?? [];
}
function peekSystemEvents(sessionKey) {
  return peekSystemEventEntries(sessionKey).map((event) => event.text);
}
function hasSystemEvents(sessionKey) {
  return (getSessionQueue(sessionKey)?.queue.length ?? 0) > 0;
}
function resolveSystemEventDeliveryContext(events) {
  let resolved;
  for (const event of events) resolved = (0, _deliveryContextSharedEClQPjt.r)(event.deliveryContext, resolved);
  return resolved;
}
function resetSystemEventsForTest() {
  queues.clear();
}
//#endregion /* v9-cc7458e9a157866d */
