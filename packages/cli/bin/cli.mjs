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

// ../commandy/dist/command.js
var Command = class {
  _name;
  handler = null;
  argOptions = [];
  subcommands = {};
  constructor(opts) {
    this._name = opts.name;
    if ("handler" in opts) {
      this.handler = opts.handler;
      this.argOptions = opts.args ? opts.args.map((opts2) => new Argument(opts2)) : [];
      errors.assert(!("commands" in opts)).orThrow("INVALID_COMMAND", {
        cmdName: opts.name
      });
    } else {
      for (const cmdOpt of opts.commands) {
        this.subcommands[cmdOpt.name] = new Command(cmdOpt);
      }
    }
  }
  run(argv) {
    if (this.handler) {
      const args = {};
      errors.assert(argv.length === this.argOptions.length).orThrow("INVALID_ARGUMENTS");
      this.argOptions.forEach((arg, i) => {
        args[arg.name] = arg.parse(argv[i]);
      });
      this.handler(args);
    } else {
      errors.assert(argv[0]).orThrow("NO_SUBCOMMAND", {
        subcommands: Object.keys(this.subcommands)
      });
      const cmd = this.subcommands[argv[0]];
      errors.assert(cmd).orThrow("INVALID_SUBCOMMAND", {
        cmdName: argv[0]
      });
      cmd.run(argv.slice(1));
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

// ../shelly/dist/shell.js
import { exec } from "node:child_process";
function shell(command, opts = {}) {
  const pipeToStdout = opts.pipeToStdout ?? false;
  const streamToPipe = opts.streamToPipe ?? process.stdout;
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
  async applyTo(packageName) {
    const packageWorkspaceDir = join2("packages", packageName);
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
      lib: new PackageTemplate("packages/package-template")
    }
  };
}

// dist/utils/yarn.js
var YARN = {
  async addWorkspacePackage(packageName) {
    await $([`yarn`, `packages/${packageName}`, `init`]);
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
    await $([
      "yarn",
      "workspaces foreach",
      `--exclude @ulthar/package-template`,
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
          args: [
            {
              name: "packageName"
            }
          ],
          handler: async ({ packageName }) => {
            await YARN.addWorkspacePackage(packageName);
            await TEMPLATES["lib"].applyTo(packageName);
            await YARN.update();
          }
        }
      ]
    },
    {
      name: "build",
      handler: async () => {
        await YARN.workspacesRun(["build"]);
      }
    },
    {
      name: "test",
      handler: async () => {
        await YARN.run(["jest", "--verbose"]);
      }
    }
  ]
}).run(process.argv);
