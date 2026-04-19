"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = getShellConfig;exports.r = sanitizeBinaryOutput;exports.t = detectRuntimeShell;var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/shell-utils.ts
function resolvePowerShellPath() {
  const programFiles = process.env.ProgramFiles || process.env.PROGRAMFILES || "C:\\Program Files";
  const pwsh7 = _nodePath.default.join(programFiles, "PowerShell", "7", "pwsh.exe");
  if (_nodeFs.default.existsSync(pwsh7)) return pwsh7;
  const programW6432 = process.env.ProgramW6432;
  if (programW6432 && programW6432 !== programFiles) {
    const pwsh7Alt = _nodePath.default.join(programW6432, "PowerShell", "7", "pwsh.exe");
    if (_nodeFs.default.existsSync(pwsh7Alt)) return pwsh7Alt;
  }
  const pwshInPath = resolveShellFromPath("pwsh");
  if (pwshInPath) return pwshInPath;
  const systemRoot = process.env.SystemRoot || process.env.WINDIR;
  if (systemRoot) {
    const candidate = _nodePath.default.join(systemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
    if (_nodeFs.default.existsSync(candidate)) return candidate;
  }
  return "powershell.exe";
}
function getShellConfig() {
  if (process.platform === "win32") return {
    shell: resolvePowerShellPath(),
    args: [
    "-NoProfile",
    "-NonInteractive",
    "-Command"]

  };
  const envShell = process.env.SHELL?.trim();
  if ((envShell ? _nodePath.default.basename(envShell) : "") === "fish") {
    const bash = resolveShellFromPath("bash");
    if (bash) return {
      shell: bash,
      args: ["-c"]
    };
    const sh = resolveShellFromPath("sh");
    if (sh) return {
      shell: sh,
      args: ["-c"]
    };
  }
  return {
    shell: envShell && envShell.length > 0 ? envShell : "sh",
    args: ["-c"]
  };
}
function resolveShellFromPath(name) {
  const envPath = process.env.PATH ?? "";
  if (!envPath) return;
  const entries = envPath.split(_nodePath.default.delimiter).filter(Boolean);
  for (const entry of entries) {
    const candidate = _nodePath.default.join(entry, name);
    try {
      _nodeFs.default.accessSync(candidate, _nodeFs.default.constants.X_OK);
      return candidate;
    } catch {}
  }
}
function normalizeShellName(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return _nodePath.default.basename(trimmed).replace(/\.(exe|cmd|bat)$/i, "").replace(/[^a-zA-Z0-9_-]/g, "");
}
function detectRuntimeShell() {
  const overrideShell = process.env.OPENCLAW_SHELL?.trim();
  if (overrideShell) {
    const name = normalizeShellName(overrideShell);
    if (name) return name;
  }
  if (process.platform === "win32") {
    if (process.env.POWERSHELL_DISTRIBUTION_CHANNEL) return "pwsh";
    return "powershell";
  }
  const envShell = process.env.SHELL?.trim();
  if (envShell) {
    const name = normalizeShellName(envShell);
    if (name) return name;
  }
  if (process.env.POWERSHELL_DISTRIBUTION_CHANNEL) return "pwsh";
  if (process.env.BASH_VERSION) return "bash";
  if (process.env.ZSH_VERSION) return "zsh";
  if (process.env.FISH_VERSION) return "fish";
  if (process.env.KSH_VERSION) return "ksh";
  if (process.env.NU_VERSION || process.env.NUSHELL_VERSION) return "nu";
}
function sanitizeBinaryOutput(text) {
  const scrubbed = text.replace(/[\p{Format}\p{Surrogate}]/gu, "");
  if (!scrubbed) return scrubbed;
  const chunks = [];
  for (const char of scrubbed) {
    const code = char.codePointAt(0);
    if (code == null) continue;
    if (code === 9 || code === 10 || code === 13) {
      chunks.push(char);
      continue;
    }
    if (code < 32) continue;
    chunks.push(char);
  }
  return chunks.join("");
}
//#endregion /* v9-545a4fdda214d0bd */
