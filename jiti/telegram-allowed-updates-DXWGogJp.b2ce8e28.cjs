"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveTelegramAllowedUpdates;var grammy = _interopRequireWildcard(require("grammy"));function _interopRequireWildcard(e, t) {if ("function" == typeof WeakMap) var r = new WeakMap(),n = new WeakMap();return (_interopRequireWildcard = function (e, t) {if (!t && e && e.__esModule) return e;var o,i,f = { __proto__: null, default: e };if (null === e || "object" != typeof e && "function" != typeof e) return f;if (o = t ? n : r) {if (o.has(e)) return o.get(e);o.set(e, f);}for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]);return f;})(e, t);}
const DEFAULT_TELEGRAM_UPDATE_TYPES = grammy.API_CONSTANTS?.DEFAULT_UPDATE_TYPES ?? [
"message",
"edited_message",
"channel_post",
"edited_channel_post",
"business_connection",
"business_message",
"edited_business_message",
"deleted_business_messages",
"message_reaction",
"message_reaction_count",
"inline_query",
"chosen_inline_result",
"callback_query",
"shipping_query",
"pre_checkout_query",
"poll",
"poll_answer",
"my_chat_member",
"chat_member",
"chat_join_request"];

function resolveTelegramAllowedUpdates() {
  const updates = [...DEFAULT_TELEGRAM_UPDATE_TYPES];
  if (!updates.includes("message_reaction")) updates.push("message_reaction");
  if (!updates.includes("channel_post")) updates.push("channel_post");
  return updates;
}
//#endregion /* v9-59ecc257916cb49b */
