"use client";

import { useEffect, useState } from "react";

import axios from "axios";
import Image from "next/image";
import { toast } from "sonner";

import { useI18n } from "@/components/i18n/I18nProvider";
import TokenStateScreen from "@/components/TokenStateScreen";
import { Button } from "@/components/ui/shadcn/button";

interface Course {
  id: number;
  bannerImage: string;
  title: string;
  level: string;
  desc: string;
}

interface CourseDetailsBannerProps {
  loading?: boolean;
  course: Course | null;
  onEnrollmentChange?: (isEnrolled: boolean) => void;
}

interface EnrollmentState {
  courseId: number | null;
  isEnrolled: boolean;
}

interface ApiErrorResponse {
  error?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function CourseDetailsBanner({
  course,
  loading = false,
  onEnrollmentChange,
}: CourseDetailsBannerProps) {
  const { t, translateMessage } = useI18n();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState("");
  const [enrollmentState, setEnrollmentState] = useState<EnrollmentState>({
    courseId: null,
    isEnrolled: false,
  });

  const courseId = course?.id;
  const isCheckingEnrollment =
    courseId !== undefined && enrollmentState.courseId !== courseId;
  const isEnrolled =
    enrollmentState.courseId === courseId && enrollmentState.isEnrolled;
  const isBusy = isCheckingEnrollment || isEnrolling || isLeaving;

  useEffect(() => {
    if (!courseId) {
      return;
    }

    const controller = new AbortController();

    const checkEnrollment = async () => {
      try {
        setError("");

        const response = await axios.get<{ isEnrolled: boolean }>(
          "/api/enroll-course",
          {
            params: { courseId },
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        const enrollmentValue = response.data.isEnrolled;

        setEnrollmentState({
          courseId,
          isEnrolled: enrollmentValue,
        });
        onEnrollmentChange?.(enrollmentValue);
      } catch (error) {
        if (axios.isCancel(error) || controller.signal.aborted) {
          return;
        }

        console.error("Enrollment check error:", error);

        const errorMessage = translateMessage(
          getErrorMessage(error, t("Could not check your enrollment status")),
        );

        setEnrollmentState({
          courseId,
          isEnrolled: false,
        });
        setError(errorMessage);
        onEnrollmentChange?.(false);
      }
    };

    void checkEnrollment();

    return () => {
      controller.abort();
    };
  }, [courseId, onEnrollmentChange, t, translateMessage]);

  const enrollCourse = async () => {
    if (!course || isBusy || isEnrolled) {
      return;
    }

    try {
      setIsEnrolling(true);
      setError("");

      const response = await axios.post<{
        isEnrolled: boolean;
        message?: string;
      }>("/api/enroll-course", {
        courseId: course.id,
      });

      if (!response.data.isEnrolled) {
        throw new Error(
          response.data.message || t("Failed to enroll in course"),
        );
      }

      setEnrollmentState({
        courseId: course.id,
        isEnrolled: true,
      });
      onEnrollmentChange?.(true);

      toast.success(t("Course enrolled!"), {
        description: t("The exercises are now unlocked."),
      });
    } catch (error) {
      console.error("Course enrollment error:", error);

      const errorMessage = translateMessage(
        getErrorMessage(error, t("Failed to enroll in course")),
      );

      setError(errorMessage);
      toast.error(t("Enrollment failed"), {
        description: errorMessage,
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const leaveCourse = async () => {
    if (!course || isBusy || !isEnrolled) {
      return;
    }

    const confirmed = window.confirm(
      t('Are you sure you want to leave "{course}"?', {
        course: course.title,
      }),
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsLeaving(true);
      setError("");

      await axios.delete("/api/enroll-course", {
        params: { courseId: course.id },
      });

      setEnrollmentState({
        courseId: course.id,
        isEnrolled: false,
      });
      onEnrollmentChange?.(false);

      toast.success(t("You left the course"), {
        description: t("The exercises are now locked."),
      });
    } catch (error) {
      console.error("Course unenrollment error:", error);

      const errorMessage = translateMessage(
        getErrorMessage(error, t("Failed to leave course")),
      );

      setError(errorMessage);
      toast.error(t("Could not leave course"), {
        description: errorMessage,
      });
    } finally {
      setIsLeaving(false);
    }
  };

  if (loading || !course) {
    return <TokenStateScreen mode="loading" />;
  }

  return (
    <section className="relative flex min-h-[calc(46svh-50px)] items-center justify-start overflow-hidden bg-[#07080C] text-white">
      <Image
        src={course.bannerImage}
        alt={course.title}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-70 saturate-[0.88]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_left,rgba(16,21,42,0.08)_0%,rgba(7,8,12,0.55)_40%,rgba(7,8,12,0.97)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,8,12,0.18)_0%,transparent_45%,rgba(7,8,12,0.88)_100%)]" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-start px-4 py-10 text-left sm:px-6 sm:py-12 md:px-10 lg:px-14">
        <span className="mb-4 border-2 border-black bg-[#FFD400] px-3 py-1 font-pixel text-lg text-black shadow-[3px_3px_0_#FF8C00] md:text-xl">
          {course.level === "Beginner"
            ? t("Beginner")
            : course.level === "Intermediate"
              ? t("Intermediate")
              : course.level === "Advanced"
                ? t("Advanced")
                : course.level}
        </span>

        <h1 className="break-words font-pixel text-3xl font-bold text-white [text-shadow:4px_4px_0_#28336B] sm:text-5xl md:text-7xl">
          {course.title}
        </h1>

        <p className="mt-5 max-w-2xl font-sans text-base leading-7 text-white/65 md:text-xl md:leading-8">
          {course.desc}
        </p>

        <div className="mt-7 flex w-full flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          {!isEnrolled ? (
            <Button
              type="button"
              variant="default"
              onClick={enrollCourse}
              disabled={isBusy}
              className="group relative h-auto w-full cursor-pointer overflow-hidden border-2 border-black bg-[#FFD400] px-6 py-3 font-pixel text-xl whitespace-normal text-black shadow-[4px_4px_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#FFD400] hover:shadow-[2px_2px_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-60 sm:w-auto md:text-2xl"
            >
              <span
                aria-hidden="true"
                className="absolute top-full left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#FF8C00] transition-transform duration-700 ease-in-out group-hover:scale-[18]"
              />

              <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                {isCheckingEnrollment
                  ? t("Checking...")
                  : isEnrolling
                    ? t("Enrolling...")
                    : t("Start course")}
              </span>
            </Button>
          ) : (
            <>
              <div className="w-full border-2 border-[#6FFFA2]/50 bg-[#6FFFA2]/10 px-6 py-3 text-center font-pixel text-xl text-[#6FFFA2] sm:w-auto md:text-2xl">
                {t("Enrolled")} ✓
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={leaveCourse}
                disabled={isLeaving}
                className="h-auto w-full cursor-pointer border-2 border-red-500/70 bg-[#07080C]/80 px-5 py-3 font-pixel text-xl whitespace-normal text-red-400 shadow-[4px_4px_0_#7F1D1D] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-red-500 hover:text-white hover:shadow-[2px_2px_0_#7F1D1D] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-60 sm:w-auto md:text-2xl"
              >
                {isLeaving ? t("Leaving...") : t("Leave course")}
              </Button>
            </>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 border border-red-400/30 bg-red-400/10 px-4 py-3 font-pixel text-base text-red-400 md:text-lg"
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
