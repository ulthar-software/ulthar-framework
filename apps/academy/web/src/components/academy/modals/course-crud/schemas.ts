import { Field, Schema } from "@fabric/core";

export const unitSchema = new Schema({
  title: Field.string({ minLength: 3 }),
});

export const moduleSchema = new Schema({
  title: Field.string({ minLength: 3 }),
});

export const courseSchema = new Schema({
  title: Field.string(),
});

// Section types
export type SectionType = "text" | "video" | "quiz";

// Schema for text section
export const textSectionSchema = new Schema({
  text: Field.string({ minLength: 10 }),
});

// Schema for video section
export const videoSectionSchema = new Schema({
  title: Field.string({ minLength: 3 }),
  videoUrl: Field.string({ minLength: 5 }),
});

// Define the question option schema
const QuestionOptionSchema = {
  text: Field.string({
    minLength: 1,
  }),
  isCorrect: Field.boolean(),
};

// Define the question schema
const QuestionSchema = {
  questionText: Field.string({
    minLength: 1,
  }),
  options: Field.objectArray(QuestionOptionSchema, {
    minLength: 1,
  }),
};

// Schema for quiz section
export const quizContentSchema = new Schema({
  questions: Field.objectArray(QuestionSchema, {
    minLength: 1,
  }),
  questionsToShow: Field.integer({
    isUnsigned: true,
    isOptional: true,
  }),
  randomizeQuestions: Field.boolean({
    isOptional: true,
  }),
  passingScore: Field.integer({
    isUnsigned: true,
    isOptional: true,
  }),
});

export const quizSectionSchema = new Schema({
  title: Field.string({ minLength: 3 }),
  content: Field.string(),
});
