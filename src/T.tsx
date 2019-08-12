import React from "react";

import { InterpolationScope } from "./interpolators";
import { withLocale, WithLocale } from "./TargemProvider";
import { TranslateParams } from "./translators";

export interface TProps extends TranslateParams {
  children?: string;
  asString?: boolean;
  scope?: InterpolationScope;
}

export class TBase extends React.PureComponent<WithLocale & TProps> {
  public render() {
    const {
      asString,
      children,
      context,
      count,
      message,
      messagePlural,
      scope,
      tn,
    } = this.props;

    const translation = tn(
      message || children || "",
      messagePlural || "",
      count || 1,
      context,
      scope,
    );

    return asString ? translation : <span>{translation}</span>;
  }
}

export const T = withLocale(TBase);
