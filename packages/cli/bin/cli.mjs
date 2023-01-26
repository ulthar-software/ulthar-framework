#!/usr/bin/env node

// ../commandy/dist/program.js
import { basename } from "path";

// ../blamey/dist/error-container.js
var ErrorContainer = class {
  map;
  constructor(map) {
    this.map = map;
  }
  assert(value) {
    return {
      orThrow: (errorKey, context) => {
        if (!value) {
          this.throw(errorKey, context);
        }
      }
    };
  }
  throw(errorKey, context) {
    throw this.render(errorKey, context);
  }
  is(err, errorKey) {
    return err.name == errorKey;
  }
  render(errorKey, context) {
    return this.map[errorKey].render(errorKey, context);
  }
};

// ../temply/dist/template.js
var Template = class {
  template;
  constructor(template) {
    this.template = template;
  }
  render(context) {
    let result = this.template;
    const pattern = /{{(.*?)}}/g;
    let matches = pattern.exec(this.template);
    if (!matches)
      return result;
    while (matches) {
      const key = matches[1];
      if (!context)
        throw new Error(`Missing context when '${key}' is required`);
      const value = context[key];
      if (!value) {
        throw new Error(`Missing required key '${key}' in context`);
      }
      result = result.replace(matches[0], value.toString());
      matches = pattern.exec(this.template);
    }
    return result;
  }
};

// ../blamey/dist/blamey-error.js
var BlameyError = class extends Error {
  errorType;
  get type() {
    return this.errorType;
  }
  constructor(name, message, errorType) {
    super(message);
    this.errorType = errorType;
    this.name = name;
  }
};

// ../blamey/dist/error-type.js
var ErrorType;
(function(ErrorType2) {
  ErrorType2["USER_ERROR"] = "USER_ERROR";
  ErrorType2["SYSTEM_ERROR"] = "SYSTEM_ERROR";
})(ErrorType || (ErrorType = {}));

// ../blamey/dist/error-template.js
var ErrorTemplate = class {
  errorType;
  template;
  constructor(template, errorType = ErrorType.SYSTEM_ERROR) {
    this.errorType = errorType;
    this.template = new Template(template);
  }
  render(name, context) {
    const err = new BlameyError(name, this.template.render(context), this.errorType);
    return err;
  }
};

// ../commandy/dist/errors.js
var errors = new ErrorContainer({
  INVALID_ARGUMENTS: new ErrorTemplate("Invalid number of arguments.", ErrorType.USER_ERROR),
  INVALID_OPTION: new ErrorTemplate("Value '{{value}}' is not a valid option. Available options are: {{options}}.", ErrorType.USER_ERROR),
  INVALID_SUBCOMMAND: new ErrorTemplate("'{{cmdName}}' is not a valid subcommand.", ErrorType.USER_ERROR),
  NO_SUBCOMMAND: new ErrorTemplate("No subcommand selected.\n Available options are: {{subcommands}}", ErrorType.USER_ERROR),
  INVALID_COMMAND: new ErrorTemplate("Cannot have a handler function AND subcommands: {{cmdName}}")
});

// ../commandy/dist/argument.js
var Argument = class {
  _name;
  get name() {
    return this._name;
  }
  options;
  assertValidOption(value) {
    if (this.options.length > 0) {
      errors.assert(this.options.includes(value)).orThrow("INVALID_OPTION", {
        value,
        options: this.options.join(", ")
      });
    }
  }
  constructor(opts) {
    this._name = opts.name;
    this.options = opts.options ? opts.options : [];
  }
  parse(value) {
    this.assertValidOption(value);
    return value;
  }
};

