export const mockWarn = jest.fn();

jest.mock("../src/utils/debug.ts", () => {
  return {
    warn: mockWarn,
  };
});
