"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveTelegramInlineButtons;var _approvalCallbackDataCBvBvRhW = require("./approval-callback-data-CBvBvRhW.js");
var _interactiveRuntime = require("openclaw/plugin-sdk/interactive-runtime");
//#region extensions/telegram/src/button-types.ts
const TELEGRAM_INTERACTIVE_ROW_SIZE = 3;
function toTelegramButtonStyle(style) {
  return style === "danger" || style === "success" || style === "primary" ? style : void 0;
}
function chunkInteractiveButtons(buttons, rows) {
  for (let i = 0; i < buttons.length; i += TELEGRAM_INTERACTIVE_ROW_SIZE) {
    const row = buttons.slice(i, i + TELEGRAM_INTERACTIVE_ROW_SIZE).flatMap((button) => {
      const callbackData = (0, _approvalCallbackDataCBvBvRhW.n)(button.value);
      if (!callbackData) return [];
      return [{
        text: button.label,
        callback_data: callbackData,
        style: toTelegramButtonStyle(button.style)
      }];
    });
    if (row.length > 0) rows.push(row);
  }
}
function buildTelegramInteractiveButtons(interactive) {
  const rows = (0, _interactiveRuntime.reduceInteractiveReply)(interactive, [], (state, block) => {
    if (block.type === "buttons") {
      chunkInteractiveButtons(block.buttons, state);
      return state;
    }
    if (block.type === "select") chunkInteractiveButtons(block.options.map((option) => ({
      label: option.label,
      value: option.value
    })), state);
    return state;
  });
  return rows.length > 0 ? rows : void 0;
}
function resolveTelegramInlineButtons(params) {
  return params.buttons ?? buildTelegramInteractiveButtons((0, _interactiveRuntime.normalizeInteractiveReply)(params.interactive));
}
//#endregion /* v9-17981367512d51ae */
