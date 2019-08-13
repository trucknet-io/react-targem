import get from "lodash.get";

export const RTL_LOCALES = [
  "ar",
  "arc",
  "dv",
  "fa",
  "ha",
  "he",
  "khw",
  "ks",
  "ku",
  "ps",
  "ur",
  "yi",
];

let DEBUG: boolean = false;
if (typeof process !== "undefined") {
  DEBUG = get(process, "env.NODE_ENV") !== "production";
}
export { DEBUG };
