"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = buildCommandContext;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _commandsRegistryNormalizeBy3bcvJy = require("./commands-registry-normalize-By3bcvJy.js");
var _mentionsDXpYnKaK = require("./mentions-DXpYnKaK.js");
var _commandAuthC4VasUjw = require("./command-auth-C4VasUjw.js");
//#region src/auto-reply/reply/commands-context.ts
function buildCommandContext(params) {
  const { ctx, cfg, agentId, sessionKey, isGroup, triggerBodyNormalized } = params;
  const auth = (0, _commandAuthC4VasUjw.t)({
    ctx,
    cfg,
    commandAuthorized: params.commandAuthorized
  });
  const surface = (0, _stringCoerceBUSzWgUA.i)(ctx.Surface ?? ctx.Provider);
  const channel = (0, _stringCoerceBUSzWgUA.i)(ctx.Provider ?? surface);
  const abortKey = sessionKey ?? (auth.from || void 0) ?? (auth.to || void 0);
  const rawBodyNormalized = triggerBodyNormalized;
  const commandBodyNormalized = (0, _commandsRegistryNormalizeBy3bcvJy.r)(isGroup ? (0, _mentionsDXpYnKaK.o)(rawBodyNormalized, ctx, cfg, agentId) : rawBodyNormalized, { botUsername: ctx.BotUsername });
  return {
    surface,
    channel,
    channelId: auth.providerId,
    ownerList: auth.ownerList,
    senderIsOwner: auth.senderIsOwner,
    isAuthorizedSender: auth.isAuthorizedSender,
    senderId: auth.senderId,
    abortKey,
    rawBodyNormalized,
    commandBodyNormalized,
    from: auth.from,
    to: auth.to
  };
}
//#endregion /* v9-81ca13775a0c6983 */
