"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveConfigIncludes;exports.i = readConfigIncludeFileWithGuards;exports.t = exports.r = exports.n = void 0;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _scanPathsDTbstpEd = require("./scan-paths-DTbstpEd.js");
var _boundaryFileReadDXLy_w6L = require("./boundary-file-read-DXLy_w6L.js");
var _prototypeKeysCnLLLhBE = require("./prototype-keys-CnLLLhBE.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _json = _interopRequireDefault(require("json5"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/config/includes.ts
/**
* Config includes: $include directive for modular configs
*
* @example
* ```json5
* {
*   "$include": "./base.json5",           // single file
*   "$include": ["./a.json5", "./b.json5"] // merge multiple
* }
* ```
*/
const INCLUDE_KEY = exports.r = "$include";
var ConfigIncludeError = class extends Error {
  constructor(message, includePath, cause) {
    super(message);
    this.includePath = includePath;
    this.cause = cause;
    this.name = "ConfigIncludeError";
  }
};exports.n = ConfigIncludeError;
var CircularIncludeError = class extends ConfigIncludeError {
  constructor(chain) {
    super(`Circular include detected: ${chain.join(" -> ")}`, chain[chain.length - 1]);
    this.chain = chain;
    this.name = "CircularIncludeError";
  }
};
/** Deep merge: arrays concatenate, objects merge recursively, primitives: source wins */exports.t = CircularIncludeError;
function deepMerge(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) return [...target, ...source];
  if ((0, _utilsD5DtWkEu.x)(target) && (0, _utilsD5DtWkEu.x)(source)) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if ((0, _prototypeKeysCnLLLhBE.t)(key)) continue;
      result[key] = key in result ? deepMerge(result[key], source[key]) : source[key];
    }
    return result;
  }
  return source;
}
var IncludeProcessor = class IncludeProcessor {
  constructor(basePath, resolver, rootDir) {
    this.basePath = basePath;
    this.resolver = resolver;
    this.visited = /* @__PURE__ */new Set();
    this.depth = 0;
    this.visited.add(_nodePath.default.normalize(basePath));
    this.rootDir = _nodePath.default.normalize(rootDir ?? _nodePath.default.dirname(basePath));
    this.rootRealDir = _nodePath.default.normalize(safeRealpath(this.rootDir));
  }
  process(obj) {
    if (Array.isArray(obj)) return obj.map((item) => this.process(item));
    if (!(0, _utilsD5DtWkEu.x)(obj)) return obj;
    if (!("$include" in obj)) return this.processObject(obj);
    return this.processInclude(obj);
  }
  processObject(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) result[key] = this.process(value);
    return result;
  }
  processInclude(obj) {
    const includeValue = obj[INCLUDE_KEY];
    const otherKeys = Object.keys(obj).filter((k) => k !== INCLUDE_KEY);
    const included = this.resolveInclude(includeValue);
    if (otherKeys.length === 0) return included;
    if (!(0, _utilsD5DtWkEu.x)(included)) throw new ConfigIncludeError("Sibling keys require included content to be an object", typeof includeValue === "string" ? includeValue : INCLUDE_KEY);
    const rest = {};
    for (const key of otherKeys) rest[key] = this.process(obj[key]);
    return deepMerge(included, rest);
  }
  resolveInclude(value) {
    if (typeof value === "string") return this.loadFile(value);
    if (Array.isArray(value)) return value.reduce((merged, item) => {
      if (typeof item !== "string") throw new ConfigIncludeError(`Invalid $include array item: expected string, got ${typeof item}`, String(item));
      return deepMerge(merged, this.loadFile(item));
    }, {});
    throw new ConfigIncludeError(`Invalid $include value: expected string or array of strings, got ${typeof value}`, String(value));
  }
  loadFile(includePath) {
    const resolvedPath = this.resolvePath(includePath);
    this.checkCircular(resolvedPath);
    this.checkDepth(includePath);
    const raw = this.readFile(includePath, resolvedPath);
    const parsed = this.parseFile(includePath, resolvedPath, raw);
    return this.processNested(resolvedPath, parsed);
  }
  resolvePath(includePath) {
    const configDir = _nodePath.default.dirname(this.basePath);
    const resolved = _nodePath.default.isAbsolute(includePath) ? includePath : _nodePath.default.resolve(configDir, includePath);
    const normalized = _nodePath.default.normalize(resolved);
    if (!(0, _scanPathsDTbstpEd.n)(this.rootDir, normalized)) throw new ConfigIncludeError(`Include path escapes config directory: ${includePath} (root: ${this.rootDir})`, includePath);
    try {
      const real = _nodeFs.default.realpathSync(normalized);
      if (!(0, _scanPathsDTbstpEd.n)(this.rootRealDir, real)) throw new ConfigIncludeError(`Include path resolves outside config directory (symlink): ${includePath} (root: ${this.rootDir})`, includePath);
    } catch (err) {
      if (err instanceof ConfigIncludeError) throw err;
    }
    return normalized;
  }
  checkCircular(resolvedPath) {
    if (this.visited.has(resolvedPath)) throw new CircularIncludeError([...this.visited, resolvedPath]);
  }
  checkDepth(includePath) {
    if (this.depth >= 10) throw new ConfigIncludeError(`Maximum include depth (10) exceeded at: ${includePath}`, includePath);
  }
  readFile(includePath, resolvedPath) {
    try {
      if (this.resolver.readFileWithGuards) return this.resolver.readFileWithGuards({
        includePath,
        resolvedPath,
        rootRealDir: this.rootRealDir
      });
      return this.resolver.readFile(resolvedPath);
    } catch (err) {
      if (err instanceof ConfigIncludeError) throw err;
      throw new ConfigIncludeError(`Failed to read include file: ${includePath} (resolved: ${resolvedPath})`, includePath, err instanceof Error ? err : void 0);
    }
  }
  parseFile(includePath, resolvedPath, raw) {
    try {
      return this.resolver.parseJson(raw);
    } catch (err) {
      throw new ConfigIncludeError(`Failed to parse include file: ${includePath} (resolved: ${resolvedPath})`, includePath, err instanceof Error ? err : void 0);
    }
  }
  processNested(resolvedPath, parsed) {
    const nested = new IncludeProcessor(resolvedPath, this.resolver, this.rootDir);
    nested.visited = new Set([...this.visited, resolvedPath]);
    nested.depth = this.depth + 1;
    return nested.process(parsed);
  }
};
function safeRealpath(target) {
  try {
    return _nodeFs.default.realpathSync(target);
  } catch {
    return target;
  }
}
function readConfigIncludeFileWithGuards(params) {
  const ioFs = params.ioFs ?? _nodeFs.default;
  const maxBytes = params.maxBytes ?? 2097152;
  if (!(0, _boundaryFileReadDXLy_w6L.t)(ioFs)) return ioFs.readFileSync(params.resolvedPath, "utf-8");
  const opened = (0, _boundaryFileReadDXLy_w6L.i)({
    absolutePath: params.resolvedPath,
    rootPath: params.rootRealDir,
    rootRealPath: params.rootRealDir,
    boundaryLabel: "config directory",
    skipLexicalRootCheck: true,
    maxBytes,
    ioFs
  });
  if (!opened.ok) {
    if (opened.reason === "validation") throw new ConfigIncludeError(`Include file failed security checks (regular file, max ${maxBytes} bytes, no hardlinks): ${params.includePath}`, params.includePath);
    throw new ConfigIncludeError(`Failed to read include file: ${params.includePath} (resolved: ${params.resolvedPath})`, params.includePath, opened.error instanceof Error ? opened.error : void 0);
  }
  try {
    return ioFs.readFileSync(opened.fd, "utf-8");
  } finally {
    ioFs.closeSync(opened.fd);
  }
}
const defaultResolver = {
  readFile: (p) => _nodeFs.default.readFileSync(p, "utf-8"),
  readFileWithGuards: ({ includePath, resolvedPath, rootRealDir }) => readConfigIncludeFileWithGuards({
    includePath,
    resolvedPath,
    rootRealDir
  }),
  parseJson: (raw) => _json.default.parse(raw)
};
/**
* Resolves all $include directives in a parsed config object.
*/
function resolveConfigIncludes(obj, configPath, resolver = defaultResolver) {
  return new IncludeProcessor(configPath, resolver).process(obj);
}
//#endregion /* v9-0581f478e3ce6c67 */
