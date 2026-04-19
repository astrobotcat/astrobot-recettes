"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = void 0;exports.c = clearPluginInteractiveHandlers;exports.d = resolvePluginInteractiveNamespaceMatch;exports.f = claimPluginInteractiveCallbackDedupe;exports.i = void 0;exports.l = clearPluginInteractiveHandlersForPlugin;exports.m = releasePluginInteractiveCallbackDedupe;exports.o = exports.n = void 0;exports.p = commitPluginInteractiveCallbackDedupe;exports.t = exports.s = exports.r = void 0;exports.u = registerPluginInteractiveHandler;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _globalSingletonB80lDOJ = require("./global-singleton-B80lD-oJ.js");
var _dedupeUU1DnJKZ = require("./dedupe-uU1DnJKZ.js");
//#region src/plugins/interactive-shared.ts
function toPluginInteractiveRegistryKey(channel, namespace) {
  return `${(0, _stringCoerceBUSzWgUA.o)(channel) ?? ""}:${namespace.trim()}`;
}
function normalizePluginInteractiveNamespace(namespace) {
  return namespace.trim();
}
function validatePluginInteractiveNamespace(namespace) {
  if (!namespace.trim()) return "Interactive handler namespace cannot be empty";
  if (!/^[A-Za-z0-9._-]+$/.test(namespace.trim())) return "Interactive handler namespace must contain only letters, numbers, dots, underscores, and hyphens";
  return null;
}
function resolvePluginInteractiveMatch(params) {
  const trimmedData = params.data.trim();
  if (!trimmedData) return null;
  const separatorIndex = trimmedData.indexOf(":");
  const namespace = separatorIndex >= 0 ? trimmedData.slice(0, separatorIndex) : normalizePluginInteractiveNamespace(trimmedData);
  const registration = params.interactiveHandlers.get(toPluginInteractiveRegistryKey(params.channel, namespace));
  if (!registration) return null;
  return {
    registration,
    namespace,
    payload: separatorIndex >= 0 ? trimmedData.slice(separatorIndex + 1) : ""
  };
}
//#endregion
//#region src/plugins/interactive-state.ts
const PLUGIN_INTERACTIVE_STATE_KEY = Symbol.for("openclaw.pluginInteractiveState");
function getState() {
  return (0, _globalSingletonB80lDOJ.n)(PLUGIN_INTERACTIVE_STATE_KEY, () => ({
    interactiveHandlers: /* @__PURE__ */new Map(),
    callbackDedupe: (0, _dedupeUU1DnJKZ.n)(Symbol.for("openclaw.pluginInteractiveCallbackDedupe"), {
      ttlMs: 5 * 6e4,
      maxSize: 4096
    }),
    inflightCallbackDedupe: /* @__PURE__ */new Set()
  }));
}
function getPluginInteractiveHandlersState() {
  return getState().interactiveHandlers;
}
function getPluginInteractiveCallbackDedupeState() {
  return getState().callbackDedupe;
}
function claimPluginInteractiveCallbackDedupe(dedupeKey, now = Date.now()) {
  if (!dedupeKey) return true;
  const state = getState();
  if (state.inflightCallbackDedupe.has(dedupeKey) || state.callbackDedupe.peek(dedupeKey, now)) return false;
  state.inflightCallbackDedupe.add(dedupeKey);
  return true;
}
function commitPluginInteractiveCallbackDedupe(dedupeKey, now = Date.now()) {
  if (!dedupeKey) return;
  const state = getState();
  state.inflightCallbackDedupe.delete(dedupeKey);
  state.callbackDedupe.check(dedupeKey, now);
}
function releasePluginInteractiveCallbackDedupe(dedupeKey) {
  if (!dedupeKey) return;
  getState().inflightCallbackDedupe.delete(dedupeKey);
}
function clearPluginInteractiveHandlersState() {
  getPluginInteractiveHandlersState().clear();
  getPluginInteractiveCallbackDedupeState().clear();
  getState().inflightCallbackDedupe.clear();
}
//#endregion
//#region src/plugins/interactive-registry.ts
function resolvePluginInteractiveNamespaceMatch(channel, data) {
  return resolvePluginInteractiveMatch({
    interactiveHandlers: getPluginInteractiveHandlersState(),
    channel,
    data
  });
}
function registerPluginInteractiveHandler(pluginId, registration, opts) {
  const interactiveHandlers = getPluginInteractiveHandlersState();
  const namespace = normalizePluginInteractiveNamespace(registration.namespace);
  const validationError = validatePluginInteractiveNamespace(namespace);
  if (validationError) return {
    ok: false,
    error: validationError
  };
  const key = toPluginInteractiveRegistryKey(registration.channel, namespace);
  const existing = interactiveHandlers.get(key);
  if (existing) return {
    ok: false,
    error: `Interactive handler namespace "${namespace}" already registered by plugin "${existing.pluginId}"`
  };
  interactiveHandlers.set(key, {
    ...registration,
    namespace,
    channel: (0, _stringCoerceBUSzWgUA.o)(registration.channel) ?? "",
    pluginId,
    pluginName: opts?.pluginName,
    pluginRoot: opts?.pluginRoot
  });
  return { ok: true };
}
function clearPluginInteractiveHandlers() {
  clearPluginInteractiveHandlersState();
}
function clearPluginInteractiveHandlersForPlugin(pluginId) {
  const interactiveHandlers = getPluginInteractiveHandlersState();
  for (const [key, value] of interactiveHandlers.entries()) if (value.pluginId === pluginId) interactiveHandlers.delete(key);
}
//#endregion
//#region src/plugins/hook-before-agent-start.types.ts
const PLUGIN_PROMPT_MUTATION_RESULT_FIELDS = exports.o = [
"systemPrompt",
"prependContext",
"prependSystemContext",
"appendSystemContext"];

