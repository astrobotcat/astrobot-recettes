"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.bashToolDefinition = exports.bashTool = void 0;exports.createBashTool = createBashTool;exports.createBashToolDefinition = createBashToolDefinition;exports.createLocalBashOperations = createLocalBashOperations;var _nodeCrypto = require("node:crypto");
var _nodeFs = require("node:fs");
var _nodeOs = require("node:os");
var _nodePath = require("node:path");
var _piTui = require("@mariozechner/pi-tui");
var _typebox = require("@sinclair/typebox");
var _child_process = require("child_process");
var _keybindingHints = require("../../modes/interactive/components/keybinding-hints.js");
var _visualTruncate = require("../../modes/interactive/components/visual-truncate.js");
var _theme2 = require("../../modes/interactive/theme/theme.js");
var _childProcess = require("../../utils/child-process.js");
var _shell = require("../../utils/shell.js");
var _renderUtils = require("./render-utils.js");
var _toolDefinitionWrapper = require("./tool-definition-wrapper.js");
var _truncate = require("./truncate.js");
/**
 * Generate a unique temp file path for bash output.
 */
function getTempFilePath() {
  const id = (0, _nodeCrypto.randomBytes)(8).toString("hex");
  return (0, _nodePath.join)((0, _nodeOs.tmpdir)(), `pi-bash-${id}.log`);
}
const bashSchema = _typebox.Type.Object({
  command: _typebox.Type.String({ description: "Bash command to execute" }),
  timeout: _typebox.Type.Optional(_typebox.Type.Number({ description: "Timeout in seconds (optional, no default timeout)" }))
});
/**
 * Create bash operations using pi's built-in local shell execution backend.
 *
 * This is useful for extensions that intercept user_bash and still want pi's
 * standard local shell behavior while wrapping or rewriting commands.
 */
