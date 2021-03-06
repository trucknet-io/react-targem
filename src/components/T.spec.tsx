import { render } from "@testing-library/react";
import * as React from "react";

import translationsJson from "@test-utils/fixtures/translations.json";
import { T } from "./T";
import { TargemProvider } from "./TargemProvider";
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
      detectLocale={false}
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

  test("allows wrapping translation with a component", () => {
    const res = render(
      <Provider>
        <T
          message="Current locale"
          component="a"
          componentProps={{ href: "www.google.com" }}
        />
      </Provider>,
    );
    const el = res.getByText("Текущая локаль");

    expect(el).toBeInTheDocument();
    expect(el.nodeName).toBe("A");
    expect(el.getAttribute("href")).toBe("www.google.com");
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

  test("translates pluralized message with count=0", () => {
    const res = render(
      <Provider locale="en-GB">
        <T
          message="Dear, {{ name }}. You have one unread message"
          messagePlural="Dear, {{ name }}. You have {{ count }} unread messages"
          context="someContext"
          count={0}
          scope={{ name: "Alex" }}
        />
      </Provider>,
    );
    expect(
      res.getByText("Dear, Alex. You have 0 unread messages"),
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
      <Provider locale="en-GB">
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

  test("formats count and scope numbers when props.formatNumbers is passed", () => {
    const res = render(
      <Provider locale="en-GB">
        <T
          message="You have one answer, your score is: {{ score }}"
          count={5000}
          scope={{ score: 1000.5678 }}
          formatNumbers={{ maximumFractionDigits: 2 }}
        />
      </Provider>,
    );
    expect(
      res.getByText("You have 5,000 answers, your score is: 1,000.57"),
    ).toBeInTheDocument();

    res.rerender(
      <Provider locale="ru">
        <T
          message="You have one answer, your score is: {{ score }}"
          count={5000}
          scope={{ score: 1000.5689 }}
          formatNumbers
        />
      </Provider>,
    );
    // `maximumFractionDigits: 3` by default in `Intl.NumberFormatOptions`
    expect(
      res.getByText("У Вас 5 000 ответов, Ваш счёт: 1 000,569"),
    ).toBeInTheDocument();
  });

  test("allows to only format number with optional NumberFormat options", () => {
    const res = render(
      <Provider locale="en-GB">
        <T count={5000} formatNumbers />
      </Provider>,
    );
    expect(res.getByText("5,000")).toBeInTheDocument();

    res.rerender(
      <Provider locale="en-GB">
        <T count={5000.3456} formatNumbers={{ maximumFractionDigits: 0 }} />
      </Provider>,
    );
    expect(res.getByText("5,000")).toBeInTheDocument();

    res.rerender(
      <Provider locale="ru">
        <T count={5000.12345} formatNumbers={{ maximumFractionDigits: 2 }} />
      </Provider>,
    );
    expect(res.getByText("5 000,12")).toBeInTheDocument();
  });
});
