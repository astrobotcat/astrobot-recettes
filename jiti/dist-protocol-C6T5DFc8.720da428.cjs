"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = exports._t = exports._ = exports.Zt = exports.Z = exports.Yt = exports.Y = exports.Xt = exports.X = exports.Wt = exports.W = exports.Vt = exports.V = exports.Ut = exports.U = exports.Tt = exports.T = exports.St = exports.S = exports.Rt = exports.R = exports.Qt = exports.Q = exports.Pt = exports.P = exports.Ot = exports.O = exports.Nt = exports.N = exports.Mt = exports.M = exports.Lt = exports.L = exports.Kt = exports.K = exports.Jt = exports.J = exports.It = exports.I = exports.Ht = exports.H = exports.Gt = exports.G = exports.Ft = exports.F = exports.Et = exports.E = exports.Dt = exports.D = exports.Ct = exports.C = exports.Bt = exports.B = exports.At = exports.A = exports.$t = exports.$ = void 0;exports.an = parseSessionLabel;exports.r = exports.qt = exports.q = exports.pt = exports.p = exports.ot = exports.o = exports.nt = exports.nn = exports.n = exports.mt = exports.m = exports.lt = exports.l = exports.kt = exports.k = exports.jt = exports.j = exports.it = exports.in = exports.i = exports.ht = exports.h = exports.gt = exports.g = exports.ft = exports.f = exports.et = exports.en = exports.dt = exports.d = exports.ct = exports.c = exports.bt = exports.b = exports.at = void 0;exports.rn = errorShape;exports.st = exports.s = exports.rt = void 0;exports.t = formatValidationErrors;exports.tn = void 0;exports.zt = exports.z = exports.yt = exports.y = exports.xt = exports.x = exports.wt = exports.w = exports.vt = exports.v = exports.ut = exports.u = exports.tt = void 0;var _typesSecretsCeL3gSMO = require("./types.secrets-CeL3gSMO.js");
var _refContractB0QmVSlT = require("./ref-contract-B0QmVSlT.js");
var _messageChannelCBqCPFa_ = require("./message-channel-CBqCPFa_.js");
var _inputProvenanceBIw3ISWS = require("./input-provenance-BIw3ISWS.js");
var _pluginApprovalsB00c1v = require("./plugin-approvals-B00c1v1-.js");
var _ajv = _interopRequireDefault(require("ajv"));
var _typebox = require("@sinclair/typebox");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/internal-event-contract.ts
const AGENT_INTERNAL_EVENT_TYPE_TASK_COMPLETION = "task_completion";
const AGENT_INTERNAL_EVENT_SOURCES = [
"subagent",
"cron",
"video_generation",
"music_generation"];

const AGENT_INTERNAL_EVENT_STATUSES = [
"ok",
"timeout",
"error",
"unknown"];

function parseSessionLabel(raw) {
  if (typeof raw !== "string") return {
    ok: false,
    error: "invalid label: must be a string"
  };
  const trimmed = raw.trim();
  if (!trimmed) return {
    ok: false,
    error: "invalid label: empty"
  };
  if (trimmed.length > 512) return {
    ok: false,
    error: `invalid label: too long (max 512)`
  };
  return {
    ok: true,
    label: trimmed
  };
}
//#endregion
//#region src/gateway/protocol/schema/primitives.ts
const NonEmptyString = _typebox.Type.String({ minLength: 1 });
const ChatSendSessionKeyString = _typebox.Type.String({
  minLength: 1,
  maxLength: 512
});
const SessionLabelString = _typebox.Type.String({
  minLength: 1,
  maxLength: 512
});
const InputProvenanceSchema = _typebox.Type.Object({
  kind: _typebox.Type.String({ enum: [..._inputProvenanceBIw3ISWS.t] }),
  originSessionId: _typebox.Type.Optional(_typebox.Type.String()),
  sourceSessionKey: _typebox.Type.Optional(_typebox.Type.String()),
  sourceChannel: _typebox.Type.Optional(_typebox.Type.String()),
  sourceTool: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const GatewayClientIdSchema = _typebox.Type.Union(Object.values(_messageChannelCBqCPFa_.m).map((value) => _typebox.Type.Literal(value)));
const GatewayClientModeSchema = _typebox.Type.Union(Object.values(_messageChannelCBqCPFa_.h).map((value) => _typebox.Type.Literal(value)));
_typebox.Type.Union([
_typebox.Type.Literal("env"),
_typebox.Type.Literal("file"),
_typebox.Type.Literal("exec")]
);
const SecretProviderAliasString = _typebox.Type.String({ pattern: _refContractB0QmVSlT.r.source });
const EnvSecretRefSchema = _typebox.Type.Object({
  source: _typebox.Type.Literal("env"),
  provider: SecretProviderAliasString,
  id: _typebox.Type.String({ pattern: _typesSecretsCeL3gSMO.n.source })
}, { additionalProperties: false });
const FileSecretRefSchema = _typebox.Type.Object({
  source: _typebox.Type.Literal("file"),
  provider: SecretProviderAliasString,
  id: _typebox.Type.String({ pattern: _refContractB0QmVSlT.n.source })
}, { additionalProperties: false });
const ExecSecretRefSchema = _typebox.Type.Object({
  source: _typebox.Type.Literal("exec"),
  provider: SecretProviderAliasString,
  id: _typebox.Type.String({ pattern: _refContractB0QmVSlT.t })
}, { additionalProperties: false });
const SecretRefSchema = _typebox.Type.Union([
EnvSecretRefSchema,
FileSecretRefSchema,
ExecSecretRefSchema]
);
const SecretInputSchema = _typebox.Type.Union([_typebox.Type.String(), SecretRefSchema]);
//#endregion
//#region src/gateway/protocol/schema/agent.ts
const AgentInternalEventSchema = _typebox.Type.Object({
  type: _typebox.Type.Literal(AGENT_INTERNAL_EVENT_TYPE_TASK_COMPLETION),
  source: _typebox.Type.String({ enum: [...AGENT_INTERNAL_EVENT_SOURCES] }),
  childSessionKey: _typebox.Type.String(),
  childSessionId: _typebox.Type.Optional(_typebox.Type.String()),
  announceType: _typebox.Type.String(),
  taskLabel: _typebox.Type.String(),
  status: _typebox.Type.String({ enum: [...AGENT_INTERNAL_EVENT_STATUSES] }),
  statusLabel: _typebox.Type.String(),
  result: _typebox.Type.String(),
  mediaUrls: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.String())),
  statsLine: _typebox.Type.Optional(_typebox.Type.String()),
  replyInstruction: _typebox.Type.String()
}, { additionalProperties: false });
_typebox.Type.Object({
  runId: NonEmptyString,
  seq: _typebox.Type.Integer({ minimum: 0 }),
  stream: NonEmptyString,
  ts: _typebox.Type.Integer({ minimum: 0 }),
  data: _typebox.Type.Record(_typebox.Type.String(), _typebox.Type.Unknown())
}, { additionalProperties: false });
const MessageActionToolContextSchema = _typebox.Type.Object({
  currentChannelId: _typebox.Type.Optional(_typebox.Type.String()),
  currentGraphChannelId: _typebox.Type.Optional(_typebox.Type.String()),
  currentChannelProvider: _typebox.Type.Optional(_typebox.Type.String()),
  currentThreadTs: _typebox.Type.Optional(_typebox.Type.String()),
  currentMessageId: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Number()])),
  replyToMode: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("off"),
  _typebox.Type.Literal("first"),
  _typebox.Type.Literal("all"),
  _typebox.Type.Literal("batched")]
  )),
  hasRepliedRef: _typebox.Type.Optional(_typebox.Type.Object({ value: _typebox.Type.Boolean() }, { additionalProperties: false })),
  skipCrossContextDecoration: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
