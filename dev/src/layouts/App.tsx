import React from "react";
import { hot } from "react-hot-loader/root";

import { TargemProvider } from "@lib";
import { DEFAULT_LOCALE } from "@src/config/locales";
import "@src/config/reactHotLoader"; // tslint:disable-line no-import-side-effect
import translationsJson from "@src/i18n/translations.json";

import Body from "./Body";

class App extends React.Component {
  public render() {
    return (
      <TargemProvider
        locale={DEFAULT_LOCALE.code}
        translations={translationsJson}>
        <Body />
      </TargemProvider>
    );
  }
}

export default hot(App);
