export const defineLanguage = (
  filename: string,
): {
  language: Language | undefined;
  extension: FileExtension | undefined;
} => {
  const definedExtension = defineExtension(filename);

  const language = Object.entries(LANGUAGE_BASE).find(([, exts]) =>
    exts.some((ext) => ext === definedExtension),
  )?.[0];

  return {
    language: language as Language | undefined,
    extension: definedExtension,
  };
};

const defineExtension = (filename: string): FileExtension | undefined => {
  const extension = filename.split('.').pop();

  if (extension && isFileExtension(extension)) {
    return Object.values(LANGUAGE_BASE)
      .flat()
      .find((exts) => exts === extension);
  }

  return undefined;
};

export const LANGUAGE_BASE = {
  typescript: ['ts', 'tsx'],
  javascript: ['js', 'jsx', 'mjs', 'cjs'],
  css: ['css'],
  less: ['less'],
  scss: ['scss', 'sass'],
  json: ['json'],
  html: ['html', 'htm'],
} as const;

export type Language = keyof typeof LANGUAGE_BASE;

export type FileExtension =
  (typeof LANGUAGE_BASE)[keyof typeof LANGUAGE_BASE][number];

export const isFileExtension = (file: string): file is FileExtension =>
  Object.values(LANGUAGE_BASE)
    .flat()
    .includes(file as FileExtension);
