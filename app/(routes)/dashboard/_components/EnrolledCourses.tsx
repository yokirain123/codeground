"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import bookCourses from "@/components/images/book.gif";
import { useI18n } from "@/components/i18n/I18nProvider";

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

interface EnrolledCoursesResponse {
  error?: string;
}

export default function EnrolledCourses() {
  const { locale, t, formatNumber } = useI18n();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const getEnrolledCourses = async () => {
      try {
        setError("");

        const response = await fetch("/api/enrolled-courses", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          throw new Error(t("The server returned an invalid response"));
        }

        const data: EnrolledCourse[] | EnrolledCoursesResponse =
          await response.json();

        if (!response.ok) {
          const message = Array.isArray(data) ? undefined : data.error;
          throw new Error(message || t("Failed to load enrolled courses"));
        }

        if (!Array.isArray(data)) {
          throw new Error(
            t("The enrolled courses response has an invalid format"),
          );
        }

        if (!controller.signal.aborted) {
          setEnrolledCourses(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Enrolled courses error:", error);

        if (!controller.signal.aborted) {
          setError(
            locale === "uk"
              ? t("Failed to load enrolled courses")
              : error instanceof Error
                ? error.message
                : t("Failed to load enrolled courses"),
          );
        }
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
  }, [locale, t]);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="font-pixel text-xs uppercase tracking-[0.22em] text-[#899DFF]">
            {t("Active quest lines")}
          </p>
          <h2 className="mt-1 font-pixel text-3xl font-bold text-white sm:text-4xl">
            {t("Your enrolled")}{" "}
            <span className="text-[#FFD400]">{t("courses")}</span>
          </h2>
        </div>

        {enrolledCourses.length > 0 && (
          <Link
            href="/courses"
            className="font-pixel text-base text-[#899DFF] transition-colors hover:text-[#FFD400] sm:text-lg"
          >
            {t("View all courses →")}
          </Link>
        )}
      </div>

      {isLoading && (
        <div
          className="grid gap-5 xl:grid-cols-2"
          aria-label={t("Loading courses")}
        >
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-44 animate-pulse border-2 border-[#899DFF]/20 bg-[#10152A]"
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="border border-red-500/40 bg-red-500/10 p-5" role="alert">
          <p className="font-pixel text-lg text-red-400">{error}</p>
        </div>
      )}

      {!isLoading && !error && enrolledCourses.length === 0 && (
        <div className="flex w-full flex-col items-center justify-center gap-4 border-2 border-[#899DFF]/45 bg-[#10152A] px-6 py-8 text-center shadow-[5px_5px_0_#020307]">
          <Image
            src={bookCourses}
            width={90}
            height={90}
            unoptimized
            alt={t("An open course book")}
            className="[image-rendering:pixelated]"
          />

          <div>
            <h3 className="font-pixel text-2xl text-white sm:text-3xl">
              {t("Your quest log is empty")}
            </h3>
            <p className="mt-2 font-sans text-sm text-white/50 sm:text-base">
              {t(
                "Enroll in a course to begin earning XP and tracking your progress.",
              )}
            </p>
          </div>

          <Link
            href="/courses"
            className="group relative overflow-hidden border-2 border-black bg-[#FFD400] px-5 py-3 font-pixel text-xl text-black shadow-[4px_4px_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none sm:text-2xl"
          >
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#FF8C00] transition-transform duration-700 group-hover:scale-[18]"
            />
            <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
              {t("Browse all courses")}
            </span>
          </Link>
        </div>
      )}

      {!isLoading && !error && enrolledCourses.length > 0 && (
        <div className="grid gap-5 xl:grid-cols-2">
          {enrolledCourses.map((course) => (
            <Link
              key={course.enrollmentId}
              href={`/courses/${course.courseId}`}
              className="group flex min-h-44 flex-col overflow-hidden border-2 border-[#899DFF]/45 bg-[#10152A] shadow-[5px_5px_0_#020307] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:border-[#FFD400]/70 hover:shadow-[3px_3px_0_#020307] sm:flex-row"
            >
              <div className="relative aspect-video w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-40">
                {/* Native img permits dynamic banner hosts. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.bannerImage}
                  alt={course.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080C]/75 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#10152A]/35" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                <div>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-1 font-pixel text-2xl font-bold text-white">
                      {course.title}
                    </h3>

                    <span className="shrink-0 border border-[#FFD400]/35 bg-[#FFD400]/10 px-2 py-1 font-pixel text-xs text-[#FFD400]">
                      {course.level === "Beginner"
                        ? t("Beginner")
                        : course.level === "Intermediate"
                          ? t("Intermediate")
                          : course.level === "Advanced"
                            ? t("Advanced")
                            : course.level}
                    </span>
                  </div>

                  <p className="line-clamp-2 font-sans text-sm leading-6 text-white/55">
                    {course.desc}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <span className="font-pixel text-sm text-[#899DFF]">
                    {t("Continue course →")}
                  </span>
                  <span className="font-pixel text-base text-[#FFD400]">
                    {formatNumber(Math.max(0, course.xpEarned))} XP
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
