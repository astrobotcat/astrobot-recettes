"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.createEditTool = createEditTool;exports.createEditToolDefinition = createEditToolDefinition;exports.editToolDefinition = exports.editTool = void 0;var _piTui = require("@mariozechner/pi-tui");
var _typebox = require("@sinclair/typebox");
var _fs = require("fs");
var _promises = require("fs/promises");
var _diff = require("../../modes/interactive/components/diff.js");
var _editDiff = require("./edit-diff.js");
var _fileMutationQueue = require("./file-mutation-queue.js");
var _pathUtils = require("./path-utils.js");
var _renderUtils = require("./render-utils.js");
var _toolDefinitionWrapper = require("./tool-definition-wrapper.js");
const replaceEditSchema = _typebox.Type.Object({
  oldText: _typebox.Type.String({
    description: "Exact text for one targeted replacement. It must be unique in the original file and must not overlap with any other edits[].oldText in the same call."
  }),
  newText: _typebox.Type.String({ description: "Replacement text for this targeted edit." })
}, { additionalProperties: false });
const editSchema = _typebox.Type.Object({
  path: _typebox.Type.String({ description: "Path to the file to edit (relative or absolute)" }),
  edits: _typebox.Type.Array(replaceEditSchema, {
    description: "One or more targeted replacements. Each edit is matched against the original file, not incrementally. Do not include overlapping or nested edits. If two changes touch the same block or nearby lines, merge them into one edit instead."
  })
}, { additionalProperties: false });
const defaultEditOperations = {
  readFile: (path) => (0, _promises.readFile)(path),
  writeFile: (path, content) => (0, _promises.writeFile)(path, content, "utf-8"),
  access: (path) => (0, _promises.access)(path, _fs.constants.R_OK | _fs.constants.W_OK)
};
function prepareEditArguments(input) {
  if (!input || typeof input !== "object") {
    return input;
  }
  const args = input;
  if (typeof args.oldText !== "string" || typeof args.newText !== "string") {
    return input;
  }
  const edits = Array.isArray(args.edits) ? [...args.edits] : [];
  edits.push({ oldText: args.oldText, newText: args.newText });
  const { oldText: _oldText, newText: _newText, ...rest } = args;
  return { ...rest, edits };
}
function validateEditInput(input) {
  if (!Array.isArray(input.edits) || input.edits.length === 0) {
    throw new Error("Edit tool input is invalid. edits must contain at least one replacement.");
  }
  return { path: input.path, edits: input.edits };
}
function formatEditCall(args, theme) {
  const invalidArg = (0, _renderUtils.invalidArgText)(theme);
  const rawPath = (0, _renderUtils.str)(args?.file_path ?? args?.path);
  const path = rawPath !== null ? (0, _renderUtils.shortenPath)(rawPath) : null;
  const pathDisplay = path === null ? invalidArg : path ? theme.fg("accent", path) : theme.fg("toolOutput", "...");
  return `${theme.fg("toolTitle", theme.bold("edit"))} ${pathDisplay}`;
}
function formatEditResult(args, result, theme, isError) {
  const rawPath = (0, _renderUtils.str)(args?.file_path ?? args?.path);
  if (isError) {
    const errorText = result.content.
    filter((c) => c.type === "text").
    map((c) => c.text || "").
    join("\n");
    if (!errorText) {
      return undefined;
    }
    return `\n${theme.fg("error", errorText)}`;
  }
  const resultDiff = result.details?.diff;
  if (!resultDiff) {
    return undefined;
  }
  return `\n${(0, _diff.renderDiff)(resultDiff, { filePath: rawPath ?? undefined })}`;
}
function createEditToolDefinition(cwd, options) {
  const ops = options?.operations ?? defaultEditOperations;
  return {
    name: "edit",
    label: "edit",
    description: "Edit a single file using exact text replacement. Every edits[].oldText must match a unique, non-overlapping region of the original file. If two changes affect the same block or nearby lines, merge them into one edit instead of emitting overlapping edits. Do not include large unchanged regions just to connect distant changes.",
    promptSnippet: "Make precise file edits with exact text replacement, including multiple disjoint edits in one call",
    promptGuidelines: [
    "Use edit for precise changes (edits[].oldText must match exactly)",
    "When changing multiple separate locations in one file, use one edit call with multiple entries in edits[] instead of multiple edit calls",
    "Each edits[].oldText is matched against the original file, not after earlier edits are applied. Do not emit overlapping or nested edits. Merge nearby changes into one edit.",
    "Keep edits[].oldText as small as possible while still being unique in the file. Do not pad with large unchanged regions."],

    parameters: editSchema,
    prepareArguments: prepareEditArguments,
    async execute(_toolCallId, input, signal, _onUpdate, _ctx) {
      const { path, edits } = validateEditInput(input);
      const absolutePath = (0, _pathUtils.resolveToCwd)(path, cwd);
      return (0, _fileMutationQueue.withFileMutationQueue)(absolutePath, () => new Promise((resolve, reject) => {
        // Check if already aborted.
        if (signal?.aborted) {
          reject(new Error("Operation aborted"));
          return;
        }
        let aborted = false;
        // Set up abort handler.
        const onAbort = () => {
          aborted = true;
          reject(new Error("Operation aborted"));
        };
        if (signal) {
          signal.addEventListener("abort", onAbort, { once: true });
        }
        // Perform the edit operation.
        void (async () => {
          try {
            // Check if file exists.
            try {
              await ops.access(absolutePath);
            }
            catch {
              if (signal) {
                signal.removeEventListener("abort", onAbort);
              }
              reject(new Error(`File not found: ${path}`));
              return;
            }
            // Check if aborted before reading.
            if (aborted) {
              return;
            }
            // Read the file.
            const buffer = await ops.readFile(absolutePath);
            const rawContent = buffer.toString("utf-8");
            // Check if aborted after reading.
            if (aborted) {
              return;
            }
            // Strip BOM before matching. The model will not include an invisible BOM in oldText.
            const { bom, text: content } = (0, _editDiff.stripBom)(rawContent);
            const originalEnding = (0, _editDiff.detectLineEnding)(content);
            const normalizedContent = (0, _editDiff.normalizeToLF)(content);
            const { baseContent, newContent } = (0, _editDiff.applyEditsToNormalizedContent)(normalizedContent, edits, path);
            // Check if aborted before writing.
            if (aborted) {
              return;
            }
            const finalContent = bom + (0, _editDiff.restoreLineEndings)(newContent, originalEnding);
            await ops.writeFile(absolutePath, finalContent);
            // Check if aborted after writing.
            if (aborted) {
              return;
            }
            // Clean up abort handler.
            if (signal) {
              signal.removeEventListener("abort", onAbort);
            }
            const diffResult = (0, _editDiff.generateDiffString)(baseContent, newContent);
            resolve({
              content: [
              {
                type: "text",
                text: `Successfully replaced ${edits.length} block(s) in ${path}.`
              }],

              details: { diff: diffResult.diff, firstChangedLine: diffResult.firstChangedLine }
            });
          }
          catch (error) {
            // Clean up abort handler.
            if (signal) {
              signal.removeEventListener("abort", onAbort);
            }
            if (!aborted) {
              reject(error instanceof Error ? error : new Error(String(error)));
            }
          }
        })();
      }));
    },
    renderCall(args, theme, context) {
      const text = context.lastComponent ?? new _piTui.Text("", 0, 0);
      text.setText(formatEditCall(args, theme));
      return text;
    },
    renderResult(result, _options, theme, context) {
      const output = formatEditResult(context.args, result, theme, context.isError);
      if (!output) {
        const component = context.lastComponent ?? new _piTui.Container();
        component.clear();
        return component;
      }
      const text = context.lastComponent ?? new _piTui.Text("", 0, 0);
      text.setText(output);
      return text;
    }
  };
}
function createEditTool(cwd, options) {
  return (0, _toolDefinitionWrapper.wrapToolDefinition)(createEditToolDefinition(cwd, options));
}
/** Default edit tool using process.cwd() for backwards compatibility. */
const editToolDefinition = exports.editToolDefinition = createEditToolDefinition(process.cwd());
const editTool = exports.editTool = createEditTool(process.cwd()); /* v9-0509587cd830533b */
