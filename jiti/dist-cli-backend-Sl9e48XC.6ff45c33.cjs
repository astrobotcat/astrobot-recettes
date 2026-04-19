"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = buildAnthropicCliBackend;var _cliWatchdogDefaults1fHqmcbd = require("./cli-watchdog-defaults-1fHqmcbd.js");
var _cliSharedDOMKlVw = require("./cli-shared-D-OMKlVw.js");
//#region extensions/anthropic/cli-backend.ts
function buildAnthropicCliBackend() {
  return {
    id: _cliSharedDOMKlVw.t,
    liveTest: {
      defaultModelRef: _cliSharedDOMKlVw.i,
      defaultImageProbe: true,
      defaultMcpProbe: true,
      docker: {
        npmPackage: "@anthropic-ai/claude-code",
        binaryName: "claude"
      }
    },
    bundleMcp: true,
    bundleMcpMode: "claude-config-file",
    config: {
      command: "claude",
      args: [
      "-p",
      "--output-format",
      "stream-json",
      "--include-partial-messages",
      "--verbose",
      "--setting-sources",
      "user",
      "--permission-mode",
      "bypassPermissions"],

      resumeArgs: [
      "-p",
      "--output-format",
      "stream-json",
      "--include-partial-messages",
      "--verbose",
      "--setting-sources",
      "user",
      "--permission-mode",
      "bypassPermissions",
      "--resume",
      "{sessionId}"],

      output: "jsonl",
      input: "stdin",
      modelArg: "--model",
      modelAliases: _cliSharedDOMKlVw.a,
      sessionArg: "--session-id",
      sessionMode: "always",
      sessionIdFields: [..._cliSharedDOMKlVw.o],
      systemPromptArg: "--append-system-prompt",
      systemPromptMode: "append",
      systemPromptWhen: "first",
      clearEnv: [..._cliSharedDOMKlVw.n],
      reliability: { watchdog: {
          fresh: { ..._cliWatchdogDefaults1fHqmcbd.t },
          resume: { ..._cliWatchdogDefaults1fHqmcbd.n }
        } },
      serialize: true
    },
    normalizeConfig: _cliSharedDOMKlVw.c
  };
}
//#endregion /* v9-467405affdc0c225 */
