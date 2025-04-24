import { type Course } from "@ulthar/academy-domain";
import { Anchor } from "../ui/anchor.tsx";
import { Icon } from "../ui/icon.tsx";

export interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="flex flex-col bg-dark-alt shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-700 relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <Icon name="bx-image" className="text-9xl" />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-primary mb-2">
          {course.title}
        </h3>
        <p className="text-gray-300 text-sm flex-grow line-clamp-3">
          {course.description}
        </p>
        <div className="mt-4 flex justify-end">
          <Anchor
            href={`/academy/courses/${course.id}`}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors duration-300"
          >
            Ver curso
          </Anchor>
        </div>
      </div>
    </div>
  );
}
