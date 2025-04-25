import { exhaustiveCheck } from "@fabric/core";
import { SectionType, type TaggedContentSection } from "@ulthar/academy-domain";
import { QuestionnaireContentSectionBlock } from "./sections/questionnaire-section.tsx";
import { TextContentSectionBlock } from "./sections/text-section.tsx";
import { VideoContentSectionBlock } from "./sections/video-section.tsx";

export interface ContentSectionProps {
  section: TaggedContentSection;
}

export function ContentSectionBlock({ section }: ContentSectionProps) {
  switch (section.type) {
    case SectionType.QUESTIONNAIRE: {
      return <QuestionnaireContentSectionBlock section={section} />;
    }
    case SectionType.TEXT: {
      return <TextContentSectionBlock section={section} />;
    }
    case SectionType.VIDEO: {
      return <VideoContentSectionBlock section={section} />;
    }
    default: {
      exhaustiveCheck(section);
    }
  }
}
