import type { Meta, StoryObj } from "@storybook/react";
import { fakeVideoContentSection } from "../../../utils/storybook/fake-content-section";
import { VideoContentSectionBlock } from "./video-section";

const meta: Meta<typeof VideoContentSectionBlock> = {
  component: VideoContentSectionBlock,
  title: "Components/Academy/Sections/VideoSection",
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    section: fakeVideoContentSection({
      title: "Introduction Video",
    }),
  },
};

export const WithLongTitle: Story = {
  args: {
    section: fakeVideoContentSection({
      title:
        "This is a very long video title that might wrap to multiple lines in the UI",
    }),
  },
};

export const InvalidVideo: Story = {
  args: {
    section: fakeVideoContentSection({
      title: "Invalid Video Source",
      content: {
        videoUrl:
          "https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.webm",
      },
    }),
  },
};
