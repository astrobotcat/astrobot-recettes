"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveNodePairApprovalScopes;var _nodeCommandsCACC2qu = require("./node-commands-CACC2qu6.js");
//#region src/infra/node-pairing-authz.ts
const OPERATOR_PAIRING_SCOPE = "operator.pairing";
const OPERATOR_WRITE_SCOPE = "operator.write";
const OPERATOR_ADMIN_SCOPE = "operator.admin";
function resolveNodePairApprovalScopes(commands) {
  const normalized = Array.isArray(commands) ? commands.filter((command) => typeof command === "string") : [];
  if (normalized.some((command) => _nodeCommandsCACC2qu.i.some((allowed) => allowed === command))) return [OPERATOR_PAIRING_SCOPE, OPERATOR_ADMIN_SCOPE];
  if (normalized.length > 0) return [OPERATOR_PAIRING_SCOPE, OPERATOR_WRITE_SCOPE];
  return [OPERATOR_PAIRING_SCOPE];
}
//#endregion /* v9-414d3f9438260d3e */
