export type LocaleDirection = "ltr" | "rtl";

export const findLocale = (
  supportedLocales: string[],
  locale: string,
): string => {
  if (supportedLocales.includes(locale)) {
    return locale;
  }
  for (const localeToMatch of supportedLocales) {
    if (localeToMatch.includes(locale.split("-")[0])) {
      console.warn(
        `Locale ${locale} was not found. Using ${localeToMatch} as a fallback`,
      );
      return localeToMatch;
    }
  }
  throw new LocaleNotSupportedError(`Locale ${locale} was not found`);
};

export const getDateFnsLocale = (locale: string) => {
  return locale.replace("-", "");
};

export class LocaleNotSupportedError extends Error {}
