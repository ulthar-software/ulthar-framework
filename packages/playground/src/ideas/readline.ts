import { Effect, Result } from "@ulthar/effecty";
import { Interface } from "readline/promises";

type ReadlineDependency = {
    rl: Interface;
};

type ConsoleDependency = {
    console: Console;
};

export function askQuestion(message: string) {
    return Effect.from(
        Result.wrap(({ rl }: ReadlineDependency) => {
            return rl.question(message);
        })
    );
}

export function clearScreen() {
    return Effect.from(
        Result.wrap(({ console }: ConsoleDependency) => {
            console.clear();
        })
    );
}
