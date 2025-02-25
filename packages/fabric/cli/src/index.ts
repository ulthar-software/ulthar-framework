import { argv } from "node:process";
import commands from "./commands/commands.js";
import { BrowserServiceImplementation } from "./services/implementations/browser-service.js";
import { FileServiceImplementation } from "./services/implementations/file-service.js";

// console.log(argv);

const commandName = argv[2];

if (!commandName) {
  console.error("No command specified");
  process.exit(1);
}

const command = commands.find((c) => c.name === commandName);

if (!command) {
  console.error(`Unknown command: ${commandName}`);
  process.exit(1);
}

const effect = command.command(argv[3]).catchAll((error) => {
  console.error(error.message);
  console.log(command.help);
  process.exit(1);
});

const browser = new BrowserServiceImplementation();

await browser.init().runOrThrow();

await effect.runOrThrow({
  browserService: browser,
  fileService: new FileServiceImplementation(),
});

await browser.dispose().runOrThrow();
