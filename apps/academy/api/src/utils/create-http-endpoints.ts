/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONExt, TaggedError, UnexpectedError } from "@fabric/core";
import type { UseCase } from "@ulthar/academy-domain";
import type { Express } from "express";
import type { BaseDependencies } from "../dependencies.js";
import { parseAccessToken } from "./parse-access-token.js";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function createHTTPEndpoints<TDeps extends BaseDependencies>(
  app: Express,
  deps: TDeps,
  useCases: readonly UseCase<string, any, any, any, any>[],
) {
  for (const useCase of useCases) {
    const endpointPath = `/${useCase.name}`;
    const method = useCase.type === "command" ? "post" : "get";
    app[method](endpointPath, async (req, res) => {
      try {
        const token = req.headers.authorization;
        const userAccess = await parseAccessToken(deps, token);
        if (userAccess?.isError()) {
          res.status(401);
          res
            .header("Content-Type", "application/json")
            .send(
              JSONExt.stringify(
                userAccess.unwrapErrorOrThrow(),
              ).unwrapOrThrow(),
            );
          return;
        }
        const result: any = await useCase
          .call(
            {
              ...deps,
              currentUser: userAccess?.unwrapOrThrow(),
            },
            {
              ...req.query,
              ...req.body,
            },
          )
          .runOrThrow();
        res
          .status(200)
          .header("Content-Type", "application/json")
          .send(JSONExt.stringify(result).unwrapOrThrow());
        return;
      } catch (error) {
        console.error(error);
        console.log(req.body, req.query);
        if (error instanceof TaggedError) {
          if (error instanceof UnexpectedError) {
            res.status(500);
          } else {
            res.status(400);
          }
          res
            .header("Content-Type", "application/json")
            .send(JSONExt.stringify(error).unwrapOrThrow());
          return;
        } else {
          res
            .status(500)
            .header("Content-Type", "application/json")
            .send(
              JSONExt.stringify(
                new UnexpectedError((error as Error).message),
              ).unwrapOrThrow(),
            );
          return;
        }
      }
    });
  }
}
