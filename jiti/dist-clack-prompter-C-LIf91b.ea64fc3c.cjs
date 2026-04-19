"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = createClackPrompter;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _ansiBs_ZZlnS = require("./ansi-Bs_ZZlnS.js");
var _themeD5sxSdHD = require("./theme-D5sxSdHD.js");
var _promptsCKJesNrH = require("./prompts-CKJesNrH.js");
var _progressPlFYyayR = require("./progress-plFYyayR.js");
var _promptStyleBRivICXb = require("./prompt-style-BRivICXb.js");
var _noteBuYL4ixE = require("./note-BuYL4ixE.js");
var _prompts = require("@clack/prompts");
//#region src/wizard/clack-prompter.ts
function guardCancel(value) {
  if ((0, _prompts.isCancel)(value)) {
    (0, _prompts.cancel)((0, _promptStyleBRivICXb.r)("Setup cancelled.") ?? "Setup cancelled.");
    throw new _promptsCKJesNrH.t();
  }
  return value;
}
function normalizeSearchTokens(search) {
  return (0, _stringCoerceBUSzWgUA.i)(search).split(/\s+/).map((token) => token.trim()).filter((token) => token.length > 0);
}
function buildOptionSearchText(option) {
  return (0, _stringCoerceBUSzWgUA.i)(`${(0, _ansiBs_ZZlnS.r)(option.label ?? "")} ${(0, _ansiBs_ZZlnS.r)(option.hint ?? "")} ${String(option.value ?? "")}`);
}
function tokenizedOptionFilter(search, option) {
  const tokens = normalizeSearchTokens(search);
  if (tokens.length === 0) return true;
  const haystack = buildOptionSearchText(option);
  return tokens.every((token) => haystack.includes(token));
}
function createClackPrompter() {
  return {
    intro: async (title) => {
      (0, _prompts.intro)((0, _promptStyleBRivICXb.r)(title) ?? title);
    },
    outro: async (message) => {
      (0, _prompts.outro)((0, _promptStyleBRivICXb.r)(message) ?? message);
    },
    note: async (message, title) => {
      (0, _noteBuYL4ixE.t)(message, title);
    },
    select: async (params) => guardCancel(await (0, _prompts.select)({
      message: (0, _promptStyleBRivICXb.n)(params.message),
      options: params.options.map((opt) => {
        const base = {
          value: opt.value,
          label: opt.label
        };
        return opt.hint === void 0 ? base : {
          ...base,
          hint: (0, _promptStyleBRivICXb.t)(opt.hint)
        };
      }),
      initialValue: params.initialValue
    })),
    multiselect: async (params) => {
      const options = params.options.map((opt) => {
        const base = {
          value: opt.value,
          label: opt.label
        };
        return opt.hint === void 0 ? base : {
          ...base,
          hint: (0, _promptStyleBRivICXb.t)(opt.hint)
        };
      });
      if (params.searchable) return guardCancel(await (0, _prompts.autocompleteMultiselect)({
        message: (0, _promptStyleBRivICXb.n)(params.message),
        options,
        initialValues: params.initialValues,
        filter: tokenizedOptionFilter
      }));
      return guardCancel(await (0, _prompts.multiselect)({
        message: (0, _promptStyleBRivICXb.n)(params.message),
        options,
        initialValues: params.initialValues
      }));
    },
    text: async (params) => {
      const validate = params.validate;
      return guardCancel(await (0, _prompts.text)({
        message: (0, _promptStyleBRivICXb.n)(params.message),
        initialValue: params.initialValue,
        placeholder: params.placeholder,
        validate: validate ? (value) => validate(value ?? "") : void 0
      }));
    },
    confirm: async (params) => guardCancel(await (0, _prompts.confirm)({
      message: (0, _promptStyleBRivICXb.n)(params.message),
      initialValue: params.initialValue
    })),
    progress: (label) => {
      const spin = (0, _prompts.spinner)();
      spin.start(_themeD5sxSdHD.r.accent(label));
      const osc = (0, _progressPlFYyayR.t)({
        label,
        indeterminate: true,
        enabled: true,
        fallback: "none"
      });
      return {
        update: (message) => {
          spin.message(_themeD5sxSdHD.r.accent(message));
          osc.setLabel(message);
        },
        stop: (message) => {
          osc.done();
          spin.stop(message);
        }
      };
    }
  };
}
//#endregion /* v9-b841034b62e0520c */
