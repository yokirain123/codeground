"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  HTML_LOCALES,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/lib/i18n/config";
import {
  createTranslator,
  formatLocalizedDate,
  formatLocalizedNumber,
  translateRuntimeMessage,
  type Translate,
} from "@/lib/i18n/translate";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
  formatDate: (
    value: Date | string | number,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  translateMessage: (message: string) => string;
  isChangingLocale: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isChangingLocale, startTransition] = useTransition();

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) {
        return;
      }

      setLocaleState(nextLocale);
      document.documentElement.lang = HTML_LOCALES[nextLocale];
      document.cookie = [
        LOCALE_COOKIE_NAME + "=" + nextLocale,
        "Path=/",
        "Max-Age=31536000",
        "SameSite=Lax",
      ].join("; ");
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);

      startTransition(() => {
        router.refresh();
      });
    },
    [locale, router],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: createTranslator(locale),
      formatDate: (date, options) =>
        formatLocalizedDate(locale, date, options),
      formatNumber: (number, options) =>
        formatLocalizedNumber(locale, number, options),
      translateMessage: (message) => translateRuntimeMessage(locale, message),
      isChangingLocale,
    }),
    [isChangingLocale, locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
