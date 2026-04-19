"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _exportNames = { createAgentSession: true, allBuiltInTools: true, bashTool: true, codingTools: true, createBashTool: true, createCodingTools: true, createEditTool: true, createFindTool: true, createGrepTool: true, createLsTool: true, createReadOnlyTools: true, createReadTool: true, createWriteTool: true, editTool: true, findTool: true, grepTool: true, lsTool: true, readOnlyTools: true, readTool: true, withFileMutationQueue: true, writeTool: true };Object.defineProperty(exports, "allBuiltInTools", { enumerable: true, get: function () {return _index.allTools;} });Object.defineProperty(exports, "bashTool", { enumerable: true, get: function () {return _index.bashTool;} });Object.defineProperty(exports, "codingTools", { enumerable: true, get: function () {return _index.codingTools;} });exports.createAgentSession = createAgentSession;Object.defineProperty(exports, "createBashTool", { enumerable: true, get: function () {return _index.createBashTool;} });Object.defineProperty(exports, "createCodingTools", { enumerable: true, get: function () {return _index.createCodingTools;} });Object.defineProperty(exports, "createEditTool", { enumerable: true, get: function () {return _index.createEditTool;} });Object.defineProperty(exports, "createFindTool", { enumerable: true, get: function () {return _index.createFindTool;} });Object.defineProperty(exports, "createGrepTool", { enumerable: true, get: function () {return _index.createGrepTool;} });Object.defineProperty(exports, "createLsTool", { enumerable: true, get: function () {return _index.createLsTool;} });Object.defineProperty(exports, "createReadOnlyTools", { enumerable: true, get: function () {return _index.createReadOnlyTools;} });Object.defineProperty(exports, "createReadTool", { enumerable: true, get: function () {return _index.createReadTool;} });Object.defineProperty(exports, "createWriteTool", { enumerable: true, get: function () {return _index.createWriteTool;} });Object.defineProperty(exports, "editTool", { enumerable: true, get: function () {return _index.editTool;} });Object.defineProperty(exports, "findTool", { enumerable: true, get: function () {return _index.findTool;} });Object.defineProperty(exports, "grepTool", { enumerable: true, get: function () {return _index.grepTool;} });Object.defineProperty(exports, "lsTool", { enumerable: true, get: function () {return _index.lsTool;} });Object.defineProperty(exports, "readOnlyTools", { enumerable: true, get: function () {return _index.readOnlyTools;} });Object.defineProperty(exports, "readTool", { enumerable: true, get: function () {return _index.readTool;} });Object.defineProperty(exports, "withFileMutationQueue", { enumerable: true, get: function () {return _index.withFileMutationQueue;} });Object.defineProperty(exports, "writeTool", { enumerable: true, get: function () {return _index.writeTool;} });var _nodePath = require("node:path");
var _piAgentCore = require("@mariozechner/pi-agent-core");
var _piAi = require("@mariozechner/pi-ai");
var _config = require("../config.js");
var _agentSession = require("./agent-session.js");
var _authStorage = require("./auth-storage.js");
var _defaults = require("./defaults.js");
var _messages = require("./messages.js");
var _modelRegistry = require("./model-registry.js");
var _modelResolver = require("./model-resolver.js");
var _resourceLoader = require("./resource-loader.js");
var _sessionManager = require("./session-manager.js");
var _settingsManager = require("./settings-manager.js");
var _timings = require("./timings.js");
var _index = require("./tools/index.js");

var _agentSessionRuntime = require("./agent-session-runtime.js");Object.keys(_agentSessionRuntime).forEach(function (key) {if (key === "default" || key === "__esModule") return;if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;if (key in exports && exports[key] === _agentSessionRuntime[key]) return;Object.defineProperty(exports, key, { enumerable: true, get: function () {return _agentSessionRuntime[key];} });}); // Re-exports





