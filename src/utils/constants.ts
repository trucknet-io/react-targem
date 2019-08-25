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
  DEBUG = !!(
    process &&
    process.env &&
    process.env.NODE_ENV === "development" &&
    !process.env.DISABLE_TARGEM_WARNINGS
  );
}
export { DEBUG };
