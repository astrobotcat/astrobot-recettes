"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = formatPluginInstallPathIssue;exports.t = detectPluginInstallPathIssue;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _nodePath = _interopRequireDefault(require("node:path"));
var _promises = _interopRequireDefault(require("node:fs/promises"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/plugin-install-path-warnings.ts
function resolvePluginInstallCandidatePaths(install) {
  if (!install || install.source !== "path") return [];
  return [install.sourcePath, install.installPath].map((value) => (0, _stringCoerceBUSzWgUA.s)(value) ?? "").filter(Boolean);
}
async function detectPluginInstallPathIssue(params) {
  const candidatePaths = resolvePluginInstallCandidatePaths(params.install);
  if (candidatePaths.length === 0) return null;
  for (const candidatePath of candidatePaths) try {
    await _promises.default.access(_nodePath.default.resolve(candidatePath));
    return {
      kind: "custom-path",
      pluginId: params.pluginId,
      path: candidatePath
    };
  } catch {}
  return {
    kind: "missing-path",
    pluginId: params.pluginId,
    path: candidatePaths[0] ?? "(unknown)"
  };
}
function formatPluginInstallPathIssue(params) {
  const formatCommand = params.formatCommand ?? ((command) => command);
  if (params.issue.kind === "custom-path") return [
  `${params.pluginLabel} is installed from a custom path: ${params.issue.path}`,
  `Main updates will not automatically replace that plugin with the repo's default ${params.pluginLabel} package.`,
  `Reinstall with "${formatCommand(params.defaultInstallCommand)}" when you want to return to the standard ${params.pluginLabel} plugin.`,
  ...(params.repoInstallCommand ? [`If you are intentionally running from a repo checkout, reinstall that checkout explicitly with "${formatCommand(params.repoInstallCommand)}" after updates.`] : [])];

  return [
  `${params.pluginLabel} is installed from a custom path that no longer exists: ${params.issue.path}`,
  `Reinstall with "${formatCommand(params.defaultInstallCommand)}".`,
  ...(params.repoInstallCommand ? [`If you are running from a repo checkout, you can also use "${formatCommand(params.repoInstallCommand)}".`] : [])];

}
//#endregion /* v9-624788067acaf8c0 */
