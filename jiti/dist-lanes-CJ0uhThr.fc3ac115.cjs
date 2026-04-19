"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = void 0;exports.r = resolveNestedAgentLane;exports.t = void 0;var _lanesCU7Ll8dR = require("./lanes-CU7Ll8dR.js");
//#region src/agents/lanes.ts
const AGENT_LANE_NESTED = exports.t = _lanesCU7Ll8dR.t.Nested;
const AGENT_LANE_SUBAGENT = exports.n = _lanesCU7Ll8dR.t.Subagent;
function resolveNestedAgentLane(lane) {
  const trimmed = lane?.trim();
  if (!trimmed || trimmed === "cron") return AGENT_LANE_NESTED;
  return trimmed;
}
//#endregion /* v9-d8737b3e8743c6a3 */
