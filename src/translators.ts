import { GettextCatalogs, translate } from "./gettext";
import { interpolateString, InterpolationScope } from "./interpolators";

export type TranslateParams = {
  message: string;
  messagePlural?: string;
  context?: string;
  count?: number;
};

export const t = (catalogs: GettextCatalogs, locale: string) => (
  message: string,
  context?: string,
  scope: InterpolationScope = {},
): string => {
  const translated = translate(catalogs, locale, message, context);
  return interpolateString(translated, scope);
};

export const tn = (catalogs: GettextCatalogs, locale: string) => (
  message: string,
  messagePlural: string,
  count: number,
  context?: string,
  scope: InterpolationScope = {},
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
