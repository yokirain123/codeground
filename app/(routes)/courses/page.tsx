"use client";

import { useCallback, useContext, useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import CreateCourseButton, {
  type Course,
} from "@/app/_components/CreateCourseButton";
import EditCourseButton from "@/app/_components/EditCourseButton";
import Footer from "@/app/_components/Footer";
import CoursesIMG from "@/components/images/courseBG.png";
import { UserDetailContext } from "@/context/UserDetailContext";

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { userDetail } = useContext(UserDetailContext) as {
    userDetail?: { role: string };
  };

  const loadCourses = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/courses", {
      cache: "no-store",
      signal,
    });

    const data = (await response.json()) as Course[] | { error?: string };

    if (!response.ok || !Array.isArray(data)) {
      throw new Error(
        !Array.isArray(data) && data.error ? data.error : "Failed to load courses",
      );
    }

    setCourses(data);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        await loadCourses(controller.signal);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setError(error.message || "Could not load courses");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [loadCourses]);

  return (
    <main className="bg-[#07080C] text-white">
      <section className="relative flex min-h-[calc(50svh-64px)] items-center overflow-hidden">
        <Image
          src={CoursesIMG}
          alt=""
          fill
          priority
          className="-scale-x-100 object-cover opacity-45 saturate-[0.82]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_left,rgba(16,21,42,0.16)_0%,rgba(7,8,12,0.55)_38%,rgba(7,8,12,0.96)_100%)]" />

        <div className="relative z-10 max-w-3xl px-6 md:px-10 lg:px-14">
          <p className="font-pixel text-sm uppercase tracking-[0.28em] text-[#899DFF]">
            Course archive
          </p>
          <h1 className="mt-3 font-pixel text-4xl font-bold text-white [text-shadow:4px_4px_0_#28336B] md:text-7xl">
            Explore all{" "}
            <span className="text-[#FFD400] [text-shadow:4px_4px_0_#FF8C00]">
              courses
            </span>
          </h1>
          <p className="mt-5 font-sans text-lg text-white/65 md:text-xl">
            Choose a learning path and level up one quest at a time.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <h2 className="font-pixel text-4xl font-bold text-white">
            Available <span className="text-[#FFD400]">courses</span>
          </h2>

          {userDetail?.role === "admin" && (
            <CreateCourseButton
              onCreated={(course) => {
                setCourses((current) => [course, ...current]);

                void (async () => {
                  try {
                    const response = await fetch(
                      "/api/admin/save-chapters",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          courseId: course.id,
                        }),
                      },
                    );

                    const data = (await response.json()) as {
                      message?: string;
                      error?: string;
                    };

                    if (!response.ok) {
                      throw new Error(
                        data.error || "Failed to create course chapters",
                      );
                    }

                    toast.success("Course chapters created", {
                      description: data.message,
                    });
                  } catch (error) {
                    toast.error("Course created without chapters", {
                      description:
                        error instanceof Error
                          ? error.message
                          : "Open the course and try adding chapters again.",
                    });
                  }
                })();
              }}
            />
          )}
        </div>

        {isLoading && (
          <p className="font-pixel text-2xl text-[#899DFF]">
            Loading courses...
          </p>
        )}

        {error && (
          <div className="border border-red-500/40 bg-red-500/10 p-4 font-pixel text-xl text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && courses.length === 0 && (
          <div className="border-2 border-[#899DFF]/45 bg-[#10152A] p-8 text-center shadow-[6px_6px_0_0_#020307]">
            <p className="font-pixel text-2xl">There are no courses yet.</p>
          </div>
        )}

        {!isLoading && courses.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="group relative h-full overflow-hidden border-2 border-[#899DFF]/45 bg-[#10152A] shadow-[6px_6px_0_0_#020307] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:border-[#FFD400]/70 hover:shadow-[3px_3px_0_0_#020307]"
              >
                {userDetail?.role === "admin" && (
                  <div className="absolute top-3 left-3 z-20">
                    <EditCourseButton
                      course={course}
                      onUpdated={(updatedCourse) => {
                        setCourses((current) =>
                          current.map((item) =>
                            item.id === updatedCourse.id ? updatedCourse : item,
                          ),
                        );
                      }}
                    />
                  </div>
                )}

                <Link href={`/courses/${course.id}`} className="block h-full">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={course.bannerImage}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07080C] via-[#07080C]/30 to-transparent" />
                    <span className="absolute right-3 bottom-3 border-2 border-black bg-[#FFD400] px-3 py-1 font-pixel text-lg text-black shadow-[3px_3px_0_#FF8C00]">
                      {course.level}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-pixel text-3xl font-bold text-white">
                      {course.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-base leading-6 text-white/60">
                      {course.desc}
                    </p>

                    {course.tags && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {course.tags
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="border border-[#899DFF]/40 bg-[#899DFF]/5 px-2 py-1 font-pixel text-sm text-[#899DFF]"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