// ../commandy/dist/flag.js
var Flag = class {
  name;
  aliases;
  type;
  constructor(opts) {
    this.name = opts.name;
    this.aliases = opts.aliases ?? [];
    this.type = opts.type ?? "simple";
  }
  parse(arg) {
    if (this.type == "simple") {
      return true;
    } else {
      return arg.split("=")[1];
    }
  }
  matches(arg) {
    for (const alias of this.aliases.concat([this.name])) {
      if (alias.length == 1) {
        if (this.matchesSingleLetterAlias(arg, alias)) {
          return true;
        }
      } else {
        if (this.matchesMultiLetterAlias(arg, alias)) {
          return true;
        }
      }
    }
    return false;
  }
  matchesMultiLetterAlias(arg, alias) {
    if (this.type == "simple") {
      return arg == `--${alias}`;
    } else {
      return arg.startsWith(`--${alias}=`);
    }
  }
  matchesSingleLetterAlias(arg, alias) {
    if (this.type == "simple") {
      return arg == `-${alias}`;
    } else {
      return arg.startsWith(`-${alias}=`);
    }
  }
};

// ../commandy/dist/utils/is-flag.js
function isFlag(arg) {
  return arg.startsWith("-");
}

// ../commandy/dist/utils/parse-flags-upto-positional.js
function parseFlagsUptoPositional(argv, flags) {
  const parsedFlags = {};
  if (flags.length > 0) {
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      if (isFlag(arg)) {
        for (const flag of flags) {
          if (flag.matches(arg)) {
            parsedFlags[flag.name] = flag.parse(arg);
            break;
          }
        }
      } else {
        return [argv.slice(i), parsedFlags];
      }
    }
    return [[], parsedFlags];
  } else {
    return [argv, {}];
  }
}

// ../commandy/dist/utils/parse-all-flags.js
function parseAllFlags(argv, flags) {
  const argsWithoutFlags = [];
  const parsedFlags = {};
  if (flags.length > 0) {
    for (const arg of argv) {
      if (isFlag(arg)) {
        for (const flag of flags) {
          if (flag.matches(arg)) {
            parsedFlags[flag.name] = flag.parse(arg);
            break;
          }
        }
      } else {
        argsWithoutFlags.push(arg);
      }
    }
    return [argsWithoutFlags, parsedFlags];
  } else {
    return [argv, {}];
  }
}

// ../commandy/dist/command.js
var Command = class {
  name;
  handler = null;
  positionalArguments = [];
  flags = [];
  subcommands = {};
  passExtraArgs = false;
  constructor(opts) {
    this.name = opts.name;
    this.passExtraArgs = opts.passExtraArgs ?? false;
    this.flags = opts.flags?.map((flagOptions) => new Flag(flagOptions)) ?? [];
    if ("handler" in opts) {
      this.parseLeafCommand(opts);
    } else {
      this.parseTopCommand(opts);
    }
  }
  run(argv, topCommandFlags = {}) {
    if (this.handler) {
      const [argsWithoutFlags, parsedFlags] = parseAllFlags(argv, this.flags);
      const parsedArgs = this.parsePositionalArgs(argsWithoutFlags);
      this.handler(Object.assign(topCommandFlags, parsedArgs, parsedFlags));
    } else {
      const [argsWithoutFlags, parsedFlags] = parseFlagsUptoPositional(argv, this.flags);
      const cmd = this.parseSubCommand(argsWithoutFlags);
      cmd.run(argsWithoutFlags.slice(1), Object.assign(topCommandFlags, parsedFlags));
    }
  }
  parseSubCommand(argv) {
    errors.assert(argv[0]).orThrow("NO_SUBCOMMAND", {
      subcommands: Object.keys(this.subcommands)
    });
    const cmd = this.subcommands[argv[0]];
    errors.assert(cmd).orThrow("INVALID_SUBCOMMAND", {
      cmdName: argv[0]
    });
    return cmd;
  }
  parsePositionalArgs(argv) {
    const parsedArgs = {};
    errors.assert(argv.length >= this.positionalArguments.length && (argv.length === this.positionalArguments.length || this.passExtraArgs)).orThrow("INVALID_ARGUMENTS");
    this.positionalArguments.forEach((arg, i) => {
      parsedArgs[arg.name] = arg.parse(argv[i]);
    });
    if (this.passExtraArgs) {
      parsedArgs.extraArgs = argv.slice(this.positionalArguments.length);
    }
    return parsedArgs;
  }
  parseLeafCommand(opts) {
    this.handler = opts.handler;
    this.positionalArguments = opts.args ? opts.args.map((opts2) => new Argument(opts2)) : [];
    errors.assert(!("commands" in opts)).orThrow("INVALID_COMMAND", {
      cmdName: opts.name
    });
  }
  parseTopCommand(opts) {
    for (const cmdOpt of opts.commands) {
      this.subcommands[cmdOpt.name] = new Command(cmdOpt);
    }
  }
};

