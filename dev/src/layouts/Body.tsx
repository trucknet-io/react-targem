import React from "react";

import { T } from "@lib";

import Inner from "./Inner";

class Body extends React.PureComponent {
  public render() {
    return (
      <div>
        <Inner />

        <h1>
          Simple: <T message="Hello, World!" />
        </h1>

        <h1>
          `name` interpolation: <T message="Hello, {{ name }}!" name="Alex" />
        </h1>

        <h1>
          Plural `count=1`:{" "}
          <T
            message="There is {{ count }} line of code"
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
