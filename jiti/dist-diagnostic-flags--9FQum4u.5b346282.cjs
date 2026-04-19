"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = matchesDiagnosticFlag;exports.r = resolveDiagnosticFlags;exports.t = isDiagnosticFlagEnabled;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/infra/diagnostic-flags.ts
const DIAGNOSTICS_ENV = "OPENCLAW_DIAGNOSTICS";
function parseEnvFlags(raw) {
  if (!raw) return [];
  const trimmed = raw.trim();
  const lowered = (0, _stringCoerceBUSzWgUA.i)(trimmed);
  if (!lowered) return [];
  if ([
  "0",
  "false",
  "off",
  "none"].
  includes(lowered)) return [];
  if ([
  "1",
  "true",
  "all",
  "*"].
  includes(lowered)) return ["*"];
  return trimmed.split(/[,\s]+/).map((value) => (0, _stringCoerceBUSzWgUA.i)(value)).filter(Boolean);
}
function uniqueFlags(flags) {
  const seen = /* @__PURE__ */new Set();
  const out = [];
  for (const flag of flags) {
    const normalized = (0, _stringCoerceBUSzWgUA.i)(flag);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}
function resolveDiagnosticFlags(cfg, env = process.env) {
  const configFlags = Array.isArray(cfg?.diagnostics?.flags) ? cfg?.diagnostics?.flags : [];
  const envFlags = parseEnvFlags(env[DIAGNOSTICS_ENV]);
  return uniqueFlags([...configFlags, ...envFlags]);
}
function matchesDiagnosticFlag(flag, enabledFlags) {
  const target = (0, _stringCoerceBUSzWgUA.i)(flag);
  if (!target) return false;
  for (const raw of enabledFlags) {
    const enabled = (0, _stringCoerceBUSzWgUA.i)(raw);
    if (!enabled) continue;
    if (enabled === "*" || enabled === "all") return true;
    if (enabled.endsWith(".*")) {
      const prefix = enabled.slice(0, -2);
      if (target === prefix || target.startsWith(`${prefix}.`)) return true;
    }
    if (enabled.endsWith("*")) {
      const prefix = enabled.slice(0, -1);
      if (target.startsWith(prefix)) return true;
    }
    if (enabled === target) return true;
  }
  return false;
}
function isDiagnosticFlagEnabled(flag, cfg, env = process.env) {
  return matchesDiagnosticFlag(flag, resolveDiagnosticFlags(cfg, env));
}
//#endregion /* v9-e51482b60a2248ba */
