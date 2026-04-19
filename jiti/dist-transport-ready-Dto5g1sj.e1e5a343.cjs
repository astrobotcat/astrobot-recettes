"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = waitForTransportReady;var _globalsDe6QTwLG = require("./globals-De6QTwLG.js");
var _backoffDdY2WSF = require("./backoff-DdY2WS-F.js");
//#region src/infra/transport-ready.ts
async function waitForTransportReady(params) {
  const started = Date.now();
  const timeoutMs = Math.max(0, params.timeoutMs);
  const deadline = started + timeoutMs;
  const logAfterMs = Math.max(0, params.logAfterMs ?? timeoutMs);
  const logIntervalMs = Math.max(1e3, params.logIntervalMs ?? 3e4);
  const pollIntervalMs = Math.max(50, params.pollIntervalMs ?? 150);
  let nextLogAt = started + logAfterMs;
  let lastError = null;
  while (true) {
    if (params.abortSignal?.aborted) return;
    const res = await params.check();
    if (res.ok) return;
    lastError = res.error ?? null;
    const now = Date.now();
    if (now >= deadline) break;
    if (now >= nextLogAt) {
      const elapsedMs = now - started;
      params.runtime.error?.((0, _globalsDe6QTwLG.t)(`${params.label} not ready after ${elapsedMs}ms (${lastError ?? "unknown error"})`));
      nextLogAt = now + logIntervalMs;
    }
    try {
      await (0, _backoffDdY2WSF.n)(pollIntervalMs, params.abortSignal);
    } catch (err) {
      if (params.abortSignal?.aborted) return;
      throw err;
    }
  }
  params.runtime.error?.((0, _globalsDe6QTwLG.t)(`${params.label} not ready after ${timeoutMs}ms (${lastError ?? "unknown error"})`));
  throw new Error(`${params.label} not ready (${lastError ?? "unknown error"})`);
}
//#endregion /* v9-60d02f4db0f8d3e7 */
