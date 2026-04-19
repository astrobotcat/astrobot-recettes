"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = listSetupProviderIds;exports.t = listSetupCliBackendIds; //#region src/plugins/setup-descriptors.ts
function listSetupProviderIds(record) {
  return record.setup?.providers?.map((entry) => entry.id) ?? record.providers;
}
function listSetupCliBackendIds(record) {
  return record.setup?.cliBackends ?? record.cliBackends;
}
//#endregion /* v9-ef6aabf291479702 */
