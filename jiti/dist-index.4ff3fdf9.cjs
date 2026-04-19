"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;
var _fastStringTruncatedWidth = _interopRequireDefault(require("fast-string-truncated-width"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };} /* IMPORT */
/* HELPERS */
const NO_TRUNCATION = {
  limit: Infinity,
  ellipsis: '',
  ellipsisWidth: 0
};
/* MAIN */
const fastStringWidth = (input, options = {}) => {
  return (0, _fastStringTruncatedWidth.default)(input, NO_TRUNCATION, options).width;
};
/* EXPORT */var _default = exports.default =
fastStringWidth; /* v9-df2042de567582f7 */
