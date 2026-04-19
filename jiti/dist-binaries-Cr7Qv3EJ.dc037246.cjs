"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = ensureBinary;var _runtimeDx7oeLYq = require("./runtime-Dx7oeLYq.js");
var _execBAdwyfxI = require("./exec-BAdwyfxI.js");
//#region src/infra/binaries.ts
async function ensureBinary(name, exec = _execBAdwyfxI.i, runtime = _runtimeDx7oeLYq.n) {
  await exec("which", [name]).catch(() => {
    runtime.error(`Missing required binary: ${name}. Please install it.`);
    runtime.exit(1);
  });
}
//#endregion /* v9-c44da7c964fa68b8 */
