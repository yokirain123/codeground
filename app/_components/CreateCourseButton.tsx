"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/shadcn/button";
import { useI18n } from "@/components/i18n/I18nProvider";

export interface Course {
  id: number;
  title: string;
  desc: string;
  bannerImage: string;
  level: string;
  tags: string | null;
}

interface CreateCourseButtonProps {
  onCreated: (course: Course) => void;
}

const initialForm = {
  title: "",
  desc: "",
  bannerImage: "",
  level: "Beginner",
  tags: "",
};

export default function CreateCourseButton({
  onCreated,
}: CreateCourseButtonProps) {
  const { t, translateMessage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          desc: form.desc,
          bannerImage: form.bannerImage,
          level: form.level,
          tags: form.tags.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          translateMessage(data.error || t("Failed to create course")),
        );
      }

      const chaptersResponse = await fetch("/api/admin/save-chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: data.id,
        }),
      });

      const chaptersData = await chaptersResponse.json();

      if (!chaptersResponse.ok) {
        throw new Error(
          translateMessage(
            chaptersData.error ||
              t("Course created, but chapters were not created"),
          ),
        );
      }

      onCreated(data);
      setForm(initialForm);
      setIsOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? translateMessage(error.message)
          : t("Failed to create course"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative w-full cursor-pointer overflow-hidden border bg-accent px-4 py-3 font-pixel text-xl whitespace-normal text-black shadow-[4px_4px_0_0_#FF8C00] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-accent-hover hover:text-white hover:shadow-[2px_2px_0_0_#FF8C00] sm:w-auto sm:py-5 sm:text-2xl"
      >
        + {t("Create course")}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-4">
          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-xl border-2 border-accent bg-background p-4 shadow-[8px_8px_0_0_#FF8C00] sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="break-words font-pixel text-3xl text-accent sm:text-4xl">
                {t("Create course")}
              </h2>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-pixel text-3xl text-white transition-colors hover:text-accent"
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
                placeholder={t("Course title")}
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none focus:shadow-[3px_3px_0_0_#FF8C00]"
              />

              <textarea
                required
                value={form.desc}
                onChange={(event) =>
                  setForm({
                    ...form,
                    desc: event.target.value,
                  })
                }
                placeholder={t("Course description")}
                rows={5}
                className="resize-none border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none focus:shadow-[3px_3px_0_0_#FF8C00]"
              />

              <input
                required
                type="url"
                value={form.bannerImage}
                onChange={(event) =>
                  setForm({
                    ...form,
                    bannerImage: event.target.value,
                  })
                }
                placeholder={t("Banner image URL")}
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none focus:shadow-[3px_3px_0_0_#FF8C00]"
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
                <option value="Beginner">{t("Beginner")}</option>
                <option value="Intermediate">{t("Intermediate")}</option>
                <option value="Advanced">{t("Advanced")}</option>
              </select>

              <input
                value={form.tags}
                onChange={(event) =>
                  setForm({
                    ...form,
                    tags: event.target.value,
                  })
                }
                placeholder={t("Tags separated by commas")}
                className="border-2 border-accent bg-background px-4 py-3 font-pixel text-xl outline-none focus:shadow-[3px_3px_0_0_#FF8C00]"
              />
            </div>

            {error && (
              <p className="mt-4 font-pixel text-xl text-red-400">{error}</p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
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
                {isSubmitting ? t("Creating...") : t("Create course")}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