const MessageActionParamsSchema = _typebox.Type.Object({
  channel: NonEmptyString,
  action: NonEmptyString,
  params: _typebox.Type.Record(_typebox.Type.String(), _typebox.Type.Unknown()),
  accountId: _typebox.Type.Optional(_typebox.Type.String()),
  requesterSenderId: _typebox.Type.Optional(_typebox.Type.String()),
  senderIsOwner: _typebox.Type.Optional(_typebox.Type.Boolean()),
  sessionKey: _typebox.Type.Optional(_typebox.Type.String()),
  sessionId: _typebox.Type.Optional(_typebox.Type.String()),
  agentId: _typebox.Type.Optional(_typebox.Type.String()),
  toolContext: _typebox.Type.Optional(MessageActionToolContextSchema),
  idempotencyKey: NonEmptyString
}, { additionalProperties: false });
const SendParamsSchema = _typebox.Type.Object({
  to: NonEmptyString,
  message: _typebox.Type.Optional(_typebox.Type.String()),
  mediaUrl: _typebox.Type.Optional(_typebox.Type.String()),
  mediaUrls: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.String())),
  gifPlayback: _typebox.Type.Optional(_typebox.Type.Boolean()),
  channel: _typebox.Type.Optional(_typebox.Type.String()),
  accountId: _typebox.Type.Optional(_typebox.Type.String()),
  agentId: _typebox.Type.Optional(_typebox.Type.String()),
  threadId: _typebox.Type.Optional(_typebox.Type.String()),
  sessionKey: _typebox.Type.Optional(_typebox.Type.String()),
  idempotencyKey: NonEmptyString
}, { additionalProperties: false });
const PollParamsSchema = _typebox.Type.Object({
  to: NonEmptyString,
  question: NonEmptyString,
  options: _typebox.Type.Array(NonEmptyString, {
    minItems: 2,
    maxItems: 12
  }),
  maxSelections: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: 12
  })),
  durationSeconds: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: 604800
  })),
  durationHours: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 })),
  silent: _typebox.Type.Optional(_typebox.Type.Boolean()),
  isAnonymous: _typebox.Type.Optional(_typebox.Type.Boolean()),
  threadId: _typebox.Type.Optional(_typebox.Type.String()),
  channel: _typebox.Type.Optional(_typebox.Type.String()),
  accountId: _typebox.Type.Optional(_typebox.Type.String()),
  idempotencyKey: NonEmptyString
}, { additionalProperties: false });
const AgentParamsSchema = _typebox.Type.Object({
  message: NonEmptyString,
  agentId: _typebox.Type.Optional(NonEmptyString),
  provider: _typebox.Type.Optional(_typebox.Type.String()),
  model: _typebox.Type.Optional(_typebox.Type.String()),
  to: _typebox.Type.Optional(_typebox.Type.String()),
  replyTo: _typebox.Type.Optional(_typebox.Type.String()),
  sessionId: _typebox.Type.Optional(_typebox.Type.String()),
  sessionKey: _typebox.Type.Optional(_typebox.Type.String()),
  thinking: _typebox.Type.Optional(_typebox.Type.String()),
  deliver: _typebox.Type.Optional(_typebox.Type.Boolean()),
  attachments: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.Unknown())),
  channel: _typebox.Type.Optional(_typebox.Type.String()),
  replyChannel: _typebox.Type.Optional(_typebox.Type.String()),
  accountId: _typebox.Type.Optional(_typebox.Type.String()),
  replyAccountId: _typebox.Type.Optional(_typebox.Type.String()),
  threadId: _typebox.Type.Optional(_typebox.Type.String()),
  groupId: _typebox.Type.Optional(_typebox.Type.String()),
  groupChannel: _typebox.Type.Optional(_typebox.Type.String()),
  groupSpace: _typebox.Type.Optional(_typebox.Type.String()),
  timeout: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  bestEffortDeliver: _typebox.Type.Optional(_typebox.Type.Boolean()),
  lane: _typebox.Type.Optional(_typebox.Type.String()),
  extraSystemPrompt: _typebox.Type.Optional(_typebox.Type.String()),
  bootstrapContextMode: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("full"), _typebox.Type.Literal("lightweight")])),
  bootstrapContextRunKind: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("default"),
  _typebox.Type.Literal("heartbeat"),
  _typebox.Type.Literal("cron")]
  )),
  internalEvents: _typebox.Type.Optional(_typebox.Type.Array(AgentInternalEventSchema)),
  inputProvenance: _typebox.Type.Optional(InputProvenanceSchema),
  idempotencyKey: NonEmptyString,
  label: _typebox.Type.Optional(SessionLabelString)
}, { additionalProperties: false });
const AgentIdentityParamsSchema = _typebox.Type.Object({
  agentId: _typebox.Type.Optional(NonEmptyString),
  sessionKey: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
_typebox.Type.Object({
  agentId: NonEmptyString,
  name: _typebox.Type.Optional(NonEmptyString),
  avatar: _typebox.Type.Optional(NonEmptyString),
  emoji: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const AgentWaitParamsSchema = _typebox.Type.Object({
  runId: NonEmptyString,
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const WakeParamsSchema = _typebox.Type.Object({
  mode: _typebox.Type.Union([_typebox.Type.Literal("now"), _typebox.Type.Literal("next-heartbeat")]),
  text: NonEmptyString
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/agents-models-skills.ts
const ModelChoiceSchema = _typebox.Type.Object({
  id: NonEmptyString,
  name: NonEmptyString,
  provider: NonEmptyString,
  alias: _typebox.Type.Optional(NonEmptyString),
  contextWindow: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 })),
  reasoning: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
const AgentSummarySchema = _typebox.Type.Object({
  id: NonEmptyString,
  name: _typebox.Type.Optional(NonEmptyString),
  identity: _typebox.Type.Optional(_typebox.Type.Object({
    name: _typebox.Type.Optional(NonEmptyString),
    theme: _typebox.Type.Optional(NonEmptyString),
    emoji: _typebox.Type.Optional(NonEmptyString),
    avatar: _typebox.Type.Optional(NonEmptyString),
    avatarUrl: _typebox.Type.Optional(NonEmptyString)
  }, { additionalProperties: false })),
  workspace: _typebox.Type.Optional(NonEmptyString),
  model: _typebox.Type.Optional(_typebox.Type.Object({
    primary: _typebox.Type.Optional(NonEmptyString),
    fallbacks: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString))
  }, { additionalProperties: false }))
}, { additionalProperties: false });
const AgentsListParamsSchema = _typebox.Type.Object({}, { additionalProperties: false });
_typebox.Type.Object({
  defaultId: NonEmptyString,
  mainKey: NonEmptyString,
  scope: _typebox.Type.Union([_typebox.Type.Literal("per-sender"), _typebox.Type.Literal("global")]),
  agents: _typebox.Type.Array(AgentSummarySchema)
}, { additionalProperties: false });
const AgentsCreateParamsSchema = _typebox.Type.Object({
  name: NonEmptyString,
  workspace: NonEmptyString,
  model: _typebox.Type.Optional(NonEmptyString),
  emoji: _typebox.Type.Optional(_typebox.Type.String()),
  avatar: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
_typebox.Type.Object({
  ok: _typebox.Type.Literal(true),
  agentId: NonEmptyString,
  name: NonEmptyString,
  workspace: NonEmptyString,
  model: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const AgentsUpdateParamsSchema = _typebox.Type.Object({
  agentId: NonEmptyString,
  name: _typebox.Type.Optional(NonEmptyString),
  workspace: _typebox.Type.Optional(NonEmptyString),
  model: _typebox.Type.Optional(NonEmptyString),
  emoji: _typebox.Type.Optional(_typebox.Type.String()),
  avatar: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
_typebox.Type.Object({
  ok: _typebox.Type.Literal(true),
  agentId: NonEmptyString
}, { additionalProperties: false });
const AgentsDeleteParamsSchema = _typebox.Type.Object({
  agentId: NonEmptyString,
  deleteFiles: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
_typebox.Type.Object({
  ok: _typebox.Type.Literal(true),
  agentId: NonEmptyString,
  removedBindings: _typebox.Type.Integer({ minimum: 0 })
}, { additionalProperties: false });
const AgentsFileEntrySchema = _typebox.Type.Object({
  name: NonEmptyString,
  path: NonEmptyString,
  missing: _typebox.Type.Boolean(),
  size: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  updatedAtMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  content: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const AgentsFilesListParamsSchema = _typebox.Type.Object({ agentId: NonEmptyString }, { additionalProperties: false });
_typebox.Type.Object({
  agentId: NonEmptyString,
  workspace: NonEmptyString,
  files: _typebox.Type.Array(AgentsFileEntrySchema)
}, { additionalProperties: false });
const AgentsFilesGetParamsSchema = _typebox.Type.Object({
  agentId: NonEmptyString,
  name: NonEmptyString
}, { additionalProperties: false });
_typebox.Type.Object({
  agentId: NonEmptyString,
  workspace: NonEmptyString,
  file: AgentsFileEntrySchema
}, { additionalProperties: false });
const AgentsFilesSetParamsSchema = _typebox.Type.Object({
  agentId: NonEmptyString,
  name: NonEmptyString,
  content: _typebox.Type.String()
}, { additionalProperties: false });
_typebox.Type.Object({
  ok: _typebox.Type.Literal(true),
  agentId: NonEmptyString,
  workspace: NonEmptyString,
  file: AgentsFileEntrySchema
}, { additionalProperties: false });
const ModelsListParamsSchema = _typebox.Type.Object({}, { additionalProperties: false });
_typebox.Type.Object({ models: _typebox.Type.Array(ModelChoiceSchema) }, { additionalProperties: false });
const SkillsStatusParamsSchema = _typebox.Type.Object({ agentId: _typebox.Type.Optional(NonEmptyString) }, { additionalProperties: false });
const SkillsBinsParamsSchema = _typebox.Type.Object({}, { additionalProperties: false });
_typebox.Type.Object({ bins: _typebox.Type.Array(NonEmptyString) }, { additionalProperties: false });
const SkillsInstallParamsSchema = _typebox.Type.Union([_typebox.Type.Object({
  name: NonEmptyString,
  installId: NonEmptyString,
  dangerouslyForceUnsafeInstall: _typebox.Type.Optional(_typebox.Type.Boolean()),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1e3 }))
}, { additionalProperties: false }), _typebox.Type.Object({
  source: _typebox.Type.Literal("clawhub"),
  slug: NonEmptyString,
  version: _typebox.Type.Optional(NonEmptyString),
  force: _typebox.Type.Optional(_typebox.Type.Boolean()),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1e3 }))
}, { additionalProperties: false })]);
const SkillsUpdateParamsSchema = _typebox.Type.Union([_typebox.Type.Object({
  skillKey: NonEmptyString,
  enabled: _typebox.Type.Optional(_typebox.Type.Boolean()),
  apiKey: _typebox.Type.Optional(_typebox.Type.String()),
  env: _typebox.Type.Optional(_typebox.Type.Record(NonEmptyString, _typebox.Type.String()))
}, { additionalProperties: false }), _typebox.Type.Object({
  source: _typebox.Type.Literal("clawhub"),
  slug: _typebox.Type.Optional(NonEmptyString),
  all: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false })]);
const SkillsSearchParamsSchema = _typebox.Type.Object({
  query: _typebox.Type.Optional(NonEmptyString),
  limit: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: 100
  }))
}, { additionalProperties: false });
_typebox.Type.Object({ results: _typebox.Type.Array(_typebox.Type.Object({
    score: _typebox.Type.Number(),
    slug: NonEmptyString,
    displayName: NonEmptyString,
    summary: _typebox.Type.Optional(_typebox.Type.String()),
    version: _typebox.Type.Optional(NonEmptyString),
    updatedAt: _typebox.Type.Optional(_typebox.Type.Integer())
  }, { additionalProperties: false })) }, { additionalProperties: false });
const SkillsDetailParamsSchema = _typebox.Type.Object({ slug: NonEmptyString }, { additionalProperties: false });
_typebox.Type.Object({
  skill: _typebox.Type.Union([_typebox.Type.Object({
    slug: NonEmptyString,
    displayName: NonEmptyString,
    summary: _typebox.Type.Optional(_typebox.Type.String()),
    tags: _typebox.Type.Optional(_typebox.Type.Record(NonEmptyString, _typebox.Type.String())),
    createdAt: _typebox.Type.Integer(),
    updatedAt: _typebox.Type.Integer()
  }, { additionalProperties: false }), _typebox.Type.Null()]),
  latestVersion: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Object({
    version: NonEmptyString,
    createdAt: _typebox.Type.Integer(),
    changelog: _typebox.Type.Optional(_typebox.Type.String())
  }, { additionalProperties: false }), _typebox.Type.Null()])),
  metadata: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Object({
    os: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Array(_typebox.Type.String()), _typebox.Type.Null()])),
    systems: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Array(_typebox.Type.String()), _typebox.Type.Null()]))
  }, { additionalProperties: false }), _typebox.Type.Null()])),
  owner: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Object({
    handle: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
    displayName: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
    image: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()]))
  }, { additionalProperties: false }), _typebox.Type.Null()]))
}, { additionalProperties: false });
const ToolsCatalogParamsSchema = _typebox.Type.Object({
  agentId: _typebox.Type.Optional(NonEmptyString),
  includePlugins: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
const ToolsEffectiveParamsSchema = _typebox.Type.Object({
  agentId: _typebox.Type.Optional(NonEmptyString),
  sessionKey: NonEmptyString
}, { additionalProperties: false });
const ToolCatalogProfileSchema = _typebox.Type.Object({
  id: _typebox.Type.Union([
  _typebox.Type.Literal("minimal"),
  _typebox.Type.Literal("coding"),
  _typebox.Type.Literal("messaging"),
  _typebox.Type.Literal("full")]
  ),
  label: NonEmptyString
}, { additionalProperties: false });
const ToolCatalogEntrySchema = _typebox.Type.Object({
  id: NonEmptyString,
  label: NonEmptyString,
  description: _typebox.Type.String(),
  source: _typebox.Type.Union([_typebox.Type.Literal("core"), _typebox.Type.Literal("plugin")]),
  pluginId: _typebox.Type.Optional(NonEmptyString),
  optional: _typebox.Type.Optional(_typebox.Type.Boolean()),
  defaultProfiles: _typebox.Type.Array(_typebox.Type.Union([
  _typebox.Type.Literal("minimal"),
  _typebox.Type.Literal("coding"),
  _typebox.Type.Literal("messaging"),
  _typebox.Type.Literal("full")]
  ))
}, { additionalProperties: false });
const ToolCatalogGroupSchema = _typebox.Type.Object({
  id: NonEmptyString,
  label: NonEmptyString,
  source: _typebox.Type.Union([_typebox.Type.Literal("core"), _typebox.Type.Literal("plugin")]),
  pluginId: _typebox.Type.Optional(NonEmptyString),
  tools: _typebox.Type.Array(ToolCatalogEntrySchema)
}, { additionalProperties: false });
_typebox.Type.Object({
  agentId: NonEmptyString,
  profiles: _typebox.Type.Array(ToolCatalogProfileSchema),
  groups: _typebox.Type.Array(ToolCatalogGroupSchema)
}, { additionalProperties: false });
const ToolsEffectiveEntrySchema = _typebox.Type.Object({
  id: NonEmptyString,
  label: NonEmptyString,
  description: _typebox.Type.String(),
  rawDescription: _typebox.Type.String(),
  source: _typebox.Type.Union([
  _typebox.Type.Literal("core"),
  _typebox.Type.Literal("plugin"),
  _typebox.Type.Literal("channel")]
  ),
  pluginId: _typebox.Type.Optional(NonEmptyString),
  channelId: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const ToolsEffectiveGroupSchema = _typebox.Type.Object({
  id: _typebox.Type.Union([
  _typebox.Type.Literal("core"),
  _typebox.Type.Literal("plugin"),
  _typebox.Type.Literal("channel")]
  ),
  label: NonEmptyString,
  source: _typebox.Type.Union([
  _typebox.Type.Literal("core"),
  _typebox.Type.Literal("plugin"),
  _typebox.Type.Literal("channel")]
  ),
  tools: _typebox.Type.Array(ToolsEffectiveEntrySchema)
}, { additionalProperties: false });
_typebox.Type.Object({
  agentId: NonEmptyString,
  profile: NonEmptyString,
  groups: _typebox.Type.Array(ToolsEffectiveGroupSchema)
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/channels.ts
const TalkModeParamsSchema = _typebox.Type.Object({
  enabled: _typebox.Type.Boolean(),
  phase: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const TalkConfigParamsSchema = _typebox.Type.Object({ includeSecrets: _typebox.Type.Optional(_typebox.Type.Boolean()) }, { additionalProperties: false });
const TalkSpeakParamsSchema = _typebox.Type.Object({
  text: NonEmptyString,
  voiceId: _typebox.Type.Optional(_typebox.Type.String()),
  modelId: _typebox.Type.Optional(_typebox.Type.String()),
  outputFormat: _typebox.Type.Optional(_typebox.Type.String()),
  speed: _typebox.Type.Optional(_typebox.Type.Number()),
  rateWpm: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 })),
  stability: _typebox.Type.Optional(_typebox.Type.Number()),
  similarity: _typebox.Type.Optional(_typebox.Type.Number()),
  style: _typebox.Type.Optional(_typebox.Type.Number()),
  speakerBoost: _typebox.Type.Optional(_typebox.Type.Boolean()),
  seed: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  normalize: _typebox.Type.Optional(_typebox.Type.String()),
  language: _typebox.Type.Optional(_typebox.Type.String()),
  latencyTier: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const talkProviderFieldSchemas = { apiKey: _typebox.Type.Optional(SecretInputSchema) };
const TalkProviderConfigSchema = _typebox.Type.Object(talkProviderFieldSchemas, { additionalProperties: true });
const ResolvedTalkConfigSchema = _typebox.Type.Object({
  provider: _typebox.Type.String(),
  config: TalkProviderConfigSchema
}, { additionalProperties: false });
const TalkConfigSchema = _typebox.Type.Object({
  provider: _typebox.Type.Optional(_typebox.Type.String()),
  providers: _typebox.Type.Optional(_typebox.Type.Record(_typebox.Type.String(), TalkProviderConfigSchema)),
  resolved: ResolvedTalkConfigSchema,
  interruptOnSpeech: _typebox.Type.Optional(_typebox.Type.Boolean()),
  silenceTimeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 }))
}, { additionalProperties: false });
const TalkConfigResultSchema = _typebox.Type.Object({ config: _typebox.Type.Object({
    talk: _typebox.Type.Optional(TalkConfigSchema),
    session: _typebox.Type.Optional(_typebox.Type.Object({ mainKey: _typebox.Type.Optional(_typebox.Type.String()) }, { additionalProperties: false })),
    ui: _typebox.Type.Optional(_typebox.Type.Object({ seamColor: _typebox.Type.Optional(_typebox.Type.String()) }, { additionalProperties: false }))
  }, { additionalProperties: false }) }, { additionalProperties: false });
const TalkSpeakResultSchema = _typebox.Type.Object({
  audioBase64: NonEmptyString,
  provider: NonEmptyString,
  outputFormat: _typebox.Type.Optional(_typebox.Type.String()),
  voiceCompatible: _typebox.Type.Optional(_typebox.Type.Boolean()),
  mimeType: _typebox.Type.Optional(_typebox.Type.String()),
  fileExtension: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const ChannelsStatusParamsSchema = _typebox.Type.Object({
  probe: _typebox.Type.Optional(_typebox.Type.Boolean()),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const ChannelAccountSnapshotSchema = _typebox.Type.Object({
  accountId: NonEmptyString,
  name: _typebox.Type.Optional(_typebox.Type.String()),
  enabled: _typebox.Type.Optional(_typebox.Type.Boolean()),
  configured: _typebox.Type.Optional(_typebox.Type.Boolean()),
  linked: _typebox.Type.Optional(_typebox.Type.Boolean()),
  running: _typebox.Type.Optional(_typebox.Type.Boolean()),
  connected: _typebox.Type.Optional(_typebox.Type.Boolean()),
  reconnectAttempts: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastConnectedAt: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastError: _typebox.Type.Optional(_typebox.Type.String()),
  healthState: _typebox.Type.Optional(_typebox.Type.String()),
  lastStartAt: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastStopAt: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastInboundAt: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastOutboundAt: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  busy: _typebox.Type.Optional(_typebox.Type.Boolean()),
  activeRuns: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastRunActivityAt: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastProbeAt: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  mode: _typebox.Type.Optional(_typebox.Type.String()),
  dmPolicy: _typebox.Type.Optional(_typebox.Type.String()),
  allowFrom: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.String())),
  tokenSource: _typebox.Type.Optional(_typebox.Type.String()),
  botTokenSource: _typebox.Type.Optional(_typebox.Type.String()),
  appTokenSource: _typebox.Type.Optional(_typebox.Type.String()),
  baseUrl: _typebox.Type.Optional(_typebox.Type.String()),
  allowUnmentionedGroups: _typebox.Type.Optional(_typebox.Type.Boolean()),
  cliPath: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  dbPath: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  port: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Integer({ minimum: 0 }), _typebox.Type.Null()])),
  probe: _typebox.Type.Optional(_typebox.Type.Unknown()),
  audit: _typebox.Type.Optional(_typebox.Type.Unknown()),
  application: _typebox.Type.Optional(_typebox.Type.Unknown())
}, { additionalProperties: true });
const ChannelUiMetaSchema = _typebox.Type.Object({
  id: NonEmptyString,
  label: NonEmptyString,
  detailLabel: NonEmptyString,
  systemImage: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
_typebox.Type.Object({
  ts: _typebox.Type.Integer({ minimum: 0 }),
  channelOrder: _typebox.Type.Array(NonEmptyString),
  channelLabels: _typebox.Type.Record(NonEmptyString, NonEmptyString),
  channelDetailLabels: _typebox.Type.Optional(_typebox.Type.Record(NonEmptyString, NonEmptyString)),
  channelSystemImages: _typebox.Type.Optional(_typebox.Type.Record(NonEmptyString, NonEmptyString)),
  channelMeta: _typebox.Type.Optional(_typebox.Type.Array(ChannelUiMetaSchema)),
  channels: _typebox.Type.Record(NonEmptyString, _typebox.Type.Unknown()),
  channelAccounts: _typebox.Type.Record(NonEmptyString, _typebox.Type.Array(ChannelAccountSnapshotSchema)),
  channelDefaultAccountId: _typebox.Type.Record(NonEmptyString, NonEmptyString)
}, { additionalProperties: false });
const ChannelsLogoutParamsSchema = _typebox.Type.Object({
  channel: NonEmptyString,
  accountId: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const WebLoginStartParamsSchema = _typebox.Type.Object({
  force: _typebox.Type.Optional(_typebox.Type.Boolean()),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  verbose: _typebox.Type.Optional(_typebox.Type.Boolean()),
  accountId: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const WebLoginWaitParamsSchema = _typebox.Type.Object({
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  accountId: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const COMMAND_DESCRIPTION_MAX_LENGTH = exports.in = 2e3;
const BoundedNonEmptyString = (maxLength) => _typebox.Type.String({
  minLength: 1,
  maxLength
});
const CommandSourceSchema = _typebox.Type.Union([
_typebox.Type.Literal("native"),
_typebox.Type.Literal("skill"),
_typebox.Type.Literal("plugin")]
);
const CommandScopeSchema = _typebox.Type.Union([
_typebox.Type.Literal("text"),
_typebox.Type.Literal("native"),
_typebox.Type.Literal("both")]
);
const CommandCategorySchema = _typebox.Type.Union([
_typebox.Type.Literal("session"),
_typebox.Type.Literal("options"),
_typebox.Type.Literal("status"),
_typebox.Type.Literal("management"),
_typebox.Type.Literal("media"),
_typebox.Type.Literal("tools"),
_typebox.Type.Literal("docks")]
);
const CommandArgChoiceSchema = _typebox.Type.Object({
  value: _typebox.Type.String({ maxLength: 200 }),
  label: _typebox.Type.String({ maxLength: 200 })
}, { additionalProperties: false });
const CommandArgSchema = _typebox.Type.Object({
  name: BoundedNonEmptyString(200),
  description: _typebox.Type.String({ maxLength: 500 }),
  type: _typebox.Type.Union([
  _typebox.Type.Literal("string"),
  _typebox.Type.Literal("number"),
  _typebox.Type.Literal("boolean")]
  ),
  required: _typebox.Type.Optional(_typebox.Type.Boolean()),
  choices: _typebox.Type.Optional(_typebox.Type.Array(CommandArgChoiceSchema, { maxItems: 50 })),
  dynamic: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
const CommandEntrySchema = _typebox.Type.Object({
  name: BoundedNonEmptyString(200),
  nativeName: _typebox.Type.Optional(BoundedNonEmptyString(200)),
  textAliases: _typebox.Type.Optional(_typebox.Type.Array(BoundedNonEmptyString(200), { maxItems: 20 })),
  description: _typebox.Type.String({ maxLength: COMMAND_DESCRIPTION_MAX_LENGTH }),
  category: _typebox.Type.Optional(CommandCategorySchema),
  source: CommandSourceSchema,
  scope: CommandScopeSchema,
  acceptsArgs: _typebox.Type.Boolean(),
  args: _typebox.Type.Optional(_typebox.Type.Array(CommandArgSchema, { maxItems: 20 }))
}, { additionalProperties: false });
const CommandsListParamsSchema = _typebox.Type.Object({
  agentId: _typebox.Type.Optional(NonEmptyString),
  provider: _typebox.Type.Optional(NonEmptyString),
  scope: _typebox.Type.Optional(CommandScopeSchema),
  includeArgs: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
_typebox.Type.Object({ commands: _typebox.Type.Array(CommandEntrySchema, { maxItems: 500 }) }, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/config.ts
const ConfigSchemaLookupPathString = _typebox.Type.String({
  minLength: 1,
  maxLength: 1024,
  pattern: "^[A-Za-z0-9_./\\[\\]\\-*]+$"
});
const ConfigGetParamsSchema = _typebox.Type.Object({}, { additionalProperties: false });
const ConfigSetParamsSchema = _typebox.Type.Object({
  raw: NonEmptyString,
  baseHash: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const ConfigApplyLikeParamsSchema = _typebox.Type.Object({
  raw: NonEmptyString,
  baseHash: _typebox.Type.Optional(NonEmptyString),
  sessionKey: _typebox.Type.Optional(_typebox.Type.String()),
  deliveryContext: _typebox.Type.Optional(_typebox.Type.Object({
    channel: _typebox.Type.Optional(_typebox.Type.String()),
    to: _typebox.Type.Optional(_typebox.Type.String()),
    accountId: _typebox.Type.Optional(_typebox.Type.String()),
    threadId: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Number()]))
  }, { additionalProperties: false })),
  note: _typebox.Type.Optional(_typebox.Type.String()),
  restartDelayMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const ConfigApplyParamsSchema = ConfigApplyLikeParamsSchema;
const ConfigPatchParamsSchema = ConfigApplyLikeParamsSchema;
const ConfigSchemaParamsSchema = _typebox.Type.Object({}, { additionalProperties: false });
const ConfigSchemaLookupParamsSchema = _typebox.Type.Object({ path: ConfigSchemaLookupPathString }, { additionalProperties: false });
const UpdateRunParamsSchema = _typebox.Type.Object({
  sessionKey: _typebox.Type.Optional(_typebox.Type.String()),
  deliveryContext: _typebox.Type.Optional(_typebox.Type.Object({
    channel: _typebox.Type.Optional(_typebox.Type.String()),
    to: _typebox.Type.Optional(_typebox.Type.String()),
    accountId: _typebox.Type.Optional(_typebox.Type.String()),
    threadId: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Number()]))
  }, { additionalProperties: false })),
  note: _typebox.Type.Optional(_typebox.Type.String()),
  restartDelayMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 }))
}, { additionalProperties: false });
const ConfigUiHintSchema = _typebox.Type.Object({
  label: _typebox.Type.Optional(_typebox.Type.String()),
  help: _typebox.Type.Optional(_typebox.Type.String()),
  tags: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.String())),
  group: _typebox.Type.Optional(_typebox.Type.String()),
  order: _typebox.Type.Optional(_typebox.Type.Integer()),
  advanced: _typebox.Type.Optional(_typebox.Type.Boolean()),
  sensitive: _typebox.Type.Optional(_typebox.Type.Boolean()),
  placeholder: _typebox.Type.Optional(_typebox.Type.String()),
  itemTemplate: _typebox.Type.Optional(_typebox.Type.Unknown())
}, { additionalProperties: false });
_typebox.Type.Object({
  schema: _typebox.Type.Unknown(),
  uiHints: _typebox.Type.Record(_typebox.Type.String(), ConfigUiHintSchema),
  version: NonEmptyString,
  generatedAt: NonEmptyString
}, { additionalProperties: false });
const ConfigSchemaLookupChildSchema = _typebox.Type.Object({
  key: NonEmptyString,
  path: NonEmptyString,
  type: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Array(_typebox.Type.String())])),
  required: _typebox.Type.Boolean(),
  hasChildren: _typebox.Type.Boolean(),
  hint: _typebox.Type.Optional(ConfigUiHintSchema),
  hintPath: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const ConfigSchemaLookupResultSchema = _typebox.Type.Object({
  path: NonEmptyString,
  schema: _typebox.Type.Unknown(),
  hint: _typebox.Type.Optional(ConfigUiHintSchema),
  hintPath: _typebox.Type.Optional(_typebox.Type.String()),
  children: _typebox.Type.Array(ConfigSchemaLookupChildSchema)
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/cron.ts
function cronAgentTurnPayloadSchema(params) {
  return _typebox.Type.Object({
    kind: _typebox.Type.Literal("agentTurn"),
    message: params.message,
    model: _typebox.Type.Optional(_typebox.Type.String()),
    fallbacks: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.String())),
    thinking: _typebox.Type.Optional(_typebox.Type.String()),
    timeoutSeconds: _typebox.Type.Optional(_typebox.Type.Number({ minimum: 0 })),
    allowUnsafeExternalContent: _typebox.Type.Optional(_typebox.Type.Boolean()),
    lightContext: _typebox.Type.Optional(_typebox.Type.Boolean()),
    toolsAllow: _typebox.Type.Optional(params.toolsAllow)
  }, { additionalProperties: false });
}
const CronSessionTargetSchema = _typebox.Type.Union([
_typebox.Type.Literal("main"),
_typebox.Type.Literal("isolated"),
_typebox.Type.Literal("current"),
_typebox.Type.String({ pattern: "^session:.+" })]
);
const CronWakeModeSchema = _typebox.Type.Union([_typebox.Type.Literal("next-heartbeat"), _typebox.Type.Literal("now")]);
const CronRunStatusSchema = _typebox.Type.Union([
_typebox.Type.Literal("ok"),
_typebox.Type.Literal("error"),
_typebox.Type.Literal("skipped")]
);
const CronSortDirSchema = _typebox.Type.Union([_typebox.Type.Literal("asc"), _typebox.Type.Literal("desc")]);
const CronJobsEnabledFilterSchema = _typebox.Type.Union([
_typebox.Type.Literal("all"),
_typebox.Type.Literal("enabled"),
_typebox.Type.Literal("disabled")]
);
const CronJobsSortBySchema = _typebox.Type.Union([
_typebox.Type.Literal("nextRunAtMs"),
_typebox.Type.Literal("updatedAtMs"),
_typebox.Type.Literal("name")]
);
const CronRunsStatusFilterSchema = _typebox.Type.Union([
_typebox.Type.Literal("all"),
_typebox.Type.Literal("ok"),
_typebox.Type.Literal("error"),
_typebox.Type.Literal("skipped")]
);
const CronRunsStatusValueSchema = _typebox.Type.Union([
_typebox.Type.Literal("ok"),
_typebox.Type.Literal("error"),
_typebox.Type.Literal("skipped")]
);
const CronDeliveryStatusSchema = _typebox.Type.Union([
_typebox.Type.Literal("delivered"),
_typebox.Type.Literal("not-delivered"),
_typebox.Type.Literal("unknown"),
_typebox.Type.Literal("not-requested")]
);
const CronFailoverReasonSchema = _typebox.Type.Union([
_typebox.Type.Literal("auth"),
_typebox.Type.Literal("format"),
_typebox.Type.Literal("rate_limit"),
_typebox.Type.Literal("billing"),
_typebox.Type.Literal("timeout"),
_typebox.Type.Literal("model_not_found"),
_typebox.Type.Literal("unknown")]
);
const CronCommonOptionalFields = {
  agentId: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  sessionKey: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  description: _typebox.Type.Optional(_typebox.Type.String()),
  enabled: _typebox.Type.Optional(_typebox.Type.Boolean()),
  deleteAfterRun: _typebox.Type.Optional(_typebox.Type.Boolean())
};
function cronIdOrJobIdParams(extraFields) {
  return _typebox.Type.Union([_typebox.Type.Object({
    id: NonEmptyString,
    ...extraFields
  }, { additionalProperties: false }), _typebox.Type.Object({
    jobId: NonEmptyString,
    ...extraFields
  }, { additionalProperties: false })]);
}
const CronRunLogJobIdSchema = _typebox.Type.String({
  minLength: 1,
  pattern: "^[^/\\\\]+$"
});
const CronScheduleSchema = _typebox.Type.Union([
_typebox.Type.Object({
  kind: _typebox.Type.Literal("at"),
  at: NonEmptyString
}, { additionalProperties: false }),
_typebox.Type.Object({
  kind: _typebox.Type.Literal("every"),
  everyMs: _typebox.Type.Integer({ minimum: 1 }),
  anchorMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 }))
}, { additionalProperties: false }),
_typebox.Type.Object({
  kind: _typebox.Type.Literal("cron"),
  expr: NonEmptyString,
  tz: _typebox.Type.Optional(_typebox.Type.String()),
  staggerMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 }))
}, { additionalProperties: false })]
);
const CronPayloadSchema = _typebox.Type.Union([_typebox.Type.Object({
  kind: _typebox.Type.Literal("systemEvent"),
  text: NonEmptyString
}, { additionalProperties: false }), cronAgentTurnPayloadSchema({
  message: NonEmptyString,
  toolsAllow: _typebox.Type.Array(_typebox.Type.String())
})]);
const CronPayloadPatchSchema = _typebox.Type.Union([_typebox.Type.Object({
  kind: _typebox.Type.Literal("systemEvent"),
  text: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false }), cronAgentTurnPayloadSchema({
  message: _typebox.Type.Optional(NonEmptyString),
  toolsAllow: _typebox.Type.Union([_typebox.Type.Array(_typebox.Type.String()), _typebox.Type.Null()])
})]);
const CronFailureAlertSchema = _typebox.Type.Object({
  after: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 })),
  channel: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("last"), NonEmptyString])),
  to: _typebox.Type.Optional(_typebox.Type.String()),
  cooldownMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  mode: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("announce"), _typebox.Type.Literal("webhook")])),
  accountId: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const CronFailureDestinationSchema = _typebox.Type.Object({
  channel: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("last"), NonEmptyString])),
  to: _typebox.Type.Optional(_typebox.Type.String()),
  accountId: _typebox.Type.Optional(NonEmptyString),
  mode: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("announce"), _typebox.Type.Literal("webhook")]))
}, { additionalProperties: false });
const CronDeliverySharedProperties = {
  channel: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("last"), NonEmptyString])),
  accountId: _typebox.Type.Optional(NonEmptyString),
  bestEffort: _typebox.Type.Optional(_typebox.Type.Boolean()),
  failureDestination: _typebox.Type.Optional(CronFailureDestinationSchema)
};
const CronDeliveryNoopSchema = _typebox.Type.Object({
  mode: _typebox.Type.Literal("none"),
  ...CronDeliverySharedProperties,
  to: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const CronDeliveryAnnounceSchema = _typebox.Type.Object({
  mode: _typebox.Type.Literal("announce"),
  ...CronDeliverySharedProperties,
  to: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const CronDeliveryWebhookSchema = _typebox.Type.Object({
  mode: _typebox.Type.Literal("webhook"),
  ...CronDeliverySharedProperties,
  to: NonEmptyString
}, { additionalProperties: false });
const CronDeliverySchema = _typebox.Type.Union([
CronDeliveryNoopSchema,
CronDeliveryAnnounceSchema,
CronDeliveryWebhookSchema]
);
const CronDeliveryPatchSchema = _typebox.Type.Object({
  mode: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("none"),
  _typebox.Type.Literal("announce"),
  _typebox.Type.Literal("webhook")]
  )),
  ...CronDeliverySharedProperties,
  to: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const CronJobStateSchema = _typebox.Type.Object({
  nextRunAtMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  runningAtMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastRunAtMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastRunStatus: _typebox.Type.Optional(CronRunStatusSchema),
  lastStatus: _typebox.Type.Optional(CronRunStatusSchema),
  lastError: _typebox.Type.Optional(_typebox.Type.String()),
  lastErrorReason: _typebox.Type.Optional(CronFailoverReasonSchema),
  lastDurationMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  consecutiveErrors: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastDelivered: _typebox.Type.Optional(_typebox.Type.Boolean()),
  lastDeliveryStatus: _typebox.Type.Optional(CronDeliveryStatusSchema),
  lastDeliveryError: _typebox.Type.Optional(_typebox.Type.String()),
  lastFailureAlertAtMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
_typebox.Type.Object({
  id: NonEmptyString,
  agentId: _typebox.Type.Optional(NonEmptyString),
  sessionKey: _typebox.Type.Optional(NonEmptyString),
  name: NonEmptyString,
  description: _typebox.Type.Optional(_typebox.Type.String()),
  enabled: _typebox.Type.Boolean(),
  deleteAfterRun: _typebox.Type.Optional(_typebox.Type.Boolean()),
  createdAtMs: _typebox.Type.Integer({ minimum: 0 }),
  updatedAtMs: _typebox.Type.Integer({ minimum: 0 }),
  schedule: CronScheduleSchema,
  sessionTarget: CronSessionTargetSchema,
  wakeMode: CronWakeModeSchema,
  payload: CronPayloadSchema,
  delivery: _typebox.Type.Optional(CronDeliverySchema),
  failureAlert: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal(false), CronFailureAlertSchema])),
  state: CronJobStateSchema
}, { additionalProperties: false });
const CronListParamsSchema = _typebox.Type.Object({
  includeDisabled: _typebox.Type.Optional(_typebox.Type.Boolean()),
  limit: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: 200
  })),
  offset: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  query: _typebox.Type.Optional(_typebox.Type.String()),
  enabled: _typebox.Type.Optional(CronJobsEnabledFilterSchema),
  sortBy: _typebox.Type.Optional(CronJobsSortBySchema),
  sortDir: _typebox.Type.Optional(CronSortDirSchema)
}, { additionalProperties: false });
const CronStatusParamsSchema = _typebox.Type.Object({}, { additionalProperties: false });
const CronAddParamsSchema = _typebox.Type.Object({
  name: NonEmptyString,
  ...CronCommonOptionalFields,
  schedule: CronScheduleSchema,
  sessionTarget: CronSessionTargetSchema,
  wakeMode: CronWakeModeSchema,
  payload: CronPayloadSchema,
  delivery: _typebox.Type.Optional(CronDeliverySchema),
  failureAlert: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal(false), CronFailureAlertSchema]))
}, { additionalProperties: false });
const CronUpdateParamsSchema = cronIdOrJobIdParams({ patch: _typebox.Type.Object({
    name: _typebox.Type.Optional(NonEmptyString),
    ...CronCommonOptionalFields,
    schedule: _typebox.Type.Optional(CronScheduleSchema),
    sessionTarget: _typebox.Type.Optional(CronSessionTargetSchema),
    wakeMode: _typebox.Type.Optional(CronWakeModeSchema),
    payload: _typebox.Type.Optional(CronPayloadPatchSchema),
    delivery: _typebox.Type.Optional(CronDeliveryPatchSchema),
    failureAlert: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal(false), CronFailureAlertSchema])),
    state: _typebox.Type.Optional(_typebox.Type.Partial(CronJobStateSchema))
  }, { additionalProperties: false }) });
