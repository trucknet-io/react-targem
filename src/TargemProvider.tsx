import memoizeOne from "memoize-one";
import React from "react";

import { TranslationsMap, translationsToCatalogs } from "./gettext";
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
}

export type TargemProps = {
  locale?: string;
  direction?: LocaleDirection;
  translations: TranslationsMap;
  controlBodyDir?: boolean;
  setBodyDir?(dir: LocaleDirection): void;
};

const { Provider, Consumer } = React.createContext<WithLocale>({
  locale: "en",
  direction: "ltr",
  t: () => "",
  tn: () => "",
});

export { Provider as RawLocaleProvider };

export class TargemProvider extends React.PureComponent<TargemProps> {
  public static defaultProps: Partial<TargemProps> = {
    controlBodyDir: true,
  };

  private getValue = memoizeOne(
    (
      propsTranslations: TranslationsMap,
      propsLocale?: string,
      propsDirection?: LocaleDirection,
    ): WithLocale => {
      const locale = this.getLocale(propsTranslations, propsLocale);
      const direction = this.getDirection(locale, propsDirection);
      const catalogs = this.getCatalogs(propsTranslations);

      return {
        locale,
        direction,
        t: t(catalogs, locale),
        tn: tn(catalogs, locale),
      };
    },
  );

  private getCatalogs = memoizeOne((translations: TranslationsMap) =>
    translationsToCatalogs(translations),
  );

  private getLocale = memoizeOne(
    (translations: TranslationsMap, locale?: string) => {
      return locale || this.getDefaultLocale(translations);
    },
  );

  private getDefaultLocale = memoizeOne(
    (translations: TranslationsMap): string => {
      const locales = this.getSupportedLocales(translations);
      if (typeof window !== "undefined" && window.navigator.language) {
        try {
          return findLocale(locales, window.navigator.language);
        } catch (_) {}
      }
      return locales[0] || "en";
    },
  );

  private getSupportedLocales = memoizeOne(
    (translations: TranslationsMap): string[] => {
      return Object.keys(translations);
    },
  );

  private getDirection = memoizeOne(
    (locale: string, direction?: LocaleDirection): LocaleDirection => {
      if (direction) {
        return direction;
      }
      return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
    },
  );

  private changeBodyDir = memoizeOne(
    (
      controlBodyDir: TargemProps["controlBodyDir"],
      setBodyDir: TargemProps["setBodyDir"],
      direction: LocaleDirection,
    ) => {
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
    },
  );

  public render() {
    const { children, ...rest } = this.props;

    const value = this.getValue(rest.translations, rest.locale, rest.direction);
    this.changeBodyDir(rest.controlBodyDir, rest.setBodyDir, value.direction);

    return <Provider value={value}>{children}</Provider>;
  }
}

export const withLocale = createContextHOC(Consumer);

export default TargemProvider;
