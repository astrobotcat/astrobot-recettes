"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = replaceSubagentRunAfterSteer;exports.t = configureSubagentRegistrySteerRuntime; //#region src/agents/subagent-registry-steer-runtime.ts
let replaceSubagentRunAfterSteerImpl = null;
function configureSubagentRegistrySteerRuntime(params) {
  replaceSubagentRunAfterSteerImpl = params.replaceSubagentRunAfterSteer;
}
function replaceSubagentRunAfterSteer(params) {
  return replaceSubagentRunAfterSteerImpl?.(params) ?? false;
}
//#endregion /* v9-69ca0c90cb988548 */
