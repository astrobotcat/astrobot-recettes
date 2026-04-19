"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = tryListenOnPort;var _nodeNet = _interopRequireDefault(require("node:net"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/ports-probe.ts
async function tryListenOnPort(params) {
  const listenOptions = { port: params.port };
  if (params.host) listenOptions.host = params.host;
  if (typeof params.exclusive === "boolean") listenOptions.exclusive = params.exclusive;
  await new Promise((resolve, reject) => {
    const tester = _nodeNet.default.createServer().once("error", (err) => reject(err)).once("listening", () => {
      tester.close(() => resolve());
    }).listen(listenOptions);
  });
}
//#endregion /* v9-5035e62dd80231ab */