// ../commandy/dist/program.js
var Program = class {
  commands = {};
  loggerFn;
  debugMode;
  name;
  constructor(opts) {
    opts.commands.forEach((cmdOpts) => this.addCommand(cmdOpts));
    this.loggerFn = opts.logger || console.log.bind(console);
    this.debugMode = opts.debugMode ?? false;
    this.name = opts.name;
  }
  addCommand(options) {
    this.commands[options.name] = new Command(options);
    return this;
  }
  run(argv) {
    if (this.debugMode) {
      let msg = `Called with args:`;
      msg += "\n";
      argv.forEach((arg, i) => {
        msg += `[${i}] "${arg}"
`;
      });
      this.loggerFn(msg);
    }
    try {
      let parsedArgv = this.parseArgs(argv);
      let command = this.getCommandOrThrow(parsedArgv[0]);
      command.run(parsedArgv.slice(1));
    } catch (err) {
      this.loggerFn(err.message);
    }
  }
  parseArgs(args) {
    if (basename(args[0]) == "node") {
      return args.slice(2);
    }
    if (args[0] == this.name) {
      return args.slice(1);
    }
    return args;
  }
  getCommandOrThrow(cmdName) {
    let cmd = this.commands[cmdName];
    if (!cmd)
      throw new Error(`Unknown command '${cmdName}'`);
    return cmd;
  }
};

// ../commandy/dist/create-cli.js
function createCLI(opts) {
  return new Program(opts);
}

// dist/errors.js
var errors2 = new ErrorContainer({
  INVALID_TEMPLATE_TYPE: new ErrorTemplate("Invalid template type: {{type}}. Options are: {{validTypes}}", ErrorType.USER_ERROR)
});

// ../shelly/dist/shell.js
import { exec } from "node:child_process";
async function shell(command, opts = {}) {
  const pipeToStdout = opts.pipeToStdout ?? false;
  const streamToPipe = opts.streamToPipe ?? process.stdout;
  try {
    await (() => {
      return new Promise((resolve, reject) => {
        const parsedCommand = command.join(" ");
        const env = {
          ...process.env
        };
        if (pipeToStdout) {
          env.FORCE_COLOR = "1";
        }
        const child = exec(parsedCommand, {
          env
        }, (error, stdout, stderr) => {
          if (error) {
            reject(stderr);
          } else {
            resolve(stdout);
          }
        });
        if (pipeToStdout) {
          child.stdout?.pipe(streamToPipe);
          child.stderr?.pipe(streamToPipe);
        }
      });
    })();
  } catch {
  }
}
var $ = shell;

// ../filey/dist/errors.js
var ERRORS = {
  INVALID_RELATIVE_PATH: new ErrorTemplate("File paths must always be ABSOLUTE paths. Tried to use '{{path}}'"),
  MISSING_FILE: new ErrorTemplate("Requested file '{{path}}' does not exists"),
  INVALID_JSON: new ErrorTemplate("Requested file '{{path}}' doesn't contain valid JSON: \n{{err}}"),
  NOT_A_DIRECTORY: new ErrorTemplate("The path '{{path}}' is not a directory")
};
var Errors = new ErrorContainer(ERRORS);

// ../filey/dist/get-all-files.js
import { readdir } from "fs/promises";
import { join } from "path";

// ../filey/dist/is-directory.js
import { stat } from "fs/promises";
async function isDirectory(filePath) {
  return (await stat(filePath)).isDirectory();
}

