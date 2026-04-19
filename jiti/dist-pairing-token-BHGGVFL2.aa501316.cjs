"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = resolvePairingPaths;exports.c = roleScopesAllow;exports.i = reconcilePendingPairingRequests;exports.n = verifyPairingToken;exports.o = resolveMissingRequestedScope;exports.r = pruneExpiredPending;exports.s = resolveScopeOutsideRequestedRoles;exports.t = generatePairingToken;var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _secretEqualDqrgJW5g = require("./secret-equal-DqrgJW5g.js");
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeCrypto = require("node:crypto");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/shared/operator-scope-compat.ts
const OPERATOR_ROLE = "operator";
const OPERATOR_ADMIN_SCOPE = "operator.admin";
const OPERATOR_READ_SCOPE = "operator.read";
const OPERATOR_WRITE_SCOPE = "operator.write";
const OPERATOR_SCOPE_PREFIX = "operator.";
function normalizeScopeList(scopes) {
  const out = /* @__PURE__ */new Set();
  for (const scope of scopes) {
    const trimmed = scope.trim();
    if (trimmed) out.add(trimmed);
  }
  return [...out];
}
function operatorScopeSatisfied(requestedScope, granted) {
  if (!requestedScope.startsWith(OPERATOR_SCOPE_PREFIX)) return false;
  if (granted.has(OPERATOR_ADMIN_SCOPE)) return true;
  if (requestedScope === OPERATOR_READ_SCOPE) return granted.has(OPERATOR_READ_SCOPE) || granted.has(OPERATOR_WRITE_SCOPE);
  if (requestedScope === OPERATOR_WRITE_SCOPE) return granted.has(OPERATOR_WRITE_SCOPE);
  return granted.has(requestedScope);
}
function roleScopesAllow(params) {
  const requested = normalizeScopeList(params.requestedScopes);
  if (requested.length === 0) return true;
  const allowed = normalizeScopeList(params.allowedScopes);
  if (allowed.length === 0) return false;
  const allowedSet = new Set(allowed);
  if (params.role.trim() !== OPERATOR_ROLE) {
    const prefix = `${params.role.trim()}.`;
    return requested.every((scope) => scope.startsWith(prefix) && allowedSet.has(scope));
  }
  return requested.every((scope) => operatorScopeSatisfied(scope, allowedSet));
}
function resolveMissingRequestedScope(params) {
  for (const scope of params.requestedScopes) if (!roleScopesAllow({
    role: params.role,
    requestedScopes: [scope],
    allowedScopes: params.allowedScopes
  })) return scope;
  return null;
}
function resolveScopeOutsideRequestedRoles(params) {
  for (const scope of params.requestedScopes) if (!params.requestedRoles.some((role) => roleScopesAllow({
    role,
    requestedScopes: [scope],
    allowedScopes: [scope]
  }))) return scope;
  return null;
}
//#endregion
//#region src/infra/pairing-files.ts
function resolvePairingPaths(baseDir, subdir) {
  const root = baseDir ?? (0, _pathsDvv9VRAc._)();
  const dir = _nodePath.default.join(root, subdir);
  return {
    dir,
    pendingPath: _nodePath.default.join(dir, "pending.json"),
    pairedPath: _nodePath.default.join(dir, "paired.json")
  };
}
function pruneExpiredPending(pendingById, nowMs, ttlMs) {
  for (const [id, req] of Object.entries(pendingById)) if (nowMs - req.ts > ttlMs) delete pendingById[id];
}
async function reconcilePendingPairingRequests(params) {
  if (params.existing.length === 1 && params.canRefreshSingle(params.existing[0], params.incoming)) {
    const refreshed = params.refreshSingle(params.existing[0], params.incoming);
    params.pendingById[refreshed.requestId] = refreshed;
    await params.persist();
    return {
      status: "pending",
      request: refreshed,
      created: false
    };
  }
  for (const existing of params.existing) delete params.pendingById[existing.requestId];
  const request = params.buildReplacement({
    existing: params.existing,
    incoming: params.incoming
  });
  params.pendingById[request.requestId] = request;
  await params.persist();
  return {
    status: "pending",
    request,
    created: true
  };
}
function generatePairingToken() {
  return (0, _nodeCrypto.randomBytes)(32).toString("base64url");
}
function verifyPairingToken(provided, expected) {
  if (provided.trim().length === 0 || expected.trim().length === 0) return false;
  return (0, _secretEqualDqrgJW5g.t)(provided, expected);
}
//#endregion /* v9-f3e27c6e10534be4 */
