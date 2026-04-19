"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = normalizeString;exports.t = void 0;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
require("./text-runtime-DTMxvodz.js");
//#region extensions/browser/src/record-shared.ts
const hasNonEmptyString = exports.t = _stringCoerceBUSzWgUA.t;
function normalizeString(value) {
  if (typeof value === "string") return value.trim() || void 0;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
}
//#endregion /* v9-ef8dd3e0af8c0c3d */
