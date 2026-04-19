"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveSkillCommandInvocation;exports.t = listReservedChatSlashCommandNames;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _commandsRegistryDataDyhIRBbT = require("./commands-registry.data-DyhIRBbT.js");
//#region src/auto-reply/skill-commands-base.ts
function listReservedChatSlashCommandNames(extraNames = []) {
  const reserved = /* @__PURE__ */new Set();
  for (const command of (0, _commandsRegistryDataDyhIRBbT.t)()) {
    if (command.nativeName) reserved.add((0, _stringCoerceBUSzWgUA.o)(command.nativeName) ?? "");
    for (const alias of command.textAliases) {
      const trimmed = alias.trim();
      if (!trimmed.startsWith("/")) continue;
      reserved.add((0, _stringCoerceBUSzWgUA.i)(trimmed.slice(1)));
    }
  }
  for (const name of extraNames) {
    const trimmed = (0, _stringCoerceBUSzWgUA.o)(name);
    if (trimmed) reserved.add(trimmed);
  }
  return reserved;
}
function normalizeSkillCommandLookup(value) {
  return ((0, _stringCoerceBUSzWgUA.o)(value) ?? "").replace(/[\s_]+/g, "-");
}
function findSkillCommand(skillCommands, rawName) {
  const trimmed = rawName.trim();
  if (!trimmed) return;
  const lowered = (0, _stringCoerceBUSzWgUA.o)(trimmed) ?? "";
  const normalized = normalizeSkillCommandLookup(trimmed);
  return skillCommands.find((entry) => {
    if ((0, _stringCoerceBUSzWgUA.o)(entry.name) === lowered) return true;
    if ((0, _stringCoerceBUSzWgUA.o)(entry.skillName) === lowered) return true;
    return normalizeSkillCommandLookup(entry.name) === normalized || normalizeSkillCommandLookup(entry.skillName) === normalized;
  });
}
function resolveSkillCommandInvocation(params) {
  const trimmed = params.commandBodyNormalized.trim();
  if (!trimmed.startsWith("/")) return null;
  const match = trimmed.match(/^\/([^\s]+)(?:\s+([\s\S]+))?$/);
  if (!match) return null;
  const commandName = (0, _stringCoerceBUSzWgUA.o)(match[1]);
  if (!commandName) return null;
  if (commandName === "skill") {
    const remainder = match[2]?.trim();
    if (!remainder) return null;
    const skillMatch = remainder.match(/^([^\s]+)(?:\s+([\s\S]+))?$/);
    if (!skillMatch) return null;
    const skillCommand = findSkillCommand(params.skillCommands, skillMatch[1] ?? "");
    if (!skillCommand) return null;
    return {
      command: skillCommand,
      args: skillMatch[2]?.trim() || void 0
    };
  }
  const command = params.skillCommands.find((entry) => (0, _stringCoerceBUSzWgUA.o)(entry.name) === commandName);
  if (!command) return null;
  return {
    command,
    args: match[2]?.trim() || void 0
  };
}
//#endregion /* v9-dd9020491feee1b6 */
