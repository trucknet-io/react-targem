import memoizeOne from "memoize-one";
import React, { useContext } from "react";

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
  /**
   * Translates and interpolates message.
   */
  t: ReturnType<typeof t>;
  /**
   * Translates and interpolates pluralized message
   */
  tn: ReturnType<typeof tn>;
  /**
   * Same as `t` but also formats all numbers.
   */
  tf: ReturnType<typeof tf>;
  /**
   * Same as `tn` but also formats all numbers.
   */
  tnf: ReturnType<typeof tnf>;
  /**
   * Changes current locale.
   * This function is passed only when `<TargemStatefulProvider />` is used.
   */
  changeLocale?(locale: string): void;
}

export type TargemProviderProps<AddProps extends Object = {}> = {
  /**
   * By default (if not SSR) when `direction` changes `TargemProvider` tries
   * to do `document.body.dir = direction`. You can disable this by passing
   * `controlBodyDir={false}`.
   */
  controlBodyDir?: boolean;
  /**
   * Locale that is used as a fallback for `detectLocale` or when
   * `detectLocale` is disabled and `locale` prop is empty.
   */
  defaultLocale?: string;
  /**
   * If `locale` prop is omitted targem will try to detect your locale based
   * on `navigator.language`. If locale is not found there then
   * `defaultLocale` is used as a fallback.
   */
  detectLocale?: boolean;
  /**
   * Current text direction. When omitted direction is resolved based on the
   * current `locale` (react-targem knows 12 "rtl" locales).
   */
  direction?: LocaleDirection;
  /**
   * Current locale. If you don't pass this prop then `detectLocale` or
   * `defaultLocale` is used.
   */
  locale?: string;
  /**
   * Translations as a map of `{ [locale: string]: ParsedPot }` where
   * `ParsedPot` is an output of `po()` function call from
   * [gettext-parser](https://github.com/smhg/gettext-parser).
   * @see [gettext-utils](https://github.com/goooseman/gettext-utils)
   */
  translations: TranslationsMap;
  /**
   * When `controlBodyDir` is enabled you can pass your own function to
   * override existing `document.body.dir = direction` behavior.
   */
  setBodyDir?(dir: LocaleDirection): void;
} & AddProps;

export type DefaultTargemProviderProps = Pick<
  TargemProviderProps,
  "controlBodyDir" | "detectLocale"
>;

const TargemContext = React.createContext<WithLocale>({
  direction: "ltr",
  locale: "en",
  t: () => "",
  tn: () => "",
  tf: () => "",
  tnf: () => "",
});

const { Provider, Consumer } = TargemContext;

export { Provider as RawLocaleProvider };

let lastValue: WithLocale;

export const translators = {
  get t() {
    return lastValue.t;
  },
  get tn() {
    return lastValue.tn;
  },
  get tf() {
    return lastValue.tf;
  },
  get tnf() {
    return lastValue.tnf;
  },
};

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

    const value = {
      locale,
      direction,
      t: t(catalogs, locale),
      tn: tn(catalogs, locale),
      tf: tf(catalogs, locale),
      tnf: tnf(catalogs, locale),
    };
    lastValue = value;
    return value;
  }
}

export const withLocale = createContextHOC(Consumer);
export const useLocale = () => useContext(TargemContext);

export default TargemProvider;
