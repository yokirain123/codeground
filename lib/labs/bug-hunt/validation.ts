import "server-only";

import { getBugHuntMission } from "./catalog";

export interface BugHuntValidationResult {
  valid: boolean;
  errors: string[];
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
}: {
  slug: string;
  code: string;
  stdout: string;
}): BugHuntValidationResult {
  const mission = getBugHuntMission(slug);

  if (!mission) {
    return { valid: false, errors: ["Bug Hunt mission not found."] };
  }

  const errors: string[] = [];
  const output = normalizeOutput(stdout);

  if (output !== mission.expectedOutput) {
    errors.push(
      `Expected \"${mission.expectedOutput}\", but the program printed \"${output || "nothing"}\".`,
    );
  }

  if (hasHardcodedExpectedOutput(code, mission.expectedOutput)) {
    errors.push("Fix the program logic instead of printing the expected answer directly.");
  }

  if (slug === "javascript-off-by-one") {
    if (!/index\s*<\s*numbers\.length/.test(code)) {
      errors.push("The loop boundary is still incorrect.");
    }
  } else if (slug === "javascript-discount") {
    if (!/discount\)?\s*\/\s*100/.test(code)) {
      errors.push("The percentage calculation still uses the wrong divisor.");
    }
  } else if (slug === "python-lost-accumulator") {
    if (!/total\s*\+=\s*number/.test(code)) {
      errors.push("The accumulator still replaces its previous value.");
    }
  } else if (slug === "python-missing-item") {
    if (/range\s*\(\s*len\s*\(\s*values\s*\)\s*-\s*1\s*\)/.test(code)) {
      errors.push("The loop still stops before the final item.");
    }
  } else if (slug === "csharp-backwards-operator") {
    if (!/lives\s*\+=\s*bonus/.test(code)) {
      errors.push("The assignment operator is still backwards.");
    }
  } else if (slug === "csharp-integer-average") {
    if (!/(?:\(double\)\s*sum|Convert\.ToDouble\s*\(\s*sum\s*\)|sum\s*\/\s*\(double\))/.test(code)) {
      errors.push("The division still happens entirely with integers.");
    }
  } else if (slug === "cpp-assignment-condition") {
    if (!/score\s*==\s*100/.test(code)) {
      errors.push("The condition still assigns instead of comparing.");
    }
  } else if (slug === "cpp-vector-boundary") {
    if (!/index\s*<\s*values\.size\s*\(\s*\)/.test(code)) {
      errors.push("The loop can still walk past the vector boundary.");
    }
  }

  return { valid: errors.length === 0, errors };
}