const CronRemoveParamsSchema = cronIdOrJobIdParams({});
const CronRunParamsSchema = cronIdOrJobIdParams({ mode: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("due"), _typebox.Type.Literal("force")])) });
const CronRunsParamsSchema = _typebox.Type.Object({
  scope: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("job"), _typebox.Type.Literal("all")])),
  id: _typebox.Type.Optional(CronRunLogJobIdSchema),
  jobId: _typebox.Type.Optional(CronRunLogJobIdSchema),
  limit: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: 200
  })),
  offset: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  statuses: _typebox.Type.Optional(_typebox.Type.Array(CronRunsStatusValueSchema, {
    minItems: 1,
    maxItems: 3
  })),
  status: _typebox.Type.Optional(CronRunsStatusFilterSchema),
  deliveryStatuses: _typebox.Type.Optional(_typebox.Type.Array(CronDeliveryStatusSchema, {
    minItems: 1,
    maxItems: 4
  })),
  deliveryStatus: _typebox.Type.Optional(CronDeliveryStatusSchema),
  query: _typebox.Type.Optional(_typebox.Type.String()),
  sortDir: _typebox.Type.Optional(CronSortDirSchema)
}, { additionalProperties: false });
_typebox.Type.Object({
  ts: _typebox.Type.Integer({ minimum: 0 }),
  jobId: NonEmptyString,
  action: _typebox.Type.Literal("finished"),
  status: _typebox.Type.Optional(CronRunStatusSchema),
  error: _typebox.Type.Optional(_typebox.Type.String()),
  summary: _typebox.Type.Optional(_typebox.Type.String()),
  delivered: _typebox.Type.Optional(_typebox.Type.Boolean()),
  deliveryStatus: _typebox.Type.Optional(CronDeliveryStatusSchema),
  deliveryError: _typebox.Type.Optional(_typebox.Type.String()),
  sessionId: _typebox.Type.Optional(NonEmptyString),
  sessionKey: _typebox.Type.Optional(NonEmptyString),
  runAtMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  durationMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  nextRunAtMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  model: _typebox.Type.Optional(_typebox.Type.String()),
  provider: _typebox.Type.Optional(_typebox.Type.String()),
  usage: _typebox.Type.Optional(_typebox.Type.Object({
    input_tokens: _typebox.Type.Optional(_typebox.Type.Number()),
    output_tokens: _typebox.Type.Optional(_typebox.Type.Number()),
    total_tokens: _typebox.Type.Optional(_typebox.Type.Number()),
    cache_read_tokens: _typebox.Type.Optional(_typebox.Type.Number()),
    cache_write_tokens: _typebox.Type.Optional(_typebox.Type.Number())
  }, { additionalProperties: false })),
  jobName: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/error-codes.ts
const ErrorCodes = exports.nn = {
  NOT_LINKED: "NOT_LINKED",
  NOT_PAIRED: "NOT_PAIRED",
  AGENT_TIMEOUT: "AGENT_TIMEOUT",
  INVALID_REQUEST: "INVALID_REQUEST",
  APPROVAL_NOT_FOUND: "APPROVAL_NOT_FOUND",
  UNAVAILABLE: "UNAVAILABLE"
};
function errorShape(code, message, opts) {
  return {
    code,
    message,
    ...opts
  };
}
//#endregion
//#region src/gateway/protocol/schema/exec-approvals.ts
const ExecApprovalsAllowlistEntrySchema = _typebox.Type.Object({
  id: _typebox.Type.Optional(NonEmptyString),
  pattern: _typebox.Type.String(),
  argPattern: _typebox.Type.Optional(_typebox.Type.String()),
  lastUsedAt: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  lastUsedCommand: _typebox.Type.Optional(_typebox.Type.String()),
  lastResolvedPath: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const ExecApprovalsPolicyFields = {
  security: _typebox.Type.Optional(_typebox.Type.String()),
  ask: _typebox.Type.Optional(_typebox.Type.String()),
  askFallback: _typebox.Type.Optional(_typebox.Type.String()),
  autoAllowSkills: _typebox.Type.Optional(_typebox.Type.Boolean())
};
const ExecApprovalsDefaultsSchema = _typebox.Type.Object(ExecApprovalsPolicyFields, { additionalProperties: false });
const ExecApprovalsAgentSchema = _typebox.Type.Object({
  ...ExecApprovalsPolicyFields,
  allowlist: _typebox.Type.Optional(_typebox.Type.Array(ExecApprovalsAllowlistEntrySchema))
}, { additionalProperties: false });
const ExecApprovalsFileSchema = _typebox.Type.Object({
  version: _typebox.Type.Literal(1),
  socket: _typebox.Type.Optional(_typebox.Type.Object({
    path: _typebox.Type.Optional(_typebox.Type.String()),
    token: _typebox.Type.Optional(_typebox.Type.String())
  }, { additionalProperties: false })),
  defaults: _typebox.Type.Optional(ExecApprovalsDefaultsSchema),
  agents: _typebox.Type.Optional(_typebox.Type.Record(_typebox.Type.String(), ExecApprovalsAgentSchema))
}, { additionalProperties: false });
_typebox.Type.Object({
  path: NonEmptyString,
  exists: _typebox.Type.Boolean(),
  hash: NonEmptyString,
  file: ExecApprovalsFileSchema
}, { additionalProperties: false });
const ExecApprovalsGetParamsSchema = _typebox.Type.Object({}, { additionalProperties: false });
const ExecApprovalsSetParamsSchema = _typebox.Type.Object({
  file: ExecApprovalsFileSchema,
  baseHash: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const ExecApprovalsNodeGetParamsSchema = _typebox.Type.Object({ nodeId: NonEmptyString }, { additionalProperties: false });
const ExecApprovalsNodeSetParamsSchema = _typebox.Type.Object({
  nodeId: NonEmptyString,
  file: ExecApprovalsFileSchema,
  baseHash: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const ExecApprovalGetParamsSchema = _typebox.Type.Object({ id: NonEmptyString }, { additionalProperties: false });
const ExecApprovalRequestParamsSchema = _typebox.Type.Object({
  id: _typebox.Type.Optional(NonEmptyString),
  command: _typebox.Type.Optional(NonEmptyString),
  commandArgv: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.String())),
  systemRunPlan: _typebox.Type.Optional(_typebox.Type.Object({
    argv: _typebox.Type.Array(_typebox.Type.String()),
    cwd: _typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()]),
    commandText: _typebox.Type.String(),
    commandPreview: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
    agentId: _typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()]),
    sessionKey: _typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()]),
    mutableFileOperand: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Object({
      argvIndex: _typebox.Type.Integer({ minimum: 0 }),
      path: _typebox.Type.String(),
      sha256: _typebox.Type.String()
    }, { additionalProperties: false }), _typebox.Type.Null()]))
  }, { additionalProperties: false })),
  env: _typebox.Type.Optional(_typebox.Type.Record(NonEmptyString, _typebox.Type.String())),
  cwd: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  nodeId: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  host: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  security: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  ask: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  agentId: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  resolvedPath: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  sessionKey: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  turnSourceChannel: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  turnSourceTo: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  turnSourceAccountId: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Null()])),
  turnSourceThreadId: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.String(),
  _typebox.Type.Number(),
  _typebox.Type.Null()]
  )),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 })),
  twoPhase: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