// ../filey/dist/get-all-files.js
async function getAllFilesInDirectory(dirPath) {
  Errors.assert(await isDirectory(dirPath)).orThrow("NOT_A_DIRECTORY", {
    path: dirPath
  });
  const files = await readdir(dirPath);
  const result = [];
  for (const file of files) {
    const fullFilePath = join(dirPath, file);
    if (await isDirectory(fullFilePath)) {
      result.push(...(await getAllFilesInDirectory(fullFilePath)).map((f) => join(file, f)));
    } else {
      result.push(file);
    }
  }
  return result;
}

// dist/utils/package-template.js
import { basename as basename2, join as join2 } from "path";
var PackageTemplate = class {
  templateDir;
  templatePackageName;
  constructor(templateDir) {
    this.templateDir = templateDir;
    this.templatePackageName = basename2(templateDir);
  }
  async applyTo(packageName, packagesDir = "packages") {
    const packageWorkspaceDir = join2(packagesDir, packageName);
    await $(["cp", "-r", `${this.templateDir}/*`, packageWorkspaceDir]);
    const filesInTemplate = await getAllFilesInDirectory(this.templateDir);
    for (const file of filesInTemplate) {
      await $([
        "sed -i",
        `s/${this.templatePackageName}/${packageName}/g`,
        join2(packageWorkspaceDir, file)
      ]);
    }
  }
};

// dist/utils/load-config.js
async function loadConfig() {
  return {
    TEMPLATES: {
      lib: new PackageTemplate("templates/lib-template")
    }
  };
}

// dist/utils/yarn.js
var YARN = {
  async addWorkspacePackage(packageName, packagesDir = "packages") {
    await $([`yarn`, `${packagesDir}/${packageName}`, `init`]);
  },
  async addPackages(packages) {
    await $(["yarn", "add", ...packages], { pipeToStdout: true });
  },
  async update() {
    await $([`yarn`, `install`]);
  },
  async run(cmd) {
    await $(["yarn", ...cmd], {
      pipeToStdout: true
    });
  },
  async workspacesRun(cmd) {
    const { TEMPLATES: TEMPLATES2 } = await loadConfig();
    await $([
      "yarn",
      "workspaces foreach",
      ...Object.keys(TEMPLATES2).map((k) => `--exclude @ulthar/${TEMPLATES2[k].templatePackageName}`),
      `--exclude @ulthar/framework`,
      "-tpv",
      "run",
      ...cmd
    ], {
      pipeToStdout: true
    });
  }
};

// dist/index.js
var { TEMPLATES } = await loadConfig();
createCLI({
  name: "cli",
  commands: [
    {
      name: "package",
      commands: [
        {
          name: "new",
          flags: [{ type: "value", name: "type", aliases: ["t"] }],
          args: [
            {
              name: "packageName"
            }
          ],
          handler: async ({ packageName, type }) => {
            type = type ?? "lib";
            const validTypes = Object.keys(TEMPLATES);
            errors2.assert(validTypes.includes(type)).orThrow("INVALID_TEMPLATE_TYPE", {
              type,
              validTypes
            });
            await YARN.addWorkspacePackage(packageName);
            await TEMPLATES[type].applyTo(packageName);
            await YARN.update();
          }
        }
      ]
    },
    {
      name: "template",
      commands: [
        {
          name: "new",
          args: [
            {
              name: "packageName"
            }
          ],
          handler: async ({ packageName }) => {
            await YARN.addWorkspacePackage(packageName, "templates");
            await TEMPLATES["lib"].applyTo(packageName, "templates");
            await YARN.update();
          }
        }
      ]
    },
    {
      name: "build",
      passExtraArgs: true,
      handler: async ({ extraArgs }) => {
        await YARN.workspacesRun(["build", ...extraArgs]);
      }
    },
    {
      name: "test",
      passExtraArgs: true,
      handler: async ({ extraArgs }) => {
        await YARN.run(["jest", "--verbose", ...extraArgs]);
      }
    }
  ]
}).run(process.argv);
