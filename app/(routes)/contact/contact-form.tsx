"use client";

import { type FormEvent, useState } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";

const categories = ["Question", "Bug report", "Course idea", "Other"];
const maxMessageLength = 2000;

interface ContactFormValues {
  name: string;
  contact: string;
  category: string;
  message: string;
  website: string;
}

const initialValues: ContactFormValues = {
  name: "",
  contact: "",
  category: categories[0],
  message: "",
  website: "",
};

/**
 * Renders a support request form that submits messages to the contact API.
 */
export default function ContactForm() {
  const { t, formatNumber } = useI18n();
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field: keyof ContactFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));

    if (successMessage) setSuccessMessage("");
    if (errorMessage) setErrorMessage("");
  };

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? t("The message could not be sent."));
      }

      setValues(initialValues);
      setSuccessMessage(
        payload?.message ??
          t("Message delivered. The Quest Master will reply soon."),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("The message could not be sent. Please try again."),
      );
    } finally {
      setIsSending(false);
    }
  };

  const fieldStyles =
    "mt-2 h-12 w-full rounded-none border border-[#899DFF]/35 bg-black/25 px-4 font-sans text-white outline-none transition-colors placeholder:text-white/25 hover:border-[#899DFF]/60 focus:border-[#FFD400] focus:ring-2 focus:ring-[#FFD400]/20 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <section
      id="contact-form"
      className="relative scroll-mt-20 border-t border-white/10 bg-[#0C0E15] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#899DFF_1px,transparent_1px),linear-gradient(to_bottom,#899DFF_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#899DFF]">
            {t("Contact terminal")}
          </p>
          <h2 className="mt-3 break-words font-pixel text-4xl leading-none sm:text-7xl">
            {t("Send your")} <span className="text-[#FFD400]">{t("message")}</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/55 sm:text-lg">
            {t(
              "The form sends your request to the private CodeQuest Telegram inbox. Leave a Telegram username or email so you can receive a reply.",
            )}
          </p>

          <div className="mt-8 space-y-3 border-l-2 border-[#899DFF] pl-5 font-mono text-sm text-white/45">
            <p>
              <span className="mr-2 text-[#FFD400]">01</span>{" "}
              {t("Choose a request type")}
            </p>
            <p>
              <span className="mr-2 text-[#FFD400]">02</span>{" "}
              {t("Describe what happened")}
            </p>
            <p>
              <span className="mr-2 text-[#FFD400]">03</span>{" "}
              {t("Bot delivers it privately")}
            </p>
          </div>
        </div>

        <div className="relative border-2 border-[#899DFF]/45 bg-[#10152A] p-1 shadow-[8px_8px_0_#020307]">
          <span
            aria-hidden="true"
            className="absolute -top-2 -left-2 size-7 border-t-2 border-l-2 border-[#FFD400]"
          />
          <span
            aria-hidden="true"
            className="absolute -right-2 -bottom-2 size-7 border-r-2 border-b-2 border-[#FFD400]"
          />

          <form
            onSubmit={submitMessage}
            className="border border-white/10 p-4 sm:p-7"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#899DFF]">
                  {t("New support request")}
                </p>
                <h3 className="mt-1 font-pixel text-3xl text-white">
                  {t("Player message")}
                </h3>
              </div>
              <span className="font-mono text-xs text-[#FFD400]">
                ● {t("READY")}
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="font-mono text-xs uppercase tracking-[0.14em] text-white/55">
                {t("Your name")}
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  value={values.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  disabled={isSending}
                  placeholder={t("Player name")}
                  className={fieldStyles}
                />
              </label>

              <label className="font-mono text-xs uppercase tracking-[0.14em] text-white/55">
                {t("Reply contact")}
                <input
                  type="text"
                  name="contact"
                  autoComplete="email"
                  required
                  minLength={3}
                  maxLength={120}
                  pattern="(?:@[A-Za-z0-9_]{5,32}|[^\\s@]+@[^\\s@]+\\.[^\\s@]+)"
                  title={t(
                    "Enter a Telegram username such as @username or a valid email address.",
                  )}
                  value={values.contact}
                  onChange={(event) =>
                    updateField("contact", event.target.value)
                  }
                  disabled={isSending}
                  placeholder={t("@username or email")}
                  className={fieldStyles}
                />
              </label>
            </div>

            <label className="mt-5 block font-mono text-xs uppercase tracking-[0.14em] text-white/55">
              {t("Request type")}
              <select
                name="category"
                value={values.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                disabled={isSending}
                className={`${fieldStyles} cursor-pointer appearance-none`}
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-[#10152A]"
                  >
                    {category === "Question"
                      ? t("Question")
                      : category === "Bug report"
                        ? t("Bug report")
                        : category === "Course idea"
                          ? t("Course idea")
                          : t("Other")}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 block font-mono text-xs uppercase tracking-[0.14em] text-white/55">
              {t("Message")}
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={maxMessageLength}
                rows={7}
                value={values.message}
                onChange={(event) => updateField("message", event.target.value)}
                disabled={isSending}
                placeholder={t(
                  "Tell us what happened or what you would like to suggest...",
                )}
                className={`${fieldStyles} h-auto resize-y py-3 leading-7`}
              />
            </label>

            <div className="mt-2 flex justify-end font-mono text-[10px] text-white/30">
              {formatNumber(values.message.length)}/{formatNumber(maxMessageLength)}
            </div>

            <label className="absolute -left-[9999px]" aria-hidden="true">
              {t("Website")}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(event) => updateField("website", event.target.value)}
              />
            </label>

            <div aria-live="polite" className="mt-5 min-h-6">
              {successMessage && (
                <p className="border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 font-mono text-sm text-emerald-300">
                  {successMessage}
                </p>
              )}
              {errorMessage && (
                <p
                  role="alert"
                  className="border border-red-400/30 bg-red-400/10 px-4 py-3 font-mono text-sm text-red-300"
                >
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-xs leading-5 text-white/35">
                {t(
                  "Your message is only used to answer this request. The bot token remains on the server.",
                )}
              </p>

              <button
                type="submit"
                disabled={isSending}
                className="group relative h-auto min-h-12 w-full cursor-pointer overflow-hidden rounded-none border-2 border-black bg-[#FFD400] px-6 py-2 font-pixel text-xl whitespace-normal text-black shadow-[4px_4px_0_#FF8C00] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#FF8C00] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-44 sm:text-2xl"
              >
                {isSending ? t("Sending...") : t("Send message ▶")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
