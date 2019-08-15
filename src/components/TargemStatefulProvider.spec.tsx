import { fireEvent, render } from "@testing-library/react";
import * as React from "react";

import translationsJson from "@test-utils/fixtures/translations.json";
import { withLocale } from "./TargemProvider";
import {
  TargemStatefulProvider,
  WithLocaleStateful,
} from "./TargemStatefulProvider";

describe("<TargemProvider/>", () => {
  const MyComponent = withLocale<WithLocaleStateful>(
    ({ changeLocale, t, tn, locale, direction }) => {
      const changeToHe = () => {
        changeLocale("he");
      };
      const changeToRu = () => {
        changeLocale("ru");
      };
      return (
        <div>
          <span>
            {t("Current locale")}: {locale}
          </span>
          <span>Current direction: {direction}</span>
          <span>{t("Hello, World!")}</span>
          <span>
            {tn(
              "Dear, {{ name }}. You have one unread message",
              "Dear, {{ name }}. You have {{ count }} unread messages",
              5,
              { name: "אלכס" },
              "someContext",
            )}
          </span>
          <button onClick={changeToHe}>he locale</button>
          <button onClick={changeToRu}>ru locale</button>
        </div>
      );
    },
  );

  test("provides child components with translation context", () => {
    const res = render(
      <TargemStatefulProvider
        defaultLocale="he"
        translations={translationsJson}>
        <MyComponent />
      </TargemStatefulProvider>,
    );

    expect(res.getByText("אזור נוכחי: he")).toBeInTheDocument();
    expect(res.getByText("Current direction: rtl")).toBeInTheDocument();
    expect(res.getByText("שלום עולם!")).toBeInTheDocument();
    expect(
      res.getByText("יקר, אלכס. יש לך 5 הודעות שלא נקראו"),
    ).toBeInTheDocument();
    expect(res.baseElement).toHaveAttribute("dir", "rtl");
  });

  test("additionally stores current locale and provides changeLocale prop", () => {
    const res = render(
      <TargemStatefulProvider translations={translationsJson}>
        <MyComponent />
      </TargemStatefulProvider>,
    );

    fireEvent.click(res.getByText("he locale"));
    expect(res.getByText("שלום עולם!")).toBeInTheDocument();

    fireEvent.click(res.getByText("ru locale"));
    expect(res.getByText("Привет, Мир!")).toBeInTheDocument();
  });
});
