"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = void 0; //#region src/wizard/prompts.ts
var WizardCancelledError = class extends Error {
  constructor(message = "wizard cancelled") {
    super(message);
    this.name = "WizardCancelledError";
  }
};
//#endregion
exports.t = WizardCancelledError; /* v9-6e7565dbd6e459c6 */
