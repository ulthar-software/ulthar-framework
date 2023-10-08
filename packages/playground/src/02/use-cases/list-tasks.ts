import { Effect } from "@ulthar/effecty";
import { Model } from "../model.js";
import { printTasks } from "./print-tasks.js";

export function listTasks() {
    return Effect.from(({ tasks }: Model) => {
        return tasks;
    }).flatMap(printTasks);
}