const stripPromptMutationFieldsFromLegacyHookResult = (result) => {
  if (!result || typeof result !== "object") return result;
  const remaining = { ...result };
  for (const field of PLUGIN_PROMPT_MUTATION_RESULT_FIELDS) delete remaining[field];
  return Object.keys(remaining).length > 0 ? remaining : void 0;
};
//#endregion
//#region src/plugins/hook-types.ts
exports.s = stripPromptMutationFieldsFromLegacyHookResult;const PLUGIN_HOOK_NAMES = exports.t = [
"before_model_resolve",
"before_prompt_build",
"before_agent_start",
"before_agent_reply",
"llm_input",
"llm_output",
"agent_end",
"before_compaction",
"after_compaction",
"before_reset",
"inbound_claim",
"message_received",
"message_sending",
"message_sent",
"before_tool_call",
"after_tool_call",
"tool_result_persist",
"before_message_write",
"session_start",
"session_end",
"subagent_spawning",
"subagent_delivery_target",
"subagent_spawned",
"subagent_ended",
"gateway_start",
"gateway_stop",
"before_dispatch",
"reply_dispatch",
"before_install"];

const pluginHookNameSet = new Set(PLUGIN_HOOK_NAMES);
const isPluginHookName = (hookName) => typeof hookName === "string" && pluginHookNameSet.has(hookName);exports.i = isPluginHookName;
const PROMPT_INJECTION_HOOK_NAMES = exports.n = ["before_prompt_build", "before_agent_start"];
const promptInjectionHookNameSet = new Set(PROMPT_INJECTION_HOOK_NAMES);
const isPromptInjectionHookName = (hookName) => promptInjectionHookNameSet.has(hookName);exports.a = isPromptInjectionHookName;
const PluginApprovalResolutions = exports.r = {
  ALLOW_ONCE: "allow-once",
  ALLOW_ALWAYS: "allow-always",
  DENY: "deny",
  TIMEOUT: "timeout",
  CANCELLED: "cancelled"
};
//#endregion /* v9-c58752b59b6bdd02 */
