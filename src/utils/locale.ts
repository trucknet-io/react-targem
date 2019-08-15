export function findLocale(supportedLocales: string[], locale: string): string {
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
}

export class LocaleNotSupportedError extends Error {}

export function getBrowserLocale(
  supportedLocales: string[],
  fallbackLocale?: string,
) {
  if (typeof window !== "undefined" && window.navigator.language) {
    try {
      return findLocale(supportedLocales, window.navigator.language);
    } catch (_) {}
  }
  return supportedLocales[0] || fallbackLocale || "en";
}
