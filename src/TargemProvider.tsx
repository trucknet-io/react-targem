import React from "react";

import { Gettext, TranslationsMap } from "./Gettext";
import { t, tn } from "./translators";
import {
  createContextHOC,
  findLocale,
  LocaleDirection,
  RTL_LOCALES,
} from "./utils";

export interface WithLocale {
  locale: string;
  direction: LocaleDirection;
  t: ReturnType<typeof t>;
  tn: ReturnType<typeof tn>;
  changeLocale(locale: string): void;
}

export type TargemProps = {
  locale?: string;
  translations: TranslationsMap;
  changeBodyDir?(dir: LocaleDirection): void;
  getDirection?(locale: string): LocaleDirection;
};

const { Provider, Consumer } = React.createContext<WithLocale>({
  locale: "en",
  direction: "ltr",
  changeLocale: (locale: string) => locale,
  t: () => "",
  tn: () => "",
});

export { Provider as RawLocaleProvider };

export class TargemProvider extends React.Component<TargemProps, WithLocale> {
  private gettext: Gettext = new Gettext();

  private t = t(this.gettext);
  private tn = tn(this.gettext);

  constructor(props: TargemProps) {
    super(props);

    const locale = props.locale || this.getDefaultLocale();

    this.gettext.addMultipleTranslations(props.translations);
    this.gettext.setLocale(locale);

    this.state = {
      ...this.getStateForLocale(locale),
      changeLocale: this.changeLocale,
      t: this.t,
      tn: this.tn,
    };
    this.changeBodyDir(locale);
  }

  public render() {
    const { children } = this.props;
    return <Provider value={this.state}>{children}</Provider>;
  }

  private getDefaultLocale = (): string => {
    const locales = this.getSupportedLocales();
    if (typeof window !== "undefined" && window.navigator.language) {
      try {
        return findLocale(locales, window.navigator.language);
      } catch (_) {
        return locales[0];
      }
    }
    return locales[0];
  };

  private changeBodyDir = (locale: string) => {
    const direction = this.getDirection(locale);
    const { changeBodyDir } = this.props;
    if (changeBodyDir) {
      changeBodyDir(direction);
      return;
    }

    if (typeof document !== "undefined") {
      document.body.dir = direction;
    }
  };

  private getDirection = (locale: string): LocaleDirection => {
    const { getDirection } = this.props;
    if (getDirection) {
      return getDirection(locale) || "ltr";
    }
    return RTL_LOCALES.includes(locale.toLowerCase()) ? "rtl" : "ltr";
  };

  private changeLocale = (locale: string) => {
    if (locale === this.state.locale) {
      return;
    }
    this.gettext.setLocale(locale);
    this.setState(this.getStateForLocale(locale));
    this.handleLocaleChanged(locale);
  };

  private getStateForLocale = (locale: string) => {
    const direction = this.getDirection(locale);
    return {
      locale,
      direction,
    };
  };

  private handleLocaleChanged = (localeCode: string) => {
    this.changeBodyDir(localeCode);
  };

  private getSupportedLocales = (): string[] => {
    return Object.keys(this.props.translations);
  };
}

export const withLocale = createContextHOC(Consumer);

export default TargemProvider;
