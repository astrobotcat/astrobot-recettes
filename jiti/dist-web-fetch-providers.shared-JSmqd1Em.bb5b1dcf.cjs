"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = sortWebFetchProviders;exports.r = sortWebFetchProvidersForAutoDetect;exports.t = resolveBundledWebFetchResolutionConfig;var _webSearchProvidersSharedBiBdRUdb = require("./web-search-providers.shared-BiBdRUdb.js");
//#region src/plugins/web-fetch-providers.shared.ts
function sortWebFetchProviders(providers) {
  return (0, _webSearchProvidersSharedBiBdRUdb.c)(providers);
}
function sortWebFetchProvidersForAutoDetect(providers) {
  return (0, _webSearchProvidersSharedBiBdRUdb.l)(providers);
}
function resolveBundledWebFetchResolutionConfig(params) {
  return (0, _webSearchProvidersSharedBiBdRUdb.o)({
    contract: "webFetchProviders",
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env,
    bundledAllowlistCompat: params.bundledAllowlistCompat
  });
}
//#endregion /* v9-27e0ef8cf711c280 */
