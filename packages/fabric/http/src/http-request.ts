/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IncomingHttpHeaders } from "node:http";

export interface HttpRequest<T = any> {
  headers: IncomingHttpHeaders;
  body: T;
}