function createLocalBashOperations() {
  return {
    exec: (command, cwd, { onData, signal, timeout, env }) => {
      return new Promise((resolve, reject) => {
        const { shell, args } = (0, _shell.getShellConfig)();
        if (!(0, _nodeFs.existsSync)(cwd)) {
          reject(new Error(`Working directory does not exist: ${cwd}\nCannot execute bash commands.`));
          return;
        }
        const child = (0, _child_process.spawn)(shell, [...args, command], {
          cwd,
          detached: true,
          env: env ?? (0, _shell.getShellEnv)(),
          stdio: ["ignore", "pipe", "pipe"]
        });
        let timedOut = false;
        let timeoutHandle;
        // Set timeout if provided.
        if (timeout !== undefined && timeout > 0) {
          timeoutHandle = setTimeout(() => {
            timedOut = true;
            if (child.pid)
            (0, _shell.killProcessTree)(child.pid);
          }, timeout * 1000);
        }
        // Stream stdout and stderr.
        child.stdout?.on("data", onData);
        child.stderr?.on("data", onData);
        // Handle abort signal by killing the entire process tree.
        const onAbort = () => {
          if (child.pid)
          (0, _shell.killProcessTree)(child.pid);
        };
        if (signal) {
          if (signal.aborted)
          onAbort();else

          signal.addEventListener("abort", onAbort, { once: true });
        }
        // Handle shell spawn errors and wait for the process to terminate without hanging
        // on inherited stdio handles held by detached descendants.
        (0, _childProcess.waitForChildProcess)(child).
        then((code) => {
          if (timeoutHandle)
          clearTimeout(timeoutHandle);
          if (signal)
          signal.removeEventListener("abort", onAbort);
          if (signal?.aborted) {
            reject(new Error("aborted"));
            return;
          }
          if (timedOut) {
            reject(new Error(`timeout:${timeout}`));
            return;
          }
          resolve({ exitCode: code });
        }).
        catch((err) => {
          if (timeoutHandle)
          clearTimeout(timeoutHandle);
          if (signal)
          signal.removeEventListener("abort", onAbort);
          reject(err);
        });
      });
    }
  };
}
function resolveSpawnContext(command, cwd, spawnHook) {
  const baseContext = { command, cwd, env: { ...(0, _shell.getShellEnv)() } };
  return spawnHook ? spawnHook(baseContext) : baseContext;
}
const BASH_PREVIEW_LINES = 5;
class BashResultRenderComponent extends _piTui.Container {
  state = {
    cachedWidth: undefined,
    cachedLines: undefined,
    cachedSkipped: undefined
  };
}
function formatDuration(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}
function formatBashCall(args) {
  const command = (0, _renderUtils.str)(args?.command);
  const timeout = args?.timeout;
  const timeoutSuffix = timeout ? _theme2.theme.fg("muted", ` (timeout ${timeout}s)`) : "";
  const commandDisplay = command === null ? (0, _renderUtils.invalidArgText)(_theme2.theme) : command ? command : _theme2.theme.fg("toolOutput", "...");
  return _theme2.theme.fg("toolTitle", _theme2.theme.bold(`$ ${commandDisplay}`)) + timeoutSuffix;
}
function rebuildBashResultRenderComponent(component, result, options, showImages, startedAt, endedAt) {
  const state = component.state;
  component.clear();
  const output = (0, _renderUtils.getTextOutput)(result, showImages).trim();
  if (output) {
    const styledOutput = output.
    split("\n").
    map((line) => _theme2.theme.fg("toolOutput", line)).
    join("\n");
    if (options.expanded) {
      component.addChild(new _piTui.Text(`\n${styledOutput}`, 0, 0));
    } else
    {
      component.addChild({
        render: (width) => {
          if (state.cachedLines === undefined || state.cachedWidth !== width) {
            const preview = (0, _visualTruncate.truncateToVisualLines)(styledOutput, BASH_PREVIEW_LINES, width);
            state.cachedLines = preview.visualLines;
            state.cachedSkipped = preview.skippedCount;
            state.cachedWidth = width;
          }
          if (state.cachedSkipped && state.cachedSkipped > 0) {
            const hint = _theme2.theme.fg("muted", `... (${state.cachedSkipped} earlier lines,`) +
            ` ${(0, _keybindingHints.keyHint)("app.tools.expand", "to expand")})`;
            return ["", (0, _piTui.truncateToWidth)(hint, width, "..."), ...(state.cachedLines ?? [])];
          }
          return ["", ...(state.cachedLines ?? [])];
        },
        invalidate: () => {
          state.cachedWidth = undefined;
          state.cachedLines = undefined;
          state.cachedSkipped = undefined;
        }
      });
    }
  }
  const truncation = result.details?.truncation;
  const fullOutputPath = result.details?.fullOutputPath;
  if (truncation?.truncated || fullOutputPath) {
    const warnings = [];
    if (fullOutputPath) {
      warnings.push(`Full output: ${fullOutputPath}`);
    }
    if (truncation?.truncated) {
      if (truncation.truncatedBy === "lines") {
        warnings.push(`Truncated: showing ${truncation.outputLines} of ${truncation.totalLines} lines`);
      } else
      {
        warnings.push(`Truncated: ${truncation.outputLines} lines shown (${(0, _truncate.formatSize)(truncation.maxBytes ?? _truncate.DEFAULT_MAX_BYTES)} limit)`);
      }
    }
    component.addChild(new _piTui.Text(`\n${_theme2.theme.fg("warning", `[${warnings.join(". ")}]`)}`, 0, 0));
  }
  if (startedAt !== undefined) {
    const label = options.isPartial ? "Elapsed" : "Took";
    const endTime = endedAt ?? Date.now();
    component.addChild(new _piTui.Text(`\n${_theme2.theme.fg("muted", `${label} ${formatDuration(endTime - startedAt)}`)}`, 0, 0));
  }
}
function createBashToolDefinition(cwd, options) {
  const ops = options?.operations ?? createLocalBashOperations();
  const commandPrefix = options?.commandPrefix;
  const spawnHook = options?.spawnHook;
  return {
    name: "bash",
    label: "bash",
    description: `Execute a bash command in the current working directory. Returns stdout and stderr. Output is truncated to last ${_truncate.DEFAULT_MAX_LINES} lines or ${_truncate.DEFAULT_MAX_BYTES / 1024}KB (whichever is hit first). If truncated, full output is saved to a temp file. Optionally provide a timeout in seconds.`,
    promptSnippet: "Execute bash commands (ls, grep, find, etc.)",
    parameters: bashSchema,
    async execute(_toolCallId, { command, timeout }, signal, onUpdate, _ctx) {
      const resolvedCommand = commandPrefix ? `${commandPrefix}\n${command}` : command;
      const spawnContext = resolveSpawnContext(resolvedCommand, cwd, spawnHook);
      if (onUpdate) {
        onUpdate({ content: [], details: undefined });
      }
      return new Promise((resolve, reject) => {
        let tempFilePath;
        let tempFileStream;
        let totalBytes = 0;
        const chunks = [];
        let chunksBytes = 0;
        const maxChunksBytes = _truncate.DEFAULT_MAX_BYTES * 2;
        const ensureTempFile = () => {
          if (tempFilePath)
          return;
          tempFilePath = getTempFilePath();
          tempFileStream = (0, _nodeFs.createWriteStream)(tempFilePath);
          for (const chunk of chunks)
          tempFileStream.write(chunk);
        };
        const handleData = (data) => {
          totalBytes += data.length;
          // Start writing to a temp file once output exceeds the in-memory threshold.
          if (totalBytes > _truncate.DEFAULT_MAX_BYTES) {
            ensureTempFile();
          }
          // Write to temp file if we have one.
          if (tempFileStream)
          tempFileStream.write(data);
          // Keep a rolling buffer of recent output for tail truncation.
          chunks.push(data);
          chunksBytes += data.length;
          // Trim old chunks if the rolling buffer grows too large.
          while (chunksBytes > maxChunksBytes && chunks.length > 1) {
            const removed = chunks.shift();
            chunksBytes -= removed.length;
          }
          // Stream partial output using the rolling tail buffer.
          if (onUpdate) {
            const fullBuffer = Buffer.concat(chunks);
            const fullText = fullBuffer.toString("utf-8");
            const truncation = (0, _truncate.truncateTail)(fullText);
            if (truncation.truncated) {
              ensureTempFile();
            }
            onUpdate({
              content: [{ type: "text", text: truncation.content || "" }],
              details: {
                truncation: truncation.truncated ? truncation : undefined,
                fullOutputPath: tempFilePath
              }
            });
          }
        };
        ops.exec(spawnContext.command, spawnContext.cwd, {
          onData: handleData,
          signal,
          timeout,
          env: spawnContext.env
        }).
        then(({ exitCode }) => {
          // Combine the rolling buffer chunks.
          const fullBuffer = Buffer.concat(chunks);
          const fullOutput = fullBuffer.toString("utf-8");
          // Apply tail truncation for the final display payload.
          const truncation = (0, _truncate.truncateTail)(fullOutput);
          if (truncation.truncated) {
            ensureTempFile();
          }
          // Close temp file stream before building the final result.
          if (tempFileStream)
          tempFileStream.end();
          let outputText = truncation.content || "(no output)";
          let details;
          if (truncation.truncated) {
            // Build truncation details and an actionable notice.
            details = { truncation, fullOutputPath: tempFilePath };
            const startLine = truncation.totalLines - truncation.outputLines + 1;
            const endLine = truncation.totalLines;
            if (truncation.lastLinePartial) {
              // Edge case: the last line alone is larger than the byte limit.
              const lastLineSize = (0, _truncate.formatSize)(Buffer.byteLength(fullOutput.split("\n").pop() || "", "utf-8"));
              outputText += `\n\n[Showing last ${(0, _truncate.formatSize)(truncation.outputBytes)} of line ${endLine} (line is ${lastLineSize}). Full output: ${tempFilePath}]`;
            } else
            if (truncation.truncatedBy === "lines") {
              outputText += `\n\n[Showing lines ${startLine}-${endLine} of ${truncation.totalLines}. Full output: ${tempFilePath}]`;
            } else
            {
              outputText += `\n\n[Showing lines ${startLine}-${endLine} of ${truncation.totalLines} (${(0, _truncate.formatSize)(_truncate.DEFAULT_MAX_BYTES)} limit). Full output: ${tempFilePath}]`;
            }
          }
          if (exitCode !== 0 && exitCode !== null) {
            outputText += `\n\nCommand exited with code ${exitCode}`;
            reject(new Error(outputText));
          } else
          {
            resolve({ content: [{ type: "text", text: outputText }], details });
          }
        }).
        catch((err) => {
          // Close temp file stream and include buffered output in the error message.
          if (tempFileStream)
          tempFileStream.end();
          const fullBuffer = Buffer.concat(chunks);
          let output = fullBuffer.toString("utf-8");
          if (err.message === "aborted") {
            if (output)
            output += "\n\n";
            output += "Command aborted";
            reject(new Error(output));
          } else
          if (err.message.startsWith("timeout:")) {
            const timeoutSecs = err.message.split(":")[1];
            if (output)
            output += "\n\n";
            output += `Command timed out after ${timeoutSecs} seconds`;
            reject(new Error(output));
          } else
          {
            reject(err);
          }
        });
      });
    },
    renderCall(args, _theme, context) {
      const state = context.state;
      if (context.executionStarted && state.startedAt === undefined) {
        state.startedAt = Date.now();
        state.endedAt = undefined;
      }
      const text = context.lastComponent ?? new _piTui.Text("", 0, 0);
      text.setText(formatBashCall(args));
      return text;
    },
    renderResult(result, options, _theme, context) {
      const state = context.state;
      if (state.startedAt !== undefined && options.isPartial && !state.interval) {
        state.interval = setInterval(() => context.invalidate(), 1000);
      }
      if (!options.isPartial || context.isError) {
        state.endedAt ??= Date.now();
        if (state.interval) {
          clearInterval(state.interval);
          state.interval = undefined;
        }
      }
      const component = context.lastComponent ?? new BashResultRenderComponent();
      rebuildBashResultRenderComponent(component, result, options, context.showImages, state.startedAt, state.endedAt);
      component.invalidate();
      return component;
    }
  };
}
function createBashTool(cwd, options) {
  return (0, _toolDefinitionWrapper.wrapToolDefinition)(createBashToolDefinition(cwd, options));
}
/** Default bash tool using process.cwd() for backwards compatibility. */
const bashToolDefinition = exports.bashToolDefinition = createBashToolDefinition(process.cwd());
const bashTool = exports.bashTool = createBashTool(process.cwd()); /* v9-445dee46b6d6eeba */
