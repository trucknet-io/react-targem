import { DEBUG } from "./constants";

export function warn(message: string) {
  if (DEBUG) {
    console.warn(
      `react-targem: ${message}\n***This message is shown only when NODE_ENV is "development" and DISABLE_TARGEM_WARNINGS is not set***`,
    );
  }
}
