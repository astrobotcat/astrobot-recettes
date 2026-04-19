"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = rejectPendingPairingRequest; //#region src/infra/pairing-pending.ts
async function rejectPendingPairingRequest(params) {
  const state = await params.loadState();
  const pending = state.pendingById[params.requestId];
  if (!pending) return null;
  delete state.pendingById[params.requestId];
  await params.persistState(state);
  return {
    requestId: params.requestId,
    [params.idKey]: params.getId(pending)
  };
}
//#endregion /* v9-10a914d6264ffbcf */
