"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.isLocalPath = isLocalPath; /**
 * Returns true if the value is NOT a package source (npm:, git:, etc.)
 * or a URL protocol. Bare names and relative paths without ./ prefix
 * are considered local.
 */
function isLocalPath(value) {
  const trimmed = value.trim();
  // Known non-local prefixes
  if (trimmed.startsWith("npm:") ||
  trimmed.startsWith("git:") ||
  trimmed.startsWith("github:") ||
  trimmed.startsWith("http:") ||
  trimmed.startsWith("https:") ||
  trimmed.startsWith("ssh:")) {
    return false;
  }
  return true;
} /* v9-0c5c368d857011c1 */
