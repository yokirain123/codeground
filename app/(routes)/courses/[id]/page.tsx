"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { Course } from "@/app/_components/CreateCourseButton";

import CourseChapters, {
  type CourseProgressData,
  type Chapter,
} from "./_components/CourseChapter";
import CourseDetailsBanner from "./_components/CourseDetailsBanner";
import CourseProgress from "./_components/CourseProgress";

export default function CoursePage() {
  const params = useParams<{
    id: string;
  }>();

  const [courseProgress, setCourseProgress] = useState<CourseProgressData>({
    completedChapters: 0,
    completedExercises: 0,
    earnedXp: 0,
  });

  const [course, setCourse] = useState<Course | null>(null);

  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [isEnrolled, setIsEnrolled] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const courseId = params.id;

  const handleEnrollmentChange = useCallback((enrolled: boolean) => {
    setIsEnrolled(enrolled);

    if (!enrolled) {
      setCourseProgress({
        completedChapters: 0,
        completedExercises: 0,
        earnedXp: 0,
      });
    }
  }, []);

  useEffect(() => {
    if (!courseId) {
      return;
    }

    const controller = new AbortController();

    const getCourseData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [coursesResponse, chaptersResponse] = await Promise.all([
          fetch("/api/courses", {
            cache: "no-store",
            signal: controller.signal,
          }),

          fetch(`/api/admin/save-chapters?courseId=${courseId}`, {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!coursesResponse.ok) {
          throw new Error("Failed to load course");
        }

        if (!chaptersResponse.ok) {
          throw new Error("Failed to load chapters");
        }

        const coursesData: Course[] = await coursesResponse.json();

        const chaptersData: Chapter[] = await chaptersResponse.json();

        const currentCourse = coursesData.find(
          (item) => item.id === Number(courseId),
        );

        if (!currentCourse) {
          throw new Error("Course not found");
        }

        setCourse(currentCourse);
        setChapters(chaptersData);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Course loading error:", error);

        setError(
          error instanceof Error ? error.message : "Failed to load course",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void getCourseData();

    return () => {
      controller.abort();
    };
  }, [courseId]);

  if (isLoading) {
    return (
      <main className="flex min-h-96 items-center justify-center">
        <p className="font-pixel text-2xl text-accent">Loading course...</p>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="flex min-h-96 items-center justify-center p-8">
        <p className="font-pixel text-2xl text-red-400">
          {error || "Course not found"}
        </p>
      </main>
    );
  }

  return (
    <main>
      <CourseDetailsBanner
        key={course.id}
        course={course}
        onEnrollmentChange={handleEnrollmentChange}
      />

      <section className="w-full px-6 py-12 md:px-10 lg:px-16">
        <div className="grid items-start gap-10 lg:grid-cols-3">
          <CourseChapters
            chapters={chapters}
            isEnrolled={isEnrolled}
            onProgressChange={setCourseProgress}
          />

          <CourseProgress chapters={chapters} completion={courseProgress} />
        </div>
      </section>
    </main>
  );
}
