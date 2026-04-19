"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports._ = fileExists;exports.a = runCliEntry;exports.c = parseFfprobeCodecAndSampleRate;exports.d = runFfprobe;exports.f = void 0;exports.g = extractGeminiResponse;exports.h = void 0;exports.i = normalizeDecisionReason;exports.l = parseFfprobeCsvFields;exports.m = void 0;exports.n = findDecisionReason;exports.o = runProviderEntry;exports.p = void 0;exports.r = formatDecisionSummary;exports.s = summarizeDecisionReason;exports.t = buildModelDecision;exports.u = runFfmpeg;exports.v = void 0;exports.y = isMediaUnderstandingSkipError;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _tmpOpenclawDirEyAoWbVe = require("./tmp-openclaw-dir-eyAoWbVe.js");
var _globalsDe6QTwLG = require("./globals-De6QTwLG.js");
var _execBAdwyfxI = require("./exec-BAdwyfxI.js");
var _modelAuthRuntimeSharedJdNQNamX = require("./model-auth-runtime-shared-jdNQNamX.js");
var _modelAuthKKLbMBGv = require("./model-auth-KKLbMBGv.js");
var _providerRequestConfigS_W3yUlE = require("./provider-request-config-S_W3yUlE.js");
var _resolveSystemBinCkNzNGgY = require("./resolve-system-bin-CkNzNGgY.js");
var _entryCapabilities7cOlAQEs = require("./entry-capabilities-7cOlAQEs.js");
var _resolveDqYzTtEU = require("./resolve-DqYzTtEU.js");
var _imageRuntimeH0HMzsrb = require("./image-runtime-H0HMzsrb.js");
var _apiKeyRotationBaBwK9eH = require("./api-key-rotation-BaBwK9eH.js");
var _templatingCrTeZLPl = require("./templating-CrTeZLPl.js");
var _proxyFetch5deRg8He = require("./proxy-fetch-5deRg8He.js");
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeChild_process = require("node:child_process");
var _promises = _interopRequireDefault(require("node:fs/promises"));
var _nodeUtil = require("node:util");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/media-understanding/errors.ts
var MediaUnderstandingSkipError = class extends Error {
  constructor(reason, message) {
    super(message);
    this.reason = reason;
    this.name = "MediaUnderstandingSkipError";
  }
};exports.v = MediaUnderstandingSkipError;
function isMediaUnderstandingSkipError(err) {
  return err instanceof MediaUnderstandingSkipError;
}
//#endregion
//#region src/media-understanding/fs.ts
async function fileExists(filePath) {
  if (!filePath) return false;
  try {
    await _promises.default.stat(filePath);
    return true;
  } catch {
    return false;
  }
}
//#endregion
//#region src/media-understanding/output-extract.ts
function extractLastJsonObject(raw) {
  const trimmed = raw.trim();
  const start = trimmed.lastIndexOf("{");
  if (start === -1) return null;
  const slice = trimmed.slice(start);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}
