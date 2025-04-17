import { TaggedError } from "@fabric/core";

export class CourseNotFoundError extends TaggedError<"CourseNotFoundError"> {
  constructor(courseId: string) {
    super("CourseNotFoundError", `Course with ID ${courseId} not found`);
  }
}
