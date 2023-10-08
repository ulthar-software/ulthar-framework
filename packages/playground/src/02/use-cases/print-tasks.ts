import { Effect, Immutable } from "@ulthar/effecty";
import { Task } from "../model.js";

type ConsoleDependency = {
    console: Console;
};

export const printTasks = (tasks: Immutable<Task[]>) => {
    return Effect.from(({ console }: ConsoleDependency) => {
        console.log("Tasks:");
        tasks.forEach((task) => {
            console.log(`- ${task.title}`);
        });
    });
};
