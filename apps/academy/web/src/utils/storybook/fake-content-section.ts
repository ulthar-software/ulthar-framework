import { PosixDate, type UUID } from "@fabric/core";
import { faker } from "@faker-js/faker";
import {
  SectionType,
  type QuestionnaireSection,
  type QuestionnaireSectionContent,
  type TaggedQuestionnaireSection,
  type TaggedTextSection,
  type TaggedVideoSection,
  type TextSection,
  type TextSectionContent,
  type VideoSection,
  type VideoSectionContent,
} from "@ulthar/academy-domain";

export function fakeVideoContentSection(
  section?: Partial<VideoSection>,
): TaggedVideoSection {
  return {
    id: section?.id ?? (faker.string.uuid() as UUID),
    title: section?.title ?? faker.lorem.words(3),
    order: section?.order ?? faker.number.int({ min: 0, max: 100 }),
    unitId: section?.unitId ?? (faker.string.uuid() as UUID),
    version: section?.version ?? faker.number.int({ min: 0, max: 100 }),
    type: SectionType.VIDEO,
    content:
      section?.content ??
      ({
        videoUrl:
          "https://98c362bc-0a95-4de1-9606-b9b33c64a11f.mdnplay.dev/shared-assets/videos/flower.webm",
      } as VideoSectionContent),
    createdAt: section?.createdAt ?? new PosixDate(faker.date.past().getTime()),
    updatedAt:
      section?.updatedAt ?? new PosixDate(faker.date.recent().getTime()),
    createdBy: section?.createdBy ?? (faker.string.uuid() as UUID),
  };
}

export function fakeTextContentSection(
  section?: Partial<TextSection>,
): TaggedTextSection {
  return {
    id: section?.id ?? (faker.string.uuid() as UUID),
    title: section?.title ?? faker.lorem.words(3),
    order: section?.order ?? faker.number.int({ min: 0, max: 100 }),
    unitId: section?.unitId ?? (faker.string.uuid() as UUID),
    version: section?.version ?? faker.number.int({ min: 0, max: 100 }),
    type: SectionType.TEXT,
    content:
      section?.content ??
      ({
        text: `# ${faker.lorem.sentence()} 
        
## ${faker.lorem.sentence()}

${faker.lorem.paragraphs(2)}

- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}

> ${faker.lorem.paragraph()}

\`\`\`typescript
const example = () => {
  console.log("This is a code block");
};
\`\`\``,
      } as TextSectionContent),
    createdAt: section?.createdAt ?? new PosixDate(faker.date.past().getTime()),
    updatedAt:
      section?.updatedAt ?? new PosixDate(faker.date.recent().getTime()),
    createdBy: section?.createdBy ?? (faker.string.uuid() as UUID),
  };
}

export function fakeQuestionnaireContentSection(
  section?: Partial<QuestionnaireSection>,
): TaggedQuestionnaireSection {
  return {
    id: section?.id ?? (faker.string.uuid() as UUID),
    title: section?.title ?? faker.lorem.words(3),
    order: section?.order ?? faker.number.int({ min: 0, max: 100 }),
    unitId: section?.unitId ?? (faker.string.uuid() as UUID),
    version: section?.version ?? faker.number.int({ min: 1, max: 100 }),
    type: SectionType.QUESTIONNAIRE,
    content:
      section?.content ??
      ({
        questions: [
          {
            questionText:
              "What is the most common programming language for web development?",
            options: [
              { text: "JavaScript", isCorrect: true },
              { text: "Python", isCorrect: false },
              { text: "Java", isCorrect: false },
              { text: "C++", isCorrect: false },
            ],
          },
          {
            questionText: "Which of these is **not** a JavaScript framework?",
            options: [
              { text: "React", isCorrect: false },
              { text: "Vue", isCorrect: false },
              { text: "Django", isCorrect: true },
              { text: "Angular", isCorrect: false },
            ],
          },
          {
            questionText: "What does CSS stand for?",
            options: [
              { text: "Cascading Style Sheets", isCorrect: true },
              { text: "Computer Style Sheets", isCorrect: false },
              { text: "Creative Style System", isCorrect: false },
              { text: "Content Styling Solution", isCorrect: false },
            ],
          },
        ],
        passingScore: 70,
        randomizeQuestions: false,
      } as QuestionnaireSectionContent),
    createdAt: section?.createdAt ?? new PosixDate(faker.date.past().getTime()),
    updatedAt:
      section?.updatedAt ?? new PosixDate(faker.date.recent().getTime()),
    createdBy: section?.createdBy ?? (faker.string.uuid() as UUID),
  };
}
