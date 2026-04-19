"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = normalizeFingerprint;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/infra/tls/fingerprint.ts
function normalizeFingerprint(input) {
  return (0, _stringCoerceBUSzWgUA.i)(input.trim().replace(/^sha-?256\s*:?\s*/i, "").replace(/[^a-fA-F0-9]/g, ""));
}
//#endregion /* v9-02f3f8c9b4ccd9e2 */
