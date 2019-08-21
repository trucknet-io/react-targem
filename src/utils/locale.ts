export function findLocale(
  supportedLocales: string[],
  locale: string,
): string | undefined {
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
  return undefined;
}

export function getBrowserLocale(
  supportedLocales: string[],
  fallbackLocale?: string,
) {
  let browserLocale: string | undefined;
  if (typeof window !== "undefined" && window.navigator.language) {
    browserLocale = findLocale(supportedLocales, window.navigator.language);
    if (!browserLocale && !fallbackLocale) {
      browserLocale = findLocale(supportedLocales, "en");
    }
  }
  return browserLocale || fallbackLocale || supportedLocales[0] || "en";
}
