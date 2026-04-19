"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = resolveAndPersistSessionFile;var _storeDFXcceZJ = require("./store-DFXcceZJ.js");
var _pathsCZMxg3hs = require("./paths-CZMxg3hs.js");
//#region src/config/sessions/session-file.ts
async function resolveAndPersistSessionFile(params) {
  const { sessionId, sessionKey, sessionStore, storePath } = params;
  const baseEntry = params.sessionEntry ?? sessionStore[sessionKey] ?? {
    sessionId,
    updatedAt: Date.now()
  };
  const fallbackSessionFile = params.fallbackSessionFile?.trim();
  const sessionFile = (0, _pathsCZMxg3hs.i)(sessionId, !baseEntry.sessionFile && fallbackSessionFile ? {
    ...baseEntry,
    sessionFile: fallbackSessionFile
  } : baseEntry, {
    agentId: params.agentId,
    sessionsDir: params.sessionsDir
  });
  const persistedEntry = {
    ...baseEntry,
    sessionId,
    updatedAt: Date.now(),
    sessionFile
  };
  if (baseEntry.sessionId !== sessionId || baseEntry.sessionFile !== sessionFile) {
    sessionStore[sessionKey] = persistedEntry;
    await (0, _storeDFXcceZJ.c)(storePath, (store) => {
      store[sessionKey] = {
        ...store[sessionKey],
        ...persistedEntry
      };
    }, params.activeSessionKey || params.maintenanceConfig ? {
      ...(params.activeSessionKey ? { activeSessionKey: params.activeSessionKey } : {}),
      ...(params.maintenanceConfig ? { maintenanceConfig: params.maintenanceConfig } : {})
    } : void 0);
    return {
      sessionFile,
      sessionEntry: persistedEntry
    };
  }
  sessionStore[sessionKey] = persistedEntry;
  return {
    sessionFile,
    sessionEntry: persistedEntry
  };
}
//#endregion /* v9-c2e17ec0467be003 */
