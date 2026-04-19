"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = runPluginCommandWithTimeout;var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _execBAdwyfxI = require("./exec-BAdwyfxI.js");
//#region src/plugin-sdk/run-command.ts
/** Run a plugin-managed command with timeout handling and normalized stdout/stderr results. */
async function runPluginCommandWithTimeout(options) {
  const [command] = options.argv;
  if (!command) return {
    code: 1,
    stdout: "",
    stderr: "command is required"
  };
  try {
    const result = await (0, _execBAdwyfxI.r)(options.argv, {
      timeoutMs: options.timeoutMs,
      cwd: options.cwd,
      env: options.env
    });
    const timedOut = result.termination === "timeout" || result.termination === "no-output-timeout";
    return {
      code: result.code ?? 1,
      stdout: result.stdout,
      stderr: timedOut ? result.stderr || `command timed out after ${options.timeoutMs}ms` : result.stderr
    };
  } catch (error) {
    return {
      code: 1,
      stdout: "",
      stderr: (0, _errorsD8p6rxH.i)(error)
    };
  }
}
//#endregion /* v9-f86cbe46cde9b013 */
