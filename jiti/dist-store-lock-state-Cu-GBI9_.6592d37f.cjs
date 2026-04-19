"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = clearSessionStoreCacheForTest;exports.r = drainSessionStoreLockQueuesForTest;exports.t = void 0;var _storeCacheC6102ouP = require("./store-cache-C6102ouP.js");
//#region src/config/sessions/store-lock-state.ts
const LOCK_QUEUES = exports.t = /* @__PURE__ */new Map();
function clearSessionStoreCacheForTest() {
  (0, _storeCacheC6102ouP.t)();
  for (const queue of LOCK_QUEUES.values()) for (const task of queue.pending) task.reject(/* @__PURE__ */new Error("session store queue cleared for test"));
  LOCK_QUEUES.clear();
}
async function drainSessionStoreLockQueuesForTest() {
  while (LOCK_QUEUES.size > 0) {
    const queues = [...LOCK_QUEUES.values()];
    for (const queue of queues) {
      for (const task of queue.pending) task.reject(/* @__PURE__ */new Error("session store queue cleared for test"));
      queue.pending.length = 0;
    }
    const activeDrains = queues.flatMap((queue) => queue.drainPromise ? [queue.drainPromise] : []);
    if (activeDrains.length === 0) {
      LOCK_QUEUES.clear();
      return;
    }
    await Promise.allSettled(activeDrains);
  }
}
//#endregion /* v9-908787b7e71fcf56 */