const ExecApprovalResolveParamsSchema = _typebox.Type.Object({
  id: NonEmptyString,
  decision: NonEmptyString
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/devices.ts
const DevicePairListParamsSchema = _typebox.Type.Object({}, { additionalProperties: false });
const DevicePairApproveParamsSchema = _typebox.Type.Object({ requestId: NonEmptyString }, { additionalProperties: false });
const DevicePairRejectParamsSchema = _typebox.Type.Object({ requestId: NonEmptyString }, { additionalProperties: false });
const DevicePairRemoveParamsSchema = _typebox.Type.Object({ deviceId: NonEmptyString }, { additionalProperties: false });
const DeviceTokenRotateParamsSchema = _typebox.Type.Object({
  deviceId: NonEmptyString,
  role: NonEmptyString,
  scopes: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString))
}, { additionalProperties: false });
const DeviceTokenRevokeParamsSchema = _typebox.Type.Object({
  deviceId: NonEmptyString,
  role: NonEmptyString
}, { additionalProperties: false });
_typebox.Type.Object({
  requestId: NonEmptyString,
  deviceId: NonEmptyString,
  publicKey: NonEmptyString,
  displayName: _typebox.Type.Optional(NonEmptyString),
  platform: _typebox.Type.Optional(NonEmptyString),
  deviceFamily: _typebox.Type.Optional(NonEmptyString),
  clientId: _typebox.Type.Optional(NonEmptyString),
  clientMode: _typebox.Type.Optional(NonEmptyString),
  role: _typebox.Type.Optional(NonEmptyString),
  roles: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString)),
  scopes: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString)),
  remoteIp: _typebox.Type.Optional(NonEmptyString),
  silent: _typebox.Type.Optional(_typebox.Type.Boolean()),
  isRepair: _typebox.Type.Optional(_typebox.Type.Boolean()),
  ts: _typebox.Type.Integer({ minimum: 0 })
}, { additionalProperties: false });
_typebox.Type.Object({
  requestId: NonEmptyString,
  deviceId: NonEmptyString,
  decision: NonEmptyString,
  ts: _typebox.Type.Integer({ minimum: 0 })
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/snapshot.ts
const PresenceEntrySchema = _typebox.Type.Object({
  host: _typebox.Type.Optional(NonEmptyString),
  ip: _typebox.Type.Optional(NonEmptyString),
  version: _typebox.Type.Optional(NonEmptyString),
  platform: _typebox.Type.Optional(NonEmptyString),
  deviceFamily: _typebox.Type.Optional(NonEmptyString),
  modelIdentifier: _typebox.Type.Optional(NonEmptyString),
  mode: _typebox.Type.Optional(NonEmptyString),
  lastInputSeconds: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  reason: _typebox.Type.Optional(NonEmptyString),
  tags: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString)),
  text: _typebox.Type.Optional(_typebox.Type.String()),
  ts: _typebox.Type.Integer({ minimum: 0 }),
  deviceId: _typebox.Type.Optional(NonEmptyString),
  roles: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString)),
  scopes: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString)),
  instanceId: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const HealthSnapshotSchema = _typebox.Type.Any();
