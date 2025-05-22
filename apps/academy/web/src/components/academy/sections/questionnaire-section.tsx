import { exhaustiveCheck } from "@fabric/core";
import type {
  QuestionnaireSectionContent,
  TaggedQuestionnaireSection,
} from "@ulthar/academy-domain";
import { useEffect, useState } from "react";
import { useModal } from "../../../utils/modal/modal-hooks.tsx";
import { useQuery } from "../../../utils/rpc/use-query.ts";
import { useRPC } from "../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../utils/toasts/show-error-toast.ts";
import { Button } from "../../ui/button.tsx";
import { LoadingSpinner } from "../../ui/loading-spinner.tsx";
import { QuestionnaireModal } from "./questionnaire-modal.tsx";
import { QuestionnaireResultsModal } from "./questionnaire-results-modal.tsx";
import { SectionCard } from "./section-card.tsx";

export interface QuestionnaireContentSectionProps {
  section: TaggedQuestionnaireSection;
  refreshUnit: () => Promise<void>;
}

export function QuestionnaireContentSectionBlock({
  section,
  refreshUnit,
}: QuestionnaireContentSectionProps) {
  const { showModal } = useModal();
  const [answers, setAnswers] = useState<Record<number, number> | null>(null);
  const rpcAddResponse = useRPC("addQuestionnaireResponse");
  const [isSendingResponse, setIsSendingResponse] = useState(false);

  const [isLoading, questionnaireResponse, error] = useQuery(
    "getQuestionnaireResponse",
    {
      questionnaireId: section.id,
    },
  );

  const [score, setScore] = useState({
    correct: 0,
    total: 0,
    percentage: 0,
    isPassing: false,
  });

  function updateScore(answers: Record<number, number>) {
    let correctCount = 0;

    questions.forEach((question, questionIndex) => {
      const selectedOptionIndex = answers[questionIndex];
      if (question.options[selectedOptionIndex].isCorrect) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const newScore = {
      correct: correctCount,
      total: totalQuestions,
      percentage,
      isPassing: percentage >= passingScore,
    };
    setAnswers(answers);
    setScore(newScore);
  }

  function startQuiz() {
    setAnswers(null);
    const [closeModal] = showModal(
      <QuestionnaireModal
        questions={questions}
        onCancel={() => {
          closeModal();
        }}
        onSubmit={(answers) => {
          closeModal();
          updateScore(answers);
          void sendRPC(answers);
        }}
      />,
    );
  }

  async function sendRPC(answers: Record<number, number>) {
    setIsSendingResponse(true);
    const result = await rpcAddResponse({
      questionnaireId: section.id,
      questionnaireVersion: section.version,
      answers: Object.values(answers),
    });

    if (result.isError()) {
      switch (result.value._tag) {
        case "IncompleteQuestionnaireResponseError":
        case "QuestionnaireVersionMismatchError":
        case "QuestionnaireSectionNotFoundError": {
          showErrorToast(
            "Es probable que estés viendo un cuestionario desactualizado. Tu respuesta no pudo guardarse. Por favor, recargá la pagina y volvé a intentarlo. Si el problema persiste, contactanos por Discord",
          );
          break;
        }
        case "UnexpectedError": {
          showErrorToast(
            "Ocurrió un error inesperado. Tu respuesta no pudo guardarse. Por favor, revisá tu conexión a internet y volvé a intentarlo más tarde. Si el problema persiste, contactanos por Discord",
          );
          break;
        }
        default: {
          exhaustiveCheck(result.value);
        }
      }
    }

    setIsSendingResponse(false);
  }

  useEffect(() => {
    if (!isLoading && !error && questionnaireResponse) {
      if (
        questionnaireResponse.response.questionnaireVersion !== section.version
      ) {
        console.log("Version mismatch");
        return;
      }

      updateScore(
        questionnaireResponse.response.answers.reduce<Record<number, number>>(
          (acc, answer, i) => {
            acc[i] = answer;
            return acc;
          },
          {},
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionnaireResponse, isLoading, error]);

  const answersSubmitted = answers !== null;

  const content = section.content as QuestionnaireSectionContent;

  // Determine if questionnaire has a passing score
  const passingScore = content.passingScore ?? 0;

  // Get questions to show (all questions if not specified)
  const allQuestions = content.questions;
  const questionsToShow = content.questionsToShow
    ? allQuestions.slice(0, content.questionsToShow)
    : allQuestions;

  // Randomize questions if needed
  const questions = content.randomizeQuestions
    ? [...questionsToShow].sort(() => Math.random() - 0.5)
    : questionsToShow;

  const isPerfectScore = score.percentage === 100;

  function showCorrectAnswers() {
    if (!answersSubmitted) return;

    const [closeModal] = showModal(
      <QuestionnaireResultsModal
        questions={questions}
        answers={answers}
        closeModal={() => {
          closeModal();
        }}
      />,
    );
  }

  return (
    <SectionCard section={section} refreshUnit={refreshUnit}>
      <div className="text-gray-200">
        {(isLoading || isSendingResponse) && (
          <div className="flex-grow flex justify-center items-center">
            <LoadingSpinner className="text-primary text-4xl sm:text-6xl" />
          </div>
        )}

        {!isLoading && !isSendingResponse && (
          <div className="flex flex-col items-center p-4 bg-gray-800 rounded-md text-center">
            {!answersSubmitted && (
              <>
                <p className="text-xl font-semibold mb-4">
                  Este cuestionario tiene{" "}
                  {content.questionsToShow ?? questions.length} preguntas.
                  {content.passingScore && (
                    <span> Puntaje mínimo: {passingScore}%</span>
                  )}
                </p>
                <Button
                  onClick={startQuiz}
                  className="bg-primary hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Iniciar cuestionario
                </Button>
              </>
            )}

            {answersSubmitted && (
              <>
                <p className="text-xl font-semibold mb-4">
                  Resultado del cuestionario: {score.correct} de {score.total}{" "}
                  correctas
                </p>
                <div className="text-lg mb-4">
                  Tu puntaje:{" "}
                  <span
                    className={
                      score.isPassing ? "text-green-400" : "text-red-400"
                    }
                  >
                    {score.percentage}%
                  </span>
                  {isPerfectScore && (
                    <p>¡Felicitaciones! Lo hiciste muy bien.</p>
                  )}
                  {!isPerfectScore && score.isPassing && (
                    <>
                      <p>Todavía se puede mejorar.</p>
                      <p>Consultá los materiales y volvé a intentarlo.</p>
                    </>
                  )}
                  {!score.isPassing && (
                    <>
                      <p>Aún no alcanzaste el puntaje requerido.</p>
                      <p>Consultá los materiales y volvé a intentarlo.</p>
                    </>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                    onClick={showCorrectAnswers}
                  >
                    Mostrar respuestas correctas
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                    onClick={startQuiz}
                  >
                    Reintentar cuestionario
                  </Button>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Si tienes dudas, revisá los recursos de estudio o consultá por
                  discord.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
