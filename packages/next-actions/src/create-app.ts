export type Context<Input = any> = {
  input: Input;
};

export type Middleware<T extends Context, C = any> = (
  ctx: T,
  next: NextFunction<T>,
  config?: C,
) => Promise<any> | any;
export type Action<T extends Context, C = any> = (
  ctx: T,
  config?: C,
) => Promise<any>;
export type NextFunction<T extends Context> = (ctx: T) => Promise<any>;

const middlewareRunner = <T extends Context, C = any>(
  ctx: T,
  config: C,
  currentMiddleware: Middleware<T, C>,
  middleware: Middleware<T, C>[],
  currentIndex: number,
) => {
  const next: NextFunction<T> = (ctx: T) =>
    middlewareRunner(
      ctx,
      config,
      middleware[currentIndex + 1]!,
      middleware,
      currentIndex + 1,
    );
  return currentMiddleware(ctx, next, config);
};

export function createApp<T extends Context, C = any>() {
  const middleware: Middleware<T>[] = [];

  function wrapper<I extends any, R = any>(
    handler: Action<Omit<T, "input"> & { input: I }, C>,
  ): (input?: I) => R;
  function wrapper<I extends any, R = any>(
    config: C,
    handler: Action<Omit<T, "input"> & { input: I }, C>,
  ): (input?: I) => R;
  function wrapper<I extends any, R = any>(
    config: C | Action<Omit<T, "input"> & { input: I }, C>,
    handlerParameter?: Action<Omit<T, "input"> & { input: I }, C>,
  ) {
    type CurrentContext = Omit<T, "input"> & { input: I };
    let handler: Action<CurrentContext, C>;
    if (typeof config === "function") {
      handler = config as Action<CurrentContext, C>;
      config = {} as C;
    } else {
      handler = handlerParameter!;
    }
    return (rawInput?: I) => {
      const ctx = {
        input: rawInput,
      } as CurrentContext;
      const middleware = [
        ...wrapper._middleware,
        (ctx: CurrentContext) => handler!(ctx, config),
      ];
      return middlewareRunner(
        ctx,
        config,
        (middleware[0] as Middleware<CurrentContext, C>)!,
        middleware as Middleware<CurrentContext, C>[],
        0,
      ) as R;
    };
  }

  wrapper._middleware = middleware;
  wrapper.use = function (...middleware: Middleware<T, C>[]) {
    this._middleware.push(...middleware);
  };

  return wrapper;
}
