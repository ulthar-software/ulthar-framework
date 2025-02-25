import { Effect, Result, UnexpectedError } from "@fabric/core";
import fs from "node:fs/promises";
import path from "node:path";
import type { Page } from "puppeteer";
import puppeteer from "puppeteer";
import type { BrowserService, ViewportOpts } from "../browser-service.js";
import {
  LoginFailedError,
  LoginFormNotFoundError,
} from "../browser-service.js";

export class BrowserServiceImplementation implements BrowserService {
  private browser: puppeteer.Browser | undefined;
  private currentPage: puppeteer.Page | undefined;

  init(): Effect<void> {
    return Effect.from(async () => {
      if (this.currentPage) return;
      const browser = await puppeteer.launch({
        acceptInsecureCerts: true,
      });
      this.browser = browser;
      this.currentPage = await browser.newPage();
    });
  }

  private getCurrentPage(): Effect<Page, UnexpectedError> {
    return Effect.from(() => this.currentPage).assertValueOrFailWith(
      () => new UnexpectedError("Browser not initialized"),
    );
  }

  goTo(url: string): Effect<void, UnexpectedError> {
    return this.getCurrentPage().map(async (currentPage) => {
      await currentPage.goto(url);
    });
  }

  captureScreenshot(
    outputPath: string,
    viewport: ViewportOpts,
  ): Effect<void, UnexpectedError> {
    return this.getCurrentPage().map(async (currentPage) => {
      await currentPage.setViewport(viewport);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await currentPage.screenshot({ path: outputPath, type: "jpeg" });
    });
  }

  currentUrl(): Effect<string, UnexpectedError> {
    return this.getCurrentPage().map((currentPage) => currentPage.url());
  }

  dispose(): Effect<void> {
    return Effect.from(async () => {
      if (!this.browser) return;
      await this.browser.close();
      this.browser = undefined;
      this.currentPage = undefined;
    });
  }

  login(
    username: string,
    password: string,
  ): Effect<void, UnexpectedError | LoginFormNotFoundError | LoginFailedError> {
    return this.getCurrentPage().mapResult(
      async (
        currentPage,
      ): Promise<Result<void, LoginFormNotFoundError | LoginFailedError>> => {
        const usernameInputElement = await currentPage.$(
          "input[name=username],input[name=email]",
        );
        const passwordInputElement = await currentPage.$(
          "input[name=password]",
        );
        const loginButton = await currentPage.$("button[type=submit]");
        if (usernameInputElement && passwordInputElement && loginButton) {
          await usernameInputElement.type(username);
          await passwordInputElement.type(password);
          await Promise.all([
            currentPage.waitForNavigation({
              timeout: 2000,
            }),
            loginButton.click(),
          ]);
          const url = currentPage.url();
          if (url.includes("login")) {
            return Result.failWith(new LoginFailedError());
          } else {
            return Result.ok();
          }
        } else {
          return Result.failWith(new LoginFormNotFoundError());
        }
      },
    );
  }

  getCurrentPageContent(): Effect<string, UnexpectedError> {
    return this.getCurrentPage().map(async (currentPage) => {
      const content = await currentPage.content();
      return content;
    });
  }
}
