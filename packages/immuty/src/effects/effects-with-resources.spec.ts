import { Result, UnexpectedTaggedError } from "../index.js";
import { Resource } from "../resources/resource.js";
import { Effect } from "./effect.js";

describe("Effects with resources", () => {
    test("given a resource, create an effect that will obtain the resource then close it after it is used", async () => {
        const TestResource = {
            doSomething: jest.fn(),
        };
        type TestResource = typeof TestResource;

        const resourceDef = {
            onAcquire: jest.fn(async () => {
                return Result.ok(TestResource);
            }),
            onRelease: jest.fn(),
        };

        const resourceWrapper = new Resource(resourceDef);

        const effectWithResource = Effect.withResource(
            resourceWrapper,
            (resource) => Effect.from(Result.wrap(() => resource.doSomething()))
        );

        await effectWithResource.run();

        expect(resourceDef.onAcquire).toHaveBeenCalledTimes(1);
        expect(TestResource.doSomething).toHaveBeenCalledTimes(1);
        expect(resourceDef.onRelease).toHaveBeenCalledTimes(1);
    });

    test("given a resource that fails its creation, create an effect that will fail with the same error", async () => {
        const testResource = {
            doSomething: jest.fn(),
        };
        type TestResource = typeof testResource;

        const resourceDef = {
            onAcquire: jest.fn(
                async (): Promise<Result<TestResource, never>> => {
                    return Result.error(
                        new UnexpectedTaggedError(new Error()) as never
                    );
                }
            ),
            onRelease: jest.fn(),
        };

        const resourceWrapper = new Resource(resourceDef);

        const effectWithResource = Effect.withResource(
            resourceWrapper,
            (resource) => Effect.from(Result.wrap(() => resource.doSomething()))
        );

        const result = await effectWithResource.run();

        if (result.isOk()) {
            throw new Error("Expected error");
        }

        expect(resourceDef.onAcquire).toHaveBeenCalledTimes(1);
        expect(resourceDef.onRelease).toHaveBeenCalledTimes(0); // Resource was never acquired
        expect(result.unwrapError()).toEqual(
            new UnexpectedTaggedError(new Error())
        );
    });

    test("given a resource, and effect that fails, the resource is still released", async () => {
        const TestResource = {
            doSomething: jest.fn(),
        };
        type TestResource = typeof TestResource;

        const resourceDef = {
            onAcquire: jest.fn(async () => {
                return Result.ok(TestResource);
            }),
            onRelease: jest.fn(),
        };

        const resourceWrapper = new Resource(resourceDef);

        const effectWithResource = Effect.withResource(
            resourceWrapper,
            (resource) =>
                Effect.from(
                    Result.wrap(() => {
                        throw new Error("Something went wrong");
                    })
                )
        );

        const result = await effectWithResource.run();

        if (result.isOk()) {
            throw new Error("Expected error");
        }

        expect(resourceDef.onAcquire).toHaveBeenCalledTimes(1);
        expect(resourceDef.onRelease).toHaveBeenCalledTimes(1);
    });
});
