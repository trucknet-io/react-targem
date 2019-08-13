import { DEBUG } from "./utils";

export type GettextTranslation = {
  msgid: string;
  msgid_plural?: string;
  msgctxt?: string;
  msgstr: string[];
  comments?: {
    reference: string;
  };
};

export type PotsHeaders = {
  "project-id-version"?: string;
  "content-type"?: string;
  "pot-creation-date"?: string;
  "content-transfer-encoding"?: string;
  "plural-forms"?: string;
  "po-revision-date"?: string;
  "language-team"?: string;
  "mime-version"?: string;
  "x-generator"?: string;
  "last-translator"?: string;
  language?: string;
};

export type ParsedPot = {
  charset: string;
  headers: PotsHeaders;
  translations: { [msgctxt: string]: { [msgid: string]: GettextTranslation } };
};

export type TranslationsMap = {
  [locale: string]: ParsedPot;
};

export type PluralFunction = (n: number) => boolean | number;

export type GettextCatalog = ParsedPot & {
  pluralFunction: PluralFunction;
};

export type GettextCatalogs = {
  [locale: string]: GettextCatalog;
};

export function translationsToCatalogs(
  translations: TranslationsMap,
): GettextCatalogs {
  return Object.entries(translations).reduce(
    (res: GettextCatalogs, [locale, translation]) => {
      res[locale] = potToCatalog(locale, translation);
      return res;
    },
    {},
  );
}

export function potToCatalog(locale: string, pot: ParsedPot): GettextCatalog {
  return {
    ...pot,
    pluralFunction: getPluralFunction(locale, pot),
  };
}

export function getPluralFunction(
  locale: string,
  translations: ParsedPot,
): PluralFunction {
  const pluralForms =
    translations &&
    translations.headers &&
    translations.headers["plural-forms"];

  if (!pluralForms) {
    warn(
      `Translations for locale ${locale} don't contain "plural-forms" in headers`,
    );
    return () => 1;
  }

  const pluralExecRes = /plural=(.+?)(;|\n|\r)/gim.exec(pluralForms);
  if (!pluralExecRes || !pluralExecRes[1]) {
    warn(
      `Translations for locale ${locale} have invalid "plural-forms" in headers`,
    );
    return () => 1;
  }

  const pluralString = pluralExecRes[1];
  if (!/^[+\-*/%0-9(). n!=?:<>&|]+$/gim.test(pluralString)) {
    warn(
      `Translations for locale ${locale} have invalid "plural-forms" in headers`,
    );
    return () => 1;
  }

  // This new Function call is safe because the checks above ensure
  // plural expression only contains arithmetic and logical operators,
  // numbers and 'n' char
  // tslint:disable-next-line: function-constructor no-function-constructor-with-string-args
  return new Function("n", `return (${pluralString})`) as PluralFunction;
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

export function getPluralIndex(
  catalogs: GettextCatalogs,
  locale: string,
  count: number,
): number {
  const pluralFunc =
    catalogs && catalogs[locale] && catalogs[locale].pluralFunction;
  if (!pluralFunc) {
    return 1;
  }

  const pluralResult = pluralFunc(count);
  if (typeof pluralResult === "boolean") {
    return pluralResult ? 1 : 0;
  }
  return pluralResult;
}

function warn(message: string) {
  if (DEBUG) {
    console.warn(message);
  }
}
