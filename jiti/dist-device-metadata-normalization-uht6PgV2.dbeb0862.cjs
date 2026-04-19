"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = normalizeDeviceMetadataForPolicy;exports.t = normalizeDeviceMetadataForAuth;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/gateway/device-metadata-normalization.ts
function normalizeTrimmedMetadata(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed ? trimmed : "";
}
function toLowerAscii(input) {
  return input.replace(/[A-Z]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 32));
}
function normalizeDeviceMetadataForAuth(value) {
  const trimmed = normalizeTrimmedMetadata(value);
  if (!trimmed) return "";
  return toLowerAscii(trimmed);
}
function normalizeDeviceMetadataForPolicy(value) {
  const trimmed = normalizeTrimmedMetadata(value);
  if (!trimmed) return "";
  return (0, _stringCoerceBUSzWgUA.i)(trimmed.normalize("NFKD").replace(/\p{M}/gu, ""));
}
//#endregion /* v9-378a30e6a4c0c67b */
