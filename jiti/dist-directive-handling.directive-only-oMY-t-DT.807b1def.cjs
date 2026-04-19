"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = isDirectiveOnly;var _mentionsDXpYnKaK = require("./mentions-DXpYnKaK.js");
//#region src/auto-reply/reply/directive-handling.directive-only.ts
function isDirectiveOnly(params) {
  const { directives, cleanedBody, ctx, cfg, agentId, isGroup } = params;
  if (!directives.hasThinkDirective && !directives.hasVerboseDirective && !directives.hasTraceDirective && !directives.hasFastDirective && !directives.hasReasoningDirective && !directives.hasElevatedDirective && !directives.hasExecDirective && !directives.hasModelDirective && !directives.hasQueueDirective) return false;
  const stripped = (0, _mentionsDXpYnKaK.s)(cleanedBody ?? "");
  return (isGroup ? (0, _mentionsDXpYnKaK.o)(stripped, ctx, cfg, agentId) : stripped).length === 0;
}
//#endregion /* v9-69c10e3b9a9d92b9 */
