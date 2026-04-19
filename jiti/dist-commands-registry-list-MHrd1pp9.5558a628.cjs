"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = listChatCommands;exports.r = listChatCommandsForConfig;exports.t = isCommandEnabled;var _commandsFlagsDTSeDvkD = require("./commands.flags-DTSeDvkD.js");
var _commandsRegistryDataDyhIRBbT = require("./commands-registry.data-DyhIRBbT.js");
//#region src/auto-reply/commands-registry-list.ts
function buildSkillCommandDefinitions(skillCommands) {
  if (!skillCommands || skillCommands.length === 0) return [];
  return skillCommands.map((spec) => ({
    key: `skill:${spec.skillName}`,
    nativeName: spec.name,
    description: spec.description,
    textAliases: [`/${spec.name}`],
    acceptsArgs: true,
    argsParsing: "none",
    scope: "both",
    category: "tools"
  }));
}
function listChatCommands(params) {
  const commands = (0, _commandsRegistryDataDyhIRBbT.t)();
  if (!params?.skillCommands?.length) return [...commands];
  return [...commands, ...buildSkillCommandDefinitions(params.skillCommands)];
}
function isCommandEnabled(cfg, commandKey) {
  if (commandKey === "config") return (0, _commandsFlagsDTSeDvkD.t)(cfg, "config");
  if (commandKey === "mcp") return (0, _commandsFlagsDTSeDvkD.t)(cfg, "mcp");
  if (commandKey === "plugins") return (0, _commandsFlagsDTSeDvkD.t)(cfg, "plugins");
  if (commandKey === "debug") return (0, _commandsFlagsDTSeDvkD.t)(cfg, "debug");
  if (commandKey === "bash") return (0, _commandsFlagsDTSeDvkD.t)(cfg, "bash");
  return true;
}
function listChatCommandsForConfig(cfg, params) {
  const base = (0, _commandsRegistryDataDyhIRBbT.t)().filter((command) => isCommandEnabled(cfg, command.key));
  if (!params?.skillCommands?.length) return base;
  return [...base, ...buildSkillCommandDefinitions(params.skillCommands)];
}
//#endregion /* v9-d9c9aaec9c4c84dd */
