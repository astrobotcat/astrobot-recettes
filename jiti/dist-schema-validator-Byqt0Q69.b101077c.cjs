"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = applyMergePatch;exports.n = appendAllowedValuesHint;exports.r = summarizeAllowedValues;exports.t = validateJsonSchemaValue;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _prototypeKeysCnLLLhBE = require("./prototype-keys-CnLLLhBE.js");
var _safeTextBfEU6V1V = require("./safe-text-BfEU6V1V.js");
var _nodeModule = require("node:module");
//#region src/config/merge-patch.ts
function isObjectWithStringId(value) {
  if (!(0, _utilsD5DtWkEu.x)(value)) return false;
  return typeof value.id === "string" && value.id.length > 0;
}
/**
* Merge arrays of object-like entries keyed by `id`.
*
* Contract:
* - Base array must be fully id-keyed; otherwise return undefined (caller should replace).
* - Patch entries with valid id merge by id (or append when the id is new).
* - Patch entries without valid id append as-is, avoiding destructive full-array replacement.
*/
function mergeObjectArraysById(base, patch, options) {
  if (!base.every(isObjectWithStringId)) return;
  const merged = [...base];
  const indexById = /* @__PURE__ */new Map();
  for (const [index, entry] of merged.entries()) {
    if (!isObjectWithStringId(entry)) return;
    indexById.set(entry.id, index);
  }
  for (const patchEntry of patch) {
    if (!isObjectWithStringId(patchEntry)) {
      merged.push(structuredClone(patchEntry));
      continue;
    }
    const existingIndex = indexById.get(patchEntry.id);
    if (existingIndex === void 0) {
      merged.push(structuredClone(patchEntry));
      indexById.set(patchEntry.id, merged.length - 1);
      continue;
    }
    merged[existingIndex] = applyMergePatch(merged[existingIndex], patchEntry, options);
  }
  return merged;
}
function applyMergePatch(base, patch, options = {}) {
  if (!(0, _utilsD5DtWkEu.x)(patch)) return patch;
  const result = (0, _utilsD5DtWkEu.x)(base) ? { ...base } : {};
  for (const [key, value] of Object.entries(patch)) {
    if ((0, _prototypeKeysCnLLLhBE.t)(key)) continue;
    if (value === null) {
      delete result[key];
      continue;
    }
    if (options.mergeObjectArraysById && Array.isArray(result[key]) && Array.isArray(value)) {
      const mergedArray = mergeObjectArraysById(result[key], value, options);
      if (mergedArray) {
        result[key] = mergedArray;
        continue;
      }
    }
    if ((0, _utilsD5DtWkEu.x)(value)) {
      const baseValue = result[key];
      result[key] = applyMergePatch((0, _utilsD5DtWkEu.x)(baseValue) ? baseValue : {}, value, options);
      continue;
    }
    result[key] = value;
  }
  return result;
}
//#endregion
//#region src/config/allowed-values.ts
const MAX_ALLOWED_VALUES_HINT = 12;
const MAX_ALLOWED_VALUE_CHARS = 160;
function truncateHintText(text, limit) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}... (+${text.length - limit} chars)`;
}
function safeStringify(value) {
  try {
    const serialized = JSON.stringify(value);
    if (serialized !== void 0) return serialized;
  } catch {}
  return String(value);
}
function toAllowedValueLabel(value) {
  if (typeof value === "string") return JSON.stringify(truncateHintText(value, MAX_ALLOWED_VALUE_CHARS));
  return truncateHintText(safeStringify(value), MAX_ALLOWED_VALUE_CHARS);
}
function toAllowedValueValue(value) {
  if (typeof value === "string") return value;
  return safeStringify(value);
}
function toAllowedValueDedupKey(value) {
  if (value === null) return "null:null";
  const kind = typeof value;
  if (kind === "string") return `string:${value}`;
  return `${kind}:${safeStringify(value)}`;
}
function summarizeAllowedValues(values) {
  if (values.length === 0) return null;
  const deduped = [];
  const seenValues = /* @__PURE__ */new Set();
  for (const item of values) {
    const dedupeKey = toAllowedValueDedupKey(item);
    if (seenValues.has(dedupeKey)) continue;
    seenValues.add(dedupeKey);
    deduped.push({
      value: toAllowedValueValue(item),
      label: toAllowedValueLabel(item)
    });
  }
  const shown = deduped.slice(0, MAX_ALLOWED_VALUES_HINT);
  const hiddenCount = deduped.length - shown.length;
  const formattedCore = shown.map((entry) => entry.label).join(", ");
  const formatted = hiddenCount > 0 ? `${formattedCore}, ... (+${hiddenCount} more)` : formattedCore;
  return {
    values: shown.map((entry) => entry.value),
    hiddenCount,
    formatted
  };
}
function messageAlreadyIncludesAllowedValues(message) {
  const lower = (0, _stringCoerceBUSzWgUA.i)(message);
  return lower.includes("(allowed:") || lower.includes("expected one of");
}
function appendAllowedValuesHint(message, summary) {
  if (messageAlreadyIncludesAllowedValues(message)) return message;
  return `${message} (allowed: ${summary.formatted})`;
}
//#endregion
//#region src/plugins/schema-validator.ts
const _require = (0, _nodeModule.createRequire)("file:///home/linuxbrew/.linuxbrew/lib/node_modules/openclaw/dist/schema-validator-Byqt0Q69.js");
const ajvSingletons = /* @__PURE__ */new Map();
function getAjv(mode) {
  const cached = ajvSingletons.get(mode);
  if (cached) return cached;
  const ajvModule = _require("ajv");
  const instance = new (typeof ajvModule.default === "function" ? ajvModule.default : ajvModule)({
    allErrors: true,
    strict: false,
    removeAdditional: false,
    ...(mode === "defaults" ? { useDefaults: true } : {})
  });
  instance.addFormat("uri", {
    type: "string",
    validate: (value) => {
      return URL.canParse(value);
    }
  });
  ajvSingletons.set(mode, instance);
  return instance;
}
const schemaCache = /* @__PURE__ */new Map();
function cloneValidationValue(value) {
  if (value === void 0 || value === null) return value;
  return structuredClone(value);
}
function normalizeAjvPath(instancePath) {
  const path = instancePath?.replace(/^\//, "").replace(/\//g, ".");
  return path && path.length > 0 ? path : "<root>";
}
function appendPathSegment(path, segment) {
  const trimmed = segment.trim();
  if (!trimmed) return path;
  if (path === "<root>") return trimmed;
  return `${path}.${trimmed}`;
}
function resolveMissingProperty(error) {
  if (error.keyword !== "required" && error.keyword !== "dependentRequired" && error.keyword !== "dependencies") return null;
  const missingProperty = error.params.missingProperty;
  return typeof missingProperty === "string" && missingProperty.trim() ? missingProperty : null;
}
function resolveAjvErrorPath(error) {
  const basePath = normalizeAjvPath(error.instancePath);
  const missingProperty = resolveMissingProperty(error);
  if (!missingProperty) return basePath;
  return appendPathSegment(basePath, missingProperty);
}
function extractAllowedValues(error) {
  if (error.keyword === "enum") {
    const allowedValues = error.params.allowedValues;
    return Array.isArray(allowedValues) ? allowedValues : null;
  }
  if (error.keyword === "const") {
    const params = error.params;
    if (!Object.prototype.hasOwnProperty.call(params, "allowedValue")) return null;
    return [params.allowedValue];
  }
  return null;
}
function getAjvAllowedValuesSummary(error) {
  const allowedValues = extractAllowedValues(error);
  if (!allowedValues) return null;
  return summarizeAllowedValues(allowedValues);
}
function formatAjvErrors(errors) {
  if (!errors || errors.length === 0) return [{
    path: "<root>",
    message: "invalid config",
    text: "<root>: invalid config"
  }];
  return errors.map((error) => {
    const path = resolveAjvErrorPath(error);
    const baseMessage = error.message ?? "invalid";
    const allowedValuesSummary = getAjvAllowedValuesSummary(error);
    const message = allowedValuesSummary ? appendAllowedValuesHint(baseMessage, allowedValuesSummary) : baseMessage;
    return {
      path,
      message,
      text: `${(0, _safeTextBfEU6V1V.t)(path)}: ${(0, _safeTextBfEU6V1V.t)(message)}`,
      ...(allowedValuesSummary ? {
        allowedValues: allowedValuesSummary.values,
        allowedValuesHiddenCount: allowedValuesSummary.hiddenCount
      } : {})
    };
  });
}
function validateJsonSchemaValue(params) {
  const cacheKey = params.applyDefaults ? `${params.cacheKey}::defaults` : params.cacheKey;
  let cached = schemaCache.get(cacheKey);
  if (!cached || cached.schema !== params.schema) {
    cached = {
      validate: getAjv(params.applyDefaults ? "defaults" : "default").compile(params.schema),
      schema: params.schema
    };
    schemaCache.set(cacheKey, cached);
  }
  const value = params.applyDefaults ? cloneValidationValue(params.value) : params.value;
  if (cached.validate(value)) return {
    ok: true,
    value
  };
  return {
    ok: false,
    errors: formatAjvErrors(cached.validate.errors)
  };
}
//#endregion /* v9-51a460569c84c841 */
