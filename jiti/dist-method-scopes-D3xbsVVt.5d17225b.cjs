"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveLeastPrivilegeOperatorScopesForMethod;exports.d = exports.c = void 0;exports.i = isNodeRoleMethod;exports.l = void 0;exports.n = authorizeOperatorScopesForMethod;exports.o = void 0;exports.r = isAdminOnlyMethod;exports.u = exports.t = exports.s = void 0;var _runtimeState2uqC88Ju = require("./runtime-state-2uqC88Ju.js");
var _gatewayMethodPolicyZYJh0jGf = require("./gateway-method-policy-ZYJh0jGf.js");
//#region src/gateway/operator-scopes.ts
const ADMIN_SCOPE = exports.o = "operator.admin";
const READ_SCOPE = exports.l = "operator.read";
const WRITE_SCOPE = exports.d = "operator.write";
const APPROVALS_SCOPE = exports.s = "operator.approvals";
const PAIRING_SCOPE = exports.c = "operator.pairing";
const TALK_SECRETS_SCOPE = exports.u = "operator.talk.secrets";
//#endregion
//#region src/gateway/method-scopes.ts
const CLI_DEFAULT_OPERATOR_SCOPES = exports.t = [
ADMIN_SCOPE,
READ_SCOPE,
WRITE_SCOPE,
APPROVALS_SCOPE,
PAIRING_SCOPE,
TALK_SECRETS_SCOPE];

const NODE_ROLE_METHODS = new Set([
"node.invoke.result",
"node.event",
"node.pending.drain",
"node.canvas.capability.refresh",
"node.pending.pull",
"node.pending.ack",
"skills.bins"]
);
const METHOD_SCOPE_BY_NAME = new Map(Object.entries({
  [APPROVALS_SCOPE]: [
  "exec.approval.get",
  "exec.approval.list",
  "exec.approval.request",
  "exec.approval.waitDecision",
  "exec.approval.resolve",
  "plugin.approval.list",
  "plugin.approval.request",
  "plugin.approval.waitDecision",
  "plugin.approval.resolve"],

  [PAIRING_SCOPE]: [
  "node.pair.request",
  "node.pair.list",
  "node.pair.reject",
  "node.pair.verify",
  "node.pair.approve",
  "device.pair.list",
  "device.pair.approve",
  "device.pair.reject",
  "device.pair.remove",
  "device.token.rotate",
  "device.token.revoke",
  "node.rename"],

  [READ_SCOPE]: [
  "health",
  "doctor.memory.status",
  "doctor.memory.dreamDiary",
  "logs.tail",
  "channels.status",
  "status",
  "usage.status",
  "usage.cost",
  "tts.status",
  "tts.providers",
  "commands.list",
  "models.list",
  "models.authStatus",
  "tools.catalog",
  "tools.effective",
  "agents.list",
  "agent.identity.get",
  "skills.status",
  "skills.search",
  "skills.detail",
  "voicewake.get",
  "sessions.list",
  "sessions.get",
  "sessions.preview",
  "sessions.resolve",
  "sessions.compaction.list",
  "sessions.compaction.get",
  "sessions.subscribe",
  "sessions.unsubscribe",
  "sessions.messages.subscribe",
  "sessions.messages.unsubscribe",
  "sessions.usage",
  "sessions.usage.timeseries",
  "sessions.usage.logs",
  "cron.list",
  "cron.status",
  "cron.runs",
  "gateway.identity.get",
  "system-presence",
  "last-heartbeat",
  "node.list",
  "node.describe",
  "chat.history",
  "config.get",
  "config.schema.lookup",
  "talk.config",
  "agents.files.list",
  "agents.files.get"],

  [WRITE_SCOPE]: [
  "message.action",
  "send",
  "poll",
  "agent",
  "agent.wait",
  "wake",
  "talk.mode",
  "talk.speak",
  "tts.enable",
  "tts.disable",
  "tts.convert",
  "tts.setProvider",
  "voicewake.set",
  "node.invoke",
  "chat.send",
  "chat.abort",
  "sessions.create",
  "sessions.send",
  "sessions.steer",
  "sessions.abort",
  "sessions.compaction.branch",
  "doctor.memory.backfillDreamDiary",
  "doctor.memory.resetDreamDiary",
  "doctor.memory.resetGroundedShortTerm",
  "doctor.memory.repairDreamingArtifacts",
  "doctor.memory.dedupeDreamDiary",
  "push.test",
  "node.pending.enqueue"],

  [ADMIN_SCOPE]: [
  "channels.logout",
  "agents.create",
  "agents.update",
  "agents.delete",
  "skills.install",
  "skills.update",
  "secrets.reload",
  "secrets.resolve",
  "cron.add",
  "cron.update",
  "cron.remove",
  "cron.run",
  "sessions.patch",
  "sessions.reset",
  "sessions.delete",
  "sessions.compact",
  "sessions.compaction.restore",
  "connect",
  "chat.inject",
  "web.login.start",
  "web.login.wait",
  "set-heartbeats",
  "system-event",
  "agents.files.set"],

  [TALK_SECRETS_SCOPE]: []
}).flatMap(([scope, methods]) => methods.map((method) => [method, scope])));
function resolveScopedMethod(method) {
  const explicitScope = METHOD_SCOPE_BY_NAME.get(method);
  if (explicitScope) return explicitScope;
  const reservedScope = (0, _gatewayMethodPolicyZYJh0jGf.n)(method);
  if (reservedScope) return reservedScope;
  const pluginScope = (0, _runtimeState2uqC88Ju.r)()?.activeRegistry?.gatewayMethodScopes?.[method];
  if (pluginScope) return pluginScope;
}
function isNodeRoleMethod(method) {
  return NODE_ROLE_METHODS.has(method);
}
function isAdminOnlyMethod(method) {
  return resolveScopedMethod(method) === ADMIN_SCOPE;
}
function resolveRequiredOperatorScopeForMethod(method) {
  return resolveScopedMethod(method);
}
function resolveLeastPrivilegeOperatorScopesForMethod(method) {
  const requiredScope = resolveRequiredOperatorScopeForMethod(method);
  if (requiredScope) return [requiredScope];
  return [];
}
function authorizeOperatorScopesForMethod(method, scopes) {
  if (scopes.includes("operator.admin")) return { allowed: true };
  const requiredScope = resolveRequiredOperatorScopeForMethod(method) ?? "operator.admin";
  if (requiredScope === "operator.read") {
    if (scopes.includes("operator.read") || scopes.includes("operator.write")) return { allowed: true };
    return {
      allowed: false,
      missingScope: READ_SCOPE
    };
  }
  if (scopes.includes(requiredScope)) return { allowed: true };
  return {
    allowed: false,
    missingScope: requiredScope
  };
}
//#endregion /* v9-58c4cdcc5fd98355 */
