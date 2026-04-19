"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveRunTypingPolicy;require("./message-channel-CBqCPFa_.js");
require("./message-channel-core-BIZsQ6dr.js");
//#region src/auto-reply/reply/typing-policy.ts
function resolveRunTypingPolicy(params) {
  const typingPolicy = params.isHeartbeat ? "heartbeat" : params.originatingChannel === "webchat" ? "internal_webchat" : params.systemEvent ? "system_event" : params.requestedPolicy ?? "auto";
  return {
    typingPolicy,
    suppressTyping: params.suppressTyping === true || typingPolicy === "heartbeat" || typingPolicy === "system_event" || typingPolicy === "internal_webchat"
  };
}
//#endregion /* v9-a2a33d2f4bb3b61f */
