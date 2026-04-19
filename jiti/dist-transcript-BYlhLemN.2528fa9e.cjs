"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = resolveMirroredTranscriptText;exports.n = appendExactAssistantMessageToSessionTranscript;exports.r = resolveSessionTranscriptFile;exports.t = appendAssistantMessageToSessionTranscript;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _storeDFXcceZJ = require("./store-DFXcceZJ.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
var _storeLoadDjLNEIy = require("./store-load-DjLNEIy9.js");
var _transcriptEventsCdRuhFsO = require("./transcript-events-CdRuhFsO.js");
var _sessionFileB_37cdL = require("./session-file-B_37cdL1.js");
var _threadInfoDA0w7q1W = require("./thread-info-DA0w7q1W.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _piCodingAgent = require("@mariozechner/pi-coding-agent");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/config/sessions/transcript-mirror.ts
function stripQuery(value) {
  const noHash = value.split("#")[0] ?? value;
  return noHash.split("?")[0] ?? noHash;
}
function extractFileNameFromMediaUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const cleaned = stripQuery(trimmed);
  try {
    const parsed = new URL(cleaned);
    const base = _nodePath.default.basename(parsed.pathname);
    if (!base) return null;
    try {
      return decodeURIComponent(base);
    } catch {
      return base;
    }
  } catch {
    const base = _nodePath.default.basename(cleaned);
    if (!base || base === "/" || base === ".") return null;
    return base;
  }
}
function resolveMirroredTranscriptText(params) {
  const mediaUrls = params.mediaUrls?.filter((url) => url && url.trim()) ?? [];
  if (mediaUrls.length > 0) {
    const names = mediaUrls.map((url) => extractFileNameFromMediaUrl(url)).filter((name) => Boolean(name && name.trim()));
    if (names.length > 0) return names.join(", ");
    return "media";
  }
  const trimmed = (params.text ?? "").trim();
  return trimmed ? trimmed : null;
}
//#endregion
//#region src/config/sessions/transcript.ts
async function ensureSessionHeader(params) {
  if (_nodeFs.default.existsSync(params.sessionFile)) return;
  await _nodeFs.default.promises.mkdir(_nodePath.default.dirname(params.sessionFile), { recursive: true });
  const header = {
    type: "session",
    version: _piCodingAgent.CURRENT_SESSION_VERSION,
    id: params.sessionId,
    timestamp: (/* @__PURE__ */new Date()).toISOString(),
    cwd: process.cwd()
  };
  await _nodeFs.default.promises.writeFile(params.sessionFile, `${JSON.stringify(header)}\n`, {
    encoding: "utf-8",
    mode: 384
  });
}
async function resolveSessionTranscriptFile(params) {
  const sessionPathOpts = (0, _pathsCZMxg3hs.a)({
    agentId: params.agentId,
    storePath: params.storePath
  });
  let sessionFile = (0, _pathsCZMxg3hs.i)(params.sessionId, params.sessionEntry, sessionPathOpts);
  let sessionEntry = params.sessionEntry;
  if (params.sessionStore && params.storePath) {
    const threadIdFromSessionKey = (0, _threadInfoDA0w7q1W.t)(params.sessionKey).threadId;
    const fallbackSessionFile = !sessionEntry?.sessionFile ? (0, _pathsCZMxg3hs.o)(params.sessionId, params.agentId, params.threadId ?? threadIdFromSessionKey) : void 0;
    const resolvedSessionFile = await (0, _sessionFileB_37cdL.t)({
      sessionId: params.sessionId,
      sessionKey: params.sessionKey,
      sessionStore: params.sessionStore,
      storePath: params.storePath,
      sessionEntry,
      agentId: sessionPathOpts?.agentId,
      sessionsDir: sessionPathOpts?.sessionsDir,
      fallbackSessionFile
    });
    sessionFile = resolvedSessionFile.sessionFile;
    sessionEntry = resolvedSessionFile.sessionEntry;
  }
  return {
    sessionFile,
    sessionEntry
  };
}
async function appendAssistantMessageToSessionTranscript(params) {
  const sessionKey = params.sessionKey.trim();
  if (!sessionKey) return {
    ok: false,
    reason: "missing sessionKey"
  };
  const mirrorText = resolveMirroredTranscriptText({
    text: params.text,
    mediaUrls: params.mediaUrls
  });
  if (!mirrorText) return {
    ok: false,
    reason: "empty text"
  };
  return appendExactAssistantMessageToSessionTranscript({
    agentId: params.agentId,
    sessionKey,
    storePath: params.storePath,
    idempotencyKey: params.idempotencyKey,
    updateMode: params.updateMode,
    message: {
      role: "assistant",
      content: [{
        type: "text",
        text: mirrorText
      }],
      api: "openai-responses",
      provider: "openclaw",
      model: "delivery-mirror",
      usage: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
        totalTokens: 0,
        cost: {
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
          total: 0
        }
      },
      stopReason: "stop",
      timestamp: Date.now()
    }
  });
}
async function appendExactAssistantMessageToSessionTranscript(params) {
  const sessionKey = params.sessionKey.trim();
  if (!sessionKey) return {
    ok: false,
    reason: "missing sessionKey"
  };
  if (params.message.role !== "assistant") return {
    ok: false,
    reason: "message role must be assistant"
  };
  const storePath = params.storePath ?? (0, _pathsCZMxg3hs.r)(params.agentId);
  const store = (0, _storeLoadDjLNEIy.t)(storePath, { skipCache: true });
  const entry = store[(0, _storeDFXcceZJ.n)(sessionKey)] ?? store[sessionKey];
  if (!entry?.sessionId) return {
    ok: false,
    reason: `unknown sessionKey: ${sessionKey}`
  };
  let sessionFile;
  try {
    sessionFile = (await (0, _sessionFileB_37cdL.t)({
      sessionId: entry.sessionId,
      sessionKey,
      sessionStore: store,
      storePath,
      sessionEntry: entry,
      agentId: params.agentId,
      sessionsDir: _nodePath.default.dirname(storePath)
    })).sessionFile;
  } catch (err) {
    return {
      ok: false,
      reason: (0, _errorsD8p6rxH.i)(err)
    };
  }
  await ensureSessionHeader({
    sessionFile,
    sessionId: entry.sessionId
  });
  const explicitIdempotencyKey = params.idempotencyKey ?? params.message.idempotencyKey;
  const existingMessageId = explicitIdempotencyKey ? await transcriptHasIdempotencyKey(sessionFile, explicitIdempotencyKey) : void 0;
  if (existingMessageId) return {
    ok: true,
    sessionFile,
    messageId: existingMessageId
  };
  const latestEquivalentAssistantId = isRedundantDeliveryMirror(params.message) ? await findLatestEquivalentAssistantMessageId(sessionFile, params.message) : void 0;
  if (latestEquivalentAssistantId) return {
    ok: true,
    sessionFile,
    messageId: latestEquivalentAssistantId
  };
  const message = {
    ...params.message,
    ...(explicitIdempotencyKey ? { idempotencyKey: explicitIdempotencyKey } : {})
  };
  const messageId = _piCodingAgent.SessionManager.open(sessionFile).appendMessage(message);
  switch (params.updateMode ?? "inline") {
    case "inline":
      (0, _transcriptEventsCdRuhFsO.t)({
        sessionFile,
        sessionKey,
        message,
        messageId
      });
      break;
    case "file-only":
      (0, _transcriptEventsCdRuhFsO.t)(sessionFile);
      break;
    case "none":break;
  }
  return {
    ok: true,
    sessionFile,
    messageId
  };
}
async function transcriptHasIdempotencyKey(transcriptPath, idempotencyKey) {
  try {
    const raw = await _nodeFs.default.promises.readFile(transcriptPath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.idempotencyKey === idempotencyKey && typeof parsed.id === "string" && parsed.id) return parsed.id;
      } catch {
        continue;
      }
    }
  } catch {
    return;
  }
}
function isRedundantDeliveryMirror(message) {
  return message.provider === "openclaw" && message.model === "delivery-mirror";
}
function extractAssistantMessageText(message) {
  if (!Array.isArray(message.content)) return null;
  const parts = message.content.filter((part) => part.type === "text" && typeof part.text === "string" && part.text.trim().length > 0).map((part) => part.text.trim());
  return parts.length > 0 ? parts.join("\n").trim() : null;
}
async function findLatestEquivalentAssistantMessageId(transcriptPath, message) {
  const expectedText = extractAssistantMessageText(message);
  if (!expectedText) return;
  try {
    const lines = (await _nodeFs.default.promises.readFile(transcriptPath, "utf-8")).split(/\r?\n/);
    for (let index = lines.length - 1; index >= 0; index -= 1) {
      const line = lines[index];
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        const candidate = parsed.message;
        if (!candidate || candidate.role !== "assistant") continue;
        if (extractAssistantMessageText(candidate) !== expectedText) return;
        if (typeof parsed.id === "string" && parsed.id) return parsed.id;
        return;
      } catch {
        continue;
      }
    }
  } catch {
    return;
  }
}
//#endregion /* v9-e9c059069287f871 */
