import { v4 as uuidV4 } from "uuid";
import { IEntity } from "./entity";
import { Errors } from "./errors";
import { InMemoryRepository } from "./in-memory-repository";

describe("In-Memory Repository", () => {
    class TestEntity implements IEntity {
        id: string = Date.now().toString();
        name: string = "";
        someObject?: any;
    }

    it("should save an entity and get a saved entity", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: uuidV4,
        });

        const originalEntity = await repo.create({
            name: "Foo",
            someObject: {
                bar: "baz",
            },
        });

        const savedEntity = await repo.findById(originalEntity.id);

        expect(savedEntity).not.toBeNull();
        expect(savedEntity).not.toBe(originalEntity);
        expect(savedEntity!.id).toBe(originalEntity.id);
        expect(savedEntity!.name).toBe(originalEntity.name);
    });

    it("should mutate an entity", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: uuidV4,
        });
        const originalEntity = await repo.create({
            name: "Foo",
            someObject: {
                bar: "baz",
            },
        });

        await repo.mutate(originalEntity.id, {
            name: "thing",
            someObject: {
                biz: "faa",
            },
        });

        const savedEntity = await repo.findById(originalEntity.id);

        expect(savedEntity!.id).toBe(originalEntity.id);
        expect(savedEntity!.name).not.toEqual(originalEntity.name);
        expect(savedEntity!.someObject).not.toEqual(originalEntity.someObject);
    });

    it("should return null if entity does not exists", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: uuidV4,
        });
        expect(await repo.findById("banana")).toBeNull();
    });

    it("should fail to mutate an entity that does not exists", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: uuidV4,
        });
        await expect(async () => {
            await repo.mutate("banana", {
                name: "thing",
            });
        }).rejects.toThrow(Errors.render("ENTITY_NOT_FOUND", { id: "banana" }));
    });

    it("should create an entity given a partial", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: uuidV4,
        });
        const entity = await repo.create({
            name: "thing",
        });

        expect(entity instanceof TestEntity).toBe(true);
        expect(entity.name).toBe("thing");
        expect(entity.id).toEqual(expect.any(String));
    });

    it("should define indexable properties and do simple searches on them", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: uuidV4,
            indexes: ["name"],
        });
        const originalEntity = await repo.create({
            name: "bar",
        });
        const foundEntity = await repo.findOneByIndex("name", "bar");

        expect(foundEntity).not.toBeNull();
        expect(foundEntity).toEqual(originalEntity);

        //Entities found by index remain inmutable.
        foundEntity!.name = "baz";
        const newFoundEntity = await repo.findOneByIndex("name", "bar");
        expect(newFoundEntity!.name).not.toBe(foundEntity!.name);
    });

    it("should fail querying for a not defined index", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: uuidV4,
        });
        await repo.create({
            name: "bar",
        });
        await expect(async () => {
            const foundEntity = await repo.findOneByIndex("name", "bar");
        }).rejects.toThrow(Errors.render("INDEX_NOT_DEFINED"));
    });

    // it("should define a find interface", async () => {
    //     const repo = new InMemoryRepository(TestEntity);
    //     const entity = await repo.find({
    //         name: "banana",
    //     });
    // });
});
