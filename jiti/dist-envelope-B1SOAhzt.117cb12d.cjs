"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveEnvelopeFormatOptions;exports.i = formatInboundFromLabel;exports.n = formatEnvelopeTimestamp;exports.o = resolveSenderLabel;exports.r = formatInboundEnvelope;exports.t = formatAgentEnvelope;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _chatTypeDFnPOWna = require("./chat-type-DFnPOWna.js");
var _dateTimeCH5CpFpu = require("./date-time-CH5CpFpu.js");
var _formatDatetimeCljomMGY = require("./format-datetime-CljomMGY.js");
var _formatRelativeBErnCbgi = require("./format-relative-BErnCbgi.js");
//#region src/channels/sender-label.ts
function normalizeSenderLabelParams(params) {
  return {
    name: (0, _stringCoerceBUSzWgUA.s)(params.name),
    username: (0, _stringCoerceBUSzWgUA.s)(params.username),
    tag: (0, _stringCoerceBUSzWgUA.s)(params.tag),
    e164: (0, _stringCoerceBUSzWgUA.s)(params.e164),
    id: (0, _stringCoerceBUSzWgUA.s)(params.id)
  };
}
function resolveSenderLabel(params) {
  const { name, username, tag, e164, id } = normalizeSenderLabelParams(params);
  const display = name ?? username ?? tag ?? "";
  const idPart = e164 ?? id ?? "";
  if (display && idPart && display !== idPart) return `${display} (${idPart})`;
  return display || idPart || null;
}
//#endregion
//#region src/auto-reply/envelope.ts
function sanitizeEnvelopeHeaderPart(value) {
  return value.replace(/\r\n|\r|\n/g, " ").replaceAll("[", "(").replaceAll("]", ")").replace(/\s+/g, " ").trim();
}
function resolveEnvelopeFormatOptions(cfg) {
  const defaults = cfg?.agents?.defaults;
  return {
    timezone: defaults?.envelopeTimezone,
    includeTimestamp: defaults?.envelopeTimestamp !== "off",
    includeElapsed: defaults?.envelopeElapsed !== "off",
    userTimezone: defaults?.userTimezone
  };
}
function normalizeEnvelopeOptions(options) {
  const includeTimestamp = options?.includeTimestamp !== false;
  const includeElapsed = options?.includeElapsed !== false;
  return {
    timezone: (0, _stringCoerceBUSzWgUA.s)(options?.timezone) || "local",
    includeTimestamp,
    includeElapsed,
    userTimezone: options?.userTimezone
  };
}
function resolveEnvelopeTimezone(options) {
  const trimmed = options.timezone?.trim();
  if (!trimmed) return { mode: "local" };
  const lowered = (0, _stringCoerceBUSzWgUA.i)(trimmed);
  if (lowered === "utc" || lowered === "gmt") return { mode: "utc" };
  if (lowered === "local" || lowered === "host") return { mode: "local" };
  if (lowered === "user") return {
    mode: "iana",
    timeZone: (0, _dateTimeCH5CpFpu.i)(options.userTimezone)
  };
  const explicit = (0, _formatDatetimeCljomMGY.r)(trimmed);
  return explicit ? {
    mode: "iana",
    timeZone: explicit
  } : { mode: "utc" };
}
function formatEnvelopeTimestamp(ts, options) {
  if (!ts) return;
  const resolved = normalizeEnvelopeOptions(options);
  if (!resolved.includeTimestamp) return;
  const date = ts instanceof Date ? ts : new Date(ts);
  if (Number.isNaN(date.getTime())) return;
  const zone = resolveEnvelopeTimezone(resolved);
  const weekday = (() => {
    try {
      if (zone.mode === "utc") return new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        weekday: "short"
      }).format(date);
      if (zone.mode === "local") return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
      return new Intl.DateTimeFormat("en-US", {
        timeZone: zone.timeZone,
        weekday: "short"
      }).format(date);
    } catch {
      return;
    }
  })();
  const formatted = zone.mode === "utc" ? (0, _formatDatetimeCljomMGY.t)(date) : zone.mode === "local" ? (0, _formatDatetimeCljomMGY.n)(date) : (0, _formatDatetimeCljomMGY.n)(date, { timeZone: zone.timeZone });
  if (!formatted) return;
  return weekday ? `${weekday} ${formatted}` : formatted;
}
function formatAgentEnvelope(params) {
  const parts = [sanitizeEnvelopeHeaderPart((0, _stringCoerceBUSzWgUA.s)(params.channel) || "Channel")];
  const resolved = normalizeEnvelopeOptions(params.envelope);
  let elapsed;
  if (resolved.includeElapsed && params.timestamp && params.previousTimestamp) {
    const elapsedMs = (params.timestamp instanceof Date ? params.timestamp.getTime() : params.timestamp) - (params.previousTimestamp instanceof Date ? params.previousTimestamp.getTime() : params.previousTimestamp);
    elapsed = Number.isFinite(elapsedMs) && elapsedMs >= 0 ? (0, _formatRelativeBErnCbgi.n)(elapsedMs, { suffix: false }) : void 0;
  }
  const from = (0, _stringCoerceBUSzWgUA.s)(params.from);
  if (from) {
    const fromLabel = sanitizeEnvelopeHeaderPart(from);
    parts.push(elapsed ? `${fromLabel} +${elapsed}` : fromLabel);
  } else if (elapsed) parts.push(`+${elapsed}`);
  const host = (0, _stringCoerceBUSzWgUA.s)(params.host);
  if (host) parts.push(sanitizeEnvelopeHeaderPart(host));
  const ip = (0, _stringCoerceBUSzWgUA.s)(params.ip);
  if (ip) parts.push(sanitizeEnvelopeHeaderPart(ip));
  const ts = formatEnvelopeTimestamp(params.timestamp, resolved);
  if (ts) parts.push(ts);
  return `${`[${parts.join(" ")}]`} ${params.body}`;
}
function formatInboundEnvelope(params) {
  const chatType = (0, _chatTypeDFnPOWna.t)(params.chatType);
  const isDirect = !chatType || chatType === "direct";
  const resolvedSenderRaw = (0, _stringCoerceBUSzWgUA.s)(params.senderLabel) || resolveSenderLabel(params.sender ?? {});
  const resolvedSender = resolvedSenderRaw ? sanitizeEnvelopeHeaderPart(resolvedSenderRaw) : "";
  const body = isDirect && params.fromMe ? `(self): ${params.body}` : !isDirect && resolvedSender ? `${resolvedSender}: ${params.body}` : params.body;
  return formatAgentEnvelope({
    channel: params.channel,
    from: params.from,
    timestamp: params.timestamp,
    previousTimestamp: params.previousTimestamp,
    envelope: params.envelope,
    body
  });
}
function formatInboundFromLabel(params) {
  if (params.isGroup) {
    const label = (0, _stringCoerceBUSzWgUA.s)(params.groupLabel) || params.groupFallback || "Group";
    const id = params.groupId?.trim();
    return id ? `${label} id:${id}` : label;
  }
  const directLabel = params.directLabel.trim();
  const directId = params.directId?.trim();
  if (!directId || directId === directLabel) return directLabel;
  return `${directLabel} id:${directId}`;
}
//#endregion /* v9-f531f1dc52176328 */