const SessionDefaultsSchema = _typebox.Type.Object({
  defaultAgentId: NonEmptyString,
  mainKey: NonEmptyString,
  mainSessionKey: NonEmptyString,
  scope: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const StateVersionSchema = _typebox.Type.Object({
  presence: _typebox.Type.Integer({ minimum: 0 }),
  health: _typebox.Type.Integer({ minimum: 0 })
}, { additionalProperties: false });
const SnapshotSchema = _typebox.Type.Object({
  presence: _typebox.Type.Array(PresenceEntrySchema),
  health: HealthSnapshotSchema,
  stateVersion: StateVersionSchema,
  uptimeMs: _typebox.Type.Integer({ minimum: 0 }),
  configPath: _typebox.Type.Optional(NonEmptyString),
  stateDir: _typebox.Type.Optional(NonEmptyString),
  sessionDefaults: _typebox.Type.Optional(SessionDefaultsSchema),
  authMode: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("none"),
  _typebox.Type.Literal("token"),
  _typebox.Type.Literal("password"),
  _typebox.Type.Literal("trusted-proxy")]
  )),
  updateAvailable: _typebox.Type.Optional(_typebox.Type.Object({
    currentVersion: NonEmptyString,
    latestVersion: NonEmptyString,
    channel: NonEmptyString
  }))
}, { additionalProperties: false });
_typebox.Type.Object({ ts: _typebox.Type.Integer({ minimum: 0 }) }, { additionalProperties: false });
_typebox.Type.Object({
  reason: NonEmptyString,
  restartExpectedMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const ConnectParamsSchema = _typebox.Type.Object({
  minProtocol: _typebox.Type.Integer({ minimum: 1 }),
  maxProtocol: _typebox.Type.Integer({ minimum: 1 }),
  client: _typebox.Type.Object({
    id: GatewayClientIdSchema,
    displayName: _typebox.Type.Optional(NonEmptyString),
    version: NonEmptyString,
    platform: NonEmptyString,
    deviceFamily: _typebox.Type.Optional(NonEmptyString),
    modelIdentifier: _typebox.Type.Optional(NonEmptyString),
    mode: GatewayClientModeSchema,
    instanceId: _typebox.Type.Optional(NonEmptyString)
  }, { additionalProperties: false }),
  caps: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString, { default: [] })),
  commands: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString)),
  permissions: _typebox.Type.Optional(_typebox.Type.Record(NonEmptyString, _typebox.Type.Boolean())),
  pathEnv: _typebox.Type.Optional(_typebox.Type.String()),
  role: _typebox.Type.Optional(NonEmptyString),
  scopes: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString)),
  device: _typebox.Type.Optional(_typebox.Type.Object({
    id: NonEmptyString,
    publicKey: NonEmptyString,
    signature: NonEmptyString,
    signedAt: _typebox.Type.Integer({ minimum: 0 }),
    nonce: NonEmptyString
  }, { additionalProperties: false })),
  auth: _typebox.Type.Optional(_typebox.Type.Object({
    token: _typebox.Type.Optional(_typebox.Type.String()),
    bootstrapToken: _typebox.Type.Optional(_typebox.Type.String()),
    deviceToken: _typebox.Type.Optional(_typebox.Type.String()),
    password: _typebox.Type.Optional(_typebox.Type.String())
  }, { additionalProperties: false })),
  locale: _typebox.Type.Optional(_typebox.Type.String()),
  userAgent: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
