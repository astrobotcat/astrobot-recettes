"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = collectTextContentBlocks; //#region src/agents/content-blocks.ts
function collectTextContentBlocks(content) {
  if (!Array.isArray(content)) return [];
  const parts = [];
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    const rec = block;
    if (rec.type === "text" && typeof rec.text === "string") parts.push(rec.text);
  }
  return parts;
}
//#endregion /* v9-98d260d392171008 */
