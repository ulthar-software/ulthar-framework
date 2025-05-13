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
  content: Field.string({ minLength: 10 }),
});

// Schema for video section
export const videoSectionSchema = new Schema({
  title: Field.string({ minLength: 3 }),
  videoUrl: Field.string({ minLength: 5 }),
  description: Field.string(),
});

// Schema for quiz section
export const quizSectionSchema = new Schema({
  title: Field.string({ minLength: 3 }),
  instructions: Field.string({ minLength: 10 }),
});
