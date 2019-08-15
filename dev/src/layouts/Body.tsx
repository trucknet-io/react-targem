import React from "react";

import { T } from "@lib";

import Inner from "./Inner";

class Body extends React.PureComponent {
  public render() {
    return (
      <div>
        <Inner />

        <h1>
          Simple: <T>Hello, World!</T>
        </h1>

        <h1>
          `name` interpolation:{" "}
          <T message="Hello, {{ name }}!" scope={{ name: "Alex" }} />
        </h1>

        <h1>
          Plural `count=1`:{" "}
          <T
            message="There is one line of code"
            messagePlural="There are {{ count }} lines of code"
            count={1}
          />
        </h1>

        <h1>
          Plural `count=3`:{" "}
          <T
            message="There is {{ count }} line of code"
            messagePlural="There are {{ count }} lines of code"
            count={3}
          />
        </h1>
      </div>
    );
  }
}

export default Body;
