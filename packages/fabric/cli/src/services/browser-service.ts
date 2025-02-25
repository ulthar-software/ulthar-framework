import { TaggedError, type Effect, type UnexpectedError } from "@fabric/core";

export interface ViewportOpts {
  width: number;
  height: number;
  deviceScaleFactor: number;
}

export interface BrowserService {
  goTo(url: string): Effect<void, UnexpectedError>;
  captureScreenshot(
    outputPath: string,
    viewport: ViewportOpts,
  ): Effect<void, UnexpectedError>;
  login(
    username: string,
    password: string,
  ): Effect<void, UnexpectedError | LoginFormNotFoundError | LoginFailedError>;
  getCurrentPageContent(): Effect<string, UnexpectedError>;
}

export class LoginFormNotFoundError extends TaggedError<"LoginFormNotFoundError"> {
  constructor() {
    super("LoginFormNotFoundError");
  }
}

export class LoginFailedError extends TaggedError<"LoginFailedError"> {
  constructor() {
    super("LoginFailedError");
  }
}
