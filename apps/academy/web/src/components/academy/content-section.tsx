import { exhaustiveCheck } from "@fabric/core";
import { SectionType, type TaggedContentSection } from "@ulthar/academy-domain";
import { QuestionnaireContentSectionBlock } from "./sections/questionnaire-section.tsx";
import { TextContentSectionBlock } from "./sections/text-section.tsx";
import { VideoContentSectionBlock } from "./sections/video-section.tsx";

export interface ContentSectionProps {
  section: TaggedContentSection;
  refreshUnit: () => Promise<void>;
}

export function ContentSectionBlock({
  section,
  refreshUnit,
}: ContentSectionProps) {
  switch (section.type) {
    case SectionType.QUESTIONNAIRE: {
      return (
        <QuestionnaireContentSectionBlock
          section={section}
          refreshUnit={refreshUnit}
        />
      );
    }
    case SectionType.TEXT: {
      return (
        <TextContentSectionBlock section={section} refreshUnit={refreshUnit} />
      );
    }
    case SectionType.VIDEO: {
      return (
        <VideoContentSectionBlock section={section} refreshUnit={refreshUnit} />
      );
    }
    default: {
      exhaustiveCheck(section);
    }
  }
}
