"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveSendPolicy;exports.t = normalizeSendPolicy;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _chatTypeDFnPOWna = require("./chat-type-DFnPOWna.js");
//#region src/sessions/send-policy.ts
function normalizeSendPolicy(raw) {
  const value = (0, _stringCoerceBUSzWgUA.o)(raw);
  if (value === "allow") return "allow";
  if (value === "deny") return "deny";
}
function normalizeMatchValue(raw) {
  const value = (0, _stringCoerceBUSzWgUA.o)(raw);
  return value ? value : void 0;
}
function stripAgentSessionKeyPrefix(key) {
  if (!key) return;
  const parts = key.split(":").filter(Boolean);
  if (parts.length >= 3 && parts[0] === "agent") return parts.slice(2).join(":");
  return key;
}
function deriveChannelFromKey(key) {
  const normalizedKey = stripAgentSessionKeyPrefix(key);
  if (!normalizedKey) return;
  const parts = normalizedKey.split(":").filter(Boolean);
  if (parts.length >= 3 && (parts[1] === "group" || parts[1] === "channel")) return normalizeMatchValue(parts[0]);
}
function deriveChatTypeFromKey(key) {
  const normalizedKey = (0, _stringCoerceBUSzWgUA.o)(stripAgentSessionKeyPrefix(key));
  if (!normalizedKey) return;
  const tokens = new Set(normalizedKey.split(":").filter(Boolean));
  if (tokens.has("group")) return "group";
  if (tokens.has("channel")) return "channel";
  if (tokens.has("direct") || tokens.has("dm")) return "direct";
  if (/^group:[^:]+$/u.test(normalizedKey)) return "group";
  if (/^[0-9]+(?:-[0-9]+)*@g\.us$/u.test(normalizedKey)) return "group";
  if (/^whatsapp:(?!.*:group:).+@g\.us$/u.test(normalizedKey)) return "group";
  if (/^discord:(?:[^:]+:)?guild-[^:]+:channel-[^:]+$/u.test(normalizedKey)) return "channel";
}
function resolveSendPolicy(params) {
  const override = normalizeSendPolicy(params.entry?.sendPolicy);
  if (override) return override;
  const policy = params.cfg.session?.sendPolicy;
  if (!policy) return "allow";
  const channel = normalizeMatchValue(params.channel) ?? normalizeMatchValue(params.entry?.channel) ?? normalizeMatchValue(params.entry?.lastChannel) ?? deriveChannelFromKey(params.sessionKey);
  const chatType = (0, _chatTypeDFnPOWna.t)(params.chatType ?? params.entry?.chatType) ?? (0, _chatTypeDFnPOWna.t)(deriveChatTypeFromKey(params.sessionKey));
  const rawSessionKey = params.sessionKey ?? "";
  const strippedSessionKey = stripAgentSessionKeyPrefix(rawSessionKey) ?? "";
  const rawSessionKeyNorm = (0, _stringCoerceBUSzWgUA.i)(rawSessionKey);
  const strippedSessionKeyNorm = (0, _stringCoerceBUSzWgUA.i)(strippedSessionKey);
  let allowedMatch = false;
  for (const rule of policy.rules ?? []) {
    if (!rule) continue;
    const action = normalizeSendPolicy(rule.action) ?? "allow";
    const match = rule.match ?? {};
    const matchChannel = normalizeMatchValue(match.channel);
    const matchChatType = (0, _chatTypeDFnPOWna.t)(match.chatType);
    const matchPrefix = normalizeMatchValue(match.keyPrefix);
    const matchRawPrefix = normalizeMatchValue(match.rawKeyPrefix);
    if (matchChannel && matchChannel !== channel) continue;
    if (matchChatType && matchChatType !== chatType) continue;
    if (matchRawPrefix && !rawSessionKeyNorm.startsWith(matchRawPrefix)) continue;
    if (matchPrefix && !rawSessionKeyNorm.startsWith(matchPrefix) && !strippedSessionKeyNorm.startsWith(matchPrefix)) continue;
    if (action === "deny") return "deny";
    allowedMatch = true;
  }
  if (allowedMatch) return "allow";
  return normalizeSendPolicy(policy.default) ?? "allow";
}
//#endregion /* v9-1968691297bb99fa */
