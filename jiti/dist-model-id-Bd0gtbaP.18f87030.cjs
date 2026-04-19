"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = normalizeXaiModelId; //#region extensions/xai/model-id.ts
function normalizeXaiModelId(id) {
  if (id === "grok-4-fast-reasoning") return "grok-4-fast";
  if (id === "grok-4-1-fast-reasoning") return "grok-4-1-fast";
  if (id === "grok-4.20-experimental-beta-0304-reasoning") return "grok-4.20-beta-latest-reasoning";
  if (id === "grok-4.20-experimental-beta-0304-non-reasoning") return "grok-4.20-beta-latest-non-reasoning";
  if (id === "grok-4.20-reasoning") return "grok-4.20-beta-latest-reasoning";
  if (id === "grok-4.20-non-reasoning") return "grok-4.20-beta-latest-non-reasoning";
  return id;
}
//#endregion /* v9-69b1594c388d2666 */
