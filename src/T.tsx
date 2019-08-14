import React from "react";

import { InterpolationScope } from "./interpolators";
import { withLocale, WithLocale } from "./TargemProvider";

export type TProps = {
  asString?: boolean;
  context?: string;
  count?: number;
  messagePlural?: string;
  scope?: InterpolationScope;
} & (
  | { children: string; message?: string }
  | { message: string; children?: string });

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
      scope,
      context,
    );

    return asString ? translation : <span>{translation}</span>;
  }
}

export const T = withLocale(TBase as React.ComponentType<WithLocale & TProps>);
