"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveOpenClawAgentDir;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _sessionKeyBh1lMwK = require("./session-key-Bh1lMwK5.js");
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/agent-paths.ts
function resolveOpenClawAgentDir(env = process.env) {
  const override = env.OPENCLAW_AGENT_DIR?.trim() || env.PI_CODING_AGENT_DIR?.trim();
  if (override) return (0, _utilsD5DtWkEu.m)(override, env);
  return (0, _utilsD5DtWkEu.m)(_nodePath.default.join((0, _pathsDvv9VRAc._)(env), "agents", _sessionKeyBh1lMwK.t, "agent"), env);
}
//#endregion /* v9-4f27bb236bc10ec9 */
