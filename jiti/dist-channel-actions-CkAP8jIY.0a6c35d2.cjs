"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = listTokenSourcedAccounts;exports.i = createUnionActionGate;exports.n = createMessageToolCardSchema;exports.r = resolveReactionMessageId;exports.t = createMessageToolButtonsSchema;var _commonBWtun2If = require("./common-BWtun2If.js");
require("./sandbox-paths-C5p25GeS.js");
var _typeboxUTirCdtG = require("./typebox-UTirCdtG.js");
var _typebox = require("@sinclair/typebox");
//#region src/channels/plugins/actions/shared.ts
function listTokenSourcedAccounts(accounts) {
  return accounts.filter((account) => account.tokenSource !== "none");
}
function createUnionActionGate(accounts, createGate) {
  const gates = accounts.map((account) => createGate(account));
  return (key, defaultValue = true) => gates.some((gate) => gate(key, defaultValue));
}
//#endregion
//#region src/channels/plugins/actions/reaction-message-id.ts
function resolveReactionMessageId(params) {
  return (0, _commonBWtun2If.m)(params.args, "messageId") ?? params.toolContext?.currentMessageId;
}
//#endregion
//#region src/plugin-sdk/channel-actions.ts
/** Schema helper for channels that expose button rows on the shared `message` tool. */
function createMessageToolButtonsSchema() {
  return _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.Array(_typebox.Type.Object({
    text: _typebox.Type.String(),
    callback_data: _typebox.Type.String(),
    style: _typebox.Type.Optional((0, _typeboxUTirCdtG.i)([
    "danger",
    "success",
    "primary"]
    ))
  })), { description: "Button rows for channels that support button-style actions." }));
}
/** Schema helper for channels that accept provider-native card payloads. */
function createMessageToolCardSchema() {
  return _typebox.Type.Optional(_typebox.Type.Object({}, {
    additionalProperties: true,
    description: "Structured card payload for channels that support card-style messages."
  }));
}
//#endregion /* v9-d9186492d8215862 */
