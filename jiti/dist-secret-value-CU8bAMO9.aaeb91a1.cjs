"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = hasConfiguredPlaintextSecretValue;exports.r = isExpectedResolvedSecretValue;exports.t = assertExpectedResolvedSecretValue;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _sharedDLDubI1E = require("./shared-DLDubI1E.js");
//#region src/secrets/secret-value.ts
function isExpectedResolvedSecretValue(value, expected) {
  if (expected === "string") return (0, _sharedDLDubI1E.n)(value);
  return (0, _sharedDLDubI1E.n)(value) || (0, _utilsD5DtWkEu.l)(value);
}
function hasConfiguredPlaintextSecretValue(value, expected) {
  if (expected === "string") return (0, _sharedDLDubI1E.n)(value);
  return (0, _sharedDLDubI1E.n)(value) || (0, _utilsD5DtWkEu.l)(value) && Object.keys(value).length > 0;
}
function assertExpectedResolvedSecretValue(params) {
  if (!isExpectedResolvedSecretValue(params.value, params.expected)) throw new Error(params.errorMessage);
}
//#endregion /* v9-abbbd81f20bdd519 */
