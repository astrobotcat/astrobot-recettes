"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = deepMergeDefined;exports.i = validateProviderConfig;exports.n = normalizeVoiceCallConfig;exports.r = resolveVoiceCallConfig;exports.t = void 0;var _zodSchemaCoreCYrn8zgQ = require("./zod-schema.core-CYrn8zgQ.js");
var _zodBUbl8seT = require("./zod-BUbl8seT.js");
require("./api-Bp0lE5j9.js");
//#region extensions/voice-call/src/deep-merge.ts
const BLOCKED_MERGE_KEYS = new Set([
"__proto__",
"prototype",
"constructor"]
);
function deepMergeDefined(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return override === void 0 ? base : override;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (BLOCKED_MERGE_KEYS.has(key) || value === void 0) continue;
    const existing = result[key];
    result[key] = key in result ? deepMergeDefined(existing, value) : value;
  }
  return result;
}
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region extensions/voice-call/src/config.ts
/**
* E.164 phone number format: +[country code][number]
* Examples use 555 prefix (reserved for fictional numbers)
*/
const E164Schema = _zodBUbl8seT.t.z.string().regex(/^\+[1-9]\d{1,14}$/, "Expected E.164 format, e.g. +15550001234");
/**
* Controls how inbound calls are handled:
* - "disabled": Block all inbound calls (outbound only)
* - "allowlist": Only accept calls from numbers in allowFrom
* - "pairing": Unknown callers can request pairing (future)
* - "open": Accept all inbound calls (dangerous!)
*/
const InboundPolicySchema = _zodBUbl8seT.t.z.enum([
"disabled",
"allowlist",
"pairing",
"open"]
);
const TelnyxConfigSchema = _zodBUbl8seT.t.z.object({
  apiKey: _zodBUbl8seT.t.z.string().min(1).optional(),
  connectionId: _zodBUbl8seT.t.z.string().min(1).optional(),
  publicKey: _zodBUbl8seT.t.z.string().min(1).optional()
}).strict();
const TwilioConfigSchema = _zodBUbl8seT.t.z.object({
  accountSid: _zodBUbl8seT.t.z.string().min(1).optional(),
  authToken: _zodBUbl8seT.t.z.string().min(1).optional()
}).strict();
const PlivoConfigSchema = _zodBUbl8seT.t.z.object({
  authId: _zodBUbl8seT.t.z.string().min(1).optional(),
  authToken: _zodBUbl8seT.t.z.string().min(1).optional()
}).strict();
const VoiceCallServeConfigSchema = _zodBUbl8seT.t.z.object({
  port: _zodBUbl8seT.t.z.number().int().positive().default(3334),
  bind: _zodBUbl8seT.t.z.string().default("127.0.0.1"),
  path: _zodBUbl8seT.t.z.string().min(1).default("/voice/webhook")
}).strict().default({
  port: 3334,
  bind: "127.0.0.1",
  path: "/voice/webhook"
});
const VoiceCallTailscaleConfigSchema = _zodBUbl8seT.t.z.object({
  mode: _zodBUbl8seT.t.z.enum([
  "off",
  "serve",
  "funnel"]
  ).default("off"),
  path: _zodBUbl8seT.t.z.string().min(1).default("/voice/webhook")
}).strict().default({
  mode: "off",
  path: "/voice/webhook"
});
const VoiceCallTunnelConfigSchema = _zodBUbl8seT.t.z.object({
  provider: _zodBUbl8seT.t.z.enum([
  "none",
  "ngrok",
  "tailscale-serve",
  "tailscale-funnel"]
  ).default("none"),
  ngrokAuthToken: _zodBUbl8seT.t.z.string().min(1).optional(),
  ngrokDomain: _zodBUbl8seT.t.z.string().min(1).optional(),
  allowNgrokFreeTierLoopbackBypass: _zodBUbl8seT.t.z.boolean().default(false)
}).strict().default({
  provider: "none",
  allowNgrokFreeTierLoopbackBypass: false
});
const VoiceCallWebhookSecurityConfigSchema = _zodBUbl8seT.t.z.object({
  allowedHosts: _zodBUbl8seT.t.z.array(_zodBUbl8seT.t.z.string().min(1)).default([]),
  trustForwardingHeaders: _zodBUbl8seT.t.z.boolean().default(false),
  trustedProxyIPs: _zodBUbl8seT.t.z.array(_zodBUbl8seT.t.z.string().min(1)).default([])
}).strict().default({
  allowedHosts: [],
  trustForwardingHeaders: false,
  trustedProxyIPs: []
});
/**
* Call mode determines how outbound calls behave:
* - "notify": Deliver message and auto-hangup after delay (one-way notification)
* - "conversation": Stay open for back-and-forth until explicit end or timeout
*/
const CallModeSchema = _zodBUbl8seT.t.z.enum(["notify", "conversation"]);
const OutboundConfigSchema = _zodBUbl8seT.t.z.object({
  defaultMode: CallModeSchema.default("notify"),
  notifyHangupDelaySec: _zodBUbl8seT.t.z.number().int().nonnegative().default(3)
}).strict().default({
  defaultMode: "notify",
  notifyHangupDelaySec: 3
});
const RealtimeToolSchema = _zodBUbl8seT.t.z.object({
  type: _zodBUbl8seT.t.z.literal("function"),
  name: _zodBUbl8seT.t.z.string().min(1),
  description: _zodBUbl8seT.t.z.string(),
  parameters: _zodBUbl8seT.t.z.object({
    type: _zodBUbl8seT.t.z.literal("object"),
    properties: _zodBUbl8seT.t.z.record(_zodBUbl8seT.t.z.string(), _zodBUbl8seT.t.z.unknown()),
    required: _zodBUbl8seT.t.z.array(_zodBUbl8seT.t.z.string()).optional()
  })
}).strict();
const VoiceCallRealtimeProvidersConfigSchema = _zodBUbl8seT.t.z.record(_zodBUbl8seT.t.z.string(), _zodBUbl8seT.t.z.record(_zodBUbl8seT.t.z.string(), _zodBUbl8seT.t.z.unknown())).default({});
const VoiceCallStreamingProvidersConfigSchema = _zodBUbl8seT.t.z.record(_zodBUbl8seT.t.z.string(), _zodBUbl8seT.t.z.record(_zodBUbl8seT.t.z.string(), _zodBUbl8seT.t.z.unknown())).default({});
const VoiceCallRealtimeConfigSchema = _zodBUbl8seT.t.z.object({
  enabled: _zodBUbl8seT.t.z.boolean().default(false),
  provider: _zodBUbl8seT.t.z.string().min(1).optional(),
  streamPath: _zodBUbl8seT.t.z.string().min(1).optional(),
  instructions: _zodBUbl8seT.t.z.string().optional(),
  tools: _zodBUbl8seT.t.z.array(RealtimeToolSchema).default([]),
  providers: VoiceCallRealtimeProvidersConfigSchema
}).strict().default({
  enabled: false,
  tools: [],
  providers: {}
});
const VoiceCallStreamingConfigSchema = _zodBUbl8seT.t.z.object({
  enabled: _zodBUbl8seT.t.z.boolean().default(false),
  provider: _zodBUbl8seT.t.z.string().min(1).optional(),
  streamPath: _zodBUbl8seT.t.z.string().min(1).default("/voice/stream"),
  providers: VoiceCallStreamingProvidersConfigSchema,
  preStartTimeoutMs: _zodBUbl8seT.t.z.number().int().positive().default(5e3),
  maxPendingConnections: _zodBUbl8seT.t.z.number().int().positive().default(32),
  maxPendingConnectionsPerIp: _zodBUbl8seT.t.z.number().int().positive().default(4),
  maxConnections: _zodBUbl8seT.t.z.number().int().positive().default(128)
}).strict().default({
  enabled: false,
  streamPath: "/voice/stream",
  providers: {},
  preStartTimeoutMs: 5e3,
  maxPendingConnections: 32,
  maxPendingConnectionsPerIp: 4,
  maxConnections: 128
});
const VoiceCallConfigSchema = exports.t = _zodBUbl8seT.t.z.object({
  enabled: _zodBUbl8seT.t.z.boolean().default(false),
  provider: _zodBUbl8seT.t.z.enum([
  "telnyx",
  "twilio",
  "plivo",
  "mock"]
  ).optional(),
  telnyx: TelnyxConfigSchema.optional(),
  twilio: TwilioConfigSchema.optional(),
  plivo: PlivoConfigSchema.optional(),
  fromNumber: E164Schema.optional(),
  toNumber: E164Schema.optional(),
  inboundPolicy: InboundPolicySchema.default("disabled"),
  allowFrom: _zodBUbl8seT.t.z.array(E164Schema).default([]),
  inboundGreeting: _zodBUbl8seT.t.z.string().optional(),
  outbound: OutboundConfigSchema,
  maxDurationSeconds: _zodBUbl8seT.t.z.number().int().positive().default(300),
  staleCallReaperSeconds: _zodBUbl8seT.t.z.number().int().nonnegative().default(0),
  silenceTimeoutMs: _zodBUbl8seT.t.z.number().int().positive().default(800),
  transcriptTimeoutMs: _zodBUbl8seT.t.z.number().int().positive().default(18e4),
  ringTimeoutMs: _zodBUbl8seT.t.z.number().int().positive().default(3e4),
  maxConcurrentCalls: _zodBUbl8seT.t.z.number().int().positive().default(1),
  serve: VoiceCallServeConfigSchema,
  tailscale: VoiceCallTailscaleConfigSchema,
  tunnel: VoiceCallTunnelConfigSchema,
  webhookSecurity: VoiceCallWebhookSecurityConfigSchema,
  streaming: VoiceCallStreamingConfigSchema,
  realtime: VoiceCallRealtimeConfigSchema,
  publicUrl: _zodBUbl8seT.t.z.string().url().optional(),
  skipSignatureVerification: _zodBUbl8seT.t.z.boolean().default(false),
  tts: _zodSchemaCoreCYrn8zgQ.j,
  store: _zodBUbl8seT.t.z.string().optional(),
  responseModel: _zodBUbl8seT.t.z.string().optional(),
  responseSystemPrompt: _zodBUbl8seT.t.z.string().optional(),
  responseTimeoutMs: _zodBUbl8seT.t.z.number().int().positive().default(3e4)
}).strict();
const DEFAULT_VOICE_CALL_CONFIG = VoiceCallConfigSchema.parse({});
function cloneDefaultVoiceCallConfig() {
  return structuredClone(DEFAULT_VOICE_CALL_CONFIG);
}
function normalizeWebhookLikePath(pathname) {
  const trimmed = pathname.trim();
  if (!trimmed) return "/";
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (prefixed === "/") return prefixed;
  return prefixed.endsWith("/") ? prefixed.slice(0, -1) : prefixed;
}
function defaultRealtimeStreamPathForServePath(servePath) {
  const normalized = normalizeWebhookLikePath(servePath);
  if (normalized.endsWith("/webhook")) return `${normalized.slice(0, -8)}/stream/realtime`;
  if (normalized === "/") return "/voice/stream/realtime";
  return `${normalized}/stream/realtime`;
}
function normalizeVoiceCallTtsConfig(defaults, overrides) {
  if (!defaults && !overrides) return;
  return _zodSchemaCoreCYrn8zgQ.j.parse(deepMergeDefined(defaults ?? {}, overrides ?? {}));
}
function sanitizeVoiceCallProviderConfigs(value) {
  if (!value) return {};
  return Object.fromEntries(Object.entries(value).filter((entry) => entry[1] !== void 0));
}
function normalizeVoiceCallConfig(config) {
  const defaults = cloneDefaultVoiceCallConfig();
  const serve = {
    ...defaults.serve,
    ...config.serve
  };
  const streamingProvider = config.streaming?.provider;
  const streamingProviders = sanitizeVoiceCallProviderConfigs(config.streaming?.providers ?? defaults.streaming.providers);
  const realtimeProvider = config.realtime?.provider ?? defaults.realtime.provider;
  const realtimeProviders = sanitizeVoiceCallProviderConfigs(config.realtime?.providers ?? defaults.realtime.providers);
  return {
    ...defaults,
    ...config,
    allowFrom: config.allowFrom ?? defaults.allowFrom,
    outbound: {
      ...defaults.outbound,
      ...config.outbound
    },
    serve,
    tailscale: {
      ...defaults.tailscale,
      ...config.tailscale
    },
    tunnel: {
      ...defaults.tunnel,
      ...config.tunnel
    },
    webhookSecurity: {
      ...defaults.webhookSecurity,
      ...config.webhookSecurity,
      allowedHosts: config.webhookSecurity?.allowedHosts ?? defaults.webhookSecurity.allowedHosts,
      trustedProxyIPs: config.webhookSecurity?.trustedProxyIPs ?? defaults.webhookSecurity.trustedProxyIPs
    },
    streaming: {
      ...defaults.streaming,
      ...config.streaming,
      provider: streamingProvider,
      providers: streamingProviders
    },
    realtime: {
      ...defaults.realtime,
      ...config.realtime,
      provider: realtimeProvider,
      streamPath: config.realtime?.streamPath ?? defaultRealtimeStreamPathForServePath(serve.path ?? defaults.serve.path),
      tools: config.realtime?.tools ?? defaults.realtime.tools,
      providers: realtimeProviders
    },
    tts: normalizeVoiceCallTtsConfig(defaults.tts, config.tts)
  };
}
/**
* Resolves the configuration by merging environment variables into missing fields.
* Returns a new configuration object with environment variables applied.
*/
function resolveVoiceCallConfig(config) {
  const resolved = normalizeVoiceCallConfig(config);
  if (resolved.provider === "telnyx") {
    resolved.telnyx = resolved.telnyx ?? {};
    resolved.telnyx.apiKey = resolved.telnyx.apiKey ?? process.env.TELNYX_API_KEY;
    resolved.telnyx.connectionId = resolved.telnyx.connectionId ?? process.env.TELNYX_CONNECTION_ID;
    resolved.telnyx.publicKey = resolved.telnyx.publicKey ?? process.env.TELNYX_PUBLIC_KEY;
  }
  if (resolved.provider === "twilio") {
    resolved.twilio = resolved.twilio ?? {};
    resolved.twilio.accountSid = resolved.twilio.accountSid ?? process.env.TWILIO_ACCOUNT_SID;
    resolved.twilio.authToken = resolved.twilio.authToken ?? process.env.TWILIO_AUTH_TOKEN;
  }
  if (resolved.provider === "plivo") {
    resolved.plivo = resolved.plivo ?? {};
    resolved.plivo.authId = resolved.plivo.authId ?? process.env.PLIVO_AUTH_ID;
    resolved.plivo.authToken = resolved.plivo.authToken ?? process.env.PLIVO_AUTH_TOKEN;
  }
  resolved.tunnel = resolved.tunnel ?? {
    provider: "none",
    allowNgrokFreeTierLoopbackBypass: false
  };
  resolved.tunnel.allowNgrokFreeTierLoopbackBypass = resolved.tunnel.allowNgrokFreeTierLoopbackBypass ?? false;
  resolved.tunnel.ngrokAuthToken = resolved.tunnel.ngrokAuthToken ?? process.env.NGROK_AUTHTOKEN;
  resolved.tunnel.ngrokDomain = resolved.tunnel.ngrokDomain ?? process.env.NGROK_DOMAIN;
  resolved.webhookSecurity = resolved.webhookSecurity ?? {
    allowedHosts: [],
    trustForwardingHeaders: false,
    trustedProxyIPs: []
  };
  resolved.webhookSecurity.allowedHosts = resolved.webhookSecurity.allowedHosts ?? [];
  resolved.webhookSecurity.trustForwardingHeaders = resolved.webhookSecurity.trustForwardingHeaders ?? false;
  resolved.webhookSecurity.trustedProxyIPs = resolved.webhookSecurity.trustedProxyIPs ?? [];
  return normalizeVoiceCallConfig(resolved);
}
/**
* Validate that the configuration has all required fields for the selected provider.
*/
function validateProviderConfig(config) {
  const errors = [];
  if (!config.enabled) return {
    valid: true,
    errors: []
  };
  if (!config.provider) errors.push("plugins.entries.voice-call.config.provider is required");
  if (!config.fromNumber && config.provider !== "mock") errors.push("plugins.entries.voice-call.config.fromNumber is required");
  if (config.provider === "telnyx") {
    if (!config.telnyx?.apiKey) errors.push("plugins.entries.voice-call.config.telnyx.apiKey is required (or set TELNYX_API_KEY env)");
    if (!config.telnyx?.connectionId) errors.push("plugins.entries.voice-call.config.telnyx.connectionId is required (or set TELNYX_CONNECTION_ID env)");
    if (!config.skipSignatureVerification && !config.telnyx?.publicKey) errors.push("plugins.entries.voice-call.config.telnyx.publicKey is required (or set TELNYX_PUBLIC_KEY env)");
  }
  if (config.provider === "twilio") {
    if (!config.twilio?.accountSid) errors.push("plugins.entries.voice-call.config.twilio.accountSid is required (or set TWILIO_ACCOUNT_SID env)");
    if (!config.twilio?.authToken) errors.push("plugins.entries.voice-call.config.twilio.authToken is required (or set TWILIO_AUTH_TOKEN env)");
  }
  if (config.provider === "plivo") {
    if (!config.plivo?.authId) errors.push("plugins.entries.voice-call.config.plivo.authId is required (or set PLIVO_AUTH_ID env)");
    if (!config.plivo?.authToken) errors.push("plugins.entries.voice-call.config.plivo.authToken is required (or set PLIVO_AUTH_TOKEN env)");
  }
  if (config.realtime.enabled && config.inboundPolicy === "disabled") errors.push("plugins.entries.voice-call.config.inboundPolicy must not be \"disabled\" when realtime.enabled is true");
  if (config.realtime.enabled && config.streaming.enabled) errors.push("plugins.entries.voice-call.config.realtime.enabled and plugins.entries.voice-call.config.streaming.enabled cannot both be true");
  if (config.realtime.enabled && config.provider && config.provider !== "twilio") errors.push("plugins.entries.voice-call.config.provider must be \"twilio\" when realtime.enabled is true");
  return {
    valid: errors.length === 0,
    errors
  };
}
//#endregion /* v9-bef465b894008ceb */
