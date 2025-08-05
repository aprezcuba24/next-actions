import { z } from 'zod';
import { formDataToObject } from './utils';

export type Context<Input = any> = {
  input: Input;
};

export type ActionConfig<Input = any> = {
  input?: z.Schema<Input>;
};

const validateAndCleanInput = <Input>(input: unknown, config: ActionConfig<Input>): Input => {
  if (input instanceof FormData) {
    input = formDataToObject(input) as Input;
  }
  return config.input ? config.input.parse(input) : (input as Input);
};

export type Middleware<T extends Context> = (ctx: T, next: Middleware<T>) => Promise<any>;
export type Action<T extends Context> = (ctx: T) => Promise<any>;

const middlewareRunner = <T extends Context>(
  ctx: T,
  currentMiddleware: Middleware<T>,
  middleware: Middleware<T>[],
  currentIndex: number
) => {
  const next = (ctx: T) =>
    middlewareRunner(ctx, middleware[currentIndex + 1]!, middleware, currentIndex + 1);
  return currentMiddleware(ctx, next);
};

type WrapperFunction<T extends Context> = {
  (
    config: ActionConfig<any> | Action<T>,
    handler?: Action<T>
  ): (input?: unknown) => Promise<unknown>;
  _middleware: Middleware<T>[];
  use: (...middleware: Middleware<T>[]) => void;
};

export function createApp<T extends Context>() {
  const middleware: Middleware<T>[] = [];

  const wrapper: WrapperFunction<T> = function (config: any, handler?: Action<T>) {
    if (typeof config === 'function') {
      handler = config;
      config = {};
    }
    return (rawInput?: unknown) => {
      const input = validateAndCleanInput(rawInput, config);
      const ctx = {
        input,
      } as T;
      const middleware = [...wrapper._middleware, (ctx: T) => (handler as Action<T>)(ctx)];
      return middlewareRunner(ctx, middleware[0]!, middleware, 0);
    };
  } as WrapperFunction<T>;

  wrapper._middleware = middleware;
  wrapper.use = function (...middleware: Middleware<T>[]) {
    this._middleware.push(...middleware);
  };

  return wrapper;
}
