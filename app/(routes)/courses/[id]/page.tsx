"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams } from "next/navigation";

import type { Course } from "@/app/_components/CreateCourseButton";
import { useI18n } from "@/components/i18n/I18nProvider";

import CourseChapters, {
  type Chapter,
  type CourseProgressData,
} from "./_components/CourseChapter";
import CourseDetailsBanner from "./_components/CourseDetailsBanner";
import CourseProgress from "./_components/CourseProgress";

export default function CoursePage() {
  const { t, translateMessage } = useI18n();
  const params = useParams<{ id: string }>();

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
          throw new Error(t("Failed to load course"));
        }

        if (!chaptersResponse.ok) {
          throw new Error(t("Failed to load chapters"));
        }

        const coursesData: Course[] = await coursesResponse.json();
        const chaptersData: Chapter[] = await chaptersResponse.json();
        const currentCourse = coursesData.find(
          (item) => item.id === Number(courseId),
        );

        if (!currentCourse) {
          throw new Error(t("Course not found"));
        }

        setCourse(currentCourse);
        setChapters(chaptersData);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Course loading error:", error);
        setError(
          error instanceof Error
            ? translateMessage(error.message)
            : t("Failed to load course"),
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
  }, [courseId, t, translateMessage]);

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100svh-64px)] items-center justify-center bg-[#07080C]">
        <p className="font-pixel text-2xl text-[#FFD400]">
          {t("Loading course...")}
        </p>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="flex min-h-[calc(100svh-64px)] items-center justify-center bg-[#07080C] p-8">
        <p className="border border-red-400/30 bg-red-400/10 p-5 font-pixel text-2xl text-red-400">
          {error || t("Course not found")}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100svh-64px)] bg-[#07080C] text-white">
      <CourseDetailsBanner
        key={course.id}
        course={course}
        onEnrollmentChange={handleEnrollmentChange}
      />

      <section className="w-full border-t border-white/10 bg-[#07080C] px-4 py-10 sm:px-6 sm:py-12 md:px-10 lg:px-16">
        <div className="grid items-start gap-8 lg:grid-cols-3 lg:gap-10">
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
