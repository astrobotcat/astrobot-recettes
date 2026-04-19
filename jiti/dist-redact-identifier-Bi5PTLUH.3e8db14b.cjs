"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = sha256HexPrefix;exports.t = redactIdentifier;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/logging/redact-identifier.ts
function sha256HexPrefix(value, len = 12) {
  const safeLen = Number.isFinite(len) ? Math.max(1, Math.floor(len)) : 12;
  return _nodeCrypto.default.createHash("sha256").update(value).digest("hex").slice(0, safeLen);
}
function redactIdentifier(value, opts) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(value);
  if (!trimmed) return "-";
  return `sha256:${sha256HexPrefix(trimmed, opts?.len ?? 12)}`;
}
//#endregion /* v9-15fb87eddcdb3513 */
