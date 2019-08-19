import React from "react";

import { withLocale, WithLocaleStateful } from "@lib";
import { SUPPORTED_LOCALES } from "@src/config/locales";

class Inner extends React.PureComponent<WithLocaleStateful> {
  public render() {
    const { direction, locale, t, tnf } = this.props;
    return (
      <div>
        <h1>
          {t("Current locale")}:{" "}
          <span style={{ color: "green" }}>{locale}</span> | <i>{direction}</i>
        </h1>
        <h3>
          tnf() usage:{" "}
          {tnf(
            "There is {{ count }} button",
            "There are {{ count }} buttons",
            20000,
          )}
        </h3>
        <div dir="ltr">
          <b>{">>>"} FORCED LTR </b>
          <button onClick={this.setPrevLocale}>Prev Locale</button>
          <button onClick={this.setNextLocale}>Next Locale</button>
          <b> FORCED LTR {"<<<"}</b>
        </div>
        <hr />
      </div>
    );
  }

  private increaseLocale = (increment: number) => {
    const { locale, changeLocale } = this.props;
    const index = SUPPORTED_LOCALES.indexOf(locale);
    let newIndex = (index + increment) % SUPPORTED_LOCALES.length;
    if (newIndex < 0) {
      newIndex =
        (SUPPORTED_LOCALES.length + newIndex) % SUPPORTED_LOCALES.length;
    }
    changeLocale(SUPPORTED_LOCALES[newIndex]);
  };

  private setNextLocale = () => {
    this.increaseLocale(1);
  };

  private setPrevLocale = () => {
    this.increaseLocale(-1);
  };
}

export default withLocale(Inner);
