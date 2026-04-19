"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = retainSafeHeadersForCrossOriginRedirect;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/infra/net/redirect-headers.ts
const CROSS_ORIGIN_REDIRECT_SAFE_HEADERS = new Set([
"accept",
"accept-encoding",
"accept-language",
"cache-control",
"content-language",
"content-type",
"if-match",
"if-modified-since",
"if-none-match",
"if-unmodified-since",
"pragma",
"range",
"user-agent"]
);
function retainSafeHeadersForCrossOriginRedirect(headers) {
  if (!headers) return headers;
  const incoming = new Headers(headers);
  const safeHeaders = {};
  for (const [key, value] of incoming.entries()) if (CROSS_ORIGIN_REDIRECT_SAFE_HEADERS.has((0, _stringCoerceBUSzWgUA.i)(key))) safeHeaders[key] = value;
  return safeHeaders;
}
//#endregion /* v9-6991f933f6dee780 */
