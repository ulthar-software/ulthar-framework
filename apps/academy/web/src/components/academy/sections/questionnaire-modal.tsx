import type { QuestionnaireSectionContent } from "@ulthar/academy-domain";
import { useState } from "react";
import { MarkdownHooks } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Button } from "../../ui/button.tsx";

interface QuestionnaireModalProps {
  questions: QuestionnaireSectionContent["questions"];
  onCancel: () => void;
  onSubmit: (answers: Record<number, number>) => void;
}

export function QuestionnaireModal({
  questions,
  onCancel,
  onSubmit,
}: QuestionnaireModalProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const isQuizComplete =
    questions.length > 0 && Object.keys(answers).length === questions.length;

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const renderMarkdown = (content: string) => (
    <MarkdownHooks
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
    >
      {content}
    </MarkdownHooks>
  );

  return (
    <div className="bg-gray-800 rounded-md p-6 max-w-3xl w-11/12 max-h-[80vh] overflow-y-auto">
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

        <div className="mt-6 flex justify-between">
          <Button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
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
    </div>
  );
}
