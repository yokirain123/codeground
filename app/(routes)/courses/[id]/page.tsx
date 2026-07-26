"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import CourseProgress from "./_components/CourseProgress";

import CourseChapters, { type Chapter } from "./_components/CourseChapter";

import type { Course } from "@/app/_components/CreateCourseButton";

export default function CoursePage() {
  const params = useParams<{ id: string }>();

  const [course, setCourse] = useState<Course | null>(null);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const courseId = params.id;

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

        console.error(error);

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
    return <p className="p-8 font-pixel text-2xl">Loading course...</p>;
  }

  if (error || !course) {
    return (
      <p className="p-8 font-pixel text-2xl text-red-400">
        {error || "Course not found"}
      </p>
    );
  }

  return (
    <main>
      <section className="relative flex min-h-[calc(40svh-64px)] items-center justify-start overflow-hidden">
        <Image
          src={course.bannerImage}
          alt={course.title}
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_left,transparent_0%,rgba(0,0,0,0.4)_30%,rgba(0,0,0,0.85)_100%)]" />

        <div className="relative z-10 flex max-w-3xl flex-col items-start px-6 text-left md:px-10 lg:px-14">
          <span className="mb-3 bg-accent px-3 py-1 font-pixel text-xl text-black">
            {course.level}
          </span>

          <h1 className="font-pixel text-4xl font-bold text-accent [text-shadow:2px_2px_0_#000] md:text-7xl">
            {course.title}
          </h1>

          <p className="mt-4 font-pixel text-xl text-white/80 [text-shadow:2px_2px_0_#000] md:text-2xl">
            {course.desc}
          </p>
        </div>
      </section>

      <section className="w-full px-16 py-12">
            <div className="grid items-start gap-10 grid-cols-3">
              <CourseChapters chapters={chapters} />
              <CourseProgress chapters={chapters} progress={0} />
            </div>
      </section>
    </main>
  );
}
