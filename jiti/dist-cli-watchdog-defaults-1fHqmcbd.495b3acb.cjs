"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = exports.r = exports.n = void 0; //#region src/agents/cli-watchdog-defaults.ts
const CLI_WATCHDOG_MIN_TIMEOUT_MS = exports.r = 1e3;
const CLI_FRESH_WATCHDOG_DEFAULTS = exports.t = {
  noOutputTimeoutRatio: .8,
  minMs: 18e4,
  maxMs: 6e5
};
const CLI_RESUME_WATCHDOG_DEFAULTS = exports.n = {
  noOutputTimeoutRatio: .3,
  minMs: 6e4,
  maxMs: 18e4
};
//#endregion /* v9-8e5c24139d36fdcc */
