import React from "react";

export type ContextHOC<
  Context extends object,
  P extends object,
  Cmp = never
> = <Comp = Cmp extends never ? React.ComponentType<Context & P> : Cmp>(
  Component: Comp,
) => React.ComponentType<P>;

export const createContextHOC = <Context extends object>(
  Consumer: React.Consumer<Context>,
) => {
  const withContext = <P extends Context>(
    Component: React.ComponentType<P>,
  ) => {
    return class WithContextHOC extends React.Component<
      Omit<P, keyof Context>
    > {
      public render() {
        return <Consumer>{this.renderComponent}</Consumer>;
      }

      public renderComponent = (ctx: Context) => {
        const newProps = { ...ctx, ...this.props };
        return <Component {...(newProps as P)} />;
      };
    };
  };

  return withContext;
};
