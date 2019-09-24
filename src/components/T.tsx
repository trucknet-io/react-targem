import React from "react";

import { InterpolationScope } from "../localization";
import { ContextHOC } from "../utils";
import { withLocale, WithLocale } from "./TargemProvider";

// tslint:disable-next-line: no-any
export type TProps<WrapperProps extends Object = any> = {
  /**
   * Component or element type to wrap your translation string with.
   */
  component?: React.ReactType<WrapperProps>;
  /**
   * Props to be passed to your wrapper `component`.
   */
  componentProps?: WrapperProps;
  /**
   * Translation context (`msgctxt` in .pot).
   */
  context?: string;
  /**
   * Used to translate pluralized message and also interpolates into
   * `messagePlural` and `message` as `{{ count }}`.
   */
  count?: number;
  /**
   * Whether to format `count` and all numbers in scope object using
   * `Intl.NumberFormat`. If browser (or Node) doesn't support `Intl.NumberFormat`
   * then formatting fallbacks to `Number.prototype.toLocaleString()`.
   */
  formatNumbers?: boolean;
  /**
   * Plural version of the message (`msgid_plural` in .pot).
   */
  messagePlural?: string;
  /**
   * Used as variables source when interpolating `message` and `messagePlural`.
   */
  scope?: InterpolationScope;
  /**
   * Does nothing by itself, but useful when extracting strings to .pot.
   * @see [gettext-utils](https://github.com/goooseman/gettext-utils)
   */
  comment?: string;
} & (
  | {
      /**
       * @see `message`
       */
      children: string;
      message?: string;
    }
  | {
      /**
       * Message to translate (`msgid` in pot).
       */
      message: string;
      children?: string;
    });

export class TBase extends React.PureComponent<WithLocale & TProps> {
  public render() {
    const {
      children,
      component: Component,
      componentProps,
      context,
      count,
      formatNumbers,
      message,
      messagePlural,
      scope,
      tn,
      tnf,
    } = this.props;

    const translate = formatNumbers ? tnf : tn;
    const translation = translate(
      message || children || "",
      messagePlural || "",
      count == null ? 1 : count,
      scope,
      context,
    );

    return Component ? (
      // tslint:disable-next-line: no-unsafe-any
      <Component {...componentProps}>{translation}</Component>
    ) : (
      translation
    );
  }
}

// This type cast is needed because TProps type is declared in such
// way that it requires either `children` or `message` props to be passed.
export const T = (withLocale as ContextHOC<WithLocale, TProps, TBase>)(TBase);
