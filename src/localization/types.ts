export type LocaleDirection = "ltr" | "rtl";

export type GettextTranslation = {
  msgid?: string;
  msgid_plural?: string;
  msgctxt?: string;
  msgstr: string[];
  comments?: {
    reference: string;
  };
};

export type PotHeaders = {
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
  charset?: string;
  headers: PotHeaders;
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

export type InterpolationScope = {
  [key: string]: string | number | boolean | undefined;
};

export type NumberFormatter = (
  num: number,
  options?: Intl.NumberFormatOptions,
) => string;
