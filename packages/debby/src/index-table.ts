import { IndexType } from "./types/index-type.js";

export class IndexTable<T> {
    private records: Record<IndexType, T[]> = {};

    addEntity(value: IndexType, entity: T): void {
        if (!this.records[value]) {
            this.records[value] = [];
        }
        this.records[value]!.push(entity);
    }

    updateEntity(oldValue: IndexType, newValue: IndexType, entity: T) {
        this.records[oldValue]!.splice(
            this.records[oldValue]!.indexOf(entity),
            1
        );
        this.addEntity(newValue, entity);
    }

    getFirst(value: IndexType) {
        return this.records[value]?.[0] ?? null;
    }
}
