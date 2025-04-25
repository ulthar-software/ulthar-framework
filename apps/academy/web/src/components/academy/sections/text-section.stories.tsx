import type { Meta, StoryObj } from "@storybook/react";
import { fakeTextContentSection } from "../../../utils/storybook/fake-content-section";
import { TextContentSectionBlock } from "./text-section";

const meta: Meta<typeof TextContentSectionBlock> = {
  component: TextContentSectionBlock,
  title: "Components/Academy/Sections/TextSection",
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    section: fakeTextContentSection({
      title: "Introduction to Markdown",
    }),
  },
};

export const WithLongTitle: Story = {
  args: {
    section: fakeTextContentSection({
      title:
        "This is a very long text section title that might wrap to multiple lines in the UI",
    }),
  },
};

export const WithComplexMarkdown: Story = {
  args: {
    section: fakeTextContentSection({
      title: "Complex Markdown Example",
      content: {
        text: `

This is a paragraph with **bold text** and *italic text*.

### Lists

* Item 1
* Item 2
  * Nested item
* Item 3

1. Ordered item 1
2. Ordered item 2
3. Ordered item 3

### Code Blocks

\`\`\`ts
interface User {
  id: string;
  name: string;
  email: string;
}

function getUserInfo(user: User) {
  return \`\${user.name} (\${user.email})\`;
}
\`\`\`

### Blockquotes

> This is a blockquote
> It can span multiple lines
>
> And have paragraphs

### Tables

| Column 1 | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
| Row 3    | Data     | Data     |
`,
      },
    }),
  },
};

export const WithSimpleText: Story = {
  args: {
    section: fakeTextContentSection({
      title: "Simple Text Content",
      content: {
        text: "This is a simple text section without any markdown formatting. It's just plain text content for when you don't need any special formatting.",
      },
    }),
  },
};
