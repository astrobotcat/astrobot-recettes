"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = sanitizeExecApprovalDisplayText;exports.t = resolveExecApprovalCommandDisplay;var _redactD4nea1HF = require("./redact-D4nea1HF.js");
//#region src/infra/exec-approval-command-display.ts
const EXEC_APPROVAL_INVISIBLE_CHAR_REGEX = /[\p{Cf}\u115F\u1160\u3164\uFFA0]/gu;
function formatCodePointEscape(char) {
  return `\\u{${char.codePointAt(0)?.toString(16).toUpperCase() ?? "FFFD"}}`;
}
function sanitizeExecApprovalDisplayText(commandText) {
  return (0, _redactD4nea1HF.r)(commandText.replace(EXEC_APPROVAL_INVISIBLE_CHAR_REGEX, formatCodePointEscape), { mode: "tools" });
}
function normalizePreview(commandText, commandPreview) {
  const previewRaw = commandPreview?.trim() ?? "";
  if (!previewRaw) return null;
  const preview = sanitizeExecApprovalDisplayText(previewRaw);
  if (preview === commandText) return null;
  return preview;
}
function resolveExecApprovalCommandDisplay(request) {
  const commandText = sanitizeExecApprovalDisplayText(request.command || (request.host === "node" && request.systemRunPlan ? request.systemRunPlan.commandText : ""));
  return {
    commandText,
    commandPreview: normalizePreview(commandText, request.commandPreview ?? (request.host === "node" ? request.systemRunPlan?.commandPreview ?? null : null))
  };
}
//#endregion /* v9-380854e9598402af */
