"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.A = restoreExecApprovalsSnapshot;exports.B = describeInterpreterInlineEval;exports.C = requiresExecApproval;exports.D = resolveExecApprovalsFromFile;exports.E = resolveExecApprovals;exports.F = isSafeBinUsage;exports.G = buildEnforcedShellCommand;exports.H = isInterpreterLikeAllowlistPattern;exports.I = normalizeSafeBins;exports.J = isWindowsPlatform;exports.K = buildSafeBinsShellCommand;exports.L = resolveAllowAlwaysPatternEntries;exports.M = requestJsonlSocket;exports.N = evaluateExecAllowlist;exports.O = resolveExecApprovalsPath;exports.P = evaluateShellAllowlist;exports.Q = windowsEscapeArg;exports.R = resolveAllowAlwaysPatterns;exports.S = requestExecApprovalViaSocket;exports.T = resolveExecApprovalRequestAllowedDecisions;exports.U = analyzeArgvCommand;exports.V = detectInterpreterInlineEvalArgv;exports.W = analyzeShellCommand;exports.X = splitCommandChain;exports.Y = resolvePlannedSegmentArgv;exports.Z = splitCommandChainWithOperators;exports._ = normalizeExecTarget;exports.a = addDurableCommandApproval;exports.b = recordAllowlistMatchesUse;exports.c = isExecApprovalDecisionAllowed;exports.d = mergeExecApprovalsSocketDefaults;exports.f = minSecurity;exports.g = normalizeExecSecurity;exports.h = normalizeExecHost;exports.i = addAllowlistEntry;exports.j = saveExecApprovals;exports.k = resolveExecApprovalsSocketPath;exports.l = loadExecApprovals;exports.m = normalizeExecAsk;exports.n = void 0;exports.o = ensureExecApprovals;exports.p = normalizeExecApprovals;exports.q = buildSafeShellCommand;exports.r = void 0;exports.s = hasDurableExecApproval;exports.t = void 0;exports.u = maxAsk;exports.v = persistAllowAlwaysPatterns;exports.w = resolveExecApprovalAllowedDecisions;exports.x = recordAllowlistUse;exports.y = readExecApprovalsSnapshot;exports.z = resolveSafeBins;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _homeDirBEqRdfoa = require("./home-dir-BEqRdfoa.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _execSafeBinTrustBcrCYHRC = require("./exec-safe-bin-trust-BcrCYHRC.js");
var _shellArgvDluwKu9O = require("./shell-argv-DluwKu9O.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
var _nodeNet = _interopRequireDefault(require("node:net"));
var _nodeTimers = require("node:timers");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/exec-approvals-analysis.ts
const DISALLOWED_PIPELINE_TOKENS = new Set([
">",
"<",
"`",
"\n",
"\r",
"(",
")"]
);
const DOUBLE_QUOTE_ESCAPES = new Set([
"\\",
"\"",
"$",
"`"]
);
const WINDOWS_UNSUPPORTED_TOKENS = new Set([
"&",
"|",
"<",
">",
"^",
"(",
")",
"%",
"!",
"`",
"\n",
"\r"]
);
function isDoubleQuoteEscape(next) {
  return Boolean(next && DOUBLE_QUOTE_ESCAPES.has(next));
}
function isEscapedLineContinuation(next) {
  return next === "\n" || next === "\r";
}
function isShellCommentStart(source, index) {
  if (source[index] !== "#") return false;
  if (index === 0) return true;
  const prev = source[index - 1];
  return Boolean(prev && /\s/.test(prev));
}
function splitShellPipeline(command) {
  const parseHeredocDelimiter = (source, start) => {
    let i = start;
    while (i < source.length && (source[i] === " " || source[i] === "	")) i += 1;
    if (i >= source.length) return null;
    const first = source[i];
    if (first === "'" || first === "\"") {
      const quote = first;
      i += 1;
      let delimiter = "";
      while (i < source.length) {
        const ch = source[i];
        if (ch === "\n" || ch === "\r") return null;
        if (quote === "\"" && ch === "\\" && i + 1 < source.length) {
          delimiter += source[i + 1];
          i += 2;
          continue;
        }
        if (ch === quote) return {
          delimiter,
          end: i + 1,
          quoted: true
        };
        delimiter += ch;
        i += 1;
      }
      return null;
    }
    let delimiter = "";
    while (i < source.length) {
      const ch = source[i];
      if (/\s/.test(ch) || ch === "|" || ch === "&" || ch === ";" || ch === "<" || ch === ">") break;
      delimiter += ch;
      i += 1;
    }
    if (!delimiter) return null;
    return {
      delimiter,
      end: i,
      quoted: false
    };
  };
  const segments = [];
  let buf = "";
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  let emptySegment = false;
  const pendingHeredocs = [];
  let inHeredocBody = false;
  let heredocLine = "";
  const pushPart = () => {
    const trimmed = buf.trim();
    if (trimmed) segments.push(trimmed);
    buf = "";
  };
  const isEscapedInHeredocLine = (line, index) => {
    let slashes = 0;
    for (let i = index - 1; i >= 0 && line[i] === "\\"; i -= 1) slashes += 1;
    return slashes % 2 === 1;
  };
  const hasUnquotedHeredocExpansionToken = (line) => {
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === "`" && !isEscapedInHeredocLine(line, i)) return true;
      if (ch === "$" && !isEscapedInHeredocLine(line, i)) {
        const next = line[i + 1];
        if (next === "(" || next === "{") return true;
      }
    }
    return false;
  };
  for (let i = 0; i < command.length; i += 1) {
    const ch = command[i];
    const next = command[i + 1];
    if (inHeredocBody) {
      if (ch === "\n" || ch === "\r") {
        const current = pendingHeredocs[0];
        if (current) {
          if ((current.stripTabs ? heredocLine.replace(/^\t+/, "") : heredocLine) === current.delimiter) pendingHeredocs.shift();else
          if (!current.quoted && hasUnquotedHeredocExpansionToken(heredocLine)) return {
            ok: false,
            reason: "command substitution in unquoted heredoc",
            segments: []
          };
        }
        heredocLine = "";
        if (pendingHeredocs.length === 0) inHeredocBody = false;
        if (ch === "\r" && next === "\n") i += 1;
      } else heredocLine += ch;
      continue;
    }
    if (escaped) {
      buf += ch;
      escaped = false;
      emptySegment = false;
      continue;
    }
    if (!inSingle && !inDouble && ch === "\\") {
      escaped = true;
      buf += ch;
      emptySegment = false;
      continue;
    }
    if (inSingle) {
      if (ch === "'") inSingle = false;
      buf += ch;
      emptySegment = false;
      continue;
    }
    if (inDouble) {
      if (ch === "\\" && isEscapedLineContinuation(next)) return {
        ok: false,
        reason: "unsupported shell token: newline",
        segments: []
      };
      if (ch === "\\" && isDoubleQuoteEscape(next)) {
        buf += ch;
        buf += next;
        i += 1;
        emptySegment = false;
        continue;
      }
      if (ch === "$" && next === "(") return {
        ok: false,
        reason: "unsupported shell token: $()",
        segments: []
      };
      if (ch === "`") return {
        ok: false,
        reason: "unsupported shell token: `",
        segments: []
      };
      if (ch === "\n" || ch === "\r") return {
        ok: false,
        reason: "unsupported shell token: newline",
        segments: []
      };
      if (ch === "\"") inDouble = false;
      buf += ch;
      emptySegment = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      buf += ch;
      emptySegment = false;
      continue;
    }
    if (ch === "\"") {
      inDouble = true;
      buf += ch;
      emptySegment = false;
      continue;
    }
    if (isShellCommentStart(command, i)) break;
    if ((ch === "\n" || ch === "\r") && pendingHeredocs.length > 0) {
      inHeredocBody = true;
      heredocLine = "";
      if (ch === "\r" && next === "\n") i += 1;
      continue;
    }
    if (ch === "|" && next === "|") return {
      ok: false,
      reason: "unsupported shell token: ||",
      segments: []
    };
    if (ch === "|" && next === "&") return {
      ok: false,
      reason: "unsupported shell token: |&",
      segments: []
    };
    if (ch === "|") {
      emptySegment = true;
      pushPart();
      continue;
    }
    if (ch === "&" || ch === ";") return {
      ok: false,
      reason: `unsupported shell token: ${ch}`,
      segments: []
    };
    if (ch === "<" && next === "<") {
      buf += "<<";
      emptySegment = false;
      i += 1;
      let scanIndex = i + 1;
      let stripTabs = false;
      if (command[scanIndex] === "-") {
        stripTabs = true;
        buf += "-";
        scanIndex += 1;
      }
      const parsed = parseHeredocDelimiter(command, scanIndex);
      if (parsed) {
        pendingHeredocs.push({
          delimiter: parsed.delimiter,
          stripTabs,
          quoted: parsed.quoted
        });
        buf += command.slice(scanIndex, parsed.end);
        i = parsed.end - 1;
      }
      continue;
    }
    if (DISALLOWED_PIPELINE_TOKENS.has(ch)) return {
      ok: false,
      reason: `unsupported shell token: ${ch}`,
      segments: []
    };
    if (ch === "$" && next === "(") return {
      ok: false,
      reason: "unsupported shell token: $()",
      segments: []
    };
    buf += ch;
    emptySegment = false;
  }
  if (inHeredocBody && pendingHeredocs.length > 0) {
    const current = pendingHeredocs[0];
    if ((current.stripTabs ? heredocLine.replace(/^\t+/, "") : heredocLine) === current.delimiter) {
      pendingHeredocs.shift();
      if (pendingHeredocs.length === 0) inHeredocBody = false;
    }
  }
  if (pendingHeredocs.length > 0 || inHeredocBody) return {
    ok: false,
    reason: "unterminated heredoc",
    segments: []
  };
  if (escaped || inSingle || inDouble) return {
    ok: false,
    reason: "unterminated shell quote/escape",
    segments: []
  };
  pushPart();
  if (emptySegment || segments.length === 0) return {
    ok: false,
    reason: segments.length === 0 ? "empty command" : "empty pipeline segment",
    segments: []
  };
  return {
    ok: true,
    segments
  };
}
const WINDOWS_ALWAYS_UNSAFE_TOKENS = new Set([
"\n",
"\r",
"%",
"`"]
);
function findWindowsUnsupportedToken(command) {
  let inDouble = false;
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (ch === "\"") {
      inDouble = !inDouble;
      continue;
    }
    if (ch === "$") {
      const next = command[i + 1];
      if (next !== void 0 && /[A-Za-z_{(?$]/.test(next)) return "$";
      continue;
    }
    if (WINDOWS_UNSUPPORTED_TOKENS.has(ch)) {
      if (inDouble && !WINDOWS_ALWAYS_UNSAFE_TOKENS.has(ch)) continue;
      if (ch === "\n" || ch === "\r") return "newline";
      return ch;
    }
  }
  return null;
}
function tokenizeWindowsSegment(segment) {
  const tokens = [];
  let buf = "";
  let inDouble = false;
  let inSingle = false;
  let wasQuoted = false;
  const pushToken = () => {
    if (buf.length > 0 || wasQuoted) {
      tokens.push(buf);
      buf = "";
    }
    wasQuoted = false;
  };
  for (let i = 0; i < segment.length; i += 1) {
    const ch = segment[i];
    if (ch === "\"" && !inSingle) {
      if (!inDouble) wasQuoted = true;
      inDouble = !inDouble;
      continue;
    }
    if (ch === "'" && !inDouble) {
      if (inSingle && segment[i + 1] === "'") {
        buf += "'";
        i += 1;
        continue;
      }
      if (!inSingle) wasQuoted = true;
      inSingle = !inSingle;
      continue;
    }
    if (!inDouble && !inSingle && /\s/.test(ch)) {
      pushToken();
      continue;
    }
    buf += ch;
  }
  if (inDouble || inSingle) return null;
  pushToken();
  return tokens.length > 0 ? tokens : null;
}
/**
* Recursively strip transparent Windows shell wrappers from a command string.
*
* LLMs generate commands with arbitrary nesting of shell wrappers:
*   powershell -NoProfile -Command "& node 'C:\path' --count 3"
*   cmd /c "node C:\path --count 3"
*   & node C:\path --count 3
*
* All of these should resolve to: node C:\path --count 3
*
* Recognised wrappers (applied repeatedly until stable):
*   - PowerShell call-operator: `& exe args`
*   - cmd.exe pass-through:    `cmd /c "..."` or `cmd /c ...`
*   - PowerShell invocation:   `powershell [-flags] -Command "..."`
*/
function stripWindowsShellWrapper(command) {
  const MAX_DEPTH = 5;
  let result = command;
  for (let i = 0; i < MAX_DEPTH; i++) {
    const prev = result;
    result = stripWindowsShellWrapperOnce(result.trim());
    if (result === prev) break;
  }
  return result;
}
function stripWindowsShellWrapperOnce(command) {
  const psCallMatch = command.match(/^&\s+(.+)$/s);
  if (psCallMatch) return psCallMatch[1];
  const psFlags = /(?:-(?!c(?:ommand)?\b|-command\b)\w+(?:\s+(?!-)(?:"[^"]*(?:""[^"]*)*"|'[^']*(?:''[^']*)*'|\S+))?\s+)*/i.source;
  const psCommandFlag = `(?:-command|-c|--command)`;
  const psInvokeMatch = command.match(new RegExp(`^(?:powershell|pwsh)(?:\\.exe)?\\s+${psFlags}${psCommandFlag}\\s+"(.+)"$`, "is"));
  if (psInvokeMatch) return psInvokeMatch[1].replace(/""/g, "\"");
  const psInvokeSingleQuote = command.match(new RegExp(`^(?:powershell|pwsh)(?:\\.exe)?\\s+${psFlags}${psCommandFlag}\\s+'(.+)'$`, "is"));
  if (psInvokeSingleQuote) return psInvokeSingleQuote[1].replace(/''/g, "'");
  const psInvokeNoQuote = command.match(new RegExp(`^(?:powershell|pwsh)(?:\\.exe)?\\s+${psFlags}${psCommandFlag}\\s+(.+)$`, "is"));
  if (psInvokeNoQuote) return psInvokeNoQuote[1];
  return command;
}
function analyzeWindowsShellCommand(params) {
  const effective = stripWindowsShellWrapper(params.command.trim());
  const unsupported = findWindowsUnsupportedToken(effective);
  if (unsupported) return {
    ok: false,
    reason: `unsupported windows shell token: ${unsupported}`,
    segments: []
  };
  const argv = tokenizeWindowsSegment(effective);
  if (!argv || argv.length === 0) return {
    ok: false,
    reason: "unable to parse windows command",
    segments: []
  };
  return {
    ok: true,
    segments: [{
      raw: params.command,
      argv,
      resolution: (0, _execSafeBinTrustBcrCYHRC.p)(argv, params.cwd, params.env)
    }]
  };
}
function isWindowsPlatform(platform) {
  return (0, _stringCoerceBUSzWgUA.i)(platform).startsWith("win");
}
function parseSegmentsFromParts(parts, cwd, env) {
  const segments = [];
  for (const raw of parts) {
    const argv = (0, _shellArgvDluwKu9O.t)(raw);
    if (!argv || argv.length === 0) return null;
    segments.push({
      raw,
      argv,
      resolution: (0, _execSafeBinTrustBcrCYHRC.p)(argv, cwd, env)
    });
  }
  return segments;
}
/**
* Splits a command string by chain operators (&&, ||, ;) while preserving the operators.
* Returns null when no chain is present or when the chain is malformed.
*/
function splitCommandChainWithOperators(command) {
  const parts = [];
  let buf = "";
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  let foundChain = false;
  let invalidChain = false;
  const pushPart = (opToNext) => {
    const trimmed = buf.trim();
    buf = "";
    if (!trimmed) return false;
    parts.push({
      part: trimmed,
      opToNext
    });
    return true;
  };
  for (let i = 0; i < command.length; i += 1) {
    const ch = command[i];
    const next = command[i + 1];
    if (escaped) {
      buf += ch;
      escaped = false;
      continue;
    }
    if (!inSingle && !inDouble && ch === "\\") {
      escaped = true;
      buf += ch;
      continue;
    }
    if (inSingle) {
      if (ch === "'") inSingle = false;
      buf += ch;
      continue;
    }
    if (inDouble) {
      if (ch === "\\" && isEscapedLineContinuation(next)) {
        invalidChain = true;
        break;
      }
      if (ch === "\\" && isDoubleQuoteEscape(next)) {
        buf += ch;
        buf += next;
        i += 1;
        continue;
      }
      if (ch === "\"") inDouble = false;
      buf += ch;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      buf += ch;
      continue;
    }
    if (ch === "\"") {
      inDouble = true;
      buf += ch;
      continue;
    }
    if (isShellCommentStart(command, i)) break;
    if (ch === "&" && next === "&") {
      if (!pushPart("&&")) invalidChain = true;
      i += 1;
      foundChain = true;
      continue;
    }
    if (ch === "|" && next === "|") {
      if (!pushPart("||")) invalidChain = true;
      i += 1;
      foundChain = true;
      continue;
    }
    if (ch === ";") {
      if (!pushPart(";")) invalidChain = true;
      foundChain = true;
      continue;
    }
    buf += ch;
  }
  if (!foundChain) return null;
  const trimmed = buf.trim();
  if (!trimmed) return null;
  parts.push({
    part: trimmed,
    opToNext: null
  });
  if (invalidChain || parts.length === 0) return null;
  return parts;
}
function shellEscapeSingleArg(value) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}
const WINDOWS_UNSAFE_CMD_META = /[%`]|\$(?=[A-Za-z_{(?$])/;
function windowsEscapeArg(value) {
  if (value === "") return {
    ok: true,
    escaped: "\"\""
  };
  if (WINDOWS_UNSAFE_CMD_META.test(value)) return { ok: false };
  if (/^[a-zA-Z0-9_./:~\\=-]+$/.test(value)) return {
    ok: true,
    escaped: value
  };
  return {
    ok: true,
    escaped: `"${value.replace(/"/g, "\"\"")}"`
  };
}
function rebuildWindowsShellCommandFromSource(params) {
  const source = stripWindowsShellWrapper(params.command.trim());
  if (!source) return {
    ok: false,
    reason: "empty command"
  };
  const unsupported = findWindowsUnsupportedToken(source);
  if (unsupported) return {
    ok: false,
    reason: `unsupported windows shell token: ${unsupported}`
  };
  const rendered = params.renderSegment(source, 0);
  if (!rendered.ok) return {
    ok: false,
    reason: rendered.reason
  };
  return {
    ok: true,
    command: `& ${rendered.rendered}`,
    segmentCount: 1
  };
}
function rebuildShellCommandFromSource(params) {
  if (isWindowsPlatform(params.platform ?? null)) return rebuildWindowsShellCommandFromSource(params);
  const source = params.command.trim();
  if (!source) return {
    ok: false,
    reason: "empty command"
  };
  const chainParts = splitCommandChainWithOperators(source) ?? [{
    part: source,
    opToNext: null
  }];
  let segmentCount = 0;
  let out = "";
  for (const part of chainParts) {
    const pipelineSplit = splitShellPipeline(part.part);
    if (!pipelineSplit.ok) return {
      ok: false,
      reason: pipelineSplit.reason ?? "unable to parse pipeline"
    };
    const renderedSegments = [];
    for (const segmentRaw of pipelineSplit.segments) {
      const rendered = params.renderSegment(segmentRaw, segmentCount);
      if (!rendered.ok) return {
        ok: false,
        reason: rendered.reason
      };
      renderedSegments.push(rendered.rendered);
      segmentCount += 1;
    }
    out += renderedSegments.join(" | ");
    if (part.opToNext) out += ` ${part.opToNext} `;
  }
  return {
    ok: true,
    command: out,
    segmentCount
  };
}
/**
* Builds a shell command string that preserves pipes/chaining, but forces *arguments* to be
* literal (no globbing, no env-var expansion) by single-quoting every argv token.
*
* Used to make "safe bins" actually stdin-only even though execution happens via `shell -c`.
*/
function buildSafeShellCommand(params) {
  const isWindows = isWindowsPlatform(params.platform);
  return finalizeRebuiltShellCommand(rebuildShellCommandFromSource({
    command: params.command,
    platform: params.platform,
    renderSegment: (segmentRaw) => {
      const argv = isWindows ? tokenizeWindowsSegment(segmentRaw) ?? [] : (0, _shellArgvDluwKu9O.t)(segmentRaw) ?? [];
      if (argv.length === 0) return {
        ok: false,
        reason: "unable to parse shell segment"
      };
      if (isWindows) return renderWindowsQuotedArgv(argv);
      return {
        ok: true,
        rendered: argv.map((token) => shellEscapeSingleArg(token)).join(" ")
      };
    }
  }));
}
function renderWindowsQuotedArgv(argv) {
  const parts = [];
  for (const token of argv) {
    const result = windowsEscapeArg(token);
    if (!result.ok) return {
      ok: false,
      reason: `unsafe windows token: ${token}`
    };
    parts.push(result.escaped);
  }
  return {
    ok: true,
    rendered: parts.join(" ")
  };
}
function renderQuotedArgv(argv, platform) {
  if (isWindowsPlatform(platform)) {
    const result = renderWindowsQuotedArgv(argv);
    return result.ok ? result.rendered : null;
  }
  return argv.map((token) => shellEscapeSingleArg(token)).join(" ");
}
function finalizeRebuiltShellCommand(rebuilt, expectedSegmentCount) {
  if (!rebuilt.ok) return {
    ok: false,
    reason: rebuilt.reason
  };
  if (typeof expectedSegmentCount === "number" && rebuilt.segmentCount !== expectedSegmentCount) return {
    ok: false,
    reason: "segment count mismatch"
  };
  return {
    ok: true,
    command: rebuilt.command
  };
}
function resolvePlannedSegmentArgv(segment) {
  if (segment.resolution?.policyBlocked === true) return null;
  const baseArgv = segment.resolution?.effectiveArgv && segment.resolution.effectiveArgv.length > 0 ? segment.resolution.effectiveArgv : segment.argv;
  if (baseArgv.length === 0) return null;
  const argv = [...baseArgv];
  const execution = segment.resolution?.execution;
  const resolvedExecutable = execution?.resolvedRealPath?.trim() ?? execution?.resolvedPath?.trim() ?? "";
  if (resolvedExecutable) argv[0] = resolvedExecutable;
  return argv;
}
function renderSafeBinSegmentArgv(segment, platform) {
  const argv = resolvePlannedSegmentArgv(segment);
  if (!argv || argv.length === 0) return null;
  return renderQuotedArgv(argv, platform);
}
/**
* Rebuilds a shell command and selectively single-quotes argv tokens for segments that
* must be treated as literal (safeBins hardening) while preserving the rest of the
* shell syntax (pipes + chaining).
*/
function buildSafeBinsShellCommand(params) {
  if (params.segments.length !== params.segmentSatisfiedBy.length) return {
    ok: false,
    reason: "segment metadata mismatch"
  };
  return finalizeRebuiltShellCommand(rebuildShellCommandFromSource({
    command: params.command,
    platform: params.platform,
    renderSegment: (raw, segmentIndex) => {
      const seg = params.segments[segmentIndex];
      const by = params.segmentSatisfiedBy[segmentIndex];
      if (!seg || by === void 0) return {
        ok: false,
        reason: "segment mapping failed"
      };
      if (!(by === "safeBins")) return {
        ok: true,
        rendered: raw.trim()
      };
      const rendered = renderSafeBinSegmentArgv(seg, params.platform);
      if (!rendered) return {
        ok: false,
        reason: "segment execution plan unavailable"
      };
      return {
        ok: true,
        rendered
      };
    }
  }), params.segments.length);
}
function buildEnforcedShellCommand(params) {
  return finalizeRebuiltShellCommand(rebuildShellCommandFromSource({
    command: params.command,
    platform: params.platform,
    renderSegment: (_raw, segmentIndex) => {
      const seg = params.segments[segmentIndex];
      if (!seg) return {
        ok: false,
        reason: "segment mapping failed"
      };
      const argv = resolvePlannedSegmentArgv(seg);
      if (!argv) return {
        ok: false,
        reason: "segment execution plan unavailable"
      };
      const rendered = renderQuotedArgv(argv, params.platform);
      if (!rendered) return {
        ok: false,
        reason: "unsafe windows token in argv"
      };
      return {
        ok: true,
        rendered
      };
    }
  }), params.segments.length);
}
/**
* Splits a command string by chain operators (&&, ||, ;) while respecting quotes.
* Returns null when no chain is present or when the chain is malformed.
*/
function splitCommandChain(command) {
  const parts = splitCommandChainWithOperators(command);
  if (!parts) return null;
  return parts.map((p) => p.part);
}
function analyzeShellCommand(params) {
  if (isWindowsPlatform(params.platform)) return analyzeWindowsShellCommand(params);
  const chainParts = splitCommandChain(params.command);
  if (chainParts) {
    const chains = [];
    const allSegments = [];
    for (const part of chainParts) {
      const pipelineSplit = splitShellPipeline(part);
      if (!pipelineSplit.ok) return {
        ok: false,
        reason: pipelineSplit.reason,
        segments: []
      };
      const segments = parseSegmentsFromParts(pipelineSplit.segments, params.cwd, params.env);
      if (!segments) return {
        ok: false,
        reason: "unable to parse shell segment",
        segments: []
      };
      chains.push(segments);
      allSegments.push(...segments);
    }
    return {
      ok: true,
      segments: allSegments,
      chains
    };
  }
  const split = splitShellPipeline(params.command);
  if (!split.ok) return {
    ok: false,
    reason: split.reason,
    segments: []
  };
  const segments = parseSegmentsFromParts(split.segments, params.cwd, params.env);
  if (!segments) return {
    ok: false,
    reason: "unable to parse shell segment",
    segments: []
  };
  return {
    ok: true,
    segments
  };
}
function analyzeArgvCommand(params) {
  const argv = params.argv.filter((entry) => entry.trim().length > 0);
  if (argv.length === 0) return {
    ok: false,
    reason: "empty argv",
    segments: []
  };
  return {
    ok: true,
    segments: [{
      raw: argv.join(" "),
      argv,
      resolution: (0, _execSafeBinTrustBcrCYHRC.p)(argv, params.cwd, params.env)
    }]
  };
}
//#endregion
//#region src/infra/exec-inline-eval.ts
const FLAG_INTERPRETER_INLINE_EVAL_SPECS = [
{
  names: [
  "python",
  "python2",
  "python3",
  "pypy",
  "pypy3"],

  exactFlags: new Set(["-c"])
},
{
  names: [
  "node",
  "nodejs",
  "bun",
  "deno"],

  exactFlags: new Set([
  "-e",
  "--eval",
  "-p",
  "--print"]
  )
},
{
  names: [
  "awk",
  "gawk",
  "mawk",
  "nawk"],

  exactFlags: new Set(["-e", "--source"]),
  prefixFlags: [{
    label: "--source",
    prefix: "--source="
  }]
},
{
  names: ["ruby"],
  exactFlags: new Set(["-e"])
},
{
  names: ["perl"],
  exactFlags: new Set(["-e", "-E"])
},
{
  names: ["php"],
  exactFlags: new Set(["-r"])
},
{
  names: ["lua"],
  exactFlags: new Set(["-e"])
},
{
  names: ["osascript"],
  exactFlags: new Set(["-e"])
},
{
  names: ["find"],
  exactFlags: new Set([
  "-exec",
  "-execdir",
  "-ok",
  "-okdir"]
  ),
  scanPastDoubleDash: true
},
{
  names: ["make", "gmake"],
  exactFlags: new Set([
  "-f",
  "--file",
  "--makefile",
  "--eval"]
  ),
  rawExactFlags: new Map([["-E", "-E"]]),
  rawPrefixFlags: [{
    label: "-E",
    prefix: "-E"
  }],
  prefixFlags: [
  {
    label: "-f",
    prefix: "-f"
  },
  {
    label: "--file",
    prefix: "--file="
  },
  {
    label: "--makefile",
    prefix: "--makefile="
  },
  {
    label: "--eval",
    prefix: "--eval="
  }]

},
{
  names: ["sed", "gsed"],
  exactFlags: /* @__PURE__ */new Set(),
  rawExactFlags: new Map([["-e", "-e"]]),
  rawPrefixFlags: [{
    label: "-e",
    prefix: "-e"
  }]
}];

