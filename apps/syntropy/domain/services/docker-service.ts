import { type Effect, TaggedError } from "@fabric/core";

export interface IContainer {
  id: string;
  name: string;
}

export interface IContainerService {
  getContainer(id: string): Effect<IContainer, ContainerError>;
  getContainerLogs(id: string): Effect<string, ContainerError>;
}

export class ContainerError extends TaggedError<"ContainerError"> {
  constructor(message: string) {
    super("ContainerError", message);
    this.name = "ContainerError";
  }
}
