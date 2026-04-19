"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = createAccountActionGate; //#region src/channels/plugins/account-action-gate.ts
function createAccountActionGate(params) {
  return (key, defaultValue = true) => {
    const accountValue = params.accountActions?.[key];
    if (accountValue !== void 0) return accountValue;
    const baseValue = params.baseActions?.[key];
    if (baseValue !== void 0) return baseValue;
    return defaultValue;
  };
}
//#endregion /* v9-f900e9bffc76f36e */
