"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = generateConversationLabel;var _globalsDe6QTwLG = require("./globals-De6QTwLG.js");
var _modelSelectionCTdyYoio = require("./model-selection-CTdyYoio.js");
var _modelAuthRuntimeSharedJdNQNamX = require("./model-auth-runtime-shared-jdNQNamX.js");
require("./tokens-CKM4Lddu.js");
require("./heartbeat-DYyKvnDp.js");
var _modelAuthKKLbMBGv = require("./model-auth-KKLbMBGv.js");
require("./chunk-C8HOq7ak.js");
var _modelBl_gU5g = require("./model-Bl_gU5g0.js");
require("./dispatch-JNo_iJw5.js");
require("./provider-dispatcher-C7CBb7vN.js");
require("./get-reply-XW5nFnK2.js");
require("./abort-BMiCjnGB.js");
require("./btw-command-CxSQMH03.js");
var _simpleCompletionTransportBvnrd78A = require("./simple-completion-transport-Bvnrd78A.js");
var _piAi = require("@mariozechner/pi-ai");
//#region src/auto-reply/reply/conversation-label-generator.ts
const DEFAULT_MAX_LABEL_LENGTH = 128;
const TIMEOUT_MS = 15e3;
function isTextContentBlock(block) {
  return block.type === "text";
}
async function generateConversationLabel(params) {
  const { userMessage, prompt, cfg, agentId, agentDir } = params;
  const maxLength = typeof params.maxLength === "number" && Number.isFinite(params.maxLength) && params.maxLength > 0 ? Math.floor(params.maxLength) : DEFAULT_MAX_LABEL_LENGTH;
  const modelRef = (0, _modelSelectionCTdyYoio.f)({
    cfg,
    agentId
  });
  const resolved = await (0, _modelBl_gU5g.n)(modelRef.provider, modelRef.model, agentDir, cfg);
  if (!resolved.model) {
    (0, _globalsDe6QTwLG.r)(`conversation-label-generator: failed to resolve model ${modelRef.provider}/${modelRef.model}`);
    return null;
  }
  const completionModel = (0, _simpleCompletionTransportBvnrd78A.t)({
    model: resolved.model,
    cfg
  });
  const apiKey = (0, _modelAuthRuntimeSharedJdNQNamX.t)(await (0, _modelAuthKKLbMBGv.r)({
    model: completionModel,
    cfg,
    agentDir
  }), modelRef.provider);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const text = (await (0, _piAi.completeSimple)(completionModel, { messages: [{
        role: "user",
        content: `${prompt}\n\n${userMessage}`,
        timestamp: Date.now()
      }] }, {
      apiKey,
      maxTokens: 100,
      temperature: .3,
      signal: controller.signal
    })).content.filter(isTextContentBlock).map((block) => block.text).join("").trim();
    if (!text) return null;
    return text.slice(0, maxLength);
  } finally {
    clearTimeout(timeout);
  }
}
//#endregion /* v9-6fad3e70fc3e8a8f */
