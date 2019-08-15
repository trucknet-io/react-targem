import translationsJson from "@test-utils/fixtures/translations.json";
import { translationsToCatalogs } from "./gettext";
import { t as tFactory, tn as tnFactory } from "./translators";

const catalogs = translationsToCatalogs(translationsJson);

describe("t()", () => {
  const t = tFactory(catalogs, "ru");

  test("translates and interpolates message", () => {
    expect(t("Current locale")).toEqual("Текущая локаль");

    expect(t("Hello, {{ name }}!", { name: "Alex" })).toEqual("Здарова, Alex!");

    expect(
      t("I love you, {{ name }}", { name: "Orly" }, "someContext"),
    ).toEqual("Я люблю тебя, Orly");
  });
});

describe("tn()", () => {
  const tn = tnFactory(catalogs, "ru");

  test("translates and interpolates pluralized message", () => {
    const translate = (count: number) =>
      tn(
        "Dear, {{ name }}. You have one unread message",
        "Dear, {{ name }}. You have {{ count }} unread messages",
        count,
        { name: "Alex" },
        "someContext",
      );

    expect(translate(1)).toEqual(
      "Дорогой Alex. У вас одно непрочитанное сообщение.",
    );
    expect(translate(2)).toEqual(
      "Дорогой Alex. У вас 2 непрочитанных сообщения.",
    );
    expect(translate(5)).toEqual(
      "Дорогой Alex. У вас 5 непрочитанных сообщений.",
    );
  });
});
