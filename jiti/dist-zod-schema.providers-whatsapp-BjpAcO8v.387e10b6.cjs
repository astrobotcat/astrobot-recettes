"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = void 0;var _stringNormalizationXm3f27dv = require("./string-normalization-xm3f27dv.js");
var _zodSchemaCoreCYrn8zgQ = require("./zod-schema.core-CYrn8zgQ.js");
var _zodSchemaAgentRuntimeBSPBF_O_ = require("./zod-schema.agent-runtime-BSPBF_O_.js");
var _zodSchemaProvidersCoreBxvvQH1c = require("./zod-schema.providers-core-BxvvQH1c.js");
var _zod = require("zod");
//#region src/config/zod-schema.providers-whatsapp.ts
const ToolPolicyBySenderSchema = _zod.z.record(_zod.z.string(), _zodSchemaAgentRuntimeBSPBF_O_.c).optional();
const WhatsAppGroupEntrySchema = _zod.z.object({
  requireMention: _zod.z.boolean().optional(),
  tools: _zodSchemaAgentRuntimeBSPBF_O_.c,
  toolsBySender: ToolPolicyBySenderSchema
}).strict().optional();
const WhatsAppGroupsSchema = _zod.z.record(_zod.z.string(), WhatsAppGroupEntrySchema).optional();
const WhatsAppAckReactionSchema = _zod.z.object({
  emoji: _zod.z.string().optional(),
  direct: _zod.z.boolean().optional().default(true),
  group: _zod.z.enum([
  "always",
  "mentions",
  "never"]
  ).optional().default("mentions")
}).strict().optional();
const WhatsAppSharedSchema = _zod.z.object({
  enabled: _zod.z.boolean().optional(),
  capabilities: _zod.z.array(_zod.z.string()).optional(),
  markdown: _zodSchemaCoreCYrn8zgQ.h,
  configWrites: _zod.z.boolean().optional(),
  sendReadReceipts: _zod.z.boolean().optional(),
  messagePrefix: _zod.z.string().optional(),
  responsePrefix: _zod.z.string().optional(),
  dmPolicy: _zodSchemaCoreCYrn8zgQ.o.optional().default("pairing"),
  selfChatMode: _zod.z.boolean().optional(),
  allowFrom: _zod.z.array(_zod.z.string()).optional(),
  defaultTo: _zod.z.string().optional(),
  groupAllowFrom: _zod.z.array(_zod.z.string()).optional(),
  groupPolicy: _zodSchemaCoreCYrn8zgQ.l.optional().default("allowlist"),
  contextVisibility: _zodSchemaCoreCYrn8zgQ.i.optional(),
  historyLimit: _zod.z.number().int().min(0).optional(),
  dmHistoryLimit: _zod.z.number().int().min(0).optional(),
  dms: _zod.z.record(_zod.z.string(), _zodSchemaCoreCYrn8zgQ.a.optional()).optional(),
  textChunkLimit: _zod.z.number().int().positive().optional(),
  chunkMode: _zod.z.enum(["length", "newline"]).optional(),
  blockStreaming: _zod.z.boolean().optional(),
  blockStreamingCoalesce: _zodSchemaCoreCYrn8zgQ.n.optional(),
  groups: WhatsAppGroupsSchema,
  ackReaction: WhatsAppAckReactionSchema,
  reactionLevel: _zod.z.enum([
  "off",
  "ack",
  "minimal",
  "extensive"]
  ).optional(),
  debounceMs: _zod.z.number().int().nonnegative().optional().default(0),
  heartbeat: _zodSchemaProvidersCoreBxvvQH1c.l,
  healthMonitor: _zodSchemaProvidersCoreBxvvQH1c.c
});
function enforceOpenDmPolicyAllowFromStar(params) {
  if (params.dmPolicy !== "open") return;
  if ((0, _stringNormalizationXm3f27dv.s)(Array.isArray(params.allowFrom) ? params.allowFrom : []).includes("*")) return;
  params.ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: params.path ?? ["allowFrom"],
    message: params.message
  });
}
function enforceAllowlistDmPolicyAllowFrom(params) {
  if (params.dmPolicy !== "allowlist") return;
  if ((0, _stringNormalizationXm3f27dv.s)(Array.isArray(params.allowFrom) ? params.allowFrom : []).length > 0) return;
  params.ctx.addIssue({
    code: _zod.z.ZodIssueCode.custom,
    path: params.path ?? ["allowFrom"],
    message: params.message
  });
}
const WhatsAppAccountSchema = WhatsAppSharedSchema.extend({
  name: _zod.z.string().optional(),
  enabled: _zod.z.boolean().optional(),
  authDir: _zod.z.string().optional(),
  mediaMaxMb: _zod.z.number().int().positive().optional()
}).strict();
const WhatsAppConfigSchema = exports.t = WhatsAppSharedSchema.extend({
  accounts: _zod.z.record(_zod.z.string(), WhatsAppAccountSchema.optional()).optional(),
  defaultAccount: _zod.z.string().optional(),
  mediaMaxMb: _zod.z.number().int().positive().optional().default(50),
  actions: _zod.z.object({
    reactions: _zod.z.boolean().optional(),
    sendMessage: _zod.z.boolean().optional(),
    polls: _zod.z.boolean().optional()
  }).strict().optional()
}).strict().superRefine((value, ctx) => {
  enforceOpenDmPolicyAllowFromStar({
    dmPolicy: value.dmPolicy,
    allowFrom: value.allowFrom,
    ctx,
    message: "channels.whatsapp.dmPolicy=\"open\" requires channels.whatsapp.allowFrom to include \"*\""
  });
  enforceAllowlistDmPolicyAllowFrom({
    dmPolicy: value.dmPolicy,
    allowFrom: value.allowFrom,
    ctx,
    message: "channels.whatsapp.dmPolicy=\"allowlist\" requires channels.whatsapp.allowFrom to contain at least one sender ID"
  });
  if (!value.accounts) return;
  for (const [accountId, account] of Object.entries(value.accounts)) {
    if (!account) continue;
    const effectivePolicy = account.dmPolicy ?? value.dmPolicy;
    const effectiveAllowFrom = account.allowFrom ?? value.allowFrom;
    enforceOpenDmPolicyAllowFromStar({
      dmPolicy: effectivePolicy,
      allowFrom: effectiveAllowFrom,
      ctx,
      path: [
      "accounts",
      accountId,
      "allowFrom"],

      message: "channels.whatsapp.accounts.*.dmPolicy=\"open\" requires channels.whatsapp.accounts.*.allowFrom (or channels.whatsapp.allowFrom) to include \"*\""
    });
    enforceAllowlistDmPolicyAllowFrom({
      dmPolicy: effectivePolicy,
      allowFrom: effectiveAllowFrom,
      ctx,
      path: [
      "accounts",
      accountId,
      "allowFrom"],

      message: "channels.whatsapp.accounts.*.dmPolicy=\"allowlist\" requires channels.whatsapp.accounts.*.allowFrom (or channels.whatsapp.allowFrom) to contain at least one sender ID"
    });
  }
});
//#endregion /* v9-ec4e0a8a3627985f */
