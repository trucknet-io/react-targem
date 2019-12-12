import translationsJson from "@test-utils/fixtures/translations.json";
import { translationsToCatalogs } from "./gettext";
import { t as tFactory, tf, tn as tnFactory, tnf } from "./translators";

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

describe("tf()", () => {
  test("translates and interpolates message, also formats numbers", () => {
    const str1 = tf(catalogs, "ru")("Your score is: {{ score }}", {
      score: 12345.6,
    });
    expect(str1).toEqual("Ваш счёт: 12 345,6");

    const str2 = tf(catalogs, "ru")(
      "{{ score }}",
      { score: 12345.62 },
      undefined,
      { maximumFractionDigits: 0 },
    );
    expect(str2).toEqual("12 346");
  });
});

describe("tnf()", () => {
  test("translates and interpolates pluralized message, also formats numbers", () => {
    const str1 = tnf(catalogs, "ru")(
      "You have one answer, your score is: {{ score }}",
      "You have {{ count }} answers, your score is: {{ score }}",
      3456.7,
      {
        score: 4567.8,
      },
    );
    expect(str1).toEqual("У Вас 3 456,7 ответов, Ваш счёт: 4 567,8");

    const str2 = tnf(catalogs, "ru")("", "", 3456.789, {}, undefined, {
      maximumFractionDigits: 2,
    });
    expect(str2).toEqual("3 456,79");
  });
});
