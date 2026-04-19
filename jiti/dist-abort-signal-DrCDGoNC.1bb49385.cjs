"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = waitForAbortSignal; //#region src/infra/abort-signal.ts
async function waitForAbortSignal(signal) {
  if (!signal || signal.aborted) return;
  await new Promise((resolve) => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
//#endregion /* v9-385aa8701273a068 */
