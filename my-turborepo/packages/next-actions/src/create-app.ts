export type Context<Input = any> = {
  input: Input;
};

export type Middleware<T extends Context, C = any> = (
  ctx: T,
  next: NextFunction<T>,
  config: C
) => Promise<any> | any;
export type Action<T extends Context> = (ctx: T) => Promise<any>;
export type NextFunction<T extends Context> = (ctx: T) => Promise<any>;

const middlewareRunner = <T extends Context, C = any>(
  ctx: T,
  config: C,
  currentMiddleware: Middleware<T, C>,
  middleware: Middleware<T, C>[],
  currentIndex: number
) => {
  const next: NextFunction<T> = (ctx: T) =>
    middlewareRunner(ctx, config, middleware[currentIndex + 1]!, middleware, currentIndex + 1);
  return currentMiddleware(ctx, next, config);
};

export function createApp<T extends Context, C = any>() {
  const middleware: Middleware<T>[] = [];

  function wrapper(handler: Action<T>): (input?: unknown) => Promise<unknown>;
  function wrapper(config: C, handler: Action<T>): (input?: unknown) => Promise<unknown>;
  function wrapper(config: C | Action<T>, handler?: Action<T>) {
    if (typeof config === 'function') {
      handler = config as Action<T>;
      config = {} as C;
    }
    return (rawInput?: unknown) => {
      const ctx = {
        input: rawInput,
      } as T;
      const middleware = [...wrapper._middleware, (ctx: T) => (handler as Action<T>)(ctx)];
      return middlewareRunner(ctx, config, middleware[0]!, middleware, 0);
    };
  }

  wrapper._middleware = middleware;
  wrapper.use = function (...middleware: Middleware<T>[]) {
    this._middleware.push(...middleware);
  };

  return wrapper;
}