function extractGeminiResponse(raw) {
  const payload = extractLastJsonObject(raw);
  if (!payload || typeof payload !== "object") return null;
  const response = payload.response;
  if (typeof response !== "string") return null;
  return response.trim() || null;
}
//#endregion
//#region src/media/ffmpeg-limits.ts
const MEDIA_FFMPEG_MAX_BUFFER_BYTES = exports.p = 10 * 1024 * 1024;
const MEDIA_FFPROBE_TIMEOUT_MS = exports.h = 1e4;
const MEDIA_FFMPEG_TIMEOUT_MS = exports.m = 45e3;
const MEDIA_FFMPEG_MAX_AUDIO_DURATION_SECS = exports.f = 1200;
//#endregion
//#region src/media/ffmpeg-exec.ts
const execFileAsync = (0, _nodeUtil.promisify)(_nodeChild_process.execFile);
function resolveExecOptions(defaultTimeoutMs, options) {
  return {
    timeout: options?.timeoutMs ?? defaultTimeoutMs,
    maxBuffer: options?.maxBufferBytes ?? 10485760
  };
}
function requireSystemBin(name) {
  const resolved = (0, _resolveSystemBinCkNzNGgY.t)(name, { trust: "standard" });
  if (!resolved) {
    const hint = process.platform === "darwin" ? "e.g. brew install ffmpeg" : "e.g. apt install ffmpeg / dnf install ffmpeg";
    throw new Error(`${name} not found in trusted system directories. Install it via your system package manager (${hint}).`);
  }
  return resolved;
}
async function runFfprobe(args, options) {
  const { stdout } = await execFileAsync(requireSystemBin("ffprobe"), args, resolveExecOptions(MEDIA_FFPROBE_TIMEOUT_MS, options));
  return stdout.toString();
}
async function runFfmpeg(args, options) {
  const { stdout } = await execFileAsync(requireSystemBin("ffmpeg"), args, resolveExecOptions(MEDIA_FFMPEG_TIMEOUT_MS, options));
  return stdout.toString();
}
function parseFfprobeCsvFields(stdout, maxFields) {
  return stdout.trim().split(/[,\r\n]+/, maxFields).map((field) => (0, _stringCoerceBUSzWgUA.i)(field));
}
function parseFfprobeCodecAndSampleRate(stdout) {
  const [codecRaw, sampleRateRaw] = parseFfprobeCsvFields(stdout, 2);
  const codec = codecRaw ? codecRaw : null;
  const sampleRate = sampleRateRaw ? Number.parseInt(sampleRateRaw, 10) : NaN;
  return {
    codec,
    sampleRateHz: Number.isFinite(sampleRate) ? sampleRate : null
  };
}
//#endregion
//#region src/media-understanding/video.ts
function estimateBase64Size(bytes) {
  return Math.ceil(bytes / 3) * 4;
}
function resolveVideoMaxBase64Bytes(maxBytes) {
  const expanded = Math.floor(maxBytes * (4 / 3));
  return Math.min(expanded, _resolveDqYzTtEU._);
}
//#endregion
//#region src/media-understanding/runner.entries.ts
function sanitizeProviderHeaders(headers) {
  if (!headers) return;
  const next = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value !== "string") continue;
    next[key] = value;
  }
  return Object.keys(next).length > 0 ? next : void 0;
}
function trimOutput(text, maxChars) {
  const trimmed = text.trim();
  if (!maxChars || trimmed.length <= maxChars) return trimmed;
  return trimmed.slice(0, maxChars).trim();
}
function extractSherpaOnnxText(raw) {
  const tryParse = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const head = trimmed[0];
    if (head !== "{" && head !== "\"") return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "string") return tryParse(parsed);
      if (parsed && typeof parsed === "object") {
        const text = parsed.text;
        if (typeof text === "string" && text.trim()) return text.trim();
      }
    } catch {}
    return null;
  };
  const direct = tryParse(raw);
  if (direct) return direct;
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const parsed = tryParse(lines[i] ?? "");
    if (parsed) return parsed;
  }
  return null;
}
function commandBase(command) {
  return _nodePath.default.parse(command).name;
}
function findArgValue(args, keys) {
  for (let i = 0; i < args.length; i += 1) if (keys.includes(args[i] ?? "")) {
    const value = args[i + 1];
    if (value) return value;
  }
}
function hasArg(args, keys) {
  return args.some((arg) => keys.includes(arg));
}
function resolveWhisperOutputPath(args, mediaPath) {
  const outputDir = findArgValue(args, ["--output_dir", "-o"]);
  const outputFormat = findArgValue(args, ["--output_format"]);
  if (!outputDir || !outputFormat) return null;
  if (!outputFormat.split(",").map((value) => value.trim()).includes("txt")) return null;
  const base = _nodePath.default.parse(mediaPath).name;
  return _nodePath.default.join(outputDir, `${base}.txt`);
}
function resolveWhisperCppOutputPath(args) {
  if (!hasArg(args, ["-otxt", "--output-txt"])) return null;
  const outputBase = findArgValue(args, ["-of", "--output-file"]);
  if (!outputBase) return null;
  return `${outputBase}.txt`;
}
function resolveParakeetOutputPath(args, mediaPath) {
  const outputDir = findArgValue(args, ["--output-dir"]);
  const outputFormat = findArgValue(args, ["--output-format"]);
  if (!outputDir) return null;
  if (outputFormat && outputFormat !== "txt") return null;
  const base = _nodePath.default.parse(mediaPath).name;
  return _nodePath.default.join(outputDir, `${base}.txt`);
}
async function resolveCliOutput(params) {
  const commandId = commandBase(params.command);
  const fileOutput = commandId === "whisper-cli" ? resolveWhisperCppOutputPath(params.args) : commandId === "whisper" ? resolveWhisperOutputPath(params.args, params.mediaPath) : commandId === "parakeet-mlx" ? resolveParakeetOutputPath(params.args, params.mediaPath) : null;
  if (fileOutput && (await fileExists(fileOutput))) try {
    const content = await _promises.default.readFile(fileOutput, "utf8");
    if (content.trim()) return content.trim();
  } catch {}
  if (commandId === "gemini") {
    const response = extractGeminiResponse(params.stdout);
    if (response) return response;
  }
  if (commandId === "sherpa-onnx-offline") {
    const response = extractSherpaOnnxText(params.stdout);
    if (response) return response;
  }
  return params.stdout.trim();
}
async function resolveCliMediaPath(params) {
  const commandId = commandBase(params.command);
  if (params.capability !== "audio" || commandId !== "whisper-cli") return params.mediaPath;
  if ((0, _stringCoerceBUSzWgUA.i)(_nodePath.default.extname(params.mediaPath)) === ".wav") return params.mediaPath;
  const wavPath = _nodePath.default.join(params.outputDir, `${_nodePath.default.parse(params.mediaPath).name}.wav`);
  await runFfmpeg([
  "-y",
  "-i",
  params.mediaPath,
  "-ac",
  "1",
  "-ar",
  "16000",
  "-c:a",
  "pcm_s16le",
  wavPath]
  );
  return wavPath;
}
function normalizeProviderQuery(options) {
  if (!options) return;
  const query = {};
  for (const [key, value] of Object.entries(options)) {
    if (value === void 0) continue;
    query[key] = value;
  }
  return Object.keys(query).length > 0 ? query : void 0;
}
function buildDeepgramCompatQuery(options) {
  if (!options) return;
  const query = {};
  if (typeof options.detectLanguage === "boolean") query.detect_language = options.detectLanguage;
  if (typeof options.punctuate === "boolean") query.punctuate = options.punctuate;
  if (typeof options.smartFormat === "boolean") query.smart_format = options.smartFormat;
  return Object.keys(query).length > 0 ? query : void 0;
}
function normalizeDeepgramQueryKeys(query) {
  const normalized = { ...query };
  if ("detectLanguage" in normalized) {
    normalized.detect_language = normalized.detectLanguage;
    delete normalized.detectLanguage;
  }
  if ("smartFormat" in normalized) {
    normalized.smart_format = normalized.smartFormat;
    delete normalized.smartFormat;
  }
  return normalized;
}
function resolveProviderQuery(params) {
  const { providerId, config, entry } = params;
  const mergedOptions = normalizeProviderQuery({
    ...config?.providerOptions?.[providerId],
    ...entry.providerOptions?.[providerId]
  });
  if (providerId !== "deepgram") return mergedOptions;
  const query = normalizeDeepgramQueryKeys(mergedOptions ?? {});
  const compat = buildDeepgramCompatQuery({
    ...config?.deepgram,
    ...entry.deepgram
  });
  for (const [key, value] of Object.entries(compat ?? {})) if (query[key] === void 0) query[key] = value;
  return Object.keys(query).length > 0 ? query : void 0;
}
function buildModelDecision(params) {
  if (params.entryType === "cli") {
    const command = params.entry.command?.trim();
    return {
      type: "cli",
      provider: command ?? "cli",
      model: params.entry.model ?? command,
      outcome: params.outcome,
      reason: params.reason
    };
  }
  const providerIdRaw = params.entry.provider?.trim();
  return {
    type: "provider",
    provider: (providerIdRaw ? (0, _entryCapabilities7cOlAQEs.r)(providerIdRaw) : void 0) ?? providerIdRaw,
    model: params.entry.model,
    outcome: params.outcome,
    reason: params.reason
  };
}
function resolveEntryRunOptions(params) {
  const { capability, entry, cfg } = params;
  const maxBytes = (0, _resolveDqYzTtEU.n)({
    capability,
    entry,
    cfg,
    config: params.config
  });
  const maxChars = (0, _resolveDqYzTtEU.r)({
    capability,
    entry,
    cfg,
    config: params.config
  });
  return {
    maxBytes,
    maxChars,
    timeoutMs: (0, _resolveDqYzTtEU.s)(entry.timeoutSeconds ?? params.config?.timeoutSeconds ?? cfg.tools?.media?.[capability]?.timeoutSeconds, _resolveDqYzTtEU.g[capability]),
    prompt: (0, _resolveDqYzTtEU.a)(capability, entry.prompt ?? params.config?.prompt ?? cfg.tools?.media?.[capability]?.prompt, maxChars)
  };
}
function resolveAudioRequestOverrides(config) {
  const overrides = config ?? {};
  return {
    prompt: overrides._requestPromptOverride,
    language: overrides._requestLanguageOverride
  };
}
async function resolveProviderExecutionAuth(params) {
  const auth = await (0, _modelAuthKKLbMBGv.s)({
    provider: params.providerId,
    cfg: params.cfg,
    profileId: params.entry.profile,
    preferredProfile: params.entry.preferredProfile,
    agentDir: params.agentDir
  });
  return {
    apiKeys: (0, _apiKeyRotationBaBwK9eH.t)({
      provider: params.providerId,
      primaryApiKey: (0, _modelAuthRuntimeSharedJdNQNamX.t)(auth, params.providerId)
    }),
    providerConfig: params.cfg.models?.providers?.[params.providerId]
  };
}
async function resolveProviderExecutionContext(params) {
  const { apiKeys, providerConfig } = await resolveProviderExecutionAuth({
    providerId: params.providerId,
    cfg: params.cfg,
    entry: params.entry,
    agentDir: params.agentDir
  });
  const baseUrl = params.entry.baseUrl ?? params.config?.baseUrl ?? providerConfig?.baseUrl;
  const mergedHeaders = {
    ...sanitizeProviderHeaders(providerConfig?.headers),
    ...sanitizeProviderHeaders(params.config?.headers),
    ...sanitizeProviderHeaders(params.entry.headers)
  };
  return {
    apiKeys,
    baseUrl,
    headers: Object.keys(mergedHeaders).length > 0 ? mergedHeaders : void 0,
    request: (0, _providerRequestConfigS_W3yUlE.a)((0, _providerRequestConfigS_W3yUlE.l)(providerConfig?.request), (0, _providerRequestConfigS_W3yUlE.u)(params.config?.request), (0, _providerRequestConfigS_W3yUlE.u)(params.entry.request))
  };
}
function formatDecisionSummary(decision) {
  const attachments = Array.isArray(decision.attachments) ? decision.attachments : [];
  const total = attachments.length;
  const success = attachments.filter((entry) => entry?.chosen?.outcome === "success").length;
  const chosen = attachments.find((entry) => entry?.chosen)?.chosen;
  const provider = typeof chosen?.provider === "string" ? chosen.provider.trim() : void 0;
  const model = typeof chosen?.model === "string" ? chosen.model.trim() : void 0;
  const modelLabel = provider ? model ? `${provider}/${model}` : provider : void 0;
  const shortReason = summarizeDecisionReason(findDecisionReason(decision, decision.outcome === "failed" ? "failed" : void 0));
  const countLabel = total > 0 ? ` (${success}/${total})` : "";
  const viaLabel = modelLabel ? ` via ${modelLabel}` : "";
  const reasonLabel = shortReason ? ` reason=${shortReason}` : "";
  return `${decision.capability}: ${decision.outcome}${countLabel}${viaLabel}${reasonLabel}`;
}
function findDecisionReason(decision, outcome) {
  const attachments = Array.isArray(decision.attachments) ? decision.attachments : [];
  for (const attachment of attachments) {
    const attempts = Array.isArray(attachment?.attempts) ? attachment.attempts : [];
    for (const attempt of attempts) {
      if (outcome && attempt.outcome !== outcome) continue;
      if (typeof attempt.reason !== "string" || attempt.reason.trim().length === 0) continue;
      return attempt.reason;
    }
  }
}
function normalizeDecisionReason(reason) {
  const trimmed = typeof reason === "string" ? reason.trim() : "";
  if (!trimmed) return;
  return trimmed.replace(/^Error:\s*/i, "").trim() || void 0;
}
function summarizeDecisionReason(reason) {
  const normalized = normalizeDecisionReason(reason);
  if (!normalized) return;
  return normalized.split(":")[0]?.trim() || void 0;
}
function assertMinAudioSize(params) {
  if (params.size >= 1024) return;
  throw new MediaUnderstandingSkipError("tooSmall", `Audio attachment ${params.attachmentIndex + 1} is too small (${params.size} bytes, minimum ${_resolveDqYzTtEU.v})`);
}
async function runProviderEntry(params) {
  const { entry, capability, cfg } = params;
  const providerIdRaw = entry.provider?.trim();
  if (!providerIdRaw) throw new Error(`Provider entry missing provider for ${capability}`);
  const providerId = (0, _entryCapabilities7cOlAQEs.r)(providerIdRaw);
  const { maxBytes, maxChars, timeoutMs, prompt } = resolveEntryRunOptions({
    capability,
    entry,
    cfg,
    config: params.config
  });
  if (capability === "image") {
    if (!params.agentDir) throw new Error("Image understanding requires agentDir");
    const modelId = entry.model?.trim();
    if (!modelId) throw new Error("Image understanding requires model id");
    const media = await params.cache.getBuffer({
      attachmentIndex: params.attachmentIndex,
      maxBytes,
      timeoutMs
    });
    const provider = (0, _resolveDqYzTtEU.C)(providerId, params.providerRegistry);
    const imageInput = {
      buffer: media.buffer,
      fileName: media.fileName,
      mime: media.mime,
      model: modelId,
      provider: providerId,
      prompt,
      timeoutMs,
      profile: entry.profile,
      preferredProfile: entry.preferredProfile,
      agentDir: params.agentDir,
      cfg: params.cfg
    };
    const result = await (provider?.describeImage ?? _imageRuntimeH0HMzsrb.t)(imageInput);
    return {
      kind: "image.description",
      attachmentIndex: params.attachmentIndex,
      text: trimOutput(result.text, maxChars),
      provider: providerId,
      model: result.model ?? modelId
    };
  }
  const provider = (0, _resolveDqYzTtEU.C)(providerId, params.providerRegistry);
  if (!provider) throw new Error(`Media provider not available: ${providerId}`);
  const fetchFn = (0, _proxyFetch5deRg8He.i)();
  if (capability === "audio") {
    if (!provider.transcribeAudio) throw new Error(`Audio transcription provider "${providerId}" not available.`);
    const transcribeAudio = provider.transcribeAudio;
    const requestOverrides = resolveAudioRequestOverrides(params.config);
    const media = await params.cache.getBuffer({
      attachmentIndex: params.attachmentIndex,
      maxBytes,
      timeoutMs
    });
    assertMinAudioSize({
      size: media.size,
      attachmentIndex: params.attachmentIndex
    });
    const { apiKeys, baseUrl, headers, request } = await resolveProviderExecutionContext({
      providerId,
      cfg,
      entry,
      config: params.config,
      agentDir: params.agentDir
    });
    const providerQuery = resolveProviderQuery({
      providerId,
      config: params.config,
      entry
    });
    const model = entry.model?.trim() || (0, _resolveDqYzTtEU.x)({
      cfg,
      providerId,
      capability: "audio"
    }) || entry.model;
    const result = await (0, _apiKeyRotationBaBwK9eH.n)({
      provider: providerId,
      apiKeys,
      execute: async (apiKey) => transcribeAudio({
        buffer: media.buffer,
        fileName: media.fileName,
        mime: media.mime,
        apiKey,
        baseUrl,
        headers,
        request,
        model,
        language: requestOverrides.language ?? entry.language ?? params.config?.language ?? cfg.tools?.media?.audio?.language,
        prompt: requestOverrides.prompt ?? prompt,
        query: providerQuery,
        timeoutMs,
        fetchFn
      })
    });
    return {
      kind: "audio.transcription",
      attachmentIndex: params.attachmentIndex,
      text: trimOutput(result.text, maxChars),
      provider: providerId,
      model: result.model ?? model
    };
  }
  if (!provider.describeVideo) throw new Error(`Video understanding provider "${providerId}" not available.`);
  const describeVideo = provider.describeVideo;
  const media = await params.cache.getBuffer({
    attachmentIndex: params.attachmentIndex,
    maxBytes,
    timeoutMs
  });
  const estimatedBase64Bytes = estimateBase64Size(media.size);
  const maxBase64Bytes = resolveVideoMaxBase64Bytes(maxBytes);
  if (estimatedBase64Bytes > maxBase64Bytes) throw new MediaUnderstandingSkipError("maxBytes", `Video attachment ${params.attachmentIndex + 1} base64 payload ${estimatedBase64Bytes} exceeds ${maxBase64Bytes}`);
  const { apiKeys, baseUrl, headers, request } = await resolveProviderExecutionContext({
    providerId,
    cfg,
    entry,
    config: params.config,
    agentDir: params.agentDir
  });
  const result = await (0, _apiKeyRotationBaBwK9eH.n)({
    provider: providerId,
    apiKeys,
    execute: (apiKey) => describeVideo({
      buffer: media.buffer,
      fileName: media.fileName,
      mime: media.mime,
      apiKey,
      baseUrl,
      headers,
      request,
      model: entry.model,
      prompt,
      timeoutMs,
      fetchFn
    })
  });
  return {
    kind: "video.description",
    attachmentIndex: params.attachmentIndex,
    text: trimOutput(result.text, maxChars),
    provider: providerId,
    model: result.model ?? entry.model
  };
}
async function runCliEntry(params) {
  const { entry, capability, cfg, ctx } = params;
  const command = entry.command?.trim();
  const args = entry.args ?? [];
  if (!command) throw new Error(`CLI entry missing command for ${capability}`);
  const requestOverrides = resolveAudioRequestOverrides(params.config);
  const { maxBytes, maxChars, timeoutMs, prompt } = resolveEntryRunOptions({
    capability,
    entry,
    cfg,
    config: params.config
  });
  const pathResult = await params.cache.getPath({
    attachmentIndex: params.attachmentIndex,
    maxBytes,
    timeoutMs
  });
  if (capability === "audio") assertMinAudioSize({
    size: (await _promises.default.stat(pathResult.path)).size,
    attachmentIndex: params.attachmentIndex
  });
  const outputDir = await _promises.default.mkdtemp(_nodePath.default.join((0, _tmpOpenclawDirEyAoWbVe.n)(), "openclaw-media-cli-"));
  const mediaPath = await resolveCliMediaPath({
    capability,
    command,
    mediaPath: pathResult.path,
    outputDir
  });
  const outputBase = _nodePath.default.join(outputDir, _nodePath.default.parse(mediaPath).name);
  const templCtx = {
    ...ctx,
    MediaPath: mediaPath,
    MediaDir: _nodePath.default.dirname(mediaPath),
    OutputDir: outputDir,
    OutputBase: outputBase,
    Prompt: requestOverrides.prompt ?? prompt,
    ...(requestOverrides.language ? { Language: requestOverrides.language } : {}),
    MaxChars: maxChars
  };
  const argv = [command, ...args].map((part, index) => index === 0 ? part : (0, _templatingCrTeZLPl.t)(part, templCtx));
  try {
    if ((0, _globalsDe6QTwLG.a)()) (0, _globalsDe6QTwLG.r)(`Media understanding via CLI: ${argv.join(" ")}`);
    const { stdout } = await (0, _execBAdwyfxI.i)(argv[0], argv.slice(1), {
      timeoutMs,
      maxBuffer: _resolveDqYzTtEU.u
    });
    const text = trimOutput(await resolveCliOutput({
      command,
      args: argv.slice(1),
      stdout,
      mediaPath
    }), maxChars);
    if (!text) return null;
    return {
      kind: capability === "audio" ? "audio.transcription" : `${capability}.description`,
      attachmentIndex: params.attachmentIndex,
      text,
      provider: "cli",
      model: command
    };
  } finally {
    await _promises.default.rm(outputDir, {
      recursive: true,
      force: true
    }).catch(() => {});
  }
}
//#endregion /* v9-c5fe75437ce434de */
