"use client";

import {
  type FormEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/shadcn/button";
import { useI18n } from "@/components/i18n/I18nProvider";

import type { Course } from "./CreateCourseButton";

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

/**
 * Provides a control for editing a course in a modal form.
 *
 * @param course - The course to edit.
 * @param onUpdated - Callback invoked with the updated course after a successful save.
 * @returns The edit button and modal interface.
 */
export default function EditCourseButton({
  course,
  onUpdated,
}: EditCourseButtonProps) {
  const { t, translateMessage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() =>
    getInitialForm(course),
  );

  const openModal = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setForm(getInitialForm(course));
    setError("");
    setIsOpen(true);
  };

  const closeModal = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
    setError("");
    setForm(getInitialForm(course));
  }, [course, isSubmitting]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [closeModal, isOpen]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch(
        "/api/courses",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: course.id,
            title: form.title,
            desc: form.desc,
            bannerImage: form.bannerImage,
            level: form.level,
            tags: form.tags,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          translateMessage(data.error || t("Failed to edit course")),
        );
      }

      onUpdated(data);
      setIsOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? translateMessage(error.message)
          : t("Failed to edit course"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const modal = isOpen
    ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`edit-course-${course.id}`}
          onClick={(event) => {
            event.stopPropagation();

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-4"
        >
          <form
            onSubmit={handleSubmit}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="my-auto w-full max-w-xl border-2 border-accent bg-background p-4 text-foreground shadow-[8px_8px_0_0_#FF8C00] sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2
                id={`edit-course-${course.id}`}
                className="break-words font-pixel text-3xl text-accent sm:text-4xl"
              >
                {t("Edit course")}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label={t("Close modal")}
                className="cursor-pointer font-pixel text-3xl transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title:
                      event.target.value,
                  }))
                }
                placeholder={t("Course title")}
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none"
              />

              <textarea
                required
                rows={5}
                value={form.desc}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    desc: event.target.value,
                  }))
                }
                placeholder={t("Course description")}
                className="resize-none border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none"
              />

              <input
                required
                type="url"
                value={form.bannerImage}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bannerImage:
                      event.target.value,
                  }))
                }
                placeholder={t("Banner image URL")}
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none"
              />

              <select
                value={form.level}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    level:
                      event.target.value,
                  }))
                }
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none"
              >
                <option value="Beginner">
                  {t("Beginner")}
                </option>
                <option value="Intermediate">
                  {t("Intermediate")}
                </option>
                <option value="Advanced">
                  {t("Advanced")}
                </option>
              </select>

              <input
                value={form.tags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
                placeholder={t("Tags separated by commas")}
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none"
              />
            </div>

            {error && (
              <p className="mt-4 font-pixel text-xl text-red-400">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
                className="h-11 w-full sm:w-auto"
              >
                {t("Cancel")}
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full bg-accent font-pixel text-xl whitespace-normal text-black hover:bg-accent-hover hover:text-white sm:w-auto"
              >
                {isSubmitting
                  ? t("Saving...")
                  : t("Save changes")}
              </Button>
            </div>
          </form>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <Button
        type="button"
        onClick={openModal}
        className="border bg-accent px-3 py-2 font-pixel text-lg text-black shadow-[3px_3px_0_0_#FF8C00] hover:bg-accent-hover hover:text-white"
      >
        <Pencil className="size-4" />
        {t("Edit")}
      </Button>

      {modal}
    </>
  );
}
