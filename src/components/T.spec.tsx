import { render } from "@testing-library/react";
import * as React from "react";

import translationsJson from "@test-utils/fixtures/translations.json";
import { T } from "./T";
import TargemProvider from "./TargemProvider";
import { TargemStatefulProvider } from "./TargemStatefulProvider";

describe("<T />", () => {
  const Provider: React.SFC<{ locale?: string }> = ({
    children,
    locale = "ru",
  }) => (
    <TargemProvider translations={translationsJson} locale={locale}>
      {children}
    </TargemProvider>
  );

  const StatefulProvider: React.SFC<{ locale?: string }> = ({
    children,
    locale = "ru",
  }) => (
    <TargemStatefulProvider
      defaultLocale={locale}
      translations={translationsJson}>
      {children}
    </TargemStatefulProvider>
  );

  test("translates message inside TargemProvider", () => {
    const res1 = render(
      <Provider>
        <T message="Current locale" />
      </Provider>,
    );
    expect(res1.getByText("Текущая локаль")).toBeInTheDocument();

    const res2 = render(
      <Provider>
        <T>Hello, World!</T>
      </Provider>,
    );
    expect(res2.getByText("Привет, Мир!")).toBeInTheDocument();
  });

  test("translates pluralized message", () => {
    const res = render(
      <Provider>
        <T
          message="Dear, {{ name }}. You have one unread message"
          messagePlural="Dear, {{ name }}. You have {{ count }} unread messages"
          context="someContext"
          count={2}
          scope={{ name: "Alex" }}
        />
      </Provider>,
    );
    expect(
      res.getByText("Дорогой Alex. У вас 2 непрочитанных сообщения."),
    ).toBeInTheDocument();
  });

  test("translates message inside TargemStatefulProvider", () => {
    const res = render(
      <StatefulProvider>
        <T
          message="I love you, {{ name }}"
          context="someContext"
          scope={{ name: "Alex" }}
        />
      </StatefulProvider>,
    );
    expect(res.getByText("Я люблю тебя, Alex")).toBeInTheDocument();
  });

  test("translates on the fly when locale changes", () => {
    const res = render(
      <Provider locale="en">
        <T message="Hello, World!" />
      </Provider>,
    );
    expect(res.getByText("Hello, World!")).toBeInTheDocument();

    res.rerender(
      <Provider locale="ru">
        <T message="Hello, World!" />
      </Provider>,
    );
    expect(res.getByText("Привет, Мир!")).toBeInTheDocument();

    res.rerender(
      <Provider locale="he">
        <T message="Hello, World!" />
      </Provider>,
    );
    expect(res.getByText("שלום עולם!")).toBeInTheDocument();
  });
});
