import { findLocale } from "./locale";

const supportedLocales = ["en-GB", "en-AU"];

let consoleWarnSpy: jest.SpyInstance;

describe("findLocale", () => {
  beforeAll(() => {
    consoleWarnSpy = jest
      .spyOn(global.console, "warn")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockClear();
  });

  it("should return en-GB for en-GB", () => {
    expect(findLocale(supportedLocales, "en-GB")).toBe("en-GB");
  });

  it("should return en-AU for en-AU", () => {
    expect(findLocale(supportedLocales, "en-AU")).toBe("en-AU");
  });

  it("should return en-GB for en and do a warning", () => {
    expect(findLocale(supportedLocales, "en")).toBe("en-GB");
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  it("should return en-GB for en-US and do a warning", () => {
    expect(findLocale(supportedLocales, "en-US")).toBe("en-GB");
    expect(consoleWarnSpy).toBeCalledTimes(1);
  });

  it("Should return undefined if not found", () => {
    expect(findLocale(supportedLocales, "foo")).toBeUndefined();
  });
});
