import type {
  QuestionnaireSection,
  QuestionnaireSectionContent,
} from "@ulthar/academy-domain";
import { useState } from "react";
import { useModal } from "../../../utils/modal/modal-hooks.tsx";
import { Button } from "../../ui/button.tsx";
import "./dark.css";
import { QuestionnaireModal } from "./questionnaire-modal.tsx";
import { QuestionnaireResultsModal } from "./questionnaire-results-modal.tsx";
import { SectionCard } from "./section-card.tsx";

export interface QuestionnaireContentSectionProps {
  section: QuestionnaireSection;
}

export function QuestionnaireContentSectionBlock({
  section,
}: QuestionnaireContentSectionProps) {
  const { showModal } = useModal();
  const [answers, setAnswers] = useState<Record<number, number> | null>(null);
  const [score, setScore] = useState({
    correct: 0,
    total: 0,
    percentage: 0,
    isPassing: false,
  });

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

  const handleStartQuiz = () => {
    setAnswers(null);
    const [closeModal] = showModal(
      <QuestionnaireModal
        questions={questions}
        onCancel={() => {
          closeModal();
        }}
        onSubmit={(answers) => {
          closeModal();
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
        }}
      />,
    );
  };

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
    <SectionCard section={section}>
      <div className="text-gray-200">
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
                onClick={handleStartQuiz}
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
                {isPerfectScore && " - ¡Felicitaciones! Lo hiciste muy bien."}
                {!isPerfectScore &&
                  score.isPassing &&
                  " - Todavía se puede mejorar. Consultá los materiales y volvé a intentarlo."}
                {!score.isPassing &&
                  " - Aún no alcanzaste el puntaje mínimo. Consultá los materiales y volvé a intentarlo."}
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
                  onClick={handleStartQuiz}
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
      </div>
    </SectionCard>
  );
}
