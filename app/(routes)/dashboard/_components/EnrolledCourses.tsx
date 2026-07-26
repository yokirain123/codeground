"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import bookCourses from "@/components/images/book.gif";

interface EnrolledCourse {
  enrollmentId: number;
  courseId: number;
  title: string;
  desc: string;
  bannerImage: string;
  level: string;
  tags: string | null;
  xpEarned: number;
  enrolledAt: string;
}

export default function EnrolledCourses() {
  const [
    enrolledCourses,
    setEnrolledCourses,
  ] = useState<EnrolledCourse[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const getEnrolledCourses = async () => {
      try {
        const response = await fetch(
          "/api/enrolled-courses",
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const contentType =
          response.headers.get(
            "content-type",
          );

        if (
          !contentType?.includes(
            "application/json",
          )
        ) {
          throw new Error(
            "The server returned an invalid response",
          );
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load enrolled courses",
          );
        }

        setEnrolledCourses(data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Enrolled courses error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load enrolled courses",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void getEnrolledCourses();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-pixel text-4xl font-bold">
          Your enrolled courses
        </h2>

        {enrolledCourses.length > 0 && (
          <Link
            href="/courses"
            className="font-pixel text-xl text-accent transition-colors hover:text-accent-hover"
          >
            View all courses
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse border border-accent/40 bg-card"
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="border-2 border-red-500 bg-red-500/10 p-6">
          <p className="font-pixel text-xl text-red-400">
            {error}
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        enrolledCourses.length === 0 && (
          <div className="flex w-full flex-col items-center justify-center gap-3 border border-accent px-8 py-8 shadow-[4px_4px_0_0_#FF8C00]">
            <Image
              src={bookCourses}
              width={90}
              height={90}
              alt="No enrolled courses"
            />

            <h3 className="text-center font-pixel text-3xl">
              You have not enrolled in any
              courses yet!
            </h3>

            <Link
              href="/courses"
              className="group relative overflow-hidden border bg-accent px-4 py-2 font-pixel text-3xl text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              <span
                aria-hidden="true"
                className="absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
              />

              <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                Browse all courses
              </span>
            </Link>
          </div>
        )}

      {!isLoading &&
        !error &&
        enrolledCourses.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {enrolledCourses.map(
              (course) => (
                <Link
                  key={course.enrollmentId}
                  href={`/courses/${course.courseId}`}
                  className="group flex min-h-32 overflow-hidden border-2 border-accent shadow-[4px_4px_0_0_#FF8C00]"
                >
                  <div className="relative w-32 shrink-0 overflow-hidden sm:w-40">
                    {/* Native img permits dynamic banner hosts. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.bannerImage}
                      alt={course.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    <div className="absolute inset-0" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="line-clamp-1 font-pixel text-2xl font-bold text-accent">
                          {course.title}
                        </h3>

                        <span className="shrink-0 bg-accent px-2 py-1 font-pixel text-sm text-black">
                          {course.level}
                        </span>
                      </div>

                      <p className="line-clamp-2 font-pixel text-base text-foreground/60">
                        {course.desc}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-pixel text-base text-foreground/50">
                        Continue course
                      </span>

                      <span className="font-pixel text-lg text-accent">
                        {course.xpEarned} XP
                      </span>
                    </div>
                  </div>
                </Link>
              ),
            )}
          </div>
        )}
    </section>
  );
}