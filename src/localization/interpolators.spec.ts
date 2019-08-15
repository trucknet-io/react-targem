import { interpolateString } from "./interpolators";

describe("interpolateString()", () => {
  test("returns the input string as is if it does not contain any variables", () => {
    const result = interpolateString("wow");
    expect(result).toEqual("wow");
  });

  test("returns input if it's empty like", () => {
    // @ts-ignore
    expect(interpolateString()).toEqual(undefined);
    // @ts-ignore
    expect(interpolateString(null)).toEqual(null);
    // @ts-ignore
    expect(interpolateString(false)).toEqual(false);
    // @ts-ignore
    expect(interpolateString(0)).toEqual(0);
    expect(interpolateString("")).toEqual("");
  });

  test("replaces multiple variables correctly", () => {
    const result = interpolateString("{{ name1 }} knows {{ name2 }}", {
      name1: "Abdel",
      name2: "Steph",
    });
    expect(result).toEqual("Abdel knows Steph");
  });

  test("replaces multiple instances of the same variable correctly", () => {
    const result = interpolateString(
      "{{ spam }}, {{ spam }}, {{ spam }} and {{ spam }}",
      { spam: "spam" },
    );
    expect(result).toEqual("spam, spam, spam and spam");
  });

  test("returns a template variable with an undefined value in its original form", () => {
    const result = interpolateString("This behaviour is {{ und }}", {
      und: undefined,
    });
    expect(result).toEqual("This behaviour is {{ und }}");
  });

  test("supports new lines in the passed string", () => {
    const result = interpolateString("First row\nSecond row");
    expect(result).toEqual("First row\nSecond row");
  });

  test("supports new lines in template variable values", () => {
    const slimShady = "Hi my name is\nwhat\nmy name is\nwho\nmy name is";
    const result = interpolateString(`{{ slimShady }}`, { slimShady });
    expect(result).toEqual(slimShady);
  });

  test("safely injects non-string variables", () => {
    const result1 = interpolateString("You have {{ swagCount }} swagger", {
      swagCount: 9,
    });
    expect(result1).toEqual("You have 9 swagger");

    const result2 = interpolateString("Is there coffee: {{ thereIsCoffee }}", {
      thereIsCoffee: true,
    });
    expect(result2).toEqual("Is there coffee: true");

    const result3 = interpolateString("Rich kids have {{ NaN }}nies", {
      NaN: NaN,
    });
    expect(result3).toEqual("Rich kids have NaNnies");

    // @ts-ignore
    const result4 = interpolateString(`Say "object": {{ obj }}`, {
      obj: { objectz: "Awbyect" },
    });
    expect(result4).toEqual(`Say "object": [object Object]`);

    // @ts-ignore
    const result5 = interpolateString("Dance to the {{ func }}", {
      // tslint:disable-next-line: no-function-expression
      func: function beat() {},
    });
    expect(result5).toEqual("Dance to the function beat() { }");
  });
});