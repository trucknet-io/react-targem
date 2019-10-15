import { warn } from "./debug";
import { findLocale } from "./locale";

const supportedLocales = ["en-GB", "en-AU"];

describe("findLocale", () => {
  afterEach(() => {
    (warn as jest.Mock).mockClear();
  });

  it("should return en-GB for en-GB", () => {
    expect(findLocale(supportedLocales, "en-GB")).toBe("en-GB");
  });

  it("should return en-AU for en-AU", () => {
    expect(findLocale(supportedLocales, "en-AU")).toBe("en-AU");
  });

  it("should return en-GB for en and do a warning", () => {
    expect(findLocale(supportedLocales, "en")).toBe("en-GB");
    expect(warn).toBeCalledTimes(1);
  });

  it("should return en-GB for en-US and do a warning", () => {
    expect(findLocale(supportedLocales, "en-US")).toBe("en-GB");
    expect(warn).toBeCalledTimes(1);
  });

  it("Should return undefined if not found", () => {
    expect(findLocale(supportedLocales, "foo")).toBeUndefined();
  });
});
