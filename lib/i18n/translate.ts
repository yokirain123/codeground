import { INTL_LOCALES, type Locale } from "@/lib/i18n/config";
import {
  ukMessages,
  type TranslationKey,
} from "@/lib/i18n/messages/uk";

export type TranslationValues = Record<
  string,
  string | number | boolean | null | undefined
>;

export type Translate = (
  key: TranslationKey,
  values?: TranslationValues,
) => string;

function interpolate(template: string, values?: TranslationValues) {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = values[name];
    return value === null || value === undefined ? placeholder : String(value);
  });
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  values?: TranslationValues,
) {
  const template = locale === "uk" ? ukMessages[key] : key;
  return interpolate(template, values);
}

export function createTranslator(locale: Locale): Translate {
  return (key, values) => translate(locale, key, values);
}

export function translateRuntimeMessage(locale: Locale, message: string) {
  if (locale === "en") return message;

  return (ukMessages as Readonly<Record<string, string>>)[message] ?? message;
}

export function formatLocalizedDate(
  locale: Locale,
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
) {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(
    INTL_LOCALES[locale],
    options ?? {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
}

export function formatLocalizedNumber(
  locale: Locale,
  value: number,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(INTL_LOCALES[locale], options).format(value);
}
