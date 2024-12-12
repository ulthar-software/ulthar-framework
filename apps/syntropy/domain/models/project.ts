import { Field, Model, type ModelToType } from "@fabric/models";

export const ProjectModel = Model.from("projects", {
  name: Field.string({}),
  description: Field.string({}),
  userId: Field.reference({
    targetModel: "users",
  }),
});
export type ProjectModel = typeof ProjectModel;
export type Project = ModelToType<ProjectModel>;
