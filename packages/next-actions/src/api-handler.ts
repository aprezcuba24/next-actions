import { createMiddleware } from "hono/factory";
import { Context as AppContext, createApp } from "./create-app";

export type HonoContext<Cx, Cg> = {
  Variables: {
    context: Cx;
    config: Cg;
  };
};

export function createApi<T extends AppContext, C>(
  app: ReturnType<typeof createApp<T, C>>,
) {
  return (config: C = {} as C) =>
    createMiddleware<HonoContext<T, C>>(async (c, next) => {
      const action = app(
        config,
        (ctx: Omit<T, "input"> & { input: any }, cfg?: C) => {
          c.set("context", ctx as T);
          c.set("config", (cfg ?? ({} as C)) as C);
          return next();
        },
      );
      return action();
    });
}
