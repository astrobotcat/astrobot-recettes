"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = withEnvAsync;exports.i = withEnv;exports.n = cleanupSessionStateForTest;exports.o = withFetchPreconnect;exports.r = captureEnv;exports.t = createTempHomeEnv;var _fileLockByJeCMLs = require("./file-lock-ByJeCMLs.js");
require("./file-lock-BMw37VAn.js");
var _sessionWriteLockCcI4KSH = require("./session-write-lock-CcI4KSH8.js");
var _storeCacheC6102ouP = require("./store-cache-C6102ouP.js");
var _storeLockStateCuGBI9_ = require("./store-lock-state-Cu-GBI9_.js");
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeOs = _interopRequireDefault(require("node:os"));
var _promises = _interopRequireDefault(require("node:fs/promises"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/test-utils/fetch-mock.ts
function withFetchPreconnect(fn) {
  return Object.assign(fn, {
    preconnect: (_url, _options) => {},
    __openclawAcceptsDispatcher: true
  });
}
//#endregion
//#region src/test-utils/env.ts
function captureEnv(keys) {
  const snapshot = /* @__PURE__ */new Map();
  for (const key of keys) snapshot.set(key, process.env[key]);
  return { restore() {
      for (const [key, value] of snapshot) if (value === void 0) delete process.env[key];else
      process.env[key] = value;
    } };
}
function applyEnvValues(env) {
  for (const [key, value] of Object.entries(env)) if (value === void 0) delete process.env[key];else
  process.env[key] = value;
}
function withEnv(env, fn) {
  const snapshot = captureEnv(Object.keys(env));
  try {
    applyEnvValues(env);
    return fn();
  } finally {
    snapshot.restore();
  }
}
async function withEnvAsync(env, fn) {
  const snapshot = captureEnv(Object.keys(env));
  try {
    applyEnvValues(env);
    return await fn();
  } finally {
    snapshot.restore();
  }
}
//#endregion
//#region src/test-utils/session-state-cleanup.ts
let fileLockDrainerForTests = null;
let sessionStoreLockQueueDrainerForTests = null;
let sessionWriteLockDrainerForTests = null;
async function cleanupSessionStateForTest() {
  await (sessionStoreLockQueueDrainerForTests ?? _storeLockStateCuGBI9_.r)();
  (0, _storeCacheC6102ouP.t)();
  await (fileLockDrainerForTests ?? _fileLockByJeCMLs.n)();
  await (sessionWriteLockDrainerForTests ?? _sessionWriteLockCcI4KSH.r)();
}
//#endregion
//#region src/test-utils/temp-home.ts
const HOME_ENV_KEYS = [
"HOME",
"USERPROFILE",
"HOMEDRIVE",
"HOMEPATH",
"OPENCLAW_STATE_DIR"];

const prefixRoots = /* @__PURE__ */new Map();
const pendingPrefixRoots = /* @__PURE__ */new Map();
let nextHomeIndex = 0;
async function ensurePrefixRoot(prefix) {
  const cached = prefixRoots.get(prefix);
  if (cached) return cached;
  const pending = pendingPrefixRoots.get(prefix);
  if (pending) return await pending;
  const create = _promises.default.mkdtemp(_nodePath.default.join(_nodeOs.default.tmpdir(), prefix));
  pendingPrefixRoots.set(prefix, create);
  try {
    const root = await create;
    prefixRoots.set(prefix, root);
    return root;
  } finally {
    pendingPrefixRoots.delete(prefix);
  }
}
async function createTempHomeEnv(prefix) {
  const prefixRoot = await ensurePrefixRoot(prefix);
  const home = _nodePath.default.join(prefixRoot, `home-${String(nextHomeIndex)}`);
  nextHomeIndex += 1;
  await _promises.default.rm(home, {
    recursive: true,
    force: true
  });
  await _promises.default.mkdir(_nodePath.default.join(home, ".openclaw"), { recursive: true });
  const snapshot = captureEnv([...HOME_ENV_KEYS]);
  process.env.HOME = home;
  process.env.USERPROFILE = home;
  process.env.OPENCLAW_STATE_DIR = _nodePath.default.join(home, ".openclaw");
  if (process.platform === "win32") {
    const match = home.match(/^([A-Za-z]:)(.*)$/);
    if (match) {
      process.env.HOMEDRIVE = match[1];
      process.env.HOMEPATH = match[2] || "\\";
    }
  }
  return {
    home,
    restore: async () => {
      await cleanupSessionStateForTest().catch(() => void 0);
      snapshot.restore();
      await _promises.default.rm(home, {
        recursive: true,
        force: true
      });
    }
  };
}
//#endregion /* v9-85841d094778f61f */
