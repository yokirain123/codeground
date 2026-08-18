import "server-only";

import { cookies, headers } from "next/headers";

import {
  LOCALE_COOKIE_NAME,
  localeFromAcceptLanguage,
  normalizeLocale,
} from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/translate";

export async function getServerLocale() {
  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value,
  );

  if (cookieLocale) {
    return cookieLocale;
  }

  const headerStore = await headers();
  return localeFromAcceptLanguage(headerStore.get("accept-language"));
}

export async function getServerI18n() {
  const locale = await getServerLocale();

  return {
    locale,
    t: createTranslator(locale),
  };
}
