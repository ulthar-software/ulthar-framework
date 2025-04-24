import type { VideoSection } from "@ulthar/academy-domain";
import { SectionCard } from "./section-card.tsx";

export interface VideoContentSectionProps {
  section: VideoSection;
}

export function VideoContentSectionBlock({
  section,
}: VideoContentSectionProps) {
  return (
    <SectionCard section={section}>
      <div className="video-player">
        <video
          src={section.content.videoUrl as string}
          className="w-full rounded-lg"
          controls
          preload="metadata"
        />
      </div>
    </SectionCard>
  );
}
