import type { TaggedVideoSection } from "@ulthar/academy-domain";
import { SectionCard } from "./section-card.tsx";

export interface VideoContentSectionProps {
  section: TaggedVideoSection;
  refreshUnit: () => Promise<void>;
}

export function VideoContentSectionBlock({
  section,
  refreshUnit,
}: VideoContentSectionProps) {
  return (
    <SectionCard section={section} refreshUnit={refreshUnit}>
      <div className="video-player">
        <video
          src={section.content.videoUrl}
          className="w-full rounded-lg"
          controls
          preload="metadata"
        />
      </div>
    </SectionCard>
  );
}