const POSITIONAL_INTERPRETER_INLINE_EVAL_SPECS = [
{
  names: [
  "awk",
  "gawk",
  "mawk",
  "nawk"],

  fileFlags: new Set(["-f", "--file"]),
  fileFlagPrefixes: ["-f", "--file="],
  exactValueFlags: new Set([
  "-f",
  "--file",
  "-F",
  "--field-separator",
  "-v",
  "--assign",
  "-i",
  "--include",
  "-l",
  "--load",
  "-W"]
  ),
  prefixValueFlags: [
  "-F",
  "--field-separator=",
  "-v",
  "--assign=",
  "--include=",
  "--load="],

  flag: "<program>"
},
{
  names: ["xargs"],
  exactValueFlags: new Set([
  "-a",
  "--arg-file",
  "-d",
  "--delimiter",
  "-E",
  "-I",
  "-L",
  "--max-lines",
  "-n",
  "--max-args",
  "-P",
  "--max-procs",
  "-s",
  "--max-chars"]
  ),
  exactOptionalValueFlags: new Set(["--eof", "--replace"]),
  prefixValueFlags: [
  "-a",
  "--arg-file=",
  "-d",
  "--delimiter=",
  "-E",
  "--eof=",
  "-I",
  "--replace=",
  "-i",
  "-L",
  "--max-lines=",
  "-l",
  "-n",
  "--max-args=",
  "-P",
  "--max-procs=",
  "-s",
  "--max-chars="],

  flag: "<command>"
},
{
  names: ["sed", "gsed"],
  fileFlags: new Set(["-f", "--file"]),
  fileFlagPrefixes: ["-f", "--file="],
  exactValueFlags: new Set([
  "-f",
  "--file",
  "-l",
  "--line-length"]
  ),
  exactOptionalValueFlags: new Set(["-i", "--in-place"]),
  prefixValueFlags: [
  "-f",
  "--file=",
  "--in-place=",
  "--line-length="],

  flag: "<program>"
}];

