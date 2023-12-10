# @ulthar/effecty

## A delightfully type-safe Effect system for your daily functional programming needs

### What is `@ulthar/effecty`?

`effecty` is the heart and soul of the Ulthar Framework, the core package. All other packages in the framework depend on `effecty`. But, what does it do?

In functional programming we want to avoid **side effects** as much _as possible_, but we can't avoid them completely. We need to read from the environment, write to the environment, and generally interact with the outside world or else our programs would be useless... So, we need to control them and define them in a very clear way. Some languages provide this control natively, like Haskell, but in JavaScript we don't have that luxury. However Javascript is a very malleable language, and with the power of Typescript's type system we can get pretty close to something like that.

So, what if our side effects were actually immutable objects that we could pass around, compose with each other, execute, retry, repeat, schedule, cancel, and even fork to run in parallel? This is the core idea of `effecty`, inspired by libraries like `zio` in Scala

`effecty` is a library that allows you to do just that. Declare your effects -the things that make your program useful- in a type-safe way and then run them in a controlled environment.

'Technically', an `Effect` is an object wrapper around a possibly async computation that could run requiring certain dependencies of type `TDependencies`, return a value of type `TValue` and could possibly fail with an error of type `TError`.

## Remaining Features and Tasks

- Add Effect:orExit
- Add Resources features again
- Add PosixTime features again
- Add Scheduling features again
- Enable Husky again after all tests are passing
- Implement "RunningEffect" concept for parallel execution
- Implement Effect:fork
- Implement Effect:repeatWhile
- Implement Effect:loopWhileError
- Implement Effect:loopWhileResult
