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
  const withContext = <P extends Context, DP extends object>(
    Component: React.ComponentType<P> & { defaultProps?: DP },
  ) => {
    return class WithContextHOC extends React.Component<
      Omit<P, keyof Context> & Partial<Context>
    > {
      public render() {
        return <Consumer>{this.renderComponent}</Consumer>;
      }

      // TS: Property 'renderComponent' of exported class expression may not be private or protected.
      public renderComponent = (ctx: Context) => {
        const newProps = { ...ctx, ...this.props };
        return <Component {...(newProps as P)} />;
      };
    };
  };

  return withContext;
};
