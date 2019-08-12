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
  context?: string,
  scope: InterpolationScope = {},
): string => {
  const translated = gettext.translate(message, context);
  return interpolateString(translated, scope);
};

export const tn = (gettext: Gettext) => (
  message: string,
  messagePlural: string,
  count: number,
  context?: string,
  scope: InterpolationScope = {},
): string => {
  const translated = gettext.translate(message, context, messagePlural, count);
  return interpolateString(translated, { ...scope, count });
};