const INTERPRETER_ALLOWLIST_NAMES = new Set(FLAG_INTERPRETER_INLINE_EVAL_SPECS.flatMap((entry) => entry.names).concat(POSITIONAL_INTERPRETER_INLINE_EVAL_SPECS.flatMap((entry) => entry.names)));
function findInterpreterSpec(executable) {
  const normalized = (0, _execSafeBinTrustBcrCYHRC.R)(executable);
  for (const spec of FLAG_INTERPRETER_INLINE_EVAL_SPECS) if (spec.names.includes(normalized)) return spec;
  return null;
}
function findPositionalInterpreterSpec(executable) {
  const normalized = (0, _execSafeBinTrustBcrCYHRC.R)(executable);
  for (const spec of POSITIONAL_INTERPRETER_INLINE_EVAL_SPECS) if (spec.names.includes(normalized)) return spec;
  return null;
}
function createInlineEvalHit(executable, argv, flag) {
  return {
    executable,
    normalizedExecutable: (0, _execSafeBinTrustBcrCYHRC.R)(executable),
    flag,
    argv
  };
}
function detectInterpreterInlineEvalArgv(argv) {
  if (!Array.isArray(argv) || argv.length === 0) return null;
  const executable = argv[0]?.trim();
  if (!executable) return null;
  const spec = findInterpreterSpec(executable);
  if (spec) for (let idx = 1; idx < argv.length; idx += 1) {
    const token = argv[idx]?.trim();
    if (!token) continue;
    if (token === "--") {
      if (spec.scanPastDoubleDash) continue;
      break;
    }
    const rawExactFlag = spec.rawExactFlags?.get(token);
    if (rawExactFlag) return createInlineEvalHit(executable, argv, rawExactFlag);
    const rawPrefixFlag = spec.rawPrefixFlags?.find(({ prefix }) => token.startsWith(prefix) && token.length > prefix.length);
    if (rawPrefixFlag) return createInlineEvalHit(executable, argv, rawPrefixFlag.label);
    const lower = (0, _stringCoerceBUSzWgUA.i)(token);
    if (spec.exactFlags.has(lower)) return createInlineEvalHit(executable, argv, lower);
    const prefixFlag = spec.prefixFlags?.find(({ prefix }) => lower.startsWith(prefix) && lower.length > prefix.length);
    if (prefixFlag) return createInlineEvalHit(executable, argv, prefixFlag.label);
  }
  const positionalSpec = findPositionalInterpreterSpec(executable);
  if (!positionalSpec) return null;
  for (let idx = 1; idx < argv.length; idx += 1) {
    const token = argv[idx]?.trim();
    if (!token) continue;
    if (token === "--") {
      if (!argv[idx + 1]?.trim()) return null;
      return createInlineEvalHit(executable, argv, positionalSpec.flag);
    }
    if (positionalSpec.fileFlags?.has(token)) return null;
    if (positionalSpec.fileFlagPrefixes?.some((prefix) => token.startsWith(prefix) && token.length > prefix.length)) return null;
    if (positionalSpec.exactValueFlags?.has(token)) {
      idx += 1;
      continue;
    }
    if (positionalSpec.exactOptionalValueFlags?.has(token)) continue;
    if (positionalSpec.prefixValueFlags?.some((prefix) => token.startsWith(prefix) && token.length > prefix.length)) continue;
    if (token.startsWith("-")) continue;
    return createInlineEvalHit(executable, argv, positionalSpec.flag);
  }
  return null;
}
function describeInterpreterInlineEval(hit) {
  if (hit.flag === "<command>") return `${hit.normalizedExecutable} inline command`;
  if (hit.flag === "<program>") return `${hit.normalizedExecutable} inline program`;
  return `${hit.normalizedExecutable} ${hit.flag}`;
}
function isInterpreterLikeAllowlistPattern(pattern) {
  const trimmed = (0, _stringCoerceBUSzWgUA.i)(pattern);
  if (!trimmed) return false;
  const normalized = (0, _execSafeBinTrustBcrCYHRC.R)(trimmed);
  if (INTERPRETER_ALLOWLIST_NAMES.has(normalized)) return true;
  const basename = trimmed.replace(/\\/g, "/").split("/").pop() ?? trimmed;
  const strippedWildcards = (basename.endsWith(".exe") ? basename.slice(0, -4) : basename).replace(/[*?[\]{}()]/g, "");
  return INTERPRETER_ALLOWLIST_NAMES.has(strippedWildcards);
}
//#endregion
//#region src/infra/exec-approvals-allowlist.ts
function hasShellLineContinuation(command) {
  return /\\(?:\r\n|\n|\r)/.test(command);
}
function normalizeSafeBins(entries) {
  if (!Array.isArray(entries)) return /* @__PURE__ */new Set();
  const normalized = entries.map((entry) => (0, _stringCoerceBUSzWgUA.i)(entry)).filter((entry) => entry.length > 0);
  return new Set(normalized);
}
function resolveSafeBins(entries) {
  if (entries === void 0) return normalizeSafeBins(_execSafeBinTrustBcrCYHRC.z);
  return normalizeSafeBins(entries ?? []);
}
function isSafeBinUsage(params) {
  if (isWindowsPlatform(params.platform ?? process.platform)) return false;
  if (params.safeBins.size === 0) return false;
  const resolution = params.resolution;
  const execName = (0, _stringCoerceBUSzWgUA.o)(resolution?.executableName);
  if (!execName) return false;
  if (!params.safeBins.has(execName)) return false;
  if (!resolution?.resolvedPath) return false;
  if (!(params.isTrustedSafeBinPathFn ?? _execSafeBinTrustBcrCYHRC.n)({
    resolvedPath: resolution.resolvedPath,
    trustedDirs: params.trustedSafeBinDirs
  })) return false;
  const argv = params.argv.slice(1);
  const profile = (params.safeBinProfiles ?? _execSafeBinTrustBcrCYHRC.B)[execName];
  if (!profile) return false;
  return (0, _execSafeBinTrustBcrCYHRC.a)(argv, profile, { binName: execName });
}
function isPathScopedExecutableToken(token) {
  return token.includes("/") || token.includes("\\");
}
function pickExecAllowlistContext(params) {
  return {
    allowlist: params.allowlist,
    safeBins: params.safeBins,
    safeBinProfiles: params.safeBinProfiles,
    cwd: params.cwd,
    env: params.env,
    platform: params.platform,
    trustedSafeBinDirs: params.trustedSafeBinDirs,
    skillBins: params.skillBins,
    autoAllowSkills: params.autoAllowSkills
  };
}
function normalizeSkillBinName(value) {
  const trimmed = (0, _stringCoerceBUSzWgUA.o)(value);
  return trimmed && trimmed.length > 0 ? trimmed : null;
}
function normalizeSkillBinResolvedPath(value) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(value);
  if (!trimmed) return null;
  const resolved = _nodePath.default.resolve(trimmed);
  if (process.platform === "win32") return (0, _stringCoerceBUSzWgUA.i)(resolved.replace(/\\/g, "/"));
  return resolved;
}
function buildSkillBinTrustIndex(entries) {
  const trustByName = /* @__PURE__ */new Map();
  if (!entries || entries.length === 0) return trustByName;
  for (const entry of entries) {
    const name = normalizeSkillBinName(entry.name);
    const resolvedPath = normalizeSkillBinResolvedPath(entry.resolvedPath);
    if (!name || !resolvedPath) continue;
    const paths = trustByName.get(name) ?? /* @__PURE__ */new Set();
    paths.add(resolvedPath);
    trustByName.set(name, paths);
  }
  return trustByName;
}
function isSkillAutoAllowedSegment(params) {
  if (!params.allowSkills) return false;
  const resolution = params.segment.resolution;
  const execution = (0, _execSafeBinTrustBcrCYHRC.h)(resolution);
  if (!execution?.resolvedPath) return false;
  const rawExecutable = execution.rawExecutable?.trim() ?? "";
  if (!rawExecutable || isPathScopedExecutableToken(rawExecutable)) return false;
  const executableName = normalizeSkillBinName(execution.executableName);
  const resolvedPath = normalizeSkillBinResolvedPath(execution.resolvedPath);
  if (!executableName || !resolvedPath) return false;
  return Boolean(params.skillBinTrust.get(executableName)?.has(resolvedPath));
}
function resolveSkillPreludePath(rawPath, cwd) {
  const expanded = rawPath.startsWith("~") ? (0, _homeDirBEqRdfoa.t)(rawPath) : rawPath;
  if (_nodePath.default.isAbsolute(expanded)) return _nodePath.default.resolve(expanded);
  return _nodePath.default.resolve(cwd?.trim() || process.cwd(), expanded);
}
function isSkillMarkdownPreludePath(filePath) {
  const lowerNormalized = (0, _stringCoerceBUSzWgUA.i)(filePath.replace(/\\/g, "/"));
  if (!lowerNormalized.endsWith("/skill.md")) return false;
  const parts = lowerNormalized.split("/").filter(Boolean);
  if (parts.length < 2) return false;
  for (let index = parts.length - 2; index >= 0; index -= 1) {
    if (parts[index] !== "skills") continue;
    const segmentsAfterSkills = parts.length - index - 1;
    if (segmentsAfterSkills === 1 || segmentsAfterSkills === 2) return true;
  }
  return false;
}
function resolveSkillMarkdownPreludeId(filePath) {
  const lowerNormalized = (0, _stringCoerceBUSzWgUA.i)(filePath.replace(/\\/g, "/"));
  if (!lowerNormalized.endsWith("/skill.md")) return null;
  const parts = lowerNormalized.split("/").filter(Boolean);
  if (parts.length < 3) return null;
  for (let index = parts.length - 2; index >= 0; index -= 1) {
    if (parts[index] !== "skills") continue;
    if (parts.length - index - 1 !== 2) continue;
    return parts[index + 1]?.trim() || null;
  }
  return null;
}
function isSkillPreludeReadSegment(segment, cwd) {
  if ((0, _stringCoerceBUSzWgUA.i)((0, _execSafeBinTrustBcrCYHRC.h)(segment.resolution)?.executableName) !== "cat") return false;
  if (segment.argv.length !== 2) return false;
  const rawPath = segment.argv[1]?.trim();
  if (!rawPath) return false;
  return isSkillMarkdownPreludePath(resolveSkillPreludePath(rawPath, cwd));
}
function isSkillPreludeMarkerSegment(segment) {
  if ((0, _stringCoerceBUSzWgUA.i)((0, _execSafeBinTrustBcrCYHRC.h)(segment.resolution)?.executableName) !== "printf") return false;
  if (segment.argv.length !== 2) return false;
  const marker = segment.argv[1];
  return marker === "\\n---CMD---\\n" || marker === "\n---CMD---\n";
}
function isSkillPreludeSegment(segment, cwd) {
  return isSkillPreludeReadSegment(segment, cwd) || isSkillPreludeMarkerSegment(segment);
}
function isSkillPreludeOnlyEvaluation(segments, cwd) {
  return segments.length > 0 && segments.every((segment) => isSkillPreludeSegment(segment, cwd));
}
function resolveSkillPreludeIds(segments, cwd) {
  const skillIds = /* @__PURE__ */new Set();
  for (const segment of segments) {
    if (!isSkillPreludeReadSegment(segment, cwd)) continue;
    const rawPath = segment.argv[1]?.trim();
    if (!rawPath) continue;
    const skillId = resolveSkillMarkdownPreludeId(resolveSkillPreludePath(rawPath, cwd));
    if (skillId) skillIds.add(skillId);
  }
  return skillIds;
}
function resolveAllowlistedSkillWrapperId(segment) {
  const executableName = (0, _execSafeBinTrustBcrCYHRC.R)((0, _execSafeBinTrustBcrCYHRC.h)(segment.resolution)?.executableName ?? segment.argv[0] ?? "");
  if (!executableName.endsWith("-wrapper")) return null;
  return executableName.slice(0, -8).trim() || null;
}
function resolveTrustedSkillExecutionIds(params) {
  const skillIds = /* @__PURE__ */new Set();
  if (!params.evaluation.allowlistSatisfied) return skillIds;
  for (const [index, segment] of params.analysis.segments.entries()) {
    const satisfiedBy = params.evaluation.segmentSatisfiedBy[index];
    if (satisfiedBy === "skills") {
      const execution = (0, _execSafeBinTrustBcrCYHRC.h)(segment.resolution);
      const executableName = (0, _execSafeBinTrustBcrCYHRC.R)(execution?.executableName ?? execution?.rawExecutable ?? segment.argv[0] ?? "");
      if (executableName) skillIds.add(executableName);
      continue;
    }
    if (satisfiedBy !== "allowlist") continue;
    const wrapperSkillId = resolveAllowlistedSkillWrapperId(segment);
    if (wrapperSkillId) skillIds.add(wrapperSkillId);
  }
  return skillIds;
}
const MAX_SHELL_WRAPPER_INLINE_EVAL_DEPTH = 3;
function resolveShellWrapperScriptArgv(params) {
  const scriptBase = (0, _stringCoerceBUSzWgUA.i)(_nodePath.default.basename(params.shellScriptCandidatePath));
  const cwdBase = params.cwd && params.cwd.trim() ? params.cwd.trim() : process.cwd();
  const resolveArgPath = (a) => _nodePath.default.isAbsolute(a) ? a : _nodePath.default.resolve(cwdBase, a);
  let idx = params.effectiveArgv.findIndex((a) => resolveArgPath(a) === params.shellScriptCandidatePath);
  if (idx === -1) idx = params.effectiveArgv.findIndex((a) => (0, _stringCoerceBUSzWgUA.i)(_nodePath.default.basename(a)) === scriptBase);
  const scriptArgs = idx !== -1 ? params.effectiveArgv.slice(idx + 1) : [];
  return [params.shellScriptCandidatePath, ...scriptArgs];
}
function resolveSegmentAllowlistMatch(params) {
  const effectiveArgv = params.segment.resolution?.effectiveArgv && params.segment.resolution.effectiveArgv.length > 0 ? params.segment.resolution.effectiveArgv : params.segment.argv;
  const allowlistSegment = effectiveArgv === params.segment.argv ? params.segment : {
    ...params.segment,
    argv: effectiveArgv
  };
  const executableResolution = (0, _execSafeBinTrustBcrCYHRC.v)(params.segment.resolution);
  const candidatePath = (0, _execSafeBinTrustBcrCYHRC._)(params.segment.resolution, params.context.cwd);
  const candidateResolution = candidatePath && executableResolution ? {
    ...executableResolution,
    resolvedPath: candidatePath
  } : executableResolution;
  const inlineCommand = (0, _execSafeBinTrustBcrCYHRC.T)(allowlistSegment.argv);
  const executableMatch = inlineCommand !== null && isDirectShellPositionalCarrierInvocation(inlineCommand) ? null : (0, _execSafeBinTrustBcrCYHRC.c)(params.context.allowlist, candidateResolution, effectiveArgv, params.context.platform);
  const shellPositionalArgvCandidatePath = resolveShellWrapperPositionalArgvCandidatePath({
    segment: allowlistSegment,
    cwd: params.context.cwd,
    env: params.context.env
  });
  const shellPositionalArgvMatch = shellPositionalArgvCandidatePath ? (0, _execSafeBinTrustBcrCYHRC.c)(params.context.allowlist, {
    rawExecutable: shellPositionalArgvCandidatePath,
    resolvedPath: shellPositionalArgvCandidatePath,
    executableName: _nodePath.default.basename(shellPositionalArgvCandidatePath)
  }, void 0, params.context.platform) : null;
  const shellScriptCandidatePath = inlineCommand === null ? resolveShellWrapperScriptCandidatePath({
    segment: allowlistSegment,
    cwd: params.context.cwd
  }) : void 0;
  const shellScriptArgv = shellScriptCandidatePath ? resolveShellWrapperScriptArgv({
    shellScriptCandidatePath,
    effectiveArgv,
    cwd: params.context.cwd
  }) : null;
  const shellScriptMatch = shellScriptCandidatePath && shellScriptArgv ? (0, _execSafeBinTrustBcrCYHRC.c)(params.context.allowlist, {
    rawExecutable: shellScriptCandidatePath,
    resolvedPath: shellScriptCandidatePath,
    executableName: _nodePath.default.basename(shellScriptCandidatePath)
  }, shellScriptArgv, params.context.platform) : null;
  return {
    effectiveArgv,
    inlineCommand,
    match: executableMatch ?? shellPositionalArgvMatch ?? shellScriptMatch
  };
}
function resolveSegmentSatisfaction(params) {
  if (params.match) return "allowlist";
  if (isSafeBinUsage({
    argv: params.effectiveArgv,
    resolution: (0, _execSafeBinTrustBcrCYHRC.h)(params.segment.resolution),
    safeBins: params.context.safeBins,
    safeBinProfiles: params.context.safeBinProfiles,
    platform: params.context.platform,
    trustedSafeBinDirs: params.context.trustedSafeBinDirs
  })) return "safeBins";
  return isSkillAutoAllowedSegment({
    segment: params.segment,
    allowSkills: params.allowSkills,
    skillBinTrust: params.skillBinTrust
  }) ? "skills" : null;
}
function resolveInlineChainFallback(params) {
  if (params.by !== null || !params.inlineCommand) return null;
  const inlineChainParts = splitCommandChain(params.inlineCommand);
  if (!inlineChainParts || inlineChainParts.length <= 1) return null;
  return evaluateShellWrapperInlineChain({
    inlineCommand: params.inlineCommand,
    context: params.context,
    inlineDepth: params.inlineDepth + 1,
    precomputedChainParts: inlineChainParts
  });
}
function evaluateShellWrapperInlineChain(params) {
  if (params.inlineDepth >= MAX_SHELL_WRAPPER_INLINE_EVAL_DEPTH) return null;
  if (isWindowsPlatform(params.context.platform)) return null;
  const chainParts = params.precomputedChainParts ?? splitCommandChain(params.inlineCommand);
  if (!chainParts || chainParts.length <= 1) return null;
  const matches = [];
  for (const part of chainParts) {
    const analysis = analyzeShellCommand({
      command: part,
      cwd: params.context.cwd,
      env: params.context.env,
      platform: params.context.platform
    });
    if (!analysis.ok) return null;
    const result = evaluateSegments(analysis.segments, params.context, params.inlineDepth);
    if (!result.satisfied) return null;
    matches.push(...result.matches);
  }
  return {
    matches,
    satisfiedBy: "allowlist"
  };
}
function evaluateSegments(segments, params, inlineDepth = 0) {
  const matches = [];
  const skillBinTrust = buildSkillBinTrustIndex(params.skillBins);
  const allowSkills = params.autoAllowSkills === true && skillBinTrust.size > 0;
  const segmentAllowlistEntries = [];
  const segmentSatisfiedBy = [];
  return {
    satisfied: segments.every((segment) => {
      if (segment.resolution?.policyBlocked === true) {
        segmentAllowlistEntries.push(null);
        segmentSatisfiedBy.push(null);
        return false;
      }
      const { effectiveArgv, inlineCommand, match } = resolveSegmentAllowlistMatch({
        segment,
        context: params
      });
      if (match) matches.push(match);
      segmentAllowlistEntries.push(match ?? null);
      const by = resolveSegmentSatisfaction({
        match,
        segment,
        effectiveArgv,
        context: params,
        allowSkills,
        skillBinTrust
      });
      const inlineResult = resolveInlineChainFallback({
        by,
        inlineCommand,
        context: params,
        inlineDepth
      });
      if (inlineResult) {
        matches.push(...inlineResult.matches);
        segmentSatisfiedBy.push(inlineResult.satisfiedBy);
        return true;
      }
      segmentSatisfiedBy.push(by);
      return Boolean(by);
    }),
    matches,
    segmentAllowlistEntries,
    segmentSatisfiedBy
  };
}
function resolveAnalysisSegmentGroups(analysis) {
  if (analysis.chains) return analysis.chains;
  return [analysis.segments];
}
function evaluateExecAllowlist(params) {
  const allowlistMatches = [];
  const segmentAllowlistEntries = [];
  const segmentSatisfiedBy = [];
  if (!params.analysis.ok || params.analysis.segments.length === 0) return {
    allowlistSatisfied: false,
    allowlistMatches,
    segmentAllowlistEntries,
    segmentSatisfiedBy
  };
  const allowlistContext = pickExecAllowlistContext(params);
  const hasChains = Boolean(params.analysis.chains);
  for (const group of resolveAnalysisSegmentGroups(params.analysis)) {
    const result = evaluateSegments(group, allowlistContext);
    if (!result.satisfied) {
      if (!hasChains) return {
        allowlistSatisfied: false,
        allowlistMatches: result.matches,
        segmentAllowlistEntries: result.segmentAllowlistEntries,
        segmentSatisfiedBy: result.segmentSatisfiedBy
      };
      return {
        allowlistSatisfied: false,
        allowlistMatches: [],
        segmentAllowlistEntries: [],
        segmentSatisfiedBy: []
      };
    }
    allowlistMatches.push(...result.matches);
    segmentAllowlistEntries.push(...result.segmentAllowlistEntries);
    segmentSatisfiedBy.push(...result.segmentSatisfiedBy);
  }
  return {
    allowlistSatisfied: true,
    allowlistMatches,
    segmentAllowlistEntries,
    segmentSatisfiedBy
  };
}
function hasSegmentExecutableMatch(segment, predicate) {
  const execution = (0, _execSafeBinTrustBcrCYHRC.h)(segment.resolution);
  const candidates = [
  execution?.executableName,
  execution?.rawExecutable,
  segment.argv[0]];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    if (predicate(trimmed)) return true;
  }
  return false;
}
function isShellWrapperSegment(segment) {
  return hasSegmentExecutableMatch(segment, _execSafeBinTrustBcrCYHRC.D);
}
const SHELL_WRAPPER_OPTIONS_WITH_VALUE = new Set([
"-c",
"--command",
"-o",
"-O",
"+O"]
);
const SHELL_WRAPPER_DISQUALIFYING_SCRIPT_OPTIONS = [
"--rcfile",
"--init-file",
"--startup-file"];

