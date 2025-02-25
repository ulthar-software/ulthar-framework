import { describe, expect, it } from "@fabric/testing";
import { HttpResponse } from "./http-response.js";
import { startServer } from "./index.js";

describe("Server", () => {
  it("should start a web server, and respond to requests", async () => {
    const server = startServer({
      port: 3000,
      routes: [
        {
          method: "GET",
          path: "/",
          handler: () =>
            HttpResponse.okHtml(
              "<html><body><h1>Hello world!</h1></body></html>",
            ),
        },
        {
          method: "GET",
          path: "/other-thing",
          handler: () => HttpResponse.redirect("/"),
        },
      ],
    });

    try {
      const body = await fetch("http://localhost:3000").then((res) =>
        res.text(),
      );
      expect(body).toEqual(`<html><body><h1>Hello world!</h1></body></html>`);
    } finally {
      server.close();
    }
  });
});
