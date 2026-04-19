"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = safeEqualSecret;var _nodeCrypto = require("node:crypto");
//#region src/security/secret-equal.ts
function safeEqualSecret(provided, expected) {
  if (typeof provided !== "string" || typeof expected !== "string") return false;
  const hash = (s) => (0, _nodeCrypto.createHash)("sha256").update(s).digest();
  return (0, _nodeCrypto.timingSafeEqual)(hash(provided), hash(expected));
}
//#endregion /* v9-916345883139c747 */
