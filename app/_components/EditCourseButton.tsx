"use client";

import {
  type FormEvent,
  useState,
} from "react";
import { Pencil } from "lucide-react";

import type { Course } from "./CreateCourseButton";
import { Button } from "@/components/ui/shadcn/button";

interface EditCourseButtonProps {
  course: Course;
  onUpdated: (course: Course) => void;
}

function getInitialForm(course: Course) {
  return {
    title: course.title,
    desc: course.desc,
    bannerImage: course.bannerImage,
    level: course.level,
    tags: course.tags ?? "",
  };
}

export default function EditCourseButton({
  course,
  onUpdated,
}: EditCourseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() =>
    getInitialForm(course),
  );

const openModal = () => {
  setForm(getInitialForm(course));
  setError("");
  setIsOpen(true);
};

  const closeModal = () => {
    setIsOpen(false);
    setError("");
    setForm(getInitialForm(course));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/courses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: course.id,
          title: form.title,
          desc: form.desc,
          bannerImage: form.bannerImage,
          level: form.level,
          tags: form.tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to edit course",
        );
      }

      onUpdated(data);
      setIsOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to edit course",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={openModal}
        className="border bg-accent px-3 py-2 font-pixel text-lg text-black shadow-[3px_3px_0_0_#FF8C00] hover:bg-accent-hover hover:text-white"
      >
        <Pencil className="size-4" />
        Edit
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl border-2 border-accent bg-background p-6 shadow-[8px_8px_0_0_#FF8C00]"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-pixel text-4xl text-accent">
                Edit course
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="font-pixel text-3xl hover:text-accent"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                placeholder="Course title"
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none"
              />

              <textarea
                required
                rows={5}
                value={form.desc}
                onChange={(event) =>
                  setForm({
                    ...form,
                    desc: event.target.value,
                  })
                }
                placeholder="Course description"
                className="resize-none border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none"
              />

              <input
                required
                type="url"
                value={form.bannerImage}
                onChange={(event) =>
                  setForm({
                    ...form,
                    bannerImage:
                      event.target.value,
                  })
                }
                placeholder="Banner image URL"
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none"
              />

              <select
                value={form.level}
                onChange={(event) =>
                  setForm({
                    ...form,
                    level: event.target.value,
                  })
                }
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none"
              >
                <option value="Beginner">
                  Beginner
                </option>

                <option value="Intermediate">
                  Intermediate
                </option>

                <option value="Advanced">
                  Advanced
                </option>
              </select>

              <input
                value={form.tags}
                onChange={(event) =>
                  setForm({
                    ...form,
                    tags: event.target.value,
                  })
                }
                placeholder="Tags separated by commas"
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none"
              />
            </div>

            {error && (
              <p className="mt-4 font-pixel text-xl text-red-400">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent font-pixel text-xl text-black hover:bg-accent-hover hover:text-white"
              >
                {isSubmitting
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}