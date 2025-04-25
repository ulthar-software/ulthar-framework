import type { Meta, StoryObj } from "@storybook/react";
import { fakeQuestionnaireContentSection } from "../../../utils/storybook/fake-content-section";
import { QuestionnaireContentSectionBlock } from "./questionnaire-section";

const meta: Meta<typeof QuestionnaireContentSectionBlock> = {
  component: QuestionnaireContentSectionBlock,
  title: "Components/Academy/Sections/QuestionnaireSection",
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    section: fakeQuestionnaireContentSection({
      title: "Knowledge Check Quiz",
    }),
  },
};

export const WithMarkdownQuestions: Story = {
  args: {
    section: fakeQuestionnaireContentSection({
      title: "Markdown in Questions",
      content: {
        questions: [
          {
            questionText:
              "Which of the following is the correct Markdown syntax for a **bold** text?",
            options: [
              { text: "`**bold text**`", isCorrect: true },
              { text: "`*bold text*`", isCorrect: false },
              { text: "`__bold text__`", isCorrect: false },
              { text: "`_bold text_`", isCorrect: false },
            ],
          },
          {
            questionText: "How do you create a heading in Markdown?",
            options: [
              { text: "Using `#` symbol before text", isCorrect: true },
              { text: "Using `<h1>` tags", isCorrect: false },
              { text: "Using underline with `=====`", isCorrect: false },
              { text: "Using bold formatting", isCorrect: false },
            ],
          },
          {
            questionText:
              "What Markdown code produces this?\n\n```\nconsole.log('Hello world');\n```",
            options: [
              {
                text: "````\n```\nconsole.log('Hello world');\n```\n````",
                isCorrect: true,
              },
              { text: "```console.log('Hello world');```", isCorrect: false },
              { text: "`console.log('Hello world');`", isCorrect: false },
              { text: "> console.log('Hello world');", isCorrect: false },
            ],
          },
        ],
        passingScore: 75,
      },
    }),
  },
};

export const WithHighPassingScore: Story = {
  args: {
    section: fakeQuestionnaireContentSection({
      title: "Advanced Quiz (90% to Pass)",
      content: {
        questions: [
          {
            questionText:
              "What is the output of `console.log(typeof null)` in JavaScript?",
            options: [
              { text: "`'object'`", isCorrect: true },
              { text: "`'null'`", isCorrect: false },
              { text: "`'undefined'`", isCorrect: false },
              { text: "`'string'`", isCorrect: false },
            ],
          },
          {
            questionText:
              "Which method is used to add an element at the end of an array in JavaScript?",
            options: [
              { text: "`push()`", isCorrect: true },
              { text: "`append()`", isCorrect: false },
              { text: "`add()`", isCorrect: false },
              { text: "`insert()`", isCorrect: false },
            ],
          },
          {
            questionText:
              "What is the correct way to create a function in JavaScript?",
            options: [
              { text: "`function myFunction() {}`", isCorrect: true },
              { text: "`def myFunction() {}`", isCorrect: false },
              { text: "`function:myFunction() {}`", isCorrect: false },
              { text: "`function = myFunction() {}`", isCorrect: false },
            ],
          },
        ],
        passingScore: 90,
      },
    }),
  },
};

export const WithRandomizedQuestions: Story = {
  args: {
    section: fakeQuestionnaireContentSection({
      title: "Randomized Quiz Questions",
      content: {
        questions: [
          {
            questionText: "What is the capital of France?",
            options: [
              { text: "Paris", isCorrect: true },
              { text: "London", isCorrect: false },
              { text: "Berlin", isCorrect: false },
              { text: "Rome", isCorrect: false },
            ],
          },
          {
            questionText: "What is the largest planet in our solar system?",
            options: [
              { text: "Jupiter", isCorrect: true },
              { text: "Saturn", isCorrect: false },
              { text: "Earth", isCorrect: false },
              { text: "Mars", isCorrect: false },
            ],
          },
          {
            questionText: "What is the chemical symbol for gold?",
            options: [
              { text: "Au", isCorrect: true },
              { text: "Ag", isCorrect: false },
              { text: "Fe", isCorrect: false },
              { text: "Cu", isCorrect: false },
            ],
          },
          {
            questionText: "Which language is primarily spoken in Brazil?",
            options: [
              { text: "Portuguese", isCorrect: true },
              { text: "Spanish", isCorrect: false },
              { text: "English", isCorrect: false },
              { text: "French", isCorrect: false },
            ],
          },
        ],
        randomizeQuestions: true,
        passingScore: 75,
      },
    }),
  },
};

export const WithLimitedQuestions: Story = {
  args: {
    section: fakeQuestionnaireContentSection({
      title: "Quick Quiz (Limited Questions)",
      content: {
        questions: [
          {
            questionText: "What is HTML?",
            options: [
              { text: "Hyper Text Markup Language", isCorrect: true },
              { text: "Hyperlinks and Text Markup Language", isCorrect: false },
              { text: "Home Tool Markup Language", isCorrect: false },
              { text: "Hyper Text Making Language", isCorrect: false },
            ],
          },
          {
            questionText: "Which tag is used to create a hyperlink in HTML?",
            options: [
              { text: "`<a>`", isCorrect: true },
              { text: "`<link>`", isCorrect: false },
              { text: "`<href>`", isCorrect: false },
              { text: "`<url>`", isCorrect: false },
            ],
          },
          {
            questionText:
              "Which property is used to change the background color in CSS?",
            options: [
              { text: "background-color", isCorrect: true },
              { text: "bgcolor", isCorrect: false },
              { text: "color-background", isCorrect: false },
              { text: "bg-color", isCorrect: false },
            ],
          },
          {
            questionText: "Which CSS property controls the text size?",
            options: [
              { text: "font-size", isCorrect: true },
              { text: "text-size", isCorrect: false },
              { text: "text-style", isCorrect: false },
              { text: "font-style", isCorrect: false },
            ],
          },
          {
            questionText: "What does CSS stand for?",
            options: [
              { text: "Cascading Style Sheets", isCorrect: true },
              { text: "Creative Style System", isCorrect: false },
              { text: "Computer Style Sheets", isCorrect: false },
              { text: "Colorful Style Sheets", isCorrect: false },
            ],
          },
        ],
        questionsToShow: 2,
        randomizeQuestions: true,
        passingScore: 50,
      },
    }),
  },
};
