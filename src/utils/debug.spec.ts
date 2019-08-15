let DEBUG = true;

jest.mock("./constants", () => ({
  get DEBUG() {
    return DEBUG;
  },
}));

describe("warn()", () => {
  test("outputs warning to the console in debug mode", () => {
    const spy = jest.spyOn(global.console, "warn");
    const { warn } = jest.requireActual("./debug") as {
      warn(msg: string): void;
    };

    warn("Alert!");
    expect(spy).toBeCalledWith(`react-targem: Alert!
***This message is shown only when NODE_ENV !== "production"***`);
    spy.mockClear();
  });

  test("does nothing in production mode", () => {
    DEBUG = false;
    const spy = jest.spyOn(global.console, "warn");
    const { warn } = jest.requireActual("./debug") as {
      warn(msg: string): void;
    };

    warn("Alert!");
    expect(spy).not.toBeCalled();
  });
});
