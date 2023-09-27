import { Effect, Result } from "@ulthar/immuty";
import {
    DivisionByZeroError,
    OperatorNotSupportedError,
    ParameterIsNaNError,
} from "./errors.js";

export const operations = {
    "+": Result.wrap((a: number, b: number) => a + b),
    "-": Result.wrap((a: number, b: number) => a - b),
    "*": Result.wrap((a: number, b: number) => a * b),
    "/": Result.wrap((a: number, b: number) => {
        if (b === 0) return new DivisionByZeroError(a, b);
        return a / b;
    }),
} as const;

export const operators = Object.keys(operations) as (keyof typeof operations)[];
export type Operator = (typeof operators)[number];

type ArgvEnv = {
    argv: string[];
};

export const parseOpFromArgv = Result.wrap(({ argv }: ArgvEnv) => {
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
    .include(({ a, op, b }) =>
        operations[op](a, b).map((result) => ({ result }))
    )
    .tap(({ a, op, b, result }) => {
        console.log(`${a} ${op} ${b} = ${result}`);
    });

await program.run({
    argv: process.argv.slice(2),
});
