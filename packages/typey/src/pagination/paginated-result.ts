export interface PaginatedResult<T> {
    page: number;
    pageSize: number;
    total: number;
    data: T[];
}
