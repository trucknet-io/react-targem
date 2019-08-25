import { warn } from "../utils";
import {
  GettextCatalog,
  GettextCatalogs,
  GettextTranslation,
  ParsedPot,
  PluralFunction,
  TranslationsMap,
} from "./types";

export function translationsToCatalogs(
  translations: TranslationsMap,
): GettextCatalogs {
  return Object.keys(translations).reduce((res: GettextCatalogs, locale) => {
    res[locale] = potToCatalog(locale, translations[locale]);
    return res;
  }, {});
}

export function potToCatalog(locale: string, pot: ParsedPot): GettextCatalog {
  return {
    ...pot,
    pluralFunction: getPluralFunction(locale, pot),
  };
}

export function translate(
  catalogs: GettextCatalogs,
  locale: string,
  msgid: string,
  msgctxt?: string,
  msgidPlural?: string,
  count: number = 1,
) {
  let defaultTranslation = msgid;
  let translation: GettextTranslation;
  let index;

  // tslint:disable-next-line: no-parameter-reassignment
  msgctxt = msgctxt || "";

  if (!isNaN(count) && count !== 1) {
    defaultTranslation = msgidPlural || msgid;
  }

  translation = getTranslation(catalogs, locale, msgid, msgctxt);

  if (translation) {
    if (typeof count === "number") {
      index = getPluralIndex(catalogs, locale, count);
    } else {
      index = 0;
    }

    return translation.msgstr[index] || defaultTranslation;
  } else {
    warn(
      `No translation was found for msgid "${msgid}" in msgctxt "${msgctxt}"`,
    );
  }

  return defaultTranslation;
}

export function getTranslation(
  catalogs: GettextCatalogs,
  locale: string,
  msgid: string,
  msgctxt?: string,
): GettextTranslation {
  const context = msgctxt || "";
  return (
    catalogs &&
    catalogs[locale] &&
    catalogs[locale].translations &&
    catalogs[locale].translations[context] &&
    catalogs[locale].translations[context][msgid]
  );
}

// This export is needed because when you run `npm run test:ci`
// Jest injects coverage lines into each function so
// comparing two functions with .toString() becomes impossible
export const defaultPluralFunction = () => 0;

export function getPluralFunction(
  locale: string,
  translations: ParsedPot,
): PluralFunction {
  const pluralForms =
    translations &&
    translations.headers &&
    translations.headers["plural-forms"];

  if (!pluralForms) {
    return defaultPluralFunction;
  }

  const pluralExecRes = /plural=(.+?)(;|\n|\r|$)/gim.exec(pluralForms);
  if (!pluralExecRes || !pluralExecRes[1]) {
    return defaultPluralFunction;
  }

  const pluralString = pluralExecRes[1];
  if (!/^[+\-*/%0-9(). n!=?:<>&|]+$/gim.test(pluralString)) {
    warn(
      `Translations for locale ${locale} have invalid "plural-forms" in headers`,
    );
    return defaultPluralFunction;
  }

  // This new Function call is safe because the checks above ensure
  // plural expression only contains arithmetic and logical operators,
  // numbers and 'n' char
  // tslint:disable-next-line: function-constructor no-function-constructor-with-string-args
  return new Function("n", `return (${pluralString})`) as PluralFunction;
}

export function getPluralIndex(
  catalogs: GettextCatalogs,
  locale: string,
  count: number,
): number {
  const pluralFunc =
    catalogs && catalogs[locale] && catalogs[locale].pluralFunction;
  if (!pluralFunc) {
    return 0;
  }

  const pluralResult = pluralFunc(count);
  if (typeof pluralResult === "boolean") {
    return pluralResult ? 1 : 0;
  }
  return pluralResult;
}
