import get from "lodash.get";

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

export class Gettext {
  private catalogs: GettextCatalogs = {};
  private locale: string = "";
  private debug: boolean;

  constructor(options: { debug?: boolean } = {}) {
    // Set debug flag
    if ("debug" in options) {
      this.debug = options.debug === true;
    } else if (typeof process !== "undefined") {
      this.debug = get(process, "env.NODE_ENV") !== "production";
    } else {
      this.debug = false;
    }
  }

  /**
   * Stores a set of translations in the set of gettext
   * catalogs.
   */
  public addTranslations(locale: string, translations: ParsedPot) {
    this.catalogs[locale] = {
      ...translations,
      pluralFunction: this.getPluralFunction(locale, translations),
    };
  }

  public addMultipleTranslations(translations: TranslationsMap) {
    Object.entries(translations).map(([locale, translation]) => {
      this.addTranslations(locale, translation);
    });
  }

  /**
   * Sets the locale to get translated messages for.
   */
  public setLocale(locale: string) {
    if (typeof locale !== "string") {
      this.warn(
        `You called setLocale() with an argument of type ${typeof locale}. The locale must be a string.`,
      );
      return;
    }

    if (locale.trim() === "") {
      this.warn(
        "You called setLocale() with an empty value, which makes little sense.",
      );
    }

    if (!this.catalogs[locale]) {
      this.warn(
        `You called setLocale() with "${locale}", but no translations for that locale has been added.`,
      );
    }

    this.locale = locale;
  }

  /**
   * Translates a plural string from a specific context
   */
  public translate(
    msgid: string,
    msgidPlural?: string,
    msgctxt?: string,
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

    translation = this.getTranslation(msgctxt, msgid);

    if (translation) {
      if (typeof count === "number") {
        index = this.getPluralIndex(count);
      } else {
        index = 0;
      }

      return translation.msgstr[index] || defaultTranslation;
    } else {
      this.warn(
        `No translation was found for msgid "${msgid}" in msgctxt "${msgctxt}"`,
      );
    }

    return defaultTranslation;
  }

  /**
   * Retrieves translation object from the context
   */
  private getTranslation(msgctxt: string, msgid: string): GettextTranslation {
    return get(this.catalogs, [
      this.locale,
      "translations",
      msgctxt || "",
      msgid,
    ]);
  }

  private getPluralFunction(
    locale: string,
    translations: ParsedPot,
  ): PluralFunction {
    const pluralForms = get(translations, ["headers", "plural-forms"]);

    if (!pluralForms) {
      this.warn(
        `Translations for locale ${locale} don't contain "plural-forms" in headers`,
      );
      return () => 1;
    }

    const pluralExecRes = /plural=(.+?)(;|\n|\r)/gim.exec(pluralForms);
    if (!pluralExecRes || !pluralExecRes[1]) {
      this.warn(
        `Translations for locale ${locale} have invalid "plural-forms" in headers`,
      );
      return () => 1;
    }

    const pluralString = pluralExecRes[1];
    if (!/^[+\-*/%0-9(). n!=?:<>&|]+$/gim.test(pluralString)) {
      this.warn(
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

  private getPluralIndex(count: number): number {
    const pluralFunc = get(this.catalogs, [this.locale, "pluralFunction"]);
    if (!pluralFunc) {
      return 1;
    }

    const pluralResult = pluralFunc(count);
    if (typeof pluralResult === "boolean") {
      return pluralResult ? 1 : 0;
    }
    return pluralResult;
  }

  /**
   * Logs a warning to the console if debug mode is enabled.
   */
  private warn(message: string) {
    if (this.debug) {
      console.warn(message);
    }
  }
}
