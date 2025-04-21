import type { UUID } from "@fabric/core";
import { TaggedError } from "@fabric/core";

export class CourseNotFoundError extends TaggedError<"CourseNotFoundError"> {
  constructor(courseId: string) {
    super("CourseNotFoundError", `Course with ID ${courseId} not found`);
  }
}

export class ModuleNotFoundError extends TaggedError<"ModuleNotFoundError"> {
  constructor(public readonly moduleId: UUID) {
    super("ModuleNotFoundError");
    this.message = `Module with ID ${moduleId} not found`;
  }
}

export class UnitNotFoundError extends TaggedError<"UnitNotFoundError"> {
  constructor(public readonly unitId: UUID) {
    super("UnitNotFoundError");
    this.message = `Unit with ID ${unitId} not found`;
  }
}

export class NotEnrolledInCourseError extends TaggedError<"NotEnrolledInCourseError"> {
  constructor(
    public readonly userId: UUID,
    public readonly courseId: UUID,
  ) {
    super(
      "NotEnrolledInCourseError",
      `User with id ${userId} is not enrolled in course ${courseId}`,
    );
  }
}
