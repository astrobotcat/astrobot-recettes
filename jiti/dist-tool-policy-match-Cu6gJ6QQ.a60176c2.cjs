"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = isToolAllowedByPolicyName;exports.r = pickSandboxToolPolicy;exports.t = isToolAllowedByPolicies;var _toolPolicyC3rJHw = require("./tool-policy-C3rJHw58.js");
var _globPatternDcufYsPS = require("./glob-pattern-DcufYsPS.js");
//#region src/agents/sandbox-tool-policy.ts
function unionAllow(base, extra) {
  if (!Array.isArray(extra) || extra.length === 0) return base;
  if (!Array.isArray(base)) return Array.from(new Set(["*", ...extra]));
  if (base.length === 0) return Array.from(new Set(["*", ...extra]));
  return Array.from(new Set([...base, ...extra]));
}
function pickSandboxToolPolicy(config) {
  if (!config) return;
  const allow = Array.isArray(config.allow) ? unionAllow(config.allow, config.alsoAllow) : Array.isArray(config.alsoAllow) && config.alsoAllow.length > 0 ? unionAllow(void 0, config.alsoAllow) : void 0;
  const deny = Array.isArray(config.deny) ? config.deny : void 0;
  if (!allow && !deny) return;
  return {
    allow,
    deny
  };
}
//#endregion
//#region src/agents/tool-policy-match.ts
function makeToolPolicyMatcher(policy) {
  const deny = (0, _globPatternDcufYsPS.t)({
    raw: (0, _toolPolicyC3rJHw.c)(policy.deny ?? []),
    normalize: _toolPolicyC3rJHw.l
  });
  const allow = (0, _globPatternDcufYsPS.t)({
    raw: (0, _toolPolicyC3rJHw.c)(policy.allow ?? []),
    normalize: _toolPolicyC3rJHw.l
  });
  return (name) => {
    const normalized = (0, _toolPolicyC3rJHw.l)(name);
    if ((0, _globPatternDcufYsPS.n)(normalized, deny)) return false;
    if (normalized === "apply_patch" && (0, _globPatternDcufYsPS.n)("write", deny)) return false;
    if (allow.length === 0) return true;
    if ((0, _globPatternDcufYsPS.n)(normalized, allow)) return true;
    if (normalized === "apply_patch" && (0, _globPatternDcufYsPS.n)("write", allow)) return true;
    return false;
  };
}
function isToolAllowedByPolicyName(name, policy) {
  if (!policy) return true;
  return makeToolPolicyMatcher(policy)(name);
}
function isToolAllowedByPolicies(name, policies) {
  return policies.every((policy) => isToolAllowedByPolicyName(name, policy));
}
//#endregion /* v9-700f4f6ba82073e9 */