_typebox.Type.Object({
  type: _typebox.Type.Literal("hello-ok"),
  protocol: _typebox.Type.Integer({ minimum: 1 }),
  server: _typebox.Type.Object({
    version: NonEmptyString,
    connId: NonEmptyString
  }, { additionalProperties: false }),
  features: _typebox.Type.Object({
    methods: _typebox.Type.Array(NonEmptyString),
    events: _typebox.Type.Array(NonEmptyString)
  }, { additionalProperties: false }),
  snapshot: SnapshotSchema,
  canvasHostUrl: _typebox.Type.Optional(NonEmptyString),
  auth: _typebox.Type.Optional(_typebox.Type.Object({
    deviceToken: NonEmptyString,
    role: NonEmptyString,
    scopes: _typebox.Type.Array(NonEmptyString),
    issuedAtMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
    deviceTokens: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.Object({
      deviceToken: NonEmptyString,
      role: NonEmptyString,
      scopes: _typebox.Type.Array(NonEmptyString),
      issuedAtMs: _typebox.Type.Integer({ minimum: 0 })
    }, { additionalProperties: false })))
  }, { additionalProperties: false })),
  policy: _typebox.Type.Object({
    maxPayload: _typebox.Type.Integer({ minimum: 1 }),
    maxBufferedBytes: _typebox.Type.Integer({ minimum: 1 }),
    tickIntervalMs: _typebox.Type.Integer({ minimum: 1 })
  }, { additionalProperties: false })
}, { additionalProperties: false });
const ErrorShapeSchema = _typebox.Type.Object({
  code: NonEmptyString,
  message: NonEmptyString,
  details: _typebox.Type.Optional(_typebox.Type.Unknown()),
  retryable: _typebox.Type.Optional(_typebox.Type.Boolean()),
  retryAfterMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const RequestFrameSchema = _typebox.Type.Object({
  type: _typebox.Type.Literal("req"),
  id: NonEmptyString,
  method: NonEmptyString,
  params: _typebox.Type.Optional(_typebox.Type.Unknown())
}, { additionalProperties: false });
const ResponseFrameSchema = _typebox.Type.Object({
  type: _typebox.Type.Literal("res"),
  id: NonEmptyString,
  ok: _typebox.Type.Boolean(),
  payload: _typebox.Type.Optional(_typebox.Type.Unknown()),
  error: _typebox.Type.Optional(ErrorShapeSchema)
}, { additionalProperties: false });
const EventFrameSchema = _typebox.Type.Object({
  type: _typebox.Type.Literal("event"),
  event: NonEmptyString,
  payload: _typebox.Type.Optional(_typebox.Type.Unknown()),
  seq: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  stateVersion: _typebox.Type.Optional(StateVersionSchema)
}, { additionalProperties: false });
_typebox.Type.Union([
RequestFrameSchema,
ResponseFrameSchema,
EventFrameSchema],
{ discriminator: "type" });
//#endregion
//#region src/gateway/protocol/schema/logs-chat.ts
const LogsTailParamsSchema = _typebox.Type.Object({
  cursor: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  limit: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: 5e3
  })),
  maxBytes: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: 1e6
  }))
}, { additionalProperties: false });
_typebox.Type.Object({
  file: NonEmptyString,
  cursor: _typebox.Type.Integer({ minimum: 0 }),
  size: _typebox.Type.Integer({ minimum: 0 }),
  lines: _typebox.Type.Array(_typebox.Type.String()),
  truncated: _typebox.Type.Optional(_typebox.Type.Boolean()),
  reset: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
const ChatHistoryParamsSchema = _typebox.Type.Object({
  sessionKey: NonEmptyString,
  limit: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: 1e3
  })),
  maxChars: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: 5e5
  }))
}, { additionalProperties: false });
const ChatSendParamsSchema = _typebox.Type.Object({
  sessionKey: ChatSendSessionKeyString,
  message: _typebox.Type.String(),
  thinking: _typebox.Type.Optional(_typebox.Type.String()),
  deliver: _typebox.Type.Optional(_typebox.Type.Boolean()),
  originatingChannel: _typebox.Type.Optional(_typebox.Type.String()),
  originatingTo: _typebox.Type.Optional(_typebox.Type.String()),
  originatingAccountId: _typebox.Type.Optional(_typebox.Type.String()),
  originatingThreadId: _typebox.Type.Optional(_typebox.Type.String()),
  attachments: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.Unknown())),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  systemInputProvenance: _typebox.Type.Optional(InputProvenanceSchema),
  systemProvenanceReceipt: _typebox.Type.Optional(_typebox.Type.String()),
  idempotencyKey: NonEmptyString
}, { additionalProperties: false });
const ChatAbortParamsSchema = _typebox.Type.Object({
  sessionKey: NonEmptyString,
  runId: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const ChatInjectParamsSchema = _typebox.Type.Object({
  sessionKey: NonEmptyString,
  message: NonEmptyString,
  label: _typebox.Type.Optional(_typebox.Type.String({ maxLength: 100 }))
}, { additionalProperties: false });
const ChatEventSchema = _typebox.Type.Object({
  runId: NonEmptyString,
  sessionKey: NonEmptyString,
  seq: _typebox.Type.Integer({ minimum: 0 }),
  state: _typebox.Type.Union([
  _typebox.Type.Literal("delta"),
  _typebox.Type.Literal("final"),
  _typebox.Type.Literal("aborted"),
  _typebox.Type.Literal("error")]
  ),
  message: _typebox.Type.Optional(_typebox.Type.Unknown()),
  errorMessage: _typebox.Type.Optional(_typebox.Type.String()),
  errorKind: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("refusal"),
  _typebox.Type.Literal("timeout"),
  _typebox.Type.Literal("rate_limit"),
  _typebox.Type.Literal("context_length"),
  _typebox.Type.Literal("unknown")]
  )),
  usage: _typebox.Type.Optional(_typebox.Type.Unknown()),
  stopReason: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/nodes.ts
const NodePendingWorkTypeSchema = _typebox.Type.String({ enum: ["status.request", "location.request"] });
const NodePendingWorkPrioritySchema = _typebox.Type.String({ enum: ["normal", "high"] });
const NodePairRequestParamsSchema = _typebox.Type.Object({
  nodeId: NonEmptyString,
  displayName: _typebox.Type.Optional(NonEmptyString),
  platform: _typebox.Type.Optional(NonEmptyString),
  version: _typebox.Type.Optional(NonEmptyString),
  coreVersion: _typebox.Type.Optional(NonEmptyString),
  uiVersion: _typebox.Type.Optional(NonEmptyString),
  deviceFamily: _typebox.Type.Optional(NonEmptyString),
  modelIdentifier: _typebox.Type.Optional(NonEmptyString),
  caps: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString)),
  commands: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString)),
  remoteIp: _typebox.Type.Optional(NonEmptyString),
  silent: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
const NodePairListParamsSchema = _typebox.Type.Object({}, { additionalProperties: false });
const NodePairApproveParamsSchema = _typebox.Type.Object({ requestId: NonEmptyString }, { additionalProperties: false });
const NodePairRejectParamsSchema = _typebox.Type.Object({ requestId: NonEmptyString }, { additionalProperties: false });
const NodePairVerifyParamsSchema = _typebox.Type.Object({
  nodeId: NonEmptyString,
  token: NonEmptyString
}, { additionalProperties: false });
const NodeRenameParamsSchema = _typebox.Type.Object({
  nodeId: NonEmptyString,
  displayName: NonEmptyString
}, { additionalProperties: false });
const NodeListParamsSchema = _typebox.Type.Object({}, { additionalProperties: false });
const NodePendingAckParamsSchema = _typebox.Type.Object({ ids: _typebox.Type.Array(NonEmptyString, { minItems: 1 }) }, { additionalProperties: false });
const NodeDescribeParamsSchema = _typebox.Type.Object({ nodeId: NonEmptyString }, { additionalProperties: false });
const NodeInvokeParamsSchema = _typebox.Type.Object({
  nodeId: NonEmptyString,
  command: NonEmptyString,
  params: _typebox.Type.Optional(_typebox.Type.Unknown()),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  idempotencyKey: NonEmptyString
}, { additionalProperties: false });
const NodeInvokeResultParamsSchema = _typebox.Type.Object({
  id: NonEmptyString,
  nodeId: NonEmptyString,
  ok: _typebox.Type.Boolean(),
  payload: _typebox.Type.Optional(_typebox.Type.Unknown()),
  payloadJSON: _typebox.Type.Optional(_typebox.Type.String()),
  error: _typebox.Type.Optional(_typebox.Type.Object({
    code: _typebox.Type.Optional(NonEmptyString),
    message: _typebox.Type.Optional(NonEmptyString)
  }, { additionalProperties: false }))
}, { additionalProperties: false });
const NodeEventParamsSchema = _typebox.Type.Object({
  event: NonEmptyString,
  payload: _typebox.Type.Optional(_typebox.Type.Unknown()),
  payloadJSON: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const NodePendingDrainParamsSchema = _typebox.Type.Object({ maxItems: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: 10
  })) }, { additionalProperties: false });
const NodePendingDrainItemSchema = _typebox.Type.Object({
  id: NonEmptyString,
  type: NodePendingWorkTypeSchema,
  priority: _typebox.Type.String({ enum: [
    "default",
    "normal",
    "high"]
  }),
  createdAtMs: _typebox.Type.Integer({ minimum: 0 }),
  expiresAtMs: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Integer({ minimum: 0 }), _typebox.Type.Null()])),
  payload: _typebox.Type.Optional(_typebox.Type.Record(_typebox.Type.String(), _typebox.Type.Unknown()))
}, { additionalProperties: false });
_typebox.Type.Object({
  nodeId: NonEmptyString,
  revision: _typebox.Type.Integer({ minimum: 0 }),
  items: _typebox.Type.Array(NodePendingDrainItemSchema),
  hasMore: _typebox.Type.Boolean()
}, { additionalProperties: false });
const NodePendingEnqueueParamsSchema = _typebox.Type.Object({
  nodeId: NonEmptyString,
  type: NodePendingWorkTypeSchema,
  priority: _typebox.Type.Optional(NodePendingWorkPrioritySchema),
  expiresInMs: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1e3,
    maximum: 864e5
  })),
  wake: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
_typebox.Type.Object({
  nodeId: NonEmptyString,
  revision: _typebox.Type.Integer({ minimum: 0 }),
  queued: NodePendingDrainItemSchema,
  wakeTriggered: _typebox.Type.Boolean()
}, { additionalProperties: false });
_typebox.Type.Object({
  id: NonEmptyString,
  nodeId: NonEmptyString,
  command: NonEmptyString,
  paramsJSON: _typebox.Type.Optional(_typebox.Type.String()),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  idempotencyKey: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/plugin-approvals.ts
const PluginApprovalRequestParamsSchema = _typebox.Type.Object({
  pluginId: _typebox.Type.Optional(NonEmptyString),
  title: _typebox.Type.String({
    minLength: 1,
    maxLength: 80
  }),
  description: _typebox.Type.String({
    minLength: 1,
    maxLength: 256
  }),
  severity: _typebox.Type.Optional(_typebox.Type.String({ enum: [
    "info",
    "warning",
    "critical"]
  })),
  toolName: _typebox.Type.Optional(_typebox.Type.String()),
  toolCallId: _typebox.Type.Optional(_typebox.Type.String()),
  agentId: _typebox.Type.Optional(_typebox.Type.String()),
  sessionKey: _typebox.Type.Optional(_typebox.Type.String()),
  turnSourceChannel: _typebox.Type.Optional(_typebox.Type.String()),
  turnSourceTo: _typebox.Type.Optional(_typebox.Type.String()),
  turnSourceAccountId: _typebox.Type.Optional(_typebox.Type.String()),
  turnSourceThreadId: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.String(), _typebox.Type.Number()])),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({
    minimum: 1,
    maximum: _pluginApprovalsB00c1v.n
  })),
  twoPhase: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
