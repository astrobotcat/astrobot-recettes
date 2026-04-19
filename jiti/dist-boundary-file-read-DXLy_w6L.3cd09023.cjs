"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = openVerifiedFileSync;exports.i = openBoundaryFileSync;exports.n = matchBoundaryFileOpenFailure;exports.r = openBoundaryFile;exports.t = canUseBoundaryFileOpen;var _fileIdentityEQApOIDl = require("./file-identity-eQApOIDl.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/infra/safe-open-sync.ts
function isExpectedPathError(error) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  return code === "ENOENT" || code === "ENOTDIR" || code === "ELOOP";
}
function sameFileIdentity(left, right) {
  return (0, _fileIdentityEQApOIDl.t)(left, right);
}
function openVerifiedFileSync(params) {
  const ioFs = params.ioFs ?? _nodeFs.default;
  const allowedType = params.allowedType ?? "file";
  const openReadFlags = ioFs.constants.O_RDONLY | (typeof ioFs.constants.O_NOFOLLOW === "number" ? ioFs.constants.O_NOFOLLOW : 0);
  let fd = null;
  try {
    if (params.rejectPathSymlink) {
      if (ioFs.lstatSync(params.filePath).isSymbolicLink()) return {
        ok: false,
        reason: "validation"
      };
    }
    const realPath = params.resolvedPath ?? ioFs.realpathSync(params.filePath);
    const preOpenStat = ioFs.lstatSync(realPath);
    if (!isAllowedType(preOpenStat, allowedType)) return {
      ok: false,
      reason: "validation"
    };
    if (params.rejectHardlinks && preOpenStat.isFile() && preOpenStat.nlink > 1) return {
      ok: false,
      reason: "validation"
    };
    if (params.maxBytes !== void 0 && preOpenStat.isFile() && preOpenStat.size > params.maxBytes) return {
      ok: false,
      reason: "validation"
    };
    fd = ioFs.openSync(realPath, openReadFlags);
    const openedStat = ioFs.fstatSync(fd);
    if (!isAllowedType(openedStat, allowedType)) return {
      ok: false,
      reason: "validation"
    };
    if (params.rejectHardlinks && openedStat.isFile() && openedStat.nlink > 1) return {
      ok: false,
      reason: "validation"
    };
    if (params.maxBytes !== void 0 && openedStat.isFile() && openedStat.size > params.maxBytes) return {
      ok: false,
      reason: "validation"
    };
    if (!sameFileIdentity(preOpenStat, openedStat)) return {
      ok: false,
      reason: "validation"
    };
    const opened = {
      ok: true,
      path: realPath,
      fd,
      stat: openedStat
    };
    fd = null;
    return opened;
  } catch (error) {
    if (isExpectedPathError(error)) return {
      ok: false,
      reason: "path",
      error
    };
    return {
      ok: false,
      reason: "io",
      error
    };
  } finally {
    if (fd !== null) ioFs.closeSync(fd);
  }
}
function isAllowedType(stat, allowedType) {
  if (allowedType === "directory") return stat.isDirectory();
  return stat.isFile();
}
//#endregion
//#region src/infra/boundary-file-read.ts
function canUseBoundaryFileOpen(ioFs) {
  return typeof ioFs.openSync === "function" && typeof ioFs.closeSync === "function" && typeof ioFs.fstatSync === "function" && typeof ioFs.lstatSync === "function" && typeof ioFs.realpathSync === "function" && typeof ioFs.readFileSync === "function" && typeof ioFs.constants === "object" && ioFs.constants !== null;
}
function openBoundaryFileSync(params) {
  const ioFs = params.ioFs ?? _nodeFs.default;
  const resolved = resolveBoundaryFilePathGeneric({
    absolutePath: params.absolutePath,
    resolve: (absolutePath) => (0, _fileIdentityEQApOIDl.i)({
      absolutePath,
      rootPath: params.rootPath,
      rootCanonicalPath: params.rootRealPath,
      boundaryLabel: params.boundaryLabel,
      skipLexicalRootCheck: params.skipLexicalRootCheck
    })
  });
  if (resolved instanceof Promise) return toBoundaryValidationError(/* @__PURE__ */new Error("Unexpected async boundary resolution"));
  return finalizeBoundaryFileOpen({
    resolved,
    maxBytes: params.maxBytes,
    rejectHardlinks: params.rejectHardlinks,
    allowedType: params.allowedType,
    ioFs
  });
}
function matchBoundaryFileOpenFailure(failure, handlers) {
  switch (failure.reason) {
    case "path":return handlers.path ? handlers.path(failure) : handlers.fallback(failure);
    case "validation":return handlers.validation ? handlers.validation(failure) : handlers.fallback(failure);
    case "io":return handlers.io ? handlers.io(failure) : handlers.fallback(failure);
  }
  return handlers.fallback(failure);
}
function openBoundaryFileResolved(params) {
  const opened = openVerifiedFileSync({
    filePath: params.absolutePath,
    resolvedPath: params.resolvedPath,
    rejectHardlinks: params.rejectHardlinks ?? true,
    maxBytes: params.maxBytes,
    allowedType: params.allowedType,
    ioFs: params.ioFs
  });
  if (!opened.ok) return opened;
  return {
    ok: true,
    path: opened.path,
    fd: opened.fd,
    stat: opened.stat,
    rootRealPath: params.rootRealPath
  };
}
function finalizeBoundaryFileOpen(params) {
  if ("ok" in params.resolved) return params.resolved;
  return openBoundaryFileResolved({
    absolutePath: params.resolved.absolutePath,
    resolvedPath: params.resolved.resolvedPath,
    rootRealPath: params.resolved.rootRealPath,
    maxBytes: params.maxBytes,
    rejectHardlinks: params.rejectHardlinks,
    allowedType: params.allowedType,
    ioFs: params.ioFs
  });
}
async function openBoundaryFile(params) {
  const ioFs = params.ioFs ?? _nodeFs.default;
  const maybeResolved = resolveBoundaryFilePathGeneric({
    absolutePath: params.absolutePath,
    resolve: (absolutePath) => (0, _fileIdentityEQApOIDl.r)({
      absolutePath,
      rootPath: params.rootPath,
      rootCanonicalPath: params.rootRealPath,
      boundaryLabel: params.boundaryLabel,
      policy: params.aliasPolicy,
      skipLexicalRootCheck: params.skipLexicalRootCheck
    })
  });
  return finalizeBoundaryFileOpen({
    resolved: maybeResolved instanceof Promise ? await maybeResolved : maybeResolved,
    maxBytes: params.maxBytes,
    rejectHardlinks: params.rejectHardlinks,
    allowedType: params.allowedType,
    ioFs
  });
}
function toBoundaryValidationError(error) {
  return {
    ok: false,
    reason: "validation",
    error
  };
}
function mapResolvedBoundaryPath(absolutePath, resolved) {
  return {
    absolutePath,
    resolvedPath: resolved.canonicalPath,
    rootRealPath: resolved.rootCanonicalPath
  };
}
function resolveBoundaryFilePathGeneric(params) {
  const absolutePath = _nodePath.default.resolve(params.absolutePath);
  try {
    const resolved = params.resolve(absolutePath);
    if (resolved instanceof Promise) return resolved.then((value) => mapResolvedBoundaryPath(absolutePath, value)).catch((error) => toBoundaryValidationError(error));
    return mapResolvedBoundaryPath(absolutePath, resolved);
  } catch (error) {
    return toBoundaryValidationError(error);
  }
}
//#endregion /* v9-98b28825672e2f1f */
