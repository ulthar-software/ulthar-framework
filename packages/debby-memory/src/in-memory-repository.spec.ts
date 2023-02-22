/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { randomUUID } from "crypto";
import { IEntity } from "@ulthar/debby";
import { Errors } from "./errors";
import { InMemoryRepository } from "./in-memory-repository";

describe("In-Memory Repository", () => {
    class TestEntity implements IEntity {
        id = "";
        name = "";
        someObject?: any;
    }

    it("should save an entity and get a saved entity", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: randomUUID,
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

    it("should mutate an entity and return a cloned updated object", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: randomUUID,
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

    it("should always return inmutable entities", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: randomUUID,
        });

        const originalEntity = await repo.create({
            name: "anyString",
            someObject: {
                bar: "foo",
            },
        });
        expect(() => {
            //@ts-ignore
            originalEntity.name = "anotherString";
        }).toThrow();

        const result = await repo.mutate(originalEntity.id, {
            name: "anotherString",
        });
        expect(() => {
            //@ts-ignore
            result.name = "yetAnotherString";
        }).toThrow();

        const found = await repo.findById(originalEntity.id);
        expect(() => {
            //@ts-ignore
            found!.name = "yetAnotherString";
        }).toThrow();
    });

    it("should return null if entity does not exists", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: randomUUID,
        });
        expect(await repo.findById("anyString")).toBeUndefined();
    });

    it("should fail to mutate an entity that does not exists", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: randomUUID,
        });
        await expect(async () => {
            await repo.mutate("anyString", {
                name: "anotherString",
            });
        }).rejects.toThrow(
            Errors.render("ENTITY_NOT_FOUND", { id: "anyString" })
        );
    });

    it("should create an entity given a partial", async () => {
        const repo = new InMemoryRepository(TestEntity, {
            uuidFactory: randomUUID,
        });
        const entity = await repo.create({
            name: "anyString",
        });

        expect(entity instanceof TestEntity).toBe(true);
        expect(entity.name).toBe("anyString");
        expect(entity.id).toEqual(expect.any(String));
    });

    it("should define a find interface", async () => {
        fail("test not implemented");
    });
});
