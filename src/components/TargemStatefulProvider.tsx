import memoizeOne from "memoize-one";
import React from "react";

import { LocaleDirection, TranslationsMap } from "../localization";
import { warn } from "../utils";
import {
  TargemProvider,
  TargemProviderProps,
  WithLocale,
} from "./TargemProvider";

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
  controlBodyDir?: TargemProviderProps["controlBodyDir"];
  defaultLocale?: TargemProviderProps["defaultLocale"];
  detectLocale?: TargemProviderProps["detectLocale"];
  translations: TargemProviderProps["translations"];
  setBodyDir?: TargemProviderProps["setBodyDir"];
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
    return (
      <TargemStatefulBase
        changeLocale={this.changeLocale}
        locale={this.state.locale}
        {...this.props}
      />
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
