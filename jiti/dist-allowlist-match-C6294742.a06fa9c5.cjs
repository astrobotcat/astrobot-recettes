"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolveAllowlistMatchSimple;exports.i = resolveAllowlistMatchByCandidates;exports.n = formatAllowlistMatchMeta;exports.o = resolveCompiledAllowlistMatch;exports.r = resolveAllowlistCandidates;exports.t = compileAllowlist;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/channels/allowlist-match.ts
function formatAllowlistMatchMeta(match) {
  return `matchKey=${match?.matchKey ?? "none"} matchSource=${match?.matchSource ?? "none"}`;
}
function compileAllowlist(entries) {
  const set = new Set(entries.filter(Boolean));
  return {
    set,
    wildcard: set.has("*")
  };
}
function compileSimpleAllowlist(entries) {
  return compileAllowlist(entries.map((entry) => (0, _stringCoerceBUSzWgUA.o)(String(entry))).filter((entry) => Boolean(entry)));
}
function resolveAllowlistCandidates(params) {
  for (const candidate of params.candidates) {
    if (!candidate.value) continue;
    if (params.compiledAllowlist.set.has(candidate.value)) return {
      allowed: true,
      matchKey: candidate.value,
      matchSource: candidate.source
    };
  }
  return { allowed: false };
}
function resolveCompiledAllowlistMatch(params) {
  if (params.compiledAllowlist.set.size === 0) return { allowed: false };
  if (params.compiledAllowlist.wildcard) return {
    allowed: true,
    matchKey: "*",
    matchSource: "wildcard"
  };
  return resolveAllowlistCandidates(params);
}
function resolveAllowlistMatchByCandidates(params) {
  return resolveCompiledAllowlistMatch({
    compiledAllowlist: compileAllowlist(params.allowList),
    candidates: params.candidates
  });
}
function resolveAllowlistMatchSimple(params) {
  const allowFrom = compileSimpleAllowlist(params.allowFrom);
  if (allowFrom.set.size === 0) return { allowed: false };
  if (allowFrom.wildcard) return {
    allowed: true,
    matchKey: "*",
    matchSource: "wildcard"
  };
  const senderId = (0, _stringCoerceBUSzWgUA.i)(params.senderId);
  const senderName = (0, _stringCoerceBUSzWgUA.o)(params.senderName);
  return resolveAllowlistCandidates({
    compiledAllowlist: allowFrom,
    candidates: [{
      value: senderId,
      source: "id"
    }, ...(params.allowNameMatching === true && senderName ? [{
      value: senderName,
      source: "name"
    }] : [])]
  });
}
//#endregion /* v9-0a32bf9a9ce72258 */
