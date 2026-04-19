"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = exports.r = exports.n = void 0;require("./errors-D8p6rxH8.js");
//#region src/plugin-sdk/error-runtime.ts
const SUBAGENT_RUNTIME_REQUEST_SCOPE_ERROR_CODE = exports.n = "OPENCLAW_SUBAGENT_RUNTIME_REQUEST_SCOPE";
const SUBAGENT_RUNTIME_REQUEST_SCOPE_ERROR_MESSAGE = exports.r = "Plugin runtime subagent methods are only available during a gateway request.";
var RequestScopedSubagentRuntimeError = class extends Error {
  constructor(message = SUBAGENT_RUNTIME_REQUEST_SCOPE_ERROR_MESSAGE) {
    super(message);
    this.code = SUBAGENT_RUNTIME_REQUEST_SCOPE_ERROR_CODE;
    this.name = "RequestScopedSubagentRuntimeError";
  }
};
//#endregion
exports.t = RequestScopedSubagentRuntimeError; /* v9-d4b36587e246ae3d */
