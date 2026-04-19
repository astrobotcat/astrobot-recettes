"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveManifestCommandAliasOwner;var _manifestDKZWfJEu = require("./manifest-DKZWfJEu.js");
var _manifestRegistryBd3A4lqx = require("./manifest-registry-Bd3A4lqx.js");
//#region src/plugins/manifest-command-aliases.runtime.ts
function resolveManifestCommandAliasOwner(params) {
  const registry = params.registry ?? (0, _manifestRegistryBd3A4lqx.t)({
    config: params.config,
    workspaceDir: params.workspaceDir,
    env: params.env
  });
  return (0, _manifestDKZWfJEu.o)({
    command: params.command,
    registry
  });
}
//#endregion /* v9-0619672f12c70d01 */
