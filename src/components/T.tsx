import React from "react";

import { InterpolationScope } from "../localization";
import { ContextHOC } from "../utils";
import { withLocale, WithLocale } from "./TargemProvider";

export type TProps = {
  asString?: boolean;
  context?: string;
  count?: number;
  formatScopeNumbers?: boolean;
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
      formatScopeNumbers,
      message,
      messagePlural,
      scope,
      tn,
      tnf,
    } = this.props;

    const translate = formatScopeNumbers ? tnf : tn;
    const translation = translate(
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
