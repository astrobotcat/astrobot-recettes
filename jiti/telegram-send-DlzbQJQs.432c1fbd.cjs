"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports._ = wasSentByBot;exports.a = editMessageTelegram;exports.b = withTelegramApiErrorLogging;exports.c = renameForumTopicTelegram;exports.d = sendStickerTelegram;exports.f = sendTypingTelegram;exports.g = recordSentMessage;exports.h = resolveTelegramVoiceSend;exports.i = editMessageReplyMarkupTelegram;exports.l = sendMessageTelegram;exports.m = unpinMessageTelegram;exports.n = deleteMessageTelegram;exports.o = pinMessageTelegram;exports.p = void 0;exports.r = editForumTopicTelegram;exports.s = reactMessageTelegram;exports.t = createForumTopicTelegram;exports.u = sendPollTelegram;exports.v = buildInlineKeyboard;exports.y = splitTelegramCaption;var _accountsCoskdHdZ = require("./accounts-CoskdHdZ.js");
var _outboundParamsDPqRaEDE = require("./outbound-params-DPqRaEDE.js");
var _fetchB2K4ajFP = require("./fetch-B2K4ajFP.js");
var _formatDkmJkZf = require("./format-DkmJkZf4.js");
var _configRuntime = require("openclaw/plugin-sdk/config-runtime");
var _textRuntime = require("openclaw/plugin-sdk/text-runtime");
var _runtimeEnv = require("openclaw/plugin-sdk/runtime-env");
var _errorRuntime = require("openclaw/plugin-sdk/error-runtime");
var _ssrfRuntime = require("openclaw/plugin-sdk/ssrf-runtime");
var _grammy = _interopRequireWildcard(require("grammy"));var grammy = _grammy;

