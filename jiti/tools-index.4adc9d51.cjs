"use strict";Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, "DEFAULT_MAX_BYTES", { enumerable: true, get: function () {return _truncate.DEFAULT_MAX_BYTES;} });Object.defineProperty(exports, "DEFAULT_MAX_LINES", { enumerable: true, get: function () {return _truncate.DEFAULT_MAX_LINES;} });exports.allTools = exports.allToolDefinitions = void 0;Object.defineProperty(exports, "bashTool", { enumerable: true, get: function () {return _bash.bashTool;} });Object.defineProperty(exports, "bashToolDefinition", { enumerable: true, get: function () {return _bash.bashToolDefinition;} });exports.codingTools = void 0;exports.createAllToolDefinitions = createAllToolDefinitions;exports.createAllTools = createAllTools;Object.defineProperty(exports, "createBashTool", { enumerable: true, get: function () {return _bash.createBashTool;} });Object.defineProperty(exports, "createBashToolDefinition", { enumerable: true, get: function () {return _bash.createBashToolDefinition;} });exports.createCodingToolDefinitions = createCodingToolDefinitions;exports.createCodingTools = createCodingTools;Object.defineProperty(exports, "createEditTool", { enumerable: true, get: function () {return _edit.createEditTool;} });Object.defineProperty(exports, "createEditToolDefinition", { enumerable: true, get: function () {return _edit.createEditToolDefinition;} });Object.defineProperty(exports, "createFindTool", { enumerable: true, get: function () {return _find.createFindTool;} });Object.defineProperty(exports, "createFindToolDefinition", { enumerable: true, get: function () {return _find.createFindToolDefinition;} });Object.defineProperty(exports, "createGrepTool", { enumerable: true, get: function () {return _grep.createGrepTool;} });Object.defineProperty(exports, "createGrepToolDefinition", { enumerable: true, get: function () {return _grep.createGrepToolDefinition;} });Object.defineProperty(exports, "createLocalBashOperations", { enumerable: true, get: function () {return _bash.createLocalBashOperations;} });Object.defineProperty(exports, "createLsTool", { enumerable: true, get: function () {return _ls.createLsTool;} });Object.defineProperty(exports, "createLsToolDefinition", { enumerable: true, get: function () {return _ls.createLsToolDefinition;} });exports.createReadOnlyToolDefinitions = createReadOnlyToolDefinitions;exports.createReadOnlyTools = createReadOnlyTools;Object.defineProperty(exports, "createReadTool", { enumerable: true, get: function () {return _read.createReadTool;} });Object.defineProperty(exports, "createReadToolDefinition", { enumerable: true, get: function () {return _read.createReadToolDefinition;} });Object.defineProperty(exports, "createWriteTool", { enumerable: true, get: function () {return _write.createWriteTool;} });Object.defineProperty(exports, "createWriteToolDefinition", { enumerable: true, get: function () {return _write.createWriteToolDefinition;} });Object.defineProperty(exports, "editTool", { enumerable: true, get: function () {return _edit.editTool;} });Object.defineProperty(exports, "editToolDefinition", { enumerable: true, get: function () {return _edit.editToolDefinition;} });Object.defineProperty(exports, "findTool", { enumerable: true, get: function () {return _find.findTool;} });Object.defineProperty(exports, "findToolDefinition", { enumerable: true, get: function () {return _find.findToolDefinition;} });Object.defineProperty(exports, "formatSize", { enumerable: true, get: function () {return _truncate.formatSize;} });Object.defineProperty(exports, "grepTool", { enumerable: true, get: function () {return _grep.grepTool;} });Object.defineProperty(exports, "grepToolDefinition", { enumerable: true, get: function () {return _grep.grepToolDefinition;} });Object.defineProperty(exports, "lsTool", { enumerable: true, get: function () {return _ls.lsTool;} });Object.defineProperty(exports, "lsToolDefinition", { enumerable: true, get: function () {return _ls.lsToolDefinition;} });exports.readOnlyTools = void 0;Object.defineProperty(exports, "readTool", { enumerable: true, get: function () {return _read.readTool;} });Object.defineProperty(exports, "readToolDefinition", { enumerable: true, get: function () {return _read.readToolDefinition;} });Object.defineProperty(exports, "truncateHead", { enumerable: true, get: function () {return _truncate.truncateHead;} });Object.defineProperty(exports, "truncateLine", { enumerable: true, get: function () {return _truncate.truncateLine;} });Object.defineProperty(exports, "truncateTail", { enumerable: true, get: function () {return _truncate.truncateTail;} });Object.defineProperty(exports, "withFileMutationQueue", { enumerable: true, get: function () {return _fileMutationQueue.withFileMutationQueue;} });Object.defineProperty(exports, "writeTool", { enumerable: true, get: function () {return _write.writeTool;} });Object.defineProperty(exports, "writeToolDefinition", { enumerable: true, get: function () {return _write.writeToolDefinition;} });var _bash = require("./bash.js");
var _edit = require("./edit.js");
var _fileMutationQueue = require("./file-mutation-queue.js");
var _find = require("./find.js");
var _grep = require("./grep.js");
var _ls = require("./ls.js");
var _read = require("./read.js");
var _truncate = require("./truncate.js");
var _write = require("./write.js");







