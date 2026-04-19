"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = createReplyPrefixOptions;exports.t = createReplyPrefixContext;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _identityB_Q39IGW = require("./identity-B_Q39IGW.js");
var _responsePrefixTemplateC4m2yxeN = require("./response-prefix-template-C4m2yxeN.js");
//#region src/channels/reply-prefix.ts
function createReplyPrefixContext(params) {
  const { cfg, agentId } = params;
  const prefixContext = { identityName: (0, _stringCoerceBUSzWgUA.s)((0, _identityB_Q39IGW.n)(cfg, agentId)?.name) };
  const onModelSelected = (ctx) => {
    prefixContext.provider = ctx.provider;
    prefixContext.model = (0, _responsePrefixTemplateC4m2yxeN.t)(ctx.model);
    prefixContext.modelFull = `${ctx.provider}/${ctx.model}`;
    prefixContext.thinkingLevel = ctx.thinkLevel ?? "off";
  };
  return {
    prefixContext,
    responsePrefix: (0, _identityB_Q39IGW.r)(cfg, agentId, {
      channel: params.channel,
      accountId: params.accountId
    }).responsePrefix,
    responsePrefixContextProvider: () => prefixContext,
    onModelSelected
  };
}
function createReplyPrefixOptions(params) {
  const { responsePrefix, responsePrefixContextProvider, onModelSelected } = createReplyPrefixContext(params);
  return {
    responsePrefix,
    responsePrefixContextProvider,
    onModelSelected
  };
}
//#endregion /* v9-f1374cf57b9c6864 */
