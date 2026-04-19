"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveOutboundAttachmentFromUrl;var _storeCFeRgpZO = require("./store-CFeRgpZO.js");
var _webMediaB2LIgjX = require("./web-media-B2LIgj-X.js");
var _loadOptionsU_V12gr = require("./load-options-u_-v12gr.js");
//#region src/media/outbound-attachment.ts
async function resolveOutboundAttachmentFromUrl(mediaUrl, maxBytes, options) {
  const media = await (0, _webMediaB2LIgjX.t)(mediaUrl, (0, _loadOptionsU_V12gr.t)({
    maxBytes,
    mediaAccess: options?.mediaAccess,
    mediaLocalRoots: options?.localRoots,
    mediaReadFile: options?.readFile
  }));
  const saved = await (0, _storeCFeRgpZO.l)(media.buffer, media.contentType ?? void 0, "outbound", maxBytes);
  return {
    path: saved.path,
    contentType: saved.contentType
  };
}
//#endregion /* v9-8190d123e7b8e741 */
