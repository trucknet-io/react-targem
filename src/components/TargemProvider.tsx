import memoizeOne from "memoize-one";
import React from "react";

import {
  LocaleDirection,
  t,
  tn,
  TranslationsMap,
  translationsToCatalogs,
} from "../localization";
import { createContextHOC, findLocale, RTL_LOCALES } from "../utils";

export interface WithLocale {
  direction: LocaleDirection;
  locale: string;
  t: ReturnType<typeof t>;
  tn: ReturnType<typeof tn>;
  changeLocale?(locale: string): void;
}

export type TargemProviderProps<AddProps extends Object = {}> = {
  controlBodyDir?: boolean;
  defaultLocale?: string;
  direction?: LocaleDirection;
  locale?: string;
  translations: TranslationsMap;
  setBodyDir?(dir: LocaleDirection): void;
} & AddProps;

export type DefaultTargemProviderProps = Pick<
  TargemProviderProps,
  "controlBodyDir"
>;

const { Provider, Consumer } = React.createContext<WithLocale>({
  direction: "ltr",
  locale: "en",
  t: () => "",
  tn: () => "",
});

export { Provider as RawLocaleProvider };

export class TargemProvider<AddProps> extends React.PureComponent<
  TargemProviderProps<AddProps>
> {
  public static defaultProps: DefaultTargemProviderProps = {
    controlBodyDir: true,
  };

  protected getValue = memoizeOne(this.getNewValue.bind(this));

  protected getCatalogs = memoizeOne((translations: TranslationsMap) =>
    translationsToCatalogs(translations),
  );

  protected getLocale = memoizeOne(
    (translations: TranslationsMap, locale?: string) => {
      return locale || this.getDefaultLocale(translations);
    },
  );

  protected getDefaultLocale = memoizeOne(
    (translations: TranslationsMap): string => {
      if (this.props.defaultLocale) {
        return this.props.defaultLocale as string;
      }
      const locales = this.getSupportedLocales(translations);
      if (typeof window !== "undefined" && window.navigator.language) {
        try {
          return findLocale(locales, window.navigator.language);
        } catch (_) {}
      }
      return locales[0] || "en";
    },
  );

  protected getSupportedLocales = memoizeOne(
    (translations: TranslationsMap): string[] => {
      return Object.keys(translations);
    },
  );

  protected getDirection = memoizeOne(
    (locale: string, direction?: LocaleDirection): LocaleDirection => {
      if (direction) {
        return direction;
      }
      return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
    },
  );

  protected changeBodyDir = memoizeOne((direction: LocaleDirection) => {
    const { controlBodyDir, setBodyDir } = this.props;

    if (!controlBodyDir) {
      return;
    }
    if (setBodyDir) {
      setBodyDir(direction);
      return;
    }
    if (typeof document !== "undefined") {
      document.body.dir = direction;
    }
  });

  public render() {
    const { children, translations, locale, direction } = this.props;

    const value = this.getValue(translations, locale, direction);
    this.changeBodyDir(value.direction);

    return <Provider value={value}>{children}</Provider>;
  }

  protected getNewValue(
    propsTranslations: TranslationsMap,
    propsLocale?: string,
    propsDirection?: LocaleDirection,
  ): WithLocale {
    const locale = this.getLocale(propsTranslations, propsLocale);
    const direction = this.getDirection(locale, propsDirection);
    const catalogs = this.getCatalogs(propsTranslations);

    return {
      locale,
      direction,
      t: t(catalogs, locale),
      tn: tn(catalogs, locale),
    };
  }
}

export const withLocale = createContextHOC(Consumer);

export default TargemProvider;
