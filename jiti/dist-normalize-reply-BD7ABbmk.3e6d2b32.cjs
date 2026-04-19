"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = normalizeReplyPayload;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _tokensCKM4Lddu = require("./tokens-CKM4Lddu.js");
var _heartbeatDYyKvnDp = require("./heartbeat-DYyKvnDp.js");
var _sanitizeUserFacingTextCQF1CTnZ = require("./sanitize-user-facing-text-CQF1CTnZ.js");
var _payloadCS7dEmmu = require("./payload-CS7dEmmu.js");
var _responsePrefixTemplateC4m2yxeN = require("./response-prefix-template-C4m2yxeN.js");
//#region src/auto-reply/reply/normalize-reply.ts
function normalizeReplyPayload(payload, opts = {}) {
  const applyChannelTransforms = opts.applyChannelTransforms ?? true;
  const hasContent = (text) => (0, _payloadCS7dEmmu.i)({
    ...payload,
    text
  }, { trimText: true });
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(payload.text) ?? "";
  if (!hasContent(trimmed)) {
    opts.onSkip?.("empty");
    return null;
  }
  const silentToken = opts.silentToken ?? "NO_REPLY";
  let text = payload.text ?? void 0;
  if (text && (0, _tokensCKM4Lddu.r)(text, silentToken)) {
    if (!hasContent("")) {
      opts.onSkip?.("silent");
      return null;
    }
    text = "";
  }
  if (text && !(0, _tokensCKM4Lddu.a)(text, silentToken)) {
    const hasLeadingSilentToken = (0, _tokensCKM4Lddu.o)(text, silentToken);
    if (hasLeadingSilentToken) text = (0, _tokensCKM4Lddu.s)(text, silentToken);
    if (hasLeadingSilentToken || text.toLowerCase().includes(silentToken.toLowerCase())) {
      text = (0, _tokensCKM4Lddu.c)(text, silentToken);
      if (!hasContent(text)) {
        opts.onSkip?.("silent");
        return null;
      }
    }
  }
  if (text && !trimmed) text = "";
  if ((opts.stripHeartbeat ?? true) && text?.includes("HEARTBEAT_OK")) {
    const stripped = (0, _heartbeatDYyKvnDp.s)(text, { mode: "message" });
    if (stripped.didStrip) opts.onHeartbeatStrip?.();
    if (stripped.shouldSkip && !hasContent(stripped.text)) {
      opts.onSkip?.("heartbeat");
      return null;
    }
    text = stripped.text;
  }
  if (text) text = (0, _sanitizeUserFacingTextCQF1CTnZ.u)(text, { errorContext: Boolean(payload.isError) });
  if (!hasContent(text)) {
    opts.onSkip?.("empty");
    return null;
  }
  let enrichedPayload = {
    ...payload,
    text
  };
  if (applyChannelTransforms && opts.transformReplyPayload) {
    enrichedPayload = opts.transformReplyPayload(enrichedPayload) ?? enrichedPayload;
    text = enrichedPayload.text;
  }
  const effectivePrefix = opts.responsePrefixContext ? (0, _responsePrefixTemplateC4m2yxeN.n)(opts.responsePrefix, opts.responsePrefixContext) : opts.responsePrefix;
  if (effectivePrefix && text && text.trim() !== "HEARTBEAT_OK" && !text.startsWith(effectivePrefix)) text = `${effectivePrefix} ${text}`;
  enrichedPayload = {
    ...enrichedPayload,
    text
  };
  return enrichedPayload;
}
//#endregion /* v9-2fce6440785ed0b7 */
