export const Aggregators = {
    count: <Field extends string, Key extends string>(
        field: Field,
        as: AsDescriptor<Key>
    ): CountAggregator<Field, Key> => {
        return { count: field, ...as };
    },
    sum: <Field extends string, Key extends string>(
        field: Field,
        as: Key
    ): SumAggregator<Field, Key> => {
        return { sum: field, as };
    },
    avg: <Field extends string, Key extends string>(
        field: Field,
        as: Key
    ): AvgAggregator<Field, Key> => {
        return { avg: field, as };
    },
    min: <Field extends string, Key extends string>(
        field: Field,
        as: Key
    ): MinAggregator<Field, Key> => {
        return { min: field, as };
    },
    max: <Field extends string, Key extends string>(
        field: Field,
        as: Key
    ): MaxAggregator<Field, Key> => {
        return { max: field, as };
    },
} as const;

export type AsDescriptor<Key extends string> = {
    as: Key;
};

export interface CountAggregator<Field extends string, Key extends string>
    extends AsDescriptor<Key> {
    count: Field;
}
export interface SumAggregator<Field extends string, Key extends string>
    extends AsDescriptor<Key> {
    sum: Field;
}
export interface AvgAggregator<Field extends string, Key extends string>
    extends AsDescriptor<Key> {
    avg: Field;
}
export interface MinAggregator<Field extends string, Key extends string>
    extends AsDescriptor<Key> {
    min: Field;
}
export interface MaxAggregator<Field extends string, Key extends string>
    extends AsDescriptor<Key> {
    max: Field;
}

export type DocumentAggregators<Field extends string, Key extends string> =
    | CountAggregator<Field, Key>
    | SumAggregator<Field, Key>
    | AvgAggregator<Field, Key>
    | MinAggregator<Field, Key>
    | MaxAggregator<Field, Key>;

export type AggregatorKey<T> = T extends AsDescriptor<infer Key> ? Key : never;
