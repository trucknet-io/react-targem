import memoizeOne from "memoize-one";
import React from "react";

import {
  LocaleDirection,
  t,
  tf,
  tn,
  tnf,
  TranslationsMap,
  translationsToCatalogs,
} from "../localization";
import { createContextHOC, getBrowserLocale, RTL_LOCALES } from "../utils";

export interface WithLocale {
  direction: LocaleDirection;
  locale: string;
  t: ReturnType<typeof t>;
  tn: ReturnType<typeof tn>;
  tf: ReturnType<typeof tf>;
  tnf: ReturnType<typeof tnf>;
  changeLocale?(locale: string): void;
}

export type TargemProviderProps<AddProps extends Object = {}> = {
  controlBodyDir?: boolean;
  defaultLocale?: string;
  detectLocale?: boolean;
  direction?: LocaleDirection;
  locale?: string;
  translations: TranslationsMap;
  setBodyDir?(dir: LocaleDirection): void;
} & AddProps;

export type DefaultTargemProviderProps = Pick<
  TargemProviderProps,
  "controlBodyDir" | "detectLocale"
>;

const { Provider, Consumer } = React.createContext<WithLocale>({
  direction: "ltr",
  locale: "en",
  t: () => "",
  tn: () => "",
  tf: () => "",
  tnf: () => "",
});

export { Provider as RawLocaleProvider };

export class TargemProvider<AddProps> extends React.PureComponent<
  TargemProviderProps<AddProps>
> {
  public static defaultProps: DefaultTargemProviderProps = {
    controlBodyDir: true,
    detectLocale: true,
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
      const { defaultLocale, detectLocale } = this.props;
      if (!detectLocale && defaultLocale) {
        return defaultLocale as string;
      }
      const locales = this.getSupportedLocales(translations);
      return getBrowserLocale(locales, defaultLocale);
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
      tf: tf(catalogs, locale),
      tnf: tnf(catalogs, locale),
    };
  }
}

export const withLocale = createContextHOC(Consumer);

export default TargemProvider;
