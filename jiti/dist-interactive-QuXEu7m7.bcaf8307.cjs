"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = reduceInteractiveReply; //#region src/channels/plugins/outbound/interactive.ts
function reduceInteractiveReply(interactive, initialState, reduce) {
  let state = initialState;
  for (const [index, block] of (interactive?.blocks ?? []).entries()) state = reduce(state, block, index);
  return state;
}
//#endregion /* v9-36e51968813514cf */
