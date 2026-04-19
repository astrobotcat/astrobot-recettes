"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = sanitizeTextContent;exports.r = stripToolMessages;exports.t = extractAssistantText;var _chatMessageContentBsffCIGz = require("./chat-message-content-BsffCIGz.js");
var _sanitizeUserFacingTextCQF1CTnZ = require("./sanitize-user-facing-text-CQF1CTnZ.js");
var _assistantVisibleTextBu2kS6O = require("./assistant-visible-text-Bu-2kS6O.js");
//#region src/agents/tools/chat-history-text.ts
function stripToolMessages(messages) {
  return messages.filter((msg) => {
    if (!msg || typeof msg !== "object") return true;
    const role = msg.role;
    return role !== "toolResult" && role !== "tool";
  });
}
/**
* Sanitize text content to strip tool call markers and thinking tags.
* This ensures user-facing text doesn't leak internal tool representations.
*/
function sanitizeTextContent(text) {
  return (0, _assistantVisibleTextBu2kS6O.r)(text, "history");
}
function extractAssistantText(message) {
  if (!message || typeof message !== "object") return;
  if (message.role !== "assistant") return;
  const joined = (0, _chatMessageContentBsffCIGz.n)(message, {
    phase: "final_answer",
    sanitizeText: sanitizeTextContent,
    joinWith: ""
  }) ?? (0, _chatMessageContentBsffCIGz.n)(message, {
    sanitizeText: sanitizeTextContent,
    joinWith: ""
  });
  const errorContext = message.stopReason === "error";
  return joined ? (0, _sanitizeUserFacingTextCQF1CTnZ.u)(joined, { errorContext }) : void 0;
}
//#endregion /* v9-79cd6646ae771015 */
