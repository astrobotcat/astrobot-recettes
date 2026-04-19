"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = logWarn;exports.i = logSuccess;exports.n = logError;exports.r = logInfo;exports.t = logDebug;var _loggerD8OnBgBc = require("./logger-D8OnBgBc.js");
var _globalStateLrCGCReA = require("./global-state-LrCGCReA.js");
var _runtimeDx7oeLYq = require("./runtime-Dx7oeLYq.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _themeD5sxSdHD = require("./theme-D5sxSdHD.js");
//#region src/logger.ts
const subsystemPrefixRe = /^([a-z][a-z0-9-]{1,20}):\s+(.*)$/i;
function splitSubsystem(message) {
  const match = message.match(subsystemPrefixRe);
  if (!match) return null;
  const [, subsystem, rest] = match;
  return {
    subsystem,
    rest
  };
}
function logWithSubsystem(params) {
  const parsed = params.runtime === _runtimeDx7oeLYq.n ? splitSubsystem(params.message) : null;
  if (parsed) {
    (0, _subsystemCgmckbux.t)(parsed.subsystem)[params.subsystemMethod](parsed.rest);
    return;
  }
  params.runtime[params.runtimeMethod](params.runtimeFormatter(params.message));
  (0, _loggerD8OnBgBc.a)()[params.loggerMethod](params.message);
}
const info = _themeD5sxSdHD.r.info;
const warn = _themeD5sxSdHD.r.warn;
const success = _themeD5sxSdHD.r.success;
const danger = _themeD5sxSdHD.r.error;
function logInfo(message, runtime = _runtimeDx7oeLYq.n) {
  logWithSubsystem({
    message,
    runtime,
    runtimeMethod: "log",
    runtimeFormatter: info,
    loggerMethod: "info",
    subsystemMethod: "info"
  });
}
function logWarn(message, runtime = _runtimeDx7oeLYq.n) {
  logWithSubsystem({
    message,
    runtime,
    runtimeMethod: "log",
    runtimeFormatter: warn,
    loggerMethod: "warn",
    subsystemMethod: "warn"
  });
}
function logSuccess(message, runtime = _runtimeDx7oeLYq.n) {
  logWithSubsystem({
    message,
    runtime,
    runtimeMethod: "log",
    runtimeFormatter: success,
    loggerMethod: "info",
    subsystemMethod: "info"
  });
}
function logError(message, runtime = _runtimeDx7oeLYq.n) {
  logWithSubsystem({
    message,
    runtime,
    runtimeMethod: "error",
    runtimeFormatter: danger,
    loggerMethod: "error",
    subsystemMethod: "error"
  });
}
function logDebug(message) {
  (0, _loggerD8OnBgBc.a)().debug(message);
  if ((0, _globalStateLrCGCReA.t)()) console.log(_themeD5sxSdHD.r.muted(message));
}
//#endregion /* v9-151988e7276486ec */
