import { Field } from "@fabric/core";

// Text Section Content
export const TextSectionContentModel = {
  text: Field.string({
    minLength: 1,
  }),
};

// Video Section Content
export const VideoSectionContentModel = {
  videoUrl: Field.url(),
  description: Field.string({
    isOptional: true,
  }),
  duration: Field.integer({
    isOptional: true,
    isUnsigned: true,
  }),
};

// Questionnaire Section Content
export const QuestionnaireSectionContentModel = {
  questions: Field.objectArray(
    {
      questionText: Field.string(),
      options: Field.objectArray(
        {
          text: Field.string(),
          isCorrect: Field.boolean(),
        },
        {},
      ),
    },
    {},
  ),
  passingScore: Field.integer({
    isUnsigned: true,
    isOptional: true,
  }),
};
