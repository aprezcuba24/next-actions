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
) => Promise<any> | any;
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

type Actions<T, I, C> = [
  Action<Omit<T, "input"> & { input: I }, C>,
  ...Action<Omit<T, "input"> & { input: any }, C>[],
];

export function createApp<T extends Context, C = any>() {
  const middleware: Middleware<T>[] = [];

  function wrapper<I extends any, R = any>(
    ...actions: Actions<T, I, C>
  ): (input?: I) => R;
  function wrapper<I extends any, R = any>(
    config: C,
    ...actions: Actions<T, I, C>
  ): (input?: I) => R;
  function wrapper<I extends any, R = any>(
    config: C | Action<Omit<T, "input"> & { input: I }, C>,
    ...actions: Actions<T, I, C>
  ) {
    type CurrentContext = Omit<T, "input"> & { input: I };
    let handler: Action<CurrentContext, C>;
    if (typeof config === "function") {
      handler = config as Action<CurrentContext, C>;
      config = {} as C;
      actions.unshift(handler);
    }
    return async (rawInput?: I) => {
      const ctx = {
        input: rawInput,
      } as CurrentContext;
      const middleware = [
        ...wrapper._middleware,
        async (ctx: CurrentContext) => {
          const result = await actions.reduce(async (acc, action) => {
            const ctx = await acc;
            const input = await action(ctx, config);
            return {
              ...ctx,
              input,
            };
          }, Promise.resolve(ctx));
          return result.input;
        },
      ];
      const result = (await middlewareRunner(
        ctx,
        config,
        (middleware[0] as Middleware<CurrentContext, C>)!,
        middleware as Middleware<CurrentContext, C>[],
        0,
      )) as CurrentContext;
      return result;
    };
  }

  wrapper._middleware = middleware;
  wrapper.use = function (...middleware: Middleware<T, C>[]) {
    this._middleware.push(...middleware);
  };

  return wrapper;
}
