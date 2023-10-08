import { Effect } from "@ulthar/effecty";
import { Interface } from "readline/promises";

type ReadlineDependency = {
    rl: Interface;
};

type ConsoleDependency = {
    console: Console;
};

export function askQuestion(message: string) {
    return Effect.from(({ rl }: ReadlineDependency) => {
        return rl.question(message);
    });
}

export function clearScreen() {
    return Effect.from(({ console }: ConsoleDependency) => {
        console.clear();
    });
}
