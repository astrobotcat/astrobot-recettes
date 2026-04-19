"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = extractExplicitGroupId;exports.t = formatElevatedUnavailableMessage;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _commandFormatDd3uP = require("./command-format-Dd3uP9-6.js");
var _registryCENZffQG = require("./registry-CENZffQG.js");
var _registryLoadedC109837J = require("./registry-loaded-C109837J.js");
//#region src/auto-reply/reply/group-id-simple.ts
function extractSimpleExplicitGroupId(raw) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(raw) ?? "";
  if (!trimmed) return;
  const parts = trimmed.split(":").filter(Boolean);
  if (parts.length >= 3 && (parts[1] === "group" || parts[1] === "channel")) return parts.slice(2).join(":").replace(/:topic:.*$/, "") || void 0;
  if (parts.length >= 2 && (parts[0] === "group" || parts[0] === "channel")) return parts.slice(1).join(":").replace(/:topic:.*$/, "") || void 0;
  if (parts.length >= 2 && parts[0] === "whatsapp") {
    const joined = parts.slice(1).join(":").replace(/:topic:.*$/, "");
    if (/@g\.us$/i.test(joined)) return joined || void 0;
  }
}
//#endregion
//#region src/auto-reply/reply/group-id.ts
function extractExplicitGroupId(raw) {
  const trimmed = (0, _stringCoerceBUSzWgUA.s)(raw) ?? "";
  if (!trimmed) return;
  const simple = extractSimpleExplicitGroupId(trimmed);
  if (simple) return simple;
  const firstPart = trimmed.split(":").find(Boolean);
  const channelId = (0, _registryCENZffQG.a)(firstPart ?? "") ?? (0, _stringCoerceBUSzWgUA.o)(firstPart);
  const parsed = (channelId ? (0, _registryLoadedC109837J.t)(channelId)?.messaging : void 0)?.parseExplicitTarget?.({ raw: trimmed }) ?? null;
  if (parsed && parsed.chatType && parsed.chatType !== "direct") return parsed.to.replace(/:topic:.*$/, "") || void 0;
}
//#endregion
//#region src/auto-reply/reply/elevated-unavailable.ts
function formatElevatedUnavailableMessage(params) {
  const lines = [];
  lines.push(`elevated is not available right now (runtime=${params.runtimeSandboxed ? "sandboxed" : "direct"}).`);
  if (params.failures.length > 0) lines.push(`Failing gates: ${params.failures.map((f) => `${f.gate} (${f.key})`).join(", ")}`);else
  lines.push("Failing gates: enabled (tools.elevated.enabled / agents.list[].tools.elevated.enabled), allowFrom (tools.elevated.allowFrom.<provider>).");
  lines.push("Fix-it keys:");
  lines.push("- tools.elevated.enabled");
  lines.push("- tools.elevated.allowFrom.<provider>");
  lines.push("- agents.list[].tools.elevated.enabled");
  lines.push("- agents.list[].tools.elevated.allowFrom.<provider>");
  if (params.sessionKey) lines.push(`See: ${(0, _commandFormatDd3uP.t)(`openclaw sandbox explain --session ${params.sessionKey}`)}`);
  return lines.join("\n");
}
//#endregion /* v9-3db511b14eeedac3 */
