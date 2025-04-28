import type { QuestionnaireSectionContent } from "@ulthar/academy-domain";
import { MarkdownHooks } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Button } from "../../ui/button.tsx";

interface QuestionnaireResultsModalProps {
  questions: QuestionnaireSectionContent["questions"];
  answers: Record<number, number>;
  closeModal: () => void;
}

export function QuestionnaireResultsModal({
  questions,
  answers,
  closeModal,
}: QuestionnaireResultsModalProps) {
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
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Revisar respuestas:</h4>
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="p-4 bg-gray-800 rounded-md">
              <div className="mb-3 font-semibold">
                <span className="mr-2">Pregunta {questionIndex + 1}:</span>
                <span className="markdown-content">
                  {renderMarkdown(question.questionText)}
                </span>
              </div>
              <div className="space-y-2 ml-4">
                {question.options.map((option, optionIndex) => {
                  const isSelected = answers[questionIndex] === optionIndex;
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

        <div className="flex justify-end">
          <Button
            onClick={closeModal}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
