import type {
  Infer,
  JSONParsingError,
  SchemaParsingError,
  UnexpectedError,
} from "@fabric/core";
import { Effect, Field, Model } from "@fabric/core";
import type {
  BrowserService,
  LoginFailedError,
  LoginFormNotFoundError,
  ViewportOpts,
} from "../services/browser-service.js";
import type { FileReadError, FileService } from "../services/file-service.js";

export interface ImageCaptureOpts {
  rootUrl: string;
  paths: string[];
  outputDir: string;
  sizes: ImageSizeOptions[];
}

export interface ImageSizeOptions extends ViewportOpts {
  name: string;
}

export default {
  name: "capture-images",
  description: "Capture images from a url",
  command: captureImages,
  help: `usage: fabric capture-images [config-file]
  Options:
    - config-file: Path to the configuration file.

  The configuration file should be a JSON file with the following structure:
  {
    "rootUrl": "https://example.com",
    "auth":{
      "username": "user",
      "password": "pass",
      "loginPath": "/login",
    },
    "paths": [
      {
        "name": "home",
        "path": "/"
      },
      (...)
    ],
    "outputDir": "output",
    "sizes": [
      {
        "name": "small",
        "width": 320,
        "height": 480,
        "deviceScaleFactor": 2
      },
      (...)
    ]
  }`,
} as const;

export interface Dependencies {
  fileService: FileService;
  browserService: BrowserService;
}

export const ConfigModel = new Model("capture-images-config", {
  rootUrl: Field.string(),
  auth: Field.embedded({
    subModel: {
      username: Field.string(),
      password: Field.string(),
      loginPath: Field.string(),
    },
    isOptional: true,
  }),
  paths: Field.objectArray({
    name: Field.string(),
    path: Field.string(),
  }),
  outputDir: Field.string(),
  sizes: Field.objectArray({
    name: Field.string(),
    width: Field.integer({ hasArbitraryPrecision: false }),
    height: Field.integer({ hasArbitraryPrecision: false }),
    deviceScaleFactor: Field.integer({ hasArbitraryPrecision: false }),
  }),
});

type Config = Infer<typeof ConfigModel>;

function captureImages(
  configPath: string,
): Effect<
  void,
  | UnexpectedError
  | FileReadError
  | JSONParsingError
  | SchemaParsingError<typeof ConfigModel>
  | LoginFailedError
  | LoginFormNotFoundError,
  Dependencies
> {
  return Effect.withDeps(({ fileService, browserService }: Dependencies) =>
    fileService
      .readJsonFile(ConfigModel, configPath)
      .flatMap((opts) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (opts.auth) {
          return Effect.seq(
            () =>
              browserService.goTo(
                `${opts.rootUrl}${opts.auth.loginPath as string}`,
              ),
            () =>
              browserService.login(
                opts.auth.username as string,
                opts.auth.password as string,
              ),
            () => Effect.ok(opts),
          );
        }
        return Effect.ok(opts);
      })
      .flatMap((opts) => captureAllScreenshots(browserService, opts))
      .flatMap((opts) => fileService.openExplorerIn(opts.outputDir)),
  );
}

function captureAllScreenshots(
  browserService: BrowserService,
  opts: Config,
): Effect<Config, UnexpectedError> {
  return Effect.allInSequence(() =>
    opts.paths.map((p) =>
      browserService
        .goTo(`${opts.rootUrl}${p.path}`)
        .flatMap(() => captureAllSizesOnLocation(browserService, opts, p.name)),
    ),
  ).map(() => opts);
}

function captureAllSizesOnLocation(
  browserService: BrowserService,
  opts: Config,
  pathName: string,
): Effect<void, UnexpectedError> {
  return Effect.allInSequence(() =>
    opts.sizes.map((size) =>
      browserService.captureScreenshot(
        `${opts.outputDir}/${size.name}/${pathName}.jpg`,
        {
          width: size.width,
          height: size.height,
          deviceScaleFactor: size.deviceScaleFactor,
        },
      ),
    ),
  ).discardValue();
}
