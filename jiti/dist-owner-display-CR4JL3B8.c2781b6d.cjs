"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = resolveOwnerDisplaySetting;exports.t = ensureOwnerDisplaySecret;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/owner-display.ts
/**
* Resolve owner display settings for prompt rendering.
* Keep auth secrets decoupled from owner hash secrets.
*/
function resolveOwnerDisplaySetting(config) {
  const ownerDisplay = config?.commands?.ownerDisplay;
  if (ownerDisplay !== "hash") return {
    ownerDisplay,
    ownerDisplaySecret: void 0
  };
  return {
    ownerDisplay: "hash",
    ownerDisplaySecret: (0, _stringCoerceBUSzWgUA.s)(config?.commands?.ownerDisplaySecret)
  };
}
/**
* Ensure hash mode has a dedicated secret.
* Returns updated config and generated secret when autofill was needed.
*/
function ensureOwnerDisplaySecret(config, generateSecret = () => _nodeCrypto.default.randomBytes(32).toString("hex")) {
  const settings = resolveOwnerDisplaySetting(config);
  if (settings.ownerDisplay !== "hash" || settings.ownerDisplaySecret) return { config };
  const generatedSecret = generateSecret();
  return {
    config: {
      ...config,
      commands: {
        ...config.commands,
        ownerDisplay: "hash",
        ownerDisplaySecret: generatedSecret
      }
    },
    generatedSecret
  };
}
//#endregion /* v9-921e81882a2fec9b */
