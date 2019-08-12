export type LocaleDirection = "ltr" | "rtl";

export type Locale = {
  code: string;
  englishTitle: string;
  localTitle: string;
  direction?: LocaleDirection;
};

export type LocalesMap = { [localeCode: string]: Locale };

export const LOCALES: Locale[] = [
  {
    code: "en-GB",
    englishTitle: "English",
    localTitle: "English",
  },
  {
    code: "he",
    englishTitle: "Hebrew",
    localTitle: "עברית",
    direction: "rtl",
  },
  {
    code: "ru",
    englishTitle: "Russian",
    localTitle: "Русский",
  },
];

export const LOCALES_MAP: LocalesMap = LOCALES.reduce(
  (res: Partial<LocalesMap>, locale) => {
    res[locale.code] = locale;
    return res;
  },
  {},
) as LocalesMap;

export const SUPPORTED_LOCALES = LOCALES.map((l) => l.code);

export const DEFAULT_LOCALE = LOCALES[0];
