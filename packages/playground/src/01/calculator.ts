import { Effect, resultify } from "@ulthar/effecty";
import {
    DivisionByZeroError,
    OperatorNotSupportedError,
    ParameterIsNaNError,
} from "./errors.js";

export const operations = {
    "+": resultify((a: number, b: number) => a + b),
    "-": resultify((a: number, b: number) => a - b),
    "*": resultify((a: number, b: number) => a * b),
    "/": resultify((a: number, b: number): number | DivisionByZeroError => {
        if (b === 0) return new DivisionByZeroError(a, b);
        return a / b;
    }),
} as const;

export const operators = Object.keys(operations) as (keyof typeof operations)[];
export type Operator = (typeof operators)[number];

type ArgvEnv = {
    argv: string[];
};

export const parseOpFromArgv = resultify(({ argv }: ArgvEnv) => {
    const [a, op, b] = argv;

    const parsedA = Number.parseFloat(a);
    if (Number.isNaN(parsedA)) return new ParameterIsNaNError(a);

    const parsedB = Number.parseFloat(b);
    if (Number.isNaN(parsedB)) return new ParameterIsNaNError(b);

    if (!operators.includes(op as Operator)) {
        return new OperatorNotSupportedError(op);
    }

    return {
        a: parsedA,
        op: op as Operator,
        b: parsedB,
    };
});

const program = Effect.from(parseOpFromArgv)
    .map(({ a, op, b }) =>
        operations[op](a, b).map((result) => ({ a, op, b, result }))
    )
    .tap(({ a, op, b, result }) => {
        console.log(`${a} ${op} ${b} = ${result}`);
    });

await program.run({
    argv: process.argv.slice(2),
});
