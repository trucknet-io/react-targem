import memoizeOne from "memoize-one";
import React from "react";

import { TranslationsMap } from "./gettext";
import { TargemProvider, WithLocale } from "./TargemProvider";
import { LocaleDirection } from "./utils";

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
  constructor(props: TargemStatefulProviderProps) {
    super(props);

    this.state = {
      locale: props.defaultLocale,
    };
  }

  public render() {
    const { children, controlBodyDir, setBodyDir, translations } = this.props;

    return (
      <TargemStatefulBase
        changeLocale={this.changeLocale}
        controlBodyDir={controlBodyDir}
        locale={this.state.locale}
        setBodyDir={setBodyDir}
        translations={translations}>
        {children}
      </TargemStatefulBase>
    );
  }

  protected changeLocale = (locale: string) => {
    if (locale === this.state.locale) {
      return;
    }
    this.setState({ locale });
  };
}
