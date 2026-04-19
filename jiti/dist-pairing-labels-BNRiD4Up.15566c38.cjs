"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolvePairingIdLabel;var _pairingStoreC_d7unmE = require("./pairing-store-C_d7unmE.js");
//#region src/pairing/pairing-labels.ts
function resolvePairingIdLabel(channel) {
  return (0, _pairingStoreC_d7unmE.f)(channel)?.idLabel ?? "userId";
}
//#endregion /* v9-156fc240e970e026 */