function hasDisqualifyingShellWrapperScriptOption(token) {
  return SHELL_WRAPPER_DISQUALIFYING_SCRIPT_OPTIONS.some((option) => token === option || token.startsWith(`${option}=`));
}
const POWERSHELL_OPTIONS_WITH_VALUE_RE = /^-(?:executionpolicy|ep|windowstyle|w|workingdirectory|wd|inputformat|outputformat|settingsfile|configurationfile|version|v|psconsolefile|pscf|encodedcommand|en|enc|encodedarguments|ea)$/i;
function resolveShellWrapperScriptCandidatePath(params) {
  if (!isShellWrapperSegment(params.segment)) return;
  const argv = params.segment.argv;
  if (!Array.isArray(argv) || argv.length < 2) return;
  const wrapperName = (0, _execSafeBinTrustBcrCYHRC.R)(argv[0] ?? "");
  const isPowerShell = _execSafeBinTrustBcrCYHRC.C.has(wrapperName);
  let idx = 1;
  while (idx < argv.length) {
    const token = argv[idx]?.trim() ?? "";
    if (!token) {
      idx += 1;
      continue;
    }
    if (token === "--") {
      idx += 1;
      break;
    }
    if (token === "-c" || token === "--command") return;
    if (!isPowerShell && /^-[^-]*c[^-]*$/i.test(token)) return;
    if (token === "-s" || !isPowerShell && /^-[^-]*s[^-]*$/i.test(token)) return;
    if (hasDisqualifyingShellWrapperScriptOption(token)) return;
    if (SHELL_WRAPPER_OPTIONS_WITH_VALUE.has(token)) {
      idx += 2;
      continue;
    }
    if (isPowerShell && POWERSHELL_OPTIONS_WITH_VALUE_RE.test(token)) {
      idx += 2;
      continue;
    }
    if (token.startsWith("-") || token.startsWith("+")) {
      idx += 1;
      continue;
    }
    break;
  }
  const scriptToken = argv[idx]?.trim();
  if (!scriptToken) return;
  if (_nodePath.default.isAbsolute(scriptToken)) return scriptToken;
  const expanded = scriptToken.startsWith("~") ? (0, _homeDirBEqRdfoa.t)(scriptToken) : scriptToken;
  const base = params.cwd && params.cwd.trim().length > 0 ? params.cwd : process.cwd();
  return _nodePath.default.resolve(base, expanded);
}
function resolveShellWrapperPositionalArgvCandidatePath(params) {
  if (!isShellWrapperSegment(params.segment)) return;
  const argv = params.segment.argv;
  if (!Array.isArray(argv) || argv.length < 4) return;
  const wrapper = (0, _execSafeBinTrustBcrCYHRC.R)(argv[0] ?? "");
  if (![
  "ash",
  "bash",
  "dash",
  "fish",
  "ksh",
  "sh",
  "zsh"].
  includes(wrapper)) return;
  const inlineMatch = (0, _execSafeBinTrustBcrCYHRC.N)(argv, _execSafeBinTrustBcrCYHRC.j, { allowCombinedC: true });
  if (inlineMatch.valueTokenIndex === null || !inlineMatch.command) return;
  if (!isDirectShellPositionalCarrierInvocation(inlineMatch.command)) return;
  const carriedExecutable = argv.slice(inlineMatch.valueTokenIndex + 1).map((token) => token.trim()).find((token) => token.length > 0);
  if (!carriedExecutable) return;
  const carriedName = (0, _execSafeBinTrustBcrCYHRC.R)(carriedExecutable);
  if ((0, _execSafeBinTrustBcrCYHRC.F)(carriedName) || (0, _execSafeBinTrustBcrCYHRC.D)(carriedName)) return;
  return (0, _execSafeBinTrustBcrCYHRC.m)((0, _execSafeBinTrustBcrCYHRC.p)([carriedExecutable], params.cwd, params.env), params.cwd);
}
function isDirectShellPositionalCarrierInvocation(command) {
  const trimmed = command.trim();
  if (trimmed.length === 0) return false;
  const shellWhitespace = String.raw`[^\S\r\n]+`;
  const positionalZero = String.raw`(?:\$(?:0|\{0\})|"\$(?:0|\{0\})")`;
  const positionalArg = String.raw`(?:\$(?:[@*]|[1-9]|\{[@*1-9]\})|"\$(?:[@*]|[1-9]|\{[@*1-9]\})")`;
  return new RegExp(`^(?:exec${shellWhitespace}(?:--${shellWhitespace})?)?${positionalZero}(?:${shellWhitespace}${positionalArg})*$`, "u").test(trimmed);
}
function escapeRegExpLiteral(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildScriptArgPatternFromArgv(argv, scriptPath, cwd, platform) {
  if (!isWindowsPlatform(platform ?? process.platform)) return;
  const scriptBase = (0, _stringCoerceBUSzWgUA.i)(_nodePath.default.basename(scriptPath));
  const base = cwd && cwd.trim() ? cwd.trim() : process.cwd();
  const resolveArgPath = (arg) => _nodePath.default.isAbsolute(arg) ? arg : _nodePath.default.resolve(base, arg);
  let scriptIdx = argv.findIndex((arg) => resolveArgPath(arg) === scriptPath);
  if (scriptIdx === -1) scriptIdx = argv.findIndex((arg) => (0, _stringCoerceBUSzWgUA.i)(_nodePath.default.basename(arg)) === scriptBase);
  const normalized = (scriptIdx !== -1 ? argv.slice(scriptIdx + 1) : []).map((a) => a.replace(/\//g, "\\"));
  if (normalized.length === 0) return "^\0\0$";
  return `^${normalized.map(escapeRegExpLiteral).join("\0")}\x00$`;
}
function buildArgPatternFromArgv(argv, platform) {
  if (!isWindowsPlatform(platform ?? process.platform)) return;
  const normalized = argv.slice(1).map((a) => a.replace(/\//g, "\\"));
  if (normalized.length === 0) return "^\0\0$";
  return `^${escapeRegExpLiteral(normalized.join("\0"))}\x00$`;
}
function addAllowAlwaysPattern(out, pattern, argPattern) {
  if (!out.some((p) => p.pattern === pattern && (p.argPattern ?? void 0) === (argPattern ?? void 0))) out.push({
    pattern,
    argPattern
  });
}
function collectAllowAlwaysPatterns(params) {
  if (params.depth >= 3) return;
  const trustPlan = (0, _execSafeBinTrustBcrCYHRC.x)(params.segment.argv);
  if (trustPlan.policyBlocked) return;
  const segment = trustPlan.argv === params.segment.argv ? params.segment : {
    raw: trustPlan.argv.join(" "),
    argv: trustPlan.argv,
    resolution: (0, _execSafeBinTrustBcrCYHRC.p)(trustPlan.argv, params.cwd, params.env)
  };
  const candidatePath = (0, _execSafeBinTrustBcrCYHRC.m)(segment.resolution, params.cwd);
  if (!candidatePath) return;
  if (isInterpreterLikeAllowlistPattern(candidatePath)) {
    const effectiveArgv = segment.resolution?.effectiveArgv ?? segment.argv;
    if (params.strictInlineEval !== true || detectInterpreterInlineEvalArgv(effectiveArgv) !== null) return;
  }
  if (!trustPlan.shellWrapperExecutable) {
    const argPattern = buildArgPatternFromArgv(segment.argv, params.platform);
    addAllowAlwaysPattern(params.out, candidatePath, argPattern);
    return;
  }
  const positionalArgvPath = resolveShellWrapperPositionalArgvCandidatePath({
    segment,
    cwd: params.cwd,
    env: params.env
  });
  if (positionalArgvPath) {
    addAllowAlwaysPattern(params.out, positionalArgvPath);
    return;
  }
  const inlineCommand = _execSafeBinTrustBcrCYHRC.C.has((0, _execSafeBinTrustBcrCYHRC.R)(segment.argv[0] ?? "")) && segment.argv.some((t) => {
    const lower = (0, _stringCoerceBUSzWgUA.i)(t);
    return lower === "-file" || lower === "-f";
  }) && !segment.argv.some((t) => {
    const lower = (0, _stringCoerceBUSzWgUA.i)(t);
    return lower === "-command" || lower === "-c" || lower === "--command";
  }) ? null : trustPlan.shellInlineCommand ?? (0, _execSafeBinTrustBcrCYHRC.T)(segment.argv);
  if (!inlineCommand) {
    const scriptPath = resolveShellWrapperScriptCandidatePath({
      segment,
      cwd: params.cwd
    });
    if (scriptPath) {
      const argPattern = buildScriptArgPatternFromArgv(params.segment.argv, scriptPath, params.cwd, params.platform);
      addAllowAlwaysPattern(params.out, scriptPath, argPattern);
    }
    return;
  }
  const nested = analyzeShellCommand({
    command: inlineCommand,
    cwd: params.cwd,
    env: params.env,
    platform: params.platform
  });
  if (!nested.ok) return;
  for (const nestedSegment of nested.segments) collectAllowAlwaysPatterns({
    segment: nestedSegment,
    cwd: params.cwd,
    env: params.env,
    platform: params.platform,
    strictInlineEval: params.strictInlineEval,
    depth: params.depth + 1,
    out: params.out
  });
}
/**
* Derive persisted allowlist patterns for an "allow always" decision.
* When a command is wrapped in a shell (for example `zsh -lc "<cmd>"`),
* persist the inner executable(s) rather than the shell binary.
*/
function resolveAllowAlwaysPatternEntries(params) {
  const patterns = [];
  for (const segment of params.segments) collectAllowAlwaysPatterns({
    segment,
    cwd: params.cwd,
    env: params.env,
    platform: params.platform,
    strictInlineEval: params.strictInlineEval,
    depth: 0,
    out: patterns
  });
  return patterns;
}
function resolveAllowAlwaysPatterns(params) {
  return resolveAllowAlwaysPatternEntries(params).map((pattern) => pattern.pattern);
}
/**
* Evaluates allowlist for shell commands (including &&, ||, ;) and returns analysis metadata.
*/
function evaluateShellAllowlist(params) {
  const allowlistContext = pickExecAllowlistContext(params);
  const analysisFailure = () => ({
    analysisOk: false,
    allowlistSatisfied: false,
    allowlistMatches: [],
    segments: [],
    segmentAllowlistEntries: [],
    segmentSatisfiedBy: []
  });
  if (hasShellLineContinuation(params.command)) return analysisFailure();
  const chainParts = isWindowsPlatform(params.platform) ? null : splitCommandChainWithOperators(params.command);
  if (!chainParts) {
    const analysis = analyzeShellCommand({
      command: params.command,
      cwd: params.cwd,
      env: params.env,
      platform: params.platform
    });
    if (!analysis.ok) return analysisFailure();
    const evaluation = evaluateExecAllowlist({
      analysis,
      ...allowlistContext
    });
    return {
      analysisOk: true,
      allowlistSatisfied: evaluation.allowlistSatisfied,
      allowlistMatches: evaluation.allowlistMatches,
      segments: analysis.segments,
      segmentAllowlistEntries: evaluation.segmentAllowlistEntries,
      segmentSatisfiedBy: evaluation.segmentSatisfiedBy
    };
  }
  const chainEvaluations = chainParts.map(({ part, opToNext }) => {
    const analysis = analyzeShellCommand({
      command: part,
      cwd: params.cwd,
      env: params.env,
      platform: params.platform
    });
    if (!analysis.ok) return null;
    return {
      analysis,
      evaluation: evaluateExecAllowlist({
        analysis,
        ...allowlistContext
      }),
      opToNext
    };
  });
  if (chainEvaluations.some((entry) => entry === null)) return analysisFailure();
  const finalizedEvaluations = chainEvaluations;
  const allowSkillPreludeAtIndex = /* @__PURE__ */new Set();
  const reachableSkillIds = /* @__PURE__ */new Set();
  for (let index = finalizedEvaluations.length - 1; index >= 0; index -= 1) {
    const { analysis, evaluation, opToNext } = finalizedEvaluations[index];
    const trustedSkillIds = resolveTrustedSkillExecutionIds({
      analysis,
      evaluation
    });
    if (trustedSkillIds.size > 0) {
      for (const skillId of trustedSkillIds) reachableSkillIds.add(skillId);
      continue;
    }
    const isPreludeOnly = !evaluation.allowlistSatisfied && isSkillPreludeOnlyEvaluation(analysis.segments, params.cwd);
    const preludeSkillIds = isPreludeOnly ? resolveSkillPreludeIds(analysis.segments, params.cwd) : /* @__PURE__ */new Set();
    const reachesTrustedSkillExecution = opToNext === "&&" && (preludeSkillIds.size === 0 ? reachableSkillIds.size > 0 : [...preludeSkillIds].some((skillId) => reachableSkillIds.has(skillId)));
    if (isPreludeOnly && reachesTrustedSkillExecution) {
      allowSkillPreludeAtIndex.add(index);
      continue;
    }
    reachableSkillIds.clear();
  }
  const allowlistMatches = [];
  const segments = [];
  const segmentAllowlistEntries = [];
  const segmentSatisfiedBy = [];
  for (const [index, { analysis, evaluation }] of finalizedEvaluations.entries()) {
    const effectiveSegmentSatisfiedBy = allowSkillPreludeAtIndex.has(index) ? analysis.segments.map(() => "skillPrelude") : evaluation.segmentSatisfiedBy;
    const effectiveSegmentAllowlistEntries = allowSkillPreludeAtIndex.has(index) ? analysis.segments.map(() => null) : evaluation.segmentAllowlistEntries;
    segments.push(...analysis.segments);
    allowlistMatches.push(...evaluation.allowlistMatches);
    segmentAllowlistEntries.push(...effectiveSegmentAllowlistEntries);
    segmentSatisfiedBy.push(...effectiveSegmentSatisfiedBy);
    if (!evaluation.allowlistSatisfied && !allowSkillPreludeAtIndex.has(index)) return {
      analysisOk: true,
      allowlistSatisfied: false,
      allowlistMatches,
      segments,
      segmentAllowlistEntries,
      segmentSatisfiedBy
    };
  }
  return {
    analysisOk: true,
    allowlistSatisfied: true,
    allowlistMatches,
    segments,
    segmentAllowlistEntries,
    segmentSatisfiedBy
  };
}
//#endregion
//#region src/infra/jsonl-socket.ts
/**
* Sends one JSONL request line, half-closes the write side, and waits for an accepted response line.
*/
async function requestJsonlSocket(params) {
  const { socketPath, requestLine, timeoutMs, accept } = params;
  return await new Promise((resolve) => {
    const client = new _nodeNet.default.Socket();
    let settled = false;
    let buffer = "";
    const finish = (value) => {
      if (settled) return;
      settled = true;
      try {
        client.destroy();
      } catch {}
      resolve(value);
    };
    const timer = (0, _nodeTimers.setTimeout)(() => finish(null), timeoutMs);
    client.on("error", () => finish(null));
    client.connect(socketPath, () => {
      client.end(`${requestLine}\n`);
    });
    client.on("data", (data) => {
      buffer += data.toString("utf8");
      let idx = buffer.indexOf("\n");
      while (idx !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        idx = buffer.indexOf("\n");
        if (!line) continue;
        try {
          const result = accept(JSON.parse(line));
          if (result === void 0) continue;
          (0, _nodeTimers.clearTimeout)(timer);
          finish(result);
          return;
        } catch {}
      }
    });
  });
}
//#endregion
//#region src/infra/exec-approvals.ts
function normalizeExecHost(value) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(value);
  if (normalized === "sandbox" || normalized === "gateway" || normalized === "node") return normalized;
  return null;
}
function normalizeExecTarget(value) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(value);
  if (normalized === "auto") return normalized;
  return normalizeExecHost(normalized);
}
/** Coerce a raw JSON field to string, returning undefined for non-string types. */
const toStringOrUndefined = _stringCoerceBUSzWgUA.d;
function normalizeExecSecurity(value) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(value);
  if (normalized === "deny" || normalized === "allowlist" || normalized === "full") return normalized;
  return null;
}
function normalizeExecAsk(value) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(value);
  if (normalized === "off" || normalized === "on-miss" || normalized === "always") return normalized;
  return null;
}
const DEFAULT_EXEC_APPROVAL_TIMEOUT_MS = exports.r = 18e5;
const DEFAULT_SECURITY = "full";
const DEFAULT_ASK = "off";
const DEFAULT_EXEC_APPROVAL_ASK_FALLBACK = exports.t = "full";
const DEFAULT_AUTO_ALLOW_SKILLS = false;
const DEFAULT_SOCKET = "~/.openclaw/exec-approvals.sock";
const DEFAULT_FILE = "~/.openclaw/exec-approvals.json";
function hashExecApprovalsRaw(raw) {
  return _nodeCrypto.default.createHash("sha256").update(raw ?? "").digest("hex");
}
function resolveExecApprovalsPath() {
  return (0, _homeDirBEqRdfoa.t)(DEFAULT_FILE);
}
function resolveExecApprovalsSocketPath() {
  return (0, _homeDirBEqRdfoa.t)(DEFAULT_SOCKET);
}
function normalizeAllowlistPattern(value) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(value) ?? "";
  return trimmed ? (0, _stringCoerceBUSzWgUA.i)(trimmed) : null;
}
function mergeLegacyAgent(current, legacy) {
  const allowlist = [];
  const seen = /* @__PURE__ */new Set();
  const pushEntry = (entry) => {
    const patternKey = normalizeAllowlistPattern(entry.pattern);
    if (!patternKey) return;
    const key = `${patternKey}\x00${entry.argPattern?.trim() ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    allowlist.push(entry);
  };
  for (const entry of current.allowlist ?? []) pushEntry(entry);
  for (const entry of legacy.allowlist ?? []) pushEntry(entry);
  return {
    security: current.security ?? legacy.security,
    ask: current.ask ?? legacy.ask,
    askFallback: current.askFallback ?? legacy.askFallback,
    autoAllowSkills: current.autoAllowSkills ?? legacy.autoAllowSkills,
    allowlist: allowlist.length > 0 ? allowlist : void 0
  };
}
function ensureDir(filePath) {
  const dir = _nodePath.default.dirname(filePath);
  assertNoSymlinkPathComponents(dir, (0, _homeDirBEqRdfoa.o)());
  _nodeFs.default.mkdirSync(dir, { recursive: true });
  const dirStat = _nodeFs.default.lstatSync(dir);
  if (!dirStat.isDirectory() || dirStat.isSymbolicLink()) throw new Error(`Refusing to use unsafe exec approvals directory: ${dir}`);
  return dir;
}
function assertNoSymlinkPathComponents(targetPath, trustedRoot) {
  const resolvedTarget = _nodePath.default.resolve(targetPath);
  const resolvedRoot = _nodePath.default.resolve(trustedRoot);
  if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(`${resolvedRoot}${_nodePath.default.sep}`)) return;
  const relative = _nodePath.default.relative(resolvedRoot, resolvedTarget);
  const segments = relative && relative !== "." ? relative.split(_nodePath.default.sep) : [];
  let current = resolvedRoot;
  for (const segment of [".", ...segments]) {
    if (segment !== ".") current = _nodePath.default.join(current, segment);
    try {
      if (_nodeFs.default.lstatSync(current).isSymbolicLink()) throw new Error(`Refusing to traverse symlink in exec approvals path: ${current}`);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
  }
}
function assertSafeExecApprovalsDestination(filePath) {
  try {
    if (_nodeFs.default.lstatSync(filePath).isSymbolicLink()) throw new Error(`Refusing to write exec approvals via symlink: ${filePath}`);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}
function coerceAllowlistEntries(allowlist) {
  if (!Array.isArray(allowlist) || allowlist.length === 0) return Array.isArray(allowlist) ? allowlist : void 0;
  let changed = false;
  const result = [];
  for (const item of allowlist) if (typeof item === "string") {
    const trimmed = item.trim();
    if (trimmed) {
      result.push({ pattern: trimmed });
      changed = true;
    } else changed = true;
  } else if (item && typeof item === "object" && !Array.isArray(item)) {
    const pattern = item.pattern;
    if (typeof pattern === "string" && pattern.trim().length > 0) result.push(item);else
    changed = true;
  } else changed = true;
  return changed ? result.length > 0 ? result : void 0 : allowlist;
}
function ensureAllowlistIds(allowlist) {
  if (!Array.isArray(allowlist) || allowlist.length === 0) return allowlist;
  let changed = false;
  const next = allowlist.map((entry) => {
    if (entry.id) return entry;
    changed = true;
    return {
      ...entry,
      id: _nodeCrypto.default.randomUUID()
    };
  });
  return changed ? next : allowlist;
}
function stripAllowlistCommandText(allowlist) {
  if (!Array.isArray(allowlist) || allowlist.length === 0) return allowlist;
  let changed = false;
  const next = allowlist.map((entry) => {
    if (typeof entry.commandText !== "string") return entry;
    changed = true;
    const { commandText: _commandText, ...rest } = entry;
    return rest;
  });
  return changed ? next : allowlist;
}
function sanitizeExecApprovalPolicy(policy) {
  const security = toStringOrUndefined(policy?.security)?.trim();
  const ask = toStringOrUndefined(policy?.ask)?.trim();
  const askFallback = toStringOrUndefined(policy?.askFallback)?.trim();
  return {
    security: security === "deny" || security === "allowlist" || security === "full" ? security : void 0,
    ask: ask === "off" || ask === "on-miss" || ask === "always" ? ask : void 0,
    askFallback: askFallback === "deny" || askFallback === "allowlist" || askFallback === "full" ? askFallback : void 0,
    autoAllowSkills: policy?.autoAllowSkills
  };
}
function normalizeExecApprovals(file) {
  const socketPath = file.socket?.path?.trim();
  const token = file.socket?.token?.trim();
  const agents = { ...file.agents };
  const legacyDefault = agents.default;
  if (legacyDefault) {
    const main = agents[_sessionKeyBh1lMwK.t];
    agents[_sessionKeyBh1lMwK.t] = main ? mergeLegacyAgent(main, legacyDefault) : legacyDefault;
    delete agents.default;
  }
  for (const [key, agent] of Object.entries(agents)) {
    const allowlist = stripAllowlistCommandText(ensureAllowlistIds(coerceAllowlistEntries(agent.allowlist)));
    const sanitizedPolicy = sanitizeExecApprovalPolicy(agent);
    if (allowlist !== agent.allowlist || sanitizedPolicy.security !== agent.security || sanitizedPolicy.ask !== agent.ask || sanitizedPolicy.askFallback !== agent.askFallback) agents[key] = {
      ...agent,
      allowlist,
      security: sanitizedPolicy.security,
      ask: sanitizedPolicy.ask,
      askFallback: sanitizedPolicy.askFallback
    };
  }
  const sanitizedDefaults = sanitizeExecApprovalPolicy(file.defaults);
  return {
    version: 1,
    socket: {
      path: socketPath && socketPath.length > 0 ? socketPath : void 0,
      token: token && token.length > 0 ? token : void 0
    },
    defaults: { ...sanitizedDefaults },
    agents
  };
}
function mergeExecApprovalsSocketDefaults(params) {
  const currentSocketPath = params.current?.socket?.path?.trim();
  const currentToken = params.current?.socket?.token?.trim();
  const socketPath = params.normalized.socket?.path?.trim() ?? currentSocketPath ?? resolveExecApprovalsSocketPath();
  const token = params.normalized.socket?.token?.trim() ?? currentToken ?? "";
  return {
    ...params.normalized,
    socket: {
      path: socketPath,
      token
    }
  };
}
function generateToken() {
  return _nodeCrypto.default.randomBytes(24).toString("base64url");
}
function readExecApprovalsSnapshot() {
  const filePath = resolveExecApprovalsPath();
  if (!_nodeFs.default.existsSync(filePath)) return {
    path: filePath,
    exists: false,
    raw: null,
    file: normalizeExecApprovals({
      version: 1,
      agents: {}
    }),
    hash: hashExecApprovalsRaw(null)
  };
  const raw = _nodeFs.default.readFileSync(filePath, "utf8");
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  return {
    path: filePath,
    exists: true,
    raw,
    file: parsed?.version === 1 ? normalizeExecApprovals(parsed) : normalizeExecApprovals({
      version: 1,
      agents: {}
    }),
    hash: hashExecApprovalsRaw(raw)
  };
}
function loadExecApprovals() {
  const filePath = resolveExecApprovalsPath();
  try {
    if (!_nodeFs.default.existsSync(filePath)) return normalizeExecApprovals({
      version: 1,
      agents: {}
    });
    const raw = _nodeFs.default.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return normalizeExecApprovals({
      version: 1,
      agents: {}
    });
    return normalizeExecApprovals(parsed);
  } catch {
    return normalizeExecApprovals({
      version: 1,
      agents: {}
    });
  }
}
function saveExecApprovals(file) {
  writeExecApprovalsRaw(resolveExecApprovalsPath(), `${JSON.stringify(file, null, 2)}\n`);
}
function writeExecApprovalsRaw(filePath, raw) {
  const dir = ensureDir(filePath);
  assertSafeExecApprovalsDestination(filePath);
  const tempPath = _nodePath.default.join(dir, `.exec-approvals.${process.pid}.${_nodeCrypto.default.randomUUID()}.tmp`);
  let tempWritten = false;
  try {
    _nodeFs.default.writeFileSync(tempPath, raw, {
      mode: 384,
      flag: "wx"
    });
    tempWritten = true;
    _nodeFs.default.renameSync(tempPath, filePath);
  } finally {
    if (tempWritten && _nodeFs.default.existsSync(tempPath)) _nodeFs.default.rmSync(tempPath, { force: true });
  }
  try {
    _nodeFs.default.chmodSync(filePath, 384);
  } catch {}
}
function restoreExecApprovalsSnapshot(snapshot) {
  if (!snapshot.exists) {
    _nodeFs.default.rmSync(snapshot.path, { force: true });
    return;
  }
  if (snapshot.raw !== null) {
    writeExecApprovalsRaw(snapshot.path, snapshot.raw);
    return;
  }
  saveExecApprovals(snapshot.file);
}
function ensureExecApprovals() {
  const next = normalizeExecApprovals(loadExecApprovals());
  const socketPath = next.socket?.path?.trim();
  const token = next.socket?.token?.trim();
  const updated = {
    ...next,
    socket: {
      path: socketPath && socketPath.length > 0 ? socketPath : resolveExecApprovalsSocketPath(),
      token: token && token.length > 0 ? token : generateToken()
    }
  };
  saveExecApprovals(updated);
  return updated;
}
function isExecSecurity(value) {
  return value === "allowlist" || value === "full" || value === "deny";
}
function isExecAsk(value) {
  return value === "always" || value === "off" || value === "on-miss";
}
function normalizeSecurity(value, fallback) {
  return isExecSecurity(value) ? value : fallback;
}
function normalizeAsk(value, fallback) {
  return isExecAsk(value) ? value : fallback;
}
function resolveDefaultSecurityField(params) {
  const defaultValue = params.defaults[params.field];
  if (isExecSecurity(defaultValue)) return {
    value: defaultValue,
    source: `defaults.${params.field}`
  };
  return {
    value: params.fallback,
    source: null
  };
}
function resolveDefaultAskField(params) {
  if (isExecAsk(params.defaults.ask)) return {
    value: params.defaults.ask,
    source: "defaults.ask"
  };
  return {
    value: params.fallback,
    source: null
  };
}
function resolveAgentSecurityField(params) {
  const fallbackField = resolveDefaultSecurityField({
    field: params.field,
    defaults: params.defaults,
    fallback: params.fallback
  });
  if (params.rawAgent[params.field] != null) {
    if (isExecSecurity(params.agent[params.field])) return {
      value: params.agent[params.field],
      source: `agents.${params.agentKey}.${params.field}`
    };
    return fallbackField;
  }
  if (params.rawWildcard[params.field] != null) {
    if (isExecSecurity(params.wildcard[params.field])) return {
      value: params.wildcard[params.field],
      source: `agents.*.${params.field}`
    };
    return fallbackField;
  }
  return fallbackField;
}
function resolveAgentAskField(params) {
  const fallbackField = resolveDefaultAskField({
    defaults: params.defaults,
    fallback: params.fallback
  });
  if (params.rawAgent.ask != null) {
    if (isExecAsk(params.agent.ask)) return {
      value: params.agent.ask,
      source: `agents.${params.agentKey}.ask`
    };
    return fallbackField;
  }
  if (params.rawWildcard.ask != null) {
    if (isExecAsk(params.wildcard.ask)) return {
      value: params.wildcard.ask,
      source: "agents.*.ask"
    };
    return fallbackField;
  }
  return fallbackField;
}
function resolveExecApprovals(agentId, overrides) {
  const file = ensureExecApprovals();
  return resolveExecApprovalsFromFile({
    file,
    agentId,
    overrides,
    path: resolveExecApprovalsPath(),
    socketPath: (0, _homeDirBEqRdfoa.t)(file.socket?.path ?? resolveExecApprovalsSocketPath()),
    token: file.socket?.token ?? ""
  });
}
function resolveExecApprovalsFromFile(params) {
  const rawFile = params.file;
  const file = normalizeExecApprovals(params.file);
  const defaults = file.defaults ?? {};
  const agentKey = params.agentId ?? "main";
  const agent = file.agents?.[agentKey] ?? {};
  const wildcard = file.agents?.["*"] ?? {};
  const rawAgent = rawFile.agents?.[agentKey] ?? {};
  const rawWildcard = rawFile.agents?.["*"] ?? {};
  const fallbackSecurity = params.overrides?.security ?? DEFAULT_SECURITY;
  const fallbackAsk = params.overrides?.ask ?? DEFAULT_ASK;
  const fallbackAskFallback = params.overrides?.askFallback ?? "full";
  const fallbackAutoAllowSkills = params.overrides?.autoAllowSkills ?? DEFAULT_AUTO_ALLOW_SKILLS;
  const resolvedDefaults = {
    security: normalizeSecurity(defaults.security, fallbackSecurity),
    ask: normalizeAsk(defaults.ask, fallbackAsk),
    askFallback: normalizeSecurity(defaults.askFallback ?? fallbackAskFallback, fallbackAskFallback),
    autoAllowSkills: defaults.autoAllowSkills ?? fallbackAutoAllowSkills
  };
  const resolvedAgentSecurity = resolveAgentSecurityField({
    field: "security",
    defaults,
    agent,
    rawAgent,
    wildcard,
    rawWildcard,
    agentKey,
    fallback: resolvedDefaults.security
  });
  const resolvedAgentAsk = resolveAgentAskField({
    defaults,
    agent,
    rawAgent,
    wildcard,
    rawWildcard,
    agentKey,
    fallback: resolvedDefaults.ask
  });
  const resolvedAgentAskFallback = resolveAgentSecurityField({
    field: "askFallback",
    defaults,
    agent,
    rawAgent,
    wildcard,
    rawWildcard,
    agentKey,
    fallback: resolvedDefaults.askFallback
  });
  const resolvedAgent = {
    security: resolvedAgentSecurity.value,
    ask: resolvedAgentAsk.value,
    askFallback: resolvedAgentAskFallback.value,
    autoAllowSkills: agent.autoAllowSkills ?? wildcard.autoAllowSkills ?? resolvedDefaults.autoAllowSkills
  };
  const allowlist = [...(Array.isArray(wildcard.allowlist) ? wildcard.allowlist : []), ...(Array.isArray(agent.allowlist) ? agent.allowlist : [])];
  return {
    path: params.path ?? resolveExecApprovalsPath(),
    socketPath: (0, _homeDirBEqRdfoa.t)(params.socketPath ?? file.socket?.path ?? resolveExecApprovalsSocketPath()),
    token: params.token ?? file.socket?.token ?? "",
    defaults: resolvedDefaults,
    agent: resolvedAgent,
    agentSources: {
      security: resolvedAgentSecurity.source,
      ask: resolvedAgentAsk.source,
      askFallback: resolvedAgentAskFallback.source
    },
    allowlist,
    file
  };
}
function requiresExecApproval(params) {
  if (params.ask === "always") return true;
  if (params.durableApprovalSatisfied === true) return false;
  return params.ask === "on-miss" && params.security === "allowlist" && (!params.analysisOk || !params.allowlistSatisfied);
}
function hasDurableExecApproval(params) {
  return hasExactCommandDurableExecApproval({
    allowlist: params.allowlist,
    commandText: params.commandText
  }) || hasSegmentDurableExecApproval({
    analysisOk: params.analysisOk,
    segmentAllowlistEntries: params.segmentAllowlistEntries
  });
}
function buildDurableCommandApprovalPattern(commandText) {
  return `=command:${_nodeCrypto.default.createHash("sha256").update(commandText).digest("hex").slice(0, 16)}`;
}
function hasExactCommandDurableExecApproval(params) {
  const normalizedCommand = params.commandText?.trim();
  if (!normalizedCommand) return false;
  const commandPattern = buildDurableCommandApprovalPattern(normalizedCommand);
  return (params.allowlist ?? []).some((entry) => entry.source === "allow-always" && (entry.pattern === commandPattern || typeof entry.commandText === "string" && entry.commandText.trim() === normalizedCommand));
}
function hasSegmentDurableExecApproval(params) {
  return params.analysisOk && params.segmentAllowlistEntries.length > 0 && params.segmentAllowlistEntries.every((entry) => entry?.source === "allow-always");
}
function recordAllowlistUse(approvals, agentId, entry, command, resolvedPath) {
  const target = agentId ?? "main";
  const agents = approvals.agents ?? {};
  const existing = agents[target] ?? {};
  const nextAllowlist = (Array.isArray(existing.allowlist) ? existing.allowlist : []).map((item) => item.pattern === entry.pattern && (item.argPattern ?? void 0) === (entry.argPattern ?? void 0) ? {
    ...item,
    id: item.id ?? _nodeCrypto.default.randomUUID(),
    lastUsedAt: Date.now(),
    lastUsedCommand: command,
    lastResolvedPath: resolvedPath
  } : item);
  agents[target] = {
    ...existing,
    allowlist: nextAllowlist
  };
  approvals.agents = agents;
  saveExecApprovals(approvals);
}
function buildAllowlistEntryMatchKey(entry) {
  return `${entry.pattern}\x00${entry.argPattern?.trim() ?? ""}`;
}
function recordAllowlistMatchesUse(params) {
  if (params.matches.length === 0) return;
  const seen = /* @__PURE__ */new Set();
  for (const match of params.matches) {
    if (!match.pattern) continue;
    const key = buildAllowlistEntryMatchKey(match);
    if (seen.has(key)) continue;
    seen.add(key);
    recordAllowlistUse(params.approvals, params.agentId, match, params.command, params.resolvedPath);
  }
}
function addAllowlistEntry(approvals, agentId, pattern, options) {
  const target = agentId ?? "main";
  const agents = approvals.agents ?? {};
  const existing = agents[target] ?? {};
  const allowlist = Array.isArray(existing.allowlist) ? existing.allowlist : [];
  const trimmed = pattern.trim();
  if (!trimmed) return;
  const trimmedArgPattern = (0, _stringCoerceBUSzWgUA.s)(options?.argPattern);
  const existingEntry = allowlist.find((entry) => entry.pattern === trimmed && (entry.argPattern ?? void 0) === trimmedArgPattern);
  if (existingEntry && (!options?.source || existingEntry.source === options.source)) return;
  const now = Date.now();
  const nextAllowlist = existingEntry ? allowlist.map((entry) => entry.pattern === trimmed ? {
    ...entry,
    argPattern: trimmedArgPattern,
    source: options?.source ?? entry.source,
    lastUsedAt: now
  } : entry) : [...allowlist, {
    id: _nodeCrypto.default.randomUUID(),
    pattern: trimmed,
    argPattern: trimmedArgPattern,
    source: options?.source,
    lastUsedAt: now
  }];
  agents[target] = {
    ...existing,
    allowlist: nextAllowlist
  };
  approvals.agents = agents;
  saveExecApprovals(approvals);
}
function addDurableCommandApproval(approvals, agentId, commandText) {
  const normalized = commandText.trim();
  if (!normalized) return;
  addAllowlistEntry(approvals, agentId, buildDurableCommandApprovalPattern(normalized), { source: "allow-always" });
}
function persistAllowAlwaysPatterns(params) {
  const patterns = resolveAllowAlwaysPatternEntries({
    segments: params.segments,
    cwd: params.cwd,
    env: params.env,
    platform: params.platform,
    strictInlineEval: params.strictInlineEval
  });
  for (const pattern of patterns) {
    if (!pattern.pattern) continue;
    addAllowlistEntry(params.approvals, params.agentId, pattern.pattern, {
      argPattern: pattern.argPattern,
      source: "allow-always"
    });
  }
  return patterns;
}
function minSecurity(a, b) {
  const order = {
    deny: 0,
    allowlist: 1,
    full: 2
  };
  return order[a] <= order[b] ? a : b;
}
function maxAsk(a, b) {
  const order = {
    off: 0,
    "on-miss": 1,
    always: 2
  };
  return order[a] >= order[b] ? a : b;
}
const DEFAULT_EXEC_APPROVAL_DECISIONS = exports.n = [
"allow-once",
"allow-always",
"deny"];

function resolveExecApprovalAllowedDecisions(params) {
  if (normalizeExecAsk(params?.ask) === "always") return ["allow-once", "deny"];
  return DEFAULT_EXEC_APPROVAL_DECISIONS;
}
function resolveExecApprovalRequestAllowedDecisions(params) {
  const explicit = Array.isArray(params?.allowedDecisions) ? params.allowedDecisions.filter((decision) => decision === "allow-once" || decision === "allow-always" || decision === "deny") : [];
  return explicit.length > 0 ? explicit : resolveExecApprovalAllowedDecisions({ ask: params?.ask });
}
function isExecApprovalDecisionAllowed(params) {
  return resolveExecApprovalAllowedDecisions({ ask: params.ask }).includes(params.decision);
}
async function requestExecApprovalViaSocket(params) {
  const { socketPath, token, request } = params;
  if (!socketPath || !token) return null;
  const timeoutMs = params.timeoutMs ?? 15e3;
  return await requestJsonlSocket({
    socketPath,
    requestLine: JSON.stringify({
      type: "request",
      token,
      id: _nodeCrypto.default.randomUUID(),
      request
    }),
    timeoutMs,
    accept: (value) => {
      const msg = value;
      if (msg?.type === "decision" && msg.decision) return msg.decision;
    }
  });
}
//#endregion /* v9-3a8325f2fe1f45cc */
