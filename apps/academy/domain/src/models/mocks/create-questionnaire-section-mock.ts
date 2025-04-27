import type { UUID } from "@fabric/core";
import { Permission } from "../../security/permission.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";
import { AddQuestionnaireSectionToUnitUseCase } from "../../use-cases/course/module/unit/section/add-questionnaire-section-to-unit.js";
import type { QuestionnaireSection } from "../sections/questionnaire-section.js";

export async function createQuestionnaireSectionMock(
  services: MockedDependencies,
  userId: UUID,
  unitId: UUID,
  section: Partial<QuestionnaireSection> = {},
): Promise<UUID> {
  // Create a questionnaire section in the unit
  const sectionResult = await AddQuestionnaireSectionToUnitUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.EDIT_COURSE],
      },
    },
    {
      unitId,
      title: section.title ?? "Test Questionnaire Section",
      questions: section.content?.questions ?? [
        {
          questionText: "Sample question?",
          options: [
            { text: "Option 1", isCorrect: true },
            { text: "Option 2", isCorrect: false },
          ],
        },
      ],
      questionsToShow: section.content?.questionsToShow,
      randomizeQuestions: section.content?.randomizeQuestions,
      passingScore: section.content?.passingScore,
    },
  ).runOrThrow();

  return sectionResult.sectionId;
}
