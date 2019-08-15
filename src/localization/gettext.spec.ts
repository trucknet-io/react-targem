import translationsJson from "@test-utils/fixtures/translations.json";
import { mockWarn } from "@test-utils/setupTests";
import {
  defaultPluralFunction,
  getPluralFunction,
  getPluralIndex,
  getTranslation,
  potToCatalog,
  translate,
  translationsToCatalogs,
} from "./gettext";
import { ParsedPot } from "./types";

describe("getPluralFunction()", () => {
  afterEach(() => {
    mockWarn.mockClear();
  });

  test("returns plural function for a valid parsed pot", () => {
    const pot: ParsedPot = createPluralPot(
      "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<12 || n%100>14) ? 1 : 2);",
    );
    const func = getPluralFunction("ru", pot);

    expect(func).toBeInstanceOf(Function);
    expect(func.toString()).toEqual(`function anonymous(n
) {
return ((n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<12 || n%100>14) ? 1 : 2))
}`);
    expect(func(0)).toEqual(2);
    expect(func(1)).toEqual(0);
    expect(func(2)).toEqual(1);
    expect(func(5)).toEqual(2);
  });

  test("returns default plural function if plural-forms is empty", () => {
    const pot: ParsedPot = createPluralPot("");
    const func = getPluralFunction("ru", pot);

    expect(func.toString()).toEqual(defaultPluralFunction.toString());
    expect(mockWarn).toBeCalledTimes(1);
  });

  test("returns default plural if plural-forms is invalid/insecure", () => {
    const pot1: ParsedPot = createPluralPot("nplurals=3;");
    const func1 = getPluralFunction("ru", pot1);
    expect(func1.toString()).toEqual(defaultPluralFunction.toString());
    expect(mockWarn).toBeCalledTimes(1);

    const pot2: ParsedPot = createPluralPot("nplurals=3;plural=(m == 3)");
    const func2 = getPluralFunction("ru", pot2);
    expect(func2.toString()).toEqual(defaultPluralFunction.toString());
    expect(mockWarn).toBeCalledTimes(2);

    const pot3: ParsedPot = createPluralPot(
      `nplurals=3;plural=(document.cookie = "")`,
    );
    const func3 = getPluralFunction("ru", pot3);
    expect(func3.toString()).toEqual(defaultPluralFunction.toString());
    expect(mockWarn).toBeCalledTimes(3);
  });
});

describe("getPluralIndex()", () => {
  test("returns plural index for the given catalogs, locale and count", () => {
    const catalogs = translationsToCatalogs({
      ru: createPluralPot(
        "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<12 || n%100>14) ? 1 : 2);",
      ),
    });
    expect(getPluralIndex(catalogs, "ru", 0)).toEqual(2);
    expect(getPluralIndex(catalogs, "ru", 1)).toEqual(0);
    expect(getPluralIndex(catalogs, "ru", 2)).toEqual(1);
    expect(getPluralIndex(catalogs, "ru", 5)).toEqual(2);
  });

  test("returns 1 or 0 if result of plural function is boolean", () => {
    const catalogs = translationsToCatalogs({
      ru: createPluralPot("nplurals=2; plural=n>1;"),
    });
    expect(getPluralIndex(catalogs, "ru", 1)).toEqual(0);
    expect(getPluralIndex(catalogs, "ru", 2)).toEqual(1);
  });

  test("returns 0 if there is no plural function", () => {
    const catalogs = translationsToCatalogs({
      ru: createPluralPot(""),
    });
    expect(getPluralIndex(catalogs, "ru", 1)).toEqual(0);
    expect(getPluralIndex(catalogs, "ru", 5)).toEqual(0);
  });
});

describe("getTranslation()", () => {
  const catalogs = translationsToCatalogs(translationsJson);

  test("extracts translation from gettext catalog", () => {
    expect(
      getTranslation(
        catalogs,
        "ru",
        "There is one line of code",
        "someContext",
      ),
    ).toEqual({
      msgid: "There is one line of code",
      comments: { reference: "dev/src/layouts/Body.tsx:24" },
      msgid_plural: "There are {{ count }} lines of code",
      msgstr: ["Тут есть одна строчка кода", "Здесь {{ count }} строчек кода"],
    });
  });

  test("extracts translations without context", () => {
    expect(getTranslation(catalogs, "ru", "Hello, World!")).toEqual({
      msgid: "Hello, World!",
      comments: { reference: "dev/src/layouts/Body.tsx:14" },
      msgstr: ["Привет, Мир!"],
    });
  });

  test("returns undefined if translation is not found", () => {
    expect(getTranslation(catalogs, "cs", "Hello, World!")).toEqual(undefined);
    expect(
      getTranslation(catalogs, "ru", "Hello, World!", "bad context"),
    ).toEqual(undefined);
  });
});

describe("potToCatalog()", () => {
  test("extends pot with pluralFunction property", () => {
    const catalog = potToCatalog("so", createPluralPot("plural=n>1"));
    expect(catalog.pluralFunction).toBeInstanceOf(Function);
    expect(catalog.pluralFunction(1)).toEqual(false);
    expect(catalog.pluralFunction(2)).toEqual(true);
  });
});

describe("translationsToCatalogs()", () => {
  test("converts map of parsed pot files to gettext catalogs", () => {
    const catalogs = translationsToCatalogs(translationsJson);
    expect(catalogs).toEqual({
      "en-GB": {
        ...translationsJson["en-GB"],
        pluralFunction: expect.any(Function),
      },
      he: {
        ...translationsJson.he,
        pluralFunction: expect.any(Function),
      },
      ru: {
        ...translationsJson.ru,
        pluralFunction: expect.any(Function),
      },
    });
  });
});

describe("translate()", () => {
  const catalogs = translationsToCatalogs(translationsJson);

  test("translates message for a given locale", () => {
    expect(translate(catalogs, "ru", "Hello, World!")).toEqual("Привет, Мир!");
  });

  test("translates message for a given locale and context", () => {
    expect(
      translate(catalogs, "ru", "There is one line of code", "someContext"),
    ).toEqual("Тут есть одна строчка кода");
  });

  test("translates pluralized message", () => {
    expect(
      translate(catalogs, "ru", "There is {{ count }} button", "", "", 2),
    ).toEqual("{{ count }} кнопки");
    expect(
      translate(catalogs, "ru", "There is {{ count }} button", "", "", 5),
    ).toEqual("{{ count }} кнопок");
  });
});

const createPluralPot = (pluralForms: string) => ({
  charset: "",
  translations: {},
  headers: {
    "plural-forms": pluralForms,
  },
});
