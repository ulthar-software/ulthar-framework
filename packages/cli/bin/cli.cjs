#!/usr/bin/env node
"use strict";

// ../commandy/dist/program.js
var import_path = require("path");

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
  INVALID_ARGUMENTS: new ErrorTemplate("Invalid number of arguments", ErrorType.USER_ERROR),
  INVALID_OPTION: new ErrorTemplate("Value '{{value}}' is not an option: {{options}}", ErrorType.USER_ERROR)
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
  handler;
  argOptions;
  constructor(opts) {
    this._name = opts.name;
    this.handler = opts.handler;
    this.argOptions = opts.args ? opts.args.map((opts2) => new Argument(opts2)) : [];
  }
  run(argv) {
    const args = {};
    errors.assert(argv.length === this.argOptions.length).orThrow("INVALID_ARGUMENTS");
    this.argOptions.forEach((arg, i) => {
      args[arg.name] = arg.parse(argv[i]);
    });
    this.handler(args);
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
    if ((0, import_path.basename)(args[0]) == "node") {
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
var import_node_child_process = require("node:child_process");
function shell(command, opts = {}) {
  const pipeToStdout = opts.pipeToStdout ?? false;
  const streamToPipe = opts.streamToPipe ?? process.stdout;
  return new Promise((resolve, reject) => {
    const parsedCommand = command.join(" ");
    const child = (0, import_node_child_process.exec)(parsedCommand, {
      env: {
        ...process.env,
        FORCE_COLOR: "1"
      }
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

// dist/index.js
createCLI({
  name: "cli",
  commands: [
    {
      name: "new",
      args: [
        {
          name: "packageName"
        }
      ],
      handler: async ({ packageName }) => {
        await $([`yarn`, `packages/${packageName}`, `init`]);
        await $([
          "cp",
          "-r",
          "packages/package-template/*",
          `packages/${packageName}`
        ]);
        await $([
          "sed -i",
          `s/package-template/${packageName}/g`,
          `packages/${packageName}/README.md`
        ]);
        await $([
          "sed -i",
          `s/package-template/${packageName}/g`,
          `packages/${packageName}/package.json`
        ]);
        await $([`yarn`, `install`]);
      }
    },
    {
      name: "build",
      handler: async () => {
        await $([
          "yarn",
          "workspaces foreach",
          `--exclude @ulthar/package-template`,
          "-tpv",
          "run",
          "build"
        ], {
          pipeToStdout: true
        });
      }
    },
    {
      name: "test",
      handler: async () => {
        await $(["yarn", "jest", "--verbose", "--colors"], {
          pipeToStdout: true
        });
      }
    }
  ]
}).run(process.argv);