const codingTools = exports.codingTools = [_read.readTool, _bash.bashTool, _edit.editTool, _write.writeTool];
const readOnlyTools = exports.readOnlyTools = [_read.readTool, _grep.grepTool, _find.findTool, _ls.lsTool];
const allTools = exports.allTools = {
  read: _read.readTool,
  bash: _bash.bashTool,
  edit: _edit.editTool,
  write: _write.writeTool,
  grep: _grep.grepTool,
  find: _find.findTool,
  ls: _ls.lsTool
};
const allToolDefinitions = exports.allToolDefinitions = {
  read: _read.readToolDefinition,
  bash: _bash.bashToolDefinition,
  edit: _edit.editToolDefinition,
  write: _write.writeToolDefinition,
  grep: _grep.grepToolDefinition,
  find: _find.findToolDefinition,
  ls: _ls.lsToolDefinition
};
function createCodingToolDefinitions(cwd, options) {
  return [
  (0, _read.createReadToolDefinition)(cwd, options?.read),
  (0, _bash.createBashToolDefinition)(cwd, options?.bash),
  (0, _edit.createEditToolDefinition)(cwd),
  (0, _write.createWriteToolDefinition)(cwd)];

}
function createReadOnlyToolDefinitions(cwd, options) {
  return [
  (0, _read.createReadToolDefinition)(cwd, options?.read),
  (0, _grep.createGrepToolDefinition)(cwd),
  (0, _find.createFindToolDefinition)(cwd),
  (0, _ls.createLsToolDefinition)(cwd)];

}
function createAllToolDefinitions(cwd, options) {
  return {
    read: (0, _read.createReadToolDefinition)(cwd, options?.read),
    bash: (0, _bash.createBashToolDefinition)(cwd, options?.bash),
    edit: (0, _edit.createEditToolDefinition)(cwd),
    write: (0, _write.createWriteToolDefinition)(cwd),
    grep: (0, _grep.createGrepToolDefinition)(cwd),
    find: (0, _find.createFindToolDefinition)(cwd),
    ls: (0, _ls.createLsToolDefinition)(cwd)
  };
}
function createCodingTools(cwd, options) {
  return [
  (0, _read.createReadTool)(cwd, options?.read),
  (0, _bash.createBashTool)(cwd, options?.bash),
  (0, _edit.createEditTool)(cwd),
  (0, _write.createWriteTool)(cwd)];

}
function createReadOnlyTools(cwd, options) {
  return [(0, _read.createReadTool)(cwd, options?.read), (0, _grep.createGrepTool)(cwd), (0, _find.createFindTool)(cwd), (0, _ls.createLsTool)(cwd)];
}
function createAllTools(cwd, options) {
  return {
    read: (0, _read.createReadTool)(cwd, options?.read),
    bash: (0, _bash.createBashTool)(cwd, options?.bash),
    edit: (0, _edit.createEditTool)(cwd),
    write: (0, _write.createWriteTool)(cwd),
    grep: (0, _grep.createGrepTool)(cwd),
    find: (0, _find.createFindTool)(cwd),
    ls: (0, _ls.createLsTool)(cwd)
  };
} /* v9-ea403c2a2e399e1c */
