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
  return (str: string, scope: InterpolationScope = {}): string => {
    const newScope = formatScopeNumbers(formatter, scope);
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

function getNumberFormatter(locale: string): NumberFormatter {
  if (typeof Intl === "undefined") {
    return (n: number) => n.toLocaleString(locale);
  }
  const numberFormat = new Intl.NumberFormat(locale);
  return (n: number) => numberFormat.format(n);
}

function formatScopeNumbers(
  formatter: NumberFormatter,
  scope: InterpolationScope,
): InterpolationScope {
  return Object.keys(scope).reduce((res: InterpolationScope, key) => {
    const value = scope[key];
    res[key] = typeof value === "number" ? formatter(value) : value;
    return res;
  }, {});
}
