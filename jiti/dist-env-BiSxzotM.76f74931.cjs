"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = normalizeZaiEnv;exports.n = logAcceptedEnvOption;exports.r = normalizeEnv;exports.t = isTruthyEnvValue;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
//#region src/infra/env.ts
let log = null;
const loggedEnv = /* @__PURE__ */new Set();
function getLog() {
  if (!log) log = (0, _subsystemCgmckbux.t)("env");
  return log;
}
function formatEnvValue(value, redact) {
  if (redact) return "<redacted>";
  const singleLine = value.replace(/\s+/g, " ").trim();
  if (singleLine.length <= 160) return singleLine;
  return `${singleLine.slice(0, 160)}…`;
}
function logAcceptedEnvOption(option) {
  if (process.env.VITEST || false) return;
  if (loggedEnv.has(option.key)) return;
  const rawValue = option.value ?? process.env[option.key];
  if (!rawValue || !rawValue.trim()) return;
  loggedEnv.add(option.key);
  getLog().info(`env: ${option.key}=${formatEnvValue(rawValue, option.redact)} (${option.description})`);
}
function normalizeZaiEnv() {
  if (!process.env.ZAI_API_KEY?.trim() && process.env.Z_AI_API_KEY?.trim()) process.env.ZAI_API_KEY = process.env.Z_AI_API_KEY;
}
function isTruthyEnvValue(value) {
  if (typeof value !== "string") return false;
  switch ((0, _stringCoerceBUSzWgUA.i)(value)) {
    case "1":
    case "on":
    case "true":
    case "yes":return true;
    default:return false;
  }
}
function normalizeEnv() {
  normalizeZaiEnv();
}
//#endregion /* v9-ce38454e48d796a7 */
