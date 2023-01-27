export interface IFile<T> {
    read(): Promise<T>;
    write(content: T): Promise<void>;
    delete(): Promise<void>;
    exists(): Promise<boolean>;
}
