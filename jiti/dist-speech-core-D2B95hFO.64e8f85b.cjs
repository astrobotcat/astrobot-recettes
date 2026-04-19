"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = scheduleCleanup;exports.i = requireInRange;exports.n = normalizeLanguageCode;exports.o = summarizeText;exports.r = normalizeSeed;exports.t = normalizeApplyTextNormalization;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _modelSelectionCTdyYoio = require("./model-selection-CTdyYoio.js");
var _modelAuthRuntimeSharedJdNQNamX = require("./model-auth-runtime-shared-jdNQNamX.js");
var _modelAuthKKLbMBGv = require("./model-auth-KKLbMBGv.js");
var _modelBl_gU5g = require("./model-Bl_gU5g0.js");
var _simpleCompletionTransportBvnrd78A = require("./simple-completion-transport-Bvnrd78A.js");
require("./provider-registry-CasPS0mm.js");
require("./provider-error-utils-CyJAWFR1.js");
var _nodeFs = require("node:fs");
var _piAi = require("@mariozechner/pi-ai");
//#region src/tts/tts-core.ts
const TEMP_FILE_CLEANUP_DELAY_MS = 300 * 1e3;
function resolveDefaultSummarizeTextDeps() {
  return {
    completeSimple: _piAi.completeSimple,
    getApiKeyForModel: _modelAuthKKLbMBGv.r,
    prepareModelForSimpleCompletion: _simpleCompletionTransportBvnrd78A.t,
    requireApiKey: _modelAuthRuntimeSharedJdNQNamX.t,
    resolveModelAsync: _modelBl_gU5g.n
  };
}
function requireInRange(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${label} must be between ${min} and ${max}`);
}
function normalizeLanguageCode(code) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(code);
  if (!normalized) return;
  if (!/^[a-z]{2}$/.test(normalized)) throw new Error("languageCode must be a 2-letter ISO 639-1 code (e.g. en, de, fr)");
  return normalized;
}
function normalizeApplyTextNormalization(mode) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(mode);
  if (!normalized) return;
  if (normalized === "auto" || normalized === "on" || normalized === "off") return normalized;
  throw new Error("applyTextNormalization must be one of: auto, on, off");
}
function normalizeSeed(seed) {
  if (seed == null) return;
  const next = Math.floor(seed);
  if (!Number.isFinite(next) || next < 0 || next > 4294967295) throw new Error("seed must be between 0 and 4294967295");
  return next;
}
function resolveSummaryModelRef(cfg, config) {
  const defaultRef = (0, _modelSelectionCTdyYoio.f)({ cfg });
  const override = (0, _stringCoerceBUSzWgUA.s)(config.summaryModel);
  if (!override) return {
    ref: defaultRef,
    source: "default"
  };
  const aliasIndex = (0, _modelSelectionCTdyYoio.i)({
    cfg,
    defaultProvider: defaultRef.provider
  });
  const resolved = (0, _modelSelectionCTdyYoio.m)({
    raw: override,
    defaultProvider: defaultRef.provider,
    aliasIndex
  });
  if (!resolved) return {
    ref: defaultRef,
    source: "default"
  };
  return {
    ref: resolved.ref,
    source: "summaryModel"
  };
}
function isTextContentBlock(block) {
  return block.type === "text";
}
async function summarizeText(params, deps = resolveDefaultSummarizeTextDeps()) {
  const { text, targetLength, cfg, config, timeoutMs } = params;
  if (targetLength < 100 || targetLength > 1e4) throw new Error(`Invalid targetLength: ${targetLength}`);
  const startTime = Date.now();
  const { ref } = resolveSummaryModelRef(cfg, config);
  const resolved = await deps.resolveModelAsync(ref.provider, ref.model, void 0, cfg);
  if (!resolved.model) throw new Error(resolved.error ?? `Unknown summary model: ${ref.provider}/${ref.model}`);
  const completionModel = deps.prepareModelForSimpleCompletion({
    model: resolved.model,
    cfg
  });
  const apiKey = deps.requireApiKey(await deps.getApiKeyForModel({
    model: completionModel,
    cfg
  }), ref.provider);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const summary = (await deps.completeSimple(completionModel, { messages: [{
          role: "user",
          content: `You are an assistant that summarizes texts concisely while keeping the most important information. Summarize the text to approximately ${targetLength} characters. Maintain the original tone and style. Reply only with the summary, without additional explanations.\n\n<text_to_summarize>\n${text}\n</text_to_summarize>`,
          timestamp: Date.now()
        }] }, {
        apiKey,
        maxTokens: Math.ceil(targetLength / 2),
        temperature: .3,
        signal: controller.signal
      })).content.filter(isTextContentBlock).map((block) => block.text.trim()).filter(Boolean).join(" ").trim();
      if (!summary) throw new Error("No summary returned");
      return {
        summary,
        latencyMs: Date.now() - startTime,
        inputLength: text.length,
        outputLength: summary.length
      };
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Summarization timed out", { cause: err });
    throw err;
  }
}
function scheduleCleanup(tempDir, delayMs = TEMP_FILE_CLEANUP_DELAY_MS) {
  setTimeout(() => {
    try {
      (0, _nodeFs.rmSync)(tempDir, {
        recursive: true,
        force: true
      });
    } catch {}
  }, delayMs).unref();
}
//#endregion /* v9-32e0d033616365e8 */
