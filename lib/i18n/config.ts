export const SUPPORTED_LOCALES = ["en", "uk"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "codequest_locale";
export const LOCALE_STORAGE_KEY = "codequest_locale";

export const HTML_LOCALES: Record<Locale, string> = {
  en: "en",
  uk: "uk",
};

export const INTL_LOCALES: Record<Locale, string> = {
  en: "en-US",
  uk: "uk-UA",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace("_", "-");
  const language = normalized.split("-")[0];

  return isLocale(language) ? language : null;
}

export function localeFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
): Locale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  const preferences = acceptLanguage
    .split(",")
    .map((part) => {
      const [language, ...parameters] = part.trim().split(";");
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const quality = qualityParameter
        ? Number.parseFloat(qualityParameter.trim().slice(2))
        : 1;

      return {
        locale: normalizeLocale(language),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter(
      (preference): preference is { locale: Locale; quality: number } =>
        Boolean(preference.locale),
    )
    .sort((left, right) => right.quality - left.quality);

  return preferences[0]?.locale ?? DEFAULT_LOCALE;
}
