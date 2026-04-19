"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.handleConfigCommand = handleConfigCommand;exports.handlePackageCommand = handlePackageCommand;var _chalk = _interopRequireDefault(require("chalk"));
var _configSelector = require("./cli/config-selector.js");
var _config = require("./config.js");
var _packageManager = require("./core/package-manager.js");
var _settingsManager = require("./core/settings-manager.js");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}
function reportSettingsErrors(settingsManager, context) {
  const errors = settingsManager.drainErrors();
  for (const { scope, error } of errors) {
    console.error(_chalk.default.yellow(`Warning (${context}, ${scope} settings): ${error.message}`));
    if (error.stack) {
      console.error(_chalk.default.dim(error.stack));
    }
  }
}
function getPackageCommandUsage(command) {
  switch (command) {
    case "install":
      return `${_config.APP_NAME} install <source> [-l]`;
    case "remove":
      return `${_config.APP_NAME} remove <source> [-l]`;
    case "update":
      return `${_config.APP_NAME} update [source]`;
    case "list":
      return `${_config.APP_NAME} list`;
  }
}
function printPackageCommandHelp(command) {
  switch (command) {
    case "install":
      console.log(`${_chalk.default.bold("Usage:")}
  ${getPackageCommandUsage("install")}

Install a package and add it to settings.

Options:
  -l, --local    Install project-locally (.pi/settings.json)

Examples:
  ${_config.APP_NAME} install npm:@foo/bar
  ${_config.APP_NAME} install git:github.com/user/repo
  ${_config.APP_NAME} install git:git@github.com:user/repo
  ${_config.APP_NAME} install https://github.com/user/repo
  ${_config.APP_NAME} install ssh://git@github.com/user/repo
  ${_config.APP_NAME} install ./local/path
`);
      return;
    case "remove":
      console.log(`${_chalk.default.bold("Usage:")}
  ${getPackageCommandUsage("remove")}

Remove a package and its source from settings.
Alias: ${_config.APP_NAME} uninstall <source> [-l]

Options:
  -l, --local    Remove from project settings (.pi/settings.json)

Examples:
  ${_config.APP_NAME} remove npm:@foo/bar
  ${_config.APP_NAME} uninstall npm:@foo/bar
`);
      return;
    case "update":
      console.log(`${_chalk.default.bold("Usage:")}
  ${getPackageCommandUsage("update")}

Update installed packages.
If <source> is provided, only that package is updated.
`);
      return;
    case "list":
      console.log(`${_chalk.default.bold("Usage:")}
  ${getPackageCommandUsage("list")}

List installed packages from user and project settings.
`);
      return;
  }
}
function parsePackageCommand(args) {
  const [rawCommand, ...rest] = args;
  let command;
  if (rawCommand === "uninstall") {
    command = "remove";
  } else
  if (rawCommand === "install" || rawCommand === "remove" || rawCommand === "update" || rawCommand === "list") {
    command = rawCommand;
  }
  if (!command) {
    return undefined;
  }
  let local = false;
  let help = false;
  let invalidOption;
  let source;
  for (const arg of rest) {
    if (arg === "-h" || arg === "--help") {
      help = true;
      continue;
    }
    if (arg === "-l" || arg === "--local") {
      if (command === "install" || command === "remove") {
        local = true;
      } else
      {
        invalidOption = invalidOption ?? arg;
      }
      continue;
    }
    if (arg.startsWith("-")) {
      invalidOption = invalidOption ?? arg;
      continue;
    }
    if (!source) {
      source = arg;
    }
  }
  return { command, source, local, help, invalidOption };
}
async function handleConfigCommand(args) {
  if (args[0] !== "config") {
    return false;
  }
  const cwd = process.cwd();
  const agentDir = (0, _config.getAgentDir)();
  const settingsManager = _settingsManager.SettingsManager.create(cwd, agentDir);
  reportSettingsErrors(settingsManager, "config command");
  const packageManager = new _packageManager.DefaultPackageManager({ cwd, agentDir, settingsManager });
  const resolvedPaths = await packageManager.resolve();
  await (0, _configSelector.selectConfig)({
    resolvedPaths,
    settingsManager,
    cwd,
    agentDir
  });
  process.exit(0);
}
async function handlePackageCommand(args) {
  const options = parsePackageCommand(args);
  if (!options) {
    return false;
  }
  if (options.help) {
    printPackageCommandHelp(options.command);
    return true;
  }
  if (options.invalidOption) {
    console.error(_chalk.default.red(`Unknown option ${options.invalidOption} for "${options.command}".`));
    console.error(_chalk.default.dim(`Use "${_config.APP_NAME} --help" or "${getPackageCommandUsage(options.command)}".`));
    process.exitCode = 1;
    return true;
  }
  const source = options.source;
  if ((options.command === "install" || options.command === "remove") && !source) {
    console.error(_chalk.default.red(`Missing ${options.command} source.`));
    console.error(_chalk.default.dim(`Usage: ${getPackageCommandUsage(options.command)}`));
    process.exitCode = 1;
    return true;
  }
  const cwd = process.cwd();
  const agentDir = (0, _config.getAgentDir)();
  const settingsManager = _settingsManager.SettingsManager.create(cwd, agentDir);
  reportSettingsErrors(settingsManager, "package command");
  const packageManager = new _packageManager.DefaultPackageManager({ cwd, agentDir, settingsManager });
  packageManager.setProgressCallback((event) => {
    if (event.type === "start") {
      process.stdout.write(_chalk.default.dim(`${event.message}\n`));
    }
  });
  try {
    switch (options.command) {
      case "install":
        await packageManager.installAndPersist(source, { local: options.local });
        console.log(_chalk.default.green(`Installed ${source}`));
        return true;
      case "remove":{
          const removed = await packageManager.removeAndPersist(source, { local: options.local });
          if (!removed) {
            console.error(_chalk.default.red(`No matching package found for ${source}`));
            process.exitCode = 1;
            return true;
          }
          console.log(_chalk.default.green(`Removed ${source}`));
          return true;
        }
      case "list":{
          const configuredPackages = packageManager.listConfiguredPackages();
          const userPackages = configuredPackages.filter((pkg) => pkg.scope === "user");
          const projectPackages = configuredPackages.filter((pkg) => pkg.scope === "project");
          if (configuredPackages.length === 0) {
            console.log(_chalk.default.dim("No packages installed."));
            return true;
          }
          const formatPackage = (pkg) => {
            const display = pkg.filtered ? `${pkg.source} (filtered)` : pkg.source;
            console.log(`  ${display}`);
            if (pkg.installedPath) {
              console.log(_chalk.default.dim(`    ${pkg.installedPath}`));
            }
          };
          if (userPackages.length > 0) {
            console.log(_chalk.default.bold("User packages:"));
            for (const pkg of userPackages) {
              formatPackage(pkg);
            }
          }
          if (projectPackages.length > 0) {
            if (userPackages.length > 0)
            console.log();
            console.log(_chalk.default.bold("Project packages:"));
            for (const pkg of projectPackages) {
              formatPackage(pkg);
            }
          }
          return true;
        }
      case "update":
        await packageManager.update(source);
        if (source) {
          console.log(_chalk.default.green(`Updated ${source}`));
        } else
        {
          console.log(_chalk.default.green("Updated packages"));
        }
        return true;
    }
  }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unknown package command error";
    console.error(_chalk.default.red(`Error: ${message}`));
    process.exitCode = 1;
    return true;
  }
} /* v9-2b64db08f23f3d0c */
