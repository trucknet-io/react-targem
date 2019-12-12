import { translate } from "./gettext";
import {
  createInterpolatorWithNumberFormat,
  interpolateString,
} from "./interpolators";
import { GettextCatalogs, InterpolationScope } from "./types";

export const t = (catalogs: GettextCatalogs, locale: string) => (
  message: string,
  scope: InterpolationScope = {},
  context?: string,
): string => {
  const translated = translate(catalogs, locale, message, context);
  return interpolateString(translated, scope);
};

export const tn = (catalogs: GettextCatalogs, locale: string) => (
  message: string,
  messagePlural: string,
  count: number,
  scope: InterpolationScope = {},
  context?: string,
): string => {
  const translated = translate(
    catalogs,
    locale,
    message,
    context,
    messagePlural,
    count,
  );
  return interpolateString(translated, { ...scope, count });
};

export const tf = (catalogs: GettextCatalogs, locale: string) => {
  const interpolate = createInterpolatorWithNumberFormat(locale);
  return (
    message: string,
    scope: InterpolationScope = {},
    context?: string,
    formatOptions?: Intl.NumberFormatOptions,
  ): string => {
    const translated = translate(catalogs, locale, message, context);
    return interpolate(translated, scope, formatOptions);
  };
};

export const tnf = (catalogs: GettextCatalogs, locale: string) => {
  const interpolate = createInterpolatorWithNumberFormat(locale);
  return (
    message: string,
    messagePlural: string,
    count: number,
    scope: InterpolationScope = {},
    context?: string,
    formatOptions?: Intl.NumberFormatOptions,
  ): string => {
    const translated =
      message || messagePlural
        ? translate(catalogs, locale, message, context, messagePlural, count)
        : `{{ count }}`;
    return interpolate(translated, { ...scope, count }, formatOptions);
  };
};
