import { mockWarn } from "@test-utils/setupTests";
import { getPluralFunction } from "./gettext";
import { ParsedPot } from "./types";

describe("getPluralFunction", () => {
  const createPluralPot = (pluralForms: string) => ({
    charset: "",
    translations: {},
    headers: {
      "plural-forms": pluralForms,
    },
  });

  beforeEach(() => {
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

    expect(func.toString()).toEqual(`function () { return 1; }`);
    expect(mockWarn).toBeCalledTimes(1);
  });

  test("returns default plural if plural-forms is invalid/insecure", () => {
    const pot1: ParsedPot = createPluralPot("nplurals=3;");
    const func1 = getPluralFunction("ru", pot1);
    expect(func1.toString()).toEqual(`function () { return 1; }`);
    expect(mockWarn).toBeCalledTimes(1);

    const pot2: ParsedPot = createPluralPot("nplurals=3;plural=(m == 3)");
    const func2 = getPluralFunction("ru", pot2);
    expect(func2.toString()).toEqual(`function () { return 1; }`);
    expect(mockWarn).toBeCalledTimes(2);

    const pot3: ParsedPot = createPluralPot(
      `nplurals=3;plural=(document.cookie = "")`,
    );
    const func3 = getPluralFunction("ru", pot3);
    expect(func3.toString()).toEqual(`function () { return 1; }`);
    expect(mockWarn).toBeCalledTimes(3);
  });
});
