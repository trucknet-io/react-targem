import React from "react";

import { interpolateString, InterpolationScope } from "./interpolators";
import { withLocale, WithLocale } from "./TargemProvider";
import { TranslateParams } from "./translators";

export interface TProps extends InterpolationScope, TranslateParams {
  children?: string;
  asString?: boolean;
}

export class TBase extends React.PureComponent<WithLocale & TProps> {
  public render() {
    const translation = this.getTranslatedString();
    return this.props.asString ? translation : <span>{translation}</span>;
  }

  private getTranslatedString = () => {
    const {
      children,
      message,
      messagePlural,
      count,
      tn,
      ...scope
    } = this.props;

    const translation = tn(
      message || children || "",
      messagePlural || "",
      count || 1,
      scope,
    );

    return interpolateString(translation, scope);
  };
}

export const T = withLocale(TBase);