// Helper Functions
function getDefaultAgentDir() {
  return (0, _config.getAgentDir)();
}
/**
 * Create an AgentSession with the specified options.
 *
 * @example
 * ```typescript
 * // Minimal - uses defaults
 * const { session } = await createAgentSession();
 *
 * // With explicit model
 * import { getModel } from '@mariozechner/pi-ai';
 * const { session } = await createAgentSession({
 *   model: getModel('anthropic', 'claude-opus-4-5'),
 *   thinkingLevel: 'high',
 * });
 *
 * // Continue previous session
 * const { session, modelFallbackMessage } = await createAgentSession({
 *   continueSession: true,
 * });
 *
 * // Full control
 * const loader = new DefaultResourceLoader({
 *   cwd: process.cwd(),
 *   agentDir: getAgentDir(),
 *   settingsManager: SettingsManager.create(),
 * });
 * await loader.reload();
 * const { session } = await createAgentSession({
 *   model: myModel,
 *   tools: [readTool, bashTool],
 *   resourceLoader: loader,
 *   sessionManager: SessionManager.inMemory(),
 * });
 * ```
 */
async function createAgentSession(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const agentDir = options.agentDir ?? getDefaultAgentDir();
  let resourceLoader = options.resourceLoader;
  // Use provided or create AuthStorage and ModelRegistry
  const authPath = options.agentDir ? (0, _nodePath.join)(agentDir, "auth.json") : undefined;
  const modelsPath = options.agentDir ? (0, _nodePath.join)(agentDir, "models.json") : undefined;
  const authStorage = options.authStorage ?? _authStorage.AuthStorage.create(authPath);
  const modelRegistry = options.modelRegistry ?? _modelRegistry.ModelRegistry.create(authStorage, modelsPath);
  const settingsManager = options.settingsManager ?? _settingsManager.SettingsManager.create(cwd, agentDir);
  const sessionManager = options.sessionManager ?? _sessionManager.SessionManager.create(cwd, (0, _sessionManager.getDefaultSessionDir)(cwd, agentDir));
  if (!resourceLoader) {
    resourceLoader = new _resourceLoader.DefaultResourceLoader({ cwd, agentDir, settingsManager });
    await resourceLoader.reload();
    (0, _timings.time)("resourceLoader.reload");
  }
  // Check if session has existing data to restore
  const existingSession = sessionManager.buildSessionContext();
  const hasExistingSession = existingSession.messages.length > 0;
  const hasThinkingEntry = sessionManager.getBranch().some((entry) => entry.type === "thinking_level_change");
  let model = options.model;
  let modelFallbackMessage;
  // If session has data, try to restore model from it
  if (!model && hasExistingSession && existingSession.model) {
    const restoredModel = modelRegistry.find(existingSession.model.provider, existingSession.model.modelId);
    if (restoredModel && modelRegistry.hasConfiguredAuth(restoredModel)) {
      model = restoredModel;
    }
    if (!model) {
      modelFallbackMessage = `Could not restore model ${existingSession.model.provider}/${existingSession.model.modelId}`;
    }
  }
  // If still no model, use findInitialModel (checks settings default, then provider defaults)
  if (!model) {
    const result = await (0, _modelResolver.findInitialModel)({
      scopedModels: [],
      isContinuing: hasExistingSession,
      defaultProvider: settingsManager.getDefaultProvider(),
      defaultModelId: settingsManager.getDefaultModel(),
      defaultThinkingLevel: settingsManager.getDefaultThinkingLevel(),
      modelRegistry
    });
    model = result.model;
    if (!model) {
      modelFallbackMessage = `No models available. Use /login or set an API key environment variable. See ${(0, _nodePath.join)((0, _config.getDocsPath)(), "providers.md")}. Then use /model to select a model.`;
    } else
    if (modelFallbackMessage) {
      modelFallbackMessage += `. Using ${model.provider}/${model.id}`;
    }
  }
  let thinkingLevel = options.thinkingLevel;
  // If session has data, restore thinking level from it
  if (thinkingLevel === undefined && hasExistingSession) {
    thinkingLevel = hasThinkingEntry ?
    existingSession.thinkingLevel :
    settingsManager.getDefaultThinkingLevel() ?? _defaults.DEFAULT_THINKING_LEVEL;
  }
  // Fall back to settings default
  if (thinkingLevel === undefined) {
    thinkingLevel = settingsManager.getDefaultThinkingLevel() ?? _defaults.DEFAULT_THINKING_LEVEL;
  }
  // Clamp to model capabilities
  if (!model || !model.reasoning) {
    thinkingLevel = "off";
  }
  const defaultActiveToolNames = ["read", "bash", "edit", "write"];
  const initialActiveToolNames = options.tools ?
  options.tools.map((t) => t.name).filter((n) => n in _index.allTools) :
  defaultActiveToolNames;
  let agent;
  // Create convertToLlm wrapper that filters images if blockImages is enabled (defense-in-depth)
  const convertToLlmWithBlockImages = (messages) => {
    const converted = (0, _messages.convertToLlm)(messages);
    // Check setting dynamically so mid-session changes take effect
    if (!settingsManager.getBlockImages()) {
      return converted;
    }
    // Filter out ImageContent from all messages, replacing with text placeholder
    return converted.map((msg) => {
      if (msg.role === "user" || msg.role === "toolResult") {
        const content = msg.content;
        if (Array.isArray(content)) {
          const hasImages = content.some((c) => c.type === "image");
          if (hasImages) {
            const filteredContent = content.
            map((c) => c.type === "image" ? { type: "text", text: "Image reading is disabled." } : c).
            filter((c, i, arr) =>
            // Dedupe consecutive "Image reading is disabled." texts
            !(c.type === "text" &&
            c.text === "Image reading is disabled." &&
            i > 0 &&
            arr[i - 1].type === "text" &&
            arr[i - 1].text === "Image reading is disabled."));
            return { ...msg, content: filteredContent };
          }
        }
      }
      return msg;
    });
  };
  const extensionRunnerRef = {};
  agent = new _piAgentCore.Agent({
    initialState: {
      systemPrompt: "",
      model,
      thinkingLevel,
      tools: []
    },
    convertToLlm: convertToLlmWithBlockImages,
    streamFn: async (model, context, options) => {
      const auth = await modelRegistry.getApiKeyAndHeaders(model);
      if (!auth.ok) {
        throw new Error(auth.error);
      }
      return (0, _piAi.streamSimple)(model, context, {
        ...options,
        apiKey: auth.apiKey,
        headers: auth.headers || options?.headers ? { ...auth.headers, ...options?.headers } : undefined
      });
    },
    onPayload: async (payload, _model) => {
      const runner = extensionRunnerRef.current;
      if (!runner?.hasHandlers("before_provider_request")) {
        return payload;
      }
      return runner.emitBeforeProviderRequest(payload);
    },
    sessionId: sessionManager.getSessionId(),
    transformContext: async (messages) => {
      const runner = extensionRunnerRef.current;
      if (!runner)
      return messages;
      return runner.emitContext(messages);
    },
    steeringMode: settingsManager.getSteeringMode(),
    followUpMode: settingsManager.getFollowUpMode(),
    transport: settingsManager.getTransport(),
    thinkingBudgets: settingsManager.getThinkingBudgets(),
    maxRetryDelayMs: settingsManager.getRetrySettings().maxDelayMs
  });
  // Restore messages if session has existing data
  if (hasExistingSession) {
    agent.state.messages = existingSession.messages;
    if (!hasThinkingEntry) {
      sessionManager.appendThinkingLevelChange(thinkingLevel);
    }
  } else
  {
    // Save initial model and thinking level for new sessions so they can be restored on resume
    if (model) {
      sessionManager.appendModelChange(model.provider, model.id);
    }
    sessionManager.appendThinkingLevelChange(thinkingLevel);
  }
  const session = new _agentSession.AgentSession({
    agent,
    sessionManager,
    settingsManager,
    cwd,
    scopedModels: options.scopedModels,
    resourceLoader,
    customTools: options.customTools,
    modelRegistry,
    initialActiveToolNames,
    extensionRunnerRef,
    sessionStartEvent: options.sessionStartEvent
  });
  const extensionsResult = resourceLoader.getExtensions();
  return {
    session,
    extensionsResult,
    modelFallbackMessage
  };
} /* v9-56683df683ce6ac8 */
