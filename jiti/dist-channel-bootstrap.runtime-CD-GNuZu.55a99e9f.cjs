"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resetOutboundChannelBootstrapStateForTests;exports.t = bootstrapOutboundChannelPlugin;var _agentScopeKFH9bkHi = require("./agent-scope-KFH9bkHi.js");
var _pluginAutoEnableBbVfCcz = require("./plugin-auto-enable-BbVfCcz-.js");
var _loaderDYW2PvbF = require("./loader-DYW2PvbF.js");
var _runtimeBB1a2aCy = require("./runtime-BB1a2aCy.js");
//#region src/infra/outbound/channel-bootstrap.runtime.ts
const bootstrapAttempts = /* @__PURE__ */new Set();
function resetOutboundChannelBootstrapStateForTests() {
  bootstrapAttempts.clear();
}
function bootstrapOutboundChannelPlugin(params) {
  const cfg = params.cfg;
  if (!cfg) return;
  if ((0, _runtimeBB1a2aCy.t)()?.channels?.some((entry) => entry?.plugin?.id === params.channel)) return;
  const attemptKey = `${(0, _runtimeBB1a2aCy.n)()}:${params.channel}`;
  if (bootstrapAttempts.has(attemptKey)) return;
  bootstrapAttempts.add(attemptKey);
  const autoEnabled = (0, _pluginAutoEnableBbVfCcz.t)({ config: cfg });
  const defaultAgentId = (0, _agentScopeKFH9bkHi.x)(autoEnabled.config);
  const workspaceDir = (0, _agentScopeKFH9bkHi.b)(autoEnabled.config, defaultAgentId);
  try {
    (0, _loaderDYW2PvbF.a)({
      config: autoEnabled.config,
      activationSourceConfig: cfg,
      autoEnabledReasons: autoEnabled.autoEnabledReasons,
      workspaceDir,
      runtimeOptions: { allowGatewaySubagentBinding: true }
    });
  } catch {
    bootstrapAttempts.delete(attemptKey);
  }
}
//#endregion /* v9-6325cd586742c3e2 */
