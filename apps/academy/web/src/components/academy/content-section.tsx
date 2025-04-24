import { exhaustiveCheck } from "@fabric/core";
import { SectionType, type TaggedContentSection } from "@ulthar/academy-domain";
import { VideoContentSectionBlock } from "./sections/video-section.tsx";

export interface ContentSectionProps {
  section: TaggedContentSection;
}

export function ContentSectionBlock({ section }: ContentSectionProps) {
  switch (section.type) {
    case SectionType.QUESTIONNAIRE: {
      return <div></div>;
    }
    case SectionType.TEXT: {
      return <div></div>;
    }
    case SectionType.VIDEO: {
      return <VideoContentSectionBlock section={section} />;
    }
    default: {
      exhaustiveCheck(section);
    }
  }
}
