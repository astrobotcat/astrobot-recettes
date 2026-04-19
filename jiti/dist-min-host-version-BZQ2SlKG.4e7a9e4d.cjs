"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = checkMinHostVersion;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _runtimeGuardBWDkLtoT = require("./runtime-guard-BWDkLtoT.js");
//#region src/plugins/min-host-version.ts
const MIN_HOST_VERSION_FORMAT = "openclaw.install.minHostVersion must use a semver floor in the form \">=x.y.z\"";
const MIN_HOST_VERSION_RE = /^>=(\d+)\.(\d+)\.(\d+)$/;
function parseMinHostVersionRequirement(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const match = trimmed.match(MIN_HOST_VERSION_RE);
  if (!match) return null;
  const minimumLabel = `${match[1]}.${match[2]}.${match[3]}`;
  if (!(0, _runtimeGuardBWDkLtoT.a)(minimumLabel)) return null;
  return {
    raw: trimmed,
    minimumLabel
  };
}
function checkMinHostVersion(params) {
  if (params.minHostVersion === void 0) return {
    ok: true,
    requirement: null
  };
  const requirement = parseMinHostVersionRequirement(params.minHostVersion);
  if (!requirement) return {
    ok: false,
    kind: "invalid",
    error: MIN_HOST_VERSION_FORMAT
  };
  const currentVersion = (0, _stringCoerceBUSzWgUA.s)(params.currentVersion) || "unknown";
  const currentSemver = (0, _runtimeGuardBWDkLtoT.a)(currentVersion);
  if (!currentSemver) return {
    ok: false,
    kind: "unknown_host_version",
    requirement
  };
  if (!(0, _runtimeGuardBWDkLtoT.n)(currentSemver, (0, _runtimeGuardBWDkLtoT.a)(requirement.minimumLabel))) return {
    ok: false,
    kind: "incompatible",
    requirement,
    currentVersion
  };
  return {
    ok: true,
    requirement
  };
}
//#endregion /* v9-b5f398fe2423a861 */
