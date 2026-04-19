"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = drainFormattedSystemEvents;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _systemEventsDq_M0n = require("./system-events-Dq_M0n12.js");
var _dateTimeCH5CpFpu = require("./date-time-CH5CpFpu.js");
var _formatDatetimeCljomMGY = require("./format-datetime-CljomMGY.js");
var _channelSummaryB1ERKKqL = require("./channel-summary-B1ERKKqL.js");
//#region src/auto-reply/reply/session-system-events.ts
/** Drain queued system events, format as `System:` lines, return the block (or undefined). */
async function drainFormattedSystemEvents(params) {
  const compactSystemEvent = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    const lower = (0, _stringCoerceBUSzWgUA.i)(trimmed);
    if (lower.includes("reason periodic")) return null;
    if (lower.startsWith("read heartbeat.md")) return null;
    if (lower.includes("heartbeat poll") || lower.includes("heartbeat wake")) return null;
    if (trimmed.startsWith("Node:")) return trimmed.replace(/ · last input [^·]+/i, "").trim();
    return trimmed;
  };
  const resolveSystemEventTimezone = (cfg) => {
    const raw = (0, _stringCoerceBUSzWgUA.s)(cfg.agents?.defaults?.envelopeTimezone);
    if (!raw) return { mode: "local" };
    const lowered = (0, _stringCoerceBUSzWgUA.i)(raw);
    if (lowered === "utc" || lowered === "gmt") return { mode: "utc" };
    if (lowered === "local" || lowered === "host") return { mode: "local" };
    if (lowered === "user") return {
      mode: "iana",
      timeZone: (0, _dateTimeCH5CpFpu.i)(cfg.agents?.defaults?.userTimezone)
    };
    const explicit = (0, _formatDatetimeCljomMGY.r)(raw);
    return explicit ? {
      mode: "iana",
      timeZone: explicit
    } : { mode: "local" };
  };
  const formatSystemEventTimestamp = (ts, cfg) => {
    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) return "unknown-time";
    const zone = resolveSystemEventTimezone(cfg);
    if (zone.mode === "utc") return (0, _formatDatetimeCljomMGY.t)(date, { displaySeconds: true });
    if (zone.mode === "local") return (0, _formatDatetimeCljomMGY.n)(date, { displaySeconds: true }) ?? "unknown-time";
    return (0, _formatDatetimeCljomMGY.n)(date, {
      timeZone: zone.timeZone,
      displaySeconds: true
    }) ?? "unknown-time";
  };
  const systemLines = [];
  const queued = (0, _systemEventsDq_M0n.n)(params.sessionKey);
  systemLines.push(...queued.flatMap((event) => {
    const compacted = compactSystemEvent(event.text);
    if (!compacted) return [];
    const prefix = event.trusted === false ? "System (untrusted)" : "System";
    const timestamp = `[${formatSystemEventTimestamp(event.ts, params.cfg)}]`;
    return compacted.split("\n").map((subline, index) => `${prefix}: ${index === 0 ? `${timestamp} ` : ""}${subline}`);
  }));
  if (params.isMainSession && params.isNewSession) {
    const summary = await (0, _channelSummaryB1ERKKqL.t)(params.cfg);
    if (summary.length > 0) systemLines.unshift(...summary.flatMap((line) => line.split("\n").map((subline) => `System: ${subline}`)));
  }
  if (systemLines.length === 0) return;
  return systemLines.join("\n");
}
//#endregion /* v9-1f2bef5ad3b96a09 */
