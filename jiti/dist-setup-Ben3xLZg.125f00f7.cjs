"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = formatResolvedUnresolvedNote;require("./utils-D5DtWkEu.js");
require("./types.secrets-CeL3gSMO.js");
require("./setup-helpers-NxWLbAbV.js");
require("./setup-wizard-helpers-C8R_wm_7.js");
require("./setup-binary-Cg0Z930E.js");
require("./setup-wizard-proxy-B4lmSF6h.js");
//#region src/plugin-sdk/resolution-notes.ts
/** Format a short note that separates successfully resolved targets from unresolved passthrough values. */
function formatResolvedUnresolvedNote(params) {
  if (params.resolved.length === 0 && params.unresolved.length === 0) return;
  return [params.resolved.length > 0 ? `Resolved: ${params.resolved.join(", ")}` : void 0, params.unresolved.length > 0 ? `Unresolved (kept as typed): ${params.unresolved.join(", ")}` : void 0].filter(Boolean).join("\n");
}
//#endregion /* v9-9918d9e2bb1996e0 */
