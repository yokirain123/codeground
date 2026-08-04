export const ACTIVE_FILE =
  "/index.html";

type StarterCode =
  Record<string, string>;

type SandpackStarterFiles = Record<
  string,
  {
    code: string;
    active?: boolean;
  }
>;

function normalizeFileName(
  filename: string,
) {
  return filename.startsWith("/")
    ? filename
    : `/${filename}`;
}

export function createStarterFiles(
  starterCode: StarterCode,
): SandpackStarterFiles {
  const files: SandpackStarterFiles =
    {};

  for (const [
    filename,
    code,
  ] of Object.entries(starterCode)) {
    const normalizedFilename =
      normalizeFileName(filename);

    files[normalizedFilename] = {
      code,
    };
  }

  /*
   * Тимчасова підтримка старих вправ,
   * де starter code зберігався як App.js.
   */
  if (!files[ACTIVE_FILE]) {
    const legacyCode =
      files["/App.js"]?.code ??
      Object.values(files)[0]?.code ??
      "";

    delete files["/App.js"];

    files[ACTIVE_FILE] = {
      code: legacyCode,
    };
  }

  files[ACTIVE_FILE] = {
    ...files[ACTIVE_FILE],
    active: true,
  };

  return files;
}