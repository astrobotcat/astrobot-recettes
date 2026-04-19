"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = mutateConfigFile;exports.r = replaceConfigFile;exports.t = void 0;require("./paths-Dvv9VRAc.js");
require("./types.secrets-CeL3gSMO.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
//#region src/config/mutate.ts
var ConfigMutationConflictError = class extends Error {
  constructor(message, params) {
    super(message);
    this.name = "ConfigMutationConflictError";
    this.currentHash = params.currentHash;
  }
};exports.t = ConfigMutationConflictError;
function assertBaseHashMatches(snapshot, expectedHash) {
  const currentHash = (0, _io5pxHCi7V.h)(snapshot) ?? null;
  if (expectedHash !== void 0 && expectedHash !== currentHash) throw new ConfigMutationConflictError("config changed since last load", { currentHash });
  return currentHash;
}
async function replaceConfigFile(params) {
  const { snapshot, writeOptions } = params.snapshot && params.writeOptions ? {
    snapshot: params.snapshot,
    writeOptions: params.writeOptions
  } : await (0, _io5pxHCi7V.u)();
  const previousHash = assertBaseHashMatches(snapshot, params.baseHash);
  await (0, _io5pxHCi7V.g)(params.nextConfig, {
    baseSnapshot: snapshot,
    ...writeOptions,
    ...params.writeOptions
  });
  return {
    path: snapshot.path,
    previousHash,
    snapshot,
    nextConfig: params.nextConfig
  };
}
async function mutateConfigFile(params) {
  const { snapshot, writeOptions } = await (0, _io5pxHCi7V.u)();
  const previousHash = assertBaseHashMatches(snapshot, params.baseHash);
  const baseConfig = params.base === "runtime" ? snapshot.runtimeConfig : snapshot.sourceConfig;
  const draft = structuredClone(baseConfig);
  const result = await params.mutate(draft, {
    snapshot,
    previousHash
  });
  await (0, _io5pxHCi7V.g)(draft, {
    ...writeOptions,
    ...params.writeOptions
  });
  return {
    path: snapshot.path,
    previousHash,
    snapshot,
    nextConfig: draft,
    result
  };
}
//#endregion /* v9-85be7a90e258ffa1 */
