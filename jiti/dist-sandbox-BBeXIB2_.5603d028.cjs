"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.C = resolveWritableRenameTargetsForBridge;exports.S = resolveWritableRenameTargets;exports._ = runSshSandboxCommand;exports.a = ensureSandboxWorkspaceForSession;exports.b = createRemoteShellSandboxFsBridge;exports.c = getSandboxBackendManager;exports.d = buildExecRemoteCommand;exports.f = buildRemoteCommand;exports.g = disposeSshSandboxSession;exports.h = createSshSandboxSessionFromSettings;exports.i = removeSandboxContainer;exports.l = registerSandboxBackend;exports.m = createSshSandboxSessionFromConfigText;exports.n = listSandboxContainers;exports.o = resolveSandboxContext;exports.p = buildSshSandboxArgv;exports.r = removeSandboxBrowserContainer;exports.s = getSandboxBackendFactory;exports.t = listSandboxBrowsers;exports.u = requireSandboxBackendFactory;exports.v = shellEscape;exports.x = createWritableRenameTargetResolver;exports.y = uploadDirectoryToSshTarget;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _runtimeDx7oeLYq = require("./runtime-Dx7oeLYq.js");
var _tmpOpenclawDirEyAoWbVe = require("./tmp-openclaw-dir-eyAoWbVe.js");
var _fileIdentityEQApOIDl = require("./file-identity-eQApOIDl.js");
var _boundaryFileReadDXLy_w6L = require("./boundary-file-read-DXLy_w6L.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
var _workspaceHhTlRYqM = require("./workspace-hhTlRYqM.js");
require("./config-Q9XZc_2I.js");
var _facadeRuntimeGSGchfr = require("./facade-runtime-gSGchfr7.js");
var _configCWqq9_ZP = require("./config-CWqq9_ZP.js");
var _runtimeStatusDhGewqgv = require("./runtime-status-DhGewqgv.js");
var _pathAliasGuardsBfwx2wkV = require("./path-alias-guards-Bfwx2wkV.js");
var _sandboxPathsC5p25GeS = require("./sandbox-paths-C5p25GeS.js");
var _execDefaultsDiCDZt_n = require("./exec-defaults-DiCDZt_n.js");
var _skillsCwx5TftI = require("./skills-Cwx5TftI.js");
var _sanitizeEnvVarsOg3CRoPL = require("./sanitize-env-vars-Og3CRoPL.js");
var _browserControlAuthCuDh_EEK = require("./browser-control-auth-CuDh_EEK.js");
var _browserProfilesDM06n8Uh = require("./browser-profiles-DM06n8Uh.js");
var _bashToolsExecRuntimeDNTWYnIA = require("./bash-tools.exec-runtime-DNTWYnIA.js");
var _dockerMSot2cJh = require("./docker-mSot2cJh.js");
var _sshTunnelBRxSf = require("./ssh-tunnel-BRxSf715.js");
var _portDefaultsBdplfuBS = require("./port-defaults-BdplfuBS.js");
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeChild_process = require("node:child_process");
var _nodeOs = _interopRequireDefault(require("node:os"));
var _promises = _interopRequireDefault(require("node:fs/promises"));
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
//#region src/agents/sandbox/docker-backend.ts
function resolveConfiguredDockerRuntimeImage(params) {
  const sandboxCfg = (0, _configCWqq9_ZP.n)(params.config, params.agentId);
  switch (params.configLabelKind) {
    case "BrowserImage":return sandboxCfg.browser.image;
    case "Image":
    case void 0:
    default:return sandboxCfg.docker.image;
  }
}
async function createDockerSandboxBackend(params) {
  return createDockerSandboxBackendHandle({
    containerName: await (0, _dockerMSot2cJh.r)({
      sessionKey: params.sessionKey,
      workspaceDir: params.workspaceDir,
      agentWorkspaceDir: params.agentWorkspaceDir,
      cfg: params.cfg
    }),
    workdir: params.cfg.docker.workdir,
    env: params.cfg.docker.env,
    image: params.cfg.docker.image
  });
}
function createDockerSandboxBackendHandle(params) {
  return {
    id: "docker",
    runtimeId: params.containerName,
    runtimeLabel: params.containerName,
    workdir: params.workdir,
    env: params.env,
    configLabel: params.image,
    configLabelKind: "Image",
    capabilities: { browser: true },
    async buildExecSpec({ command, workdir, env, usePty }) {
      return {
        argv: ["docker", ...(0, _bashToolsExecRuntimeDNTWYnIA.h)({
          containerName: params.containerName,
          command,
          workdir: workdir ?? params.workdir,
          env,
          tty: usePty
        })],
        env: process.env,
        stdinMode: usePty ? "pipe-open" : "pipe-closed"
      };
    },
    runShellCommand(command) {
      return runDockerSandboxShellCommand({
        containerName: params.containerName,
        ...command
      });
    }
  };
}
function runDockerSandboxShellCommand(params) {
  const dockerArgs = [
  "exec",
  "-i",
  params.containerName,
  "sh",
  "-c",
  params.script,
  "openclaw-sandbox-fs"];

  if (params.args?.length) dockerArgs.push(...params.args);
  return (0, _dockerMSot2cJh.a)(dockerArgs, {
    input: params.stdin,
    allowFailure: params.allowFailure,
    signal: params.signal
  });
}
const dockerSandboxBackendManager = {
  async describeRuntime({ entry, config, agentId }) {
    const state = await (0, _dockerMSot2cJh.n)(entry.containerName);
    let actualConfigLabel = entry.image;
    if (state.exists) try {
      const result = await (0, _dockerMSot2cJh.i)([
      "inspect",
      "-f",
      "{{.Config.Image}}",
      entry.containerName],
      { allowFailure: true });
      if (result.code === 0) actualConfigLabel = result.stdout.trim() || actualConfigLabel;
    } catch {}
    const configuredImage = resolveConfiguredDockerRuntimeImage({
      config,
      agentId,
      configLabelKind: entry.configLabelKind
    });
    return {
      running: state.running,
      actualConfigLabel,
      configLabelMatch: actualConfigLabel === configuredImage
    };
  },
  async removeRuntime({ entry }) {
    try {
      await (0, _dockerMSot2cJh.i)([
      "rm",
      "-f",
      entry.containerName],
      { allowFailure: true });
    } catch {}
  }
};
//#endregion
//#region src/agents/sandbox/fs-bridge-mutation-helper.ts
const SANDBOX_PINNED_MUTATION_PYTHON_CANDIDATES = [
"/usr/bin/python3",
"/usr/local/bin/python3",
"/opt/homebrew/bin/python3",
"/bin/python3"];

const SANDBOX_PINNED_MUTATION_PYTHON = [
"import errno",
"import os",
"import secrets",
"import stat",
"import sys",
"",
"operation = sys.argv[1]",
"",
"DIR_FLAGS = os.O_RDONLY",
"if hasattr(os, 'O_DIRECTORY'):",
"    DIR_FLAGS |= os.O_DIRECTORY",
"if hasattr(os, 'O_NOFOLLOW'):",
"    DIR_FLAGS |= os.O_NOFOLLOW",
"",
"READ_FLAGS = os.O_RDONLY",
"if hasattr(os, 'O_NOFOLLOW'):",
"    READ_FLAGS |= os.O_NOFOLLOW",
"",
"WRITE_FLAGS = os.O_WRONLY | os.O_CREAT | os.O_EXCL",
"if hasattr(os, 'O_NOFOLLOW'):",
"    WRITE_FLAGS |= os.O_NOFOLLOW",
"",
"def split_relative(path_value):",
"    segments = []",
"    for segment in path_value.split('/'):",
"        if not segment or segment == '.':",
"            continue",
"        if segment == '..':",
"            raise OSError(errno.EPERM, 'path traversal is not allowed', segment)",
"        segments.append(segment)",
"    return segments",
"",
"def open_dir(path_value, dir_fd=None):",
"    return os.open(path_value, DIR_FLAGS, dir_fd=dir_fd)",
"",
"def walk_dir(root_fd, rel_path, mkdir_enabled):",
"    current_fd = os.dup(root_fd)",
"    try:",
"        for segment in split_relative(rel_path):",
"            try:",
"                next_fd = open_dir(segment, dir_fd=current_fd)",
"            except FileNotFoundError:",
"                if not mkdir_enabled:",
"                    raise",
"                os.mkdir(segment, 0o777, dir_fd=current_fd)",
"                next_fd = open_dir(segment, dir_fd=current_fd)",
"            os.close(current_fd)",
"            current_fd = next_fd",
"        return current_fd",
"    except Exception:",
"        os.close(current_fd)",
"        raise",
"",
"def create_temp_file(parent_fd, basename):",
"    prefix = '.openclaw-write-' + basename + '.'",
"    for _ in range(128):",
"        candidate = prefix + secrets.token_hex(6)",
"        try:",
"            fd = os.open(candidate, WRITE_FLAGS, 0o600, dir_fd=parent_fd)",
"            return candidate, fd",
"        except FileExistsError:",
"            continue",
"    raise RuntimeError('failed to allocate sandbox temp file')",
"",
"def create_temp_dir(parent_fd, basename, mode):",
"    prefix = '.openclaw-move-' + basename + '.'",
"    for _ in range(128):",
"        candidate = prefix + secrets.token_hex(6)",
"        try:",
"            os.mkdir(candidate, mode, dir_fd=parent_fd)",
"            return candidate",
"        except FileExistsError:",
"            continue",
"    raise RuntimeError('failed to allocate sandbox temp directory')",
"",
"def write_atomic(parent_fd, basename, stdin_buffer):",
"    temp_fd = None",
"    temp_name = None",
"    try:",
"        temp_name, temp_fd = create_temp_file(parent_fd, basename)",
"        while True:",
"            chunk = stdin_buffer.read(65536)",
"            if not chunk:",
"                break",
"            os.write(temp_fd, chunk)",
"        os.fsync(temp_fd)",
"        os.close(temp_fd)",
"        temp_fd = None",
"        os.replace(temp_name, basename, src_dir_fd=parent_fd, dst_dir_fd=parent_fd)",
"        temp_name = None",
"        os.fsync(parent_fd)",
"    finally:",
"        if temp_fd is not None:",
"            os.close(temp_fd)",
"        if temp_name is not None:",
"            try:",
"                os.unlink(temp_name, dir_fd=parent_fd)",
"            except FileNotFoundError:",
"                pass",
"",
"def read_file(parent_fd, basename):",
"    file_fd = os.open(basename, READ_FLAGS, dir_fd=parent_fd)",
"    try:",
"        file_stat = os.fstat(file_fd)",
"        if not stat.S_ISREG(file_stat.st_mode):",
"            raise OSError(errno.EPERM, 'only regular files are allowed', basename)",
"        if file_stat.st_nlink > 1:",
"            raise OSError(errno.EPERM, 'hardlinked file is not allowed', basename)",
"        while True:",
"            chunk = os.read(file_fd, 65536)",
"            if not chunk:",
"                break",
"            os.write(1, chunk)",
"    finally:",
"        os.close(file_fd)",
"",
"def remove_tree(parent_fd, basename):",
"    entry_stat = os.lstat(basename, dir_fd=parent_fd)",
"    if not stat.S_ISDIR(entry_stat.st_mode) or stat.S_ISLNK(entry_stat.st_mode):",
"        os.unlink(basename, dir_fd=parent_fd)",
"        return",
"    dir_fd = open_dir(basename, dir_fd=parent_fd)",
"    try:",
"        for child in os.listdir(dir_fd):",
"            remove_tree(dir_fd, child)",
"    finally:",
"        os.close(dir_fd)",
"    os.rmdir(basename, dir_fd=parent_fd)",
"",
"def move_entry(src_parent_fd, src_basename, dst_parent_fd, dst_basename):",
"    try:",
"        os.rename(src_basename, dst_basename, src_dir_fd=src_parent_fd, dst_dir_fd=dst_parent_fd)",
"        os.fsync(dst_parent_fd)",
"        os.fsync(src_parent_fd)",
"        return",
"    except OSError as err:",
"        if err.errno != errno.EXDEV:",
"            raise",
"    src_stat = os.lstat(src_basename, dir_fd=src_parent_fd)",
"    if stat.S_ISDIR(src_stat.st_mode) and not stat.S_ISLNK(src_stat.st_mode):",
"        temp_dir_name = create_temp_dir(dst_parent_fd, dst_basename, stat.S_IMODE(src_stat.st_mode) or 0o755)",
"        temp_dir_fd = open_dir(temp_dir_name, dir_fd=dst_parent_fd)",
"        src_dir_fd = open_dir(src_basename, dir_fd=src_parent_fd)",
"        try:",
"            for child in os.listdir(src_dir_fd):",
"                move_entry(src_dir_fd, child, temp_dir_fd, child)",
"        finally:",
"            os.close(src_dir_fd)",
"            os.close(temp_dir_fd)",
"        os.rename(temp_dir_name, dst_basename, src_dir_fd=dst_parent_fd, dst_dir_fd=dst_parent_fd)",
"        os.rmdir(src_basename, dir_fd=src_parent_fd)",
"        os.fsync(dst_parent_fd)",
"        os.fsync(src_parent_fd)",
"        return",
"    if stat.S_ISLNK(src_stat.st_mode):",
"        link_target = os.readlink(src_basename, dir_fd=src_parent_fd)",
"        try:",
"            os.unlink(dst_basename, dir_fd=dst_parent_fd)",
"        except FileNotFoundError:",
"            pass",
"        os.symlink(link_target, dst_basename, dir_fd=dst_parent_fd)",
"        os.unlink(src_basename, dir_fd=src_parent_fd)",
"        os.fsync(dst_parent_fd)",
"        os.fsync(src_parent_fd)",
"        return",
"    src_fd = os.open(src_basename, READ_FLAGS, dir_fd=src_parent_fd)",
"    temp_fd = None",
"    temp_name = None",
"    try:",
"        src_file_stat = os.fstat(src_fd)",
"        if not stat.S_ISREG(src_file_stat.st_mode):",
"            raise OSError(errno.EPERM, 'only regular files are allowed', src_basename)",
"        if src_file_stat.st_nlink > 1:",
"            raise OSError(errno.EPERM, 'hardlinked file is not allowed', src_basename)",
"        temp_name, temp_fd = create_temp_file(dst_parent_fd, dst_basename)",
"        while True:",
"            chunk = os.read(src_fd, 65536)",
"            if not chunk:",
"                break",
"            os.write(temp_fd, chunk)",
"        try:",
"            os.fchmod(temp_fd, stat.S_IMODE(src_stat.st_mode))",
"        except AttributeError:",
"            pass",
"        os.fsync(temp_fd)",
"        os.close(temp_fd)",
"        temp_fd = None",
"        os.replace(temp_name, dst_basename, src_dir_fd=dst_parent_fd, dst_dir_fd=dst_parent_fd)",
"        temp_name = None",
"        os.unlink(src_basename, dir_fd=src_parent_fd)",
"        os.fsync(dst_parent_fd)",
"        os.fsync(src_parent_fd)",
"    finally:",
"        if temp_fd is not None:",
"            os.close(temp_fd)",
"        if temp_name is not None:",
"            try:",
"                os.unlink(temp_name, dir_fd=dst_parent_fd)",
"            except FileNotFoundError:",
"                pass",
"        os.close(src_fd)",
"",
"if operation == 'write':",
"    root_fd = open_dir(sys.argv[2])",
"    parent_fd = None",
"    try:",
"        parent_fd = walk_dir(root_fd, sys.argv[3], sys.argv[5] == '1')",
"        write_atomic(parent_fd, sys.argv[4], sys.stdin.buffer)",
"    finally:",
"        if parent_fd is not None:",
"            os.close(parent_fd)",
"        os.close(root_fd)",
"elif operation == 'read':",
"    root_fd = open_dir(sys.argv[2])",
"    parent_fd = None",
"    try:",
"        parent_fd = walk_dir(root_fd, sys.argv[3], False)",
"        read_file(parent_fd, sys.argv[4])",
"    finally:",
"        if parent_fd is not None:",
"            os.close(parent_fd)",
"        os.close(root_fd)",
"elif operation == 'mkdirp':",
"    root_fd = open_dir(sys.argv[2])",
"    target_fd = None",
"    try:",
"        target_fd = walk_dir(root_fd, sys.argv[3], True)",
"        os.fsync(target_fd)",
"    finally:",
"        if target_fd is not None:",
"            os.close(target_fd)",
"        os.close(root_fd)",
"elif operation == 'remove':",
"    root_fd = open_dir(sys.argv[2])",
"    parent_fd = None",
"    try:",
"        parent_fd = walk_dir(root_fd, sys.argv[3], False)",
"        try:",
"            if sys.argv[5] == '1':",
"                remove_tree(parent_fd, sys.argv[4])",
"            else:",
"                entry_stat = os.lstat(sys.argv[4], dir_fd=parent_fd)",
"                if stat.S_ISDIR(entry_stat.st_mode) and not stat.S_ISLNK(entry_stat.st_mode):",
"                    os.rmdir(sys.argv[4], dir_fd=parent_fd)",
"                else:",
"                    os.unlink(sys.argv[4], dir_fd=parent_fd)",
"            os.fsync(parent_fd)",
"        except FileNotFoundError:",
"            if sys.argv[6] != '1':",
"                raise",
"    finally:",
"        if parent_fd is not None:",
"            os.close(parent_fd)",
"        os.close(root_fd)",
"elif operation == 'rename':",
"    src_root_fd = open_dir(sys.argv[2])",
"    dst_root_fd = open_dir(sys.argv[5])",
"    src_parent_fd = None",
"    dst_parent_fd = None",
"    try:",
"        src_parent_fd = walk_dir(src_root_fd, sys.argv[3], False)",
"        dst_parent_fd = walk_dir(dst_root_fd, sys.argv[6], sys.argv[8] == '1')",
"        move_entry(src_parent_fd, sys.argv[4], dst_parent_fd, sys.argv[7])",
"    finally:",
"        if src_parent_fd is not None:",
"            os.close(src_parent_fd)",
"        if dst_parent_fd is not None:",
"            os.close(dst_parent_fd)",
"        os.close(src_root_fd)",
"        os.close(dst_root_fd)",
"else:",
"    raise RuntimeError('unknown sandbox mutation operation: ' + operation)"].
join("\n");
const SANDBOX_PINNED_MUTATION_PYTHON_SHELL_LITERAL = `'${SANDBOX_PINNED_MUTATION_PYTHON.replaceAll("'", `'\\''`)}'`;
function buildPinnedMutationPlan(params) {
  return {
    checks: params.checks,
    recheckBeforeCommand: true,
    script: [
    "set -eu",
    "python_cmd=''",
    ...SANDBOX_PINNED_MUTATION_PYTHON_CANDIDATES.map((candidate) => `if [ -z "$python_cmd" ] && [ -x '${candidate}' ]; then python_cmd='${candidate}'; fi`),
    "if [ -z \"$python_cmd\" ]; then python_cmd=$(command -v python3 2>/dev/null || command -v python 2>/dev/null || true); fi",
    "if [ -z \"$python_cmd\" ]; then",
    "  echo >&2 'sandbox pinned mutation helper requires python3 or python'",
    "  exit 127",
    "fi",
    `python_script=${SANDBOX_PINNED_MUTATION_PYTHON_SHELL_LITERAL}`,
    "exec \"$python_cmd\" -c \"$python_script\" \"$@\""].
    join("\n"),
    args: params.args
  };
}
function buildPinnedWritePlan(params) {
  return buildPinnedMutationPlan({
    checks: [params.check],
    args: [
    "write",
    params.pinned.mountRootPath,
    params.pinned.relativeParentPath,
    params.pinned.basename,
    params.mkdir ? "1" : "0"]

  });
}
function buildPinnedMkdirpPlan(params) {
  return buildPinnedMutationPlan({
    checks: [params.check],
    args: [
    "mkdirp",
    params.pinned.mountRootPath,
    params.pinned.relativePath]

  });
}
function buildPinnedRemovePlan(params) {
  return buildPinnedMutationPlan({
    checks: [{
      target: params.check.target,
      options: {
        ...params.check.options,
        aliasPolicy: _pathAliasGuardsBfwx2wkV.t.unlinkTarget
      }
    }],
    args: [
    "remove",
    params.pinned.mountRootPath,
    params.pinned.relativeParentPath,
    params.pinned.basename,
    params.recursive ? "1" : "0",
    params.force === false ? "0" : "1"]

  });
}
function buildPinnedRenamePlan(params) {
  return buildPinnedMutationPlan({
    checks: [{
      target: params.fromCheck.target,
      options: {
        ...params.fromCheck.options,
        aliasPolicy: _pathAliasGuardsBfwx2wkV.t.unlinkTarget
      }
    }, params.toCheck],
    args: [
    "rename",
    params.from.mountRootPath,
    params.from.relativeParentPath,
    params.from.basename,
    params.to.mountRootPath,
    params.to.relativeParentPath,
    params.to.basename,
    "1"]

  });
}
//#endregion
//#region src/agents/sandbox/fs-bridge-rename-targets.ts
function resolveWritableRenameTargets(params) {
  const action = params.action ?? "rename files";
  const from = params.resolveTarget({
    filePath: params.from,
    cwd: params.cwd
  });
  const to = params.resolveTarget({
    filePath: params.to,
    cwd: params.cwd
  });
  params.ensureWritable(from, action);
  params.ensureWritable(to, action);
  return {
    from,
    to
  };
}
function resolveWritableRenameTargetsForBridge(params, resolveTarget, ensureWritable) {
  return resolveWritableRenameTargets({
    ...params,
    resolveTarget,
    ensureWritable
  });
}
function createWritableRenameTargetResolver(resolveTarget, ensureWritable) {
  return (params) => resolveWritableRenameTargetsForBridge(params, resolveTarget, ensureWritable);
}
//#endregion
//#region src/agents/sandbox/path-utils.ts
function normalizeContainerPath$1(value) {
  const normalized = _nodePath.default.posix.normalize(value);
  return normalized === "." ? "/" : normalized;
}
function isPathInsideContainerRoot(root, target) {
  const normalizedRoot = normalizeContainerPath$1(root);
  const normalizedTarget = normalizeContainerPath$1(target);
  if (normalizedRoot === "/") return true;
  return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}/`);
}
//#endregion
//#region src/agents/sandbox/remote-fs-bridge.ts
function createRemoteShellSandboxFsBridge(params) {
  return new RemoteShellSandboxFsBridge(params.sandbox, params.runtime);
}
var RemoteShellSandboxFsBridge = class {
  constructor(sandbox, runtime) {
    this.sandbox = sandbox;
    this.runtime = runtime;
    this.resolveRenameTargets = createWritableRenameTargetResolver((target) => this.resolveTarget(target), (target, action) => this.ensureWritable(target, action));
  }
  resolvePath(params) {
    const target = this.resolveTarget(params);
    return {
      relativePath: target.relativePath,
      containerPath: target.containerPath
    };
  }
  async readFile(params) {
    const target = this.resolveTarget(params);
    const relativePath = _nodePath.default.posix.relative(target.mountRootPath, target.containerPath);
    if (relativePath === "" || relativePath === "." || relativePath.startsWith("..") || _nodePath.default.posix.isAbsolute(relativePath)) throw new Error(`Invalid sandbox entry target: ${target.containerPath}`);
    return (await this.runMutation({
      args: [
      "read",
      target.mountRootPath,
      _nodePath.default.posix.dirname(relativePath) === "." ? "" : _nodePath.default.posix.dirname(relativePath),
      _nodePath.default.posix.basename(relativePath)],

      signal: params.signal
    })).stdout;
  }
  async writeFile(params) {
    const target = this.resolveTarget(params);
    this.ensureWritable(target, "write files");
    const pinned = await this.resolvePinnedParent({
      containerPath: target.containerPath,
      action: "write files",
      requireWritable: true
    });
    await this.assertNoHardlinkedFile({
      containerPath: target.containerPath,
      action: "write files",
      signal: params.signal
    });
    const buffer = Buffer.isBuffer(params.data) ? params.data : Buffer.from(params.data, params.encoding ?? "utf8");
    await this.runMutation({
      args: [
      "write",
      pinned.mountRootPath,
      pinned.relativeParentPath,
      pinned.basename,
      params.mkdir !== false ? "1" : "0"],

      stdin: buffer,
      signal: params.signal
    });
  }
  async mkdirp(params) {
    const target = this.resolveTarget(params);
    this.ensureWritable(target, "create directories");
    const relativePath = _nodePath.default.posix.relative(target.mountRootPath, target.containerPath);
    if (relativePath.startsWith("..") || _nodePath.default.posix.isAbsolute(relativePath)) throw new Error(`Sandbox path escapes allowed mounts; cannot create directories: ${target.containerPath}`);
    await this.runMutation({
      args: [
      "mkdirp",
      target.mountRootPath,
      relativePath === "." ? "" : relativePath],

      signal: params.signal
    });
  }
  async remove(params) {
    const target = this.resolveTarget(params);
    this.ensureWritable(target, "remove files");
    if (!(await this.remotePathExists(target.containerPath, params.signal))) {
      if (params.force === false) throw new Error(`Sandbox path not found; cannot remove files: ${target.containerPath}`);
      return;
    }
    const pinned = await this.resolvePinnedParent({
      containerPath: target.containerPath,
      action: "remove files",
      requireWritable: true,
      allowFinalSymlinkForUnlink: true
    });
    await this.runMutation({
      args: [
      "remove",
      pinned.mountRootPath,
      pinned.relativeParentPath,
      pinned.basename,
      params.recursive ? "1" : "0",
      params.force === false ? "0" : "1"],

      signal: params.signal,
      allowFailure: params.force !== false
    });
  }
  async rename(params) {
    const { from, to } = this.resolveRenameTargets(params);
    const fromPinned = await this.resolvePinnedParent({
      containerPath: from.containerPath,
      action: "rename files",
      requireWritable: true,
      allowFinalSymlinkForUnlink: true
    });
    const toPinned = await this.resolvePinnedParent({
      containerPath: to.containerPath,
      action: "rename files",
      requireWritable: true
    });
    await this.runMutation({
      args: [
      "rename",
      fromPinned.mountRootPath,
      fromPinned.relativeParentPath,
      fromPinned.basename,
      toPinned.mountRootPath,
      toPinned.relativeParentPath,
      toPinned.basename,
      "1"],

      signal: params.signal
    });
  }
  async stat(params) {
    const target = this.resolveTarget(params);
    if (!(await this.remotePathExists(target.containerPath, params.signal))) return null;
    const canonical = await this.resolveCanonicalPath({
      containerPath: target.containerPath,
      action: "stat files",
      signal: params.signal
    });
    await this.assertNoHardlinkedFile({
      containerPath: canonical,
      action: "stat files",
      signal: params.signal
    });
    const [kindRaw = "", sizeRaw = "0", mtimeRaw = "0"] = (await this.runRemoteScript({
      script: "set -eu\nstat -c \"%F|%s|%Y\" -- \"$1\"",
      args: [canonical],
      signal: params.signal
    })).stdout.toString("utf8").trim().split("|");
    return {
      type: kindRaw === "directory" ? "directory" : kindRaw === "regular file" ? "file" : "other",
      size: Number(sizeRaw),
      mtimeMs: Number(mtimeRaw) * 1e3
    };
  }
  getMounts() {
    const mounts = [{
      containerRoot: normalizeContainerPath(this.runtime.remoteWorkspaceDir),
      writable: this.sandbox.workspaceAccess === "rw",
      source: "workspace"
    }];
    if (this.sandbox.workspaceAccess !== "none" && _nodePath.default.resolve(this.sandbox.agentWorkspaceDir) !== _nodePath.default.resolve(this.sandbox.workspaceDir)) mounts.push({
      containerRoot: normalizeContainerPath(this.runtime.remoteAgentWorkspaceDir),
      writable: this.sandbox.workspaceAccess === "rw",
      source: "agent"
    });
    return mounts;
  }
  resolveTarget(params) {
    const workspaceRoot = _nodePath.default.resolve(this.sandbox.workspaceDir);
    const agentRoot = _nodePath.default.resolve(this.sandbox.agentWorkspaceDir);
    const workspaceContainerRoot = normalizeContainerPath(this.runtime.remoteWorkspaceDir);
    const agentContainerRoot = normalizeContainerPath(this.runtime.remoteAgentWorkspaceDir);
    const mounts = this.getMounts();
    const input = params.filePath.trim();
    const inputPosix = input.replace(/\\/g, "/");
    const maybeContainerMount = _nodePath.default.posix.isAbsolute(inputPosix) ? this.resolveMountByContainerPath(mounts, normalizeContainerPath(inputPosix)) : null;
    if (maybeContainerMount) return this.toResolvedPath({
      mount: maybeContainerMount,
      containerPath: normalizeContainerPath(inputPosix)
    });
    const hostCwd = params.cwd ? _nodePath.default.resolve(params.cwd) : workspaceRoot;
    const hostCandidate = _nodePath.default.isAbsolute(input) ? _nodePath.default.resolve(input) : _nodePath.default.resolve(hostCwd, input);
    if ((0, _fileIdentityEQApOIDl.c)(workspaceRoot, hostCandidate)) {
      const relative = toPosixRelative(workspaceRoot, hostCandidate);
      return this.toResolvedPath({
        mount: mounts[0],
        containerPath: relative ? _nodePath.default.posix.join(workspaceContainerRoot, relative) : workspaceContainerRoot
      });
    }
    if (mounts[1] && (0, _fileIdentityEQApOIDl.c)(agentRoot, hostCandidate)) {
      const relative = toPosixRelative(agentRoot, hostCandidate);
      return this.toResolvedPath({
        mount: mounts[1],
        containerPath: relative ? _nodePath.default.posix.join(agentContainerRoot, relative) : agentContainerRoot
      });
    }
    if (params.cwd) {
      const cwdPosix = params.cwd.replace(/\\/g, "/");
      if (_nodePath.default.posix.isAbsolute(cwdPosix)) {
        const cwdContainer = normalizeContainerPath(cwdPosix);
        const cwdMount = this.resolveMountByContainerPath(mounts, cwdContainer);
        if (cwdMount) return this.toResolvedPath({
          mount: cwdMount,
          containerPath: normalizeContainerPath(_nodePath.default.posix.resolve(cwdContainer, inputPosix))
        });
      }
    }
    throw new Error(`Sandbox path escapes allowed mounts; cannot access: ${params.filePath}`);
  }
  toResolvedPath(params) {
    const relative = _nodePath.default.posix.relative(params.mount.containerRoot, params.containerPath);
    if (relative.startsWith("..") || _nodePath.default.posix.isAbsolute(relative)) throw new Error(`Sandbox path escapes allowed mounts; cannot access: ${params.containerPath}`);
    return {
      relativePath: params.mount.source === "workspace" ? relative === "." ? "" : relative : relative === "." ? params.mount.containerRoot : `${params.mount.containerRoot}/${relative}`,
      containerPath: params.containerPath,
      writable: params.mount.writable,
      mountRootPath: params.mount.containerRoot,
      source: params.mount.source
    };
  }
  resolveMountByContainerPath(mounts, containerPath) {
    const ordered = [...mounts].toSorted((a, b) => b.containerRoot.length - a.containerRoot.length);
    for (const mount of ordered) if (isPathInsideContainerRoot(mount.containerRoot, containerPath)) return mount;
    return null;
  }
  ensureWritable(target, action) {
    if (this.sandbox.workspaceAccess !== "rw" || !target.writable) throw new Error(`Sandbox path is read-only; cannot ${action}: ${target.containerPath}`);
  }
  async remotePathExists(containerPath, signal) {
    return (await this.runRemoteScript({
      script: "if [ -e \"$1\" ] || [ -L \"$1\" ]; then printf \"1\\n\"; else printf \"0\\n\"; fi",
      args: [containerPath],
      signal
    })).stdout.toString("utf8").trim() === "1";
  }
  async resolveCanonicalPath(params) {
    const script = [
    "set -eu",
    "target=\"$1\"",
    "allow_final=\"$2\"",
    "suffix=\"\"",
    "probe=\"$target\"",
    "if [ \"$allow_final\" = \"1\" ] && [ -L \"$target\" ]; then probe=$(dirname -- \"$target\"); fi",
    "cursor=\"$probe\"",
    "while [ ! -e \"$cursor\" ] && [ ! -L \"$cursor\" ]; do",
    "  parent=$(dirname -- \"$cursor\")",
    "  if [ \"$parent\" = \"$cursor\" ]; then break; fi",
    "  base=$(basename -- \"$cursor\")",
    "  suffix=\"/$base$suffix\"",
    "  cursor=\"$parent\"",
    "done",
    "canonical=$(readlink -f -- \"$cursor\")",
    "printf \"%s%s\\n\" \"$canonical\" \"$suffix\""].
    join("\n");
    const canonical = normalizeContainerPath((await this.runRemoteScript({
      script,
      args: [params.containerPath, params.allowFinalSymlinkForUnlink ? "1" : "0"],
      signal: params.signal
    })).stdout.toString("utf8").trim());
    if (!this.resolveMountByContainerPath(this.getMounts(), canonical)) throw new Error(`Sandbox path escapes allowed mounts; cannot ${params.action}: ${params.containerPath}`);
    return canonical;
  }
  async assertNoHardlinkedFile(params) {
    const output = (await this.runRemoteScript({
      script: [
      "if [ ! -e \"$1\" ] && [ ! -L \"$1\" ]; then exit 0; fi",
      "stats=$(stat -c \"%F|%h\" -- \"$1\")",
      "printf \"%s\\n\" \"$stats\""].
      join("\n"),
      args: [params.containerPath],
      signal: params.signal,
      allowFailure: true
    })).stdout.toString("utf8").trim();
    if (!output) return;
    const [kind = "", linksRaw = "1"] = output.split("|");
    if (kind === "regular file" && Number(linksRaw) > 1) throw new Error(`Hardlinked path is not allowed under sandbox mount root: ${params.containerPath}`);
  }
  async resolvePinnedParent(params) {
    const basename = _nodePath.default.posix.basename(params.containerPath);
    if (!basename || basename === "." || basename === "/") throw new Error(`Invalid sandbox entry target: ${params.containerPath}`);
    const canonicalParent = await this.resolveCanonicalPath({
      containerPath: normalizeContainerPath(_nodePath.default.posix.dirname(params.containerPath)),
      action: params.action,
      allowFinalSymlinkForUnlink: params.allowFinalSymlinkForUnlink
    });
    const mount = this.resolveMountByContainerPath(this.getMounts(), canonicalParent);
    if (!mount) throw new Error(`Sandbox path escapes allowed mounts; cannot ${params.action}: ${params.containerPath}`);
    if (params.requireWritable && !mount.writable) throw new Error(`Sandbox path is read-only; cannot ${params.action}: ${params.containerPath}`);
    const relativeParentPath = _nodePath.default.posix.relative(mount.containerRoot, canonicalParent);
    if (relativeParentPath.startsWith("..") || _nodePath.default.posix.isAbsolute(relativeParentPath)) throw new Error(`Sandbox path escapes allowed mounts; cannot ${params.action}: ${params.containerPath}`);
    return {
      mountRootPath: mount.containerRoot,
      relativeParentPath: relativeParentPath === "." ? "" : relativeParentPath,
      basename
    };
  }
  async runMutation(params) {
    return await this.runRemoteScript({
      script: [
      "set -eu",
      "python3 /dev/fd/3 \"$@\" 3<<'PY'",
      SANDBOX_PINNED_MUTATION_PYTHON,
      "PY"].
      join("\n"),
      args: params.args,
      stdin: params.stdin,
      signal: params.signal,
      allowFailure: params.allowFailure
    });
  }
  async runRemoteScript(params) {
    return await this.runtime.runRemoteShellScript({
      script: params.script,
      args: params.args,
      stdin: params.stdin,
      signal: params.signal,
      allowFailure: params.allowFailure
    });
  }
};
function normalizeContainerPath(value) {
  const normalized = normalizeContainerPath$1(value.trim() || "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
function toPosixRelative(root, candidate) {
  return _nodePath.default.relative(root, candidate).split(_nodePath.default.sep).filter(Boolean).join(_nodePath.default.posix.sep);
}
//#endregion
//#region src/agents/sandbox/ssh.ts
function normalizeInlineSshMaterial(contents, filename) {
  const normalizedEscapedNewlines = contents.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n");
  const expanded = filename === "identity" || filename === "certificate.pub" ? normalizedEscapedNewlines.replace(/\\n/g, "\n") : normalizedEscapedNewlines;
  return expanded.endsWith("\n") ? expanded : `${expanded}\n`;
}
function buildSshFailureMessage(stderr, exitCode) {
  const trimmed = stderr.trim();
  if (trimmed.includes("error in libcrypto") && (trimmed.includes("Load key \"") || trimmed.includes("Permission denied (publickey)"))) return `${trimmed}\nSSH sandbox failed to load the configured identity. The private key contents may be malformed (for example CRLF or escaped newlines). Prefer identityFile when possible.`;
  return trimmed || (exitCode !== void 0 ? `ssh exited with code ${exitCode}` : "ssh exited with a non-zero status");
}
function shellEscape(value) {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}
function buildRemoteCommand(argv) {
  return argv.map((entry) => shellEscape(entry)).join(" ");
}
function buildExecRemoteCommand(params) {
  const body = params.workdir ? `cd ${shellEscape(params.workdir)} && ${params.command}` : params.command;
  return buildRemoteCommand(Object.keys(params.env).length > 0 ? [
  "env",
  ...Object.entries(params.env).map(([key, value]) => `${key}=${value}`),
  "/bin/sh",
  "-c",
  body] :
  [
  "/bin/sh",
  "-c",
  body]
  );
}
function buildSshSandboxArgv(params) {
  return [
  params.session.command,
  "-F",
  params.session.configPath,
  ...(params.tty ? [
  "-tt",
  "-o",
  "RequestTTY=force",
  "-o",
  "SetEnv=TERM=xterm-256color"] :
  [
  "-T",
  "-o",
  "RequestTTY=no"]),

  params.session.host,
  params.remoteCommand];

}
async function createSshSandboxSessionFromConfigText(params) {
  const host = params.host?.trim() || parseSshConfigHost(params.configText);
  if (!host) throw new Error("Failed to parse SSH config output.");
  const configDir = await _promises.default.mkdtemp(_nodePath.default.join(resolveSshTmpRoot(), "openclaw-sandbox-ssh-"));
  const configPath = _nodePath.default.join(configDir, "config");
  await _promises.default.writeFile(configPath, params.configText, {
    encoding: "utf8",
    mode: 384
  });
  await _promises.default.chmod(configPath, 384);
  return {
    command: params.command?.trim() || "ssh",
    configPath,
    host
  };
}
async function createSshSandboxSessionFromSettings(settings) {
  const parsed = (0, _sshTunnelBRxSf.t)(settings.target);
  if (!parsed) throw new Error(`Invalid sandbox SSH target: ${settings.target}`);
  const configDir = await _promises.default.mkdtemp(_nodePath.default.join(resolveSshTmpRoot(), "openclaw-sandbox-ssh-"));
  try {
    const materializedIdentity = settings.identityData ? await writeSecretMaterial(configDir, "identity", settings.identityData) : void 0;
    const materializedCertificate = settings.certificateData ? await writeSecretMaterial(configDir, "certificate.pub", settings.certificateData) : void 0;
    const materializedKnownHosts = settings.knownHostsData ? await writeSecretMaterial(configDir, "known_hosts", settings.knownHostsData) : void 0;
    const identityFile = materializedIdentity ?? resolveOptionalLocalPath(settings.identityFile);
    const certificateFile = materializedCertificate ?? resolveOptionalLocalPath(settings.certificateFile);
    const knownHostsFile = materializedKnownHosts ?? resolveOptionalLocalPath(settings.knownHostsFile);
    const hostAlias = "openclaw-sandbox";
    const configPath = _nodePath.default.join(configDir, "config");
    const lines = [
    `Host ${hostAlias}`,
    `  HostName ${parsed.host}`,
    `  Port ${parsed.port}`,
    "  BatchMode yes",
    "  ConnectTimeout 5",
    "  ServerAliveInterval 15",
    "  ServerAliveCountMax 3",
    `  StrictHostKeyChecking ${settings.strictHostKeyChecking ? "yes" : "no"}`,
    `  UpdateHostKeys ${settings.updateHostKeys ? "yes" : "no"}`];

    if (parsed.user) lines.push(`  User ${parsed.user}`);
    if (knownHostsFile) lines.push(`  UserKnownHostsFile ${knownHostsFile}`);else
    if (!settings.strictHostKeyChecking) lines.push("  UserKnownHostsFile /dev/null");
    if (identityFile) lines.push(`  IdentityFile ${identityFile}`);
    if (certificateFile) lines.push(`  CertificateFile ${certificateFile}`);
    if (identityFile || certificateFile) lines.push("  IdentitiesOnly yes");
    await _promises.default.writeFile(configPath, `${lines.join("\n")}\n`, {
      encoding: "utf8",
      mode: 384
    });
    await _promises.default.chmod(configPath, 384);
    return {
      command: settings.command.trim() || "ssh",
      configPath,
      host: hostAlias
    };
  } catch (error) {
    await _promises.default.rm(configDir, {
      recursive: true,
      force: true
    });
    throw error;
  }
}
async function disposeSshSandboxSession(session) {
  await _promises.default.rm(_nodePath.default.dirname(session.configPath), {
    recursive: true,
    force: true
  });
}
async function runSshSandboxCommand(params) {
  const argv = buildSshSandboxArgv({
    session: params.session,
    remoteCommand: params.remoteCommand,
    tty: params.tty
  });
  const sshEnv = (0, _sanitizeEnvVarsOg3CRoPL.t)(process.env).allowed;
  return await new Promise((resolve, reject) => {
    const child = (0, _nodeChild_process.spawn)(argv[0], argv.slice(1), {
      stdio: [
      "pipe",
      "pipe",
      "pipe"],

      env: sshEnv,
      signal: params.signal
    });
    const stdoutChunks = [];
    const stderrChunks = [];
    child.stdout.on("data", (chunk) => stdoutChunks.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => stderrChunks.push(Buffer.from(chunk)));
    child.on("error", reject);
    child.on("close", (code) => {
      const stdout = Buffer.concat(stdoutChunks);
      const stderr = Buffer.concat(stderrChunks);
      const exitCode = code ?? 0;
      if (exitCode !== 0 && !params.allowFailure) {
        reject(Object.assign(new Error(buildSshFailureMessage(stderr.toString("utf8"), exitCode)), {
          code: exitCode,
          stdout,
          stderr
        }));
        return;
      }
      resolve({
        stdout,
        stderr,
        code: exitCode
      });
    });
    if (params.stdin !== void 0) {
      child.stdin.end(params.stdin);
      return;
    }
    child.stdin.end();
  });
}
async function uploadDirectoryToSshTarget(params) {
  await assertSafeUploadSymlinks(params.localDir);
  const remoteCommand = buildRemoteCommand([
  "/bin/sh",
  "-c",
  "mkdir -p -- \"$1\" && tar -xf - -C \"$1\"",
  "openclaw-sandbox-upload",
  params.remoteDir]
  );
  const sshArgv = buildSshSandboxArgv({
    session: params.session,
    remoteCommand
  });
  const sshEnv = (0, _sanitizeEnvVarsOg3CRoPL.t)(process.env).allowed;
  await new Promise((resolve, reject) => {
    const tar = (0, _nodeChild_process.spawn)("tar", [
    "-C",
    params.localDir,
    "-cf",
    "-",
    "."],
    {
      stdio: [
      "ignore",
      "pipe",
      "pipe"],

      signal: params.signal
    });
    const ssh = (0, _nodeChild_process.spawn)(sshArgv[0], sshArgv.slice(1), {
      stdio: [
      "pipe",
      "pipe",
      "pipe"],

      env: sshEnv,
      signal: params.signal
    });
    const tarStderr = [];
    const sshStdout = [];
    const sshStderr = [];
    let tarClosed = false;
    let sshClosed = false;
    let tarCode = 0;
    let sshCode = 0;
    tar.stderr.on("data", (chunk) => tarStderr.push(Buffer.from(chunk)));
    ssh.stdout.on("data", (chunk) => sshStdout.push(Buffer.from(chunk)));
    ssh.stderr.on("data", (chunk) => sshStderr.push(Buffer.from(chunk)));
    const fail = (error) => {
      tar.kill("SIGKILL");
      ssh.kill("SIGKILL");
      reject(error);
    };
    tar.on("error", fail);
    ssh.on("error", fail);
    tar.stdout.pipe(ssh.stdin);
    tar.on("close", (code) => {
      tarClosed = true;
      tarCode = code ?? 0;
      maybeResolve();
    });
    ssh.on("close", (code) => {
      sshClosed = true;
      sshCode = code ?? 0;
      maybeResolve();
    });
    function maybeResolve() {
      if (!tarClosed || !sshClosed) return;
      if (tarCode !== 0) {
        reject(new Error(Buffer.concat(tarStderr).toString("utf8").trim() || `tar exited with code ${tarCode}`));
        return;
      }
      if (sshCode !== 0) {
        reject(new Error(Buffer.concat(sshStderr).toString("utf8").trim() || `ssh exited with code ${sshCode}`));
        return;
      }
      resolve();
    }
  });
}
async function assertSafeUploadSymlinks(localDir) {
  const rootDir = _nodePath.default.resolve(localDir);
  await walkDirectory(rootDir);
  async function walkDirectory(currentDir) {
    const entries = await _promises.default.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = _nodePath.default.join(currentDir, entry.name);
      if (entry.isSymbolicLink()) {
        try {
          await (0, _fileIdentityEQApOIDl.r)({
            absolutePath: entryPath,
            rootPath: rootDir,
            boundaryLabel: "SSH sandbox upload tree"
          });
        } catch (error) {
          const relativePath = _nodePath.default.relative(rootDir, entryPath).split(_nodePath.default.sep).join("/");
          throw new Error(`SSH sandbox upload refuses symlink escaping the workspace: ${relativePath}`, { cause: error });
        }
        continue;
      }
      if (entry.isDirectory()) await walkDirectory(entryPath);
    }
  }
}
function parseSshConfigHost(configText) {
  return configText.match(/^\s*Host\s+(\S+)/m)?.[1]?.trim() || null;
}
function resolveSshTmpRoot() {
  return _nodePath.default.resolve((0, _tmpOpenclawDirEyAoWbVe.n)() ?? _nodeOs.default.tmpdir());
}
function resolveOptionalLocalPath(value) {
  const trimmed = value?.trim();
  return trimmed ? (0, _utilsD5DtWkEu.m)(trimmed) : void 0;
}
async function writeSecretMaterial(dir, filename, contents) {
  const pathname = _nodePath.default.join(dir, filename);
  await _promises.default.writeFile(pathname, normalizeInlineSshMaterial(contents, filename), {
    encoding: "utf8",
    mode: 384
  });
  await _promises.default.chmod(pathname, 384);
  return pathname;
}
//#endregion
//#region src/agents/sandbox/ssh-backend.ts
const sshSandboxBackendManager = {
  async describeRuntime({ entry, config, agentId }) {
    const cfg = (0, _configCWqq9_ZP.n)(config, agentId);
    if (cfg.backend !== "ssh" || !cfg.ssh.target) return {
      running: false,
      actualConfigLabel: cfg.ssh.target,
      configLabelMatch: false
    };
    const runtimePaths = resolveSshRuntimePaths(cfg.ssh.workspaceRoot, entry.sessionKey);
    const session = await createSshSandboxSessionFromSettings({
      ...cfg.ssh,
      target: cfg.ssh.target
    });
    try {
      return {
        running: (await runSshSandboxCommand({
          session,
          remoteCommand: buildRemoteCommand([
          "/bin/sh",
          "-c",
          "if [ -d \"$1\" ]; then printf \"1\\n\"; else printf \"0\\n\"; fi",
          "openclaw-sandbox-check",
          runtimePaths.runtimeRootDir]
          )
        })).stdout.toString("utf8").trim() === "1",
        actualConfigLabel: cfg.ssh.target,
        configLabelMatch: entry.image === cfg.ssh.target
      };
    } finally {
      await disposeSshSandboxSession(session);
    }
  },
  async removeRuntime({ entry, config, agentId }) {
    const cfg = (0, _configCWqq9_ZP.n)(config, agentId);
    if (cfg.backend !== "ssh" || !cfg.ssh.target) return;
    const runtimePaths = resolveSshRuntimePaths(cfg.ssh.workspaceRoot, entry.sessionKey);
    const session = await createSshSandboxSessionFromSettings({
      ...cfg.ssh,
      target: cfg.ssh.target
    });
    try {
      await runSshSandboxCommand({
        session,
        remoteCommand: buildRemoteCommand([
        "/bin/sh",
        "-c",
        "rm -rf -- \"$1\"",
        "openclaw-sandbox-remove",
        runtimePaths.runtimeRootDir]
        ),
        allowFailure: true
      });
    } finally {
      await disposeSshSandboxSession(session);
    }
  }
};
async function createSshSandboxBackend(params) {
  if ((params.cfg.docker.binds?.length ?? 0) > 0) throw new Error("SSH sandbox backend does not support sandbox.docker.binds.");
  const target = params.cfg.ssh.target;
  if (!target) throw new Error("Sandbox backend \"ssh\" requires agents.defaults.sandbox.ssh.target.");
  return new SshSandboxBackendImpl({
    createParams: params,
    target,
    runtimePaths: resolveSshRuntimePaths(params.cfg.ssh.workspaceRoot, params.scopeKey)
  }).asHandle();
}
var SshSandboxBackendImpl = class {
  constructor(params) {
    this.params = params;
    this.ensurePromise = null;
  }
  asHandle() {
    return {
      id: "ssh",
      runtimeId: this.params.runtimePaths.runtimeId,
      runtimeLabel: this.params.runtimePaths.runtimeId,
      workdir: this.params.runtimePaths.remoteWorkspaceDir,
      env: this.params.createParams.cfg.docker.env,
      configLabel: this.params.target,
      configLabelKind: "Target",
      remoteWorkspaceDir: this.params.runtimePaths.remoteWorkspaceDir,
      remoteAgentWorkspaceDir: this.params.runtimePaths.remoteAgentWorkspaceDir,
      buildExecSpec: async ({ command, workdir, env, usePty }) => {
        await this.ensureRuntime();
        const sshSession = await this.createSession();
        return {
          argv: buildSshSandboxArgv({
            session: sshSession,
            remoteCommand: buildExecRemoteCommand({
              command,
              workdir: workdir ?? this.params.runtimePaths.remoteWorkspaceDir,
              env
            }),
            tty: usePty
          }),
          env: (0, _sanitizeEnvVarsOg3CRoPL.t)(process.env).allowed,
          stdinMode: "pipe-open",
          finalizeToken: { sshSession }
        };
      },
      finalizeExec: async ({ token }) => {
        const sshSession = token?.sshSession;
        if (sshSession) await disposeSshSandboxSession(sshSession);
      },
      runShellCommand: async (command) => await this.runRemoteShellScript(command),
      createFsBridge: ({ sandbox }) => createRemoteShellSandboxFsBridge({
        sandbox,
        runtime: this.asHandle()
      }),
      runRemoteShellScript: async (command) => await this.runRemoteShellScript(command)
    };
  }
  async createSession() {
    return await createSshSandboxSessionFromSettings({
      ...this.params.createParams.cfg.ssh,
      target: this.params.target
    });
  }
  async ensureRuntime() {
    if (this.ensurePromise) return await this.ensurePromise;
    this.ensurePromise = this.ensureRuntimeInner();
    try {
      await this.ensurePromise;
    } catch (error) {
      this.ensurePromise = null;
      throw error;
    }
  }
  async ensureRuntimeInner() {
    const session = await this.createSession();
    try {
      if ((await runSshSandboxCommand({
        session,
        remoteCommand: buildRemoteCommand([
        "/bin/sh",
        "-c",
        "if [ -d \"$1\" ]; then printf \"1\\n\"; else printf \"0\\n\"; fi",
        "openclaw-sandbox-check",
        this.params.runtimePaths.runtimeRootDir]
        )
      })).stdout.toString("utf8").trim() === "1") return;
      await this.replaceRemoteDirectoryFromLocal(session, this.params.createParams.workspaceDir, this.params.runtimePaths.remoteWorkspaceDir);
      if (this.params.createParams.cfg.workspaceAccess !== "none" && _nodePath.default.resolve(this.params.createParams.agentWorkspaceDir) !== _nodePath.default.resolve(this.params.createParams.workspaceDir)) await this.replaceRemoteDirectoryFromLocal(session, this.params.createParams.agentWorkspaceDir, this.params.runtimePaths.remoteAgentWorkspaceDir);
    } finally {
      await disposeSshSandboxSession(session);
    }
  }
  async replaceRemoteDirectoryFromLocal(session, localDir, remoteDir) {
    await runSshSandboxCommand({
      session,
      remoteCommand: buildRemoteCommand([
      "/bin/sh",
      "-c",
      "mkdir -p -- \"$1\" && find \"$1\" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +",
      "openclaw-sandbox-clear",
      remoteDir]
      )
    });
    await uploadDirectoryToSshTarget({
      session,
      localDir,
      remoteDir
    });
  }
  async runRemoteShellScript(params) {
    await this.ensureRuntime();
    const session = await this.createSession();
    try {
      return await runSshSandboxCommand({
        session,
        remoteCommand: buildRemoteCommand([
        "/bin/sh",
        "-c",
        params.script,
        "openclaw-sandbox-fs",
        ...(params.args ?? [])]
        ),
        stdin: params.stdin,
        allowFailure: params.allowFailure,
        signal: params.signal
      });
    } finally {
      await disposeSshSandboxSession(session);
    }
  }
};
function resolveSshRuntimePaths(workspaceRoot, scopeKey) {
  const runtimeId = buildSshSandboxRuntimeId(scopeKey);
  const runtimeRootDir = _nodePath.default.posix.join(workspaceRoot, runtimeId);
  return {
    runtimeId,
    runtimeRootDir,
    remoteWorkspaceDir: _nodePath.default.posix.join(runtimeRootDir, "workspace"),
    remoteAgentWorkspaceDir: _nodePath.default.posix.join(runtimeRootDir, "agent")
  };
}
function buildSshSandboxRuntimeId(scopeKey) {
  const trimmed = scopeKey.trim() || "session";
  const safe = (0, _stringCoerceBUSzWgUA.i)(trimmed).replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
  const hash = Array.from(trimmed).reduce((acc, char) => (acc * 33 ^ char.charCodeAt(0)) >>> 0, 5381);
  return `openclaw-ssh-${safe || "session"}-${hash.toString(16).slice(0, 8)}`;
}
//#endregion
//#region src/agents/sandbox/backend.ts
const SANDBOX_BACKEND_FACTORIES = /* @__PURE__ */new Map();
function normalizeSandboxBackendId(id) {
  const normalized = (0, _stringCoerceBUSzWgUA.o)(id);
  if (!normalized) throw new Error("Sandbox backend id must not be empty.");
  return normalized;
}
function registerSandboxBackend(id, registration) {
  const normalizedId = normalizeSandboxBackendId(id);
  const resolved = typeof registration === "function" ? { factory: registration } : registration;
  const previous = SANDBOX_BACKEND_FACTORIES.get(normalizedId);
  SANDBOX_BACKEND_FACTORIES.set(normalizedId, resolved);
  return () => {
    if (previous) {
      SANDBOX_BACKEND_FACTORIES.set(normalizedId, previous);
      return;
    }
    SANDBOX_BACKEND_FACTORIES.delete(normalizedId);
  };
}
function getSandboxBackendFactory(id) {
  return SANDBOX_BACKEND_FACTORIES.get(normalizeSandboxBackendId(id))?.factory ?? null;
}
function getSandboxBackendManager(id) {
  return SANDBOX_BACKEND_FACTORIES.get(normalizeSandboxBackendId(id))?.manager ?? null;
}
function requireSandboxBackendFactory(id) {
  const factory = getSandboxBackendFactory(id);
  if (factory) return factory;
  throw new Error([`Sandbox backend "${id}" is not registered.`, "Load the plugin that provides it, or set agents.defaults.sandbox.backend=docker."].join("\n"));
}
registerSandboxBackend("docker", {
  factory: createDockerSandboxBackend,
  manager: dockerSandboxBackendManager
});
registerSandboxBackend("ssh", {
  factory: createSshSandboxBackend,
  manager: sshSandboxBackendManager
});
//#endregion
//#region src/plugin-sdk/browser-bridge.ts
function loadFacadeModule() {
  return (0, _facadeRuntimeGSGchfr.t)({
    dirName: "browser",
    artifactBasename: "runtime-api.js"
  });
}
async function startBrowserBridgeServer(params) {
  return await loadFacadeModule().startBrowserBridgeServer(params);
}
async function stopBrowserBridgeServer(server) {
  await loadFacadeModule().stopBrowserBridgeServer(server);
}
//#endregion
//#region src/agents/sandbox/browser-bridges.ts
const BROWSER_BRIDGES = /* @__PURE__ */new Map();
//#endregion
//#region src/agents/sandbox/novnc-auth.ts
const NOVNC_PASSWORD_ENV_KEY = "OPENCLAW_BROWSER_NOVNC_PASSWORD";
const NOVNC_TOKEN_TTL_MS = 60 * 1e3;
const NOVNC_PASSWORD_LENGTH = 8;
const NOVNC_PASSWORD_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NO_VNC_OBSERVER_TOKENS = /* @__PURE__ */new Map();
function pruneExpiredNoVncObserverTokens(now) {
  for (const [token, entry] of NO_VNC_OBSERVER_TOKENS) if (entry.expiresAt <= now) NO_VNC_OBSERVER_TOKENS.delete(token);
}
function isNoVncEnabled(params) {
  return params.enableNoVnc && !params.headless;
}
function generateNoVncPassword() {
  let out = "";
  for (let i = 0; i < NOVNC_PASSWORD_LENGTH; i += 1) out += NOVNC_PASSWORD_ALPHABET[_nodeCrypto.default.randomInt(0, 62)];
  return out;
}
function issueNoVncObserverToken(params) {
  const now = params.nowMs ?? Date.now();
  pruneExpiredNoVncObserverTokens(now);
  const token = _nodeCrypto.default.randomBytes(24).toString("hex");
  NO_VNC_OBSERVER_TOKENS.set(token, {
    noVncPort: params.noVncPort,
    password: (0, _stringCoerceBUSzWgUA.s)(params.password),
    expiresAt: now + Math.max(1, params.ttlMs ?? NOVNC_TOKEN_TTL_MS)
  });
  return token;
}
function consumeNoVncObserverToken(token, nowMs) {
  const now = nowMs ?? Date.now();
  pruneExpiredNoVncObserverTokens(now);
  const normalized = token.trim();
  if (!normalized) return null;
  const entry = NO_VNC_OBSERVER_TOKENS.get(normalized);
  if (!entry) return null;
  NO_VNC_OBSERVER_TOKENS.delete(normalized);
  if (entry.expiresAt <= now) return null;
  return {
    noVncPort: entry.noVncPort,
    password: entry.password
  };
}
function buildNoVncObserverTokenUrl(baseUrl, token) {
  return `${baseUrl}/sandbox/novnc?${new URLSearchParams({ token }).toString()}`;
}
//#endregion
//#region src/agents/sandbox/browser.ts
const HOT_BROWSER_WINDOW_MS = 300 * 1e3;
const CDP_SOURCE_RANGE_ENV_KEY = "OPENCLAW_BROWSER_CDP_SOURCE_RANGE";
async function waitForSandboxCdp(params) {
  const deadline = Date.now() + Math.max(0, params.timeoutMs);
  const url = `http://127.0.0.1:${params.cdpPort}/json/version`;
  while (Date.now() < deadline) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(ctrl.abort.bind(ctrl), 1e3);
      try {
        if ((await fetch(url, { signal: ctrl.signal })).ok) return true;
      } finally {
        clearTimeout(t);
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}
function buildSandboxBrowserResolvedConfig(params) {
  const cdpHost = "127.0.0.1";
  const cdpPortRange = (0, _portDefaultsBdplfuBS.n)(params.controlPort);
  return {
    enabled: true,
    evaluateEnabled: params.evaluateEnabled,
    controlPort: params.controlPort,
    cdpProtocol: "http",
    cdpHost,
    cdpIsLoopback: true,
    cdpPortRangeStart: cdpPortRange.start,
    cdpPortRangeEnd: cdpPortRange.end,
    remoteCdpTimeoutMs: 1500,
    remoteCdpHandshakeTimeoutMs: 3e3,
    color: _browserProfilesDM06n8Uh.i,
    executablePath: void 0,
    headless: params.headless,
    noSandbox: false,
    attachOnly: true,
    defaultProfile: _browserProfilesDM06n8Uh.o,
    extraArgs: [],
    profiles: { [_browserProfilesDM06n8Uh.o]: {
        cdpPort: params.cdpPort,
        color: _browserProfilesDM06n8Uh.i
      } }
  };
}
async function ensureSandboxBrowserImage(image) {
  if ((await (0, _dockerMSot2cJh.i)([
  "image",
  "inspect",
  image],
  { allowFailure: true })).code === 0) return;
  throw new Error(`Sandbox browser image not found: ${image}. Build it with scripts/sandbox-browser-setup.sh.`);
}
async function ensureDockerNetwork(network, opts) {
  (0, _dockerMSot2cJh.p)(network, { allowContainerNamespaceJoin: opts?.allowContainerNamespaceJoin === true });
  const normalized = (0, _stringCoerceBUSzWgUA.o)(network) ?? "";
  if (!normalized || normalized === "bridge" || normalized === "none") return;
  if ((await (0, _dockerMSot2cJh.i)([
  "network",
  "inspect",
  network],
  { allowFailure: true })).code === 0) return;
  await (0, _dockerMSot2cJh.i)([
  "network",
  "create",
  "--driver",
  "bridge",
  network]
  );
}
async function ensureSandboxBrowser(params) {
  if (!params.cfg.browser.enabled) return null;
  if (!(0, _configCWqq9_ZP.a)(params.cfg.tools, "browser")) return null;
  const slug = params.cfg.scope === "shared" ? "shared" : (0, _dockerMSot2cJh.y)(params.scopeKey);
  const containerName = `${params.cfg.browser.containerPrefix}${slug}`.slice(0, 63);
  const state = await (0, _dockerMSot2cJh.n)(containerName);
  const browserImage = params.cfg.browser.image ?? "openclaw-sandbox-browser:bookworm-slim";
  const cdpSourceRange = (0, _stringCoerceBUSzWgUA.s)(params.cfg.browser.cdpSourceRange);
  const browserDockerCfg = (0, _configCWqq9_ZP.t)({
    docker: params.cfg.docker,
    browser: {
      ...params.cfg.browser,
      image: browserImage
    }
  });
  const expectedHash = (0, _dockerMSot2cJh.E)({
    docker: browserDockerCfg,
    browser: {
      cdpPort: params.cfg.browser.cdpPort,
      vncPort: params.cfg.browser.vncPort,
      noVncPort: params.cfg.browser.noVncPort,
      headless: params.cfg.browser.headless,
      enableNoVnc: params.cfg.browser.enableNoVnc,
      autoStartTimeoutMs: params.cfg.browser.autoStartTimeoutMs,
      cdpSourceRange
    },
    securityEpoch: _configCWqq9_ZP.f,
    workspaceAccess: params.cfg.workspaceAccess,
    workspaceDir: params.workspaceDir,
    agentWorkspaceDir: params.agentWorkspaceDir,
    mountFormatVersion: 2
  });
  const now = Date.now();
  let hasContainer = state.exists;
  let running = state.running;
  let currentHash = null;
  let hashMismatch = false;
  const noVncEnabled = isNoVncEnabled(params.cfg.browser);
  let noVncPassword;
  if (hasContainer) {
    if (noVncEnabled) noVncPassword = (await (0, _dockerMSot2cJh.o)(containerName, "OPENCLAW_BROWSER_NOVNC_PASSWORD")) ?? void 0;
    const registryEntry = (await (0, _dockerMSot2cJh.b)()).entries.find((entry) => entry.containerName === containerName);
    currentHash = await (0, _dockerMSot2cJh.s)(containerName, "openclaw.configHash");
    hashMismatch = !currentHash || currentHash !== expectedHash;
    if (!currentHash) {
      currentHash = registryEntry?.configHash ?? null;
      hashMismatch = !currentHash || currentHash !== expectedHash;
    }
    if (hashMismatch) {
      const lastUsedAtMs = registryEntry?.lastUsedAtMs;
      if (running && (typeof lastUsedAtMs !== "number" || now - lastUsedAtMs < HOT_BROWSER_WINDOW_MS)) {
        const hint = (() => {
          if (params.cfg.scope === "session") return `openclaw sandbox recreate --browser --session ${params.scopeKey}`;
          if (params.cfg.scope === "agent") return `openclaw sandbox recreate --browser --agent ${(0, _dockerMSot2cJh.g)(params.scopeKey) ?? "main"}`;
          return "openclaw sandbox recreate --browser --all";
        })();
        _runtimeDx7oeLYq.n.log(`Sandbox browser config changed for ${containerName} (recently used). Recreate to apply: ${hint}`);
      } else {
        await (0, _dockerMSot2cJh.i)([
        "rm",
        "-f",
        containerName],
        { allowFailure: true });
        hasContainer = false;
        running = false;
      }
    }
  }
  if (!hasContainer) {
    if (noVncEnabled) noVncPassword = generateNoVncPassword();
    await ensureDockerNetwork(browserDockerCfg.network, { allowContainerNamespaceJoin: browserDockerCfg.dangerouslyAllowContainerNamespaceJoin === true });
    await ensureSandboxBrowserImage(browserImage);
    let effectiveCdpSourceRange = cdpSourceRange;
    if (!effectiveCdpSourceRange) {
      const driver = await (0, _dockerMSot2cJh.c)(browserDockerCfg.network);
      if (!driver || driver === "bridge") {
        const gateway = await (0, _dockerMSot2cJh.l)(browserDockerCfg.network);
        if (gateway && !gateway.includes(":")) effectiveCdpSourceRange = `${gateway}/32`;
      }
    }
    if (!effectiveCdpSourceRange && browserDockerCfg.network.trim().toLowerCase() === "none") effectiveCdpSourceRange = "127.0.0.1/32";
    if (!effectiveCdpSourceRange) throw new Error(`Cannot derive CDP source range for sandbox browser on network "${browserDockerCfg.network}". Set agents.defaults.sandbox.browser.cdpSourceRange explicitly.`);
    const args = (0, _dockerMSot2cJh.t)({
      name: containerName,
      cfg: browserDockerCfg,
      scopeKey: params.scopeKey,
      labels: {
        "openclaw.sandboxBrowser": "1",
        "openclaw.browserConfigEpoch": _configCWqq9_ZP.f
      },
      configHash: expectedHash,
      includeBinds: false,
      bindSourceRoots: [params.workspaceDir, params.agentWorkspaceDir]
    });
    (0, _dockerMSot2cJh.d)({
      args,
      workspaceDir: params.workspaceDir,
      agentWorkspaceDir: params.agentWorkspaceDir,
      workdir: params.cfg.docker.workdir,
      workspaceAccess: params.cfg.workspaceAccess
    });
    if (browserDockerCfg.binds?.length) for (const bind of browserDockerCfg.binds) args.push("-v", bind);
    args.push("-p", `127.0.0.1::${params.cfg.browser.cdpPort}`);
    if (noVncEnabled) args.push("-p", `127.0.0.1::${params.cfg.browser.noVncPort}`);
    args.push("-e", `OPENCLAW_BROWSER_HEADLESS=${params.cfg.browser.headless ? "1" : "0"}`);
    args.push("-e", `OPENCLAW_BROWSER_ENABLE_NOVNC=${params.cfg.browser.enableNoVnc ? "1" : "0"}`);
    args.push("-e", `OPENCLAW_BROWSER_CDP_PORT=${params.cfg.browser.cdpPort}`);
    args.push("-e", `OPENCLAW_BROWSER_AUTO_START_TIMEOUT_MS=${params.cfg.browser.autoStartTimeoutMs}`);
    if (effectiveCdpSourceRange) args.push("-e", `${CDP_SOURCE_RANGE_ENV_KEY}=${effectiveCdpSourceRange}`);
    args.push("-e", `OPENCLAW_BROWSER_VNC_PORT=${params.cfg.browser.vncPort}`);
    args.push("-e", `OPENCLAW_BROWSER_NOVNC_PORT=${params.cfg.browser.noVncPort}`);
    args.push("-e", "OPENCLAW_BROWSER_NO_SANDBOX=1");
    if (noVncEnabled && noVncPassword) args.push("-e", `${NOVNC_PASSWORD_ENV_KEY}=${noVncPassword}`);
    args.push(browserImage);
    await (0, _dockerMSot2cJh.i)(args);
    await (0, _dockerMSot2cJh.i)(["start", containerName]);
  } else if (!running) await (0, _dockerMSot2cJh.i)(["start", containerName]);
  const mappedCdp = await (0, _dockerMSot2cJh.u)(containerName, params.cfg.browser.cdpPort);
  if (!mappedCdp) throw new Error(`Failed to resolve CDP port mapping for ${containerName}.`);
  const mappedNoVnc = noVncEnabled ? await (0, _dockerMSot2cJh.u)(containerName, params.cfg.browser.noVncPort) : null;
  if (noVncEnabled && !noVncPassword) noVncPassword = (await (0, _dockerMSot2cJh.o)(containerName, "OPENCLAW_BROWSER_NOVNC_PASSWORD")) ?? void 0;
  const existing = BROWSER_BRIDGES.get(params.scopeKey);
  const existingProfile = existing ? (0, _browserProfilesDM06n8Uh.l)(existing.bridge.state.resolved, _browserProfilesDM06n8Uh.o) : null;
  let desiredAuthToken = (0, _stringCoerceBUSzWgUA.s)(params.bridgeAuth?.token);
  let desiredAuthPassword = (0, _stringCoerceBUSzWgUA.s)(params.bridgeAuth?.password);
  if (!desiredAuthToken && !desiredAuthPassword) {
    desiredAuthToken = existing?.authToken;
    desiredAuthPassword = existing?.authPassword;
    if (!desiredAuthToken && !desiredAuthPassword) desiredAuthToken = _nodeCrypto.default.randomBytes(24).toString("hex");
  }
  const shouldReuse = existing && existing.containerName === containerName && existingProfile?.cdpPort === mappedCdp;
  const authMatches = !existing || existing.authToken === desiredAuthToken && existing.authPassword === desiredAuthPassword;
  if (existing && !shouldReuse) {
    await stopBrowserBridgeServer(existing.bridge.server).catch(() => void 0);
    BROWSER_BRIDGES.delete(params.scopeKey);
  }
  if (existing && shouldReuse && !authMatches) {
    await stopBrowserBridgeServer(existing.bridge.server).catch(() => void 0);
    BROWSER_BRIDGES.delete(params.scopeKey);
  }
  const bridge = (() => {
    if (shouldReuse && authMatches && existing) return existing.bridge;
    return null;
  })();
  const ensureBridge = async () => {
    if (bridge) return bridge;
    const onEnsureAttachTarget = params.cfg.browser.autoStart ? async () => {
      const currentState = await (0, _dockerMSot2cJh.n)(containerName);
      if (currentState.exists && !currentState.running) await (0, _dockerMSot2cJh.i)(["start", containerName]);
      if (!(await waitForSandboxCdp({
        cdpPort: mappedCdp,
        timeoutMs: params.cfg.browser.autoStartTimeoutMs
      }))) {
        await (0, _dockerMSot2cJh.i)([
        "rm",
        "-f",
        containerName],
        { allowFailure: true });
        throw new Error(`Sandbox browser CDP did not become reachable on 127.0.0.1:${mappedCdp} within ${params.cfg.browser.autoStartTimeoutMs}ms. The hung container has been forcefully removed.`);
      }
    } : void 0;
    return await startBrowserBridgeServer({
      resolved: buildSandboxBrowserResolvedConfig({
        controlPort: 0,
        cdpPort: mappedCdp,
        headless: params.cfg.browser.headless,
        evaluateEnabled: params.evaluateEnabled ?? true
      }),
      authToken: desiredAuthToken,
      authPassword: desiredAuthPassword,
      onEnsureAttachTarget,
      resolveSandboxNoVncToken: consumeNoVncObserverToken
    });
  };
  const resolvedBridge = await ensureBridge();
  if (!shouldReuse || !authMatches) BROWSER_BRIDGES.set(params.scopeKey, {
    bridge: resolvedBridge,
    containerName,
    authToken: desiredAuthToken,
    authPassword: desiredAuthPassword
  });
  await (0, _dockerMSot2cJh.w)({
    containerName,
    sessionKey: params.scopeKey,
    createdAtMs: now,
    lastUsedAtMs: now,
    image: browserImage,
    configHash: hashMismatch && running ? currentHash ?? void 0 : expectedHash,
    cdpPort: mappedCdp,
    noVncPort: mappedNoVnc ?? void 0
  });
  const noVncUrl = mappedNoVnc && noVncEnabled ? (() => {
    const token = issueNoVncObserverToken({
      noVncPort: mappedNoVnc,
      password: noVncPassword
    });
    return buildNoVncObserverTokenUrl(resolvedBridge.baseUrl, token);
  })() : void 0;
  return {
    bridgeUrl: resolvedBridge.baseUrl,
    noVncUrl,
    containerName
  };
}
//#endregion
//#region src/agents/sandbox/fs-bridge-path-safety.ts
var SandboxFsPathGuard = class {
  constructor(params) {
    this.mountsByContainer = params.mountsByContainer;
    this.runCommand = params.runCommand;
  }
  async assertPathChecks(checks) {
    for (const check of checks) await this.assertPathSafety(check.target, check.options);
  }
  async assertPathSafety(target, options) {
    const guarded = await this.openBoundaryWithinRequiredMount(target, options.action, {
      aliasPolicy: options.aliasPolicy,
      allowedType: options.allowedType
    });
    await this.assertGuardedPathSafety(target, options, guarded);
  }
  async openReadableFile(target) {
    const opened = await this.openBoundaryWithinRequiredMount(target, "read files");
    if (!opened.ok) throw opened.error instanceof Error ? opened.error : /* @__PURE__ */new Error(`Sandbox boundary checks failed; cannot read files: ${target.containerPath}`);
    return opened;
  }
  resolveRequiredMount(containerPath, action) {
    const lexicalMount = this.resolveMountByContainerPath(containerPath);
    if (!lexicalMount) throw new Error(`Sandbox path escapes allowed mounts; cannot ${action}: ${containerPath}`);
    return lexicalMount;
  }
  finalizePinnedEntry(params) {
    const relativeParentPath = _nodePath.default.posix.relative(params.mount.containerRoot, params.parentPath);
    if (relativeParentPath.startsWith("..") || _nodePath.default.posix.isAbsolute(relativeParentPath)) throw new Error(`Sandbox path escapes allowed mounts; cannot ${params.action}: ${params.targetPath}`);
    return {
      mountRootPath: params.mount.containerRoot,
      relativeParentPath: relativeParentPath === "." ? "" : relativeParentPath,
      basename: params.basename
    };
  }
  async assertGuardedPathSafety(target, options, guarded) {
    if (!guarded.ok) {
      if (guarded.reason !== "path") {
        if (!(options.allowedType === "directory" && this.pathIsExistingDirectory(target.hostPath))) throw guarded.error instanceof Error ? guarded.error : /* @__PURE__ */new Error(`Sandbox boundary checks failed; cannot ${options.action}: ${target.containerPath}`);
      }
    } else _nodeFs.default.closeSync(guarded.fd);
    const canonicalContainerPath = await this.resolveCanonicalContainerPath({
      containerPath: target.containerPath,
      allowFinalSymlinkForUnlink: options.aliasPolicy?.allowFinalSymlinkForUnlink === true
    });
    const canonicalMount = this.resolveRequiredMount(canonicalContainerPath, options.action);
    if (options.requireWritable && !canonicalMount.writable) throw new Error(`Sandbox path is read-only; cannot ${options.action}: ${target.containerPath}`);
  }
  async openBoundaryWithinRequiredMount(target, action, options) {
    const lexicalMount = this.resolveRequiredMount(target.containerPath, action);
    return await (0, _boundaryFileReadDXLy_w6L.r)({
      absolutePath: target.hostPath,
      rootPath: lexicalMount.hostRoot,
      boundaryLabel: "sandbox mount root",
      aliasPolicy: options?.aliasPolicy,
      allowedType: options?.allowedType
    });
  }
  resolvePinnedEntry(target, action) {
    const basename = _nodePath.default.posix.basename(target.containerPath);
    if (!basename || basename === "." || basename === "/") throw new Error(`Invalid sandbox entry target: ${target.containerPath}`);
    const parentPath = normalizeContainerPath$1(_nodePath.default.posix.dirname(target.containerPath));
    const mount = this.resolveRequiredMount(parentPath, action);
    return this.finalizePinnedEntry({
      mount,
      parentPath,
      basename,
      targetPath: target.containerPath,
      action
    });
  }
  async resolveAnchoredSandboxEntry(target, action) {
    const basename = _nodePath.default.posix.basename(target.containerPath);
    if (!basename || basename === "." || basename === "/") throw new Error(`Invalid sandbox entry target: ${target.containerPath}`);
    const parentPath = normalizeContainerPath$1(_nodePath.default.posix.dirname(target.containerPath));
    const canonicalParentPath = await this.resolveCanonicalContainerPath({
      containerPath: parentPath,
      allowFinalSymlinkForUnlink: false
    });
    this.resolveRequiredMount(canonicalParentPath, action);
    return {
      canonicalParentPath,
      basename
    };
  }
  async resolveAnchoredPinnedEntry(target, action) {
    const anchoredTarget = await this.resolveAnchoredSandboxEntry(target, action);
    const mount = this.resolveRequiredMount(anchoredTarget.canonicalParentPath, action);
    return this.finalizePinnedEntry({
      mount,
      parentPath: anchoredTarget.canonicalParentPath,
      basename: anchoredTarget.basename,
      targetPath: target.containerPath,
      action
    });
  }
  resolvePinnedDirectoryEntry(target, action) {
    const mount = this.resolveRequiredMount(target.containerPath, action);
    const relativePath = _nodePath.default.posix.relative(mount.containerRoot, target.containerPath);
    if (relativePath.startsWith("..") || _nodePath.default.posix.isAbsolute(relativePath)) throw new Error(`Sandbox path escapes allowed mounts; cannot ${action}: ${target.containerPath}`);
    return {
      mountRootPath: mount.containerRoot,
      relativePath: relativePath === "." ? "" : relativePath
    };
  }
  pathIsExistingDirectory(hostPath) {
    try {
      return _nodeFs.default.statSync(hostPath).isDirectory();
    } catch {
      return false;
    }
  }
  resolveMountByContainerPath(containerPath) {
    const normalized = normalizeContainerPath$1(containerPath);
    for (const mount of this.mountsByContainer) if (isPathInsideContainerRoot(normalizeContainerPath$1(mount.containerRoot), normalized)) return mount;
    return null;
  }
  async resolveCanonicalContainerPath(params) {
    const script = [
    "set -eu",
    "target=\"$1\"",
    "allow_final=\"$2\"",
    "suffix=\"\"",
    "probe=\"$target\"",
    "if [ \"$allow_final\" = \"1\" ] && [ -L \"$target\" ]; then probe=$(dirname -- \"$target\"); fi",
    "cursor=\"$probe\"",
    "while [ ! -e \"$cursor\" ] && [ ! -L \"$cursor\" ]; do",
    "  parent=$(dirname -- \"$cursor\")",
    "  if [ \"$parent\" = \"$cursor\" ]; then break; fi",
    "  base=$(basename -- \"$cursor\")",
    "  suffix=\"/$base$suffix\"",
    "  cursor=\"$parent\"",
    "done",
    "canonical=$(readlink -f -- \"$cursor\")",
    "printf \"%s%s\\n\" \"$canonical\" \"$suffix\""].
    join("\n");
    const canonical = (await this.runCommand(script, { args: [params.containerPath, params.allowFinalSymlinkForUnlink ? "1" : "0"] })).stdout.toString("utf8").trim();
    if (!canonical.startsWith("/")) throw new Error(`Failed to resolve canonical sandbox path: ${params.containerPath}`);
    return normalizeContainerPath$1(canonical);
  }
};
//#endregion
//#region src/agents/sandbox/fs-bridge-shell-command-plans.ts
function buildStatPlan(target, anchoredTarget) {
  return {
    checks: [{
      target,
      options: { action: "stat files" }
    }],
    script: "set -eu\ncd -- \"$1\"\nstat -c \"%F|%s|%Y\" -- \"$2\"",
    args: [anchoredTarget.canonicalParentPath, anchoredTarget.basename],
    allowFailure: true
  };
}
//#endregion
//#region src/agents/sandbox/fs-paths.ts
function parseSandboxBindMount(spec) {
  const trimmed = spec.trim();
  if (!trimmed) return null;
  const parsed = (0, _dockerMSot2cJh.h)(trimmed);
  if (!parsed) return null;
  const hostToken = parsed.host.trim();
  const containerToken = parsed.container.trim();
  if (!hostToken || !containerToken || !_nodePath.default.posix.isAbsolute(containerToken)) return null;
  const optionsToken = (0, _stringCoerceBUSzWgUA.o)(parsed.options) ?? "";
  const writable = !(optionsToken ? optionsToken.split(",").map((entry) => entry.trim()).filter(Boolean) : []).includes("ro");
  return {
    hostRoot: _nodePath.default.resolve(hostToken),
    containerRoot: normalizeContainerPath$1(containerToken),
    writable
  };
}
function buildSandboxFsMounts(sandbox) {
  const mounts = [{
    hostRoot: _nodePath.default.resolve(sandbox.workspaceDir),
    containerRoot: normalizeContainerPath$1(sandbox.containerWorkdir),
    writable: sandbox.workspaceAccess === "rw",
    source: "workspace"
  }];
  if (sandbox.workspaceAccess !== "none" && _nodePath.default.resolve(sandbox.agentWorkspaceDir) !== _nodePath.default.resolve(sandbox.workspaceDir)) mounts.push({
    hostRoot: _nodePath.default.resolve(sandbox.agentWorkspaceDir),
    containerRoot: _configCWqq9_ZP.u,
    writable: sandbox.workspaceAccess === "rw",
    source: "agent"
  });
  for (const bind of sandbox.docker.binds ?? []) {
    const parsed = parseSandboxBindMount(bind);
    if (!parsed) continue;
    mounts.push({
      hostRoot: parsed.hostRoot,
      containerRoot: parsed.containerRoot,
      writable: parsed.writable,
      source: "bind"
    });
  }
  return dedupeMounts(mounts);
}
function resolveSandboxFsPathWithMounts(params) {
  const mountsByContainer = [...params.mounts].toSorted(compareMountsByContainerPath);
  const mountsByHost = [...params.mounts].toSorted(compareMountsByHostPath);
  const input = params.filePath;
  const inputPosix = normalizePosixInput(input);
  if (_nodePath.default.posix.isAbsolute(inputPosix)) {
    const containerMount = findMountByContainerPath(mountsByContainer, inputPosix);
    if (containerMount) {
      const rel = _nodePath.default.posix.relative(containerMount.containerRoot, inputPosix);
      return {
        hostPath: rel ? _nodePath.default.resolve(containerMount.hostRoot, ...toHostSegments(rel)) : containerMount.hostRoot,
        containerPath: rel ? _nodePath.default.posix.join(containerMount.containerRoot, rel) : containerMount.containerRoot,
        relativePath: toDisplayRelative({
          containerPath: rel ? _nodePath.default.posix.join(containerMount.containerRoot, rel) : containerMount.containerRoot,
          defaultContainerRoot: params.defaultContainerRoot
        }),
        writable: containerMount.writable
      };
    }
  }
  const hostResolved = (0, _sandboxPathsC5p25GeS.r)(input, params.cwd);
  const hostMount = findMountByHostPath(mountsByHost, hostResolved);
  if (hostMount) {
    const relHost = _nodePath.default.relative(hostMount.hostRoot, hostResolved);
    const relPosix = relHost ? relHost.split(_nodePath.default.sep).join(_nodePath.default.posix.sep) : "";
    const containerPath = relPosix ? _nodePath.default.posix.join(hostMount.containerRoot, relPosix) : hostMount.containerRoot;
    return {
      hostPath: hostResolved,
      containerPath,
      relativePath: toDisplayRelative({
        containerPath,
        defaultContainerRoot: params.defaultContainerRoot
      }),
      writable: hostMount.writable
    };
  }
  (0, _sandboxPathsC5p25GeS.i)({
    filePath: input,
    cwd: params.cwd,
    root: params.defaultWorkspaceRoot
  });
  throw new Error(`Path escapes sandbox root (${params.defaultWorkspaceRoot}): ${input}`);
}
function compareMountsByContainerPath(a, b) {
  const byLength = b.containerRoot.length - a.containerRoot.length;
  if (byLength !== 0) return byLength;
  return mountSourcePriority(b.source) - mountSourcePriority(a.source);
}
function compareMountsByHostPath(a, b) {
  const byLength = b.hostRoot.length - a.hostRoot.length;
  if (byLength !== 0) return byLength;
  return mountSourcePriority(b.source) - mountSourcePriority(a.source);
}
function mountSourcePriority(source) {
  if (source === "bind") return 2;
  if (source === "agent") return 1;
  return 0;
}
function dedupeMounts(mounts) {
  const seen = /* @__PURE__ */new Set();
  const deduped = [];
  for (const mount of mounts) {
    const key = `${mount.hostRoot}=>${mount.containerRoot}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(mount);
  }
  return deduped;
}
function findMountByContainerPath(mounts, target) {
  for (const mount of mounts) if (isPathInsideContainerRoot(mount.containerRoot, target)) return mount;
  return null;
}
function findMountByHostPath(mounts, target) {
  for (const mount of mounts) if (isPathInsideHost(mount.hostRoot, target)) return mount;
  return null;
}
function isPathInsideHost(root, target) {
  const canonicalRoot = (0, _dockerMSot2cJh.m)(_nodePath.default.resolve(root));
  const resolvedTarget = _nodePath.default.resolve(target);
  const canonicalTargetParent = (0, _dockerMSot2cJh.m)(_nodePath.default.dirname(resolvedTarget));
  const canonicalTarget = _nodePath.default.resolve(canonicalTargetParent, _nodePath.default.basename(resolvedTarget));
  const rel = _nodePath.default.relative(canonicalRoot, canonicalTarget);
  if (!rel) return true;
  return !(rel.startsWith("..") || _nodePath.default.isAbsolute(rel));
}
function toHostSegments(relativePosix) {
  return relativePosix.split("/").filter(Boolean);
}
function toDisplayRelative(params) {
  const rel = _nodePath.default.posix.relative(params.defaultContainerRoot, params.containerPath);
  if (!rel) return "";
  if (!rel.startsWith("..") && !_nodePath.default.posix.isAbsolute(rel)) return rel;
  return params.containerPath;
}
function normalizePosixInput(value) {
  return value.replace(/\\/g, "/").trim();
}
//#endregion
//#region src/agents/sandbox/fs-bridge.ts
function createSandboxFsBridge(params) {
  return new SandboxFsBridgeImpl(params.sandbox);
}
var SandboxFsBridgeImpl = class {
  constructor(sandbox) {
    this.sandbox = sandbox;
    this.mounts = buildSandboxFsMounts(sandbox);
    this.pathGuard = new SandboxFsPathGuard({
      mountsByContainer: [...this.mounts].toSorted((a, b) => b.containerRoot.length - a.containerRoot.length),
      runCommand: (script, options) => this.runCommand(script, options)
    });
  }
  resolvePath(params) {
    const target = this.resolveResolvedPath(params);
    return {
      hostPath: target.hostPath,
      relativePath: target.relativePath,
      containerPath: target.containerPath
    };
  }
  async readFile(params) {
    const target = this.resolveResolvedPath(params);
    return this.readPinnedFile(target);
  }
  async writeFile(params) {
    const target = this.resolveResolvedPath(params);
    this.ensureWriteAccess(target, "write files");
    const writeCheck = {
      target,
      options: {
        action: "write files",
        requireWritable: true
      }
    };
    await this.pathGuard.assertPathSafety(target, writeCheck.options);
    const buffer = Buffer.isBuffer(params.data) ? params.data : Buffer.from(params.data, params.encoding ?? "utf8");
    const pinnedWriteTarget = await this.pathGuard.resolveAnchoredPinnedEntry(target, "write files");
    await this.runCheckedCommand({
      ...buildPinnedWritePlan({
        check: writeCheck,
        pinned: pinnedWriteTarget,
        mkdir: params.mkdir !== false
      }),
      stdin: buffer,
      signal: params.signal
    });
  }
  async mkdirp(params) {
    const target = this.resolveResolvedPath(params);
    this.ensureWriteAccess(target, "create directories");
    const mkdirCheck = {
      target,
      options: {
        action: "create directories",
        requireWritable: true,
        allowedType: "directory"
      }
    };
    await this.runCheckedCommand({
      ...buildPinnedMkdirpPlan({
        check: mkdirCheck,
        pinned: this.pathGuard.resolvePinnedDirectoryEntry(target, "create directories")
      }),
      signal: params.signal
    });
  }
  async remove(params) {
    const target = this.resolveResolvedPath(params);
    this.ensureWriteAccess(target, "remove files");
    const removeCheck = {
      target,
      options: {
        action: "remove files",
        requireWritable: true
      }
    };
    await this.runCheckedCommand({
      ...buildPinnedRemovePlan({
        check: removeCheck,
        pinned: this.pathGuard.resolvePinnedEntry(target, "remove files"),
        recursive: params.recursive,
        force: params.force
      }),
      signal: params.signal
    });
  }
  async rename(params) {
    const from = this.resolveResolvedPath({
      filePath: params.from,
      cwd: params.cwd
    });
    const to = this.resolveResolvedPath({
      filePath: params.to,
      cwd: params.cwd
    });
    this.ensureWriteAccess(from, "rename files");
    this.ensureWriteAccess(to, "rename files");
    const fromCheck = {
      target: from,
      options: {
        action: "rename files",
        requireWritable: true
      }
    };
    const toCheck = {
      target: to,
      options: {
        action: "rename files",
        requireWritable: true
      }
    };
    await this.runCheckedCommand({
      ...buildPinnedRenamePlan({
        fromCheck,
        toCheck,
        from: this.pathGuard.resolvePinnedEntry(from, "rename files"),
        to: this.pathGuard.resolvePinnedEntry(to, "rename files")
      }),
      signal: params.signal
    });
  }
  async stat(params) {
    const target = this.resolveResolvedPath(params);
    const anchoredTarget = await this.pathGuard.resolveAnchoredSandboxEntry(target, "stat files");
    const result = await this.runPlannedCommand(buildStatPlan(target, anchoredTarget), params.signal);
    if (result.code !== 0) {
      const stderr = result.stderr.toString("utf8");
      if (stderr.includes("No such file or directory")) return null;
      const message = stderr.trim() || `stat failed with code ${result.code}`;
      throw new Error(`stat failed for ${target.containerPath}: ${message}`);
    }
    const [typeRaw, sizeRaw, mtimeRaw] = result.stdout.toString("utf8").trim().split("|");
    const size = Number.parseInt(sizeRaw ?? "0", 10);
    const mtime = Number.parseInt(mtimeRaw ?? "0", 10) * 1e3;
    return {
      type: coerceStatType(typeRaw),
      size: Number.isFinite(size) ? size : 0,
      mtimeMs: Number.isFinite(mtime) ? mtime : 0
    };
  }
  async runCommand(script, options = {}) {
    const backend = this.sandbox.backend;
    if (backend) return await backend.runShellCommand({
      script,
      args: options.args,
      stdin: options.stdin,
      allowFailure: options.allowFailure,
      signal: options.signal
    });
    return await runDockerSandboxShellCommand({
      containerName: this.sandbox.containerName,
      script,
      args: options.args,
      stdin: options.stdin,
      allowFailure: options.allowFailure,
      signal: options.signal
    });
  }
  async readPinnedFile(target) {
    const opened = await this.pathGuard.openReadableFile(target);
    try {
      return _nodeFs.default.readFileSync(opened.fd);
    } finally {
      _nodeFs.default.closeSync(opened.fd);
    }
  }
  async runCheckedCommand(plan) {
    await this.pathGuard.assertPathChecks(plan.checks);
    if (plan.recheckBeforeCommand) await this.pathGuard.assertPathChecks(plan.checks);
    return await this.runCommand(plan.script, {
      args: plan.args,
      stdin: plan.stdin,
      allowFailure: plan.allowFailure,
      signal: plan.signal
    });
  }
  async runPlannedCommand(plan, signal) {
    return await this.runCheckedCommand({
      ...plan,
      signal
    });
  }
  ensureWriteAccess(target, action) {
    if (!allowsWrites(this.sandbox.workspaceAccess) || !target.writable) throw new Error(`Sandbox path is read-only; cannot ${action}: ${target.containerPath}`);
  }
  resolveResolvedPath(params) {
    return resolveSandboxFsPathWithMounts({
      filePath: params.filePath,
      cwd: params.cwd ?? this.sandbox.workspaceDir,
      defaultWorkspaceRoot: this.sandbox.workspaceDir,
      defaultContainerRoot: this.sandbox.containerWorkdir,
      mounts: this.mounts
    });
  }
};
function allowsWrites(access) {
  return access === "rw";
}
function coerceStatType(typeRaw) {
  if (!typeRaw) return "other";
  const normalized = (0, _stringCoerceBUSzWgUA.o)(typeRaw) ?? "";
  if (normalized.includes("directory")) return "directory";
  if (normalized.includes("file")) return "file";
  return "other";
}
//#endregion
//#region src/agents/sandbox/prune.ts
let lastPruneAtMs = 0;
function shouldPruneSandboxEntry(cfg, now, entry) {
  const idleHours = cfg.prune.idleHours;
  const maxAgeDays = cfg.prune.maxAgeDays;
  if (idleHours === 0 && maxAgeDays === 0) return false;
  const idleMs = now - entry.lastUsedAtMs;
  const ageMs = now - entry.createdAtMs;
  return idleHours > 0 && idleMs > idleHours * 60 * 60 * 1e3 || maxAgeDays > 0 && ageMs > maxAgeDays * 24 * 60 * 60 * 1e3;
}
async function pruneSandboxRegistryEntries(params) {
  const now = Date.now();
  if (params.cfg.prune.idleHours === 0 && params.cfg.prune.maxAgeDays === 0) return;
  const registry = await params.read();
  for (const entry of registry.entries) {
    if (!shouldPruneSandboxEntry(params.cfg, now, entry)) continue;
    try {
      await params.removeRuntime(entry);
    } catch {} finally {
      await params.remove(entry.containerName);
      await params.onRemoved?.(entry);
    }
  }
}
async function pruneSandboxContainers(cfg) {
  const config = (0, _io5pxHCi7V.a)();
  await pruneSandboxRegistryEntries({
    cfg,
    read: _dockerMSot2cJh.x,
    remove: _dockerMSot2cJh.C,
    removeRuntime: async (entry) => {
      await getSandboxBackendManager(entry.backendId ?? "docker")?.removeRuntime({
        entry,
        config
      });
    }
  });
}
async function pruneSandboxBrowsers(cfg) {
  const config = (0, _io5pxHCi7V.a)();
  await pruneSandboxRegistryEntries({
    cfg,
    read: _dockerMSot2cJh.b,
    remove: _dockerMSot2cJh.S,
    removeRuntime: async (entry) => {
      await dockerSandboxBackendManager.removeRuntime({
        entry: {
          ...entry,
          backendId: "docker",
          runtimeLabel: entry.containerName,
          configLabelKind: "Image"
        },
        config
      });
    },
    onRemoved: async (entry) => {
      const bridge = BROWSER_BRIDGES.get(entry.sessionKey);
      if (bridge?.containerName === entry.containerName) {
        await stopBrowserBridgeServer(bridge.bridge.server).catch(() => void 0);
        BROWSER_BRIDGES.delete(entry.sessionKey);
      }
    }
  });
}
async function maybePruneSandboxes(cfg) {
  const now = Date.now();
  if (now - lastPruneAtMs < 300 * 1e3) return;
  lastPruneAtMs = now;
  try {
    await pruneSandboxContainers(cfg);
    await pruneSandboxBrowsers(cfg);
  } catch (error) {
    const message = error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error);
    _runtimeDx7oeLYq.n.error?.(`Sandbox prune failed: ${message ?? "unknown error"}`);
  }
}
//#endregion
//#region src/agents/sandbox/workspace.ts
async function ensureSandboxWorkspace(workspaceDir, seedFrom, skipBootstrap) {
  await _promises.default.mkdir(workspaceDir, { recursive: true });
  if (seedFrom) {
    const seed = (0, _utilsD5DtWkEu.m)(seedFrom);
    const files = [
    _workspaceHhTlRYqM.t,
    _workspaceHhTlRYqM.c,
    _workspaceHhTlRYqM.l,
    _workspaceHhTlRYqM.a,
    _workspaceHhTlRYqM.u,
    _workspaceHhTlRYqM.r,
    _workspaceHhTlRYqM.i];

    for (const name of files) {
      const src = _nodePath.default.join(seed, name);
      const dest = _nodePath.default.join(workspaceDir, name);
      try {
        await _promises.default.access(dest);
      } catch {
        try {
          const opened = await (0, _boundaryFileReadDXLy_w6L.r)({
            absolutePath: src,
            rootPath: seed,
            boundaryLabel: "sandbox seed workspace"
          });
          if (!opened.ok) continue;
          try {
            const content = _nodeFs.default.readFileSync(opened.fd, "utf-8");
            await _promises.default.writeFile(dest, content, {
              encoding: "utf-8",
              flag: "wx"
            });
          } finally {
            _nodeFs.default.closeSync(opened.fd);
          }
        } catch {}
      }
    }
  }
  await (0, _workspaceHhTlRYqM.d)({
    dir: workspaceDir,
    ensureBootstrapFiles: !skipBootstrap
  });
}
//#endregion
//#region src/agents/sandbox/context.ts
async function ensureSandboxWorkspaceLayout(params) {
  const { cfg, rawSessionKey } = params;
  const agentWorkspaceDir = (0, _utilsD5DtWkEu.m)(params.workspaceDir?.trim() || _workspaceHhTlRYqM.n);
  const workspaceRoot = (0, _utilsD5DtWkEu.m)(cfg.workspaceRoot);
  const scopeKey = (0, _dockerMSot2cJh._)(cfg.scope, rawSessionKey);
  const sandboxWorkspaceDir = cfg.scope === "shared" ? workspaceRoot : (0, _dockerMSot2cJh.v)(workspaceRoot, scopeKey);
  const workspaceDir = cfg.workspaceAccess === "rw" ? agentWorkspaceDir : sandboxWorkspaceDir;
  if (workspaceDir === sandboxWorkspaceDir) {
    await ensureSandboxWorkspace(sandboxWorkspaceDir, agentWorkspaceDir, params.config?.agents?.defaults?.skipBootstrap);
    if (cfg.workspaceAccess !== "rw") try {
      await (0, _skillsCwx5TftI.l)({
        sourceWorkspaceDir: agentWorkspaceDir,
        targetWorkspaceDir: sandboxWorkspaceDir,
        config: params.config,
        agentId: params.agentId,
        eligibility: { remote: (0, _execDefaultsDiCDZt_n.r)({ advertiseExecNode: (0, _execDefaultsDiCDZt_n.t)({
              cfg: params.config,
              sessionKey: rawSessionKey,
              agentId: params.agentId
            }) }) }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      _runtimeDx7oeLYq.n.error?.(`Sandbox skill sync failed: ${message}`);
    }
  } else await _promises.default.mkdir(workspaceDir, { recursive: true });
  return {
    agentWorkspaceDir,
    scopeKey,
    sandboxWorkspaceDir,
    workspaceDir
  };
}
async function resolveSandboxDockerUser(params) {
  if (params.docker.user?.trim()) return params.docker;
  const stat = params.stat ?? ((workspaceDir) => _promises.default.stat(workspaceDir));
  try {
    const workspaceStat = await stat(params.workspaceDir);
    const uid = Number.isInteger(workspaceStat.uid) ? workspaceStat.uid : null;
    const gid = Number.isInteger(workspaceStat.gid) ? workspaceStat.gid : null;
    if (uid === null || gid === null || uid < 0 || gid < 0) return params.docker;
    return {
      ...params.docker,
      user: `${uid}:${gid}`
    };
  } catch {
    return params.docker;
  }
}
function resolveSandboxSession(params) {
  const rawSessionKey = params.sessionKey?.trim();
  if (!rawSessionKey) return null;
  const runtime = (0, _runtimeStatusDhGewqgv.n)({
    cfg: params.config,
    sessionKey: rawSessionKey
  });
  if (!runtime.sandboxed) return null;
  return {
    rawSessionKey,
    runtime,
    cfg: (0, _configCWqq9_ZP.n)(params.config, runtime.agentId)
  };
}
async function resolveSandboxContext(params) {
  const resolved = resolveSandboxSession(params);
  if (!resolved) return null;
  const { rawSessionKey, cfg, runtime } = resolved;
  await maybePruneSandboxes(cfg);
  const { agentWorkspaceDir, scopeKey, workspaceDir } = await ensureSandboxWorkspaceLayout({
    cfg,
    agentId: runtime.agentId,
    rawSessionKey,
    config: params.config,
    workspaceDir: params.workspaceDir
  });
  const docker = await resolveSandboxDockerUser({
    docker: cfg.docker,
    workspaceDir
  });
  const resolvedCfg = docker === cfg.docker ? cfg : {
    ...cfg,
    docker
  };
  const backend = await requireSandboxBackendFactory(resolvedCfg.backend)({
    sessionKey: rawSessionKey,
    scopeKey,
    workspaceDir,
    agentWorkspaceDir,
    cfg: resolvedCfg
  });
  await (0, _dockerMSot2cJh.T)({
    containerName: backend.runtimeId,
    backendId: backend.id,
    runtimeLabel: backend.runtimeLabel,
    sessionKey: scopeKey,
    createdAtMs: Date.now(),
    lastUsedAtMs: Date.now(),
    image: backend.configLabel ?? resolvedCfg.docker.image,
    configLabelKind: backend.configLabelKind ?? "Image"
  });
  const evaluateEnabled = params.config?.browser?.evaluateEnabled ?? true;
  const bridgeAuth = cfg.browser.enabled ? await (async () => {
    const cfgForAuth = params.config ?? (0, _io5pxHCi7V.a)();
    let browserAuth = (0, _browserControlAuthCuDh_EEK.n)(cfgForAuth);
    try {
      browserAuth = (await (0, _browserControlAuthCuDh_EEK.t)({ cfg: cfgForAuth })).auth;
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      _runtimeDx7oeLYq.n.error?.(`Sandbox browser auth ensure failed: ${message}`);
    }
    return browserAuth;
  })() : void 0;
  if (resolvedCfg.browser.enabled && backend.capabilities?.browser !== true) throw new Error(`Sandbox backend "${resolvedCfg.backend}" does not support browser sandboxes yet.`);
  const browser = resolvedCfg.browser.enabled && backend.capabilities?.browser === true ? await ensureSandboxBrowser({
    scopeKey,
    workspaceDir,
    agentWorkspaceDir,
    cfg: resolvedCfg,
    evaluateEnabled,
    bridgeAuth
  }) : null;
  const sandboxContext = {
    enabled: true,
    backendId: backend.id,
    sessionKey: rawSessionKey,
    workspaceDir,
    agentWorkspaceDir,
    workspaceAccess: resolvedCfg.workspaceAccess,
    runtimeId: backend.runtimeId,
    runtimeLabel: backend.runtimeLabel,
    containerName: backend.runtimeId,
    containerWorkdir: backend.workdir,
    docker: resolvedCfg.docker,
    tools: resolvedCfg.tools,
    browserAllowHostControl: resolvedCfg.browser.allowHostControl,
    browser: browser ?? void 0,
    backend
  };
  sandboxContext.fsBridge = backend.createFsBridge?.({ sandbox: sandboxContext }) ?? createSandboxFsBridge({ sandbox: sandboxContext });
  return sandboxContext;
}
async function ensureSandboxWorkspaceForSession(params) {
  const resolved = resolveSandboxSession(params);
  if (!resolved) return null;
  const { rawSessionKey, cfg, runtime } = resolved;
  const { workspaceDir } = await ensureSandboxWorkspaceLayout({
    cfg,
    agentId: runtime.agentId,
    rawSessionKey,
    config: params.config,
    workspaceDir: params.workspaceDir
  });
  return {
    workspaceDir,
    containerWorkdir: cfg.docker.workdir
  };
}
//#endregion
//#region src/agents/sandbox/manage.ts
function toBrowserDockerRuntimeEntry(entry) {
  return {
    ...entry,
    backendId: "docker",
    runtimeLabel: entry.containerName,
    configLabelKind: "BrowserImage"
  };
}
async function listSandboxContainers() {
  const config = (0, _io5pxHCi7V.a)();
  const registry = await (0, _dockerMSot2cJh.x)();
  const results = [];
  for (const entry of registry.entries) {
    const manager = getSandboxBackendManager(entry.backendId ?? "docker");
    if (!manager) {
      results.push({
        ...entry,
        running: false,
        imageMatch: true
      });
      continue;
    }
    const agentId = (0, _dockerMSot2cJh.g)(entry.sessionKey);
    const runtime = await manager.describeRuntime({
      entry,
      config,
      agentId
    });
    results.push({
      ...entry,
      image: runtime.actualConfigLabel ?? entry.image,
      running: runtime.running,
      imageMatch: runtime.configLabelMatch
    });
  }
  return results;
}
async function listSandboxBrowsers() {
  const config = (0, _io5pxHCi7V.a)();
  const registry = await (0, _dockerMSot2cJh.b)();
  const results = [];
  for (const entry of registry.entries) {
    const agentId = (0, _dockerMSot2cJh.g)(entry.sessionKey);
    const runtime = await dockerSandboxBackendManager.describeRuntime({
      entry: toBrowserDockerRuntimeEntry(entry),
      config,
      agentId
    });
    results.push({
      ...entry,
      image: runtime.actualConfigLabel ?? entry.image,
      running: runtime.running,
      imageMatch: runtime.configLabelMatch
    });
  }
  return results;
}
async function removeSandboxContainer(containerName) {
  const config = (0, _io5pxHCi7V.a)();
  const entry = (await (0, _dockerMSot2cJh.x)()).entries.find((item) => item.containerName === containerName);
  if (entry) await getSandboxBackendManager(entry.backendId ?? "docker")?.removeRuntime({
    entry,
    config,
    agentId: (0, _dockerMSot2cJh.g)(entry.sessionKey)
  });
  await (0, _dockerMSot2cJh.C)(containerName);
}
async function removeSandboxBrowserContainer(containerName) {
  const config = (0, _io5pxHCi7V.a)();
  const entry = (await (0, _dockerMSot2cJh.b)()).entries.find((item) => item.containerName === containerName);
  if (entry) await dockerSandboxBackendManager.removeRuntime({
    entry: toBrowserDockerRuntimeEntry(entry),
    config
  });
  await (0, _dockerMSot2cJh.S)(containerName);
  for (const [sessionKey, bridge] of BROWSER_BRIDGES.entries()) if (bridge.containerName === containerName) {
    await stopBrowserBridgeServer(bridge.bridge.server).catch(() => void 0);
    BROWSER_BRIDGES.delete(sessionKey);
  }
}
//#endregion /* v9-2b25b08f8b2ecaf6 */
