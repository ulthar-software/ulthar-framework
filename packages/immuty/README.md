# @ulthar/immuty

## A delightfully type-safe Effect system for your daily functional programming needs

### What is `@ulthar/immuty`?

`immuty` is the heart and soul of the Ulthar Framework, and it's also its main package. All other packages in the framework depend on `immuty`. But, what does it do?

In functional programming we want to avoid side effects as much as possible, but we can't avoid them completely. We need to read from the environment, write to the environment, and interact with the outside world, etc. or else our programs would be useless... So, we need to control them and declare them in a very clear way. Some languages provide this control natively, like Haskell, but in JavaScript we don't have that luxury. However Javascript is a very malleable language, and with the power of Typescript's type system we can get pretty close to something like that.

What if our side effects were actually immutable objects that we could pass around, compose with each other, execute, retry, repeat, schedule, cancel, and even fork to run in parallel? This is the core idea of `immuty`, inspired by libraries like `zio` in Scala

So, `immuty` is a library that allows you to declare your effects -the things that make your program useful- in a type-safe way and then run them in a controlled environment.

'Technically', an `Effect` is an object wrapper around an async function that could run requiring certain dependencies of type `TDependencies`, return a value of type `TValue` and could possibly fail with an error of type `TError`.

But let's see some code first:

```typescript
import { Effect, createTaggedError, Schedule, Backoff } from "@ulthar/immuty";

// This is the type of the dependencies that our effect will require
type Dependencies = {
    db: {
        get: (id: string) => Promise<string>;
        set: (id: string, value: string) => Promise<void>;
    };
};

// This are the errors that our effect could fail with
const NotFoundError = createTaggedError("NotFoundError", { id: string });
const ConnectionError = createTaggedError("ConnectionError");

// This is the type of the value that our effect will return
type Value = {
    id: string;
    value: string;
};

function get(id: string) {
    return Effect.fromResult(async (deps: Dependencies) => {
        try {
            const value = await deps.db.get(id);
            if (value === null) {
                return Result.error(NotFoundError({ id }));
            }
            return Result.ok({ id, value });
        } catch (err) {
            return Result.error(ConnectionError(err));
        }
    });
}

// This is how we create an effect
const effect = get("some-id");
//The type of result is inferred to be Effect<Dependencies,Value,NotFoundError|ConnectionError>

effect.retry(
    Schedule.backoff(Backoff.exponential(TimeSpan.ms(100)), {
        maxDelay: TimeSpan.seconds(1),
    })
);

const catchedEffect = effect.catchSome({
    NotFoundError: async (err) => ({ id: err.id, value: "default value" }),
});
//The type of catchedEffect is inferred to be Effect<Dependencies,Value>
//because we are handling the known error. This doesn't mean that the effect
// can never fail, but it cannot fail for a known reason which is really powerful

//or you can handle the errors in the effect itself
const foldedEffect = await effect.fold({
    ok: ({ id, value }) => `The value of ${id} is ${value}`,
    error: (err) => {
        switch (err._tag) {
            case "NotFoundError":
                return `The value of ${err.id} was not found`;
            default:
                return `An unexpected error occurred`;
        }
    },
});
//the type of foldedEffect iss also inferred to be Effect<Dependencies, Value, never>
//because we are handling all the possible errors

//Then you can run the effect
const result = await foldedEffect.run({ db: dbInstance });
//The type of the required dependency is inferred from
//the composition of the effects and their respective dependencies
//The type of result is correctly inferred to be Result<string, never>
```
