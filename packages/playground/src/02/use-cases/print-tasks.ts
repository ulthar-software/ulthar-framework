import { Effect, Result } from "@ulthar/immuty";
import { Task } from "../model.js";

type ConsoleDependency = {
    console: Console;
};

export const printTasks = (tasks: Task[]) => {
    return Effect.from(
        Result.wrap(({ console }: ConsoleDependency) => {
            console.log("Tasks:");
            tasks.forEach((task) => {
                console.log(`- ${task.title}`);
            });
        })
    );
};
