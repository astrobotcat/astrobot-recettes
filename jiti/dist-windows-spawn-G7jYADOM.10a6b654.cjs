"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveWindowsSpawnProgramCandidate;exports.i = resolveWindowsSpawnProgram;exports.n = materializeWindowsSpawnProgram;exports.r = resolveWindowsExecutablePath;exports.t = applyWindowsSpawnProgramPolicy;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _nodeFs = require("node:fs");
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/plugin-sdk/windows-spawn.ts
function isFilePath(candidate) {
  try {
    return (0, _nodeFs.statSync)(candidate).isFile();
  } catch {
    return false;
  }
}
/** Resolve a Windows command name through PATH and PATHEXT so wrapper inspection sees the real file. */
function resolveWindowsExecutablePath(command, env) {
  if (command.includes("/") || command.includes("\\") || _nodePath.default.isAbsolute(command)) return command;
  const pathEntries = (env.PATH ?? env.Path ?? process.env.PATH ?? process.env.Path ?? "").split(";").map((entry) => entry.trim()).filter(Boolean);
  const hasExtension = _nodePath.default.extname(command).length > 0;
  const pathExtRaw = env.PATHEXT ?? env.Pathext ?? process.env.PATHEXT ?? process.env.Pathext ?? ".EXE;.CMD;.BAT;.COM";
  const pathExt = hasExtension ? [""] : pathExtRaw.split(";").map((ext) => ext.trim()).filter(Boolean).map((ext) => ext.startsWith(".") ? ext : `.${ext}`);
  for (const dir of pathEntries) for (const ext of pathExt) {
    const normalizedExt = (0, _stringCoerceBUSzWgUA.i)(ext);
    const uppercaseExt = ext.toUpperCase();
    for (const candidateExt of [
    ext,
    normalizedExt,
    uppercaseExt])
    {
      const candidate = _nodePath.default.join(dir, `${command}${candidateExt}`);
      if (isFilePath(candidate)) return candidate;
    }
  }
  return command;
}
function resolveEntrypointFromCmdShim(wrapperPath) {
  if (!isFilePath(wrapperPath)) return null;
  try {
    const content = (0, _nodeFs.readFileSync)(wrapperPath, "utf8");
    const candidates = [];
    for (const match of content.matchAll(/"([^"\r\n]*)"/g)) {
      const relative = (match[1] ?? "").match(/%~?dp0%?\s*[\\/]*(.*)$/i)?.[1]?.trim();
      if (!relative) continue;
      const normalizedRelative = relative.replace(/[\\/]+/g, _nodePath.default.sep).replace(/^[\\/]+/, "");
      const candidate = _nodePath.default.resolve(_nodePath.default.dirname(wrapperPath), normalizedRelative);
      if (isFilePath(candidate)) candidates.push(candidate);
    }
    return candidates.find((candidate) => {
      const base = (0, _stringCoerceBUSzWgUA.i)(_nodePath.default.basename(candidate));
      return base !== "node.exe" && base !== "node";
    }) ?? null;
  } catch {
    return null;
  }
}
function resolveBinEntry(packageName, binField) {
  if (typeof binField === "string") return (0, _stringCoerceBUSzWgUA.s)(binField) || null;
  if (!binField || typeof binField !== "object") return null;
  if (packageName) {
    const preferred = binField[packageName];
    const normalizedPreferred = typeof preferred === "string" ? (0, _stringCoerceBUSzWgUA.s)(preferred) : void 0;
    if (normalizedPreferred) return normalizedPreferred;
  }
  for (const value of Object.values(binField)) {
    const normalizedValue = typeof value === "string" ? (0, _stringCoerceBUSzWgUA.s)(value) : void 0;
    if (normalizedValue) return normalizedValue;
  }
  return null;
}
function resolveEntrypointFromPackageJson(wrapperPath, packageName) {
  if (!packageName) return null;
  const wrapperDir = _nodePath.default.dirname(wrapperPath);
  const packageDirs = [_nodePath.default.resolve(wrapperDir, "..", packageName), _nodePath.default.resolve(wrapperDir, "node_modules", packageName)];
  for (const packageDir of packageDirs) {
    const packageJsonPath = _nodePath.default.join(packageDir, "package.json");
    if (!isFilePath(packageJsonPath)) continue;
    try {
      const entryRel = resolveBinEntry(packageName, JSON.parse((0, _nodeFs.readFileSync)(packageJsonPath, "utf8")).bin);
      if (!entryRel) continue;
      const entryPath = _nodePath.default.resolve(packageDir, entryRel);
      if (isFilePath(entryPath)) return entryPath;
    } catch {}
  }
  return null;
}
/** Resolve the safest direct spawn candidate for Windows wrappers, scripts, and binaries. */
function resolveWindowsSpawnProgramCandidate(params) {
  const platform = params.platform ?? process.platform;
  const env = params.env ?? process.env;
  const execPath = params.execPath ?? process.execPath;
  if (platform !== "win32") return {
    command: params.command,
    leadingArgv: [],
    resolution: "direct"
  };
  const resolvedCommand = resolveWindowsExecutablePath(params.command, env);
  const ext = (0, _stringCoerceBUSzWgUA.i)(_nodePath.default.extname(resolvedCommand));
  if (ext === ".js" || ext === ".cjs" || ext === ".mjs") return {
    command: execPath,
    leadingArgv: [resolvedCommand],
    resolution: "node-entrypoint",
    windowsHide: true
  };
  if (ext === ".cmd" || ext === ".bat") {
    const entrypoint = resolveEntrypointFromCmdShim(resolvedCommand) ?? resolveEntrypointFromPackageJson(resolvedCommand, params.packageName);
    if (entrypoint) {
      if ((0, _stringCoerceBUSzWgUA.i)(_nodePath.default.extname(entrypoint)) === ".exe") return {
        command: entrypoint,
        leadingArgv: [],
        resolution: "exe-entrypoint",
        windowsHide: true
      };
      return {
        command: execPath,
        leadingArgv: [entrypoint],
        resolution: "node-entrypoint",
        windowsHide: true
      };
    }
    return {
      command: resolvedCommand,
      leadingArgv: [],
      resolution: "unresolved-wrapper"
    };
  }
  return {
    command: resolvedCommand,
    leadingArgv: [],
    resolution: "direct"
  };
}
/** Apply shell-fallback policy when Windows wrapper resolution could not find a direct entrypoint. */
function applyWindowsSpawnProgramPolicy(params) {
  if (params.candidate.resolution !== "unresolved-wrapper") return {
    command: params.candidate.command,
    leadingArgv: params.candidate.leadingArgv,
    resolution: params.candidate.resolution,
    windowsHide: params.candidate.windowsHide
  };
  if (params.allowShellFallback === true) return {
    command: params.candidate.command,
    leadingArgv: [],
    resolution: "shell-fallback",
    shell: true
  };
  throw new Error(`${_nodePath.default.basename(params.candidate.command)} wrapper resolved, but no executable/Node entrypoint could be resolved without shell execution.`);
}
/** Resolve the final Windows spawn program after candidate discovery and fallback policy. */
function resolveWindowsSpawnProgram(params) {
  return applyWindowsSpawnProgramPolicy({
    candidate: resolveWindowsSpawnProgramCandidate(params),
    allowShellFallback: params.allowShellFallback
  });
}
/** Combine a resolved Windows spawn program with call-site argv for actual process launch. */
function materializeWindowsSpawnProgram(program, argv) {
  return {
    command: program.command,
    argv: [...program.leadingArgv, ...argv],
    resolution: program.resolution,
    shell: program.shell,
    windowsHide: program.windowsHide
  };
}
//#endregion /* v9-c084e9ff47e63cbd */
