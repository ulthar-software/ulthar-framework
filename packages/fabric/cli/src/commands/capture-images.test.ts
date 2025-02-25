/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import { Effect } from "@fabric/core";
import { describe, expect, fnMock, it, partialMock } from "@fabric/testing";
import type { BrowserService } from "../services/browser-service.js";
import type { FileService } from "../services/file-service.js";
import captureImages from "./capture-images.js";

describe("captureMobileImages", () => {
  it("should capture images from a configuration", async () => {
    const browserService = partialMock<BrowserService>({
      goTo: fnMock(() => Effect.ok()),
      captureScreenshot: fnMock(() => Effect.ok()),
    });

    const fileService = partialMock<FileService>({
      openExplorerIn: fnMock(() => Effect.ok()),
      readJsonFile: fnMock(
        () =>
          Effect.ok({
            rootUrl: "https://example.com",
            paths: [
              { name: "home", path: "/" },
              { name: "about", path: "/about" },
              { name: "list", path: "/list/15/test" },
            ],
            outputDir: "output",
            sizes: [
              {
                name: "ios-1",
                width: 320,
                height: 640,
                deviceScaleFactor: 2,
              },
              {
                name: "ios-2",
                width: 460,
                height: 920,
                deviceScaleFactor: 3,
              },
            ],
          }) as any,
      ),
    });

    await captureImages.command("/path/to/config.json").runOrThrow({
      browserService,
      fileService,
    });

    expect(browserService.goTo).toHaveBeenCalledWith("https://example.com/");
    expect(browserService.goTo).toHaveBeenCalledWith(
      "https://example.com/about",
    );
    expect(browserService.captureScreenshot).toHaveBeenCalledWith(
      "output/ios-1/home.jpg",
      {
        width: 320,
        height: 640,
        deviceScaleFactor: 2,
      },
    );
    expect(browserService.captureScreenshot).toHaveBeenCalledWith(
      "output/ios-2/home.jpg",
      {
        width: 460,
        height: 920,
        deviceScaleFactor: 3,
      },
    );
    expect(browserService.captureScreenshot).toHaveBeenCalledWith(
      "output/ios-1/about.jpg",
      {
        width: 320,
        height: 640,
        deviceScaleFactor: 2,
      },
    );
    expect(browserService.captureScreenshot).toHaveBeenCalledWith(
      "output/ios-2/about.jpg",
      {
        width: 460,
        height: 920,
        deviceScaleFactor: 3,
      },
    );

    expect(fileService.openExplorerIn).toHaveBeenCalledWith("output");
  });
  it("should capture images from a configuration with auth settings", async () => {
    const browserService = partialMock<BrowserService>({
      goTo: fnMock(() => Effect.ok()),
      captureScreenshot: fnMock(() => Effect.ok()),
      login: fnMock(() => Effect.ok()),
    });

    const fileService = partialMock<FileService>({
      openExplorerIn: fnMock(() => Effect.ok()),
      readJsonFile: fnMock(
        () =>
          Effect.ok({
            rootUrl: "https://example.com",
            auth: {
              username: "user",
              password: "pass",
              loginPath: "/login",
            },
            paths: [
              { name: "home", path: "/" },
              { name: "about", path: "/about" },
              { name: "list", path: "/list/15/test" },
            ],
            outputDir: "output",
            sizes: [
              {
                name: "ios-1",
                width: 320,
                height: 640,
                deviceScaleFactor: 2,
              },
              {
                name: "ios-2",
                width: 460,
                height: 920,
                deviceScaleFactor: 3,
              },
            ],
          }) as any,
      ),
    });

    await captureImages.command("/path/to/config.json").runOrThrow({
      browserService,
      fileService,
    });

    expect(browserService.goTo).toHaveBeenCalledWith("https://example.com/");
    expect(browserService.goTo).toHaveBeenCalledWith(
      "https://example.com/about",
    );
    expect(browserService.goTo).toHaveBeenCalledWith(
      "https://example.com/list/15/test",
    );
    expect(browserService.goTo).toHaveBeenCalledWith(
      "https://example.com/login",
    );
    expect(browserService.login).toHaveBeenCalledWith("user", "pass");

    expect(browserService.captureScreenshot).toHaveBeenCalledWith(
      "output/ios-1/home.jpg",
      {
        width: 320,
        height: 640,
        deviceScaleFactor: 2,
      },
    );
    expect(browserService.captureScreenshot).toHaveBeenCalledWith(
      "output/ios-2/home.jpg",
      {
        width: 460,
        height: 920,
        deviceScaleFactor: 3,
      },
    );
    expect(browserService.captureScreenshot).toHaveBeenCalledWith(
      "output/ios-1/about.jpg",
      {
        width: 320,
        height: 640,
        deviceScaleFactor: 2,
      },
    );
    expect(browserService.captureScreenshot).toHaveBeenCalledWith(
      "output/ios-2/about.jpg",
      {
        width: 460,
        height: 920,
        deviceScaleFactor: 3,
      },
    );

    expect(fileService.openExplorerIn).toHaveBeenCalledWith("output");
  });
});
