import { UUID } from "./schema-types.js";

export const SchemaTypeModifiers = {
    PRIMARY_KEY<T extends UUID>(t: T): T & PRIMARY_KEY {
        return {
            ...t,
            primaryKey: true,
        };
    },
    INDEXED<T extends INDEXABLE>(t: T): T & INDEXED {
        return {
            ...t,
            indexed: true,
        };
    },
    NULLABLE<T extends MAYBE_NULLABLE>(t: T): T & NULLABLE {
        return {
            ...t,
            nullable: true,
        };
    },
} as const;

export type PRIMARY_KEY = {
    primaryKey: true;
};

export type INDEXED = {
    indexed: true;
};

export type INDEXABLE = {
    indexed?: boolean;
};

export type MAYBE_NULLABLE = {
    nullable?: boolean;
};

export type NULLABLE = {
    nullable: true;
};
