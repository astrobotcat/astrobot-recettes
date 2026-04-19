"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = loadBundledChannelSecretContractApi;var _publicSurfaceLoaderIj2r4j4v = require("./public-surface-loader-Ij2r4j4v.js");
//#region src/secrets/channel-contract-api.ts
function loadBundledChannelPublicArtifact(channelId, artifactBasenames) {
  for (const artifactBasename of artifactBasenames) try {
    return (0, _publicSurfaceLoaderIj2r4j4v.t)({
      dirName: channelId,
      artifactBasename
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unable to resolve bundled plugin public surface ")) continue;
    if (process.env.OPENCLAW_DEBUG_CHANNEL_CONTRACT_API === "1") {
      const detail = error instanceof Error ? error.message : String(error);
      process.stderr.write(`[channel-contract-api] failed to load ${channelId}/${artifactBasename}: ${detail}\n`);
    }
  }
}
function loadBundledChannelSecretContractApi(channelId) {
  return loadBundledChannelPublicArtifact(channelId, ["secret-contract-api.js", "contract-api.js"]);
}
//#endregion /* v9-0e09c6b32657b006 */
