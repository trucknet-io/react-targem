import memoizeOne from "memoize-one";
import { InterpolationScope, NumberFormatter } from "./types";

/**
 * Interpolates a string, replacing template variables with values
 * provided in the scope.
 */
export function interpolateString(
  str: string,
  scope: InterpolationScope = {},
): string {
  if (!str) {
    return str;
  }

  // Split string into array with regular text and variables split
  // into separate segments, like ['This is a ', '{{ thing }}', '!']
  const parts = str.split(new RegExp(variableRegex)).filter((x) => x);

  // If the only thing we have is a single regular string, just return it as is
  if (parts.length === 1 && isTemplateVariable(parts[0]) === false) {
    return str;
  }

  return parts
    .map((part) => {
      if (isTemplateVariable(part) === false) {
        return part;
      }

      const variableName = part.replace(/^\{\{\s/, "").replace(/\s\}\}$/, "");
      if (scope[variableName] === undefined) {
        return part;
      }

      return scope[variableName];
    })
    .join("");
}

export function createInterpolatorWithNumberFormat(locale: string) {
  const formatter = getNumberFormatter(locale);
  return (
    str: string,
    scope: InterpolationScope = {},
    options?: Intl.NumberFormatOptions,
  ): string => {
    const newScope = formatNumbers(scope, formatter, options);
    return interpolateString(str, newScope);
  };
}

// Note that [^] is used rather than . to match any character. This
// is because . doesn't span over multiple lines, whereas [^] does.
const variableRegex = /(\{\{\s[^]+?(?=\s\}\})\s\}\})/g;

/**
 * Returns whether a string is a template variable.
 */
function isTemplateVariable(str: string): boolean {
  return new RegExp(variableRegex).test(str);
}

const getNumberFormatter = memoizeOne(
  (locale: string): NumberFormatter => {
    if (typeof Intl === "undefined") {
      return (num, options) => num.toLocaleString(locale, options);
    }

    const commonIntlFormat = new Intl.NumberFormat(locale);
    return (num, options) => {
      return options
        ? new Intl.NumberFormat(locale, options).format(num)
        : commonIntlFormat.format(num);
    };
  },
);

function formatNumbers(
  scope: InterpolationScope,
  formatter: NumberFormatter,
  options?: Intl.NumberFormatOptions,
): InterpolationScope {
  return Object.keys(scope).reduce((res: InterpolationScope, key) => {
    const value = scope[key];
    res[key] = typeof value === "number" ? formatter(value, options) : value;
    return res;
  }, {});
}
