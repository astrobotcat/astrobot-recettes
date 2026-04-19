"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = createChannelReplyPipeline;var _registryDelpa74L = require("./registry-Delpa74L.js");
require("./plugins-D4ODSIPT.js");
var _replyPrefixB7rVRMC = require("./reply-prefix-B7rVR-MC.js");
var _typingC2Vhmqty = require("./typing-C2Vhmqty.js");
//#region src/plugin-sdk/channel-reply-pipeline.ts
function createChannelReplyPipeline(params) {
  const channelId = params.channel ? (0, _registryDelpa74L.i)(params.channel) ?? params.channel : void 0;
  let plugin;
  let pluginTransformResolved = false;
  const resolvePluginTransform = () => {
    if (pluginTransformResolved) return plugin?.messaging?.transformReplyPayload;
    pluginTransformResolved = true;
    plugin = channelId ? (0, _registryDelpa74L.t)(channelId) : void 0;
    return plugin?.messaging?.transformReplyPayload;
  };
  const transformReplyPayload = params.transformReplyPayload ? params.transformReplyPayload : channelId ? (payload) => resolvePluginTransform()?.({
    payload,
    cfg: params.cfg,
    accountId: params.accountId
  }) ?? payload : void 0;
  return {
    ...(0, _replyPrefixB7rVRMC.n)({
      cfg: params.cfg,
      agentId: params.agentId,
      channel: params.channel,
      accountId: params.accountId
    }),
    ...(transformReplyPayload ? { transformReplyPayload } : {}),
    ...(params.typingCallbacks ? { typingCallbacks: params.typingCallbacks } : params.typing ? { typingCallbacks: (0, _typingC2Vhmqty.t)(params.typing) } : {})
  };
}
//#endregion /* v9-1355524775e13f19 */
