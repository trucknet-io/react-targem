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

export type TargemState = WithLocale & {
  gettext: Gettext;
};

const { Provider, Consumer } = React.createContext<WithLocale>({
  locale: "en",
  direction: "ltr",
  changeLocale: (locale: string) => locale,
  t: () => "",
  tn: () => "",
});

export { Provider as RawLocaleProvider };

export class TargemProvider extends React.Component<TargemProps, TargemState> {
  constructor(props: TargemProps) {
    super(props);

    const locale = TargemProvider.getCurrentLocale(props);
    const gettext = TargemProvider.getGettextInstance(locale, props);

    this.state = {
      ...TargemProvider.getLocaleState(locale, props),
      changeLocale: this.changeLocale,
      gettext,
      t: t(gettext),
      tn: tn(gettext),
    };
    TargemProvider.changeBodyDir(locale, props);
  }

  public static getDerivedStateFromProps(
    props: TargemProps,
    state: TargemState,
  ) {
    const newState: Partial<TargemState> = {};

    if (props.locale && props.locale !== state.locale) {
      state.gettext.setLocale(props.locale);
      TargemProvider.changeBodyDir(props.locale, props);
      Object.assign(
        newState,
        TargemProvider.getLocaleState(props.locale, props),
      );
    }

    if (!state.gettext.areTranslationsEqual(props.translations)) {
      Object.assign(newState, {
        gettext: TargemProvider.getGettextInstance(
          newState.locale || state.locale,
          props,
        ),
      });
    }

    return Object.keys(newState).length === 0 ? null : newState;
  }

  private static getGettextInstance = (
    locale: string,
    props: TargemProps,
  ): Gettext => {
    const gettext = new Gettext();
    gettext.addMultipleTranslations(props.translations);
    gettext.setLocale(locale);
    return gettext;
  };

  private static getCurrentLocale = (
    props: TargemProps,
    state?: TargemState,
  ): string => {
    if (state) {
      return state.locale;
    }
    return props.locale || TargemProvider.getDefaultLocale(props);
  };

  private static getDefaultLocale = (props: TargemProps): string => {
    const locales = TargemProvider.getSupportedLocales(props);
    if (typeof window !== "undefined" && window.navigator.language) {
      try {
        return findLocale(locales, window.navigator.language);
      } catch (_) {
        return locales[0];
      }
    }
    return locales[0];
  };

  private static getDirection = (
    locale: string,
    props: TargemProps,
  ): LocaleDirection => {
    if (props.getDirection) {
      return props.getDirection(locale) || "ltr";
    }
    return RTL_LOCALES.includes(locale.toLowerCase()) ? "rtl" : "ltr";
  };

  private static getSupportedLocales = (props: TargemProps): string[] => {
    return Object.keys(props.translations);
  };

  private static changeBodyDir = (locale: string, props: TargemProps) => {
    const direction = TargemProvider.getDirection(locale, props);
    if (props.changeBodyDir) {
      props.changeBodyDir(direction);
      return;
    }

    if (typeof document !== "undefined") {
      document.body.dir = direction;
    }
  };

  private static getLocaleState = (locale: string, props: TargemProps) => {
    const direction = TargemProvider.getDirection(locale, props);
    return {
      locale,
      direction,
    };
  };

  public render() {
    const { children } = this.props;
    return <Provider value={this.state}>{children}</Provider>;
  }

  private changeLocale = (locale: string) => {
    if (locale === this.state.locale) {
      return;
    }
    this.state.gettext.setLocale(locale);
    this.setState(TargemProvider.getLocaleState(locale, this.props));
    TargemProvider.changeBodyDir(locale, this.props);
  };
}

export const withLocale = createContextHOC(Consumer);

export default TargemProvider;
