"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = void 0;exports.n = createEmptyChannelDirectoryAdapter;exports.r = void 0;exports.t = createChannelDirectoryAdapter;require("./read-only-account-inspect-BiLlFb9q.js");
//#region src/channels/plugins/directory-adapters.ts
const nullChannelDirectorySelf = async () => null;exports.i = nullChannelDirectorySelf;
const emptyChannelDirectoryList = async () => [];
/** Build a channel directory adapter with a null self resolver by default. */exports.r = emptyChannelDirectoryList;
function createChannelDirectoryAdapter(params = {}) {
  return {
    self: params.self ?? nullChannelDirectorySelf,
    ...params
  };
}
/** Build the common empty directory surface for channels without directory support. */
function createEmptyChannelDirectoryAdapter() {
  return createChannelDirectoryAdapter({
    listPeers: emptyChannelDirectoryList,
    listGroups: emptyChannelDirectoryList
  });
}
//#endregion /* v9-12033fde936b5a76 */
