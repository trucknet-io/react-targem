import { render } from "@testing-library/react";
import * as React from "react";

import translationsJson from "@test-utils/fixtures/translations.json";
import { TargemProvider, withLocale } from "./TargemProvider";

describe("<TargemProvider/>", () => {
  const MyComponent = withLocale(({ t, tn, locale, direction }) => (
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
    </div>
  ));

  test("provides child components with translation context", () => {
    const res = render(
      <TargemProvider locale="he" translations={translationsJson}>
        <MyComponent />
      </TargemProvider>,
    );

    expect(res.getByText("אזור נוכחי: he")).toBeInTheDocument();
    expect(res.getByText("Current direction: rtl")).toBeInTheDocument();
    expect(res.getByText("שלום עולם!")).toBeInTheDocument();
    expect(
      res.getByText("יקר, אלכס. יש לך 5 הודעות שלא נקראו"),
    ).toBeInTheDocument();
    expect(res.baseElement).toHaveAttribute("dir", "rtl");
  });

  test("passes first locale from translations if locale prop omitted", () => {
    const res = render(
      <TargemProvider translations={translationsJson}>
        <MyComponent />
      </TargemProvider>,
    );
    expect(res.getByText("Current locale: en-GB")).toBeInTheDocument();
  });

  test("auto detects locale from navigator.language by default", () => {
    const res = render(
      <TargemProvider translations={translationsJson}>
        <MyComponent />
      </TargemProvider>,
    );
    expect(res.getByText("Current locale: en-GB")).toBeInTheDocument();
  });

  test("auto detection fallbacks to defaultLocale", () => {
    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      writable: true,
      value: "unsupported_locale",
    });

    const res = render(
      <TargemProvider defaultLocale="ru" translations={translationsJson}>
        <MyComponent />
      </TargemProvider>,
    );
    expect(res.getByText("Текущая локаль: ru")).toBeInTheDocument();

    // @ts-ignore
    window.navigator.language = "en-US";
  });

  test("passes defaultLocale as locale if locale prop is omitted", () => {
    const res = render(
      <TargemProvider
        detectLocale={false}
        defaultLocale="ru"
        translations={translationsJson}>
        <MyComponent />
      </TargemProvider>,
    );
    expect(res.getByText("Текущая локаль: ru")).toBeInTheDocument();
  });

  test("passes 'en' locale as a fallback", () => {
    const res = render(
      <TargemProvider translations={{}}>
        <MyComponent />
      </TargemProvider>,
    );
    expect(res.getByText("Current locale: en")).toBeInTheDocument();
  });

  test("allows to pass custom text direction", () => {
    const res = render(
      <TargemProvider
        direction="ltr"
        locale="he"
        translations={translationsJson}>
        <MyComponent />
      </TargemProvider>,
    );
    expect(res.baseElement).toHaveAttribute("dir", "ltr");
  });

  test("allows to disable setting body dir attribute", () => {
    const res = render(
      <TargemProvider
        controlBodyDir={false}
        locale="he"
        translations={translationsJson}>
        <MyComponent />
      </TargemProvider>,
    );
    expect(res.baseElement).toHaveAttribute("dir", "ltr");
  });

  test("allows to specify custom setBodyDir function", () => {
    const setBodyDir = jest.fn();
    const res = render(
      <TargemProvider
        setBodyDir={setBodyDir}
        locale="he"
        translations={translationsJson}>
        <MyComponent />
      </TargemProvider>,
    );
    expect(res.baseElement).toHaveAttribute("dir", "ltr");
    expect(setBodyDir).toBeCalledWith("rtl");
  });
});
