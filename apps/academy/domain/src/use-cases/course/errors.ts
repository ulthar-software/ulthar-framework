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

export class QuestionnaireVersionMismatchError extends TaggedError<"QuestionnaireVersionMismatchError"> {
  constructor(
    public readonly questionnaireId: UUID,
    public readonly expectedVersion: number,
    public readonly actualVersion: number,
  ) {
    super(
      "QuestionnaireVersionMismatchError",
      `Questionnaire version mismatch: expected ${expectedVersion}, but got ${actualVersion}`,
    );
  }
}

export class TextSectionNotFoundError extends TaggedError<"TextSectionNotFoundError"> {
  constructor(public readonly sectionId: UUID) {
    super("TextSectionNotFoundError");
    this.message = `Text section with ID ${sectionId} not found`;
  }
}

export class VideoSectionNotFoundError extends TaggedError<"VideoSectionNotFoundError"> {
  constructor(public readonly sectionId: UUID) {
    super("VideoSectionNotFoundError");
    this.message = `Video section with ID ${sectionId} not found`;
  }
}

export class QuestionnaireSectionNotFoundError extends TaggedError<"QuestionnaireSectionNotFoundError"> {
  constructor(public readonly sectionId: UUID) {
    super("QuestionnaireSectionNotFoundError");
    this.message = `Questionnaire section with ID ${sectionId} not found`;
  }
}

export class IncompleteQuestionnaireResponseError extends TaggedError<"IncompleteQuestionnaireResponseError"> {
  constructor(
    public readonly questionnaireId: UUID,
    public readonly providedAnswers: number,
    public readonly requiredAnswers: number,
  ) {
    super(
      "IncompleteQuestionnaireResponseError",
      `Incomplete questionnaire response: ${providedAnswers} answers provided, but ${requiredAnswers} questions need to be answered`,
    );
  }
}

export class QuestionnaireResponseNotFoundError extends TaggedError<"QuestionnaireResponseNotFoundError"> {
  constructor(
    public readonly questionnaireId: UUID,
    public readonly userId: UUID,
  ) {
    super(
      "QuestionnaireResponseNotFoundError",
      `No response found for questionnaire ${questionnaireId} by user ${userId}`,
    );
  }
}
