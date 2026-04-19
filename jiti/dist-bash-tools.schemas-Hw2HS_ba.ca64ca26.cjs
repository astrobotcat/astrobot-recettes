"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = exports.n = void 0;var _typebox = require("@sinclair/typebox");
//#region src/agents/bash-tools.schemas.ts
const execSchema = exports.t = _typebox.Type.Object({
  command: _typebox.Type.String({ description: "Shell command to execute" }),
  workdir: _typebox.Type.Optional(_typebox.Type.String({ description: "Working directory (defaults to cwd)" })),
  env: _typebox.Type.Optional(_typebox.Type.Record(_typebox.Type.String(), _typebox.Type.String())),
  yieldMs: _typebox.Type.Optional(_typebox.Type.Number({ description: "Milliseconds to wait before backgrounding (default 10000)" })),
  background: _typebox.Type.Optional(_typebox.Type.Boolean({ description: "Run in background immediately" })),
  timeout: _typebox.Type.Optional(_typebox.Type.Number({ description: "Timeout in seconds (optional, kills process on expiry)" })),
  pty: _typebox.Type.Optional(_typebox.Type.Boolean({ description: "Run in a pseudo-terminal (PTY) when available (TTY-required CLIs, coding agents)" })),
  elevated: _typebox.Type.Optional(_typebox.Type.Boolean({ description: "Run on the host with elevated permissions (if allowed)" })),
  host: _typebox.Type.Optional(_typebox.Type.String({ description: "Exec host/target (auto|sandbox|gateway|node)." })),
  security: _typebox.Type.Optional(_typebox.Type.String({ description: "Exec security mode (deny|allowlist|full)." })),
  ask: _typebox.Type.Optional(_typebox.Type.String({ description: "Exec ask mode (off|on-miss|always)." })),
  node: _typebox.Type.Optional(_typebox.Type.String({ description: "Node id/name for host=node." }))
});
const processSchema = exports.n = _typebox.Type.Object({
  action: _typebox.Type.String({ description: "Process action" }),
  sessionId: _typebox.Type.Optional(_typebox.Type.String({ description: "Session id for actions other than list" })),
  data: _typebox.Type.Optional(_typebox.Type.String({ description: "Data to write for write" })),
  keys: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.String(), { description: "Key tokens to send for send-keys" })),
  hex: _typebox.Type.Optional(_typebox.Type.Array(_typebox.Type.String(), { description: "Hex bytes to send for send-keys" })),
  literal: _typebox.Type.Optional(_typebox.Type.String({ description: "Literal string for send-keys" })),
  text: _typebox.Type.Optional(_typebox.Type.String({ description: "Text to paste for paste" })),
  bracketed: _typebox.Type.Optional(_typebox.Type.Boolean({ description: "Wrap paste in bracketed mode" })),
  eof: _typebox.Type.Optional(_typebox.Type.Boolean({ description: "Close stdin after write" })),
  offset: _typebox.Type.Optional(_typebox.Type.Number({ description: "Log offset" })),
  limit: _typebox.Type.Optional(_typebox.Type.Number({ description: "Log length" })),
  timeout: _typebox.Type.Optional(_typebox.Type.Number({
    description: "For poll: wait up to this many milliseconds before returning",
    minimum: 0
  }))
});
//#endregion /* v9-1a76f5c376a423ed */
