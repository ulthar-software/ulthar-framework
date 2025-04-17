// Re-export everything for backward compatibility
export * from "./questionnaire-section.js";
export * from "./section-base.js";
export * from "./text-section.js";
export * from "./video-section.js";

// Union type that represents any type of section
import type { QuestionnaireSection } from "./questionnaire-section.js";
import type { TextSection } from "./text-section.js";
import type { VideoSection } from "./video-section.js";

export type ContentSection = TextSection | VideoSection | QuestionnaireSection;
