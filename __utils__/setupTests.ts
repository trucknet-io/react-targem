// tslint:disable
global.Intl = require("intl");

export const mockWarn = jest.fn();

jest.mock("../src/utils/debug.ts", () => {
  return {
    warn: mockWarn,
  };
});
