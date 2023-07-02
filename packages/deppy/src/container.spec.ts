import { Container } from "./container";

const container = new Container();

describe("Dependency Injection Utils", () => {
    beforeEach(() => {
        container.clear();
    });

    const dependencyKey = "test-dependency";

    it("should register a dependency", () => {
        container.register(dependencyKey, { foo: "bar" });
        expect(container.resolve(dependencyKey)).toEqual({
            foo: "bar",
        });
    });

    it("should fail to resolve a dependency that was not registered", () => {
        expect(() => container.resolve(dependencyKey)).toThrow(
            `Dependency with token ${dependencyKey} is not registered.`
        );
    });

    it("should resolve a dependency lazily", async () => {
        const lazyResolution = container.lazilyResolve(dependencyKey);
        const resolvedCallback = jest.fn();
        lazyResolution.subscribe(resolvedCallback);
        const dependency = { foo: "bar" };
        container.register(dependencyKey, dependency);
        await milliseconds(1);
        expect(lazyResolution.current).toBe(dependency);
        expect(resolvedCallback).toHaveBeenCalledWith(dependency);
    });

    it("should resolve a dependency lazily if the dependency has already been defined", async () => {
        const resolvedCallback = jest.fn();
        const dependency = { foo: "bar" };
        container.register(dependencyKey, dependency);
        const lazyResolution = container.lazilyResolve(dependencyKey);
        lazyResolution.subscribe(resolvedCallback);
        await milliseconds(1);
        expect(lazyResolution.current).toBe(dependency);
        expect(resolvedCallback).toHaveBeenCalledWith(dependency);
    });

    it("should register all dependencies given multiple dependencies", async () => {
        const resolvedCallback = jest.fn();

        const dep1 = { foo: "bar" };
        const dep2 = { banana: "manzana" };

        const dependencyMapResolvers = {
            dep1: () => dep1,
            dep2: async () => dep2,
        };
        container.registerAll(dependencyMapResolvers);

        const lazyResolution = container.lazilyResolve("dep2");
        lazyResolution.subscribe(resolvedCallback);
        await milliseconds(1);
        expect(lazyResolution.current).toBe(dep2);
        expect(resolvedCallback).toHaveBeenCalledWith(dep2);

        const resolved = container.resolve("dep1");
        expect(resolved).toBe(dep1);
    });

    it("should get a plain dependency map", () => {
        const dep1 = { foo: "bar" };
        const dep2 = { banana: "manzana" };

        container.register("dep1", dep1);
        container.register("dep2", dep2);

        expect(container.getPlainDependencyMap()).toEqual({
            dep1,
            dep2,
        });
    });
});
