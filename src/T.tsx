import React from "react";

import { InterpolationScope } from "./interpolators";
import { withLocale, WithLocale } from "./TargemProvider";
import { ContextHOC } from "./utils";

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

// This type cast is needed because TProps type is declared in such
// way that it requires either `children` or `message` props to be passed.
export const T = (withLocale as ContextHOC<WithLocale, TProps, TBase>)(TBase);
