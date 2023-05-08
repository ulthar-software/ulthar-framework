import { Maybe } from "../types/index.js";
import { PaginatedResult } from "./paginated-result.js";

export function getNextAndPrev<T>(result: PaginatedResult<T>): {
    next: Maybe<number>;
    prev: Maybe<number>;
} {
    return {
        next:
            result.page * result.pageSize < result.total
                ? result.page + 1
                : undefined,
        prev: result.page > 1 ? result.page - 1 : undefined,
    };
}
