import { Effect, KeyOf, TaggedError } from "@ulthar/immuty";
import { JoinResult } from "../types/join-result.js";
import { Document } from "../types/document.js";
import { IStore } from "../store.js";
import { JoinWrapper, SelectQueryWrapper } from "../types/select-query.js";

export class JoinEffect<
    TSchemaMap extends Record<string, Document>,
    QueryErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    A extends JoinResult,
    B extends JoinResult,
> {
    constructor(
        private store: IStore<
            TSchemaMap,
            QueryErrors,
            TaggedError,
            ConnectionErrors
        >,
        private query: SelectQueryWrapper<TSchemaMap>
    ) {}

    selectAll(): Effect<void, (A & B)[], QueryErrors | ConnectionErrors> {
        return this.store.selectAllWithJoins<A, B>(this.query);
    }

    leftJoin<
        CName extends KeyOf<TSchemaMap>,
        CSchema extends TSchemaMap[CName],
        CAlias extends string = CName,
    >(
        name: CName,
        opts?: JoinOptions<CAlias>
    ): JoinableEffect<
        TSchemaMap,
        QueryErrors,
        ConnectionErrors,
        A & B,
        JoinResult<CAlias, CSchema>
    > {
        return new JoinableEffect(this.store, this.query, {
            from: name,
            type: "left",
            as: opts?.as || name,
            on: {},
        });
    }
}

export class JoinableEffect<
    TSchemaMap extends Record<string, Document>,
    QueryErrors extends TaggedError,
    ConnectionErrors extends TaggedError,
    A extends JoinResult,
    B extends JoinResult,
> {
    constructor(
        private store: IStore<
            TSchemaMap,
            QueryErrors,
            TaggedError,
            ConnectionErrors
        >,
        private query: SelectQueryWrapper<TSchemaMap>,
        private currentJoin: JoinWrapper<TSchemaMap>
    ) {}
    on(
        condition: OnCondition<A, B>
    ): JoinEffect<TSchemaMap, QueryErrors, ConnectionErrors, A, B> {
        const joins = this.query.joins ? [...this.query.joins] : [];
        this.currentJoin.on = condition;
        joins.push(this.currentJoin);

        return new JoinEffect(this.store, {
            ...this.query,
            joins,
        });
    }
}

export type OnCondition<A, B> = {
    [K in KeyOf<A>]: KeyOf<A[K]>;
} & {
    [K in KeyOf<B>]: KeyOf<B[K]>;
};

export type JoinOptions<TName extends string = string> = { as: TName };
