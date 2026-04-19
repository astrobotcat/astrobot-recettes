"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = parseBooleanValue;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/utils/boolean.ts
const DEFAULT_TRUTHY = [
"true",
"1",
"yes",
"on"];

const DEFAULT_FALSY = [
"false",
"0",
"no",
"off"];

const DEFAULT_TRUTHY_SET = new Set(DEFAULT_TRUTHY);
const DEFAULT_FALSY_SET = new Set(DEFAULT_FALSY);
function parseBooleanValue(value, options = {}) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return;
  const normalized = (0, _stringCoerceBUSzWgUA.o)(value);
  if (!normalized) return;
  const truthy = options.truthy ?? DEFAULT_TRUTHY;
  const falsy = options.falsy ?? DEFAULT_FALSY;
  const truthySet = truthy === DEFAULT_TRUTHY ? DEFAULT_TRUTHY_SET : new Set(truthy);
  const falsySet = falsy === DEFAULT_FALSY ? DEFAULT_FALSY_SET : new Set(falsy);
  if (truthySet.has(normalized)) return true;
  if (falsySet.has(normalized)) return false;
}
//#endregion /* v9-391647ca5a2fac98 */
