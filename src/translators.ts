import { GettextCatalogs, translate } from "./gettext";
import { interpolateString, InterpolationScope } from "./interpolators";

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
