// tslint:disable
global.Intl = require("intl");
// fixes https://github.com/andyearnshaw/Intl.js/issues/256
// @ts-ignore
global.Intl.__disableRegExpRestore();
export const mockWarn = jest.fn();

jest.mock("../src/utils/debug.ts", () => {
  return {
    warn: mockWarn,
  };
});
