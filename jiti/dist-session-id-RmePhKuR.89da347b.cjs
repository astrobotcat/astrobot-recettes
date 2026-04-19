"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = looksLikeSessionId;exports.t = void 0; //#region src/sessions/session-id.ts
const SESSION_ID_RE = exports.t = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function looksLikeSessionId(value) {
  return SESSION_ID_RE.test(value.trim());
}
//#endregion /* v9-7f3dd3a212ea785a */
