export type Status = "open" | "in-progress" | "done";

export interface Task {
    id: number;
    title: string;
    priority: number;
    status: Status;
}

export interface Model {
    tasks: Task[];
}
