//require("ts-node").register({ compilerOptions: { module: "commonjs" } });

// const { SUPPORTED_LOCALES } = require("../dev/src/config/locales.ts");
const SUPPORTED_LOCALES = ["en-GB", "he", "ru"];
const LANGUAGES_REGEX = new RegExp(
  `(${SUPPORTED_LOCALES.join("|")})($|\.js$|\/index\.js$)`,
);

module.exports = LANGUAGES_REGEX;
