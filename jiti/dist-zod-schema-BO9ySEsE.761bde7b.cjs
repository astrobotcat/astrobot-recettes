"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = parseNonNegativeByteSize;exports.r = parseByteSize;exports.t = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _zodSchemaCoreCYrn8zgQ = require("./zod-schema.core-CYrn8zgQ.js");
var _zodSchemaSensitiveDiSy9JX = require("./zod-schema.sensitive-DiSy9JX7.js");
var _bundledPluginMetadataDaMNAHv = require("./bundled-plugin-metadata-Da-MNAHv.js");
var _sdkAliasW29OTN9p = require("./sdk-alias-w29OTN9p.js");
var _parseDurationDHL2gXIv = require("./parse-duration-DHL2gXIv.js");
var _zodSchemaAgentRuntimeBSPBF_O_ = require("./zod-schema.agent-runtime-BSPBF_O_.js");
var _zodSchemaProvidersCoreBxvvQH1c = require("./zod-schema.providers-core-BxvvQH1c.js");
require("./zod-schema.providers-whatsapp-BjpAcO8v.js");
var _nodeUrl = require("node:url");
var _nodePath = _interopRequireDefault(require("node:path"));
var _zod = require("zod");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/cli/parse-bytes.ts
const UNIT_MULTIPLIERS = {
  b: 1,
  kb: 1024,
  k: 1024,
  mb: 1024 ** 2,
  m: 1024 ** 2,
  gb: 1024 ** 3,
  g: 1024 ** 3,
  tb: 1024 ** 4,
  t: 1024 ** 4
};
function parseByteSize(raw, opts) {
  const trimmed = (0, _stringCoerceBUSzWgUA.i)((0, _stringCoerceBUSzWgUA.s)(raw) ?? "");
  if (!trimmed) throw new Error("invalid byte size (empty)");
  const m = /^(\d+(?:\.\d+)?)([a-z]+)?$/.exec(trimmed);
  if (!m) throw new Error(`invalid byte size: ${raw}`);
  const value = Number(m[1]);
  if (!Number.isFinite(value) || value < 0) throw new Error(`invalid byte size: ${raw}`);
  const multiplier = UNIT_MULTIPLIERS[(0, _stringCoerceBUSzWgUA.i)(m[2] ?? opts?.defaultUnit ?? "b")];
  if (!multiplier) throw new Error(`invalid byte size unit: ${raw}`);
  const bytes = Math.round(value * multiplier);
  if (!Number.isFinite(bytes)) throw new Error(`invalid byte size: ${raw}`);
  return bytes;
}
//#endregion
//#region src/config/byte-size.ts
/**
* Parse an optional byte-size value from config.
* Accepts non-negative numbers or strings like "2mb".
*/
function parseNonNegativeByteSize(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const int = Math.floor(value);
    return int >= 0 ? int : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const bytes = parseByteSize(trimmed, { defaultUnit: "b" });
      return bytes >= 0 ? bytes : null;
    } catch {
      return null;
    }
  }
  return null;
}
function isValidNonNegativeByteSizeString(value) {
  return parseNonNegativeByteSize(value) !== null;
}
//#endregion
//#region src/config/zod-schema.agent-defaults.ts
const AgentDefaultsSchema = _zod.z.object({
  params: _zod.z.record(_zod.z.string(), _zod.z.unknown()).optional(),
  embeddedHarness: _zodSchemaAgentRuntimeBSPBF_O_.n,
  model: _zodSchemaAgentRuntimeBSPBF_O_.u.optional(),
  imageModel: _zodSchemaAgentRuntimeBSPBF_O_.u.optional(),
  imageGenerationModel: _zodSchemaAgentRuntimeBSPBF_O_.u.optional(),
  videoGenerationModel: _zodSchemaAgentRuntimeBSPBF_O_.u.optional(),
  musicGenerationModel: _zodSchemaAgentRuntimeBSPBF_O_.u.optional(),
  mediaGenerationAutoProviderFallback: _zod.z.boolean().optional(),
  pdfModel: _zodSchemaAgentRuntimeBSPBF_O_.u.optional(),
  pdfMaxBytesMb: _zod.z.number().positive().optional(),
  pdfMaxPages: _zod.z.number().int().positive().optional(),
  models: _zod.z.record(_zod.z.string(), _zod.z.object({
    alias: _zod.z.string().optional(),
    params: _zod.z.record(_zod.z.string(), _zod.z.unknown()).optional(),
    streaming: _zod.z.boolean().optional()
  }).strict()).optional(),
  workspace: _zod.z.string().optional(),
  skills: _zod.z.array(_zod.z.string()).optional(),
  repoRoot: _zod.z.string().optional(),
  systemPromptOverride: _zod.z.string().optional(),
  skipBootstrap: _zod.z.boolean().optional(),
  contextInjection: _zod.z.union([_zod.z.literal("always"), _zod.z.literal("continuation-skip")]).optional(),
  bootstrapMaxChars: _zod.z.number().int().positive().optional(),
  bootstrapTotalMaxChars: _zod.z.number().int().positive().optional(),
  experimental: _zod.z.object({ localModelLean: _zod.z.boolean().optional() }).strict().optional(),
  bootstrapPromptTruncationWarning: _zod.z.union([
  _zod.z.literal("off"),
  _zod.z.literal("once"),
  _zod.z.literal("always")]
  ).optional(),
  userTimezone: _zod.z.string().optional(),
  startupContext: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    applyOn: _zod.z.array(_zod.z.union([_zod.z.literal("new"), _zod.z.literal("reset")])).optional(),
    dailyMemoryDays: _zod.z.number().int().min(1).max(14).optional(),
    maxFileBytes: _zod.z.number().int().min(1).max(64 * 1024).optional(),
    maxFileChars: _zod.z.number().int().min(1).max(1e4).optional(),
    maxTotalChars: _zod.z.number().int().min(1).max(5e4).optional()
  }).strict().optional(),
  contextLimits: _zodSchemaAgentRuntimeBSPBF_O_.t,
  timeFormat: _zod.z.union([
  _zod.z.literal("auto"),
  _zod.z.literal("12"),
  _zod.z.literal("24")]
  ).optional(),
  envelopeTimezone: _zod.z.string().optional(),
  envelopeTimestamp: _zod.z.union([_zod.z.literal("on"), _zod.z.literal("off")]).optional(),
  envelopeElapsed: _zod.z.union([_zod.z.literal("on"), _zod.z.literal("off")]).optional(),
  contextTokens: _zod.z.number().int().positive().optional(),
  cliBackends: _zod.z.record(_zod.z.string(), _zodSchemaCoreCYrn8zgQ.r).optional(),
  memorySearch: _zodSchemaAgentRuntimeBSPBF_O_.s,
  contextPruning: _zod.z.object({
    mode: _zod.z.union([_zod.z.literal("off"), _zod.z.literal("cache-ttl")]).optional(),
    ttl: _zod.z.string().optional(),
    keepLastAssistants: _zod.z.number().int().nonnegative().optional(),
    softTrimRatio: _zod.z.number().min(0).max(1).optional(),
    hardClearRatio: _zod.z.number().min(0).max(1).optional(),
    minPrunableToolChars: _zod.z.number().int().nonnegative().optional(),
    tools: _zod.z.object({
      allow: _zod.z.array(_zod.z.string()).optional(),
      deny: _zod.z.array(_zod.z.string()).optional()
    }).strict().optional(),
    softTrim: _zod.z.object({
      maxChars: _zod.z.number().int().nonnegative().optional(),
      headChars: _zod.z.number().int().nonnegative().optional(),
      tailChars: _zod.z.number().int().nonnegative().optional()
    }).strict().optional(),
    hardClear: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      placeholder: _zod.z.string().optional()
    }).strict().optional()
  }).strict().optional(),
  llm: _zod.z.object({ idleTimeoutSeconds: _zod.z.number().int().nonnegative().optional().describe(`Idle timeout for LLM streaming responses in seconds. If no token is received within this time, the request is aborted. Set to 0 to disable. Default: 120 seconds.`) }).strict().optional(),
  compaction: _zod.z.object({
    mode: _zod.z.union([_zod.z.literal("default"), _zod.z.literal("safeguard")]).optional(),
    provider: _zod.z.string().optional(),
    reserveTokens: _zod.z.number().int().nonnegative().optional(),
    keepRecentTokens: _zod.z.number().int().positive().optional(),
    reserveTokensFloor: _zod.z.number().int().nonnegative().optional(),
    maxHistoryShare: _zod.z.number().min(.1).max(.9).optional(),
    customInstructions: _zod.z.string().optional(),
    identifierPolicy: _zod.z.union([
    _zod.z.literal("strict"),
    _zod.z.literal("off"),
    _zod.z.literal("custom")]
    ).optional(),
    identifierInstructions: _zod.z.string().optional(),
    recentTurnsPreserve: _zod.z.number().int().min(0).max(12).optional(),
    qualityGuard: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      maxRetries: _zod.z.number().int().nonnegative().optional()
    }).strict().optional(),
    postIndexSync: _zod.z.enum([
    "off",
    "async",
    "await"]
    ).optional(),
    postCompactionSections: _zod.z.array(_zod.z.string()).optional(),
    model: _zod.z.string().optional(),
    timeoutSeconds: _zod.z.number().int().positive().optional(),
    memoryFlush: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      softThresholdTokens: _zod.z.number().int().nonnegative().optional(),
      forceFlushTranscriptBytes: _zod.z.union([_zod.z.number().int().nonnegative(), _zod.z.string().refine(isValidNonNegativeByteSizeString, "Expected byte size string like 2mb")]).optional(),
      prompt: _zod.z.string().optional(),
      systemPrompt: _zod.z.string().optional()
    }).strict().optional(),
    notifyUser: _zod.z.boolean().optional()
  }).strict().optional(),
  embeddedPi: _zod.z.object({
    projectSettingsPolicy: _zod.z.union([
    _zod.z.literal("trusted"),
    _zod.z.literal("sanitize"),
    _zod.z.literal("ignore")]
    ).optional(),
    executionContract: _zod.z.union([_zod.z.literal("default"), _zod.z.literal("strict-agentic")]).optional()
  }).strict().optional(),
  thinkingDefault: _zod.z.union([
  _zod.z.literal("off"),
  _zod.z.literal("minimal"),
  _zod.z.literal("low"),
  _zod.z.literal("medium"),
  _zod.z.literal("high"),
  _zod.z.literal("xhigh"),
  _zod.z.literal("adaptive")]
  ).optional(),
  verboseDefault: _zod.z.union([
  _zod.z.literal("off"),
  _zod.z.literal("on"),
  _zod.z.literal("full")]
  ).optional(),
  elevatedDefault: _zod.z.union([
  _zod.z.literal("off"),
  _zod.z.literal("on"),
  _zod.z.literal("ask"),
  _zod.z.literal("full")]
  ).optional(),
  blockStreamingDefault: _zod.z.union([_zod.z.literal("off"), _zod.z.literal("on")]).optional(),
  blockStreamingBreak: _zod.z.union([_zod.z.literal("text_end"), _zod.z.literal("message_end")]).optional(),
  blockStreamingChunk: _zodSchemaCoreCYrn8zgQ.t.optional(),
  blockStreamingCoalesce: _zodSchemaCoreCYrn8zgQ.n.optional(),
  humanDelay: _zodSchemaCoreCYrn8zgQ.d.optional(),
  timeoutSeconds: _zod.z.number().int().positive().optional(),
  mediaMaxMb: _zod.z.number().positive().optional(),
  imageMaxDimensionPx: _zod.z.number().int().positive().optional(),
  typingIntervalSeconds: _zod.z.number().int().positive().optional(),
  typingMode: _zodSchemaCoreCYrn8zgQ.P.optional(),
  heartbeat: _zodSchemaAgentRuntimeBSPBF_O_.o,
  maxConcurrent: _zod.z.number().int().positive().optional(),
  subagents: _zod.z.object({
    allowAgents: _zod.z.array(_zod.z.string()).optional(),
    maxConcurrent: _zod.z.number().int().positive().optional(),
    maxSpawnDepth: _zod.z.number().int().min(1).max(5).optional().describe("Maximum nesting depth for sub-agent spawning. 1 = no nesting (default), 2 = sub-agents can spawn sub-sub-agents."),
    maxChildrenPerAgent: _zod.z.number().int().min(1).max(20).optional().describe("Maximum number of active children a single agent session can spawn (default: 5)."),
    archiveAfterMinutes: _zod.z.number().int().min(0).optional(),
    model: _zodSchemaAgentRuntimeBSPBF_O_.u.optional(),
    thinking: _zod.z.string().optional(),
    runTimeoutSeconds: _zod.z.number().int().min(0).optional(),
    announceTimeoutMs: _zod.z.number().int().positive().optional(),
    requireAgentId: _zod.z.boolean().optional()
  }).strict().optional(),
  sandbox: _zodSchemaAgentRuntimeBSPBF_O_.i
}).strict().optional();
//#endregion
//#region src/config/zod-schema.agents.ts
const AgentsSchema = _zod.z.object({
  defaults: _zod.z.lazy(() => AgentDefaultsSchema).optional(),
  list: _zod.z.array(_zodSchemaAgentRuntimeBSPBF_O_.r).optional()
}).strict().optional();
const BindingMatchSchema = _zod.z.object({
  channel: _zod.z.string(),
  accountId: _zod.z.string().optional(),
  peer: _zod.z.object({
    kind: _zod.z.union([
    _zod.z.literal("direct"),
    _zod.z.literal("group"),
    _zod.z.literal("channel"),
    _zod.z.literal("dm")]
    ),
    id: _zod.z.string()
  }).strict().optional(),
  guildId: _zod.z.string().optional(),
  teamId: _zod.z.string().optional(),
  roles: _zod.z.array(_zod.z.string()).optional()
}).strict();
const RouteBindingSchema = _zod.z.object({
  type: _zod.z.literal("route").optional(),
  agentId: _zod.z.string(),
  comment: _zod.z.string().optional(),
  match: BindingMatchSchema
}).strict();
const AcpBindingSchema = _zod.z.object({
  type: _zod.z.literal("acp"),
  agentId: _zod.z.string(),
  comment: _zod.z.string().optional(),
  match: BindingMatchSchema,
  acp: _zod.z.object({
    mode: _zod.z.enum(["persistent", "oneshot"]).optional(),
    label: _zod.z.string().optional(),
    cwd: _zod.z.string().optional(),
    backend: _zod.z.string().optional()
  }).strict().optional()
}).strict().superRefine((value, ctx) => {
  if (!((0, _stringCoerceBUSzWgUA.s)(value.match.peer?.id) ?? "")) {
    ctx.addIssue({
      code: _zod.z.ZodIssueCode.custom,
      path: ["match", "peer"],
      message: "ACP bindings require match.peer.id to target a concrete conversation."
    });
    return;
  }
});
const BindingsSchema = _zod.z.array(_zod.z.union([RouteBindingSchema, AcpBindingSchema])).optional();
const BroadcastStrategySchema = _zod.z.enum(["parallel", "sequential"]);
const BroadcastSchema = _zod.z.object({ strategy: BroadcastStrategySchema.optional() }).catchall(_zod.z.array(_zod.z.string())).optional();
const AudioSchema = _zod.z.object({ transcription: _zodSchemaCoreCYrn8zgQ.k }).strict().optional();
//#endregion
//#region src/config/zod-schema.approvals.ts
const ExecApprovalForwardTargetSchema = _zod.z.object({
  channel: _zod.z.string().min(1),
  to: _zod.z.string().min(1),
  accountId: _zod.z.string().optional(),
  threadId: _zod.z.union([_zod.z.string(), _zod.z.number()]).optional()
}).strict();
const ExecApprovalForwardingSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  mode: _zod.z.union([
  _zod.z.literal("session"),
  _zod.z.literal("targets"),
  _zod.z.literal("both")]
  ).optional(),
  agentFilter: _zod.z.array(_zod.z.string()).optional(),
  sessionFilter: _zod.z.array(_zod.z.string()).optional(),
  targets: _zod.z.array(ExecApprovalForwardTargetSchema).optional()
}).strict().optional();
const ApprovalsSchema = _zod.z.object({
  exec: ExecApprovalForwardingSchema,
  plugin: ExecApprovalForwardingSchema
}).strict().optional();
//#endregion
//#region src/config/zod-schema.installs.ts
const InstallSourceSchema = _zod.z.union([
_zod.z.literal("npm"),
_zod.z.literal("archive"),
_zod.z.literal("path"),
_zod.z.literal("clawhub")]
);
const PluginInstallSourceSchema = _zod.z.union([InstallSourceSchema, _zod.z.literal("marketplace")]);
const InstallRecordShape = {
  source: InstallSourceSchema,
  spec: _zod.z.string().optional(),
  sourcePath: _zod.z.string().optional(),
  installPath: _zod.z.string().optional(),
  version: _zod.z.string().optional(),
  resolvedName: _zod.z.string().optional(),
  resolvedVersion: _zod.z.string().optional(),
  resolvedSpec: _zod.z.string().optional(),
  integrity: _zod.z.string().optional(),
  shasum: _zod.z.string().optional(),
  resolvedAt: _zod.z.string().optional(),
  installedAt: _zod.z.string().optional(),
  clawhubUrl: _zod.z.string().optional(),
  clawhubPackage: _zod.z.string().optional(),
  clawhubFamily: _zod.z.union([_zod.z.literal("code-plugin"), _zod.z.literal("bundle-plugin")]).optional(),
  clawhubChannel: _zod.z.union([
  _zod.z.literal("official"),
  _zod.z.literal("community"),
  _zod.z.literal("private")]
  ).optional()
};
const PluginInstallRecordShape = {
  ...InstallRecordShape,
  source: PluginInstallSourceSchema,
  marketplaceName: _zod.z.string().optional(),
  marketplaceSource: _zod.z.string().optional(),
  marketplacePlugin: _zod.z.string().optional()
};
//#endregion
//#region src/config/zod-schema.hooks.ts
function isSafeRelativeModulePath(raw) {
  const value = raw.trim();
  if (!value) return false;
  if (_nodePath.default.isAbsolute(value)) return false;
  if (value.startsWith("~")) return false;
  if (value.includes(":")) return false;
  if (value.split(/[\\/]+/g).some((part) => part === "..")) return false;
  return true;
}
const SafeRelativeModulePathSchema = _zod.z.string().refine(isSafeRelativeModulePath, "module must be a safe relative path (no absolute paths)");
const HookMappingSchema = _zod.z.object({
  id: _zod.z.string().optional(),
  match: _zod.z.object({
    path: _zod.z.string().optional(),
    source: _zod.z.string().optional()
  }).optional(),
  action: _zod.z.union([_zod.z.literal("wake"), _zod.z.literal("agent")]).optional(),
  wakeMode: _zod.z.union([_zod.z.literal("now"), _zod.z.literal("next-heartbeat")]).optional(),
  name: _zod.z.string().optional(),
  agentId: _zod.z.string().optional(),
  sessionKey: _zod.z.string().optional().register(_zodSchemaSensitiveDiSy9JX.t),
  messageTemplate: _zod.z.string().optional(),
  textTemplate: _zod.z.string().optional(),
  deliver: _zod.z.boolean().optional(),
  allowUnsafeExternalContent: _zod.z.boolean().optional(),
  channel: _zod.z.string().trim().min(1).optional(),
  to: _zod.z.string().optional(),
  model: _zod.z.string().optional(),
  thinking: _zod.z.string().optional(),
  timeoutSeconds: _zod.z.number().int().positive().optional(),
  transform: _zod.z.object({
    module: SafeRelativeModulePathSchema,
    export: _zod.z.string().optional()
  }).strict().optional()
}).strict().optional();
const InternalHookHandlerSchema = _zod.z.object({
  event: _zod.z.string(),
  module: SafeRelativeModulePathSchema,
  export: _zod.z.string().optional()
}).strict();
const HookConfigSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  env: _zod.z.record(_zod.z.string(), _zod.z.string()).optional()
}).passthrough();
const HookInstallRecordSchema = _zod.z.object({
  ...InstallRecordShape,
  hooks: _zod.z.array(_zod.z.string()).optional()
}).strict();
const InternalHooksSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  handlers: _zod.z.array(InternalHookHandlerSchema).optional(),
  entries: _zod.z.record(_zod.z.string(), HookConfigSchema).optional(),
  load: _zod.z.object({ extraDirs: _zod.z.array(_zod.z.string()).optional() }).strict().optional(),
  installs: _zod.z.record(_zod.z.string(), HookInstallRecordSchema).optional()
}).strict().optional();
const HooksGmailSchema = _zod.z.object({
  account: _zod.z.string().optional(),
  label: _zod.z.string().optional(),
  topic: _zod.z.string().optional(),
  subscription: _zod.z.string().optional(),
  pushToken: _zod.z.string().optional().register(_zodSchemaSensitiveDiSy9JX.t),
  hookUrl: _zod.z.string().optional(),
  includeBody: _zod.z.boolean().optional(),
  maxBytes: _zod.z.number().int().positive().optional(),
  renewEveryMinutes: _zod.z.number().int().positive().optional(),
  allowUnsafeExternalContent: _zod.z.boolean().optional(),
  serve: _zod.z.object({
    bind: _zod.z.string().optional(),
    port: _zod.z.number().int().positive().optional(),
    path: _zod.z.string().optional()
  }).strict().optional(),
  tailscale: _zod.z.object({
    mode: _zod.z.union([
    _zod.z.literal("off"),
    _zod.z.literal("serve"),
    _zod.z.literal("funnel")]
    ).optional(),
    path: _zod.z.string().optional(),
    target: _zod.z.string().optional()
  }).strict().optional(),
  model: _zod.z.string().optional(),
  thinking: _zod.z.union([
  _zod.z.literal("off"),
  _zod.z.literal("minimal"),
  _zod.z.literal("low"),
  _zod.z.literal("medium"),
  _zod.z.literal("high")]
  ).optional()
}).strict().optional();
//#endregion
//#region src/config/zod-schema.providers.ts
const ChannelModelByChannelSchema = _zod.z.record(_zod.z.string(), _zod.z.record(_zod.z.string(), _zod.z.string())).optional();
let directChannelRuntimeSchemasCache;
const OPENCLAW_PACKAGE_ROOT = (0, _sdkAliasW29OTN9p.l)({
  modulePath: (0, _nodeUrl.fileURLToPath)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/zod-schema-BO9ySEsE.js"),
  moduleUrl: "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/zod-schema-BO9ySEsE.js"
}) ?? (0, _nodeUrl.fileURLToPath)(new URL("../..", "file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/zod-schema-BO9ySEsE.js"));
function getDirectChannelRuntimeSchema(channelId) {
  if (!directChannelRuntimeSchemasCache) directChannelRuntimeSchemasCache = /* @__PURE__ */new Map();
  const cached = directChannelRuntimeSchemasCache.get(channelId);
  if (cached) return cached;
  for (const entry of (0, _bundledPluginMetadataDaMNAHv.n)({
    includeChannelConfigs: false,
    includeSyntheticChannelConfigs: false
  })) {
    const manifestRuntime = entry.manifest.channelConfigs?.[channelId]?.runtime;
    if (manifestRuntime) {
      directChannelRuntimeSchemasCache.set(channelId, manifestRuntime);
      return manifestRuntime;
    }
    if (!entry.manifest.channels?.includes(channelId)) continue;
    const collectedRuntime = (0, _bundledPluginMetadataDaMNAHv.a)({
      pluginDir: _nodePath.default.resolve(OPENCLAW_PACKAGE_ROOT, "extensions", entry.dirName),
      manifest: entry.manifest,
      ...(entry.packageManifest ? { packageManifest: entry.packageManifest } : {})
    })?.[channelId]?.runtime;
    if (collectedRuntime) {
      directChannelRuntimeSchemasCache.set(channelId, collectedRuntime);
      return collectedRuntime;
    }
  }
}
function hasPluginOwnedChannelConfig(value) {
  return Object.keys(value).some((key) => key !== "defaults" && key !== "modelByChannel");
}
function addLegacyChannelAcpBindingIssues(value, ctx, path = []) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => addLegacyChannelAcpBindingIssues(entry, ctx, [...path, index]));
    return;
  }
  const record = value;
  const bindings = record.bindings;
  if (bindings && typeof bindings === "object" && !Array.isArray(bindings)) {
    const acp = bindings.acp;
    if (acp && typeof acp === "object") ctx.addIssue({
      code: _zod.z.ZodIssueCode.custom,
      path: [
      ...path,
      "bindings",
      "acp"],

      message: "Legacy channel-local ACP bindings were removed; use top-level bindings[] entries."
    });
  }
  for (const [key, entry] of Object.entries(record)) addLegacyChannelAcpBindingIssues(entry, ctx, [...path, key]);
}
function normalizeBundledChannelConfigs(value, ctx) {
  if (!value || !hasPluginOwnedChannelConfig(value)) return value;
  let next;
  for (const channelId of Object.keys(value)) {
    const runtimeSchema = getDirectChannelRuntimeSchema(channelId);
    if (!runtimeSchema) continue;
    if (!Object.prototype.hasOwnProperty.call(value, channelId)) continue;
    const parsed = runtimeSchema.safeParse(value[channelId]);
    if (!parsed.success) {
      for (const issue of parsed.issues) ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        message: issue.message ?? `Invalid channels.${channelId} config.`,
        path: [channelId, ...(Array.isArray(issue.path) ? issue.path : [])]
      });
      continue;
    }
    next ??= { ...value };
    next[channelId] = parsed.data;
  }
  return next ?? value;
}
const ChannelsSchema = _zod.z.object({
  defaults: _zod.z.object({
    groupPolicy: _zodSchemaCoreCYrn8zgQ.l.optional(),
    contextVisibility: _zodSchemaCoreCYrn8zgQ.i.optional(),
    heartbeat: _zodSchemaProvidersCoreBxvvQH1c.l
  }).strict().optional(),
  modelByChannel: ChannelModelByChannelSchema
}).passthrough().superRefine((value, ctx) => {
  addLegacyChannelAcpBindingIssues(value, ctx);
}).transform((value, ctx) => normalizeBundledChannelConfigs(value, ctx)).optional();
//#endregion
//#region src/config/zod-schema.session.ts
const SessionResetConfigSchema = _zod.z.object({
  mode: _zod.z.union([_zod.z.literal("daily"), _zod.z.literal("idle")]).optional(),
  atHour: _zod.z.number().int().min(0).max(23).optional(),
  idleMinutes: _zod.z.number().int().positive().optional()
}).strict();
const SessionSendPolicySchema = (0, _zodSchemaCoreCYrn8zgQ.L)();
const SessionSchema = _zod.z.object({
  scope: _zod.z.union([_zod.z.literal("per-sender"), _zod.z.literal("global")]).optional(),
  dmScope: _zod.z.union([
  _zod.z.literal("main"),
  _zod.z.literal("per-peer"),
  _zod.z.literal("per-channel-peer"),
  _zod.z.literal("per-account-channel-peer")]
  ).optional(),
  identityLinks: _zod.z.record(_zod.z.string(), _zod.z.array(_zod.z.string())).optional(),
  resetTriggers: _zod.z.array(_zod.z.string()).optional(),
  idleMinutes: _zod.z.number().int().positive().optional(),
  reset: SessionResetConfigSchema.optional(),
  resetByType: _zod.z.object({
    direct: SessionResetConfigSchema.optional(),
    dm: SessionResetConfigSchema.optional(),
    group: SessionResetConfigSchema.optional(),
    thread: SessionResetConfigSchema.optional()
  }).strict().optional(),
  resetByChannel: _zod.z.record(_zod.z.string(), SessionResetConfigSchema).optional(),
  store: _zod.z.string().optional(),
  typingIntervalSeconds: _zod.z.number().int().positive().optional(),
  typingMode: _zodSchemaCoreCYrn8zgQ.P.optional(),
  parentForkMaxTokens: _zod.z.number().int().nonnegative().optional(),
  mainKey: _zod.z.string().optional(),
  sendPolicy: SessionSendPolicySchema.optional(),
  agentToAgent: _zod.z.object({ maxPingPongTurns: _zod.z.number().int().min(0).max(5).optional() }).strict().optional(),
  threadBindings: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    idleHours: _zod.z.number().nonnegative().optional(),
    maxAgeHours: _zod.z.number().nonnegative().optional()
  }).strict().optional(),
  maintenance: _zod.z.object({
    mode: _zod.z.enum(["enforce", "warn"]).optional(),
    pruneAfter: _zod.z.union([_zod.z.string(), _zod.z.number()]).optional(),
    pruneDays: _zod.z.number().int().positive().optional(),
    maxEntries: _zod.z.number().int().positive().optional(),
    rotateBytes: _zod.z.union([_zod.z.string(), _zod.z.number()]).optional(),
    resetArchiveRetention: _zod.z.union([
    _zod.z.string(),
    _zod.z.number(),
    _zod.z.literal(false)]
    ).optional(),
    maxDiskBytes: _zod.z.union([_zod.z.string(), _zod.z.number()]).optional(),
    highWaterBytes: _zod.z.union([_zod.z.string(), _zod.z.number()]).optional()
  }).strict().superRefine((val, ctx) => {
    if (val.pruneAfter !== void 0) try {
      (0, _parseDurationDHL2gXIv.t)((0, _stringCoerceBUSzWgUA.u)(val.pruneAfter) ?? "", { defaultUnit: "d" });
    } catch {
      ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: ["pruneAfter"],
        message: "invalid duration (use ms, s, m, h, d)"
      });
    }
    if (val.rotateBytes !== void 0) try {
      parseByteSize((0, _stringCoerceBUSzWgUA.u)(val.rotateBytes) ?? "", { defaultUnit: "b" });
    } catch {
      ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: ["rotateBytes"],
        message: "invalid size (use b, kb, mb, gb, tb)"
      });
    }
    if (val.resetArchiveRetention !== void 0 && val.resetArchiveRetention !== false) try {
      (0, _parseDurationDHL2gXIv.t)((0, _stringCoerceBUSzWgUA.u)(val.resetArchiveRetention) ?? "", { defaultUnit: "d" });
    } catch {
      ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: ["resetArchiveRetention"],
        message: "invalid duration (use ms, s, m, h, d)"
      });
    }
    if (val.maxDiskBytes !== void 0) try {
      parseByteSize((0, _stringCoerceBUSzWgUA.u)(val.maxDiskBytes) ?? "", { defaultUnit: "b" });
    } catch {
      ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: ["maxDiskBytes"],
        message: "invalid size (use b, kb, mb, gb, tb)"
      });
    }
    if (val.highWaterBytes !== void 0) try {
      parseByteSize((0, _stringCoerceBUSzWgUA.u)(val.highWaterBytes) ?? "", { defaultUnit: "b" });
    } catch {
      ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: ["highWaterBytes"],
        message: "invalid size (use b, kb, mb, gb, tb)"
      });
    }
  }).optional()
}).strict().optional();
const MessagesSchema = _zod.z.object({
  messagePrefix: _zod.z.string().optional(),
  responsePrefix: _zod.z.string().optional(),
  groupChat: _zodSchemaCoreCYrn8zgQ.c,
  queue: _zodSchemaCoreCYrn8zgQ.y,
  inbound: _zodSchemaCoreCYrn8zgQ.p,
  ackReaction: _zod.z.string().optional(),
  ackReactionScope: _zod.z.enum([
  "group-mentions",
  "group-all",
  "direct",
  "all",
  "off",
  "none"]
  ).optional(),
  removeAckAfterReply: _zod.z.boolean().optional(),
  statusReactions: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    emojis: _zod.z.object({
      thinking: _zod.z.string().optional(),
      tool: _zod.z.string().optional(),
      coding: _zod.z.string().optional(),
      web: _zod.z.string().optional(),
      done: _zod.z.string().optional(),
      error: _zod.z.string().optional(),
      stallSoft: _zod.z.string().optional(),
      stallHard: _zod.z.string().optional(),
      compacting: _zod.z.string().optional()
    }).strict().optional(),
    timing: _zod.z.object({
      debounceMs: _zod.z.number().int().min(0).optional(),
      stallSoftMs: _zod.z.number().int().min(0).optional(),
      stallHardMs: _zod.z.number().int().min(0).optional(),
      doneHoldMs: _zod.z.number().int().min(0).optional(),
      errorHoldMs: _zod.z.number().int().min(0).optional()
    }).strict().optional()
  }).strict().optional(),
  suppressToolErrors: _zod.z.boolean().optional(),
  tts: _zodSchemaCoreCYrn8zgQ.j
}).strict().optional();
const CommandsSchema = _zod.z.object({
  native: _zodSchemaCoreCYrn8zgQ._.optional().default("auto"),
  nativeSkills: _zodSchemaCoreCYrn8zgQ._.optional().default("auto"),
  text: _zod.z.boolean().optional(),
  bash: _zod.z.boolean().optional(),
  bashForegroundMs: _zod.z.number().int().min(0).max(3e4).optional(),
  config: _zod.z.boolean().optional(),
  mcp: _zod.z.boolean().optional(),
  plugins: _zod.z.boolean().optional(),
  debug: _zod.z.boolean().optional(),
  restart: _zod.z.boolean().optional().default(true),
  useAccessGroups: _zod.z.boolean().optional(),
  ownerAllowFrom: _zod.z.array(_zod.z.union([_zod.z.string(), _zod.z.number()])).optional(),
  ownerDisplay: _zod.z.enum(["raw", "hash"]).optional().default("raw"),
  ownerDisplaySecret: _zod.z.string().optional().register(_zodSchemaSensitiveDiSy9JX.t),
  allowFrom: _zodSchemaAgentRuntimeBSPBF_O_.a.optional()
}).strict().optional().default(() => ({
  native: "auto",
  nativeSkills: "auto",
  restart: true,
  ownerDisplay: "raw"
}));
//#endregion
//#region src/config/zod-schema.ts
const BrowserSnapshotDefaultsSchema = _zod.z.object({ mode: _zod.z.literal("efficient").optional() }).strict().optional();
const NodeHostSchema = _zod.z.object({ browserProxy: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    allowProfiles: _zod.z.array(_zod.z.string()).optional()
  }).strict().optional() }).strict().optional();
