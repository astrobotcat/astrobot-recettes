"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = isNumericTelegramUserId;exports.r = normalizeTelegramAllowFromEntry;exports.t = isNumericTelegramSenderUserId; //#region extensions/telegram/src/allow-from.ts
function normalizeTelegramAllowFromEntry(raw) {
  return (typeof raw === "string" ? raw : typeof raw === "number" ? String(raw) : "").trim().replace(/^(telegram|tg):/i, "").trim();
}
function isNumericTelegramUserId(raw) {
  return /^-?\d+$/.test(raw);
}
function isNumericTelegramSenderUserId(raw) {
  return /^\d+$/.test(raw);
}
//#endregion /* v9-4b6e9d4476f7d00a */