const PluginApprovalResolveParamsSchema = _typebox.Type.Object({
  id: NonEmptyString,
  decision: NonEmptyString
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/push.ts
const ApnsEnvironmentSchema = _typebox.Type.String({ enum: ["sandbox", "production"] });
const PushTestParamsSchema = _typebox.Type.Object({
  nodeId: NonEmptyString,
  title: _typebox.Type.Optional(_typebox.Type.String()),
  body: _typebox.Type.Optional(_typebox.Type.String()),
  environment: _typebox.Type.Optional(ApnsEnvironmentSchema)
}, { additionalProperties: false });
_typebox.Type.Object({
  ok: _typebox.Type.Boolean(),
  status: _typebox.Type.Integer(),
  apnsId: _typebox.Type.Optional(_typebox.Type.String()),
  reason: _typebox.Type.Optional(_typebox.Type.String()),
  tokenSuffix: _typebox.Type.String(),
  topic: _typebox.Type.String(),
  environment: ApnsEnvironmentSchema,
  transport: _typebox.Type.String({ enum: ["direct", "relay"] })
}, { additionalProperties: false });
_typebox.Type.Object({}, { additionalProperties: false });
const SecretsResolveParamsSchema = _typebox.Type.Object({
  commandName: NonEmptyString,
  targetIds: _typebox.Type.Array(NonEmptyString)
}, { additionalProperties: false });
const SecretsResolveAssignmentSchema = _typebox.Type.Object({
  path: _typebox.Type.Optional(NonEmptyString),
  pathSegments: _typebox.Type.Array(NonEmptyString),
  value: _typebox.Type.Unknown()
}, { additionalProperties: false });
const SecretsResolveResultSchema = _typebox.Type.Object({
  ok: _typebox.Type.Optional(_typebox.Type.Boolean()),
  assignments: _typebox.Type.Optional(_typebox.Type.Array(SecretsResolveAssignmentSchema)),
  diagnostics: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString)),
  inactiveRefPaths: _typebox.Type.Optional(_typebox.Type.Array(NonEmptyString))
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/sessions.ts
const SessionCompactionCheckpointReasonSchema = _typebox.Type.Union([
_typebox.Type.Literal("manual"),
_typebox.Type.Literal("auto-threshold"),
_typebox.Type.Literal("overflow-retry"),
_typebox.Type.Literal("timeout-retry")]
);
const SessionCompactionTranscriptReferenceSchema = _typebox.Type.Object({
  sessionId: NonEmptyString,
  sessionFile: _typebox.Type.Optional(NonEmptyString),
  leafId: _typebox.Type.Optional(NonEmptyString),
  entryId: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const SessionCompactionCheckpointSchema = _typebox.Type.Object({
  checkpointId: NonEmptyString,
  sessionKey: NonEmptyString,
  sessionId: NonEmptyString,
  createdAt: _typebox.Type.Integer({ minimum: 0 }),
  reason: SessionCompactionCheckpointReasonSchema,
  tokensBefore: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  tokensAfter: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  summary: _typebox.Type.Optional(_typebox.Type.String()),
  firstKeptEntryId: _typebox.Type.Optional(NonEmptyString),
  preCompaction: SessionCompactionTranscriptReferenceSchema,
  postCompaction: SessionCompactionTranscriptReferenceSchema
}, { additionalProperties: false });
const SessionsListParamsSchema = _typebox.Type.Object({
  limit: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 })),
  activeMinutes: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 })),
  includeGlobal: _typebox.Type.Optional(_typebox.Type.Boolean()),
  includeUnknown: _typebox.Type.Optional(_typebox.Type.Boolean()),
  includeDerivedTitles: _typebox.Type.Optional(_typebox.Type.Boolean()),
  includeLastMessage: _typebox.Type.Optional(_typebox.Type.Boolean()),
  label: _typebox.Type.Optional(SessionLabelString),
  spawnedBy: _typebox.Type.Optional(NonEmptyString),
  agentId: _typebox.Type.Optional(NonEmptyString),
  search: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const SessionsPreviewParamsSchema = _typebox.Type.Object({
  keys: _typebox.Type.Array(NonEmptyString, { minItems: 1 }),
  limit: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 })),
  maxChars: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 20 }))
}, { additionalProperties: false });
const SessionsResolveParamsSchema = _typebox.Type.Object({
  key: _typebox.Type.Optional(NonEmptyString),
  sessionId: _typebox.Type.Optional(NonEmptyString),
  label: _typebox.Type.Optional(SessionLabelString),
  agentId: _typebox.Type.Optional(NonEmptyString),
  spawnedBy: _typebox.Type.Optional(NonEmptyString),
  includeGlobal: _typebox.Type.Optional(_typebox.Type.Boolean()),
  includeUnknown: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
const SessionsCreateParamsSchema = _typebox.Type.Object({
  key: _typebox.Type.Optional(NonEmptyString),
  agentId: _typebox.Type.Optional(NonEmptyString),
  label: _typebox.Type.Optional(SessionLabelString),
  model: _typebox.Type.Optional(NonEmptyString),
  parentSessionKey: _typebox.Type.Optional(NonEmptyString),
  task: _typebox.Type.Optional(_typebox.Type.String()),
  message: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const SessionsSendParamsSchema = _typebox.Type.Object({
  key: NonEmptyString,
  message: _typebox.Type.String(),
  thinking: _typebox.Type.Optional(_typebox.Type.String()),
  attachments: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.Unknown())),
  timeoutMs: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 0 })),
  idempotencyKey: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const SessionsMessagesSubscribeParamsSchema = _typebox.Type.Object({ key: NonEmptyString }, { additionalProperties: false });
const SessionsMessagesUnsubscribeParamsSchema = _typebox.Type.Object({ key: NonEmptyString }, { additionalProperties: false });
const SessionsAbortParamsSchema = _typebox.Type.Object({
  key: NonEmptyString,
  runId: _typebox.Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const SessionsPatchParamsSchema = _typebox.Type.Object({
  key: NonEmptyString,
  label: _typebox.Type.Optional(_typebox.Type.Union([SessionLabelString, _typebox.Type.Null()])),
  thinkingLevel: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  fastMode: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Boolean(), _typebox.Type.Null()])),
  verboseLevel: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  traceLevel: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  reasoningLevel: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  responseUsage: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("off"),
  _typebox.Type.Literal("tokens"),
  _typebox.Type.Literal("full"),
  _typebox.Type.Literal("on"),
  _typebox.Type.Null()]
  )),
  elevatedLevel: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  execHost: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  execSecurity: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  execAsk: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  execNode: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  model: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  spawnedBy: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  spawnedWorkspaceDir: _typebox.Type.Optional(_typebox.Type.Union([NonEmptyString, _typebox.Type.Null()])),
  spawnDepth: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Integer({ minimum: 0 }), _typebox.Type.Null()])),
  subagentRole: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("orchestrator"),
  _typebox.Type.Literal("leaf"),
  _typebox.Type.Null()]
  )),
  subagentControlScope: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("children"),
  _typebox.Type.Literal("none"),
  _typebox.Type.Null()]
  )),
  sendPolicy: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("allow"),
  _typebox.Type.Literal("deny"),
  _typebox.Type.Null()]
  )),
  groupActivation: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("mention"),
  _typebox.Type.Literal("always"),
  _typebox.Type.Null()]
  ))
}, { additionalProperties: false });
const SessionsResetParamsSchema = _typebox.Type.Object({
  key: NonEmptyString,
  reason: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("new"), _typebox.Type.Literal("reset")]))
}, { additionalProperties: false });
const SessionsDeleteParamsSchema = _typebox.Type.Object({
  key: NonEmptyString,
  deleteTranscript: _typebox.Type.Optional(_typebox.Type.Boolean()),
  emitLifecycleHooks: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
const SessionsCompactParamsSchema = _typebox.Type.Object({
  key: NonEmptyString,
  maxLines: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 }))
}, { additionalProperties: false });
const SessionsCompactionListParamsSchema = _typebox.Type.Object({ key: NonEmptyString }, { additionalProperties: false });
const SessionsCompactionGetParamsSchema = _typebox.Type.Object({
  key: NonEmptyString,
  checkpointId: NonEmptyString
}, { additionalProperties: false });
const SessionsCompactionBranchParamsSchema = _typebox.Type.Object({
  key: NonEmptyString,
  checkpointId: NonEmptyString
}, { additionalProperties: false });
const SessionsCompactionRestoreParamsSchema = _typebox.Type.Object({
  key: NonEmptyString,
  checkpointId: NonEmptyString
}, { additionalProperties: false });
_typebox.Type.Object({
  ok: _typebox.Type.Literal(true),
  key: NonEmptyString,
  checkpoints: _typebox.Type.Array(SessionCompactionCheckpointSchema)
}, { additionalProperties: false });
_typebox.Type.Object({
  ok: _typebox.Type.Literal(true),
  key: NonEmptyString,
  checkpoint: SessionCompactionCheckpointSchema
}, { additionalProperties: false });
_typebox.Type.Object({
  ok: _typebox.Type.Literal(true),
  sourceKey: NonEmptyString,
  key: NonEmptyString,
  sessionId: NonEmptyString,
  checkpoint: SessionCompactionCheckpointSchema,
  entry: _typebox.Type.Object({
    sessionId: NonEmptyString,
    updatedAt: _typebox.Type.Integer({ minimum: 0 })
  }, { additionalProperties: true })
}, { additionalProperties: false });
_typebox.Type.Object({
  ok: _typebox.Type.Literal(true),
  key: NonEmptyString,
  sessionId: NonEmptyString,
  checkpoint: SessionCompactionCheckpointSchema,
  entry: _typebox.Type.Object({
    sessionId: NonEmptyString,
    updatedAt: _typebox.Type.Integer({ minimum: 0 })
  }, { additionalProperties: true })
}, { additionalProperties: false });
const SessionsUsageParamsSchema = _typebox.Type.Object({
  key: _typebox.Type.Optional(NonEmptyString),
  startDate: _typebox.Type.Optional(_typebox.Type.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
  endDate: _typebox.Type.Optional(_typebox.Type.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
  mode: _typebox.Type.Optional(_typebox.Type.Union([
  _typebox.Type.Literal("utc"),
  _typebox.Type.Literal("gateway"),
  _typebox.Type.Literal("specific")]
  )),
  utcOffset: _typebox.Type.Optional(_typebox.Type.String({ pattern: "^UTC[+-]\\d{1,2}(?::[0-5]\\d)?$" })),
  limit: _typebox.Type.Optional(_typebox.Type.Integer({ minimum: 1 })),
  includeContextWeight: _typebox.Type.Optional(_typebox.Type.Boolean())
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/wizard.ts
const WizardRunStatusSchema = _typebox.Type.Union([
_typebox.Type.Literal("running"),
_typebox.Type.Literal("done"),
_typebox.Type.Literal("cancelled"),
_typebox.Type.Literal("error")]
);
const WizardStartParamsSchema = _typebox.Type.Object({
  mode: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("local"), _typebox.Type.Literal("remote")])),
  workspace: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const WizardAnswerSchema = _typebox.Type.Object({
  stepId: NonEmptyString,
  value: _typebox.Type.Optional(_typebox.Type.Unknown())
}, { additionalProperties: false });
const WizardNextParamsSchema = _typebox.Type.Object({
  sessionId: NonEmptyString,
  answer: _typebox.Type.Optional(WizardAnswerSchema)
}, { additionalProperties: false });
const WizardSessionIdParamsSchema = _typebox.Type.Object({ sessionId: NonEmptyString }, { additionalProperties: false });
const WizardCancelParamsSchema = WizardSessionIdParamsSchema;
const WizardStatusParamsSchema = WizardSessionIdParamsSchema;
const WizardStepOptionSchema = _typebox.Type.Object({
  value: _typebox.Type.Unknown(),
  label: NonEmptyString,
  hint: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
const WizardStepSchema = _typebox.Type.Object({
  id: NonEmptyString,
  type: _typebox.Type.Union([
  _typebox.Type.Literal("note"),
  _typebox.Type.Literal("select"),
  _typebox.Type.Literal("text"),
  _typebox.Type.Literal("confirm"),
  _typebox.Type.Literal("multiselect"),
  _typebox.Type.Literal("progress"),
  _typebox.Type.Literal("action")]
  ),
  title: _typebox.Type.Optional(_typebox.Type.String()),
  message: _typebox.Type.Optional(_typebox.Type.String()),
  options: _typebox.Type.Optional(_typebox.Type.Array(WizardStepOptionSchema)),
  initialValue: _typebox.Type.Optional(_typebox.Type.Unknown()),
  placeholder: _typebox.Type.Optional(_typebox.Type.String()),
  sensitive: _typebox.Type.Optional(_typebox.Type.Boolean()),
  executor: _typebox.Type.Optional(_typebox.Type.Union([_typebox.Type.Literal("gateway"), _typebox.Type.Literal("client")]))
}, { additionalProperties: false });
const WizardResultFields = {
  done: _typebox.Type.Boolean(),
  step: _typebox.Type.Optional(WizardStepSchema),
  status: _typebox.Type.Optional(WizardRunStatusSchema),
  error: _typebox.Type.Optional(_typebox.Type.String())
};
_typebox.Type.Object(WizardResultFields, { additionalProperties: false });
_typebox.Type.Object({
  sessionId: NonEmptyString,
  ...WizardResultFields
}, { additionalProperties: false });
_typebox.Type.Object({
  status: WizardRunStatusSchema,
  error: _typebox.Type.Optional(_typebox.Type.String())
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/index.ts
const ajv = new _ajv.default({
  allErrors: true,
  strict: false,
  removeAdditional: false
});
const validateCommandsListParams = exports.v = ajv.compile(CommandsListParamsSchema);
const validateConnectParams = exports.E = ajv.compile(ConnectParamsSchema);
const validateRequestFrame = exports.ht = ajv.compile(RequestFrameSchema);
const validateResponseFrame = exports.gt = ajv.compile(ResponseFrameSchema);
const validateEventFrame = exports.B = ajv.compile(EventFrameSchema);
const validateMessageActionParams = exports.Y = ajv.compile(MessageActionParamsSchema);
const validateSendParams = exports.yt = ajv.compile(SendParamsSchema);
const validatePollParams = exports.pt = ajv.compile(PollParamsSchema);
const validateAgentParams = exports.r = ajv.compile(AgentParamsSchema);
const validateAgentIdentityParams = exports.n = ajv.compile(AgentIdentityParamsSchema);
const validateAgentWaitParams = exports.i = ajv.compile(AgentWaitParamsSchema);
const validateWakeParams = exports.Yt = ajv.compile(WakeParamsSchema);
const validateAgentsListParams = exports.u = ajv.compile(AgentsListParamsSchema);
const validateAgentsCreateParams = exports.a = ajv.compile(AgentsCreateParamsSchema);
const validateAgentsUpdateParams = exports.d = ajv.compile(AgentsUpdateParamsSchema);
const validateAgentsDeleteParams = exports.o = ajv.compile(AgentsDeleteParamsSchema);
const validateAgentsFilesListParams = exports.c = ajv.compile(AgentsFilesListParamsSchema);
const validateAgentsFilesGetParams = exports.s = ajv.compile(AgentsFilesGetParamsSchema);
const validateAgentsFilesSetParams = exports.l = ajv.compile(AgentsFilesSetParamsSchema);
const validateNodePairRequestParams = exports.at = ajv.compile(NodePairRequestParamsSchema);
const validateNodePairListParams = exports.rt = ajv.compile(NodePairListParamsSchema);
const validateNodePairApproveParams = exports.nt = ajv.compile(NodePairApproveParamsSchema);
const validateNodePairRejectParams = exports.it = ajv.compile(NodePairRejectParamsSchema);
const validateNodePairVerifyParams = exports.ot = ajv.compile(NodePairVerifyParamsSchema);
const validateNodeRenameParams = exports.ut = ajv.compile(NodeRenameParamsSchema);
const validateNodeListParams = exports.tt = ajv.compile(NodeListParamsSchema);
const validateNodePendingAckParams = exports.st = ajv.compile(NodePendingAckParamsSchema);
const validateNodeDescribeParams = exports.Z = ajv.compile(NodeDescribeParamsSchema);
const validateNodeInvokeParams = exports.$ = ajv.compile(NodeInvokeParamsSchema);
const validateNodeInvokeResultParams = exports.et = ajv.compile(NodeInvokeResultParamsSchema);
const validateNodeEventParams = exports.Q = ajv.compile(NodeEventParamsSchema);
const validateNodePendingDrainParams = exports.ct = ajv.compile(NodePendingDrainParamsSchema);
const validateNodePendingEnqueueParams = exports.lt = ajv.compile(NodePendingEnqueueParamsSchema);
const validatePushTestParams = exports.mt = ajv.compile(PushTestParamsSchema);
const validateSecretsResolveParams = exports._t = ajv.compile(SecretsResolveParamsSchema);
const validateSecretsResolveResult = exports.vt = ajv.compile(SecretsResolveResultSchema);
const validateSessionsListParams = exports.Ot = ajv.compile(SessionsListParamsSchema);
const validateSessionsPreviewParams = exports.Mt = ajv.compile(SessionsPreviewParamsSchema);
const validateSessionsResolveParams = exports.Pt = ajv.compile(SessionsResolveParamsSchema);
const validateSessionsCreateParams = exports.Et = ajv.compile(SessionsCreateParamsSchema);
const validateSessionsSendParams = exports.Ft = ajv.compile(SessionsSendParamsSchema);
const validateSessionsMessagesSubscribeParams = exports.kt = ajv.compile(SessionsMessagesSubscribeParamsSchema);
const validateSessionsMessagesUnsubscribeParams = exports.At = ajv.compile(SessionsMessagesUnsubscribeParamsSchema);
const validateSessionsAbortParams = exports.bt = ajv.compile(SessionsAbortParamsSchema);
const validateSessionsPatchParams = exports.jt = ajv.compile(SessionsPatchParamsSchema);
const validateSessionsResetParams = exports.Nt = ajv.compile(SessionsResetParamsSchema);
const validateSessionsDeleteParams = exports.Dt = ajv.compile(SessionsDeleteParamsSchema);
const validateSessionsCompactParams = exports.xt = ajv.compile(SessionsCompactParamsSchema);
const validateSessionsCompactionListParams = exports.wt = ajv.compile(SessionsCompactionListParamsSchema);
const validateSessionsCompactionGetParams = exports.Ct = ajv.compile(SessionsCompactionGetParamsSchema);
const validateSessionsCompactionBranchParams = exports.St = ajv.compile(SessionsCompactionBranchParamsSchema);
const validateSessionsCompactionRestoreParams = exports.Tt = ajv.compile(SessionsCompactionRestoreParamsSchema);
const validateSessionsUsageParams = exports.It = ajv.compile(SessionsUsageParamsSchema);
const validateConfigGetParams = exports.b = ajv.compile(ConfigGetParamsSchema);
const validateConfigSetParams = exports.T = ajv.compile(ConfigSetParamsSchema);
const validateConfigApplyParams = exports.y = ajv.compile(ConfigApplyParamsSchema);
const validateConfigPatchParams = exports.x = ajv.compile(ConfigPatchParamsSchema);
const validateConfigSchemaParams = exports.w = ajv.compile(ConfigSchemaParamsSchema);
const validateConfigSchemaLookupParams = exports.S = ajv.compile(ConfigSchemaLookupParamsSchema);
const validateConfigSchemaLookupResult = exports.C = ajv.compile(ConfigSchemaLookupResultSchema);
const validateWizardStartParams = exports.en = ajv.compile(WizardStartParamsSchema);
const validateWizardNextParams = exports.$t = ajv.compile(WizardNextParamsSchema);
const validateWizardCancelParams = exports.Qt = ajv.compile(WizardCancelParamsSchema);
const validateWizardStatusParams = exports.tn = ajv.compile(WizardStatusParamsSchema);
const validateTalkModeParams = exports.Wt = ajv.compile(TalkModeParamsSchema);
const validateTalkConfigParams = exports.Ut = ajv.compile(TalkConfigParamsSchema);
ajv.compile(TalkConfigResultSchema);
const validateTalkSpeakParams = exports.Gt = ajv.compile(TalkSpeakParamsSchema);
ajv.compile(TalkSpeakResultSchema);
const validateChannelsStatusParams = exports.p = ajv.compile(ChannelsStatusParamsSchema);
const validateChannelsLogoutParams = exports.f = ajv.compile(ChannelsLogoutParamsSchema);
const validateModelsListParams = exports.X = ajv.compile(ModelsListParamsSchema);
const validateSkillsStatusParams = exports.Vt = ajv.compile(SkillsStatusParamsSchema);
const validateToolsCatalogParams = exports.Kt = ajv.compile(ToolsCatalogParamsSchema);
const validateToolsEffectiveParams = exports.qt = ajv.compile(ToolsEffectiveParamsSchema);
const validateSkillsBinsParams = exports.Lt = ajv.compile(SkillsBinsParamsSchema);
const validateSkillsInstallParams = exports.zt = ajv.compile(SkillsInstallParamsSchema);
const validateSkillsUpdateParams = exports.Ht = ajv.compile(SkillsUpdateParamsSchema);
const validateSkillsSearchParams = exports.Bt = ajv.compile(SkillsSearchParamsSchema);
const validateSkillsDetailParams = exports.Rt = ajv.compile(SkillsDetailParamsSchema);
const validateCronListParams = exports.O = ajv.compile(CronListParamsSchema);
const validateCronStatusParams = exports.M = ajv.compile(CronStatusParamsSchema);
const validateCronAddParams = exports.D = ajv.compile(CronAddParamsSchema);
const validateCronUpdateParams = exports.N = ajv.compile(CronUpdateParamsSchema);
const validateCronRemoveParams = exports.k = ajv.compile(CronRemoveParamsSchema);
const validateCronRunParams = exports.A = ajv.compile(CronRunParamsSchema);
const validateCronRunsParams = exports.j = ajv.compile(CronRunsParamsSchema);
const validateDevicePairListParams = exports.F = ajv.compile(DevicePairListParamsSchema);
const validateDevicePairApproveParams = exports.P = ajv.compile(DevicePairApproveParamsSchema);
const validateDevicePairRejectParams = exports.I = ajv.compile(DevicePairRejectParamsSchema);
const validateDevicePairRemoveParams = exports.L = ajv.compile(DevicePairRemoveParamsSchema);
const validateDeviceTokenRotateParams = exports.z = ajv.compile(DeviceTokenRotateParamsSchema);
const validateDeviceTokenRevokeParams = exports.R = ajv.compile(DeviceTokenRevokeParamsSchema);
const validateExecApprovalsGetParams = exports.W = ajv.compile(ExecApprovalsGetParamsSchema);
const validateExecApprovalsSetParams = exports.q = ajv.compile(ExecApprovalsSetParamsSchema);
const validateExecApprovalGetParams = exports.V = ajv.compile(ExecApprovalGetParamsSchema);
const validateExecApprovalRequestParams = exports.H = ajv.compile(ExecApprovalRequestParamsSchema);
const validateExecApprovalResolveParams = exports.U = ajv.compile(ExecApprovalResolveParamsSchema);
const validatePluginApprovalRequestParams = exports.dt = ajv.compile(PluginApprovalRequestParamsSchema);
const validatePluginApprovalResolveParams = exports.ft = ajv.compile(PluginApprovalResolveParamsSchema);
const validateExecApprovalsNodeGetParams = exports.G = ajv.compile(ExecApprovalsNodeGetParamsSchema);
const validateExecApprovalsNodeSetParams = exports.K = ajv.compile(ExecApprovalsNodeSetParamsSchema);
const validateLogsTailParams = exports.J = ajv.compile(LogsTailParamsSchema);
const validateChatHistoryParams = exports.h = ajv.compile(ChatHistoryParamsSchema);
const validateChatSendParams = exports._ = ajv.compile(ChatSendParamsSchema);
const validateChatAbortParams = exports.m = ajv.compile(ChatAbortParamsSchema);
const validateChatInjectParams = exports.g = ajv.compile(ChatInjectParamsSchema);
ajv.compile(ChatEventSchema);
const validateUpdateRunParams = exports.Jt = ajv.compile(UpdateRunParamsSchema);
const validateWebLoginStartParams = exports.Xt = ajv.compile(WebLoginStartParamsSchema);
const validateWebLoginWaitParams = exports.Zt = ajv.compile(WebLoginWaitParamsSchema);
function formatValidationErrors(errors) {
  if (!errors?.length) return "unknown validation error";
  const parts = [];
  for (const err of errors) {
    const keyword = typeof err?.keyword === "string" ? err.keyword : "";
    const instancePath = typeof err?.instancePath === "string" ? err.instancePath : "";
    if (keyword === "additionalProperties") {
      const additionalProperty = err?.params?.additionalProperty;
      if (typeof additionalProperty === "string" && additionalProperty.trim()) {
        const where = instancePath ? `at ${instancePath}` : "at root";
        parts.push(`${where}: unexpected property '${additionalProperty}'`);
        continue;
      }
    }
    const message = typeof err?.message === "string" && err.message.trim() ? err.message : "validation error";
    const where = instancePath ? `at ${instancePath}: ` : "";
    parts.push(`${where}${message}`);
  }
  const unique = Array.from(new Set(parts.filter((part) => part.trim())));
  if (!unique.length) return ajv.errorsText(errors, { separator: "; " }) || "unknown validation error";
  return unique.join("; ");
}
//#endregion /* v9-9104432ddf1d6b45 */