const MemoryQmdPathSchema = _zod.z.object({
  path: _zod.z.string(),
  name: _zod.z.string().optional(),
  pattern: _zod.z.string().optional()
}).strict();
const MemoryQmdSessionSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  exportDir: _zod.z.string().optional(),
  retentionDays: _zod.z.number().int().nonnegative().optional()
}).strict();
const MemoryQmdUpdateSchema = _zod.z.object({
  interval: _zod.z.string().optional(),
  debounceMs: _zod.z.number().int().nonnegative().optional(),
  onBoot: _zod.z.boolean().optional(),
  waitForBootSync: _zod.z.boolean().optional(),
  embedInterval: _zod.z.string().optional(),
  commandTimeoutMs: _zod.z.number().int().nonnegative().optional(),
  updateTimeoutMs: _zod.z.number().int().nonnegative().optional(),
  embedTimeoutMs: _zod.z.number().int().nonnegative().optional()
}).strict();
const MemoryQmdLimitsSchema = _zod.z.object({
  maxResults: _zod.z.number().int().positive().optional(),
  maxSnippetChars: _zod.z.number().int().positive().optional(),
  maxInjectedChars: _zod.z.number().int().positive().optional(),
  timeoutMs: _zod.z.number().int().nonnegative().optional()
}).strict();
const MemoryQmdMcporterSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  serverName: _zod.z.string().optional(),
  startDaemon: _zod.z.boolean().optional()
}).strict();
const LoggingLevelSchema = _zod.z.union([
_zod.z.literal("silent"),
_zod.z.literal("fatal"),
_zod.z.literal("error"),
_zod.z.literal("warn"),
_zod.z.literal("info"),
_zod.z.literal("debug"),
_zod.z.literal("trace")]
);
const MemoryQmdSchema = _zod.z.object({
  command: _zod.z.string().optional(),
  mcporter: MemoryQmdMcporterSchema.optional(),
  searchMode: _zod.z.union([
  _zod.z.literal("query"),
  _zod.z.literal("search"),
  _zod.z.literal("vsearch")]
  ).optional(),
  searchTool: _zod.z.string().trim().min(1).optional(),
  includeDefaultMemory: _zod.z.boolean().optional(),
  paths: _zod.z.array(MemoryQmdPathSchema).optional(),
  sessions: MemoryQmdSessionSchema.optional(),
  update: MemoryQmdUpdateSchema.optional(),
  limits: MemoryQmdLimitsSchema.optional(),
  scope: SessionSendPolicySchema.optional()
}).strict();
const MemorySchema = _zod.z.object({
  backend: _zod.z.union([_zod.z.literal("builtin"), _zod.z.literal("qmd")]).optional(),
  citations: _zod.z.union([
  _zod.z.literal("auto"),
  _zod.z.literal("on"),
  _zod.z.literal("off")]
  ).optional(),
  qmd: MemoryQmdSchema.optional()
}).strict().optional();
const HttpUrlSchema = _zod.z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
}, "Expected http:// or https:// URL");
const ResponsesEndpointUrlFetchShape = {
  allowUrl: _zod.z.boolean().optional(),
  urlAllowlist: _zod.z.array(_zod.z.string()).optional(),
  allowedMimes: _zod.z.array(_zod.z.string()).optional(),
  maxBytes: _zod.z.number().int().positive().optional(),
  maxRedirects: _zod.z.number().int().nonnegative().optional(),
  timeoutMs: _zod.z.number().int().positive().optional()
};
const SkillEntrySchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  apiKey: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
  env: _zod.z.record(_zod.z.string(), _zod.z.string()).optional(),
  config: _zod.z.record(_zod.z.string(), _zod.z.unknown()).optional()
}).strict();
const PluginEntrySchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  hooks: _zod.z.object({ allowPromptInjection: _zod.z.boolean().optional() }).strict().optional(),
  subagent: _zod.z.object({
    allowModelOverride: _zod.z.boolean().optional(),
    allowedModels: _zod.z.array(_zod.z.string()).optional()
  }).strict().optional(),
  config: _zod.z.record(_zod.z.string(), _zod.z.unknown()).optional()
}).strict();
const TalkProviderEntrySchema = _zod.z.object({ apiKey: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t) }).catchall(_zod.z.unknown());
const TalkSchema = _zod.z.object({
  provider: _zod.z.string().optional(),
  providers: _zod.z.record(_zod.z.string(), TalkProviderEntrySchema).optional(),
  interruptOnSpeech: _zod.z.boolean().optional(),
  silenceTimeoutMs: _zod.z.number().int().positive().optional()
}).strict().superRefine((talk, ctx) => {
  const provider = (0, _stringCoerceBUSzWgUA.i)(talk.provider ?? "");
  const providers = talk.providers ? Object.keys(talk.providers) : [];
  if (provider && providers.length > 0 && !(provider in talk.providers)) ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: ["provider"],
    message: `talk.provider must match a key in talk.providers (missing "${provider}")`
  });
  if (!provider && providers.length > 1) ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: ["provider"],
    message: "talk.provider is required when talk.providers defines multiple providers"
  });
});
const McpServerSchema = _zod.z.object({
  command: _zod.z.string().optional(),
  args: _zod.z.array(_zod.z.string()).optional(),
  env: _zod.z.record(_zod.z.string(), _zod.z.union([
  _zod.z.string(),
  _zod.z.number(),
  _zod.z.boolean()]
  )).optional(),
  cwd: _zod.z.string().optional(),
  workingDirectory: _zod.z.string().optional(),
  url: HttpUrlSchema.optional(),
  headers: _zod.z.record(_zod.z.string(), _zod.z.union([
  _zod.z.string().register(_zodSchemaSensitiveDiSy9JX.t),
  _zod.z.number(),
  _zod.z.boolean()]
  ).register(_zodSchemaSensitiveDiSy9JX.t)).optional()
}).catchall(_zod.z.unknown());
const McpConfigSchema = _zod.z.object({ servers: _zod.z.record(_zod.z.string(), McpServerSchema).optional() }).strict().optional();
const OpenClawSchema = exports.t = _zod.z.object({
  $schema: _zod.z.string().optional(),
  meta: _zod.z.object({
    lastTouchedVersion: _zod.z.string().optional(),
    lastTouchedAt: _zod.z.union([_zod.z.string(), _zod.z.number().transform((n, ctx) => {
      const d = new Date(n);
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({
          code: _zod.z.ZodIssueCode.custom,
          message: "Invalid timestamp"
        });
        return _zod.z.NEVER;
      }
      return d.toISOString();
    })]).optional()
  }).strict().optional(),
  env: _zod.z.object({
    shellEnv: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      timeoutMs: _zod.z.number().int().nonnegative().optional()
    }).strict().optional(),
    vars: _zod.z.record(_zod.z.string(), _zod.z.string()).optional()
  }).catchall(_zod.z.string()).optional(),
  wizard: _zod.z.object({
    lastRunAt: _zod.z.string().optional(),
    lastRunVersion: _zod.z.string().optional(),
    lastRunCommit: _zod.z.string().optional(),
    lastRunCommand: _zod.z.string().optional(),
    lastRunMode: _zod.z.union([_zod.z.literal("local"), _zod.z.literal("remote")]).optional()
  }).strict().optional(),
  diagnostics: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    flags: _zod.z.array(_zod.z.string()).optional(),
    stuckSessionWarnMs: _zod.z.number().int().positive().optional(),
    otel: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      endpoint: _zod.z.string().optional(),
      protocol: _zod.z.union([_zod.z.literal("http/protobuf"), _zod.z.literal("grpc")]).optional(),
      headers: _zod.z.record(_zod.z.string(), _zod.z.string()).optional(),
      serviceName: _zod.z.string().optional(),
      traces: _zod.z.boolean().optional(),
      metrics: _zod.z.boolean().optional(),
      logs: _zod.z.boolean().optional(),
      sampleRate: _zod.z.number().min(0).max(1).optional(),
      flushIntervalMs: _zod.z.number().int().nonnegative().optional()
    }).strict().optional(),
    cacheTrace: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      filePath: _zod.z.string().optional(),
      includeMessages: _zod.z.boolean().optional(),
      includePrompt: _zod.z.boolean().optional(),
      includeSystem: _zod.z.boolean().optional()
    }).strict().optional()
  }).strict().optional(),
  logging: _zod.z.object({
    level: LoggingLevelSchema.optional(),
    file: _zod.z.string().optional(),
    maxFileBytes: _zod.z.number().int().positive().optional(),
    consoleLevel: LoggingLevelSchema.optional(),
    consoleStyle: _zod.z.union([
    _zod.z.literal("pretty"),
    _zod.z.literal("compact"),
    _zod.z.literal("json")]
    ).optional(),
    redactSensitive: _zod.z.union([_zod.z.literal("off"), _zod.z.literal("tools")]).optional(),
    redactPatterns: _zod.z.array(_zod.z.string()).optional()
  }).strict().optional(),
  cli: _zod.z.object({ banner: _zod.z.object({ taglineMode: _zod.z.union([
      _zod.z.literal("random"),
      _zod.z.literal("default"),
      _zod.z.literal("off")]
      ).optional() }).strict().optional() }).strict().optional(),
  update: _zod.z.object({
    channel: _zod.z.union([
    _zod.z.literal("stable"),
    _zod.z.literal("beta"),
    _zod.z.literal("dev")]
    ).optional(),
    checkOnStart: _zod.z.boolean().optional(),
    auto: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      stableDelayHours: _zod.z.number().nonnegative().max(168).optional(),
      stableJitterHours: _zod.z.number().nonnegative().max(168).optional(),
      betaCheckIntervalHours: _zod.z.number().positive().max(24).optional()
    }).strict().optional()
  }).strict().optional(),
  browser: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    evaluateEnabled: _zod.z.boolean().optional(),
    cdpUrl: _zod.z.string().optional(),
    remoteCdpTimeoutMs: _zod.z.number().int().nonnegative().optional(),
    remoteCdpHandshakeTimeoutMs: _zod.z.number().int().nonnegative().optional(),
    color: _zod.z.string().optional(),
    executablePath: _zod.z.string().optional(),
    headless: _zod.z.boolean().optional(),
    noSandbox: _zod.z.boolean().optional(),
    attachOnly: _zod.z.boolean().optional(),
    cdpPortRangeStart: _zod.z.number().int().min(1).max(65535).optional(),
    defaultProfile: _zod.z.string().optional(),
    snapshotDefaults: BrowserSnapshotDefaultsSchema,
    ssrfPolicy: _zod.z.object({
      dangerouslyAllowPrivateNetwork: _zod.z.boolean().optional(),
      allowedHostnames: _zod.z.array(_zod.z.string()).optional(),
      hostnameAllowlist: _zod.z.array(_zod.z.string()).optional()
    }).strict().optional(),
    profiles: _zod.z.record(_zod.z.string().regex(/^[a-z0-9-]+$/, "Profile names must be alphanumeric with hyphens only"), _zod.z.object({
      cdpPort: _zod.z.number().int().min(1).max(65535).optional(),
      cdpUrl: _zod.z.string().optional(),
      userDataDir: _zod.z.string().optional(),
      driver: _zod.z.union([
      _zod.z.literal("openclaw"),
      _zod.z.literal("clawd"),
      _zod.z.literal("existing-session")]
      ).optional(),
      attachOnly: _zod.z.boolean().optional(),
      color: _zodSchemaCoreCYrn8zgQ.u
    }).strict().refine((value) => value.driver === "existing-session" || value.cdpPort || value.cdpUrl, { message: "Profile must set cdpPort or cdpUrl" }).refine((value) => value.driver === "existing-session" || !value.userDataDir, { message: "Profile userDataDir is only supported with driver=\"existing-session\"" })).optional(),
    extraArgs: _zod.z.array(_zod.z.string()).optional()
  }).strict().optional(),
  ui: _zod.z.object({
    seamColor: _zodSchemaCoreCYrn8zgQ.u.optional(),
    assistant: _zod.z.object({
      name: _zod.z.string().max(50).optional(),
      avatar: _zod.z.string().max(200).optional()
    }).strict().optional()
  }).strict().optional(),
  secrets: _zodSchemaCoreCYrn8zgQ.E,
  auth: _zod.z.object({
    profiles: _zod.z.record(_zod.z.string(), _zod.z.object({
      provider: _zod.z.string(),
      mode: _zod.z.union([
      _zod.z.literal("api_key"),
      _zod.z.literal("oauth"),
      _zod.z.literal("token")]
      ),
      email: _zod.z.string().optional(),
      displayName: _zod.z.string().optional()
    }).strict()).optional(),
    order: _zod.z.record(_zod.z.string(), _zod.z.array(_zod.z.string())).optional(),
    cooldowns: _zod.z.object({
      billingBackoffHours: _zod.z.number().positive().optional(),
      billingBackoffHoursByProvider: _zod.z.record(_zod.z.string(), _zod.z.number().positive()).optional(),
      billingMaxHours: _zod.z.number().positive().optional(),
      authPermanentBackoffMinutes: _zod.z.number().positive().optional(),
      authPermanentMaxMinutes: _zod.z.number().positive().optional(),
      failureWindowHours: _zod.z.number().positive().optional(),
      overloadedProfileRotations: _zod.z.number().int().nonnegative().optional(),
      overloadedBackoffMs: _zod.z.number().int().nonnegative().optional(),
      rateLimitedProfileRotations: _zod.z.number().int().nonnegative().optional()
    }).strict().optional()
  }).strict().optional(),
  acp: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    dispatch: _zod.z.object({ enabled: _zod.z.boolean().optional() }).strict().optional(),
    backend: _zod.z.string().optional(),
    defaultAgent: _zod.z.string().optional(),
    allowedAgents: _zod.z.array(_zod.z.string()).optional(),
    maxConcurrentSessions: _zod.z.number().int().positive().optional(),
    stream: _zod.z.object({
      coalesceIdleMs: _zod.z.number().int().nonnegative().optional(),
      maxChunkChars: _zod.z.number().int().positive().optional(),
      repeatSuppression: _zod.z.boolean().optional(),
      deliveryMode: _zod.z.union([_zod.z.literal("live"), _zod.z.literal("final_only")]).optional(),
      hiddenBoundarySeparator: _zod.z.union([
      _zod.z.literal("none"),
      _zod.z.literal("space"),
      _zod.z.literal("newline"),
      _zod.z.literal("paragraph")]
      ).optional(),
      maxOutputChars: _zod.z.number().int().positive().optional(),
      maxSessionUpdateChars: _zod.z.number().int().positive().optional(),
      tagVisibility: _zod.z.record(_zod.z.string(), _zod.z.boolean()).optional()
    }).strict().optional(),
    runtime: _zod.z.object({
      ttlMinutes: _zod.z.number().int().positive().optional(),
      installCommand: _zod.z.string().optional()
    }).strict().optional()
  }).strict().optional(),
  models: _zodSchemaCoreCYrn8zgQ.g,
  nodeHost: NodeHostSchema,
  agents: AgentsSchema,
  tools: _zodSchemaAgentRuntimeBSPBF_O_.l,
  bindings: BindingsSchema,
  broadcast: BroadcastSchema,
  audio: AudioSchema,
  media: _zod.z.object({
    preserveFilenames: _zod.z.boolean().optional(),
    ttlHours: _zod.z.number().int().min(1).max(168).optional()
  }).strict().optional(),
  messages: MessagesSchema,
  commands: CommandsSchema,
  approvals: ApprovalsSchema,
  session: SessionSchema,
  cron: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    store: _zod.z.string().optional(),
    maxConcurrentRuns: _zod.z.number().int().positive().optional(),
    retry: _zod.z.object({
      maxAttempts: _zod.z.number().int().min(0).max(10).optional(),
      backoffMs: _zod.z.array(_zod.z.number().int().nonnegative()).min(1).max(10).optional(),
      retryOn: _zod.z.array(_zod.z.enum([
      "rate_limit",
      "overloaded",
      "network",
      "timeout",
      "server_error"]
      )).min(1).optional()
    }).strict().optional(),
    webhook: HttpUrlSchema.optional(),
    webhookToken: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
    sessionRetention: _zod.z.union([_zod.z.string(), _zod.z.literal(false)]).optional(),
    runLog: _zod.z.object({
      maxBytes: _zod.z.union([_zod.z.string(), _zod.z.number()]).optional(),
      keepLines: _zod.z.number().int().positive().optional()
    }).strict().optional(),
    failureAlert: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      after: _zod.z.number().int().min(1).optional(),
      cooldownMs: _zod.z.number().int().min(0).optional(),
      mode: _zod.z.enum(["announce", "webhook"]).optional(),
      accountId: _zod.z.string().optional()
    }).strict().optional(),
    failureDestination: _zod.z.object({
      channel: _zod.z.string().optional(),
      to: _zod.z.string().optional(),
      accountId: _zod.z.string().optional(),
      mode: _zod.z.enum(["announce", "webhook"]).optional()
    }).strict().optional()
  }).strict().superRefine((val, ctx) => {
    if (val.sessionRetention !== void 0 && val.sessionRetention !== false) try {
      (0, _parseDurationDHL2gXIv.t)((0, _stringCoerceBUSzWgUA.u)(val.sessionRetention) ?? "", { defaultUnit: "h" });
    } catch {
      ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: ["sessionRetention"],
        message: "invalid duration (use ms, s, m, h, d)"
      });
    }
    if (val.runLog?.maxBytes !== void 0) try {
      parseByteSize((0, _stringCoerceBUSzWgUA.u)(val.runLog.maxBytes) ?? "", { defaultUnit: "b" });
    } catch {
      ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: ["runLog", "maxBytes"],
        message: "invalid size (use b, kb, mb, gb, tb)"
      });
    }
  }).optional(),
  hooks: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    path: _zod.z.string().optional(),
    token: _zod.z.string().optional().register(_zodSchemaSensitiveDiSy9JX.t),
    defaultSessionKey: _zod.z.string().optional(),
    allowRequestSessionKey: _zod.z.boolean().optional(),
    allowedSessionKeyPrefixes: _zod.z.array(_zod.z.string()).optional(),
    allowedAgentIds: _zod.z.array(_zod.z.string()).optional(),
    maxBodyBytes: _zod.z.number().int().positive().optional(),
    presets: _zod.z.array(_zod.z.string()).optional(),
    transformsDir: _zod.z.string().optional(),
    mappings: _zod.z.array(HookMappingSchema).optional(),
    gmail: HooksGmailSchema,
    internal: InternalHooksSchema
  }).strict().optional(),
  web: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    heartbeatSeconds: _zod.z.number().int().positive().optional(),
    reconnect: _zod.z.object({
      initialMs: _zod.z.number().positive().optional(),
      maxMs: _zod.z.number().positive().optional(),
      factor: _zod.z.number().positive().optional(),
      jitter: _zod.z.number().min(0).max(1).optional(),
      maxAttempts: _zod.z.number().int().min(0).optional()
    }).strict().optional()
  }).strict().optional(),
  channels: ChannelsSchema,
  discovery: _zod.z.object({
    wideArea: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      domain: _zod.z.string().optional()
    }).strict().optional(),
    mdns: _zod.z.object({ mode: _zod.z.enum([
      "off",
      "minimal",
      "full"]
      ).optional() }).strict().optional()
  }).strict().optional(),
  canvasHost: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    root: _zod.z.string().optional(),
    port: _zod.z.number().int().positive().optional(),
    liveReload: _zod.z.boolean().optional()
  }).strict().optional(),
  talk: TalkSchema.optional(),
  gateway: _zod.z.object({
    port: _zod.z.number().int().positive().optional(),
    mode: _zod.z.union([_zod.z.literal("local"), _zod.z.literal("remote")]).optional(),
    bind: _zod.z.union([
    _zod.z.literal("auto"),
    _zod.z.literal("lan"),
    _zod.z.literal("loopback"),
    _zod.z.literal("custom"),
    _zod.z.literal("tailnet")]
    ).optional(),
    customBindHost: _zod.z.string().optional(),
    controlUi: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      basePath: _zod.z.string().optional(),
      root: _zod.z.string().optional(),
      embedSandbox: _zod.z.union([
      _zod.z.literal("strict"),
      _zod.z.literal("scripts"),
      _zod.z.literal("trusted")]
      ).optional(),
      allowExternalEmbedUrls: _zod.z.boolean().optional(),
      allowedOrigins: _zod.z.array(_zod.z.string()).optional(),
      dangerouslyAllowHostHeaderOriginFallback: _zod.z.boolean().optional(),
      allowInsecureAuth: _zod.z.boolean().optional(),
      dangerouslyDisableDeviceAuth: _zod.z.boolean().optional()
    }).strict().optional(),
    auth: _zod.z.object({
      mode: _zod.z.union([
      _zod.z.literal("none"),
      _zod.z.literal("token"),
      _zod.z.literal("password"),
      _zod.z.literal("trusted-proxy")]
      ).optional(),
      token: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
      password: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
      allowTailscale: _zod.z.boolean().optional(),
      rateLimit: _zod.z.object({
        maxAttempts: _zod.z.number().optional(),
        windowMs: _zod.z.number().optional(),
        lockoutMs: _zod.z.number().optional(),
        exemptLoopback: _zod.z.boolean().optional()
      }).strict().optional(),
      trustedProxy: _zod.z.object({
        userHeader: _zod.z.string().min(1, "userHeader is required for trusted-proxy mode"),
        requiredHeaders: _zod.z.array(_zod.z.string()).optional(),
        allowUsers: _zod.z.array(_zod.z.string()).optional()
      }).strict().optional()
    }).strict().optional(),
    trustedProxies: _zod.z.array(_zod.z.string()).optional(),
    allowRealIpFallback: _zod.z.boolean().optional(),
    tools: _zod.z.object({
      deny: _zod.z.array(_zod.z.string()).optional(),
      allow: _zod.z.array(_zod.z.string()).optional()
    }).strict().optional(),
    webchat: _zod.z.object({ chatHistoryMaxChars: _zod.z.number().int().positive().max(5e5).optional() }).strict().optional(),
    channelHealthCheckMinutes: _zod.z.number().int().min(0).optional(),
    channelStaleEventThresholdMinutes: _zod.z.number().int().min(1).optional(),
    channelMaxRestartsPerHour: _zod.z.number().int().min(1).optional(),
    tailscale: _zod.z.object({
      mode: _zod.z.union([
      _zod.z.literal("off"),
      _zod.z.literal("serve"),
      _zod.z.literal("funnel")]
      ).optional(),
      resetOnExit: _zod.z.boolean().optional()
    }).strict().optional(),
    remote: _zod.z.object({
      url: _zod.z.string().optional(),
      transport: _zod.z.union([_zod.z.literal("ssh"), _zod.z.literal("direct")]).optional(),
      token: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
      password: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
      tlsFingerprint: _zod.z.string().optional(),
      sshTarget: _zod.z.string().optional(),
      sshIdentity: _zod.z.string().optional()
    }).strict().optional(),
    reload: _zod.z.object({
      mode: _zod.z.union([
      _zod.z.literal("off"),
      _zod.z.literal("restart"),
      _zod.z.literal("hot"),
      _zod.z.literal("hybrid")]
      ).optional(),
      debounceMs: _zod.z.number().int().min(0).optional(),
      deferralTimeoutMs: _zod.z.number().int().min(0).optional()
    }).strict().optional(),
    tls: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      autoGenerate: _zod.z.boolean().optional(),
      certPath: _zod.z.string().optional(),
      keyPath: _zod.z.string().optional(),
      caPath: _zod.z.string().optional()
    }).optional(),
    http: _zod.z.object({
      endpoints: _zod.z.object({
        chatCompletions: _zod.z.object({
          enabled: _zod.z.boolean().optional(),
          maxBodyBytes: _zod.z.number().int().positive().optional(),
          maxImageParts: _zod.z.number().int().nonnegative().optional(),
          maxTotalImageBytes: _zod.z.number().int().positive().optional(),
          images: _zod.z.object({ ...ResponsesEndpointUrlFetchShape }).strict().optional()
        }).strict().optional(),
        responses: _zod.z.object({
          enabled: _zod.z.boolean().optional(),
          maxBodyBytes: _zod.z.number().int().positive().optional(),
          maxUrlParts: _zod.z.number().int().nonnegative().optional(),
          files: _zod.z.object({
            ...ResponsesEndpointUrlFetchShape,
            maxChars: _zod.z.number().int().positive().optional(),
            pdf: _zod.z.object({
              maxPages: _zod.z.number().int().positive().optional(),
              maxPixels: _zod.z.number().int().positive().optional(),
              minTextChars: _zod.z.number().int().nonnegative().optional()
            }).strict().optional()
          }).strict().optional(),
          images: _zod.z.object({ ...ResponsesEndpointUrlFetchShape }).strict().optional()
        }).strict().optional()
      }).strict().optional(),
      securityHeaders: _zod.z.object({ strictTransportSecurity: _zod.z.union([_zod.z.string(), _zod.z.literal(false)]).optional() }).strict().optional()
    }).strict().optional(),
    push: _zod.z.object({ apns: _zod.z.object({ relay: _zod.z.object({
          baseUrl: _zod.z.string().optional(),
          timeoutMs: _zod.z.number().int().positive().optional()
        }).strict().optional() }).strict().optional() }).strict().optional(),
    nodes: _zod.z.object({
      browser: _zod.z.object({
        mode: _zod.z.union([
        _zod.z.literal("auto"),
        _zod.z.literal("manual"),
        _zod.z.literal("off")]
        ).optional(),
        node: _zod.z.string().optional()
      }).strict().optional(),
      allowCommands: _zod.z.array(_zod.z.string()).optional(),
      denyCommands: _zod.z.array(_zod.z.string()).optional()
    }).strict().optional()
  }).strict().superRefine((gateway, ctx) => {
    const effectiveHealthCheckMinutes = gateway.channelHealthCheckMinutes ?? 5;
    if (gateway.channelStaleEventThresholdMinutes != null && effectiveHealthCheckMinutes !== 0 && gateway.channelStaleEventThresholdMinutes < effectiveHealthCheckMinutes) ctx.addIssue({
      code: _zod.z.ZodIssueCode.custom,
      path: ["channelStaleEventThresholdMinutes"],
      message: "channelStaleEventThresholdMinutes should be >= channelHealthCheckMinutes to avoid delayed stale detection"
    });
  }).optional(),
  memory: MemorySchema,
  mcp: McpConfigSchema,
  skills: _zod.z.object({
    allowBundled: _zod.z.array(_zod.z.string()).optional(),
    load: _zod.z.object({
      extraDirs: _zod.z.array(_zod.z.string()).optional(),
      watch: _zod.z.boolean().optional(),
      watchDebounceMs: _zod.z.number().int().min(0).optional()
    }).strict().optional(),
    install: _zod.z.object({
      preferBrew: _zod.z.boolean().optional(),
      nodeManager: _zod.z.union([
      _zod.z.literal("npm"),
      _zod.z.literal("pnpm"),
      _zod.z.literal("yarn"),
      _zod.z.literal("bun")]
      ).optional()
    }).strict().optional(),
    limits: _zod.z.object({
      maxCandidatesPerRoot: _zod.z.number().int().min(1).optional(),
      maxSkillsLoadedPerSource: _zod.z.number().int().min(1).optional(),
      maxSkillsInPrompt: _zod.z.number().int().min(0).optional(),
      maxSkillsPromptChars: _zod.z.number().int().min(0).optional(),
      maxSkillFileBytes: _zod.z.number().int().min(0).optional()
    }).strict().optional(),
    entries: _zod.z.record(_zod.z.string(), SkillEntrySchema).optional()
  }).strict().optional(),
  plugins: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    allow: _zod.z.array(_zod.z.string()).optional(),
    deny: _zod.z.array(_zod.z.string()).optional(),
    load: _zod.z.object({ paths: _zod.z.array(_zod.z.string()).optional() }).strict().optional(),
    slots: _zod.z.object({
      memory: _zod.z.string().optional(),
      contextEngine: _zod.z.string().optional()
    }).strict().optional(),
    entries: _zod.z.record(_zod.z.string(), PluginEntrySchema).optional(),
    installs: _zod.z.record(_zod.z.string(), _zod.z.object({ ...PluginInstallRecordShape }).strict()).optional()
  }).strict().optional()
}).strict().superRefine((cfg, ctx) => {
  const agents = cfg.agents?.list ?? [];
  if (agents.length === 0) return;
  const agentIds = new Set(agents.map((agent) => agent.id));
  const broadcast = cfg.broadcast;
  if (!broadcast) return;
  for (const [peerId, ids] of Object.entries(broadcast)) {
    if (peerId === "strategy") continue;
    if (!Array.isArray(ids)) continue;
    for (let idx = 0; idx < ids.length; idx += 1) {
      const agentId = ids[idx];
      if (!agentIds.has(agentId)) ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: [
        "broadcast",
        peerId,
        idx],

        message: `Unknown agent id "${agentId}" (not in agents.list).`
      });
    }
  }
});
//#endregion /* v9-741b300e789add0a */
