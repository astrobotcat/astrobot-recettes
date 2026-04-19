"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = extractToolSend;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
//#region src/plugin-sdk/tool-send.ts
/** Extract the canonical send target fields from tool arguments when the action matches. */
function extractToolSend(args, expectedAction = "sendMessage") {
  if (((0, _stringCoerceBUSzWgUA.d)(args.action)?.trim() ?? "") !== expectedAction) return null;
  const to = (0, _stringCoerceBUSzWgUA.d)(args.to);
  if (!to) return null;
  const accountId = (0, _stringCoerceBUSzWgUA.d)(args.accountId)?.trim();
  const threadIdRaw = typeof args.threadId === "number" ? String(args.threadId) : (0, _stringCoerceBUSzWgUA.d)(args.threadId)?.trim() ?? "";
  return {
    to,
    accountId,
    threadId: threadIdRaw.length > 0 ? threadIdRaw : void 0
  };
}
//#endregion /* v9-a11b4622175b7310 */
