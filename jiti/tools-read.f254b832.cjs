"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.createReadTool = createReadTool;exports.createReadToolDefinition = createReadToolDefinition;exports.readToolDefinition = exports.readTool = void 0;var _piTui = require("@mariozechner/pi-tui");
var _typebox = require("@sinclair/typebox");
var _fs = require("fs");
var _promises = require("fs/promises");
var _keybindingHints = require("../../modes/interactive/components/keybinding-hints.js");
var _theme = require("../../modes/interactive/theme/theme.js");
var _imageResize = require("../../utils/image-resize.js");
var _mime = require("../../utils/mime.js");
var _pathUtils = require("./path-utils.js");
var _renderUtils = require("./render-utils.js");
var _toolDefinitionWrapper = require("./tool-definition-wrapper.js");
var _truncate = require("./truncate.js");
const readSchema = _typebox.Type.Object({
  path: _typebox.Type.String({ description: "Path to the file to read (relative or absolute)" }),
  offset: _typebox.Type.Optional(_typebox.Type.Number({ description: "Line number to start reading from (1-indexed)" })),
  limit: _typebox.Type.Optional(_typebox.Type.Number({ description: "Maximum number of lines to read" }))
});
const defaultReadOperations = {
  readFile: (path) => (0, _promises.readFile)(path),
  access: (path) => (0, _promises.access)(path, _fs.constants.R_OK),
  detectImageMimeType: _mime.detectSupportedImageMimeTypeFromFile
};
function formatReadCall(args, theme) {
  const rawPath = (0, _renderUtils.str)(args?.file_path ?? args?.path);
  const path = rawPath !== null ? (0, _renderUtils.shortenPath)(rawPath) : null;
  const offset = args?.offset;
  const limit = args?.limit;
  const invalidArg = (0, _renderUtils.invalidArgText)(theme);
  let pathDisplay = path === null ? invalidArg : path ? theme.fg("accent", path) : theme.fg("toolOutput", "...");
  if (offset !== undefined || limit !== undefined) {
    const startLine = offset ?? 1;
    const endLine = limit !== undefined ? startLine + limit - 1 : "";
    pathDisplay += theme.fg("warning", `:${startLine}${endLine ? `-${endLine}` : ""}`);
  }
  return `${theme.fg("toolTitle", theme.bold("read"))} ${pathDisplay}`;
}
function trimTrailingEmptyLines(lines) {
  let end = lines.length;
  while (end > 0 && lines[end - 1] === "") {
    end--;
  }
  return lines.slice(0, end);
}
function formatReadResult(args, result, options, theme, showImages) {
  const rawPath = (0, _renderUtils.str)(args?.file_path ?? args?.path);
  const output = (0, _renderUtils.getTextOutput)(result, showImages);
  const lang = rawPath ? (0, _theme.getLanguageFromPath)(rawPath) : undefined;
  const renderedLines = lang ? (0, _theme.highlightCode)((0, _renderUtils.replaceTabs)(output), lang) : output.split("\n");
  const lines = trimTrailingEmptyLines(renderedLines);
  const maxLines = options.expanded ? lines.length : 10;
  const displayLines = lines.slice(0, maxLines);
  const remaining = lines.length - maxLines;
  let text = `\n${displayLines.map((line) => lang ? (0, _renderUtils.replaceTabs)(line) : theme.fg("toolOutput", (0, _renderUtils.replaceTabs)(line))).join("\n")}`;
  if (remaining > 0) {
    text += `${theme.fg("muted", `\n... (${remaining} more lines,`)} ${(0, _keybindingHints.keyHint)("app.tools.expand", "to expand")})`;
  }
  const truncation = result.details?.truncation;
  if (truncation?.truncated) {
    if (truncation.firstLineExceedsLimit) {
      text += `\n${theme.fg("warning", `[First line exceeds ${(0, _truncate.formatSize)(truncation.maxBytes ?? _truncate.DEFAULT_MAX_BYTES)} limit]`)}`;
    } else
    if (truncation.truncatedBy === "lines") {
      text += `\n${theme.fg("warning", `[Truncated: showing ${truncation.outputLines} of ${truncation.totalLines} lines (${truncation.maxLines ?? _truncate.DEFAULT_MAX_LINES} line limit)]`)}`;
    } else
    {
      text += `\n${theme.fg("warning", `[Truncated: ${truncation.outputLines} lines shown (${(0, _truncate.formatSize)(truncation.maxBytes ?? _truncate.DEFAULT_MAX_BYTES)} limit)]`)}`;
    }
  }
  return text;
}
function createReadToolDefinition(cwd, options) {
  const autoResizeImages = options?.autoResizeImages ?? true;
  const ops = options?.operations ?? defaultReadOperations;
  return {
    name: "read",
    label: "read",
    description: `Read the contents of a file. Supports text files and images (jpg, png, gif, webp). Images are sent as attachments. For text files, output is truncated to ${_truncate.DEFAULT_MAX_LINES} lines or ${_truncate.DEFAULT_MAX_BYTES / 1024}KB (whichever is hit first). Use offset/limit for large files. When you need the full file, continue with offset until complete.`,
    promptSnippet: "Read file contents",
    promptGuidelines: ["Use read to examine files instead of cat or sed."],
    parameters: readSchema,
    async execute(_toolCallId, { path, offset, limit }, signal, _onUpdate, _ctx) {
      const absolutePath = (0, _pathUtils.resolveReadPath)(path, cwd);
      return new Promise((resolve, reject) => {
        if (signal?.aborted) {
          reject(new Error("Operation aborted"));
          return;
        }
        let aborted = false;
        const onAbort = () => {
          aborted = true;
          reject(new Error("Operation aborted"));
        };
        signal?.addEventListener("abort", onAbort, { once: true });
        (async () => {
          try {
            // Check if file exists and is readable.
            await ops.access(absolutePath);
            if (aborted)
            return;
            const mimeType = ops.detectImageMimeType ? await ops.detectImageMimeType(absolutePath) : undefined;
            let content;
            let details;
            if (mimeType) {
              // Read image as binary.
              const buffer = await ops.readFile(absolutePath);
              const base64 = buffer.toString("base64");
              if (autoResizeImages) {
                // Resize image if needed before sending it back to the model.
                const resized = await (0, _imageResize.resizeImage)({ type: "image", data: base64, mimeType });
                if (!resized) {
                  content = [
                  {
                    type: "text",
                    text: `Read image file [${mimeType}]\n[Image omitted: could not be resized below the inline image size limit.]`
                  }];

                } else
                {
                  const dimensionNote = (0, _imageResize.formatDimensionNote)(resized);
                  let textNote = `Read image file [${resized.mimeType}]`;
                  if (dimensionNote)
                  textNote += `\n${dimensionNote}`;
                  content = [
                  { type: "text", text: textNote },
                  { type: "image", data: resized.data, mimeType: resized.mimeType }];

                }
              } else
              {
                content = [
                { type: "text", text: `Read image file [${mimeType}]` },
                { type: "image", data: base64, mimeType }];

              }
            } else
            {
              // Read text content.
              const buffer = await ops.readFile(absolutePath);
              const textContent = buffer.toString("utf-8");
              const allLines = textContent.split("\n");
              const totalFileLines = allLines.length;
              // Apply offset if specified. Convert from 1-indexed input to 0-indexed array access.
              const startLine = offset ? Math.max(0, offset - 1) : 0;
              const startLineDisplay = startLine + 1;
              // Check if offset is out of bounds.
              if (startLine >= allLines.length) {
                throw new Error(`Offset ${offset} is beyond end of file (${allLines.length} lines total)`);
              }
              let selectedContent;
              let userLimitedLines;
              // If limit is specified by the user, honor it first. Otherwise truncateHead decides.
              if (limit !== undefined) {
                const endLine = Math.min(startLine + limit, allLines.length);
                selectedContent = allLines.slice(startLine, endLine).join("\n");
                userLimitedLines = endLine - startLine;
              } else
              {
                selectedContent = allLines.slice(startLine).join("\n");
              }
              // Apply truncation, respecting both line and byte limits.
              const truncation = (0, _truncate.truncateHead)(selectedContent);
              let outputText;
              if (truncation.firstLineExceedsLimit) {
                // First line alone exceeds the byte limit. Point the model at a bash fallback.
                const firstLineSize = (0, _truncate.formatSize)(Buffer.byteLength(allLines[startLine], "utf-8"));
                outputText = `[Line ${startLineDisplay} is ${firstLineSize}, exceeds ${(0, _truncate.formatSize)(_truncate.DEFAULT_MAX_BYTES)} limit. Use bash: sed -n '${startLineDisplay}p' ${path} | head -c ${_truncate.DEFAULT_MAX_BYTES}]`;
                details = { truncation };
              } else
              if (truncation.truncated) {
                // Truncation occurred. Build an actionable continuation notice.
                const endLineDisplay = startLineDisplay + truncation.outputLines - 1;
                const nextOffset = endLineDisplay + 1;
                outputText = truncation.content;
                if (truncation.truncatedBy === "lines") {
                  outputText += `\n\n[Showing lines ${startLineDisplay}-${endLineDisplay} of ${totalFileLines}. Use offset=${nextOffset} to continue.]`;
                } else
                {
                  outputText += `\n\n[Showing lines ${startLineDisplay}-${endLineDisplay} of ${totalFileLines} (${(0, _truncate.formatSize)(_truncate.DEFAULT_MAX_BYTES)} limit). Use offset=${nextOffset} to continue.]`;
                }
                details = { truncation };
              } else
              if (userLimitedLines !== undefined && startLine + userLimitedLines < allLines.length) {
                // User-specified limit stopped early, but the file still has more content.
                const remaining = allLines.length - (startLine + userLimitedLines);
                const nextOffset = startLine + userLimitedLines + 1;
                outputText = `${truncation.content}\n\n[${remaining} more lines in file. Use offset=${nextOffset} to continue.]`;
              } else
              {
                // No truncation and no remaining user-limited content.
                outputText = truncation.content;
              }
              content = [{ type: "text", text: outputText }];
            }
            if (aborted)
            return;
            signal?.removeEventListener("abort", onAbort);
            resolve({ content, details });
          }
          catch (error) {
            signal?.removeEventListener("abort", onAbort);
            if (!aborted)
            reject(error);
          }
        })();
      });
    },
    renderCall(args, theme, context) {
      const text = context.lastComponent ?? new _piTui.Text("", 0, 0);
      text.setText(formatReadCall(args, theme));
      return text;
    },
    renderResult(result, options, theme, context) {
      const text = context.lastComponent ?? new _piTui.Text("", 0, 0);
      text.setText(formatReadResult(context.args, result, options, theme, context.showImages));
      return text;
    }
  };
}
function createReadTool(cwd, options) {
  return (0, _toolDefinitionWrapper.wrapToolDefinition)(createReadToolDefinition(cwd, options));
}
/** Default read tool using process.cwd() for backwards compatibility. */
const readToolDefinition = exports.readToolDefinition = createReadToolDefinition(process.cwd());
const readTool = exports.readTool = createReadTool(process.cwd()); /* v9-b54f4289344e1e2c */
