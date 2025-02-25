import { Effect } from "@fabric/core";
import type { HttpRequest } from "@fabric/http";
import { HttpResponse, startServer } from "@fabric/http";
import { describe, expect, it } from "@fabric/testing";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { BrowserServiceImplementation } from "./browser-service.js";

describe("BrowserService", () => {
  it("should go to a URL", async () => {
    const browser = new BrowserServiceImplementation();

    await browser.init().runOrThrow();

    await browser.goTo("https://www.google.com/").runOrThrow();

    expect(await browser.currentUrl().runOrThrow()).toEqual(
      "https://www.google.com/",
    );

    await browser.dispose().runOrThrow();
  });

  it("should take a screenshot", async () => {
    const browser = new BrowserServiceImplementation();

    await browser.init().runOrThrow();

    await browser.goTo("https://www.google.com/").runOrThrow();

    const filePath = path.join(
      import.meta.dirname,
      "__tests__",
      "screenshot.jpg",
    );

    await browser
      .captureScreenshot(filePath, {
        width: 800,
        height: 600,
        deviceScaleFactor: 1,
      })
      .runOrThrow();

    const exists = fs.existsSync(filePath);
    expect(exists).toBe(true);

    const metadata = await sharp(filePath).metadata();
    expect(metadata.width).toBe(800);
    expect(metadata.height).toBe(600);

    fs.unlinkSync(filePath);

    await browser.dispose().runOrThrow();
  });

  it("should take a screenshot into a directory that doesn't exists", async () => {
    const browser = new BrowserServiceImplementation();

    await browser.init().runOrThrow();

    await browser.goTo("https://www.google.com/").runOrThrow();

    const filePath = path.join(
      import.meta.dirname,
      "__tests__",
      "some-other-directory",
      "screenshot.jpg",
    );

    await browser
      .captureScreenshot(filePath, {
        width: 800,
        height: 600,
        deviceScaleFactor: 1,
      })
      .runOrThrow();

    const exists = fs.existsSync(filePath);
    expect(exists).toBe(true);

    const metadata = await sharp(filePath).metadata();
    expect(metadata.width).toBe(800);
    expect(metadata.height).toBe(600);

    fs.unlinkSync(filePath);

    await browser.dispose().runOrThrow();
  });

  it("should login to a website", async () => {
    const browser = new BrowserServiceImplementation();

    const validUsername = "username";
    const validPassword = "password";

    const server = startServer({
      port: 3000,
      routes: [
        {
          method: "GET",
          path: "/login",
          handler: () =>
            HttpResponse.okHtml(`<html><body><form action="/login" method="post" enctype="application/x-www-form-urlencoded">
              <input type="text" name="username" />
              <input type="password" name="password" />
              <button type="submit">Login</button>
            </form></body></html>`),
        },
        {
          method: "GET",
          path: "/success",
          handler: () => {
            return HttpResponse.okHtml(
              "<html><head></head><body>Login successful</body></html>",
            );
          },
        },
        {
          method: "POST",
          path: "/login",
          handler: (
            req: HttpRequest<{ username: string; password: string }>,
          ) => {
            const { username, password } = req.body;
            if (username === validUsername && password === validPassword) {
              return HttpResponse.redirect("/success");
            } else {
              return HttpResponse.redirect("/login");
            }
          },
        },
      ],
    });

    try {
      const page = await Effect.seq(
        () => browser.init(),
        () => browser.goTo("http://localhost:3000/login"),
        () => browser.login(validUsername, validPassword),
        () => browser.getCurrentPageContent(),
      ).runOrThrow();

      expect(page).toEqual(
        "<html><head></head><body>Login successful</body></html>",
      );
    } finally {
      await browser.dispose().runOrThrow();
      server.close();
    }
  });
  it("should login to a website", async () => {
    const browser = new BrowserServiceImplementation();

    const validEmail = "username@email.com";
    const validPassword = "password";

    const server = startServer({
      port: 3000,
      routes: [
        {
          method: "GET",
          path: "/login",
          handler: () =>
            HttpResponse.okHtml(`<html><body><form action="/login" method="post" enctype="application/x-www-form-urlencoded">
              <input type="email" name="email" />
              <input type="password" name="password" />
              <button type="submit">Login</button>
            </form></body></html>`),
        },
        {
          method: "GET",
          path: "/success",
          handler: () => {
            return HttpResponse.okHtml(
              "<html><head></head><body>Login successful</body></html>",
            );
          },
        },
        {
          method: "POST",
          path: "/login",
          handler: (req: HttpRequest<{ email: string; password: string }>) => {
            const { email, password } = req.body;
            if (email === validEmail && password === validPassword) {
              return HttpResponse.redirect("/success");
            } else {
              return HttpResponse.redirect("/login");
            }
          },
        },
      ],
    });

    try {
      const page = await Effect.seq(
        () => browser.init(),
        () => browser.goTo("http://localhost:3000/login"),
        () => browser.login(validEmail, validPassword),
        () => browser.getCurrentPageContent(),
      ).runOrThrow();

      expect(page).toEqual(
        "<html><head></head><body>Login successful</body></html>",
      );
    } finally {
      await browser.dispose().runOrThrow();
      server.close();
    }
  });
});
