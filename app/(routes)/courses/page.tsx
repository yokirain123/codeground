"use client";

import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

import CoursesIMG from "@/components/images/courseBG.png";
import { UserDetailContext } from "@/context/UserDetailContext";

import EditCourseButton from "@/app/_components/EditCourseButton";

import CreateCourseButton, {
  type Course,
} from "@/app/_components/CreateCourseButton";

function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { userDetail } = useContext(UserDetailContext) as {
    userDetail?: { role: string };
  };

  useEffect(() => {
    const controller = new AbortController();

    const getCourses = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/courses", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load courses");
        }

        const data: Course[] = await response.json();

        setCourses(data);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error);
          setError("Could not load courses");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void getCourses();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main>
      <section className="relative flex min-h-[calc(50svh-64px)] items-center justify-start overflow-hidden">
        <Image
          src={CoursesIMG}
          alt=""
          fill
          priority
          className="-scale-x-100 object-cover opacity-50"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_left,transparent_0%,rgba(0,0,0,0.4)_30%,rgba(0,0,0,0.85)_100%)]" />

        <div className="relative z-10 flex max-w-3xl flex-col items-start px-6 text-left md:px-10 lg:px-14">
          <h1 className="font-pixel text-4xl font-bold text-accent [text-shadow:2px_2px_0_#000] md:text-7xl">
            Explore all courses
          </h1>

          <p className="mt-4 font-pixel text-xl text-white/80 [text-shadow:2px_2px_0_#000] md:text-2xl">
            Explore all courses and enroll to learn and increase your skills!
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-pixel text-4xl font-bold text-accent">
            Available courses
          </h2>

          {userDetail?.role === "admin" && (
            <CreateCourseButton
              onCreated={(course) => {
                setCourses((currentCourses) => [course, ...currentCourses]);
              }}
            />
          )}
        </div>

        {isLoading && (
          <p className="font-pixel text-2xl text-white/70">
            Loading courses...
          </p>
        )}

        {error && (
          <div className="border border-red-500 bg-red-500/10 p-4 font-pixel text-xl text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && courses.length === 0 && (
          <div className="border border-accent p-8 text-center shadow-[4px_4px_0_0_#FF8C00]">
            <p className="font-pixel text-2xl">There are no courses yet.</p>
          </div>
        )}
{!isLoading && !error && courses.length > 0 && (
  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    {courses.map((course) => (
      <article
        key={course.id}
        className="group relative h-full overflow-hidden border border-accent bg-card shadow-[6px_6px_0_0_#FF8C00] transition-all duration-300 hover:shadow-[4px_4px_0_0_#FF8C00]"
      >
        {userDetail?.role === "admin" && (
          <div className="absolute top-3 left-3 z-20">
            <EditCourseButton
              course={course}
              onUpdated={(updatedCourse) => {
                setCourses((currentCourses) =>
                  currentCourses.map(
                    (currentCourse) =>
                      currentCourse.id ===
                      updatedCourse.id
                        ? updatedCourse
                        : currentCourse,
                  ),
                );
              }}
            />
          </div>
        )}

        <Link
          href={`/courses/${course.id}`}
          className="block h-full"
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={course.bannerImage}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            <span className="absolute right-3 bottom-3 bg-accent px-3 py-1 font-pixel text-lg text-black">
              {course.level}
            </span>
          </div>

          <div className="flex flex-col p-5">
            <h3 className="font-pixel text-3xl font-bold text-accent">
              {course.title}
            </h3>

            <p className="mt-2 line-clamp-3 font-pixel text-xl text-foreground/70">
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
                      className="border border-accent px-2 py-1 font-pixel text-sm text-accent"
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
    </main>
  );
}

export default Courses;
