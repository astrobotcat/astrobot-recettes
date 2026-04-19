"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveTextCommand;exports.n = maybeResolveTextAlias;exports.r = normalizeCommandBody;exports.t = getCommandDetection;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _commandsRegistryDataDyhIRBbT = require("./commands-registry.data-DyhIRBbT.js");
//#region src/auto-reply/commands-registry-normalize.ts
let cachedTextAliasMap = null;
let cachedTextAliasCommands = null;
let cachedDetection;
let cachedDetectionCommands = null;
function getTextAliasMap() {
  const commands = (0, _commandsRegistryDataDyhIRBbT.t)();
  if (cachedTextAliasMap && cachedTextAliasCommands === commands) return cachedTextAliasMap;
  const map = /* @__PURE__ */new Map();
  for (const command of commands) {
    const canonical = (0, _stringCoerceBUSzWgUA.s)(command.textAliases[0]) || `/${command.key}`;
    const acceptsArgs = Boolean(command.acceptsArgs);
    for (const alias of command.textAliases) {
      const normalized = (0, _stringCoerceBUSzWgUA.o)(alias);
      if (!normalized) continue;
      if (!map.has(normalized)) map.set(normalized, {
        key: command.key,
        canonical,
        acceptsArgs
      });
    }
  }
  cachedTextAliasMap = map;
  cachedTextAliasCommands = commands;
  return map;
}
function normalizeCommandBody(raw, options) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/")) return trimmed;
  const newline = trimmed.indexOf("\n");
  const singleLine = newline === -1 ? trimmed : trimmed.slice(0, newline).trim();
  const colonMatch = singleLine.match(/^\/([^\s:]+)\s*:(.*)$/);
  const normalized = colonMatch ? (() => {
    const [, command, rest] = colonMatch;
    const normalizedRest = rest.trimStart();
    return normalizedRest ? `/${command} ${normalizedRest}` : `/${command}`;
  })() : singleLine;
  const normalizedBotUsername = (0, _stringCoerceBUSzWgUA.o)(options?.botUsername);
  const mentionMatch = normalizedBotUsername ? normalized.match(/^\/([^\s@]+)@([^\s]+)(.*)$/) : null;
  const commandBody = mentionMatch && (0, _stringCoerceBUSzWgUA.i)(mentionMatch[2]) === normalizedBotUsername ? `/${mentionMatch[1]}${mentionMatch[3] ?? ""}` : normalized;
  const lowered = (0, _stringCoerceBUSzWgUA.i)(commandBody);
  const textAliasMap = getTextAliasMap();
  const exact = textAliasMap.get(lowered);
  if (exact) return exact.canonical;
  const tokenMatch = commandBody.match(/^\/([^\s]+)(?:\s+([\s\S]+))?$/);
  if (!tokenMatch) return commandBody;
  const [, token, rest] = tokenMatch;
  const tokenKey = `/${(0, _stringCoerceBUSzWgUA.i)(token)}`;
  const tokenSpec = textAliasMap.get(tokenKey);
  if (!tokenSpec) return commandBody;
  if (rest && !tokenSpec.acceptsArgs) return commandBody;
  const normalizedRest = rest?.trimStart();
  return normalizedRest ? `${tokenSpec.canonical} ${normalizedRest}` : tokenSpec.canonical;
}
function getCommandDetection(_cfg) {
  const commands = (0, _commandsRegistryDataDyhIRBbT.t)();
  if (cachedDetection && cachedDetectionCommands === commands) return cachedDetection;
  const exact = /* @__PURE__ */new Set();
  const patterns = [];
  for (const cmd of commands) for (const alias of cmd.textAliases) {
    const normalized = (0, _stringCoerceBUSzWgUA.o)(alias);
    if (!normalized) continue;
    exact.add(normalized);
    const escaped = (0, _utilsD5DtWkEu.c)(normalized);
    if (!escaped) continue;
    if (cmd.acceptsArgs) patterns.push(`${escaped}(?:\\s+.+|\\s*:\\s*.*)?`);else
    patterns.push(`${escaped}(?:\\s*:\\s*)?`);
  }
  cachedDetection = {
    exact,
    regex: patterns.length ? new RegExp(`^(?:${patterns.join("|")})$`, "i") : /$^/
  };
  cachedDetectionCommands = commands;
  return cachedDetection;
}
function maybeResolveTextAlias(raw, cfg) {
  const trimmed = normalizeCommandBody(raw).trim();
  if (!trimmed.startsWith("/")) return null;
  const detection = getCommandDetection(cfg);
  const normalized = (0, _stringCoerceBUSzWgUA.i)(trimmed);
  if (detection.exact.has(normalized)) return normalized;
  if (!detection.regex.test(normalized)) return null;
  const tokenMatch = normalized.match(/^\/([^\s:]+)(?:\s|$)/);
  if (!tokenMatch) return null;
  const tokenKey = `/${tokenMatch[1]}`;
  return getTextAliasMap().has(tokenKey) ? tokenKey : null;
}
function resolveTextCommand(raw, cfg) {
  const trimmed = normalizeCommandBody(raw).trim();
  const alias = maybeResolveTextAlias(trimmed, cfg);
  if (!alias) return null;
  const spec = getTextAliasMap().get(alias);
  if (!spec) return null;
  const command = (0, _commandsRegistryDataDyhIRBbT.t)().find((entry) => entry.key === spec.key);
  if (!command) return null;
  if (!spec.acceptsArgs) return { command };
  return {
    command,
    args: trimmed.slice(alias.length).trim() || void 0
  };
}
//#endregion /* v9-1f0a18268d081e00 */