var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _mediaRuntime = require("openclaw/plugin-sdk/media-runtime");
var _diagnosticRuntime = require("openclaw/plugin-sdk/diagnostic-runtime");
var _infraRuntime = require("openclaw/plugin-sdk/infra-runtime");
var _retryRuntime = require("openclaw/plugin-sdk/retry-runtime");
var _webMedia = require("openclaw/plugin-sdk/web-media");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
  let target = {};
  for (var name in all) __defProp(target, name, {
    get: all[name],
    enumerable: true
  });
  if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
  return target;
};
//#endregion
//#region extensions/telegram/src/api-logging.ts
const fallbackLogger = (0, _runtimeEnv.createSubsystemLogger)("telegram/api");
function resolveTelegramApiLogger(runtime, logger) {
  if (logger) return logger;
  if (runtime?.error) return runtime.error;
  return (message) => fallbackLogger.error(message);
}
async function withTelegramApiErrorLogging({ operation, fn, runtime, logger, shouldLog }) {
  try {
    return await fn();
  } catch (err) {
    if (!shouldLog || shouldLog(err)) {
      const errText = (0, _ssrfRuntime.formatErrorMessage)(err);
      resolveTelegramApiLogger(runtime, logger)(`telegram ${operation} failed: ${errText}`);
    }
    throw err;
  }
}
function splitTelegramCaption(text) {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return {
    caption: void 0,
    followUpText: void 0
  };
  if (trimmed.length > 1024) return {
    caption: void 0,
    followUpText: trimmed
  };
  return {
    caption: trimmed,
    followUpText: void 0
  };
}
//#endregion
//#region extensions/telegram/src/inline-keyboard.ts
function buildInlineKeyboard(buttons) {
  if (!buttons?.length) return;
  const rows = buttons.map((row) => row.filter((button) => button?.text && button?.callback_data).map((button) => ({
    text: button.text,
    callback_data: button.callback_data,
    ...(button.style ? { style: button.style } : {})
  }))).filter((row) => row.length > 0);
  if (rows.length === 0) return;
  return { inline_keyboard: rows };
}
//#endregion
//#region extensions/telegram/src/sent-message-cache.ts
const TTL_MS = 1440 * 60 * 1e3;
const TELEGRAM_SENT_MESSAGES_STATE_KEY = Symbol.for("openclaw.telegramSentMessagesState");
function getSentMessageState() {
  const globalStore = globalThis;
  const existing = globalStore[TELEGRAM_SENT_MESSAGES_STATE_KEY];
  if (existing) return existing;
  const state = {};
  globalStore[TELEGRAM_SENT_MESSAGES_STATE_KEY] = state;
  return state;
}
function createSentMessageStore() {
  return /* @__PURE__ */new Map();
}
function resolveSentMessageStorePath() {
  return `${(0, _configRuntime.resolveStorePath)((0, _configRuntime.loadConfig)().session?.store)}.telegram-sent-messages.json`;
}
function cleanupExpired(scopeKey, entry, now) {
  for (const [id, timestamp] of entry) if (now - timestamp > TTL_MS) entry.delete(id);
  if (entry.size === 0) getSentMessages().delete(scopeKey);
}
function readPersistedSentMessages(filePath) {
  if (!_nodeFs.default.existsSync(filePath)) return createSentMessageStore();
  try {
    const raw = _nodeFs.default.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const now = Date.now();
    const store = createSentMessageStore();
    for (const [chatId, entry] of Object.entries(parsed)) {
      const messages = /* @__PURE__ */new Map();
      for (const [messageId, timestamp] of Object.entries(entry)) if (typeof timestamp === "number" && Number.isFinite(timestamp) && now - timestamp <= TTL_MS) messages.set(messageId, timestamp);
      if (messages.size > 0) store.set(chatId, messages);
    }
    return store;
  } catch (error) {
    (0, _runtimeEnv.logVerbose)(`telegram: failed to read sent-message cache: ${String(error)}`);
    return createSentMessageStore();
  }
}
function getSentMessages() {
  const state = getSentMessageState();
  const persistedPath = resolveSentMessageStorePath();
  if (!state.store || state.persistedPath !== persistedPath) {
    state.store = readPersistedSentMessages(persistedPath);
    state.persistedPath = persistedPath;
  }
  return state.store;
}
function persistSentMessages() {
  const state = getSentMessageState();
  const store = state.store;
  const filePath = state.persistedPath;
  if (!store || !filePath) return;
  const now = Date.now();
  const serialized = {};
  for (const [chatId, entry] of store) {
    cleanupExpired(chatId, entry, now);
    if (entry.size > 0) serialized[chatId] = Object.fromEntries(entry);
  }
  if (Object.keys(serialized).length === 0) {
    _nodeFs.default.rmSync(filePath, { force: true });
    return;
  }
  _nodeFs.default.mkdirSync(_nodePath.default.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  _nodeFs.default.writeFileSync(tempPath, JSON.stringify(serialized), "utf-8");
  _nodeFs.default.renameSync(tempPath, filePath);
}
function recordSentMessage(chatId, messageId) {
  const scopeKey = String(chatId);
  const idKey = String(messageId);
  const now = Date.now();
  const store = getSentMessages();
  let entry = store.get(scopeKey);
  if (!entry) {
    entry = /* @__PURE__ */new Map();
    store.set(scopeKey, entry);
  }
  entry.set(idKey, now);
  if (entry.size > 100) cleanupExpired(scopeKey, entry, now);
  try {
    persistSentMessages();
  } catch (error) {
    (0, _runtimeEnv.logVerbose)(`telegram: failed to persist sent-message cache: ${String(error)}`);
  }
}
function wasSentByBot(chatId, messageId) {
  const scopeKey = String(chatId);
  const idKey = String(messageId);
  const entry = getSentMessages().get(scopeKey);
  if (!entry) return false;
  cleanupExpired(scopeKey, entry, Date.now());
  return entry.has(idKey);
}
//#endregion
//#region extensions/telegram/src/target-writeback.ts
const writebackLogger = (0, _runtimeEnv.createSubsystemLogger)("telegram/target-writeback");
const TELEGRAM_ADMIN_SCOPE = "operator.admin";
function asObjectRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
}
function normalizeTelegramLookupTargetForMatch(raw) {
  const normalized = (0, _outboundParamsDPqRaEDE.o)(raw);
  if (!normalized) return;
  return normalized.startsWith("@") ? (0, _textRuntime.normalizeLowercaseStringOrEmpty)(normalized) : normalized;
}
function normalizeTelegramTargetForMatch(raw) {
  const parsed = (0, _outboundParamsDPqRaEDE.s)(raw);
  const normalized = normalizeTelegramLookupTargetForMatch(parsed.chatId);
  if (!normalized) return;
  return `${normalized}|${parsed.messageThreadId == null ? "" : String(parsed.messageThreadId)}`;
}
function buildResolvedTelegramTarget(params) {
  const { raw, parsed, resolvedChatId } = params;
  if (parsed.messageThreadId == null) return resolvedChatId;
  return raw.includes(":topic:") ? `${resolvedChatId}:topic:${parsed.messageThreadId}` : `${resolvedChatId}:${parsed.messageThreadId}`;
}
function resolveLegacyRewrite(params) {
  const parsed = (0, _outboundParamsDPqRaEDE.s)(params.raw);
  if ((0, _outboundParamsDPqRaEDE.a)(parsed.chatId)) return null;
  const normalized = normalizeTelegramLookupTargetForMatch(parsed.chatId);
  if (!normalized) return null;
  return {
    matchKey: `${normalized}|${parsed.messageThreadId == null ? "" : String(parsed.messageThreadId)}`,
    resolvedTarget: buildResolvedTelegramTarget({
      raw: params.raw,
      parsed,
      resolvedChatId: params.resolvedChatId
    })
  };
}
function rewriteTargetIfMatch(params) {
  if (typeof params.rawValue !== "string" && typeof params.rawValue !== "number") return null;
  const value = (0, _textRuntime.normalizeOptionalString)(String(params.rawValue)) ?? "";
  if (!value) return null;
  if (normalizeTelegramTargetForMatch(value) !== params.matchKey) return null;
  return params.resolvedTarget;
}
function replaceTelegramDefaultToTargets(params) {
  let changed = false;
  const telegram = asObjectRecord(params.cfg.channels?.telegram);
  if (!telegram) return changed;
  const maybeReplace = (holder, key) => {
    const nextTarget = rewriteTargetIfMatch({
      rawValue: holder[key],
      matchKey: params.matchKey,
      resolvedTarget: params.resolvedTarget
    });
    if (!nextTarget) return;
    holder[key] = nextTarget;
    changed = true;
  };
  maybeReplace(telegram, "defaultTo");
  const accounts = asObjectRecord(telegram.accounts);
  if (!accounts) return changed;
  for (const accountId of Object.keys(accounts)) {
    const account = asObjectRecord(accounts[accountId]);
    if (!account) continue;
    maybeReplace(account, "defaultTo");
  }
  return changed;
}
async function maybePersistResolvedTelegramTarget(params) {
  const raw = params.rawTarget.trim();
  if (!raw) return;
  const rewrite = resolveLegacyRewrite({
    raw,
    resolvedChatId: params.resolvedChatId
  });
  if (!rewrite) return;
  const { matchKey, resolvedTarget } = rewrite;
  if (Array.isArray(params.gatewayClientScopes) && !params.gatewayClientScopes.includes(TELEGRAM_ADMIN_SCOPE)) {
    writebackLogger.warn(`skipping Telegram target writeback for ${raw} because gateway caller is missing ${TELEGRAM_ADMIN_SCOPE}`);
    return;
  }
  try {
    const { snapshot, writeOptions } = await (0, _configRuntime.readConfigFileSnapshotForWrite)();
    const nextConfig = structuredClone(snapshot.config ?? {});
    if (replaceTelegramDefaultToTargets({
      cfg: nextConfig,
      matchKey,
      resolvedTarget
    })) {
      await (0, _configRuntime.writeConfigFile)(nextConfig, writeOptions);
      if (params.verbose) writebackLogger.warn(`resolved Telegram defaultTo target ${raw} -> ${resolvedTarget}`);
    }
  } catch (err) {
    if (params.verbose) writebackLogger.warn(`failed to persist Telegram defaultTo target ${raw}: ${String(err)}`);
  }
  try {
    const storePath = (0, _configRuntime.resolveCronStorePath)(params.cfg.cron?.store);
    const store = await (0, _configRuntime.loadCronStore)(storePath);
    let cronChanged = false;
    for (const job of store.jobs) {
      if (job.delivery?.channel !== "telegram") continue;
      const nextTarget = rewriteTargetIfMatch({
        rawValue: job.delivery.to,
        matchKey,
        resolvedTarget
      });
      if (!nextTarget) continue;
      job.delivery.to = nextTarget;
      cronChanged = true;
    }
    if (cronChanged) {
      await (0, _configRuntime.saveCronStore)(storePath, store);
      if (params.verbose) writebackLogger.warn(`resolved Telegram cron delivery target ${raw} -> ${resolvedTarget}`);
    }
  } catch (err) {
    if (params.verbose) writebackLogger.warn(`failed to persist Telegram cron target ${raw}: ${String(err)}`);
  }
}
//#endregion
//#region extensions/telegram/src/voice.ts
function resolveTelegramVoiceDecision(opts) {
  if (!opts.wantsVoice) return { useVoice: false };
  if ((0, _mediaRuntime.isTelegramVoiceCompatibleAudio)(opts)) return { useVoice: true };
  return {
    useVoice: false,
    reason: `media is ${opts.contentType ?? "unknown"} (${opts.fileName ?? "unknown"})`
  };
}
function resolveTelegramVoiceSend(opts) {
  const decision = resolveTelegramVoiceDecision(opts);
  if (decision.reason && opts.logFallback) opts.logFallback(`Telegram voice requested but ${decision.reason}; sending as audio file instead.`);
  return { useVoice: decision.useVoice };
}
//#endregion
//#region extensions/telegram/src/send.ts
var send_exports = exports.p = /* @__PURE__ */__exportAll({
  buildInlineKeyboard: () => buildInlineKeyboard,
  createForumTopicTelegram: () => createForumTopicTelegram,
  deleteMessageTelegram: () => deleteMessageTelegram,
  editForumTopicTelegram: () => editForumTopicTelegram,
  editMessageReplyMarkupTelegram: () => editMessageReplyMarkupTelegram,
  editMessageTelegram: () => editMessageTelegram,
  pinMessageTelegram: () => pinMessageTelegram,
  reactMessageTelegram: () => reactMessageTelegram,
  renameForumTopicTelegram: () => renameForumTopicTelegram,
  resetTelegramClientOptionsCacheForTests: () => resetTelegramClientOptionsCacheForTests,
  sendMessageTelegram: () => sendMessageTelegram,
  sendPollTelegram: () => sendPollTelegram,
  sendStickerTelegram: () => sendStickerTelegram,
  sendTypingTelegram: () => sendTypingTelegram,
  unpinMessageTelegram: () => unpinMessageTelegram
});
const InputFileCtor = grammy.InputFile;
const MAX_TELEGRAM_PHOTO_DIMENSION_SUM = 1e4;
const MAX_TELEGRAM_PHOTO_ASPECT_RATIO = 20;
function resolveTelegramMessageIdOrThrow(result, context) {
  if (typeof result?.message_id === "number" && Number.isFinite(result.message_id)) return Math.trunc(result.message_id);
  throw new Error(`Telegram ${context} returned no message_id`);
}
function splitTelegramPlainTextChunks(text, limit) {
  if (!text) return [];
  const normalizedLimit = Math.max(1, Math.floor(limit));
  const chunks = [];
  for (let start = 0; start < text.length; start += normalizedLimit) chunks.push(text.slice(start, start + normalizedLimit));
  return chunks;
}
function splitTelegramPlainTextFallback(text, chunkCount, limit) {
  if (!text) return [];
  const normalizedLimit = Math.max(1, Math.floor(limit));
  const fixedChunks = splitTelegramPlainTextChunks(text, normalizedLimit);
  if (chunkCount <= 1 || fixedChunks.length >= chunkCount) return fixedChunks;
  const chunks = [];
  let offset = 0;
  for (let index = 0; index < chunkCount; index += 1) {
    const remainingChars = text.length - offset;
    const remainingChunks = chunkCount - index;
    const nextChunkLength = remainingChunks === 1 ? remainingChars : Math.min(normalizedLimit, Math.ceil(remainingChars / remainingChunks));
    chunks.push(text.slice(offset, offset + nextChunkLength));
    offset += nextChunkLength;
  }
  return chunks;
}
const PARSE_ERR_RE = /can't parse entities|parse entities|find end of the entity/i;
const THREAD_NOT_FOUND_RE = /400:\s*Bad Request:\s*message thread not found/i;
const MESSAGE_NOT_MODIFIED_RE = /400:\s*Bad Request:\s*message is not modified|MESSAGE_NOT_MODIFIED/i;
const CHAT_NOT_FOUND_RE = /400: Bad Request: chat not found/i;
const sendLogger = (0, _runtimeEnv.createSubsystemLogger)("telegram/send");
const diagLogger = (0, _runtimeEnv.createSubsystemLogger)("telegram/diagnostic");
const telegramClientOptionsCache = /* @__PURE__ */new Map();
const MAX_TELEGRAM_CLIENT_OPTIONS_CACHE_SIZE = 64;
function asTelegramClientFetch(fetchImpl) {
  return fetchImpl;
}
function resetTelegramClientOptionsCacheForTests() {
  telegramClientOptionsCache.clear();
}
function createTelegramHttpLogger(cfg) {
  if (!(0, _diagnosticRuntime.isDiagnosticFlagEnabled)("telegram.http", cfg)) return () => {};
  return (label, err) => {
    if (!(err instanceof _grammy.HttpError)) return;
    const detail = (0, _textRuntime.redactSensitiveText)((0, _errorRuntime.formatUncaughtError)(err.error ?? err));
    diagLogger.warn(`telegram http error (${label}): ${detail}`);
  };
}
function shouldUseTelegramClientOptionsCache() {
  return !process.env.VITEST && true;
}
function buildTelegramClientOptionsCacheKey(params) {
  const proxyKey = params.account.config.proxy?.trim() ?? "";
  const autoSelectFamily = params.account.config.network?.autoSelectFamily;
  const autoSelectFamilyKey = typeof autoSelectFamily === "boolean" ? String(autoSelectFamily) : "default";
  const dnsResultOrderKey = params.account.config.network?.dnsResultOrder ?? "default";
  const apiRootKey = params.account.config.apiRoot?.trim() ?? "";
  const timeoutSecondsKey = typeof params.timeoutSeconds === "number" ? String(params.timeoutSeconds) : "default";
  return `${params.account.accountId}::${proxyKey}::${autoSelectFamilyKey}::${dnsResultOrderKey}::${apiRootKey}::${timeoutSecondsKey}`;
}
function setCachedTelegramClientOptions(cacheKey, clientOptions) {
  telegramClientOptionsCache.set(cacheKey, clientOptions);
  if (telegramClientOptionsCache.size > MAX_TELEGRAM_CLIENT_OPTIONS_CACHE_SIZE) {
    const oldestKey = telegramClientOptionsCache.keys().next().value;
    if (oldestKey !== void 0) telegramClientOptionsCache.delete(oldestKey);
  }
  return clientOptions;
}
function resolveTelegramClientOptions(account) {
  const timeoutSeconds = typeof account.config.timeoutSeconds === "number" && Number.isFinite(account.config.timeoutSeconds) ? Math.max(1, Math.floor(account.config.timeoutSeconds)) : void 0;
  const cacheKey = shouldUseTelegramClientOptionsCache() ? buildTelegramClientOptionsCacheKey({
    account,
    timeoutSeconds
  }) : null;
  if (cacheKey && telegramClientOptionsCache.has(cacheKey)) return telegramClientOptionsCache.get(cacheKey);
  const proxyUrl = (0, _textRuntime.normalizeOptionalString)(account.config.proxy);
  const proxyFetch = proxyUrl ? (0, _fetchB2K4ajFP.a)(proxyUrl) : void 0;
  const apiRoot = (0, _textRuntime.normalizeOptionalString)(account.config.apiRoot);
  const fetchImpl = (0, _fetchB2K4ajFP.n)(proxyFetch, { network: account.config.network });
  const clientOptions = fetchImpl || timeoutSeconds || apiRoot ? {
    ...(fetchImpl ? { fetch: asTelegramClientFetch(fetchImpl) } : {}),
    ...(timeoutSeconds ? { timeoutSeconds } : {}),
    ...(apiRoot ? { apiRoot } : {})
  } : void 0;
  if (cacheKey) return setCachedTelegramClientOptions(cacheKey, clientOptions);
  return clientOptions;
}
function resolveToken(explicit, params) {
  if (explicit?.trim()) return explicit.trim();
  if (!params.token) throw new Error(`Telegram bot token missing for account "${params.accountId}" (set channels.telegram.accounts.${params.accountId}.botToken/tokenFile or TELEGRAM_BOT_TOKEN for default).`);
  return params.token.trim();
}
async function resolveChatId(to, params) {
  const numericChatId = (0, _outboundParamsDPqRaEDE.a)(to);
  if (numericChatId) return numericChatId;
  const lookupTarget = (0, _outboundParamsDPqRaEDE.o)(to);
  const getChat = params.api.getChat;
  if (!lookupTarget || typeof getChat !== "function") throw new Error("Telegram recipient must be a numeric chat ID");
  try {
    const chat = await getChat.call(params.api, lookupTarget);
    const resolved = (0, _outboundParamsDPqRaEDE.a)(String(chat?.id ?? ""));
    if (!resolved) throw new Error(`resolved chat id is not numeric (${String(chat?.id ?? "")})`);
    if (params.verbose) sendLogger.warn(`telegram recipient ${lookupTarget} resolved to numeric chat id ${resolved}`);
    return resolved;
  } catch (err) {
    const detail = (0, _ssrfRuntime.formatErrorMessage)(err);
    throw new Error(`Telegram recipient ${lookupTarget} could not be resolved to a numeric chat ID (${detail})`, { cause: err });
  }
}
async function resolveAndPersistChatId(params) {
  const chatId = await resolveChatId(params.lookupTarget, {
    api: params.api,
    verbose: params.verbose
  });
  await maybePersistResolvedTelegramTarget({
    cfg: params.cfg,
    rawTarget: params.persistTarget,
    resolvedChatId: chatId,
    verbose: params.verbose,
    gatewayClientScopes: params.gatewayClientScopes
  });
  return chatId;
}
function normalizeMessageId(raw) {
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.trunc(raw);
  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) throw new Error("Message id is required for Telegram actions");
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  throw new Error("Message id is required for Telegram actions");
}
function isTelegramThreadNotFoundError(err) {
  return THREAD_NOT_FOUND_RE.test((0, _ssrfRuntime.formatErrorMessage)(err));
}
function isTelegramMessageNotModifiedError(err) {
  return MESSAGE_NOT_MODIFIED_RE.test((0, _ssrfRuntime.formatErrorMessage)(err));
}
function hasMessageThreadIdParam(params) {
  if (!params) return false;
  const value = params.message_thread_id;
  if (typeof value === "number") return Number.isFinite(value);
  return false;
}
function removeMessageThreadIdParam(params) {
  if (!params || !hasMessageThreadIdParam(params)) return params;
  const next = { ...params };
  delete next.message_thread_id;
  return Object.keys(next).length > 0 ? next : void 0;
}
function isTelegramHtmlParseError(err) {
  return PARSE_ERR_RE.test((0, _ssrfRuntime.formatErrorMessage)(err));
}
function buildTelegramThreadReplyParams(params) {
  const messageThreadId = params.messageThreadId != null ? params.messageThreadId : params.targetMessageThreadId;
  const threadScope = params.chatType === "direct" ? "dm" : "forum";
  const threadIdParams = (0, _formatDkmJkZf.y)(messageThreadId != null ? {
    id: messageThreadId,
    scope: threadScope
  } : void 0);
  const threadParams = threadIdParams ? { ...threadIdParams } : {};
  const replyToMessageId = (0, _outboundParamsDPqRaEDE.t)(params.replyToMessageId);
  if (replyToMessageId != null) if (params.quoteText?.trim()) threadParams.reply_parameters = {
    message_id: replyToMessageId,
    quote: params.quoteText.trim(),
    allow_sending_without_reply: true
  };else
  {
    threadParams.reply_to_message_id = replyToMessageId;
    threadParams.allow_sending_without_reply = true;
  }
  return threadParams;
}
async function withTelegramHtmlParseFallback(params) {
  try {
    return await params.requestHtml(params.label);
  } catch (err) {
    if (!isTelegramHtmlParseError(err)) throw err;
    if (params.verbose) sendLogger.warn(`telegram ${params.label} failed with HTML parse error, retrying as plain text: ${(0, _ssrfRuntime.formatErrorMessage)(err)}`);
    return await params.requestPlain(`${params.label}-plain`);
  }
}
function resolveTelegramApiContext(opts) {
  const cfg = opts.cfg ?? (0, _configRuntime.loadConfig)();
  const account = (0, _accountsCoskdHdZ.s)({
    cfg,
    accountId: opts.accountId
  });
  const token = resolveToken(opts.token, account);
  const client = resolveTelegramClientOptions(account);
  return {
    cfg,
    account,
    api: opts.api ?? new _grammy.Bot(token, client ? { client } : void 0).api
  };
}
function createTelegramRequestWithDiag(params) {
  const request = (0, _retryRuntime.createTelegramRetryRunner)({
    retry: params.retry,
    configRetry: params.account.config.retry,
    verbose: params.verbose,
    ...(params.shouldRetry ? { shouldRetry: params.shouldRetry } : {}),
    ...(params.strictShouldRetry ? { strictShouldRetry: true } : {})
  });
  const logHttpError = createTelegramHttpLogger(params.cfg);
  return (fn, label, options) => {
    const runRequest = () => request(fn, label);
    return (params.useApiErrorLogging === false ? runRequest() : withTelegramApiErrorLogging({
      operation: label ?? "request",
      fn: runRequest,
      ...(options?.shouldLog ? { shouldLog: options.shouldLog } : {})
    })).catch((err) => {
      logHttpError(label ?? "request", err);
      throw err;
    });
  };
}
function wrapTelegramChatNotFoundError(err, params) {
  const errorMsg = (0, _ssrfRuntime.formatErrorMessage)(err);
  if (/403.*(bot.*not.*member|bot.*blocked|bot.*kicked)/i.test(errorMsg)) return new Error([
  `Telegram send failed: bot is not a member of the chat, was blocked, or was kicked (chat_id=${params.chatId}).`,
  `Telegram API said: ${errorMsg}.`,
  "Fix: Add the bot to the channel/group, or ensure it has not been removed/blocked/kicked by the user.",
  `Input was: ${JSON.stringify(params.input)}.`].
  join(" "));
  if (!CHAT_NOT_FOUND_RE.test(errorMsg)) return err;
  return new Error([
  `Telegram send failed: chat not found (chat_id=${params.chatId}).`,
  "Likely: bot not started in DM, bot removed from group/channel, group migrated (new -100… id), or wrong bot token.",
  `Input was: ${JSON.stringify(params.input)}.`].
  join(" "));
}
async function withTelegramThreadFallback(params, label, verbose, attempt) {
  try {
    return await attempt(params, label);
  } catch (err) {
    if (!hasMessageThreadIdParam(params) || !isTelegramThreadNotFoundError(err)) throw err;
    if (verbose) sendLogger.warn(`telegram ${label} failed with message_thread_id, retrying without thread: ${(0, _ssrfRuntime.formatErrorMessage)(err)}`);
    return await attempt(removeMessageThreadIdParam(params), `${label}-threadless`);
  }
}
function createRequestWithChatNotFound(params) {
  return async (fn, label) => params.requestWithDiag(fn, label).catch((err) => {
    throw wrapTelegramChatNotFoundError(err, {
      chatId: params.chatId,
      input: params.input
    });
  });
}
function createTelegramNonIdempotentRequestWithDiag(params) {
  return createTelegramRequestWithDiag({
    cfg: params.cfg,
    account: params.account,
    retry: params.retry,
    verbose: params.verbose,
    useApiErrorLogging: params.useApiErrorLogging,
    shouldRetry: (err) => (0, _formatDkmJkZf.c)(err) || (0, _formatDkmJkZf.d)(err),
    strictShouldRetry: true
  });
}
async function sendMessageTelegram(to, text, opts = {}) {
  const { cfg, account, api } = resolveTelegramApiContext(opts);
  const target = (0, _outboundParamsDPqRaEDE.s)(to);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: target.chatId,
    persistTarget: to,
    verbose: opts.verbose,
    gatewayClientScopes: opts.gatewayClientScopes
  });
  const mediaUrl = opts.mediaUrl?.trim();
  const mediaMaxBytes = opts.maxBytes ?? (typeof account.config.mediaMaxMb === "number" ? account.config.mediaMaxMb : 100) * 1024 * 1024;
  const replyMarkup = buildInlineKeyboard(opts.buttons);
  const threadParams = buildTelegramThreadReplyParams({
    targetMessageThreadId: target.messageThreadId,
    messageThreadId: opts.messageThreadId,
    chatType: target.chatType,
    replyToMessageId: opts.replyToMessageId,
    quoteText: opts.quoteText
  });
  const hasThreadParams = Object.keys(threadParams).length > 0;
  const requestWithChatNotFound = createRequestWithChatNotFound({
    requestWithDiag: createTelegramNonIdempotentRequestWithDiag({
      cfg,
      account,
      retry: opts.retry,
      verbose: opts.verbose
    }),
    chatId,
    input: to
  });
  const textMode = opts.textMode ?? "markdown";
  const tableMode = (0, _configRuntime.resolveMarkdownTableMode)({
    cfg,
    channel: "telegram",
    accountId: account.accountId
  });
  const renderHtmlText = (value) => (0, _formatDkmJkZf.i)(value, {
    textMode,
    tableMode
  });
  const linkPreviewOptions = account.config.linkPreview ?? true ? void 0 : { is_disabled: true };
  const sendTelegramTextChunk = async (chunk, params) => {
    return await withTelegramThreadFallback(params, "message", opts.verbose, async (effectiveParams, label) => {
      const baseParams = effectiveParams ? { ...effectiveParams } : {};
      if (linkPreviewOptions) baseParams.link_preview_options = linkPreviewOptions;
      const plainParams = {
        ...baseParams,
        ...(opts.silent === true ? { disable_notification: true } : {})
      };
      const hasPlainParams = Object.keys(plainParams).length > 0;
      const requestPlain = (retryLabel) => requestWithChatNotFound(() => hasPlainParams ? api.sendMessage(chatId, chunk.plainText, plainParams) : api.sendMessage(chatId, chunk.plainText), retryLabel);
      if (!chunk.htmlText) return await requestPlain(label);
      const htmlText = chunk.htmlText;
      const htmlParams = {
        parse_mode: "HTML",
        ...plainParams
      };
      return await withTelegramHtmlParseFallback({
        label,
        verbose: opts.verbose,
        requestHtml: (retryLabel) => requestWithChatNotFound(() => api.sendMessage(chatId, htmlText, htmlParams), retryLabel),
        requestPlain
      });
    });
  };
  const buildTextParams = (isLastChunk) => hasThreadParams || isLastChunk && replyMarkup ? {
    ...threadParams,
    ...(isLastChunk && replyMarkup ? { reply_markup: replyMarkup } : {})
  } : void 0;
  const sendTelegramTextChunks = async (chunks, context) => {
    let lastMessageId = "";
    let lastChatId = chatId;
    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index];
      if (!chunk) continue;
      const res = await sendTelegramTextChunk(chunk, buildTextParams(index === chunks.length - 1));
      const messageId = resolveTelegramMessageIdOrThrow(res, context);
      recordSentMessage(chatId, messageId);
      lastMessageId = String(messageId);
      lastChatId = String(res?.chat?.id ?? chatId);
    }
    return {
      messageId: lastMessageId,
      chatId: lastChatId
    };
  };
  const buildChunkedTextPlan = (rawText, context) => {
    const fallbackText = opts.plainText ?? rawText;
    let htmlChunks;
    try {
      htmlChunks = (0, _formatDkmJkZf.a)(rawText, 4e3);
    } catch (error) {
      (0, _runtimeEnv.logVerbose)(`telegram ${context} failed HTML chunk planning, retrying as plain text: ${(0, _ssrfRuntime.formatErrorMessage)(error)}`);
      return splitTelegramPlainTextChunks(fallbackText, 4e3).map((plainText) => ({ plainText }));
    }
    const fixedPlainTextChunks = splitTelegramPlainTextChunks(fallbackText, 4e3);
    if (fixedPlainTextChunks.length > htmlChunks.length) {
      (0, _runtimeEnv.logVerbose)(`telegram ${context} plain-text fallback needs more chunks than HTML; sending plain text`);
      return fixedPlainTextChunks.map((plainText) => ({ plainText }));
    }
    const plainTextChunks = splitTelegramPlainTextFallback(fallbackText, htmlChunks.length, 4e3);
    return htmlChunks.map((htmlText, index) => ({
      htmlText,
      plainText: plainTextChunks[index] ?? htmlText
    }));
  };
  const sendChunkedText = async (rawText, context) => await sendTelegramTextChunks(buildChunkedTextPlan(rawText, context), context);
  async function shouldSendTelegramImageAsPhoto(buffer) {
    try {
      const metadata = await (0, _mediaRuntime.getImageMetadata)(buffer);
      const width = metadata?.width;
      const height = metadata?.height;
      if (typeof width !== "number" || typeof height !== "number") {
        sendLogger.warn("Photo dimensions are unavailable. Sending as document instead.");
        return false;
      }
      const shorterSide = Math.min(width, height);
      const longerSide = Math.max(width, height);
      if (!(width + height <= MAX_TELEGRAM_PHOTO_DIMENSION_SUM && shorterSide > 0 && longerSide <= shorterSide * MAX_TELEGRAM_PHOTO_ASPECT_RATIO)) {
        sendLogger.warn(`Photo dimensions (${width}x${height}) are not valid for Telegram photos. Sending as document instead.`);
        return false;
      }
      return true;
    } catch (err) {
      sendLogger.warn(`Failed to validate photo dimensions: ${(0, _ssrfRuntime.formatErrorMessage)(err)}. Sending as document instead.`);
      return false;
    }
  }
  if (mediaUrl) {
    const media = await (0, _webMedia.loadWebMedia)(mediaUrl, (0, _mediaRuntime.buildOutboundMediaLoadOptions)({
      maxBytes: mediaMaxBytes,
      mediaLocalRoots: opts.mediaLocalRoots,
      mediaReadFile: opts.mediaReadFile,
      optimizeImages: opts.forceDocument ? false : void 0
    }));
    const kind = (0, _mediaRuntime.kindFromMime)(media.contentType ?? void 0);
    const isGif = (0, _mediaRuntime.isGifMedia)({
      contentType: media.contentType,
      fileName: media.fileName
    });
    let sendImageAsPhoto = true;
    if (kind === "image" && !isGif && !opts.forceDocument) sendImageAsPhoto = await shouldSendTelegramImageAsPhoto(media.buffer);
    const isVideoNote = kind === "video" && opts.asVideoNote === true;
    const fileName = media.fileName ?? (isGif ? "animation.gif" : inferFilename(kind ?? "document")) ?? "file";
    const file = new InputFileCtor(media.buffer, fileName);
    let caption;
    let followUpText;
    if (isVideoNote) {
      caption = void 0;
      followUpText = text.trim() ? text : void 0;
    } else {
      const split = splitTelegramCaption(text);
      caption = split.caption;
      followUpText = split.followUpText;
    }
    const htmlCaption = caption ? renderHtmlText(caption) : void 0;
    const needsSeparateText = Boolean(followUpText);
    const baseMediaParams = {
      ...(hasThreadParams ? threadParams : {}),
      ...(!needsSeparateText && replyMarkup ? { reply_markup: replyMarkup } : {})
    };
    const mediaParams = {
      ...(htmlCaption ? {
        caption: htmlCaption,
        parse_mode: "HTML"
      } : {}),
      ...baseMediaParams,
      ...(opts.silent === true ? { disable_notification: true } : {})
    };
    const sendMedia = async (label, sender) => await withTelegramThreadFallback(mediaParams, label, opts.verbose, async (effectiveParams, retryLabel) => requestWithChatNotFound(() => sender(effectiveParams), retryLabel));
    const mediaSender = (() => {
      if (isGif && !opts.forceDocument) return {
        label: "animation",
        sender: (effectiveParams) => api.sendAnimation(chatId, file, effectiveParams)
      };
      if (kind === "image" && !opts.forceDocument && sendImageAsPhoto) return {
        label: "photo",
        sender: (effectiveParams) => api.sendPhoto(chatId, file, effectiveParams)
      };
      if (kind === "video") {
        if (isVideoNote) return {
          label: "video_note",
          sender: (effectiveParams) => api.sendVideoNote(chatId, file, effectiveParams)
        };
        return {
          label: "video",
          sender: (effectiveParams) => api.sendVideo(chatId, file, effectiveParams)
        };
      }
      if (kind === "audio") {
        const { useVoice } = resolveTelegramVoiceSend({
          wantsVoice: opts.asVoice === true,
          contentType: media.contentType,
          fileName,
          logFallback: _runtimeEnv.logVerbose
        });
        if (useVoice) return {
          label: "voice",
          sender: (effectiveParams) => api.sendVoice(chatId, file, effectiveParams)
        };
        return {
          label: "audio",
          sender: (effectiveParams) => api.sendAudio(chatId, file, effectiveParams)
        };
      }
      return {
        label: "document",
        sender: (effectiveParams) => api.sendDocument(chatId, file, opts.forceDocument ? {
          ...effectiveParams,
          disable_content_type_detection: true
        } : effectiveParams)
      };
    })();
    const result = await sendMedia(mediaSender.label, mediaSender.sender);
    const mediaMessageId = resolveTelegramMessageIdOrThrow(result, "media send");
    const resolvedChatId = String(result?.chat?.id ?? chatId);
    recordSentMessage(chatId, mediaMessageId);
    (0, _infraRuntime.recordChannelActivity)({
      channel: "telegram",
      accountId: account.accountId,
      direction: "outbound"
    });
    if (needsSeparateText && followUpText) {
      if (textMode === "html") return {
        messageId: (await sendChunkedText(followUpText, "text follow-up send")).messageId,
        chatId: resolvedChatId
      };
      return {
        messageId: (await sendTelegramTextChunks([{
          plainText: followUpText,
          htmlText: renderHtmlText(followUpText)
        }], "text follow-up send")).messageId,
        chatId: resolvedChatId
      };
    }
    return {
      messageId: String(mediaMessageId),
      chatId: resolvedChatId
    };
  }
  if (!text || !text.trim()) throw new Error("Message must be non-empty for Telegram sends");
  let textResult;
  if (textMode === "html") textResult = await sendChunkedText(text, "text send");else
  textResult = await sendTelegramTextChunks([{
    plainText: opts.plainText ?? text,
    htmlText: renderHtmlText(text)
  }], "text send");
  (0, _infraRuntime.recordChannelActivity)({
    channel: "telegram",
    accountId: account.accountId,
    direction: "outbound"
  });
  return textResult;
}
async function sendTypingTelegram(to, opts = {}) {
  const { cfg, account, api } = resolveTelegramApiContext(opts);
  const target = (0, _outboundParamsDPqRaEDE.s)(to);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: target.chatId,
    persistTarget: to,
    verbose: opts.verbose
  });
  const requestWithDiag = createTelegramRequestWithDiag({
    cfg,
    account,
    retry: opts.retry,
    verbose: opts.verbose,
    shouldRetry: (err) => (0, _formatDkmJkZf.s)(err, { context: "send" })
  });
  const threadParams = (0, _formatDkmJkZf.b)(target.messageThreadId ?? opts.messageThreadId);
  await requestWithDiag(() => api.sendChatAction(chatId, "typing", threadParams), "typing");
  return { ok: true };
}
async function reactMessageTelegram(chatIdInput, messageIdInput, emoji, opts = {}) {
  const { cfg, account, api } = resolveTelegramApiContext(opts);
  const rawTarget = String(chatIdInput);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: rawTarget,
    persistTarget: rawTarget,
    verbose: opts.verbose
  });
  const messageId = normalizeMessageId(messageIdInput);
  const requestWithDiag = createTelegramRequestWithDiag({
    cfg,
    account,
    retry: opts.retry,
    verbose: opts.verbose,
    shouldRetry: (err) => (0, _formatDkmJkZf.s)(err, { context: "send" })
  });
  const remove = opts.remove === true;
  const trimmedEmoji = emoji.trim();
  const reactions = remove || !trimmedEmoji ? [] : [{
    type: "emoji",
    emoji: trimmedEmoji
  }];
  if (typeof api.setMessageReaction !== "function") throw new Error("Telegram reactions are unavailable in this bot API.");
  try {
    await requestWithDiag(() => api.setMessageReaction(chatId, messageId, reactions), "reaction");
  } catch (err) {
    const msg = (0, _ssrfRuntime.formatErrorMessage)(err);
    if (/REACTION_INVALID/i.test(msg)) return {
      ok: false,
      warning: `Reaction unavailable: ${trimmedEmoji}`
    };
    throw err;
  }
  return { ok: true };
}
async function deleteMessageTelegram(chatIdInput, messageIdInput, opts = {}) {
  const { cfg, account, api } = resolveTelegramApiContext(opts);
  const rawTarget = String(chatIdInput);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: rawTarget,
    persistTarget: rawTarget,
    verbose: opts.verbose
  });
  const messageId = normalizeMessageId(messageIdInput);
  await createTelegramRequestWithDiag({
    cfg,
    account,
    retry: opts.retry,
    verbose: opts.verbose,
    shouldRetry: (err) => (0, _formatDkmJkZf.s)(err, { context: "send" })
  })(() => api.deleteMessage(chatId, messageId), "deleteMessage");
  (0, _runtimeEnv.logVerbose)(`[telegram] Deleted message ${messageId} from chat ${chatId}`);
  return { ok: true };
}
async function pinMessageTelegram(chatIdInput, messageIdInput, opts = {}) {
  const { cfg, account, api } = resolveTelegramApiContext(opts);
  const rawTarget = String(chatIdInput);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: rawTarget,
    persistTarget: rawTarget,
    verbose: opts.verbose
  });
  const messageId = normalizeMessageId(messageIdInput);
  await createTelegramRequestWithDiag({
    cfg,
    account,
    retry: opts.retry,
    verbose: opts.verbose
  })(() => api.pinChatMessage(chatId, messageId, { disable_notification: true }), "pinChatMessage");
  (0, _runtimeEnv.logVerbose)(`[telegram] Pinned message ${messageId} in chat ${chatId}`);
  return {
    ok: true,
    messageId: String(messageId),
    chatId
  };
}
async function unpinMessageTelegram(chatIdInput, messageIdInput, opts = {}) {
  const { cfg, account, api } = resolveTelegramApiContext(opts);
  const rawTarget = String(chatIdInput);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: rawTarget,
    persistTarget: rawTarget,
    verbose: opts.verbose
  });
  const messageId = messageIdInput === void 0 ? void 0 : normalizeMessageId(messageIdInput);
  await createTelegramRequestWithDiag({
    cfg,
    account,
    retry: opts.retry,
    verbose: opts.verbose
  })(() => api.unpinChatMessage(chatId, messageId), "unpinChatMessage");
  (0, _runtimeEnv.logVerbose)(`[telegram] Unpinned ${messageId != null ? `message ${messageId}` : "active message"} in chat ${chatId}`);
  return {
    ok: true,
    chatId,
    ...(messageId != null ? { messageId: String(messageId) } : {})
  };
}
async function editForumTopicTelegram(chatIdInput, messageThreadIdInput, opts = {}) {
  const nameProvided = opts.name !== void 0;
  const trimmedName = opts.name?.trim();
  if (nameProvided && !trimmedName) throw new Error("Telegram forum topic name is required");
  if (trimmedName && trimmedName.length > 128) throw new Error("Telegram forum topic name must be 128 characters or fewer");
  const iconProvided = opts.iconCustomEmojiId !== void 0;
  const trimmedIconCustomEmojiId = opts.iconCustomEmojiId?.trim();
  if (iconProvided && !trimmedIconCustomEmojiId) throw new Error("Telegram forum topic icon custom emoji ID is required");
  if (!trimmedName && !trimmedIconCustomEmojiId) throw new Error("Telegram forum topic update requires a name or iconCustomEmojiId");
  const { cfg, account, api } = resolveTelegramApiContext(opts);
  const rawTarget = String(chatIdInput);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: (0, _outboundParamsDPqRaEDE.s)(rawTarget).chatId,
    persistTarget: rawTarget,
    verbose: opts.verbose
  });
  const messageThreadId = normalizeMessageId(messageThreadIdInput);
  const requestWithDiag = createTelegramRequestWithDiag({
    cfg,
    account,
    retry: opts.retry,
    verbose: opts.verbose
  });
  const payload = {
    ...(trimmedName ? { name: trimmedName } : {}),
    ...(trimmedIconCustomEmojiId ? { icon_custom_emoji_id: trimmedIconCustomEmojiId } : {})
  };
  await requestWithDiag(() => api.editForumTopic(chatId, messageThreadId, payload), "editForumTopic");
  (0, _runtimeEnv.logVerbose)(`[telegram] Edited forum topic ${messageThreadId} in chat ${chatId}`);
  return {
    ok: true,
    chatId,
    messageThreadId,
    ...(trimmedName ? { name: trimmedName } : {}),
    ...(trimmedIconCustomEmojiId ? { iconCustomEmojiId: trimmedIconCustomEmojiId } : {})
  };
}
async function renameForumTopicTelegram(chatIdInput, messageThreadIdInput, name, opts = {}) {
  const result = await editForumTopicTelegram(chatIdInput, messageThreadIdInput, {
    ...opts,
    name
  });
  return {
    ok: true,
    chatId: result.chatId,
    messageThreadId: result.messageThreadId,
    name: result.name ?? name.trim()
  };
}
async function editMessageReplyMarkupTelegram(chatIdInput, messageIdInput, buttons, opts = {}) {
  const { cfg, account, api } = resolveTelegramApiContext({
    ...opts,
    cfg: opts.cfg
  });
  const rawTarget = String(chatIdInput);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: rawTarget,
    persistTarget: rawTarget,
    verbose: opts.verbose
  });
  const messageId = normalizeMessageId(messageIdInput);
  const requestWithDiag = createTelegramRequestWithDiag({
    cfg,
    account,
    retry: opts.retry,
    verbose: opts.verbose
  });
  const replyMarkup = buildInlineKeyboard(buttons) ?? { inline_keyboard: [] };
  try {
    await requestWithDiag(() => api.editMessageReplyMarkup(chatId, messageId, { reply_markup: replyMarkup }), "editMessageReplyMarkup", { shouldLog: (err) => !isTelegramMessageNotModifiedError(err) });
  } catch (err) {
    if (!isTelegramMessageNotModifiedError(err)) throw err;
  }
  (0, _runtimeEnv.logVerbose)(`[telegram] Edited reply markup for message ${messageId} in chat ${chatId}`);
  return {
    ok: true,
    messageId: String(messageId),
    chatId
  };
}
async function editMessageTelegram(chatIdInput, messageIdInput, text, opts = {}) {
  const { cfg, account, api } = resolveTelegramApiContext({
    ...opts,
    cfg: opts.cfg
  });
  const rawTarget = String(chatIdInput);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: rawTarget,
    persistTarget: rawTarget,
    verbose: opts.verbose
  });
  const messageId = normalizeMessageId(messageIdInput);
  const requestWithDiag = createTelegramRequestWithDiag({
    cfg,
    account,
    retry: opts.retry,
    verbose: opts.verbose,
    shouldRetry: (err) => (0, _formatDkmJkZf.s)(err, { allowMessageMatch: true }) || (0, _formatDkmJkZf.f)(err)
  });
  const requestWithEditShouldLog = (fn, label, shouldLog) => requestWithDiag(fn, label, shouldLog ? { shouldLog } : void 0);
  const htmlText = (0, _formatDkmJkZf.i)(text, {
    textMode: opts.textMode ?? "markdown",
    tableMode: (0, _configRuntime.resolveMarkdownTableMode)({
      cfg,
      channel: "telegram",
      accountId: account.accountId
    })
  });
  const shouldTouchButtons = opts.buttons !== void 0;
  const builtKeyboard = shouldTouchButtons ? buildInlineKeyboard(opts.buttons) : void 0;
  const replyMarkup = shouldTouchButtons ? builtKeyboard ?? { inline_keyboard: [] } : void 0;
  const editParams = { parse_mode: "HTML" };
  if (opts.linkPreview === false) editParams.link_preview_options = { is_disabled: true };
  if (replyMarkup !== void 0) editParams.reply_markup = replyMarkup;
  const plainParams = {};
  if (opts.linkPreview === false) plainParams.link_preview_options = { is_disabled: true };
  if (replyMarkup !== void 0) plainParams.reply_markup = replyMarkup;
  try {
    await withTelegramHtmlParseFallback({
      label: "editMessage",
      verbose: opts.verbose,
      requestHtml: (retryLabel) => requestWithEditShouldLog(() => api.editMessageText(chatId, messageId, htmlText, editParams), retryLabel, (err) => !isTelegramMessageNotModifiedError(err)),
      requestPlain: (retryLabel) => requestWithEditShouldLog(() => Object.keys(plainParams).length > 0 ? api.editMessageText(chatId, messageId, text, plainParams) : api.editMessageText(chatId, messageId, text), retryLabel, (plainErr) => !isTelegramMessageNotModifiedError(plainErr))
    });
  } catch (err) {
    if (isTelegramMessageNotModifiedError(err)) {} else throw err;
  }
  (0, _runtimeEnv.logVerbose)(`[telegram] Edited message ${messageId} in chat ${chatId}`);
  return {
    ok: true,
    messageId: String(messageId),
    chatId
  };
}
function inferFilename(kind) {
  switch (kind) {
    case "image":return "image.jpg";
    case "video":return "video.mp4";
    case "audio":return "audio.ogg";
    default:return "file.bin";
  }
}
/**
* Send a sticker to a Telegram chat by file_id.
* @param to - Chat ID or username (e.g., "123456789" or "@username")
* @param fileId - Telegram file_id of the sticker to send
* @param opts - Optional configuration
*/
async function sendStickerTelegram(to, fileId, opts = {}) {
  if (!fileId?.trim()) throw new Error("Telegram sticker file_id is required");
  const { cfg, account, api } = resolveTelegramApiContext(opts);
  const target = (0, _outboundParamsDPqRaEDE.s)(to);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: target.chatId,
    persistTarget: to,
    verbose: opts.verbose
  });
  const threadParams = buildTelegramThreadReplyParams({
    targetMessageThreadId: target.messageThreadId,
    messageThreadId: opts.messageThreadId,
    chatType: target.chatType,
    replyToMessageId: opts.replyToMessageId
  });
  const hasThreadParams = Object.keys(threadParams).length > 0;
  const requestWithChatNotFound = createRequestWithChatNotFound({
    requestWithDiag: createTelegramNonIdempotentRequestWithDiag({
      cfg,
      account,
      retry: opts.retry,
      verbose: opts.verbose,
      useApiErrorLogging: false
    }),
    chatId,
    input: to
  });
  const result = await withTelegramThreadFallback(hasThreadParams ? threadParams : void 0, "sticker", opts.verbose, async (effectiveParams, label) => requestWithChatNotFound(() => api.sendSticker(chatId, fileId.trim(), effectiveParams), label));
  const messageId = resolveTelegramMessageIdOrThrow(result, "sticker send");
  const resolvedChatId = String(result?.chat?.id ?? chatId);
  recordSentMessage(chatId, messageId);
  (0, _infraRuntime.recordChannelActivity)({
    channel: "telegram",
    accountId: account.accountId,
    direction: "outbound"
  });
  return {
    messageId: String(messageId),
    chatId: resolvedChatId
  };
}
/**
* Send a poll to a Telegram chat.
* @param to - Chat ID or username (e.g., "123456789" or "@username")
* @param poll - Poll input with question, options, maxSelections, and optional durationHours
* @param opts - Optional configuration
*/
async function sendPollTelegram(to, poll, opts = {}) {
  const { cfg, account, api } = resolveTelegramApiContext(opts);
  const target = (0, _outboundParamsDPqRaEDE.s)(to);
  const chatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: target.chatId,
    persistTarget: to,
    verbose: opts.verbose,
    gatewayClientScopes: opts.gatewayClientScopes
  });
  const normalizedPoll = (0, _mediaRuntime.normalizePollInput)(poll, { maxOptions: 10 });
  const threadParams = buildTelegramThreadReplyParams({
    targetMessageThreadId: target.messageThreadId,
    messageThreadId: opts.messageThreadId,
    chatType: target.chatType,
    replyToMessageId: opts.replyToMessageId
  });
  const pollOptions = normalizedPoll.options;
  const requestWithChatNotFound = createRequestWithChatNotFound({
    requestWithDiag: createTelegramNonIdempotentRequestWithDiag({
      cfg,
      account,
      retry: opts.retry,
      verbose: opts.verbose
    }),
    chatId,
    input: to
  });
  const durationSeconds = normalizedPoll.durationSeconds;
  if (durationSeconds === void 0 && normalizedPoll.durationHours !== void 0) throw new Error("Telegram poll durationHours is not supported. Use durationSeconds (5-600) instead.");
  if (durationSeconds !== void 0 && (durationSeconds < 5 || durationSeconds > 600)) throw new Error("Telegram poll durationSeconds must be between 5 and 600");
  const result = await withTelegramThreadFallback({
    allows_multiple_answers: normalizedPoll.maxSelections > 1,
    is_anonymous: opts.isAnonymous ?? true,
    ...(durationSeconds !== void 0 ? { open_period: durationSeconds } : {}),
    ...(Object.keys(threadParams).length > 0 ? threadParams : {}),
    ...(opts.silent === true ? { disable_notification: true } : {})
  }, "poll", opts.verbose, async (effectiveParams, label) => requestWithChatNotFound(() => api.sendPoll(chatId, normalizedPoll.question, pollOptions, effectiveParams), label));
  const messageId = resolveTelegramMessageIdOrThrow(result, "poll send");
  const resolvedChatId = String(result?.chat?.id ?? chatId);
  const pollId = result?.poll?.id;
  recordSentMessage(chatId, messageId);
  (0, _infraRuntime.recordChannelActivity)({
    channel: "telegram",
    accountId: account.accountId,
    direction: "outbound"
  });
  return {
    messageId: String(messageId),
    chatId: resolvedChatId,
    pollId
  };
}
/**
* Create a forum topic in a Telegram supergroup.
* Requires the bot to have `can_manage_topics` permission.
*
* @param chatId - Supergroup chat ID
* @param name - Topic name (1-128 characters)
* @param opts - Optional configuration
*/
async function createForumTopicTelegram(chatId, name, opts = {}) {
  if (!name?.trim()) throw new Error("Forum topic name is required");
  const trimmedName = name.trim();
  if (trimmedName.length > 128) throw new Error("Forum topic name must be 128 characters or fewer");
  const { cfg, account, api } = resolveTelegramApiContext(opts);
  const normalizedChatId = await resolveAndPersistChatId({
    cfg,
    api,
    lookupTarget: (0, _outboundParamsDPqRaEDE.s)(chatId).chatId,
    persistTarget: chatId,
    verbose: opts.verbose
  });
  const requestWithDiag = createTelegramNonIdempotentRequestWithDiag({
    cfg,
    account,
    retry: opts.retry,
    verbose: opts.verbose
  });
  const extra = {};
  if (opts.iconColor != null) extra.icon_color = opts.iconColor;
  if (opts.iconCustomEmojiId?.trim()) extra.icon_custom_emoji_id = opts.iconCustomEmojiId.trim();
  const hasExtra = Object.keys(extra).length > 0;
  const result = await requestWithDiag(() => api.createForumTopic(normalizedChatId, trimmedName, hasExtra ? extra : void 0), "createForumTopic");
  const topicId = result.message_thread_id;
  (0, _infraRuntime.recordChannelActivity)({
    channel: "telegram",
    accountId: account.accountId,
    direction: "outbound"
  });
  return {
    topicId,
    name: result.name ?? trimmedName,
    chatId: normalizedChatId
  };
}
//#endregion /* v9-ac0760d5743284dc */
