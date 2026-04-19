"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = isNativeCommandSurface;exports.c = parseCommandArgs;exports.d = serializeCommandArgs;exports.f = shouldHandleTextCommands;exports.i = isCommandMessage;exports.l = resolveCommandArgChoices;exports.n = buildCommandTextFromArgs;exports.o = listNativeCommandSpecs;exports.r = findCommandByNativeName;exports.s = listNativeCommandSpecsForConfig;exports.t = buildCommandText;exports.u = resolveCommandArgMenu;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _registryDelpa74L = require("./registry-Delpa74L.js");
var _defaultsCiQa3xnX = require("./defaults-CiQa3xnX.js");
require("./plugins-D4ODSIPT.js");
var _modelSelectionCTdyYoio = require("./model-selection-CTdyYoio.js");
var _commandsRegistryDataDyhIRBbT = require("./commands-registry.data-DyhIRBbT.js");
var _commandsRegistryListMHrd1pp = require("./commands-registry-list-MHrd1pp9.js");
var _commandsRegistryNormalizeBy3bcvJy = require("./commands-registry-normalize-By3bcvJy.js");
//#region src/auto-reply/commands-registry.ts
function resolveNativeName(command, provider) {
  if (!command.nativeName) return;
  if (!provider) return command.nativeName;
  return (0, _registryDelpa74L.t)(provider)?.commands?.resolveNativeCommandName?.({
    commandKey: command.key,
    defaultName: command.nativeName
  }) ?? command.nativeName;
}
function toNativeCommandSpec(command, provider) {
  return {
    name: resolveNativeName(command, provider) ?? command.key,
    description: command.description,
    acceptsArgs: Boolean(command.acceptsArgs),
    args: command.args
  };
}
function listNativeSpecsFromCommands(commands, provider) {
  return commands.filter((command) => command.scope !== "text" && command.nativeName).map((command) => toNativeCommandSpec(command, provider));
}
function listNativeCommandSpecs(params) {
  return listNativeSpecsFromCommands((0, _commandsRegistryListMHrd1pp.n)({ skillCommands: params?.skillCommands }), params?.provider);
}
function listNativeCommandSpecsForConfig(cfg, params) {
  return listNativeSpecsFromCommands((0, _commandsRegistryListMHrd1pp.r)(cfg, params), params?.provider);
}
function findCommandByNativeName(name, provider) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(name);
  if (!normalized) return;
  return (0, _commandsRegistryDataDyhIRBbT.t)().find((command) => command.scope !== "text" && (0, _stringCoerceBUSzWgUA.o)(resolveNativeName(command, provider)) === normalized);
}
function buildCommandText(commandName, args) {
  const trimmedArgs = args?.trim();
  return trimmedArgs ? `/${commandName} ${trimmedArgs}` : `/${commandName}`;
}
function parsePositionalArgs(definitions, raw) {
  const values = {};
  const trimmed = raw.trim();
  if (!trimmed) return values;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  let index = 0;
  for (const definition of definitions) {
    if (index >= tokens.length) break;
    if (definition.captureRemaining) {
      values[definition.name] = tokens.slice(index).join(" ");
      index = tokens.length;
      break;
    }
    values[definition.name] = tokens[index];
    index += 1;
  }
  return values;
}
function formatPositionalArgs(definitions, values) {
  const parts = [];
  for (const definition of definitions) {
    const value = values[definition.name];
    if (value == null) continue;
    let rendered;
    if (typeof value === "string") rendered = value.trim();else
    rendered = String(value);
    if (!rendered) continue;
    parts.push(rendered);
    if (definition.captureRemaining) break;
  }
  return parts.length > 0 ? parts.join(" ") : void 0;
}
function parseCommandArgs(command, raw) {
  const trimmed = raw?.trim();
  if (!trimmed) return;
  if (!command.args || command.argsParsing === "none") return { raw: trimmed };
  return {
    raw: trimmed,
    values: parsePositionalArgs(command.args, trimmed)
  };
}
function serializeCommandArgs(command, args) {
  if (!args) return;
  const raw = args.raw?.trim();
  if (raw) return raw;
  if (!args.values || !command.args) return;
  if (command.formatArgs) return command.formatArgs(args.values);
  return formatPositionalArgs(command.args, args.values);
}
function buildCommandTextFromArgs(command, args) {
  return buildCommandText(command.nativeName ?? command.key, serializeCommandArgs(command, args));
}
function resolveDefaultCommandContext(cfg) {
  const resolved = (0, _modelSelectionCTdyYoio.d)({
    cfg: cfg ?? {},
    defaultProvider: _defaultsCiQa3xnX.r,
    defaultModel: _defaultsCiQa3xnX.n
  });
  return {
    provider: resolved.provider ?? "openai",
    model: resolved.model ?? "gpt-5.4"
  };
}
function resolveCommandArgChoices(params) {
  const { command, arg, cfg } = params;
  if (!arg.choices) return [];
  const provided = arg.choices;
  return (Array.isArray(provided) ? provided : (() => {
    const defaults = resolveDefaultCommandContext(cfg);
    return provided({
      cfg,
      provider: params.provider ?? defaults.provider,
      model: params.model ?? defaults.model,
      command,
      arg
    });
  })()).map((choice) => typeof choice === "string" ? {
    value: choice,
    label: choice
  } : choice);
}
function resolveCommandArgMenu(params) {
  const { command, args, cfg } = params;
  if (!command.args || !command.argsMenu) return null;
  if (command.argsParsing === "none") return null;
  const argSpec = command.argsMenu;
  const argName = argSpec === "auto" ? command.args.find((arg) => resolveCommandArgChoices({
    command,
    arg,
    cfg
  }).length > 0)?.name : argSpec.arg;
  if (!argName) return null;
  if (args?.values && args.values[argName] != null) return null;
  if (args?.raw && !args.values) return null;
  const arg = command.args.find((entry) => entry.name === argName);
  if (!arg) return null;
  const choices = resolveCommandArgChoices({
    command,
    arg,
    cfg
  });
  if (choices.length === 0) return null;
  return {
    arg,
    choices,
    title: argSpec !== "auto" ? argSpec.title : void 0
  };
}
function isCommandMessage(raw) {
  return (0, _commandsRegistryNormalizeBy3bcvJy.r)(raw).startsWith("/");
}
function isNativeCommandSurface(surface) {
  if (!surface) return false;
  return (0, _commandsRegistryDataDyhIRBbT.n)().has((0, _stringCoerceBUSzWgUA.i)(surface));
}
function shouldHandleTextCommands(params) {
  if (params.commandSource === "native") return true;
  if (params.cfg.commands?.text !== false) return true;
  return !isNativeCommandSurface(params.surface);
}
//#endregion /* v9-22c982d6f2adcc43 */
