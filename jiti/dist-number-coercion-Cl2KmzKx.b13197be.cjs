"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = asFiniteNumber; //#region src/shared/number-coercion.ts
function asFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
//#endregion /* v9-8685a97ac09df730 */
