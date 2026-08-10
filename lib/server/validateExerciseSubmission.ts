export type SubmissionFiles = Record<string, string>;

interface ValidationResult {
  valid: boolean;
  message: string;
}

interface ValidateSubmissionInput {
  files: SubmissionFiles;
  starterCode: SubmissionFiles;
  validationRegex: string;
}

const MAX_FILES = 20;
const MAX_FILE_SIZE = 100_000;
const MAX_TOTAL_SIZE = 250_000;

function normalizeFilename(filename: string) {
  const normalized = filename.trim().replaceAll("\\", "/");

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function normalizeCode(code: string) {
  return code.replaceAll("\r\n", "\n").trim();
}

export function parseSubmissionFiles(value: unknown): SubmissionFiles | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const entries = Object.entries(value);

  if (entries.length === 0 || entries.length > MAX_FILES) {
    return null;
  }

  const files: SubmissionFiles = {};
  let totalSize = 0;

  for (const [rawFilename, rawCode] of entries) {
    if (
      typeof rawCode !== "string" ||
      !rawFilename.trim() ||
      rawCode.length > MAX_FILE_SIZE
    ) {
      return null;
    }

    totalSize += rawCode.length;

    if (totalSize > MAX_TOTAL_SIZE) {
      return null;
    }

    files[normalizeFilename(rawFilename)] = rawCode;
  }

  return files;
}

function getRegexSourceAndFlags(value: string) {
  let source = value.trim();
  const flags = new Set<string>();

  const inlineFlags = source.match(/^\(\?([dgimsuvy]+)\)/);

  if (inlineFlags) {
    source = source.slice(inlineFlags[0].length);

    for (const flag of inlineFlags[1]) {
      flags.add(flag);
    }
  }

  // Global/sticky expressions change lastIndex between calls and are not
  // useful for a simple pass/fail validation.
  flags.delete("g");
  flags.delete("y");

  return {
    source,
    flags: [...flags].join(""),
  };
}

function starterCodeWasChanged(
  files: SubmissionFiles,
  starterCode: SubmissionFiles,
) {
  const starterEntries = Object.entries(starterCode);

  if (starterEntries.length === 0) {
    return true;
  }

  return starterEntries.some(([rawFilename, starterFileCode]) => {
    const filename = normalizeFilename(rawFilename);
    const submittedCode = files[filename];

    return (
      typeof submittedCode === "string" &&
      normalizeCode(submittedCode) !== normalizeCode(starterFileCode)
    );
  });
}

export function validateExerciseSubmission({
  files,
  starterCode,
  validationRegex,
}: ValidateSubmissionInput): ValidationResult {
  if (!starterCodeWasChanged(files, starterCode)) {
    return {
      valid: false,
      message: "Change the starter code before completing the exercise.",
    };
  }

  if (!validationRegex.trim()) {
    return {
      valid: false,
      message: "This exercise does not have a validation rule yet.",
    };
  }

  let validationPattern: RegExp;

  try {
    const { source, flags } = getRegexSourceAndFlags(validationRegex);
    validationPattern = new RegExp(source, flags);
  } catch (error) {
    console.error("Invalid exercise validation regex:", error);

    return {
      valid: false,
      message: "The exercise validation rule is invalid.",
    };
  }

  const orderedFiles = Object.entries(files).sort(
    ([firstFilename], [secondFilename]) =>
      firstFilename.localeCompare(secondFilename),
  );

  const submittedCode = orderedFiles
    .map(([filename, code]) => `/* FILE: ${filename} */\n${code}`)
    .join("\n\n");

  const validationTargets = [
    ...orderedFiles.map(([, code]) => code),
    submittedCode,
  ];

  if (!validationTargets.some((code) => validationPattern.test(code))) {
    return {
      valid: false,
      message:
        "The code does not meet the exercise requirements yet. Check the task and try again.",
    };
  }

  return {
    valid: true,
    message: "Code validation passed.",
  };
}
