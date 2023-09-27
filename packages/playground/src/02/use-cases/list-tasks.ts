import { Effect, Result } from "@ulthar/immuty";
import { Model } from "../model.js";
import { printTasks } from "./print-tasks.js";

export function listTasks() {
    return Effect.from(
        Result.wrap(({ tasks }: Model) => {
            return tasks;
        })
    ).flatMap(printTasks);
}
