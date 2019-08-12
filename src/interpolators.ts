// Note that [^] is used rather than . to match any character. This
// is because . doesn't span over multiple lines, whereas [^] does.
const variableRegex = /(\{\{\s[^]+?(?=\s\}\})\s\}\})/g;

/**
 * Returns whether a string is a template variable.
 */
export function isTemplateVariable(str: string): boolean {
  return new RegExp(variableRegex).test(str);
}

export type InterpolationScope = {
  [key: string]: string | number | boolean | undefined;
};

/**
 * Interpolates a string, replacing template variables with values
 * provided in the scope.
 */
export function interpolateString(str: string, scope: InterpolationScope = {}) {
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
