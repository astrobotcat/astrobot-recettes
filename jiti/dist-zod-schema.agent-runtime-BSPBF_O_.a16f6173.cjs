"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.u = exports.t = exports.s = exports.r = exports.o = exports.n = exports.l = exports.i = exports.c = exports.a = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _zodSchemaCoreCYrn8zgQ = require("./zod-schema.core-CYrn8zgQ.js");
var _zodSchemaSensitiveDiSy9JX = require("./zod-schema.sensitive-DiSy9JX7.js");
var _parseDurationDHL2gXIv = require("./parse-duration-DHL2gXIv.js");
var _networkModeMIyLMFNb = require("./network-mode-mIyLMFNb.js");
var _zod = require("zod");
//#region src/config/zod-schema.agent-model.ts
const AgentModelSchema = exports.u = _zod.z.union([_zod.z.string(), _zod.z.object({
  primary: _zod.z.string().optional(),
  fallbacks: _zod.z.array(_zod.z.string()).optional()
}).strict()]);
//#endregion
//#region src/config/zod-schema.agent-runtime.ts
const HeartbeatSchema = exports.o = _zod.z.object({
  every: _zod.z.string().optional(),
  activeHours: _zod.z.object({
    start: _zod.z.string().optional(),
    end: _zod.z.string().optional(),
    timezone: _zod.z.string().optional()
  }).strict().optional(),
  model: _zod.z.string().optional(),
  session: _zod.z.string().optional(),
  includeReasoning: _zod.z.boolean().optional(),
  target: _zod.z.string().optional(),
  directPolicy: _zod.z.union([_zod.z.literal("allow"), _zod.z.literal("block")]).optional(),
  to: _zod.z.string().optional(),
  accountId: _zod.z.string().optional(),
  prompt: _zod.z.string().optional(),
  includeSystemPromptSection: _zod.z.boolean().optional(),
  ackMaxChars: _zod.z.number().int().nonnegative().optional(),
  suppressToolErrorWarnings: _zod.z.boolean().optional(),
  timeoutSeconds: _zod.z.number().int().positive().optional(),
  lightContext: _zod.z.boolean().optional(),
  isolatedSession: _zod.z.boolean().optional()
}).strict().superRefine((val, ctx) => {
  if (!val.every) return;
  try {
    (0, _parseDurationDHL2gXIv.t)(val.every, { defaultUnit: "m" });
  } catch {
    ctx.addIssue({
      code: _zod.z.ZodIssueCode.custom,
      path: ["every"],
      message: "invalid duration (use ms, s, m, h)"
    });
  }
  const active = val.activeHours;
  if (!active) return;
  const timePattern = /^([01]\d|2[0-3]|24):([0-5]\d)$/;
  const validateTime = (raw, opts, path) => {
    if (!raw) return;
    if (!timePattern.test(raw)) {
      ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: ["activeHours", path],
        message: "invalid time (use \"HH:MM\" 24h format)"
      });
      return;
    }
    const [hourStr, minuteStr] = raw.split(":");
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    if (hour === 24 && minute !== 0) {
      ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: ["activeHours", path],
        message: "invalid time (24:00 is the only allowed 24:xx value)"
      });
      return;
    }
    if (hour === 24 && !opts.allow24) ctx.addIssue({
      code: _zod.z.ZodIssueCode.custom,
      path: ["activeHours", path],
      message: "invalid time (start cannot be 24:00)"
    });
  };
  validateTime(active.start, { allow24: false }, "start");
  validateTime(active.end, { allow24: true }, "end");
}).optional();
const SandboxDockerSchema = _zod.z.object({
  image: _zod.z.string().optional(),
  containerPrefix: _zod.z.string().optional(),
  workdir: _zod.z.string().optional(),
  readOnlyRoot: _zod.z.boolean().optional(),
  tmpfs: _zod.z.array(_zod.z.string()).optional(),
  network: _zod.z.string().optional(),
  user: _zod.z.string().optional(),
  capDrop: _zod.z.array(_zod.z.string()).optional(),
  env: _zod.z.record(_zod.z.string(), _zod.z.string()).optional(),
  setupCommand: _zod.z.union([_zod.z.string(), _zod.z.array(_zod.z.string())]).transform((value) => Array.isArray(value) ? value.join("\n") : value).optional(),
  pidsLimit: _zod.z.number().int().positive().optional(),
  memory: _zod.z.union([_zod.z.string(), _zod.z.number()]).optional(),
  memorySwap: _zod.z.union([_zod.z.string(), _zod.z.number()]).optional(),
  cpus: _zod.z.number().positive().optional(),
  ulimits: _zod.z.record(_zod.z.string(), _zod.z.union([
  _zod.z.string(),
  _zod.z.number(),
  _zod.z.object({
    soft: _zod.z.number().int().nonnegative().optional(),
    hard: _zod.z.number().int().nonnegative().optional()
  }).strict()]
  )).optional(),
  seccompProfile: _zod.z.string().optional(),
  apparmorProfile: _zod.z.string().optional(),
  dns: _zod.z.array(_zod.z.string()).optional(),
  extraHosts: _zod.z.array(_zod.z.string()).optional(),
  binds: _zod.z.array(_zod.z.string()).optional(),
  dangerouslyAllowReservedContainerTargets: _zod.z.boolean().optional(),
  dangerouslyAllowExternalBindSources: _zod.z.boolean().optional(),
  dangerouslyAllowContainerNamespaceJoin: _zod.z.boolean().optional()
}).strict().superRefine((data, ctx) => {
  if (data.binds) for (let i = 0; i < data.binds.length; i += 1) {
    const bind = (0, _stringCoerceBUSzWgUA.s)(data.binds[i]) ?? "";
    if (!bind) {
      ctx.addIssue({
        code: _zod.z.ZodIssueCode.custom,
        path: ["binds", i],
        message: "Sandbox security: bind mount entry must be a non-empty string."
      });
      continue;
    }
    const firstColon = bind.indexOf(":");
    const source = (firstColon <= 0 ? bind : bind.slice(0, firstColon)).trim();
    if (!source.startsWith("/")) ctx.addIssue({
      code: _zod.z.ZodIssueCode.custom,
      path: ["binds", i],
      message: `Sandbox security: bind mount "${bind}" uses a non-absolute source path "${source}". Only absolute POSIX paths are supported for sandbox binds.`
    });
  }
  const blockedNetworkReason = (0, _networkModeMIyLMFNb.t)({
    network: data.network,
    allowContainerNamespaceJoin: data.dangerouslyAllowContainerNamespaceJoin === true
  });
  if (blockedNetworkReason === "host") ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: ["network"],
    message: "Sandbox security: network mode \"host\" is blocked. Use \"bridge\" or \"none\" instead."
  });
  if (blockedNetworkReason === "container_namespace_join") ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: ["network"],
    message: "Sandbox security: network mode \"container:*\" is blocked by default. Use a custom bridge network, or set dangerouslyAllowContainerNamespaceJoin=true only when you fully trust this runtime."
  });
  if ((0, _stringCoerceBUSzWgUA.i)(data.seccompProfile ?? "") === "unconfined") ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: ["seccompProfile"],
    message: "Sandbox security: seccomp profile \"unconfined\" is blocked. Use a custom seccomp profile file or omit this setting."
  });
  if ((0, _stringCoerceBUSzWgUA.i)(data.apparmorProfile ?? "") === "unconfined") ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: ["apparmorProfile"],
    message: "Sandbox security: apparmor profile \"unconfined\" is blocked. Use a named AppArmor profile or omit this setting."
  });
}).optional();
const SandboxBrowserSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  image: _zod.z.string().optional(),
  containerPrefix: _zod.z.string().optional(),
  network: _zod.z.string().optional(),
  cdpPort: _zod.z.number().int().positive().optional(),
  cdpSourceRange: _zod.z.string().optional(),
  vncPort: _zod.z.number().int().positive().optional(),
  noVncPort: _zod.z.number().int().positive().optional(),
  headless: _zod.z.boolean().optional(),
  enableNoVnc: _zod.z.boolean().optional(),
  allowHostControl: _zod.z.boolean().optional(),
  autoStart: _zod.z.boolean().optional(),
  autoStartTimeoutMs: _zod.z.number().int().positive().optional(),
  binds: _zod.z.array(_zod.z.string()).optional()
}).superRefine((data, ctx) => {
  if ((0, _stringCoerceBUSzWgUA.i)(data.network ?? "") === "host") ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: ["network"],
    message: "Sandbox security: browser network mode \"host\" is blocked. Use \"bridge\" or a custom bridge network instead."
  });
}).strict().optional();
const SandboxPruneSchema = _zod.z.object({
  idleHours: _zod.z.number().int().nonnegative().optional(),
  maxAgeDays: _zod.z.number().int().nonnegative().optional()
}).strict().optional();
const AgentContextLimitsSchema = exports.t = _zod.z.object({
  memoryGetMaxChars: _zod.z.number().int().min(1).max(25e4).optional(),
  memoryGetDefaultLines: _zod.z.number().int().min(1).max(5e3).optional(),
  toolResultMaxChars: _zod.z.number().int().min(1).max(25e4).optional(),
  postCompactionMaxChars: _zod.z.number().int().min(1).max(5e4).optional()
}).strict().optional();
const AgentSkillsLimitsSchema = _zod.z.object({ maxSkillsPromptChars: _zod.z.number().int().min(0).optional() }).strict().optional();
const ToolPolicySchema = exports.c = _zod.z.object({
  allow: _zod.z.array(_zod.z.string()).optional(),
  alsoAllow: _zod.z.array(_zod.z.string()).optional(),
  deny: _zod.z.array(_zod.z.string()).optional()
}).strict().superRefine((value, ctx) => {
  if (value.allow && value.allow.length > 0 && value.alsoAllow && value.alsoAllow.length > 0) ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    message: "tools policy cannot set both allow and alsoAllow in the same scope (merge alsoAllow into allow, or remove allow and use profile + alsoAllow)"
  });
}).optional();
const TrimmedOptionalConfigStringSchema = _zod.z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : void 0;
}, _zod.z.string().optional());
const CodexAllowedDomainsSchema = _zod.z.array(_zod.z.string()).transform((values) => {
  const deduped = [...new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))];
  return deduped.length > 0 ? deduped : void 0;
}).optional();
const CodexUserLocationSchema = _zod.z.object({
  country: TrimmedOptionalConfigStringSchema,
  region: TrimmedOptionalConfigStringSchema,
  city: TrimmedOptionalConfigStringSchema,
  timezone: TrimmedOptionalConfigStringSchema
}).strict().transform((value) => {
  return value.country || value.region || value.city || value.timezone ? value : void 0;
}).optional();
const ToolsWebSearchSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  provider: _zod.z.string().optional(),
  maxResults: _zod.z.number().int().positive().optional(),
  timeoutSeconds: _zod.z.number().int().positive().optional(),
  cacheTtlMinutes: _zod.z.number().nonnegative().optional(),
  apiKey: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
  openaiCodex: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    mode: _zod.z.union([_zod.z.literal("cached"), _zod.z.literal("live")]).optional(),
    allowedDomains: CodexAllowedDomainsSchema,
    contextSize: _zod.z.union([
    _zod.z.literal("low"),
    _zod.z.literal("medium"),
    _zod.z.literal("high")]
    ).optional(),
    userLocation: CodexUserLocationSchema
  }).strict().optional()
}).strict().optional();
const ToolsWebFetchSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  provider: _zod.z.string().optional(),
  maxChars: _zod.z.number().int().positive().optional(),
  maxCharsCap: _zod.z.number().int().positive().optional(),
  maxResponseBytes: _zod.z.number().int().positive().optional(),
  timeoutSeconds: _zod.z.number().int().positive().optional(),
  cacheTtlMinutes: _zod.z.number().nonnegative().optional(),
  maxRedirects: _zod.z.number().int().nonnegative().optional(),
  userAgent: _zod.z.string().optional(),
  readability: _zod.z.boolean().optional(),
  ssrfPolicy: _zod.z.object({ allowRfc2544BenchmarkRange: _zod.z.boolean().optional() }).strict().optional(),
  firecrawl: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    apiKey: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
    baseUrl: _zod.z.string().optional(),
    onlyMainContent: _zod.z.boolean().optional(),
    maxAgeMs: _zod.z.number().int().nonnegative().optional(),
    timeoutSeconds: _zod.z.number().int().positive().optional()
  }).strict().optional()
}).strict().optional();
const ToolsWebXSearchSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  model: _zod.z.string().optional(),
  inlineCitations: _zod.z.boolean().optional(),
  maxTurns: _zod.z.number().int().optional(),
  timeoutSeconds: _zod.z.number().int().positive().optional(),
  cacheTtlMinutes: _zod.z.number().nonnegative().optional()
}).strict().optional();
const ToolsWebSchema = _zod.z.object({
  search: ToolsWebSearchSchema,
  fetch: ToolsWebFetchSchema,
  x_search: ToolsWebXSearchSchema
}).strict().optional();
const ToolProfileSchema = _zod.z.union([
_zod.z.literal("minimal"),
_zod.z.literal("coding"),
_zod.z.literal("messaging"),
_zod.z.literal("full")]
).optional();
function addAllowAlsoAllowConflictIssue(value, ctx, message) {
  if (value.allow && value.allow.length > 0 && value.alsoAllow && value.alsoAllow.length > 0) ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    message
  });
}
const ToolPolicyWithProfileSchema = _zod.z.object({
  allow: _zod.z.array(_zod.z.string()).optional(),
  alsoAllow: _zod.z.array(_zod.z.string()).optional(),
  deny: _zod.z.array(_zod.z.string()).optional(),
  profile: ToolProfileSchema
}).strict().superRefine((value, ctx) => {
  addAllowAlsoAllowConflictIssue(value, ctx, "tools.byProvider policy cannot set both allow and alsoAllow in the same scope (merge alsoAllow into allow, or remove allow and use profile + alsoAllow)");
});
const ElevatedAllowFromSchema = exports.a = _zod.z.record(_zod.z.string(), _zod.z.array(_zod.z.union([_zod.z.string(), _zod.z.number()]))).optional();
const ToolExecApplyPatchSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  workspaceOnly: _zod.z.boolean().optional(),
  allowModels: _zod.z.array(_zod.z.string()).optional()
}).strict().optional();
const ToolExecSafeBinProfileSchema = _zod.z.object({
  minPositional: _zod.z.number().int().nonnegative().optional(),
  maxPositional: _zod.z.number().int().nonnegative().optional(),
  allowedValueFlags: _zod.z.array(_zod.z.string()).optional(),
  deniedFlags: _zod.z.array(_zod.z.string()).optional()
}).strict();
const ToolExecBaseShape = {
  host: _zod.z.enum([
  "auto",
  "sandbox",
  "gateway",
  "node"]
  ).optional(),
  security: _zod.z.enum([
  "deny",
  "allowlist",
  "full"]
  ).optional(),
  ask: _zod.z.enum([
  "off",
  "on-miss",
  "always"]
  ).optional(),
  node: _zod.z.string().optional(),
  pathPrepend: _zod.z.array(_zod.z.string()).optional(),
  safeBins: _zod.z.array(_zod.z.string()).optional(),
  strictInlineEval: _zod.z.boolean().optional(),
  safeBinTrustedDirs: _zod.z.array(_zod.z.string()).optional(),
  safeBinProfiles: _zod.z.record(_zod.z.string(), ToolExecSafeBinProfileSchema).optional(),
  backgroundMs: _zod.z.number().int().positive().optional(),
  timeoutSec: _zod.z.number().int().positive().optional(),
  cleanupMs: _zod.z.number().int().positive().optional(),
  notifyOnExit: _zod.z.boolean().optional(),
  notifyOnExitEmptySuccess: _zod.z.boolean().optional(),
  applyPatch: ToolExecApplyPatchSchema
};
const AgentToolExecSchema = _zod.z.object({
  ...ToolExecBaseShape,
  approvalRunningNoticeMs: _zod.z.number().int().nonnegative().optional()
}).strict().optional();
const ToolExecSchema = _zod.z.object(ToolExecBaseShape).strict().optional();
const ToolFsSchema = _zod.z.object({ workspaceOnly: _zod.z.boolean().optional() }).strict().optional();
const ToolLoopDetectionDetectorSchema = _zod.z.object({
  genericRepeat: _zod.z.boolean().optional(),
  knownPollNoProgress: _zod.z.boolean().optional(),
  pingPong: _zod.z.boolean().optional()
}).strict().optional();
const ToolLoopDetectionSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  historySize: _zod.z.number().int().positive().optional(),
  warningThreshold: _zod.z.number().int().positive().optional(),
  unknownToolThreshold: _zod.z.number().int().positive().optional(),
  criticalThreshold: _zod.z.number().int().positive().optional(),
  globalCircuitBreakerThreshold: _zod.z.number().int().positive().optional(),
  detectors: ToolLoopDetectionDetectorSchema
}).strict().superRefine((value, ctx) => {
  if (value.warningThreshold !== void 0 && value.criticalThreshold !== void 0 && value.warningThreshold >= value.criticalThreshold) ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: ["criticalThreshold"],
    message: "tools.loopDetection.warningThreshold must be lower than criticalThreshold."
  });
  if (value.criticalThreshold !== void 0 && value.globalCircuitBreakerThreshold !== void 0 && value.criticalThreshold >= value.globalCircuitBreakerThreshold) ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: ["globalCircuitBreakerThreshold"],
    message: "tools.loopDetection.criticalThreshold must be lower than globalCircuitBreakerThreshold."
  });
}).optional();
const SandboxSshSchema = _zod.z.object({
  target: _zod.z.string().min(1).optional(),
  command: _zod.z.string().min(1).optional(),
  workspaceRoot: _zod.z.string().min(1).optional(),
  strictHostKeyChecking: _zod.z.boolean().optional(),
  updateHostKeys: _zod.z.boolean().optional(),
  identityFile: _zod.z.string().min(1).optional(),
  certificateFile: _zod.z.string().min(1).optional(),
  knownHostsFile: _zod.z.string().min(1).optional(),
  identityData: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
  certificateData: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
  knownHostsData: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t)
}).strict().optional();
const AgentSandboxSchema = exports.i = _zod.z.object({
  mode: _zod.z.union([
  _zod.z.literal("off"),
  _zod.z.literal("non-main"),
  _zod.z.literal("all")]
  ).optional(),
  backend: _zod.z.string().min(1).optional(),
  workspaceAccess: _zod.z.union([
  _zod.z.literal("none"),
  _zod.z.literal("ro"),
  _zod.z.literal("rw")]
  ).optional(),
  sessionToolsVisibility: _zod.z.union([_zod.z.literal("spawned"), _zod.z.literal("all")]).optional(),
  scope: _zod.z.union([
  _zod.z.literal("session"),
  _zod.z.literal("agent"),
  _zod.z.literal("shared")]
  ).optional(),
  workspaceRoot: _zod.z.string().optional(),
  docker: SandboxDockerSchema,
  ssh: SandboxSshSchema,
  browser: SandboxBrowserSchema,
  prune: SandboxPruneSchema
}).strict().superRefine((data, ctx) => {
  if ((0, _networkModeMIyLMFNb.t)({
    network: data.browser?.network,
    allowContainerNamespaceJoin: data.docker?.dangerouslyAllowContainerNamespaceJoin === true
  }) === "container_namespace_join") ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: ["browser", "network"],
    message: "Sandbox security: browser network mode \"container:*\" is blocked by default. Set sandbox.docker.dangerouslyAllowContainerNamespaceJoin=true only when you fully trust this runtime."
  });
}).optional();
const CommonToolPolicyFields = {
  profile: ToolProfileSchema,
  allow: _zod.z.array(_zod.z.string()).optional(),
  alsoAllow: _zod.z.array(_zod.z.string()).optional(),
  deny: _zod.z.array(_zod.z.string()).optional(),
  byProvider: _zod.z.record(_zod.z.string(), ToolPolicyWithProfileSchema).optional()
};
const AgentToolsSchema = _zod.z.object({
  ...CommonToolPolicyFields,
  elevated: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    allowFrom: ElevatedAllowFromSchema
  }).strict().optional(),
  exec: AgentToolExecSchema,
  fs: ToolFsSchema,
  loopDetection: ToolLoopDetectionSchema,
  sandbox: _zod.z.object({ tools: ToolPolicySchema }).strict().optional()
}).strict().superRefine((value, ctx) => {
  addAllowAlsoAllowConflictIssue(value, ctx, "agent tools cannot set both allow and alsoAllow in the same scope (merge alsoAllow into allow, or remove allow and use profile + alsoAllow)");
}).optional();
const MemorySearchSchema = exports.s = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  sources: _zod.z.array(_zod.z.union([_zod.z.literal("memory"), _zod.z.literal("sessions")])).optional(),
  extraPaths: _zod.z.array(_zod.z.string()).optional(),
  qmd: _zod.z.object({ extraCollections: _zod.z.array(_zod.z.object({
      path: _zod.z.string(),
      name: _zod.z.string().optional(),
      pattern: _zod.z.string().optional()
    }).strict()).optional() }).strict().optional(),
  multimodal: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    modalities: _zod.z.array(_zod.z.union([
    _zod.z.literal("image"),
    _zod.z.literal("audio"),
    _zod.z.literal("all")]
    )).optional(),
    maxFileBytes: _zod.z.number().int().positive().optional()
  }).strict().optional(),
  experimental: _zod.z.object({ sessionMemory: _zod.z.boolean().optional() }).strict().optional(),
  provider: _zod.z.string().optional(),
  remote: _zod.z.object({
    baseUrl: _zod.z.string().optional(),
    apiKey: _zodSchemaCoreCYrn8zgQ.C.optional().register(_zodSchemaSensitiveDiSy9JX.t),
    headers: _zod.z.record(_zod.z.string(), _zod.z.string()).optional(),
    batch: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      wait: _zod.z.boolean().optional(),
      concurrency: _zod.z.number().int().positive().optional(),
      pollIntervalMs: _zod.z.number().int().nonnegative().optional(),
      timeoutMinutes: _zod.z.number().int().positive().optional()
    }).strict().optional()
  }).strict().optional(),
  fallback: _zod.z.string().optional(),
  model: _zod.z.string().optional(),
  outputDimensionality: _zod.z.number().int().positive().optional(),
  local: _zod.z.object({
    modelPath: _zod.z.string().optional(),
    modelCacheDir: _zod.z.string().optional()
  }).strict().optional(),
  store: _zod.z.object({
    driver: _zod.z.literal("sqlite").optional(),
    path: _zod.z.string().optional(),
    fts: _zod.z.object({ tokenizer: _zod.z.union([_zod.z.literal("unicode61"), _zod.z.literal("trigram")]).optional() }).strict().optional(),
    vector: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      extensionPath: _zod.z.string().optional()
    }).strict().optional()
  }).strict().optional(),
  chunking: _zod.z.object({
    tokens: _zod.z.number().int().positive().optional(),
    overlap: _zod.z.number().int().nonnegative().optional()
  }).strict().optional(),
  sync: _zod.z.object({
    onSessionStart: _zod.z.boolean().optional(),
    onSearch: _zod.z.boolean().optional(),
    watch: _zod.z.boolean().optional(),
    watchDebounceMs: _zod.z.number().int().nonnegative().optional(),
    intervalMinutes: _zod.z.number().int().nonnegative().optional(),
    sessions: _zod.z.object({
      deltaBytes: _zod.z.number().int().nonnegative().optional(),
      deltaMessages: _zod.z.number().int().nonnegative().optional(),
      postCompactionForce: _zod.z.boolean().optional()
    }).strict().optional()
  }).strict().optional(),
  query: _zod.z.object({
    maxResults: _zod.z.number().int().positive().optional(),
    minScore: _zod.z.number().min(0).max(1).optional(),
    hybrid: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      vectorWeight: _zod.z.number().min(0).max(1).optional(),
      textWeight: _zod.z.number().min(0).max(1).optional(),
      candidateMultiplier: _zod.z.number().int().positive().optional(),
      mmr: _zod.z.object({
        enabled: _zod.z.boolean().optional(),
        lambda: _zod.z.number().min(0).max(1).optional()
      }).strict().optional(),
      temporalDecay: _zod.z.object({
        enabled: _zod.z.boolean().optional(),
        halfLifeDays: _zod.z.number().int().positive().optional()
      }).strict().optional()
    }).strict().optional()
  }).strict().optional(),
  cache: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    maxEntries: _zod.z.number().int().positive().optional()
  }).strict().optional()
}).strict().optional();
const AgentRuntimeAcpSchema = _zod.z.object({
  agent: _zod.z.string().optional(),
  backend: _zod.z.string().optional(),
  mode: _zod.z.enum(["persistent", "oneshot"]).optional(),
  cwd: _zod.z.string().optional()
}).strict().optional();
const AgentRuntimeSchema = _zod.z.union([_zod.z.object({ type: _zod.z.literal("embedded") }).strict(), _zod.z.object({
  type: _zod.z.literal("acp"),
  acp: AgentRuntimeAcpSchema
}).strict()]).optional();
const AgentEmbeddedHarnessSchema = exports.n = _zod.z.object({
  runtime: _zod.z.string().optional(),
  fallback: _zod.z.enum(["pi", "none"]).optional()
}).strict().optional();
const AgentEntrySchema = exports.r = _zod.z.object({
  id: _zod.z.string(),
  default: _zod.z.boolean().optional(),
  name: _zod.z.string().optional(),
  workspace: _zod.z.string().optional(),
  agentDir: _zod.z.string().optional(),
  systemPromptOverride: _zod.z.string().optional(),
  embeddedHarness: AgentEmbeddedHarnessSchema,
  model: AgentModelSchema.optional(),
  thinkingDefault: _zod.z.enum([
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "adaptive"]
  ).optional(),
  reasoningDefault: _zod.z.enum([
  "on",
  "off",
  "stream"]
  ).optional(),
  fastModeDefault: _zod.z.boolean().optional(),
  skills: _zod.z.array(_zod.z.string()).optional(),
  memorySearch: MemorySearchSchema,
  humanDelay: _zodSchemaCoreCYrn8zgQ.d.optional(),
  skillsLimits: AgentSkillsLimitsSchema,
  contextLimits: AgentContextLimitsSchema,
  heartbeat: HeartbeatSchema,
  identity: _zodSchemaCoreCYrn8zgQ.f,
  groupChat: _zodSchemaCoreCYrn8zgQ.c,
  subagents: _zod.z.object({
    allowAgents: _zod.z.array(_zod.z.string()).optional(),
    model: _zod.z.union([_zod.z.string(), _zod.z.object({
      primary: _zod.z.string().optional(),
      fallbacks: _zod.z.array(_zod.z.string()).optional()
    }).strict()]).optional(),
    thinking: _zod.z.string().optional(),
    requireAgentId: _zod.z.boolean().optional()
  }).strict().optional(),
  embeddedPi: _zod.z.object({ executionContract: _zod.z.union([_zod.z.literal("default"), _zod.z.literal("strict-agentic")]).optional() }).strict().optional(),
  sandbox: AgentSandboxSchema,
  params: _zod.z.record(_zod.z.string(), _zod.z.unknown()).optional(),
  tools: AgentToolsSchema,
  runtime: AgentRuntimeSchema
}).strict();
const ToolsSchema = exports.l = _zod.z.object({
  ...CommonToolPolicyFields,
  web: ToolsWebSchema,
  media: _zodSchemaCoreCYrn8zgQ.O,
  links: _zodSchemaCoreCYrn8zgQ.D,
  sessions: _zod.z.object({ visibility: _zod.z.enum([
    "self",
    "tree",
    "agent",
    "all"]
    ).optional() }).strict().optional(),
  loopDetection: ToolLoopDetectionSchema,
  message: _zod.z.object({
    allowCrossContextSend: _zod.z.boolean().optional(),
    crossContext: _zod.z.object({
      allowWithinProvider: _zod.z.boolean().optional(),
      allowAcrossProviders: _zod.z.boolean().optional(),
      marker: _zod.z.object({
        enabled: _zod.z.boolean().optional(),
        prefix: _zod.z.string().optional(),
        suffix: _zod.z.string().optional()
      }).strict().optional()
    }).strict().optional(),
    broadcast: _zod.z.object({ enabled: _zod.z.boolean().optional() }).strict().optional()
  }).strict().optional(),
  agentToAgent: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    allow: _zod.z.array(_zod.z.string()).optional()
  }).strict().optional(),
  elevated: _zod.z.object({
    enabled: _zod.z.boolean().optional(),
    allowFrom: ElevatedAllowFromSchema
  }).strict().optional(),
  exec: ToolExecSchema,
  fs: ToolFsSchema,
  subagents: _zod.z.object({ tools: ToolPolicySchema }).strict().optional(),
  sandbox: _zod.z.object({ tools: ToolPolicySchema }).strict().optional(),
  sessions_spawn: _zod.z.object({ attachments: _zod.z.object({
      enabled: _zod.z.boolean().optional(),
      maxTotalBytes: _zod.z.number().optional(),
      maxFiles: _zod.z.number().optional(),
      maxFileBytes: _zod.z.number().optional(),
      retainOnSessionKeep: _zod.z.boolean().optional()
    }).strict().optional() }).strict().optional(),
  experimental: _zod.z.object({ planTool: _zod.z.boolean().optional() }).strict().optional()
}).strict().superRefine((value, ctx) => {
  addAllowAlsoAllowConflictIssue(value, ctx, "tools cannot set both allow and alsoAllow in the same scope (merge alsoAllow into allow, or remove allow and use profile + alsoAllow)");
}).optional();
//#endregion /* v9-e82d8bd9cc1226cb */
