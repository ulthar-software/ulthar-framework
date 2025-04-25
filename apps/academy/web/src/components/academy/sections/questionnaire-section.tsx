import type {
  QuestionnaireSection,
  QuestionnaireSectionContent,
} from "@ulthar/academy-domain";
import { useState } from "react";
import { MarkdownHooks } from "react-markdown";
import rehypeStarryNight from "rehype-starry-night";
import remarkGfm from "remark-gfm";
import { Button } from "../../ui/button.tsx";
import "./dark.css";
import { SectionCard } from "./section-card.tsx";

export interface QuestionnaireContentSectionProps {
  section: QuestionnaireSection;
}

export function QuestionnaireContentSectionBlock({
  section,
}: QuestionnaireContentSectionProps) {
  const [quizState, setQuizState] = useState<
    "initial" | "in-progress" | "completed"
  >("initial");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });

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

  const handleStartQuiz = () => {
    setQuizState("in-progress");
    setAnswers({});
    setShowCorrectAnswers(false);
    setScore({ correct: 0, total: 0, percentage: 0 });
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;

    questions.forEach((question, questionIndex) => {
      const selectedOptionIndex = answers[questionIndex];
      if (question.options[selectedOptionIndex].isCorrect) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    setScore({
      correct: correctCount,
      total: totalQuestions,
      percentage,
    });

    setQuizState("completed");
  };

  const isQuizComplete = Object.keys(answers).length === questions.length;
  const isPassing = score.percentage >= passingScore;

  const renderMarkdown = (content: string) => (
    <MarkdownHooks
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeStarryNight]}
    >
      {content}
    </MarkdownHooks>
  );

  return (
    <SectionCard section={section}>
      <div className="text-gray-200">
        {quizState === "initial" && (
          <div className="flex flex-col items-center p-4 bg-gray-800 rounded-md text-center">
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
          </div>
        )}

        {quizState === "in-progress" && (
          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="p-4 bg-gray-800 rounded-md">
                <div className="mb-3 font-semibold">
                  <span className="mr-2">Pregunta {questionIndex + 1}:</span>
                  <span className="markdown-content">
                    {renderMarkdown(question.questionText)}
                  </span>
                </div>
                <div className="space-y-2 ml-4">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        id={`q${questionIndex}-o${optionIndex}`}
                        name={`question-${questionIndex}`}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => {
                          handleSelectOption(questionIndex, optionIndex);
                        }}
                        className="mr-3"
                      />
                      <label
                        htmlFor={`q${questionIndex}-o${optionIndex}`}
                        className="markdown-content cursor-pointer"
                      >
                        {renderMarkdown(option.text)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleSubmitQuiz}
                disabled={!isQuizComplete}
                className={`py-2 px-4 rounded-md transition-colors ${
                  isQuizComplete
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                Enviar cuestionario
              </Button>
            </div>
          </div>
        )}

        {quizState === "completed" && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-800 rounded-md text-center">
              <h4 className="text-xl font-semibold mb-2">
                Resultado del cuestionario: {score.correct} de {score.total}{" "}
                correctas
              </h4>
              <div className="text-lg mb-4">
                Tu puntaje:{" "}
                <span className={isPassing ? "text-green-400" : "text-red-400"}>
                  {score.percentage}%
                </span>
                {isPassing
                  ? " - ¡Felicidades! Aprobaste."
                  : " - No alcanzaste el puntaje mínimo."}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowCorrectAnswers(!showCorrectAnswers);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  {showCorrectAnswers
                    ? "Ocultar respuestas"
                    : "Mostrar respuestas correctas"}
                </button>
                <button
                  onClick={handleStartQuiz}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Reintentar cuestionario
                </button>
              </div>
            </div>

            {showCorrectAnswers && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Revisar respuestas:</h4>
                {questions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="p-4 bg-gray-800 rounded-md"
                  >
                    <div className="mb-3 font-semibold">
                      <span className="mr-2">
                        Pregunta {questionIndex + 1}:
                      </span>
                      <span className="markdown-content">
                        {renderMarkdown(question.questionText)}
                      </span>
                    </div>
                    <div className="space-y-2 ml-4">
                      {question.options.map((option, optionIndex) => {
                        const isSelected =
                          answers[questionIndex] === optionIndex;
                        const selectedColor = isSelected
                          ? option.isCorrect
                            ? "border-green-500 bg-green-900/20"
                            : "border-red-500 bg-red-900/20"
                          : "";

                        const correctHighlight = option.isCorrect
                          ? "border-green-500"
                          : "";

                        return (
                          <div
                            key={optionIndex}
                            className={`flex items-center p-2 border ${
                              isSelected ? selectedColor : correctHighlight
                            } rounded-md ${option.isCorrect ? "font-medium" : ""}`}
                          >
                            <span className="markdown-content">
                              {renderMarkdown(option.text)}
                            </span>
                            {option.isCorrect && (
                              <span className="ml-auto text-green-400">
                                ✓ Correcta
                              </span>
                            )}
                            {isSelected && !option.isCorrect && (
                              <span className="ml-auto text-red-400">
                                ✗ Incorrecta
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
