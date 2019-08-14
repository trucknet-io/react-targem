import memoizeOne from "memoize-one";
import React from "react";

import { TranslationsMap } from "../localization";
import { LocaleDirection, warn } from "../utils";
import { TargemProvider, WithLocale } from "./TargemProvider";

export type WithLocaleStateful = Required<WithLocale>;

class TargemStatefulBase extends TargemProvider<{
  changeLocale(locale: string): void;
}> {
  protected getValue = memoizeOne(
    (
      propsTranslations: TranslationsMap,
      propsLocale?: string,
      propsDirection?: LocaleDirection,
    ): WithLocale => {
      const value = this.getNewValue(
        propsTranslations,
        propsLocale,
        propsDirection,
      );
      value.changeLocale = this.props.changeLocale;
      return value;
    },
  );
}

export type TargemStatefulProviderProps = {
  controlBodyDir?: boolean;
  defaultLocale?: string;
  translations: TranslationsMap;
  setBodyDir?(dir: LocaleDirection): void;
};
export type TargemStatefulProviderState = {
  locale?: string;
};

export class TargemStatefulProvider extends React.PureComponent<
  TargemStatefulProviderProps,
  TargemStatefulProviderState
> {
  public state: TargemStatefulProviderState = {};

  public render() {
    const {
      children,
      controlBodyDir,
      defaultLocale,
      setBodyDir,
      translations,
    } = this.props;

    return (
      <TargemStatefulBase
        changeLocale={this.changeLocale}
        controlBodyDir={controlBodyDir}
        defaultLocale={defaultLocale}
        locale={this.state.locale}
        setBodyDir={setBodyDir}
        translations={translations}>
        {children}
      </TargemStatefulBase>
    );
  }

  protected changeLocale = (locale: string) => {
    if (!locale) {
      warn(`Empty locale was passed to 'changeLocale()'!`);
    }
    if (locale === this.state.locale) {
      return;
    }
    this.setState({ locale });
  };
}
