import { Maybe, Immutable } from "@ulthar/typey";
import { v4 as uuid } from "uuid";
import { IEntity } from "./entity";
import { EntityReference } from "./entity-reference";
import { IEntityRepository } from "./entity-repository";

describe("Entity Reference", () => {
    const repoName = "SOME_REPOSITORY";
    const entityId = uuid();
    const repo = {
        findById: async function (
            id: string
        ): Promise<Maybe<Immutable<IEntity>>> {
            if (id == entityId) {
                return {
                    id: entityId,
                } as Immutable<IEntity>;
            }
            return undefined;
        },
    } as IEntityRepository<IEntity>;

    it("should define a findable reference", async () => {
        const ref = EntityReference.FromId(repoName, entityId);
        expect(ref.repository).toBe(repoName);
        expect(await ref.getEntity(repo)).toEqual({
            id: entityId,
        });
    });

    it("should define an empty reference", async () => {
        const ref = EntityReference.Empty(repoName);
        expect(await ref.getEntity(repo)).toBe(undefined);
    });

    it("should define a reference from an object", async () => {
        const ref = EntityReference.FromEntity(repoName, {
            id: entityId,
        });
        expect(await ref.getEntity(repo)).toEqual({
            id: entityId,
        });
    });

    it("should properly serialize references", () => {
        const ref = EntityReference.FromId(repoName, entityId);
        const serializedRef = JSON.stringify(ref);
        expect(serializedRef).toBe(
            `{"_type":"${EntityReference.TYPE}","repository":"${repoName}","id":"${entityId}"}`
        );

        const anotherRef = EntityReference.Empty(repoName);
        const emptySerializedRef = JSON.stringify(anotherRef);
        expect(emptySerializedRef).toBe(
            `{"_type":"${EntityReference.TYPE}","repository":"${repoName}"}`
        );
    });

    it("should properly deserialize references", async () => {
        const ref = EntityReference.FromId(repoName, entityId);
        const serializedRef = JSON.stringify(ref);
        const deserializedRef = EntityReference.FromJSON(
            JSON.parse(serializedRef)
        );
        expect(await deserializedRef.getEntity(repo)).toEqual({
            id: entityId,
        });

        const anotherRef = EntityReference.Empty(repoName);
        const emptySerializedRef = JSON.stringify(anotherRef);
        const emptyDeserializedRef = EntityReference.FromJSON(
            JSON.parse(emptySerializedRef)
        );
        expect(await emptyDeserializedRef.getEntity(repo)).toBe(undefined);
    });
});
