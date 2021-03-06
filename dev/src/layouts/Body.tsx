import React from "react";

import { T } from "@lib";

import Inner from "./Inner";
import InnerFC from "./InnerFC";

class Body extends React.PureComponent {
  public render() {
    return (
      <div>
        <InnerFC />
        <Inner />

        <h1>
          Simple: <T>Hello, World!</T>
        </h1>

        <h1>
          `name` interpolation:{" "}
          <T message="Hello, {{ name }}!" scope={{ name: "Alex" }} />
        </h1>

        <h1>
          Plural `count=0`:{" "}
          <T
            message="There is one line of code"
            messagePlural="There are {{ count }} lines of code"
            count={0}
          />
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
          Plural `count=2`:{" "}
          <T
            message="There is one line of code"
            messagePlural="There are {{ count }} lines of code"
            count={2}
          />
        </h1>

        <h1>
          Plural `count=3000.6`:{" "}
          <T
            message="There is {{ count }} line of code"
            messagePlural="There are {{ count }} lines of code"
            formatNumbers
            count={3000.6}
          />
        </h1>
      </div>
    );
  }
}

export default Body;
