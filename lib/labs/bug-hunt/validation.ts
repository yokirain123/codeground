import "server-only";

import type { Locale } from "@/lib/i18n/config";

import { getBugHuntMission } from "./catalog";

export interface BugHuntValidationResult {
  valid: boolean;
  errors: string[];
}

const UK_VALIDATION_MESSAGES: Record<string, string> = {
  "Bug Hunt mission not found.": "Місію Bug Hunt не знайдено.",
  "Fix the program logic instead of printing the expected answer directly.":
    "Виправ логіку програми, а не виводь очікувану відповідь напряму.",
  "The loop boundary is still incorrect.": "Межа циклу досі неправильна.",
  "The percentage calculation still uses the wrong divisor.":
    "Обчислення відсотка досі використовує неправильний дільник.",
  "The accumulator still replaces its previous value.":
    "Акумулятор досі замінює попереднє значення.",
  "The loop still stops before the final item.":
    "Цикл досі зупиняється перед останнім елементом.",
  "The assignment operator is still backwards.":
    "Оператор присвоєння досі записано навпаки.",
  "The division still happens entirely with integers.":
    "Ділення досі виконується лише з цілими числами.",
  "The condition still assigns instead of comparing.":
    "Умова досі присвоює значення замість порівняння.",
  "The loop can still walk past the vector boundary.":
    "Цикл досі може вийти за межі вектора.",
};

function localizeMessage(locale: Locale, message: string) {
  return locale === "uk" ? (UK_VALIDATION_MESSAGES[message] ?? message) : message;
}

function normalizeOutput(value: string) {
  return value.replaceAll("\r\n", "\n").trim();
}

function hasHardcodedExpectedOutput(code: string, expectedOutput: string) {
  const escaped = expectedOutput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`[\"'\\x60]${escaped}[\"'\\x60]`, "i").test(code);
}

export function validateBugHuntSolution({
  slug,
  code,
  stdout,
  locale = "en",
}: {
  slug: string;
  code: string;
  stdout: string;
  locale?: Locale;
}): BugHuntValidationResult {
  const mission = getBugHuntMission(slug);

  if (!mission) {
    return {
      valid: false,
      errors: [localizeMessage(locale, "Bug Hunt mission not found.")],
    };
  }

  const errors: string[] = [];
  const output = normalizeOutput(stdout);

  if (output !== mission.expectedOutput) {
    errors.push(
      locale === "uk"
        ? `Очікувалося «${mission.expectedOutput}», але програма вивела «${output || "нічого"}».`
        : `Expected \"${mission.expectedOutput}\", but the program printed \"${output || "nothing"}\".`,
    );
  }

  if (hasHardcodedExpectedOutput(code, mission.expectedOutput)) {
    errors.push(
      localizeMessage(
        locale,
        "Fix the program logic instead of printing the expected answer directly.",
      ),
    );
  }

  if (slug === "javascript-off-by-one") {
    if (!/index\s*<\s*numbers\.length/.test(code)) {
      errors.push(localizeMessage(locale, "The loop boundary is still incorrect."));
    }
  } else if (slug === "javascript-discount") {
    if (!/discount\)?\s*\/\s*100/.test(code)) {
      errors.push(
        localizeMessage(
          locale,
          "The percentage calculation still uses the wrong divisor.",
        ),
      );
    }
  } else if (slug === "python-lost-accumulator") {
    if (!/total\s*\+=\s*number/.test(code)) {
      errors.push(
        localizeMessage(
          locale,
          "The accumulator still replaces its previous value.",
        ),
      );
    }
  } else if (slug === "python-missing-item") {
    if (/range\s*\(\s*len\s*\(\s*values\s*\)\s*-\s*1\s*\)/.test(code)) {
      errors.push(
        localizeMessage(locale, "The loop still stops before the final item."),
      );
    }
  } else if (slug === "csharp-backwards-operator") {
    if (!/lives\s*\+=\s*bonus/.test(code)) {
      errors.push(
        localizeMessage(locale, "The assignment operator is still backwards."),
      );
    }
  } else if (slug === "csharp-integer-average") {
    if (
      !/(?:\(double\)\s*sum|Convert\.ToDouble\s*\(\s*sum\s*\)|sum\s*\/\s*\(double\))/.test(
        code,
      )
    ) {
      errors.push(
        localizeMessage(
          locale,
          "The division still happens entirely with integers.",
        ),
      );
    }
  } else if (slug === "cpp-assignment-condition") {
    if (!/score\s*==\s*100/.test(code)) {
      errors.push(
        localizeMessage(
          locale,
          "The condition still assigns instead of comparing.",
        ),
      );
    }
  } else if (slug === "cpp-vector-boundary") {
    if (!/index\s*<\s*values\.size\s*\(\s*\)/.test(code)) {
      errors.push(
        localizeMessage(
          locale,
          "The loop can still walk past the vector boundary.",
        ),
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
