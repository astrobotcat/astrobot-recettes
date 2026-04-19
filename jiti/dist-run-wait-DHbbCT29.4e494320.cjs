"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = waitForAgentRunsToDrain;exports.i = waitForAgentRunAndReadUpdatedAssistantReply;exports.n = readLatestAssistantReplySnapshot;exports.r = waitForAgentRun;exports.t = readLatestAssistantReply;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _callBA3do6C = require("./call-BA3do6C0.js");
var _chatHistoryTextC5anYCs = require("./chat-history-text-C5anYCs7.js");
let runWaitDeps = { callGateway: _callBA3do6C.r };
function normalizeAgentWaitResult(status, wait) {
  return {
    status,
    error: typeof wait?.error === "string" ? wait.error : void 0,
    startedAt: typeof wait?.startedAt === "number" ? wait.startedAt : void 0,
    endedAt: typeof wait?.endedAt === "number" ? wait.endedAt : void 0
  };
}
function normalizePendingRunIds(runIds) {
  const seen = /* @__PURE__ */new Set();
  for (const runId of runIds) {
    const normalized = runId.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
  }
  return [...seen];
}
function resolveLatestAssistantReplySnapshot(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const candidate = messages[i];
    if (!candidate || typeof candidate !== "object") continue;
    if (candidate.role !== "assistant") continue;
    const text = (0, _chatHistoryTextC5anYCs.t)(candidate);
    if (!text?.trim()) continue;
    let fingerprint;
    try {
      fingerprint = JSON.stringify(candidate);
    } catch {
      fingerprint = text;
    }
    return {
      text,
      fingerprint
    };
  }
  return {};
}
async function readLatestAssistantReplySnapshot(params) {
  const history = await (params.callGateway ?? runWaitDeps.callGateway)({
    method: "chat.history",
    params: {
      sessionKey: params.sessionKey,
      limit: params.limit ?? 50
    }
  });
  return resolveLatestAssistantReplySnapshot((0, _chatHistoryTextC5anYCs.r)(Array.isArray(history?.messages) ? history.messages : []));
}
async function readLatestAssistantReply(params) {
  return (await readLatestAssistantReplySnapshot({
    sessionKey: params.sessionKey,
    limit: params.limit,
    callGateway: params.callGateway
  })).text;
}
async function waitForAgentRun(params) {
  const timeoutMs = Math.max(1, Math.floor(params.timeoutMs));
  try {
    const wait = await (params.callGateway ?? runWaitDeps.callGateway)({
      method: "agent.wait",
      params: {
        runId: params.runId,
        timeoutMs
      },
      timeoutMs: timeoutMs + 2e3
    });
    if (wait?.status === "timeout") return normalizeAgentWaitResult("timeout", wait);
    if (wait?.status === "pending") return normalizeAgentWaitResult("pending", wait);
    if (wait?.status === "error") return normalizeAgentWaitResult("error", wait);
    return normalizeAgentWaitResult("ok", wait);
  } catch (err) {
    const error = (0, _errorsD8p6rxH.i)(err);
    return {
      status: error.includes("gateway timeout") ? "timeout" : "error",
      error
    };
  }
}
async function waitForAgentRunAndReadUpdatedAssistantReply(params) {
  const wait = await waitForAgentRun({
    runId: params.runId,
    timeoutMs: params.timeoutMs,
    callGateway: params.callGateway
  });
  if (wait.status !== "ok") return wait;
  const latestReply = await readLatestAssistantReplySnapshot({
    sessionKey: params.sessionKey,
    limit: params.limit,
    callGateway: params.callGateway
  });
  const baselineFingerprint = params.baseline?.fingerprint;
  return {
    status: "ok",
    replyText: latestReply.text && (!baselineFingerprint || latestReply.fingerprint !== baselineFingerprint) ? latestReply.text : void 0
  };
}
async function waitForAgentRunsToDrain(params) {
  const deadlineAtMs = params.deadlineAtMs ?? Date.now() + Math.max(1, Math.floor(params.timeoutMs ?? 0));
  let pendingRunIds = new Set(normalizePendingRunIds(params.initialPendingRunIds ?? params.getPendingRunIds()));
  while (pendingRunIds.size > 0 && Date.now() < deadlineAtMs) {
    const remainingMs = Math.max(1, deadlineAtMs - Date.now());
    await Promise.allSettled([...pendingRunIds].map((runId) => waitForAgentRun({
      runId,
      timeoutMs: remainingMs,
      callGateway: params.callGateway
    })));
    pendingRunIds = new Set(normalizePendingRunIds(params.getPendingRunIds()));
  }
  return {
    timedOut: pendingRunIds.size > 0,
    pendingRunIds: [...pendingRunIds],
    deadlineAtMs
  };
}
//#endregion /* v9-ac13a8cbb42a38a5 */
