import { Effect, Result, TaggedError } from "@ulthar/immuty";
import { askQuestion } from "../ideas/readline.js";
import { listTasks } from "./use-cases/list-tasks.js";
import { Interface } from "readline/promises";

const menuInterface = `What would you like to do?
(a). Add a task | (r). Remove a task | (l). List tasks | (x). Exit`;

function showMenu() {
    return askQuestion(menuInterface);
}

const posibleActions = ["a", "r", "l", "e"] as const;
type Action = (typeof posibleActions)[number];

const parseAction = Result.wrap((op: string): Action | UnknownOperation => {
    if (posibleActions.includes(op as Action)) {
        return op as Action;
    }
    return new UnknownOperation(op);
});

const program = listTasks()
    .flatMap(showMenu)
    .map(parseAction)
    .whenCase({
        r: function (): Effect<unknown, unknown, TaggedError> {
            throw new Error("Function not implemented.");
        },
        a: function (): Effect<unknown, unknown, TaggedError> {
            throw new Error("Function not implemented.");
        },
        l: function (): Effect<unknown, unknown, TaggedError> {
            throw new Error("Function not implemented.");
        },
        e: function (): Effect<unknown, unknown, TaggedError> {
            throw new Error("Function not implemented.");
        },
    })
    .loopWhile(Result.wrap((value) => value !== "e"));

await program.run({
    console: console,
    rl: {
        // eslint-disable-next-line @typescript-eslint/require-await
        question: async (question: string) => {
            console.log(question);
            return "e";
        },
    } as Interface,
    tasks: [],
});

///TODO:
// - Implement Effect:whenCase()
// - Implement Effect:when():do()
// - Implement Effect:loopWhileError
// - Implement Effect:loopWhileResult

class UnknownOperation extends TaggedError<"UnknownOperation"> {
    constructor(op: string) {
        super("UnknownOperation", op);
    }
}
