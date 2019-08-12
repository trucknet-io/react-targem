import { Gettext } from "./Gettext";
import { interpolateString, InterpolationScope } from "./interpolators";

export type TranslateParams = {
  message: string;
  messagePlural?: string;
  context?: string;
  count?: number;
};

export const t = (gettext: Gettext) => (
  message: string,
  { messagePlural, context, ...scope }: InterpolationScope = {},
): string => {
  const translated = gettext.translate(
    message,
    messagePlural as string,
    context as string,
    scope.count as number,
  );
  return interpolateString(translated, scope);
};

export const tn = (gettext: Gettext) => (
  message: string,
  messagePlural: string,
  count: number,
  { context, ...scope }: InterpolationScope = {},
): string => {
  const translated = gettext.translate(
    message,
    messagePlural,
    context as string,
    count,
  );
  return interpolateString(translated, { ...scope, count });
};
