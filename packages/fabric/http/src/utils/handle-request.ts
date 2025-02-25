import type { IncomingMessage, ServerResponse } from "node:http";
import { HttpResponse } from "../http-response.js";
import type { Handler } from "../http-route.js";
import { parseBody } from "./parse-body.js";

export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  routeHandler: Handler,
): Promise<void> {
  const result = await parseBody(req)
    .flatMap((parsedBody) =>
      routeHandler({
        headers: req.headers,
        body: parsedBody,
      }),
    )
    .catchWithEffect((error) => HttpResponse.internalError(error))
    .run();

  if (result.isOk()) {
    const response = result.value;
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
  } else {
    res.writeHead(500);
    res.end();
  }
}
