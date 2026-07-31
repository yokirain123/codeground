"use client";

import axios from "axios";
import Image from "next/image";
import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

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
  onEnrollmentChange?: (
    isEnrolled: boolean,
  ) => void;
}

interface EnrollmentState {
  courseId: number | null;
  isEnrolled: boolean;
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error ??
      fallback
    );
  }

  return fallback;
}

export default function CourseDetailsBanner({
  course,
  loading = false,
  onEnrollmentChange,
}: CourseDetailsBannerProps) {
  const [
    isEnrolling,
    setIsEnrolling,
  ] = useState(false);

  const [
    isLeaving,
    setIsLeaving,
  ] = useState(false);

  const [error, setError] = useState("");

  const [
    enrollmentState,
    setEnrollmentState,
  ] = useState<EnrollmentState>({
    courseId: null,
    isEnrolled: false,
  });

  const courseId = course?.id;

  const isCheckingEnrollment =
    courseId !== undefined &&
    enrollmentState.courseId !== courseId;

  const isEnrolled =
    enrollmentState.courseId === courseId &&
    enrollmentState.isEnrolled;

  useEffect(() => {
    if (!courseId) {
      return;
    }

    const controller = new AbortController();

    const checkEnrollment = async () => {
      try {
        const response = await axios.get<{
          isEnrolled: boolean;
        }>("/api/enroll-course", {
          params: {
            courseId,
          },
          signal: controller.signal,
        });

        const enrollmentValue =
          response.data.isEnrolled;

        setEnrollmentState({
          courseId,
          isEnrolled: enrollmentValue,
        });

        onEnrollmentChange?.(
          enrollmentValue,
        );
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        console.error(
          "Enrollment check error:",
          error,
        );

        setEnrollmentState({
          courseId,
          isEnrolled: false,
        });

        onEnrollmentChange?.(false);
      }
    };

    void checkEnrollment();

    return () => {
      controller.abort();
    };
  }, [
    courseId,
    onEnrollmentChange,
  ]);

  const enrollCourse = async () => {
    if (
      !course ||
      isCheckingEnrollment ||
      isEnrolling ||
      isLeaving ||
      isEnrolled
    ) {
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

      const enrollmentValue =
        response.data.isEnrolled;

      setEnrollmentState({
        courseId: course.id,
        isEnrolled: enrollmentValue,
      });

      onEnrollmentChange?.(
        enrollmentValue,
      );

      toast.success("Course enrolled!", {
        description:
          "The exercises are now unlocked.",
      });
    } catch (error) {
      console.error(
        "Course enrollment error:",
        error,
      );

      const errorMessage =
        getErrorMessage(
          error,
          "Failed to enroll in course",
        );

      setError(errorMessage);

      toast.error("Enrollment failed", {
        description: errorMessage,
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const leaveCourse = async () => {
    if (
      !course ||
      isCheckingEnrollment ||
      isEnrolling ||
      isLeaving ||
      !isEnrolled
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to leave "${course.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsLeaving(true);
      setError("");

      await axios.delete(
        "/api/enroll-course",
        {
          params: {
            courseId: course.id,
          },
        },
      );

      setEnrollmentState({
        courseId: course.id,
        isEnrolled: false,
      });

      onEnrollmentChange?.(false);

      toast.success(
        "You left the course",
        {
          description:
            "The exercises are now locked.",
        },
      );
    } catch (error) {
      console.error(
        "Course unenrollment error:",
        error,
      );

      const errorMessage =
        getErrorMessage(
          error,
          "Failed to leave course",
        );

      setError(errorMessage);

      toast.error(
        "Could not leave course",
        {
          description: errorMessage,
        },
      );
    } finally {
      setIsLeaving(false);
    }
  };

  if (loading || !course) {
    return (
      <section className="flex min-h-[calc(40svh-50px)] items-center justify-center">
        <p className="font-pixel text-3xl text-accent">
          Loading course...
        </p>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-[calc(40svh-50px)] items-center justify-start overflow-hidden">
      <Image
        src={course.bannerImage}
        alt={course.title}
        fill
        priority
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

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {!isEnrolled ? (
            <Button
              type="button"
              variant="default"
              onClick={enrollCourse}
              disabled={
                isCheckingEnrollment ||
                isEnrolling ||
                isLeaving
              }
              className="group relative cursor-pointer overflow-hidden border bg-accent p-6 text-3xl text-black shadow-[4px_4px_0_0_#FF8C00] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent hover:shadow-[2px_2px_0_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-70"
            >
              <span
                aria-hidden="true"
                className="absolute top-full left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent-hover transition-transform duration-700 ease-in-out group-hover:scale-[18]"
              />

              <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
                {isCheckingEnrollment
                  ? "Checking..."
                  : isEnrolling
                    ? "Enrolling..."
                    : "Start course"}
              </span>
            </Button>
          ) : (
            <>
              <Button
                type="button"
                disabled
                className="border border-accent bg-accent p-6 font-pixel text-3xl text-black shadow-[4px_4px_0_0_#FF8C00] disabled:opacity-100"
              >
                Enrolled
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={leaveCourse}
                disabled={isLeaving}
                className="cursor-pointer border-2 border-red-500 bg-background px-4 py-6 font-pixel text-3xl text-red-400 shadow-[4px_4px_0_0_#991B1B] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-red-500 hover:text-white hover:shadow-[2px_2px_0_0_#991B1B] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-70"
              >
                {isLeaving
                  ? "Leaving..."
                  : "Leave course"}
              </Button>
            </>
          )}
        </div>

        {error && (
          <p className="mt-4 font-pixel text-xl text-red-400">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}