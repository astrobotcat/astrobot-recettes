"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = shouldDebounceTextInbound;exports.t = createChannelInboundDebouncer;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _commandDetectionB01vikFY = require("./command-detection-B01vikFY.js");
var _inboundDebounceD1rreWV = require("./inbound-debounce-D1rreWV7.js");
require("./mentions-DXpYnKaK.js");
require("./direct-dm-Di-7DpVE.js");
require("./session-envelope-AsZhkZyg.js");
//#region src/channels/inbound-debounce-policy.ts
function shouldDebounceTextInbound(params) {
  if (params.allowDebounce === false) return false;
  if (params.hasMedia) return false;
  const text = (0, _stringCoerceBUSzWgUA.s)(params.text) ?? "";
  if (!text) return false;
  return !(0, _commandDetectionB01vikFY.t)(text, params.cfg, params.commandOptions);
}
function createChannelInboundDebouncer(params) {
  const debounceMs = (0, _inboundDebounceD1rreWV.n)({
    cfg: params.cfg,
    channel: params.channel,
    overrideMs: params.debounceMsOverride
  });
  const { cfg: _cfg, channel: _channel, debounceMsOverride: _override, ...rest } = params;
  return {
    debounceMs,
    debouncer: (0, _inboundDebounceD1rreWV.t)({
      debounceMs,
      ...rest
    })
  };
}
//#endregion /* v9-b70abb977ada2792 */
