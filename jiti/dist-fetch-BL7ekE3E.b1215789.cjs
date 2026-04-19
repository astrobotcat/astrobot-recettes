"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = fetchRemoteMedia;exports.t = void 0;var _redactD4nea1HF = require("./redact-D4nea1HF.js");
var _errorsD8p6rxH = require("./errors-D8p6rxH8.js");
var _mimeB6nXlmtY = require("./mime-B6nXlmtY.js");
var _fetchGuardB3p4gGaY = require("./fetch-guard-B3p4gGaY.js");
var _readResponseWithLimitBs3gJWU = require("./read-response-with-limit-Bs3gJWU6.js");
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/media/fetch.ts
var MediaFetchError = class extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.code = code;
    this.name = "MediaFetchError";
  }
};exports.t = MediaFetchError;
function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}
function parseContentDispositionFileName(header) {
  if (!header) return;
  const starMatch = /filename\*\s*=\s*([^;]+)/i.exec(header);
  if (starMatch?.[1]) {
    const cleaned = stripQuotes(starMatch[1].trim());
    const encoded = cleaned.split("''").slice(1).join("''") || cleaned;
    try {
      return _nodePath.default.basename(decodeURIComponent(encoded));
    } catch {
      return _nodePath.default.basename(encoded);
    }
  }
  const match = /filename\s*=\s*([^;]+)/i.exec(header);
  if (match?.[1]) return _nodePath.default.basename(stripQuotes(match[1].trim()));
}
async function readErrorBodySnippet(res, opts) {
  try {
    return await (0, _readResponseWithLimitBs3gJWU.t)(res, {
      maxBytes: 8 * 1024,
      maxChars: opts?.maxChars,
      chunkTimeoutMs: opts?.chunkTimeoutMs
    });
  } catch {
    return;
  }
}
function redactMediaUrl(url) {
  return (0, _redactD4nea1HF.r)(url);
}
async function fetchRemoteMedia(options) {
  const { url, fetchImpl, requestInit, filePathHint, maxBytes, maxRedirects, readIdleTimeoutMs, ssrfPolicy, lookupFn, dispatcherAttempts, shouldRetryFetchError, trustExplicitProxyDns } = options;
  const sourceUrl = redactMediaUrl(url);
  let res;
  let finalUrl = url;
  let release = null;
  const attempts = dispatcherAttempts && dispatcherAttempts.length > 0 ? dispatcherAttempts : [{
    dispatcherPolicy: void 0,
    lookupFn
  }];
  const runGuardedFetch = async (attempt) => await (0, _fetchGuardB3p4gGaY.n)((trustExplicitProxyDns && attempt.dispatcherPolicy?.mode === "explicit-proxy" ? _fetchGuardB3p4gGaY.o : _fetchGuardB3p4gGaY.i)({
    url,
    fetchImpl,
    init: requestInit,
    maxRedirects,
    policy: ssrfPolicy,
    lookupFn: attempt.lookupFn ?? lookupFn,
    dispatcherPolicy: attempt.dispatcherPolicy
  }));
  try {
    let result;
    const attemptErrors = [];
    for (let i = 0; i < attempts.length; i += 1) try {
      result = await runGuardedFetch(attempts[i]);
      break;
    } catch (err) {
      if (typeof shouldRetryFetchError !== "function" || !shouldRetryFetchError(err) || i === attempts.length - 1) {
        if (attemptErrors.length > 0) {
          const combined = new Error(`Primary fetch failed and fallback fetch also failed for ${sourceUrl}`, { cause: err });
          combined.primaryError = attemptErrors[0];
          combined.attemptErrors = [...attemptErrors, err];
          throw combined;
        }
        throw err;
      }
      attemptErrors.push(err);
    }
    res = result.response;
    finalUrl = result.finalUrl;
    release = result.release;
  } catch (err) {
    throw new MediaFetchError("fetch_failed", `Failed to fetch media from ${sourceUrl}: ${(0, _errorsD8p6rxH.i)(err)}`, { cause: err });
  }
  try {
    if (!res.ok) {
      const statusText = res.statusText ? ` ${res.statusText}` : "";
      const redirected = finalUrl !== url ? ` (redirected to ${redactMediaUrl(finalUrl)})` : "";
      let detail = `HTTP ${res.status}${statusText}`;
      if (!res.body) detail = `HTTP ${res.status}${statusText}; empty response body`;else
      {
        const snippet = await readErrorBodySnippet(res, { chunkTimeoutMs: readIdleTimeoutMs });
        if (snippet) detail += `; body: ${snippet}`;
      }
      throw new MediaFetchError("http_error", `Failed to fetch media from ${sourceUrl}${redirected}: ${(0, _redactD4nea1HF.r)(detail)}`);
    }
    const contentLength = res.headers.get("content-length");
    if (maxBytes && contentLength) {
      const length = Number(contentLength);
      if (Number.isFinite(length) && length > maxBytes) throw new MediaFetchError("max_bytes", `Failed to fetch media from ${sourceUrl}: content length ${length} exceeds maxBytes ${maxBytes}`);
    }
    let buffer;
    try {
      buffer = maxBytes ? await (0, _readResponseWithLimitBs3gJWU.n)(res, maxBytes, {
        onOverflow: ({ maxBytes, res }) => new MediaFetchError("max_bytes", `Failed to fetch media from ${redactMediaUrl(res.url || url)}: payload exceeds maxBytes ${maxBytes}`),
        chunkTimeoutMs: readIdleTimeoutMs
      }) : Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (err instanceof MediaFetchError) throw err;
      throw new MediaFetchError("fetch_failed", `Failed to fetch media from ${redactMediaUrl(res.url || url)}: ${(0, _errorsD8p6rxH.i)(err)}`, { cause: err });
    }
    let fileNameFromUrl;
    try {
      const parsed = new URL(finalUrl);
      fileNameFromUrl = _nodePath.default.basename(parsed.pathname) || void 0;
    } catch {}
    const headerFileName = parseContentDispositionFileName(res.headers.get("content-disposition"));
    let fileName = headerFileName || fileNameFromUrl || (filePathHint ? _nodePath.default.basename(filePathHint) : void 0);
    const filePathForMime = headerFileName && _nodePath.default.extname(headerFileName) ? headerFileName : filePathHint ?? finalUrl;
    const contentType = await (0, _mimeB6nXlmtY.t)({
      buffer,
      headerMime: res.headers.get("content-type"),
      filePath: filePathForMime
    });
    if (fileName && !_nodePath.default.extname(fileName) && contentType) {
      const ext = (0, _mimeB6nXlmtY.n)(contentType);
      if (ext) fileName = `${fileName}${ext}`;
    }
    return {
      buffer,
      contentType: contentType ?? void 0,
      fileName
    };
  } finally {
    if (release) await release();
  }
}
//#endregion /* v9-f7f435fed9b1f0e7 */
