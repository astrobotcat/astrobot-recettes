"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = buildAgentMediaPayload;require("./local-roots-BrPriMlc.js");
//#region src/plugin-sdk/agent-media-payload.ts
/** Convert outbound media descriptors into the legacy agent payload field layout. */
function buildAgentMediaPayload(mediaList) {
  const first = mediaList[0];
  const mediaPaths = mediaList.map((media) => media.path);
  const mediaTypes = mediaList.map((media) => media.contentType).filter(Boolean);
  return {
    MediaPath: first?.path,
    MediaType: first?.contentType ?? void 0,
    MediaUrl: first?.path,
    MediaPaths: mediaPaths.length > 0 ? mediaPaths : void 0,
    MediaUrls: mediaPaths.length > 0 ? mediaPaths : void 0,
    MediaTypes: mediaTypes.length > 0 ? mediaTypes : void 0
  };
}
//#endregion /* v9-fb3d16b75f0bee97 */
