"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.copyToClipboard = copyToClipboard;var _child_process = require("child_process");
var _os = require("os");
var _clipboardImage = require("./clipboard-image.js");
var _clipboardNative = require("./clipboard-native.js");
function copyToX11Clipboard(options) {
  try {
    (0, _child_process.execSync)("xclip -selection clipboard", options);
  }
  catch {
    (0, _child_process.execSync)("xsel --clipboard --input", options);
  }
}
async function copyToClipboard(text) {
  // Always emit OSC 52 - works over SSH/mosh, harmless locally
  const encoded = Buffer.from(text).toString("base64");
  process.stdout.write(`\x1b]52;c;${encoded}\x07`);
  try {
    if (_clipboardNative.clipboard) {
      await _clipboardNative.clipboard.setText(text);
      return;
    }
  }
  catch {

    // Fall through to platform-specific clipboard tools.
  } // Also try native tools (best effort for local sessions)
  const p = (0, _os.platform)();
  const options = { input: text, timeout: 5000, stdio: ["pipe", "ignore", "ignore"] };
  try {
    if (p === "darwin") {
      (0, _child_process.execSync)("pbcopy", options);
    } else
    if (p === "win32") {
      (0, _child_process.execSync)("clip", options);
    } else
    {
      // Linux. Try Termux, Wayland, or X11 clipboard tools.
      if (process.env.TERMUX_VERSION) {
        try {
          (0, _child_process.execSync)("termux-clipboard-set", options);
          return;
        }
        catch {

          // Fall back to Wayland or X11 tools.
        }}
      const hasWaylandDisplay = Boolean(process.env.WAYLAND_DISPLAY);
      const hasX11Display = Boolean(process.env.DISPLAY);
      const isWayland = (0, _clipboardImage.isWaylandSession)();
      if (isWayland && hasWaylandDisplay) {
        try {
          // Verify wl-copy exists (spawn errors are async and won't be caught)
          (0, _child_process.execSync)("which wl-copy", { stdio: "ignore" });
          // wl-copy with execSync hangs due to fork behavior; use spawn instead
          const proc = (0, _child_process.spawn)("wl-copy", [], { stdio: ["pipe", "ignore", "ignore"] });
          proc.stdin.on("error", () => {

            // Ignore EPIPE errors if wl-copy exits early
          });proc.stdin.write(text);
          proc.stdin.end();
          proc.unref();
        }
        catch {
          if (hasX11Display) {
            copyToX11Clipboard(options);
          }
        }
      } else
      if (hasX11Display) {
        copyToX11Clipboard(options);
      }
    }
  }
  catch {

    // Ignore - OSC 52 already emitted as fallback
  }} /* v9-c96ab2b567e0cab8 */
