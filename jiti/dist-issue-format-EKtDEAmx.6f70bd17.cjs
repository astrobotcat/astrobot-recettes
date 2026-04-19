"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = normalizeConfigIssues;exports.i = normalizeConfigIssuePath;exports.n = formatConfigIssueLines;exports.r = normalizeConfigIssue;exports.t = formatConfigIssueLine;var _safeTextBfEU6V1V = require("./safe-text-BfEU6V1V.js");
//#region src/config/issue-format.ts
function normalizeConfigIssuePath(path) {
  if (typeof path !== "string") return "<root>";
  const trimmed = path.trim();
  return trimmed ? trimmed : "<root>";
}
function normalizeConfigIssue(issue) {
  const hasAllowedValues = Array.isArray(issue.allowedValues) && issue.allowedValues.length > 0;
  return {
    path: normalizeConfigIssuePath(issue.path),
    message: issue.message,
    ...(hasAllowedValues ? { allowedValues: issue.allowedValues } : {}),
    ...(hasAllowedValues && typeof issue.allowedValuesHiddenCount === "number" && issue.allowedValuesHiddenCount > 0 ? { allowedValuesHiddenCount: issue.allowedValuesHiddenCount } : {})
  };
}
function normalizeConfigIssues(issues) {
  return issues.map((issue) => normalizeConfigIssue(issue));
}
function resolveIssuePathForLine(path, opts) {
  if (opts?.normalizeRoot) return normalizeConfigIssuePath(path);
  return typeof path === "string" ? path : "";
}
function formatConfigIssueLine(issue, marker = "-", opts) {
  return `${marker ? `${marker} ` : ""}${(0, _safeTextBfEU6V1V.t)(resolveIssuePathForLine(issue.path, opts))}: ${(0, _safeTextBfEU6V1V.t)(issue.message)}`;
}
function formatConfigIssueLines(issues, marker = "-", opts) {
  return issues.map((issue) => formatConfigIssueLine(issue, marker, opts));
}
//#endregion /* v9-30c5706fcf38d989 */
